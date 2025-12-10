# Checkout Upgrade Flow - Verification & Testing Guide

## Overview

Your checkout flow is complete. Here's what happens when a user upgrades:

```
User clicks "Upgrade to Pro"
           ↓
Pricing page validates user is logged in
           ↓
Calls /api/checkout/create-session with plan + user info
           ↓
Lemon Squeezy API generates checkout URL
           ↓
User redirected to Lemon Squeezy hosted checkout
           ↓
User enters payment info & completes purchase
           ↓
Lemon Squeezy processes payment
           ↓
Webhook fires to your /api/webhooks/lemon-squeezy
           ↓
Your app updates user's subscription_plan to "pro"
           ↓
User is redirected back to /profile
           ↓
Profile page shows new Pro plan + features
```

---

## Pre-Flight Checklist

Before testing, verify these are set in `.env.local`:

```
✓ NEXT_PUBLIC_LEMON_STORE_ID=YOUR_STORE_ID
✓ LEMON_SQUEEZY_PRO_VARIANT_ID=YOUR_PRO_ID
✓ LEMON_SQUEEZY_PLUS_VARIANT_ID=YOUR_PLUS_ID
✓ LEMON_SQUEEZY_API_KEY=YOUR_API_KEY
✓ LEMON_SQUEEZY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
✓ NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Also verify in **Vercel project settings**:
```
✓ All same env variables added there too
```

---

## Testing Checklist

### Test 1: Pricing Page Loads

```
1. Start your dev server
   $ npm run dev

2. Go to http://localhost:3000/pricing

3. Expected result:
   ✅ Page loads with 3 pricing cards (Free, Pro, Plus)
   ✅ Buttons show: "Start Free", "Upgrade to Pro", "Go Premium"
   ✅ "Start Using Tera" button visible for logged-in users
```

### Test 2: Unauthenticated User Redirects to Sign In

```
1. Make sure you're NOT logged in
   (Logout if needed)

2. Go to http://localhost:3000/pricing

3. Click "Upgrade to Pro" button

4. Expected result:
   ✅ Redirects to /auth/signin
   ✅ User can sign in/create account
   ✅ After auth, can retry upgrade
```

### Test 3: Authenticated User Initiates Checkout

```
1. Log in as a user (free plan)

2. Go to http://localhost:3000/pricing

3. Click "Upgrade to Pro" button

4. Expected result:
   ✅ Button shows "Processing..." state
   ✅ After 1-2 seconds, redirects to Lemon Squeezy
   ✅ Lemon Squeezy checkout page loads with your Pro plan price
```

### Test 4: Lemon Squeezy Test Payment

```
1. You're now in Lemon Squeezy checkout

2. Fill in test info:
   Email: test@example.com
   Card: 4242 4242 4242 4242
   Exp: 12/25
   CVC: 123
   Billing: Any address

3. Click "Complete Purchase"

