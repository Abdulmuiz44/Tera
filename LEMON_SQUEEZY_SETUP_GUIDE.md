# Lemon Squeezy Configuration Guide - Get Your Variant IDs

## Prerequisites
1. Lemon Squeezy account (sign up at https://app.lemonsqueezy.com)
2. Your store is set up and active
3. Access to your `.env.local` file in your project

---

## Step 1: Log In to Lemon Squeezy Dashboard

1. Go to https://app.lemonsqueezy.com/login
2. Sign in with your credentials
3. You should see the main dashboard

---

## Step 2: Create Your "Tera" Product

1. Click on **Products** in the left sidebar
2. Click **+ New Product** button (top right)
3. Fill in the form:
   - **Product Name:** `Tera Subscription Plans`
   - **Description:** `AI Learning Platform Subscription`
   - **Product Type:** Select **"Subscription"**
   - Click **Next** or **Create**

You now have a product. Lemon Squeezy automatically creates a default variant, but we need to create custom variants for Pro and Plus.

---

## Step 3: Create the PRO Plan Variant

1. In your product, look for **"Variants"** section
2. Click **+ Add Variant** button
3. Fill in the variant details:

### PRO Variant Configuration:
```
Variant Name:        Pro
Description:         Unlimited AI conversations, advanced features
Price:              $5.00
Billing Cycle:      Monthly (Repeat payment every 1 month)
Free Trial:         No (or yes if you want to offer trial)
Generate License Keys: No (uncheck)
```

4. Click **Save and Add Another**
5. Keep note of the variant ID shown after creation (copy it)
6. Store it in a safe place - this is `LEMON_SQUEEZY_PRO_VARIANT_ID`

---

## Step 4: Create the PLUS Plan Variant

1. The form should still be open after the previous step
2. Fill in the variant details:

### PLUS Variant Configuration:
```
Variant Name:        Plus
Description:         Everything in Pro + team collaboration, advanced analytics
Price:              $19.00
Billing Cycle:      Monthly (Repeat payment every 1 month)
Free Trial:         No
Generate License Keys: No
```

3. Click **Save and Go Back**
4. Keep note of the variant ID shown - this is `LEMON_SQUEEZY_PLUS_VARIANT_ID`

---

## Step 5: Find Your Variant IDs (Important!)

### Method 1: From Dashboard (Recommended)

1. Go to **Products** page
2. Click on your "Tera Subscription Plans" product
3. In the Variants section, you'll see both variants listed
4. **Click each variant** - the URL will change and show the variant ID
   - URL format: `https://app.lemonsqueezy.com/products/xxxxx/variants/YOUR_VARIANT_ID`
   - Copy the number at the end

Example:
```
PRO variant URL:  https://app.lemonsqueezy.com/products/12345/variants/54321
                                                                    ↑
                                                         This is your PRO variant ID

PLUS variant URL: https://app.lemonsqueezy.com/products/12345/variants/54322
                                                                    ↑
                                                         This is your PLUS variant ID
```

### Method 2: Using API

If you want to fetch programmatically:

```bash
curl https://api.lemonsqueezy.com/v1/products/YOUR_PRODUCT_ID/variants \
  -H "Authorization: Bearer YOUR_API_KEY"
```

You'll see JSON response with all variants and their IDs.

---

## Step 6: Publish Your Product

1. Go back to your product page
2. Look for **Publish** button or **Product Status**
3. Change status from "Draft" to **"Published"**
4. Confirm the publication

---

## Step 7: Get Your Store ID

1. Go to **Settings** in the left sidebar
2. Click on **Stores** section
3. You'll see your store listed
4. Find your **Store ID** - this is a number
5. Copy it - this is `NEXT_PUBLIC_LEMON_STORE_ID`

Example: `12345`

---

## Step 8: Generate API Key

1. Go to **Settings** → **API Keys**
2. Click **+ Create API Key**
3. Give it a name: `Tera Checkout`
4. Select scopes you need (usually "Read" and "Write")
5. Click **Create**
6. **Copy the key immediately** - you won't see it again!
7. This is `LEMON_SQUEEZY_API_KEY`

---

## Step 9: Get Webhook Secret

1. Go to **Settings** → **Webhooks**
2. Click **+ New Webhook**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/lemon-squeezy`
   - For local development: use ngrok (see below)
4. Select events to listen for:
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `order_created` (optional)
5. Click **Create**
6. You'll see a **Webhook Secret** displayed
7. Copy it - this is `LEMON_SQUEEZY_WEBHOOK_SECRET`

### Using ngrok for Local Development:

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# You'll get a URL like: https://abc123.ngrok.io
# Use this in the webhook: https://abc123.ngrok.io/api/webhooks/lemon-squeezy
```

---

## Step 10: Update Your .env.local File

Now add all the values you collected to your `.env.local` file:

```bash
# Lemon Squeezy Configuration
NEXT_PUBLIC_LEMON_STORE_ID=12345
LEMON_SQUEEZY_PRO_VARIANT_ID=54321
LEMON_SQUEEZY_PLUS_VARIANT_ID=54322
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here

# Return URL after checkout (adjust for your domain)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# For production:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

⚠️ **Important Notes:**
- `LEMON_SQUEEZY_API_KEY` should NOT be prefixed with `NEXT_PUBLIC_` (keep it secret)
- `LEMON_SQUEEZY_WEBHOOK_SECRET` should NOT be prefixed with `NEXT_PUBLIC_`
- The other variables can have `NEXT_PUBLIC_` prefix

---

## Step 11: Test Your Configuration

### Test Mode in Lemon Squeezy:

1. Go to **Settings** → **Store**
2. Toggle **Test Mode** to ON
3. In test mode, you can use test card: `4242 4242 4242 4242`
4. This won't charge real money

### Test the Pricing Page:

1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/pricing`
3. Try clicking "Upgrade to Pro"
4. You should be redirected to Lemon Squeezy checkout
5. Complete the test purchase with test card
6. Verify the webhook is received (check your server logs)

---

## Step 12: Verify Webhook Integration

Your webhook handler is at `app/api/webhooks/lemon-squeezy/route.ts`

It should:
1. Receive subscription events from Lemon Squeezy
2. Verify the webhook signature
3. Update the user's subscription plan in your database
4. Send confirmation response (200 OK)

Example flow:
```
User buys Pro plan
         ↓
Lemon Squeezy processes payment
         ↓
Webhook fires to your app
         ↓
Database updated with new subscription plan
         ↓
User sees Pro features enabled
```

---

## Common Issues & Solutions

### Issue: "Variant ID not found"
**Solution:** 
- Verify you copied the variant ID correctly
- Check the ID is in your `.env.local` file
- Restart your Next.js dev server after adding env vars
- Make sure your variant is Published

### Issue: Checkout redirects to wrong page
**Solution:**
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Verify it's the full URL with https://
- For development, use `http://localhost:3000`

### Issue: Webhook not triggering
**Solution:**
- Verify webhook URL is correct and publicly accessible
- If using localhost, use ngrok to expose it
- Check webhook secret matches in `.env.local`
- In test mode, use test card `4242 4242 4242 4242`
- Check your app logs for webhook errors

### Issue: "Invalid signature" webhook error
**Solution:**
- Make sure `LEMON_SQUEEZY_WEBHOOK_SECRET` is exactly correct
- Don't add quotes or extra spaces
- Verify it matches the secret shown in Lemon Squeezy dashboard

### Issue: Variant doesn't show at checkout
**Solution:**
- Make sure the variant is Published (not Draft)
- Variant price must be set (cannot be $0)
- For subscriptions, billing cycle must be selected

---

## Production Checklist

Before going live:

- [ ] Test Mode is OFF in Lemon Squeezy
- [ ] Variant IDs are production variant IDs (not test ones)
- [ ] API Key is your production API key
- [ ] Webhook URL points to your production domain (https://)
- [ ] Database migration includes subscription tracking columns
- [ ] Email notifications are set up in Lemon Squeezy settings
- [ ] Return URL points to production domain
- [ ] Test a real payment with a real card
- [ ] Verify webhook fires and updates database
- [ ] Test customer portal URL generation

---

## Quick Reference

| Item | Where to Find | Env Variable |
|------|---------------|--------------|
| Store ID | Settings → Stores | `NEXT_PUBLIC_LEMON_STORE_ID` |
| Pro Variant ID | Products → Tera → Pro variant | `LEMON_SQUEEZY_PRO_VARIANT_ID` |
| Plus Variant ID | Products → Tera → Plus variant | `LEMON_SQUEEZY_PLUS_VARIANT_ID` |
| API Key | Settings → API Keys | `LEMON_SQUEEZY_API_KEY` |
| Webhook Secret | Settings → Webhooks | `LEMON_SQUEEZY_WEBHOOK_SECRET` |
| App URL | Your domain | `NEXT_PUBLIC_APP_URL` |

---

## Useful Links

- Lemon Squeezy Dashboard: https://app.lemonsqueezy.com
- API Documentation: https://docs.lemonsqueezy.com/api
- Webhook Guide: https://docs.lemonsqueezy.com/guides/developer-guide/webhooks
- SaaS Subscription Setup: https://docs.lemonsqueezy.com/guides/tutorials/saas-subscription-plans
- Variants Documentation: https://docs.lemonsqueezy.com/help/products/variants
- Subscriptions Documentation: https://docs.lemonsqueezy.com/help/products/subscriptions

---

## Need Help?

If you get stuck:

1. Check Lemon Squeezy Help Center: https://www.lemonsqueezy.com/help
2. Review your webhook logs in Lemon Squeezy dashboard
3. Check your app server logs for errors
4. Verify all env variables are set correctly
5. Make sure variant IDs match between your code and dashboard

---

## Your Current Setup Status

✅ **Already Implemented in Your Code:**
- Checkout flow: `app/api/checkout/create-session/route.ts`
- Webhook handler: `app/api/webhooks/lemon-squeezy/route.ts`
- Plan configuration: `lib/lemon-squeezy.ts`
- Price conversion: `lib/currency-converter.ts`

You just need to fill in the env variables from Lemon Squeezy!
