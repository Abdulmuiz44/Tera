# Payment Integration Summary

## Overview

The Tera platform now has complete Lemon Squeezy payment integration, supporting:
- Monthly subscription billing
- Multi-tier pricing (Free, Pro, School)
- Automated webhook handling
- Subscription lifecycle management
- Limit enforcement per subscription tier

## Files Added

### Core Integration Files

1. **lib/lemon-squeezy.ts**
   - Lemon Squeezy API utilities
   - Webhook signature verification
   - Checkout URL generation
   - Variant to plan mapping

2. **app/api/webhooks/lemon-squeezy/route.ts**
   - Webhook handler for 5 event types:
     - `order_completed` - Initial purchase
     - `subscription_created` - Subscription activated
     - `subscription_updated` - Renewal or status change
     - `subscription_cancelled` - User cancellation
     - `subscription_expired` - Subscription ended
   - User database updates based on events

3. **app/api/checkout/create-session/route.ts**
   - Creates Lemon Squeezy checkout URLs
   - Accepts plan type, email, user ID
   - Returns checkout URL for redirect

4. **app/api/subscription/status/route.ts**
   - Gets current user subscription status
   - Returns plan, status, renewal date
   - Used by pricing page and profile

### Updated Files

1. **app/pricing/page.tsx**
   - Added user authentication check
   - Added checkout flow for Pro plan
   - Contact sales flow for School plan
   - Real-time subscription status display
   - Loading states during checkout

2. **lib/plan-config.ts**
   - Added `webSearchesPerMonth` limits
   - Added `canPerformWebSearch()` helper
   - Updated plan features descriptions
   - School plan: 80 web searches/month

3. **lib/web-search-usage.ts**
   - Updated to use plan-based limits
   - Support for free (3), pro (50), school (80) searches
   - Returns plan info with usage status

4. **app/actions/generate.ts**
   - Web search limit checking before generation
   - Throws limit error if user exceeds monthly quota
   - Frontend catches and shows upgrade modal

5. **.env.example**
   - Added Lemon Squeezy configuration
   - Added web search configuration
   - Added application URL configuration

### Documentation Files

1. **LEMON_SQUEEZY_SETUP.md**
   - Step-by-step setup instructions
   - Environment variable configuration
   - Webhook setup guide
   - Testing instructions with ngrok
   - Troubleshooting guide

2. **PAYMENT_FLOW.md**
   - Complete user journeys
   - API flow diagrams
   - Database schema details
   - Webhook event flow
   - Error handling strategies
   - Testing checklist

3. **LEMON_SQUEEZY_CHECKLIST.md**
   - Pre-setup requirements
   - Step-by-step checklist
   - Testing procedures
   - Production deployment guide
   - Monitoring instructions

4. **PAYMENT_INTEGRATION_SUMMARY.md** (this file)
   - Overview of all components
   - Architecture summary

### Database Migration

**lib/migrations/add-lemon-squeezy-fields.sql**
```sql
Adds 7 new columns to users table:
- lemon_squeezy_customer_id (TEXT, UNIQUE)
- lemon_squeezy_subscription_id (TEXT)
- lemon_squeezy_order_id (TEXT)
- subscription_status (TEXT)
- subscription_renewal_date (TIMESTAMP)
- subscription_cancelled_at (TIMESTAMP)
- subscription_updated_at (TIMESTAMP)

Adds indexes for performance.
```

## Data Flow

### Checkout Flow
```
User → Pricing Page → Click "Upgrade to Pro"
  ↓
Frontend calls POST /api/checkout/create-session
  ↓
Backend generates Lemon Squeezy checkout URL
  ↓
User redirected to Lemon Squeezy checkout
  ↓
User enters payment info and completes purchase
  ↓
Lemon Squeezy redirects user to /profile
  ↓
Webhook processes order_completed event
  ↓
User subscription updated in database
  ↓
User can now use Pro limits (50 web searches, etc.)
```

### Subscription Management Flow
```
Lemon Squeezy → Webhook Event → /api/webhooks/lemon-squeezy
  ↓
Verify signature
  ↓
Parse event data and user_id
  ↓
Update users table with:
  - subscription_plan
  - subscription_status
  - renewal_date
  - customer_id
  - subscription_id
  ↓
Next API call checks new limits
  ↓
Limits enforced via plan-config
```

## Configuration Required

