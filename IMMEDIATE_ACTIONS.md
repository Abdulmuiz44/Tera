# Immediate Actions - Get Checkout Working Now

## ⚡ Quick Start (Do This Now)

### 1. Verify Your .env.local Has These 6 Variables:
```bash
NEXT_PUBLIC_LEMON_STORE_ID=<store_id>
NEXT_PUBLIC_LEMON_STORE_ID=<store_id>
LEMON_SQUEEZY_PRO_VARIANT_ID=<pro_variant_id>
LEMON_SQUEEZY_PLUS_VARIANT_ID=<plus_variant_id>
LEMON_SQUEEZY_API_KEY=<api_key>
LEMON_SQUEEZY_WEBHOOK_SECRET=<webhook_secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ All 6 variables present?
└─ Go to step 2

❌ Missing any variables?
└─ Go to LEMON_SQUEEZY_SETUP_GUIDE.md and get them from your dashboard

---

### 2. Restart Your Development Server

```bash
# In terminal where "npm run dev" is running:
Ctrl + C  (to kill it)

# Start it again:
npm run dev

# Wait for:
# ✓ Ready in 2.5s
# ▲ Local: http://localhost:3000
```

⚠️ **Critical:** You MUST restart after adding env variables!

---

### 3. Test the Checkout Flow

```
Step A: Open http://localhost:3000/pricing in your browser

Step B: Look for 3 pricing cards:
   ✅ Free  ($0)
   ✅ Pro   ($5/month)
   ✅ Plus  ($19/month)

Step C: Log in if not already
   (Sign up or use existing account)

Step D: Click "Upgrade to Pro" button

Step E: You should be redirected to Lemon Squeezy checkout
   ✅ URL starts with: https://checkout.lemonsqueezy.com/
   ✅ Price shows: $5.00/month
   ✅ Email is pre-filled
```

### If Checkout Page Loads:
✅ **You're successful!** Continue to step 4.

### If Checkout Page Doesn't Load:

**Option 1: Blank page**
```
Likely issue: Variant ID wrong or not published

Fix:
1. Go to Lemon Squeezy dashboard
2. Products → Tera → Pro variant
3. Verify status is "Published" (not Draft)
4. Copy variant ID from URL or settings
5. Update LEMON_SQUEEZY_PRO_VARIANT_ID in .env.local
6. Restart: npm run dev
7. Try again
```

**Option 2: Error message on page**
```
Likely issue: API Key wrong or Store ID wrong

Fix:
1. Check error message carefully (read it!)
2. Go to Lemon Squeezy Settings
3. Verify Store ID matches your dashboard
4. Verify API Key hasn't expired
5. Verify no extra spaces/characters in env vars
6. Update .env.local
7. Restart: npm run dev
8. Try again
```

**Option 3: Redirects but no checkout**
```
Likely issue: Webhook URL not set up

This is OK for now. Checkout still works.
You'll set up webhook URL later for production.
```

---

### 4. Complete a Test Payment

You're now in Lemon Squeezy checkout:

```
Fill in the form:
  Email:     (pre-filled - OK to keep)
  Name:      Test User
  Card:      4242 4242 4242 4242
  Exp:       12/25
  CVC:       123
  Billing:   Any address

Click: "Complete Purchase"
```

✅ Payment succeeds (in test mode, won't charge)

---

### 5. Check What Happened

```
After completing payment, you're redirected to /profile

Look for:
✅ "Current Plan: Pro" displayed
✅ Plan features visible
✅ Limits updated (unlimited chats, etc.)
```

### If You See These, You're Done! ✅

```
✅ Pricing page loads
✅ Checkout button works
✅ Redirects to Lemon Squeezy
✅ Can enter test card
✅ Payment completes
✅ Redirected back to /profile
✅ Profile shows new plan
```

---

## Webhook Testing (Optional - For Local Development)

If you want webhooks to work locally:

### Using ngrok:

```bash
# Terminal 1: Keep your dev server running
npm run dev

# Terminal 2: New terminal
# Install ngrok (one-time)
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# You'll see output like:
# Forwarding    https://abc123.ngrok.io -> http://localhost:3000

# Copy the HTTPS URL above
```

### Update Lemon Squeezy Webhook:

```
1. Go to Lemon Squeezy dashboard
2. Settings → Webhooks
3. Click your webhook
4. Update URL to:
   https://abc123.ngrok.io/api/webhooks/lemon-squeezy
   (replace abc123 with YOUR ngrok URL)
