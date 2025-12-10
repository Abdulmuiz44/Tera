# Checkout Testing - Real-World Scenarios

## Scenario 1: New User Signs Up and Upgrades to Pro

### Steps:
```
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create account with email/password
4. You're now logged in (Free plan by default)
5. Go to /pricing
6. Click "Upgrade to Pro"
   └─ Processing... (1-2 seconds)
   └─ Redirects to Lemon Squeezy
7. Fill in test payment:
   Email: (pre-filled with your email)
   Name: Test User
   Card: 4242 4242 4242 4242
   Exp: 12/25
   CVC: 123
8. Click "Complete Purchase"
9. Redirected to /profile
```

### What Should Happen:
```
✅ /api/checkout/create-session called
   └─ Receives: {plan: 'pro', email, userId, ...}
   └─ Returns: {checkoutUrl: 'https://checkout.lemonsqueezy.com/...'}

✅ User redirected to Lemon Squeezy
   └─ Shows Pro plan at $5/month
   └─ Shows your custom data (user_id) being passed

✅ Payment processes (test mode - no charge)

✅ Lemon Squeezy fires webhook:
   event_name: 'subscription_created'
   user_id: (from custom_data)
   variant_id: (your Pro variant ID)

✅ /api/webhooks/lemon-squeezy receives webhook
   └─ Verifies signature
   └─ Updates database:
      subscription_plan = 'pro'
      lemon_squeezy_subscription_id = xxx
      subscription_status = 'active'

✅ /profile page shows:
   └─ "Current Plan: Pro"
   └─ Unlimited daily chats
   └─ 20 file uploads/day
   └─ 50 web searches/month
```

### Debug If Something Goes Wrong:

```
Check 1: Is checkout endpoint being called?
  Open DevTools (F12) → Network tab
  Click "Upgrade to Pro"
  Look for POST to /api/checkout/create-session
  
  If NOT appearing:
  └─ Check browser console for JS errors
  └─ Check .env.local has NEXT_PUBLIC_APP_URL set

  If appearing with error response:
  └─ Check error message
  └─ Check LEMON_SQUEEZY_API_KEY is correct
  └─ Check variant ID is correct and published

Check 2: Does Lemon Squeezy page load?
  If redirects successfully:
  └─ URL should be: https://checkout.lemonsqueezy.com/...
  └─ Price should show: $5.00/month for Pro
  └─ Your email should be pre-filled

  If blank page:
  └─ Check variant is published in Lemon Squeezy
  └─ Check variant price is set (not $0)
  └─ Check Store ID is correct

Check 3: Is webhook firing?
  After completing payment:
  Look in terminal for:
  └─ "✅ Subscription created for user [ID]"
  
  If NOT seeing this:
  └─ Go to Lemon Squeezy dashboard
  └─ Settings → Webhooks
  └─ Click your webhook → View deliveries
  └─ Check if delivery shows green (200) or red (error)
  
  If showing red:
  └─ Check webhook secret matches
  └─ Check URL is publicly accessible (use ngrok for local)
  └─ Check /api/webhooks/lemon-squeezy route exists

Check 4: Is profile updated?
  After webhook success, go to /profile
  Might need to refresh page (F5)
  
  If not updated:
  └─ Check database: users table has subscription_plan column
  └─ Check webhook logs for errors
  └─ Manually verify in database
```

---

## Scenario 2: Existing Pro User Upgrades to Plus

### Steps:
```
1. You're logged in as Pro user (from previous test)
2. Go to /pricing
3. Pro card should show "✓ Current Plan" (disabled)
4. Click "Go Premium" button on Plus card
   └─ Processing... (1-2 seconds)
   └─ Redirects to Lemon Squeezy
5. Complete test payment with card
6. Redirected to /profile
```

### What Should Happen:
```
✅ Plus card price shows $19/month (different from Pro $5)

✅ /api/checkout/create-session called with:
   {plan: 'plus', ...}
   └─ This variant ID should be DIFFERENT from Pro

✅ Lemon Squeezy shows Plus plan checkout

✅ Webhook fires with:
   event_name: 'subscription_created' or 'subscription_updated'
   variant_id: (your Plus variant ID)

✅ Database updates:
   subscription_plan = 'plus'
   (replaces old 'pro')

✅ /profile shows:
   └─ "Current Plan: Plus"
   └─ All features from Pro + Plus-exclusive features
   └─ 80 web searches/month (instead of 50)
   └─ Advanced analytics access
```

### Key Difference:
```
When upgrading BETWEEN plans:
└─ Lemon Squeezy handles proration automatically
└─ User gets credit for remaining Pro time
└─ Charged difference for Plus

Your webhook handler just updates:
└─ subscription_plan to the new plan
└─ Don't need to handle proration (Lemon does it)
```

---

## Scenario 3: User Can't Click Button Twice

### Steps:
```
1. Logged in as Free user
2. Click "Upgrade to Pro"
   └─ Button changes to "Processing..."
   └─ Button is disabled during request
3. QUICKLY click button again before redirect
   └─ Second click should be ignored
4. After redirect completes, only ONE checkout happened
```

