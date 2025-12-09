# Lemon Squeezy Integration Checklist

## Pre-Setup Requirements

- [ ] Lemon Squeezy account created (https://www.lemonsqueezy.com)
- [ ] Store created in Lemon Squeezy
- [ ] Products created for Pro and School plans

## Step 1: Create Products and Variants

### Pro Plan Product
- [ ] Product Name: "Tera Pro Plan"
- [ ] Price: $5
- [ ] Billing: Monthly (recurring)
- [ ] Description: "Unlimited lesson plans, unlimited chats, 50 web searches/month"
- [ ] **Copy Variant ID** → `LEMON_SQUEEZY_PRO_VARIANT_ID`

### School Plan Product
- [ ] Product Name: "Tera School Plan"
- [ ] Price: $20
- [ ] Billing: Monthly per user (recurring)
- [ ] Description: "Unlimited everything + admin features"
- [ ] **Copy Variant ID** → `LEMON_SQUEEZY_SCHOOL_VARIANT_ID`

## Step 2: Setup Webhooks

- [ ] Go to Lemon Squeezy Settings → Webhooks
- [ ] Create new webhook with URL: `https://yourdomain.com/api/webhooks/lemon-squeezy`
- [ ] Select events:
  - [ ] `order_completed`
  - [ ] `subscription_created`
  - [ ] `subscription_updated`
  - [ ] `subscription_cancelled`
  - [ ] `subscription_expired`
- [ ] **Copy Webhook Secret** → `LEMON_SQUEEZY_WEBHOOK_SECRET`

## Step 3: Environment Variables

Add to `.env.local`:

```env
LEMON_SQUEEZY_WEBHOOK_SECRET=<secret_from_step_2>
LEMON_SQUEEZY_PRO_VARIANT_ID=<variant_id_from_step_1>
LEMON_SQUEEZY_SCHOOL_VARIANT_ID=<variant_id_from_step_1>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Database Migration

- [ ] Run SQL migration from `lib/migrations/add-lemon-squeezy-fields.sql`
  - Can run in Supabase SQL editor
  - Or use migration tool if available

Verify fields added:
- [ ] `lemon_squeezy_customer_id`
- [ ] `lemon_squeezy_subscription_id`
- [ ] `lemon_squeezy_order_id`
- [ ] `subscription_status`
- [ ] `subscription_renewal_date`
- [ ] `subscription_cancelled_at`
- [ ] `subscription_updated_at`

## Step 5: Code Integration

### Files Created/Modified
- [ ] `lib/lemon-squeezy.ts` - Core utilities
- [ ] `app/api/webhooks/lemon-squeezy/route.ts` - Webhook handler
- [ ] `app/api/checkout/create-session/route.ts` - Checkout API
- [ ] `app/api/subscription/status/route.ts` - Status API
- [ ] `app/pricing/page.tsx` - Updated with checkout flow
- [ ] `LEMON_SQUEEZY_SETUP.md` - Setup guide
- [ ] `PAYMENT_FLOW.md` - Flow documentation

### Key Components
- [ ] Checkout URL creation working
- [ ] Webhook signature verification working
- [ ] User subscription updates from webhooks
- [ ] Plan-based limit enforcement
- [ ] Upgrade prompts working

## Step 6: Testing (Development)

### Local Testing with ngrok
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Expose to internet
ngrok http 3000
```

- [ ] Update webhook URL to ngrok URL in Lemon Squeezy
- [ ] Webhook events delivery enabled in test mode
- [ ] Payment method accepted (use test card)

### Test Flows

**Pro Upgrade Flow:**
- [ ] Open `/pricing`
- [ ] Click "Upgrade to Pro"
- [ ] Complete checkout with test payment method
- [ ] Verify user plan updated to 'pro' in database
- [ ] Verify limits updated (50 web searches available)
- [ ] Check webhook logs show `order_completed`

**Webhook Testing:**
- [ ] Send test webhook from Lemon Squeezy dashboard
- [ ] Verify webhook received (check server logs)
- [ ] Verify user subscription updated
- [ ] Check database fields populated

**Subscription Renewal:**
- [ ] Manual test webhook: `subscription_updated`
- [ ] Verify renewal date updated
- [ ] Verify status remains 'active'

**Cancellation:**
- [ ] Manual test webhook: `subscription_cancelled`
- [ ] Verify plan downgraded to 'free'
- [ ] Verify status updated to 'cancelled'
- [ ] Verify user can still access account

## Step 7: Production Setup

### Lemon Squeezy Production

- [ ] Disable test mode in Lemon Squeezy
- [ ] Create/update products in production
- [ ] Create production webhook
- [ ] **Copy production variant IDs**
- [ ] **Copy production webhook secret**

### Environment Variables (Production)

Update `.env.local` (or deployment system):
```env
LEMON_SQUEEZY_WEBHOOK_SECRET=<prod_secret>
LEMON_SQUEEZY_PRO_VARIANT_ID=<prod_variant_id>
LEMON_SQUEEZY_SCHOOL_VARIANT_ID=<prod_variant_id>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Deployment

- [ ] Run database migration in production
- [ ] Deploy code with production environment variables
- [ ] Update webhook URL to production domain
- [ ] Test with real payment (small amount, refund immediately)
- [ ] Verify webhook delivery in logs

### Go-Live Verification

- [ ] Checkout flow works end-to-end
- [ ] Webhooks being received
- [ ] Database updates correct
- [ ] User limits enforced based on plan
- [ ] Customer can cancel and downgrade
- [ ] Support email configured for School plan inquiries

## Step 8: Monitoring (Post-Launch)

### Daily Checks
- [ ] Webhook delivery logs (any failures?)
- [ ] New subscriptions created
- [ ] Customer support tickets related to payment

### Weekly Checks
- [ ] Revenue dashboard (orders, MRR)
- [ ] Failed payment attempts
- [ ] Cancelled subscriptions
- [ ] Churn rate

### Monthly Checks
- [ ] Total recurring revenue (MRR/ARR)
- [ ] Customer acquisition cost
- [ ] Lifetime value trends
- [ ] Plan distribution (free vs pro vs school)

## Troubleshooting

### If Checkout Fails
- [ ] Verify variant IDs correct
- [ ] Check `NEXT_PUBLIC_APP_URL` matches domain
- [ ] Check browser console for errors
- [ ] Verify Lemon Squeezy products active

### If Webhooks Don't Process
- [ ] Verify webhook URL correct
- [ ] Check webhook secret correct
- [ ] Enable webhook delivery logs in Lemon Squeezy
- [ ] Verify database migration ran
- [ ] Check server logs for errors

### If User Plans Don't Update
- [ ] Check webhook being received
- [ ] Verify custom_data.user_id being passed
- [ ] Check database migration completed
- [ ] Verify subscription_plan column exists

### If Limits Not Enforced
- [ ] Check plan-config.ts has correct limits
- [ ] Verify user's subscription_plan in database
- [ ] Check limit checking code in generate.ts
- [ ] Verify web-search-usage.ts using correct plan

## Support Resources

- [ ] Lemon Squeezy Docs: https://docs.lemonsqueezy.com
- [ ] Webhook Reference: https://docs.lemonsqueezy.com/webhooks
- [ ] Sandbox/Test Mode: https://docs.lemonsqueezy.com/help/getting-started/sandbox
- [ ] Customer Portal: https://docs.lemonsqueezy.com/features/customer-portal

## Contacts

- [ ] Lemon Squeezy Support: support@lemonsqueezy.com
- [ ] Your Support Email: sales@teralearn.ai (or custom)
- [ ] Error Logging: Ensure error logs captured and monitored