5. Save
```

### Test Webhook:

```
1. Complete a test payment again
2. Check your dev server terminal
3. Look for:
   "✅ Subscription created for user [id]"
   OR
   "✅ User [id] upgraded to pro plan"

✅ If you see this, webhook is working!
```

---

## Troubleshooting: "Checkout Blank/Not Loading"

### Check 1: Are variant IDs published?
```
1. Go to Lemon Squeezy dashboard
2. Products → Tera
3. Click on "Pro" variant
4. Look for status: Should say "Published"
5. If it says "Draft":
   └─ Click "Publish" button
   └─ Try checkout again
```

### Check 2: Is price set on variant?
```
1. While viewing Pro variant
2. Look at price field
3. Should show: $5.00
4. If empty or $0:
   └─ Edit variant
   └─ Set price to $5.00
   └─ Save
   └─ Try checkout again
```

### Check 3: Restart dev server
```
Ctrl + C (kill npm run dev)
npm run dev
Wait for "Ready in..." message
Try checkout again
```

### Check 4: Check browser console for errors
```
Open DevTools: F12 or Ctrl+Shift+J
Look in Console tab for any red error messages
Copy error message
Google it OR check CHECKOUT_VERIFICATION.md
```

---

## Troubleshooting: "Payment Completes but Plan Doesn't Update"

This means webhook isn't working. That's OK for now - checkout works!

### For production, set up webhook:

```
1. Get a public URL (deploy to Vercel or use ngrok)
2. In Lemon Squeezy dashboard
   Settings → Webhooks → Create webhook
3. URL: https://yourdomain.com/api/webhooks/lemon-squeezy
4. Select events:
   ✅ subscription_created
   ✅ subscription_updated
5. Save
6. Copy webhook secret
7. Add to .env: LEMON_SQUEEZY_WEBHOOK_SECRET=...
8. Restart dev server
9. Test payment again
```

---

## Checklist Before Going to Production

- [ ] Checkout works locally
- [ ] Can complete test payment
- [ ] Webhook fires (see message in terminal logs)
- [ ] Database updates with new plan
- [ ] Profile shows updated plan
- [ ] All env variables added to Vercel settings
- [ ] Webhook URL updated to production domain
- [ ] Test Mode disabled in Lemon Squeezy
- [ ] Did real payment test with test card
- [ ] Verified no errors in production logs

---

## Deployment to Production

```
1. Add env variables to Vercel:
   - Go to Vercel project settings
   - Environment Variables section
   - Add all 6 variables from your .env.local
   
2. Update webhook in Lemon Squeezy:
   - Settings → Webhooks
   - Change URL to: https://yourdomain.com/api/webhooks/lemon-squeezy
   
3. Turn off test mode:
   - Lemon Squeezy Settings → Store
   - Toggle "Test Mode" to OFF
   
4. Deploy to Vercel:
   git add .
   git commit -m "Configure Lemon Squeezy checkout"
   git push
   
5. Test real payment (will charge card!):
   - Go to yourdomain.com/pricing
   - Use real card (test card won't work in production)
   - Verify payment succeeds
   - Verify webhook fires
```

---

## Getting Help

### If something doesn't work:

1. **Check the detailed guides:**
   - CHECKOUT_VERIFICATION.md (troubleshooting section)
   - CHECKOUT_TEST_SCENARIOS.md (step-by-step tests)
   - LEMON_SQUEEZY_SETUP_GUIDE.md (setup details)

2. **Check your logs:**
   - Dev server terminal (npm run dev output)
   - Browser console (F12 → Console tab)
   - Lemon Squeezy dashboard → webhook deliveries

3. **Common issues:**
   - Forgot to restart dev server after env changes
   - Variant IDs swapped (Pro vs Plus)
   - Variant status is Draft instead of Published
   - API Key expired or invalid
   - Webhook secret doesn't match

4. **Last resort:**
   - Check Lemon Squeezy documentation
   - Contact Lemon Squeezy support
   - Check browser DevTools Network tab for API errors

---

## You're Ready! 🎉

Everything is implemented. Just:

1. ✅ Verify env variables
2. ✅ Restart dev server
3. ✅ Test checkout flow
4. ✅ Complete test payment
5. ✅ Verify plan updates

**Done!**

Next: Deploy to production when ready.