4. Expected result:
   ✅ Payment processes (in test mode, doesn't charge)
   ✅ Redirects back to http://localhost:3000/profile
   ✅ Profile page loads
```

### Test 5: Webhook Updates Database

```
This happens automatically. Check server logs:

In terminal where "npm run dev" is running:
Look for:
   "✅ Subscription created for user [user-id]"
   OR
   "✅ User [user-id] upgraded to pro plan"

Expected result:
✅ One of these messages appears in logs
✅ Webhook processed successfully
```

### Test 6: User Profile Shows New Plan

```
1. You're on /profile page

2. Expected result:
   ✅ "Current Plan: Pro" displays
   ✅ Pro features are accessible
   ✅ Daily chat limit is now unlimited
   ✅ File upload limit is now 20/day
   ✅ Web search limit is now 50/month
```

### Test 7: Pricing Page Shows Current Plan

```
1. Go back to http://localhost:3000/pricing

2. Expected result:
   ✅ Pro card shows "✓ Current Plan" button (disabled)
   ✅ Free and Plus buttons are still clickable
   ✅ Cannot upgrade to plan you're already on
```

### Test 8: Upgrade from Pro to Plus

```
1. Still logged in as Pro user

2. Click "Go Premium" button on Plus card

3. Expected result:
   ✅ Redirects to Lemon Squeezy with Plus pricing ($19)
   ✅ Different checkout than Pro (different variant ID)
   ✅ Complete test purchase
   ✅ Webhook updates to "plus" plan
   ✅ Profile now shows Plus plan
```

---

## Troubleshooting

### Issue: Checkout page is blank/doesn't load

**Check these:**
```
1. Server logs show no errors?
   → Look for error messages in terminal

2. Variant IDs are correct?
   → Double-check LEMON_SQUEEZY_PRO_VARIANT_ID
   → Double-check LEMON_SQUEEZY_PLUS_VARIANT_ID
   → Verify they're published in Lemon Squeezy dashboard

3. Did you restart dev server after adding env vars?
   → Kill "npm run dev" (Ctrl+C)
   → Run "npm run dev" again

4. Is Store ID correct?
   → Verify NEXT_PUBLIC_LEMON_STORE_ID
   → Check it matches Lemon Squeezy dashboard
```

### Issue: "Failed to create checkout session" error

**Check these:**
```
1. API Key valid?
   → Verify LEMON_SQUEEZY_API_KEY in .env.local
   → Make sure it's not truncated or has extra spaces

2. Is the API endpoint being called?
   → Check browser Network tab (DevTools → Network)
   → Look for POST to /api/checkout/create-session
   → Check the response - any error message?

3. Server logs show API error?
   → Terminal might show "401 Unauthorized"
   → This means API Key is invalid

4. Variants exist and are published?
   → Go to Lemon Squeezy dashboard
   → Products → Tera
   → Check both variants are published (not draft)
   → Verify variant IDs in dashboard match your .env
```

### Issue: Payment succeeds but plan doesn't update

**Check these:**
```
1. Webhook being received?
   → In Lemon Squeezy dashboard
   → Settings → Webhooks → Click your webhook
   → Look for recent "Deliveries" - should show 200 responses
   → If showing red errors, something is wrong

2. Webhook URL is correct?
   → For local dev, must use ngrok
   → URL should be: https://YOUR_NGROK_URL/api/webhooks/lemon-squeezy
   → Make sure it's HTTPS not HTTP

3. Webhook secret matches?
   → Verify LEMON_SQUEEZY_WEBHOOK_SECRET
   → Must match exactly what's in Lemon Squeezy dashboard
   → No extra spaces or characters

4. Database has subscription columns?
   → Check your users table has:
   → subscription_plan
   → lemon_squeezy_customer_id
   → lemon_squeezy_subscription_id
   → If missing, run database migration

5. Custom data being sent?
   → Webhook handler expects user_id in custom_data
   → Check /api/checkout/create-session is passing userId
```

### Issue: "Subscription created but no user_id" in logs

**This means:**
```
Webhook fired but user_id wasn't sent from checkout

Check /api/checkout/create-session:
Line 62-68 should include:
   body: JSON.stringify({
     plan,
     email: user.email,
     userId: user.id,  ← This is being passed
     ...
   })

And /lib/lemon-squeezy.ts createCheckout():
Line 88 should include:
   checkout_data_custom_user_id: options.userId || ''
```

---

## Step-by-Step Debug Flow

If checkout doesn't work, follow this:

```
1. Check .env.local file exists and has all 5 vars
   └─ If missing any → Add them

2. Restart dev server
   └─ Kill "npm run dev" → Run "npm run dev" again

3. Go to pricing page
   └─ Check it loads without errors

4. Click "Upgrade to Pro"
   └─ Open DevTools (F12) → Network tab
   └─ Look for POST to /api/checkout/create-session
   └─ Check response: is there a checkoutUrl?
   └─ If error, read the error message carefully

5. If redirects to Lemon Squeezy:
   └─ Check URL shows correct plan price
   └─ Pro should be $5, Plus should be $19

6. Complete test payment
   └─ Use card: 4242 4242 4242 4242
   └─ Any expiry, any CVC, any billing address

7. Check server logs for webhook message
   └─ Should see "✅ User [id] upgraded to pro"
   └─ If not, check webhook settings in Lemon Squeezy

8. Check profile page
   └─ User's plan should update
   └─ May need to refresh page
```

---

## Local Development Webhook Testing

### Using ngrok (Recommended)

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Expose with ngrok
ngrok http 3000

# You'll see:
# Forwarding    https://abc123.ngrok.io -> http://localhost:3000

# In Lemon Squeezy, set webhook URL to:
# https://abc123.ngrok.io/api/webhooks/lemon-squeezy
```

### Without ngrok (Testing Webhooks Manually)

```bash
# Get your webhook test URL from Lemon Squeezy
# Click your webhook → "Resend" button
# This will resend last webhook event to your endpoint
```

---

## Production Deployment

When deploying to production:

```
1. In Vercel project settings, add these env vars:
   ✅ NEXT_PUBLIC_LEMON_STORE_ID
   ✅ LEMON_SQUEEZY_PRO_VARIANT_ID
   ✅ LEMON_SQUEEZY_PLUS_VARIANT_ID
   ✅ LEMON_SQUEEZY_API_KEY
   ✅ LEMON_SQUEEZY_WEBHOOK_SECRET
   ✅ NEXT_PUBLIC_APP_URL=https://yourdomain.com

2. Update webhook URL in Lemon Squeezy:
   https://yourdomain.com/api/webhooks/lemon-squeezy

3. Turn off Test Mode in Lemon Squeezy:
   Settings → Store → Toggle Test Mode OFF

4. Deploy to Vercel
   git push

5. Test a real payment with real card
   (Will actually charge)

6. Verify webhook fires and updates database
```

---

## Success Indicators

Your checkout is working when:

```
✅ Pricing page loads
✅ Users redirect to Lemon Squeezy on click
✅ Lemon Squeezy checkout shows correct price
✅ Test payment completes
✅ Server logs show webhook success message
✅ Profile page shows new plan
✅ Usage limits update correctly
✅ Pricing page shows "Current Plan" for user's plan
```

---

## Files Involved

```
Pricing Page:
  app/pricing/page.tsx
    └─ handleCheckout() function

Checkout API:
  app/api/checkout/create-session/route.ts
    └─ Calls Lemon Squeezy API

Webhook Handler:
  app/api/webhooks/lemon-squeezy/route.ts
    └─ Processes subscription events
    └─ Updates user database

Lemon Squeezy Integration:
  lib/lemon-squeezy.ts
    └─ Helper functions

Subscription Status:
  app/api/subscription/status/route.ts
    └─ Returns user's current plan
```

---

## Next Steps

Once upgrade works:
1. Test all limit enforcement (daily chats, file uploads, etc.)
2. Test plan-specific features
3. Test customer portal (manage subscription)
4. Deploy to production
5. Do a real payment test