### Environment Variables
```env
# Lemon Squeezy
LEMON_SQUEEZY_WEBHOOK_SECRET=xxxx
LEMON_SQUEEZY_PRO_VARIANT_ID=xxxx
LEMON_SQUEEZY_SCHOOL_VARIANT_ID=xxxx

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Database Migration
Run the SQL migration to add subscription tracking fields.

### Lemon Squeezy Setup
1. Create Pro and School products
2. Get variant IDs
3. Create webhook pointing to `/api/webhooks/lemon-squeezy`
4. Get webhook secret

## Subscription Tiers

### Free Plan
- **Cost**: Free
- **Web Searches**: 3/month
- **Lesson Plans**: 5/month
- **Chats**: 10/day
- **File Uploads**: 5/day
- **Max File Size**: 25MB
- **Duration**: Unlimited (no renewal)

### Pro Plan ($5/month)
- **Cost**: $5/month (recurring)
- **Web Searches**: 50/month
- **Lesson Plans**: Unlimited
- **Chats**: Unlimited
- **File Uploads**: Unlimited
- **Max File Size**: 100MB
- **Duration**: Monthly billing

### School Plan ($20/month per user)
- **Cost**: $20/month per user (recurring)
- **Web Searches**: 80/month
- **Lesson Plans**: Unlimited
- **Chats**: Unlimited
- **File Uploads**: Unlimited
- **Max File Size**: 500MB
- **Admin Dashboard**: Yes
- **Analytics**: Yes
- **Duration**: Monthly billing

## Limit Enforcement

### When User Hits Limit

#### Web Search (Most Common)
1. User clicks "+" in text area
2. Sees "Web Search ON (0 remaining)"
3. Button shows "Limit reached" in red
4. Clicking shows upgrade prompt
5. User clicks "View Plans"
6. Redirected to /pricing
7. Can upgrade to Pro (50) or School (80)

#### During Generation
1. User enables web search (has searches left)
2. User sends message
3. Backend checks remaining searches
4. If none left, throws "limit web-search" error
5. Frontend shows web-search upgrade modal
6. User can upgrade or continue without search

### Limit Checking Code
```typescript
// In app/actions/generate.ts
if (enableWebSearch) {
  const { remaining } = await getWebSearchRemaining(authorId)
  if (remaining <= 0) {
    throw new Error('limit web-search')
  }
}

// In PromptShell.tsx
if (message.includes('limit') && message.includes('web-search')) {
  setUpgradePromptType('web-search')
}
```

## Webhook Events Handled

### order_completed
- Triggered on first payment
- Sets `subscription_plan` to 'pro' or 'school'
- Records customer and order IDs
- Sets status to 'active'

### subscription_created
- Triggered when recurring subscription starts
- Stores subscription ID
- Sets renewal date
- Sets status to 'active'

### subscription_updated
- Triggered on renewal or status change
- Updates renewal date
- Updates subscription status
- Records update timestamp

### subscription_cancelled
- Triggered when user cancels
- Downgrades to 'free' plan
- Records cancellation timestamp
- Sets status to 'cancelled'

### subscription_expired
- Triggered after all renewals complete
- Downgrades to 'free' plan
- Sets status to 'expired'

## Testing

### Development Testing
1. Enable Lemon Squeezy test mode
2. Use test variant IDs
3. Use test webhook secret
4. Test with test payment method

### Production Testing
1. Make small purchase ($0.01-$1)
2. Verify webhook received
3. Check user upgraded in database
4. Verify limits applied
5. Refund the test charge

### Monitoring
- Lemon Squeezy webhook logs
- Server application logs
- Database records updated
- User limit enforcement

## Integration Points

### Frontend
- `/pricing` page - Checkout flow
- `/profile` page - Subscription status display
- `PromptShell` component - Web search limit UI
- `UpgradePrompt` component - Upgrade modals

### Backend
- `POST /api/checkout/create-session` - Checkout URLs
- `POST /api/subscription/status` - Current subscription
- `POST /api/webhooks/lemon-squeezy` - Webhook handler
- `POST /api/search/web` - Web search with limit checking
- `generate` action - Plan limit enforcement

### Database
- `users.subscription_plan` - Current plan
- `users.subscription_status` - Active/cancelled/expired
- `users.subscription_renewal_date` - Next renewal
- `users.lemon_squeezy_*` - Lemon Squeezy references

## Revenue Model

### Monthly Recurring Revenue (MRR)
```
MRR = (Pro subscribers × $5) + (School subscribers × $20)
```

### Example
- 100 Pro subscribers = $500/month
- 50 School subscribers = $1,000/month
- Total MRR = $1,500/month
- Annual = $18,000

### Metrics to Track
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)
- Churn Rate
- Expansion Revenue (free → pro upgrades)
- Retention Rate

## Support & Maintenance

### Monitoring Checklist
- [ ] Webhook delivery logs reviewed daily
- [ ] Failed webhooks resolved
- [ ] Payment processing latency monitored
- [ ] Customer support queue checked
- [ ] Revenue dashboard reviewed weekly

### Common Issues
1. **Webhook not processing** - Verify secret and URL
2. **Checkout fails** - Check variant IDs
3. **User limits not updated** - Run database migration
4. **Payment declined** - Contact Lemon Squeezy support

## Next Steps

1. Create Lemon Squeezy account
2. Follow LEMON_SQUEEZY_SETUP.md
3. Use LEMON_SQUEEZY_CHECKLIST.md for implementation
4. Refer to PAYMENT_FLOW.md for detailed flows
5. Test thoroughly using checklist
6. Deploy to production
7. Monitor webhook logs and revenue