### What Should Happen:
```
✅ disabled state during loading prevents double-clicks
   └─ Code: disabled={plan.current || (loading && ...)}

✅ First POST to /api/checkout/create-session succeeds

✅ Second click is ignored (button is disabled)

✅ Only ONE subscription created in Lemon Squeezy

✅ No duplicate charges or errors
```

---

## Scenario 4: Different Plans Show Different Prices

### Steps:
```
1. Logged in
2. Go to /pricing
3. Look at Pro card - should show $5.00/month
4. Look at Plus card - should show $19.00/month
5. Click each to verify checkout shows correct price
```

### What Should Happen:
```
✅ Pro variant ID is used for Pro checkout
   └─ Lemon Squeezy shows $5 price

✅ Plus variant ID is used for Plus checkout
   └─ Lemon Squeezy shows $19 price

✅ Different checkout URLs generated
   └─ URLs differ by variant ID

✅ Correct plan reflected in database after purchase
```

### If Prices Are Wrong:
```
Check in Lemon Squeezy:
1. Products → Tera
2. Pro variant:
   └─ Click to edit
   └─ Price should be $5.00
   └─ Verify variant ID matches LEMON_SQUEEZY_PRO_VARIANT_ID
3. Plus variant:
   └─ Price should be $19.00
   └─ Verify variant ID matches LEMON_SQUEEZY_PLUS_VARIANT_ID

If prices in dashboard are correct but checkout shows wrong price:
└─ Variant IDs might be swapped in .env.local
└─ Restart dev server after fixing
```

---

## Scenario 5: Error Handling - Invalid Card

### Steps:
```
1. Clicked upgrade and at Lemon Squeezy checkout
2. Use invalid test card: 4000 0000 0000 0002
3. Try to complete payment
```

### What Should Happen:
```
✅ Lemon Squeezy shows error: "Card declined"

✅ User can retry with valid card

✅ NO webhook fires (payment didn't process)

✅ Database NOT updated (subscription not created)

✅ User can go back and try again
```

---

## Scenario 6: Webhook Retry Logic

### Steps:
```
(This is automatic - you don't do anything)

Lemon Squeezy sends webhook to your endpoint
If your endpoint returns error (500):
   └─ Lemon Squeezy retries automatically
   └─ Retries with exponential backoff
```

### What Should Happen:
```
✅ If webhook endpoint is down, Lemon retries

✅ When endpoint comes back online, webhook delivers

✅ User's plan eventually updates (might take minutes)

✅ Check Lemon Squeezy dashboard for webhook delivery history
```

---

## Scenario 7: Same Plan - Can't Upgrade to Current Plan

### Steps:
```
1. Logged in as Pro user
2. On /pricing page
3. Pro card shows "✓ Current Plan" button (disabled/greyed out)
4. Try to click it (can't because disabled)
```

### What Should Happen:
```
✅ Button is disabled (not clickable)

✅ Button shows: "✓ Current Plan" (not "Upgrade to Pro")

✅ Code check:
   if (currentPlan === plan) {
     return  // Early exit, no checkout created
   }

✅ User can't accidentally create duplicate subscription
```

---

## Quick Test Checklist

```
□ Test 1: New user → Free → Pro
  Expected: Webhook fires, plan updates to Pro

□ Test 2: Pro user → Pro → Plus
  Expected: Webhook fires, plan updates to Plus

□ Test 3: Can't click button while loading
  Expected: Button disabled during processing

□ Test 4: Pro shows $5, Plus shows $19
  Expected: Correct prices in checkout

□ Test 5: Invalid card rejected
  Expected: Error shown, no subscription created

□ Test 6: Current plan button disabled
  Expected: Can't click, shows "Current Plan" text

□ Test 7: Profile shows updated plan
  Expected: After webhook, profile reflects new plan

□ Test 8: Pricing page shows current plan
  Expected: User's current plan marked on pricing page

□ Test 9: Limits update per plan
  Expected: Free=15 chats, Pro=unlimited, Plus=unlimited

□ Test 10: Webhook signature verified
  Expected: Invalid signature returns 401, valid returns 200
```

---

## Success! You're Ready When:

```
✅ Can complete upgrade flow without errors
✅ Webhook fires and updates database
✅ Profile page shows new plan
✅ Plan-specific features are accessible
✅ Limits update correctly
✅ All error cases handled gracefully
✅ Can upgrade from Free → Pro → Plus
✅ Same plan check prevents duplicates
```

---

## If Something Breaks

```
1. Check error message carefully
2. Search for that error in CHECKOUT_VERIFICATION.md
3. Follow the troubleshooting steps
4. Check server logs (terminal)
5. Check browser console (DevTools F12)
6. Check Lemon Squeezy dashboard for webhook deliveries
7. Verify all env variables are set
8. Restart dev server
9. Clear browser cache (Ctrl+Shift+Delete)
10. Ask in Lemon Squeezy support if LS-specific issue
```
