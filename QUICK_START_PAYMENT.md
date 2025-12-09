# Quick Start: Payment Integration

Get Lemon Squeezy payment processing running in 30 minutes.

## 5-Minute Setup

### 1. Create Lemon Squeezy Account
- Go to https://lemonsqueezy.com
- Sign up for free account
- Create a store

### 2. Create Products
**Pro Plan:**
- Name: "Tera Pro Plan"
- Price: $5
- Billing: Monthly
- **Copy Variant ID**

**School Plan:**
- Name: "Tera School Plan"  
- Price: $20
- Billing: Monthly
- **Copy Variant ID**

### 3. Create Webhook
- Settings → Webhooks
- URL: `https://yourdomain.com/api/webhooks/lemon-squeezy`
- Events: order_completed, subscription_created, subscription_updated, subscription_cancelled, subscription_expired
- **Copy Webhook Secret**

### 4. Add Environment Variables
```env
LEMON_SQUEEZY_WEBHOOK_SECRET=<secret_from_step_3>
LEMON_SQUEEZY_PRO_VARIANT_ID=<variant_from_step_2>
LEMON_SQUEEZY_SCHOOL_VARIANT_ID=<variant_from_step_2>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 5. Run Database Migration
```sql
-- Run in Supabase SQL editor
-- File: lib/migrations/add-lemon-squeezy-fields.sql
```

### 6. Test Checkout
- Go to `/pricing`
- Click "Upgrade to Pro"
- You're redirected to Lemon Squeezy checkout

## That's It! ✅

The payment system is now active:
- ✅ Users can upgrade to Pro
- ✅ Users can cancel subscriptions
- ✅ Limits are enforced by plan
- ✅ Revenue is tracked

## Test It

### Enable Test Mode
1. Lemon Squeezy Settings → Enable Test Mode
2. Use test card: `4242 4242 4242 4242`

### Test Checkout Flow
1. Go to `/pricing`
2. Click "Upgrade to Pro"
3. Use test payment method
4. Check database - plan should update to 'pro'

### Test Webhook
1. Lemon Squeezy Settings → Webhooks → Send Test
2. Check server logs - should process event
3. Check database - user should be updated

## Verify Limits

### Web Search Limits
- Free: 3/month
- Pro: 50/month  
- School: 80/month

### Test Limit Enforcement
1. Sign up as free user
2. Try web search - works (has 3)
3. Use 3 searches
4. Try again - shows upgrade prompt
5. Upgrade to Pro
6. Try again - works (now has 50)

## Monitor

### Check Subscription Status
```javascript
// Fetch in browser console
fetch('/api/subscription/status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user-id' })
}).then(r => r.json()).then(console.log)
```

### View Database
```sql
SELECT id, subscription_plan, subscription_status, subscription_renewal_date
FROM users
WHERE subscription_plan != 'free'
```

## Troubleshooting

### Checkout Not Working
- [ ] Variant IDs correct in `.env.local`
- [ ] Products active in Lemon Squeezy
- [ ] Test mode enabled for testing

### Webhooks Not Processing
- [ ] Webhook URL correct in Lemon Squeezy
- [ ] Webhook secret correct in `.env.local`
- [ ] Check Lemon Squeezy webhook logs

### Limits Not Enforced
- [ ] Database migration ran
- [ ] `subscription_plan` column exists
- [ ] User's plan is actually updated

## Production Checklist

Before going live:
- [ ] Disable test mode in Lemon Squeezy
- [ ] Create production products
- [ ] Create production webhook
- [ ] Update environment variables
- [ ] Test with small real payment
- [ ] Monitor webhook logs for 24h
- [ ] Document support email for issues

## Files to Review

| File | Purpose |
|------|---------|
| `lib/lemon-squeezy.ts` | Payment utilities |
| `app/api/webhooks/lemon-squeezy/route.ts` | Webhook handler |
| `app/api/checkout/create-session/route.ts` | Checkout creation |
| `app/pricing/page.tsx` | Upgrade flow |
| `LEMON_SQUEEZY_SETUP.md` | Detailed setup |
| `PAYMENT_FLOW.md` | Complete flows |

## Key APIs

### Create Checkout
```bash
POST /api/checkout/create-session
{
  "plan": "pro",
  "email": "user@example.com",
  "userId": "user-123"
}
→ { "checkoutUrl": "https://..." }
```

### Get Subscription Status
```bash
POST /api/subscription/status
{ "userId": "user-123" }
→ { "plan": "pro", "status": "active", "renewalDate": "2025-01-15" }
```

### Webhook Events
```
POST /api/webhooks/lemon-squeezy
(automatic from Lemon Squeezy)
```

## Support

- **Setup Help**: See LEMON_SQUEEZY_SETUP.md
- **Flow Help**: See PAYMENT_FLOW.md
- **Implementation Help**: See LEMON_SQUEEZY_CHECKLIST.md
- **Lemon Squeezy Docs**: https://docs.lemonsqueezy.com

## Next Steps

1. ✅ Complete 5-minute setup above
2. 📖 Read LEMON_SQUEEZY_SETUP.md for details
3. 🧪 Test checkout flow
4. 🔍 Monitor webhook logs
5. 🚀 Deploy to production
6. 📊 Track revenue

That's all! Your payment system is ready. 🎉
