# Lemon Squeezy Setup - Visual Step-by-Step Guide

## Overview

```
Your App                      Lemon Squeezy               Your Database
┌─────────────┐               ┌──────────────┐            ┌──────────────┐
│  Pricing    │               │  Dashboard   │            │  Users       │
│  Page       │──Checkout────▶│  • Products  │            │  Subscriptions
│             │               │  • Variants  │────────────▶│               
│             │◀─Redirect─────│  • Payments  │            │               
│             │               │              │            │               
└─────────────┘               └──────────────┘            └──────────────┘
     Click                       Stores ID                  via Webhooks
    "Upgrade"                   Variant IDs
```

---

## Step-by-Step Visual

### STEP 1: Login to Lemon Squeezy

```
🌐 https://app.lemonsqueezy.com/login
   └─ Sign in with your email/password
```

---

### STEP 2: Go to Products

```
Dashboard (top left) ▼
├─ Products  ◄─── CLICK HERE
├─ Settings
├─ Customers
└─ ...
```

---

### STEP 3: Create Product

```
Products Page:
┌─────────────────────────────────────┐
│        + NEW PRODUCT (top right)    │
└─────────────────────────────────────┘
     ↓
Form:
┌─────────────────────────────────────┐
│ Product Name: Tera Subscription      │
│ Description: AI Learning Platform    │
│ Type: ⦿ Subscription                 │
│       ○ Single Payment               │
│ [Create]                             │
└─────────────────────────────────────┘
```

---

### STEP 4: Create PRO Variant

```
Your Product Page:
┌─────────────────────────────────────┐
│ Tera Subscription                   │
│                                     │
│ VARIANTS:                           │
│ ├─ Default (auto-created)           │
│ └─ + ADD VARIANT  ◄─── CLICK HERE   │
└─────────────────────────────────────┘
     ↓
Add Variant Form:
┌─────────────────────────────────────┐
│ Name:        Pro                    │
│ Description: Unlimited conversations│
│ Price:       $5.00                  │
│ Billing:     1 month (monthly)      │
│ Free Trial:  No                     │
│ [Save and Add Another]              │
└─────────────────────────────────────┘
     ↓
✅ PRO VARIANT CREATED!
   Copy this Variant ID: 54321
   └─ Goes into: LEMON_SQUEEZY_PRO_VARIANT_ID
```

---

### STEP 5: Create PLUS Variant

```
Same form appears again:
┌─────────────────────────────────────┐
│ Name:        Plus                   │
│ Description: Everything + Analytics │
│ Price:       $19.00                 │
│ Billing:     1 month (monthly)      │
│ [Save and Go Back]                  │
└─────────────────────────────────────┘
     ↓
✅ PLUS VARIANT CREATED!
   Copy this Variant ID: 54322
   └─ Goes into: LEMON_SQUEEZY_PLUS_VARIANT_ID
```

---

### STEP 6: Find Your Store ID

```
Left Sidebar:
├─ Products
├─ Settings  ◄─── CLICK HERE
│   └─ Stores ◄─── CLICK HERE
│   └─ API Keys
│   └─ Webhooks
└─ ...

Stores Page:
┌─────────────────────────────────────┐
│ Your Store Name                     │
│ Store ID: 12345  ◄─── COPY THIS     │
│ Status: Active                      │
└─────────────────────────────────────┘

Goes into: NEXT_PUBLIC_LEMON_STORE_ID=12345
```

---

### STEP 7: Create API Key

```
Settings → API Keys:
┌─────────────────────────────────────┐
│        + CREATE API KEY             │
└─────────────────────────────────────┘
     ↓
Form:
┌─────────────────────────────────────┐
│ Name:  Tera Checkout                │
│ Scopes: ☑ Read  ☑ Write             │
│ [Create]                            │
└─────────────────────────────────────┘
     ↓
⚠️  COPY IMMEDIATELY!
   Key appears only once.
   
Goes into: LEMON_SQUEEZY_API_KEY=secret_key_xxxx
```

---

### STEP 8: Create Webhook

```
Settings → Webhooks:
┌─────────────────────────────────────┐
│        + NEW WEBHOOK                │
└─────────────────────────────────────┘
     ↓
Form:
┌─────────────────────────────────────┐
│ Webhook URL:                        │
│ https://yourdomain.com/api/         │
│ webhooks/lemon-squeezy              │
│                                     │
│ For local dev, use ngrok:           │
│ https://abc123.ngrok.io/api/        │
│ webhooks/lemon-squeezy              │
│                                     │
│ Select Events:                      │
│ ☑ subscription_created              │
│ ☑ subscription_updated              │
│ ☑ order_created (optional)          │
│ [Create]                            │
└─────────────────────────────────────┘
     ↓
✅ WEBHOOK CREATED!
   Copy Secret: webhook_secret_xxxx
   
Goes into: LEMON_SQUEEZY_WEBHOOK_SECRET=webhook_secret_xxxx
```

