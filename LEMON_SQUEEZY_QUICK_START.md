# Lemon Squeezy Setup - Quick Start (5 Minutes)

## What You Need to Do:

### 1. Create 2 Subscription Plans in Lemon Squeezy Dashboard

**PRO Plan:**
- Name: `Pro`
- Price: `$5/month`
- Billing: Monthly subscription

**PLUS Plan:**
- Name: `Plus`
- Price: `$19/month`
- Billing: Monthly subscription

### 2. Copy Your Variant IDs

After creating each variant, copy the ID from the URL or settings.

### 3. Find Your Store ID

Settings → Stores → Copy your Store ID number

### 4. Get Your API Key

Settings → API Keys → Create new → Copy the key

### 5. Get Your Webhook Secret

Settings → Webhooks → Create new → Copy the secret
(Webhook URL for local dev: use ngrok, for production use your domain)

### 6. Add to `.env.local`

```bash
NEXT_PUBLIC_LEMON_STORE_ID=YOUR_STORE_ID
LEMON_SQUEEZY_PRO_VARIANT_ID=YOUR_PRO_VARIANT_ID
LEMON_SQUEEZY_PLUS_VARIANT_ID=YOUR_PLUS_VARIANT_ID
LEMON_SQUEEZY_API_KEY=YOUR_API_KEY
LEMON_SQUEEZY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Restart Your App

```bash
# Kill the dev server (Ctrl+C)
npm run dev
```

### 8. Test It

1. Go to http://localhost:3000/pricing
2. Click "Upgrade to Pro"
3. Should redirect to Lemon Squeezy checkout
4. Use test card: `4242 4242 4242 4242`

---

## Where to Find Each ID

| ID | Location |
|----|----------|
| **Store ID** | https://app.lemonsqueezy.com → Settings → Stores |
| **Pro Variant ID** | https://app.lemonsqueezy.com → Products → Tera → Click Pro variant |
| **Plus Variant ID** | https://app.lemonsqueezy.com → Products → Tera → Click Plus variant |
| **API Key** | https://app.lemonsqueezy.com → Settings → API Keys |
| **Webhook Secret** | https://app.lemonsqueezy.com → Settings → Webhooks |

---

## For Local Development (Webhook Testing)

If you need webhooks to work locally:

```bash
# In one terminal, start your app
npm run dev

# In another terminal, use ngrok
ngrok http 3000

# You'll get a URL like: https://abc123.ngrok.io
# Use this in Lemon Squeezy webhook: https://abc123.ngrok.io/api/webhooks/lemon-squeezy
```

---

## Troubleshooting

**Checkout doesn't work?**
- Restart your app after adding env variables
- Check variant IDs are correct
- Make sure variants are Published (not Draft)

**Webhook not working?**
- For local dev, use ngrok URL
- Verify webhook secret is exact match
- Check server logs for errors

**Still stuck?**
- Read the full guide: `LEMON_SQUEEZY_SETUP_GUIDE.md`