---

### STEP 9: Publish Your Product

```
Back to Products:
┌─────────────────────────────────────┐
│ Tera Subscription                   │
│ Status: Draft  ─────────┐           │
│                         ↓           │
│                    [Publish]        │
│                                     │
│ ✅ Now Published!                   │
└─────────────────────────────────────┘
```

---

### STEP 10: Add to Your `.env.local`

```
Your Project:
├─ .env.local  ◄─── EDIT THIS FILE
├─ package.json
└─ ...

.env.local:
┌─────────────────────────────────────┐
│ # Lemon Squeezy                     │
│ NEXT_PUBLIC_LEMON_STORE_ID=12345    │
│ LEMON_SQUEEZY_PRO_VARIANT_ID=54321  │
│ LEMON_SQUEEZY_PLUS_VARIANT_ID=54322 │
│ LEMON_SQUEEZY_API_KEY=secret_xxxx   │
│ LEMON_SQUEEZY_WEBHOOK_SECRET=xxx    │
│ NEXT_PUBLIC_APP_URL=http://localhost│
│ :3000                               │
└─────────────────────────────────────┘
```

---

### STEP 11: Restart Your App

```
Terminal:
┌─────────────────────────────────────┐
│ $ npm run dev                       │
│                                     │
│ ▲ Local:   http://localhost:3000    │
│ ✓ Ready in 2.5s                     │
└─────────────────────────────────────┘
```

---

### STEP 12: Test It

```
Browser: http://localhost:3000/pricing
┌─────────────────────────────────────┐
│  Pricing Page                       │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ Free     │  │ Pro      │        │
│  │ $0       │  │ $5/mo    │        │
│  │          │  │          │        │
│  │ [Start]  │  │[Upgrade] │        │
│  └──────────┘  │to Pro│   │        │
│                └─────────┘        │
│           ↓ CLICK HERE             │
│                                     │
│  Redirects to Lemon Squeezy:        │
│  ┌──────────────────────────────┐   │
│  │ Lemon Squeezy Checkout       │   │
│  │                              │   │
│  │ Card: 4242 4242 4242 4242    │   │
│  │ Exp: 12/25                   │   │
│  │ CVC: 123                     │   │
│  │ [Pay $5.00]                  │   │
│  └──────────────────────────────┘   │
│           ↓ SUCCESS!                 │
│                                     │
│  Webhook fires → Your database      │
│  updated → User is now "Pro"        │
└─────────────────────────────────────┘
```

---

## Quick IDs Checklist

```
☐ Store ID:            12345
☐ Pro Variant ID:      54321
☐ Plus Variant ID:     54322
☐ API Key:             secret_key_xxxx
☐ Webhook Secret:      webhook_secret_xxxx

All filled in? → Go to next step!
```

---

## Troubleshooting

### "Checkout page blank?"
```
✓ Restart your dev server after env changes
✓ Check variant IDs are correct in .env.local
✓ Verify variants are Published (not Draft)
```

### "Webhook not firing?"
```
✓ For local dev: Use ngrok, not localhost
✓ Webhook URL must be HTTPS and public
✓ Check webhook secret matches exactly
✓ Look for errors in app logs
```

### "Still stuck?"
```
Read the full guide: LEMON_SQUEEZY_SETUP_GUIDE.md
```

---

## Environment Variables Reference

```bash
# ✅ DO PREFIX WITH NEXT_PUBLIC_
NEXT_PUBLIC_LEMON_STORE_ID=12345
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ❌ DO NOT PREFIX (keep secret!)
LEMON_SQUEEZY_PRO_VARIANT_ID=54321
LEMON_SQUEEZY_PLUS_VARIANT_ID=54322
LEMON_SQUEEZY_API_KEY=secret_key
LEMON_SQUEEZY_WEBHOOK_SECRET=webhook_secret
```

---

## Success! 🎉

Your Lemon Squeezy integration is ready when:
- [ ] Pricing page loads
- [ ] "Upgrade to Pro" redirects to Lemon Squeezy
- [ ] Test card purchase completes
- [ ] User sees "Pro" plan in profile after purchase
- [ ] Webhook updates your database
