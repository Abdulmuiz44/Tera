# Payment Flow Documentation

This document describes the complete payment and subscription flow in Tera with Lemon Squeezy integration.

## Overview

Tera uses Lemon Squeezy for handling:
- Monthly subscription payments
- Plan upgrades
- Subscription cancellations
- Invoice management
- Customer portal access

## Subscription Plans

| Plan | Monthly Cost | Renewals | Web Searches | Lesson Plans | Chats | File Uploads | Max File Size |
|------|--------------|----------|--------------|--------------|-------|--------------|---------------|
| Free | $0 | N/A | 3 | 5 | 10/day | 5/day | 25MB |
| Pro | $5 | Monthly | 50 | Unlimited | Unlimited | Unlimited | 100MB |
| School | $20/user | Monthly | 80 | Unlimited | Unlimited | Unlimited | 500MB |

## User Journey

### 1. Free User to Pro Upgrade

```
User is on Free Plan
        ↓
Clicks "Upgrade to Pro" on /pricing page
        ↓
Redirected to Lemon Squeezy Checkout
(email & user ID pre-filled)
        ↓
User completes payment
        ↓
Lemon Squeezy sends order_completed webhook
        ↓
Server updates user:
- subscription_plan = 'pro'
- lemon_squeezy_customer_id
- lemon_squeezy_order_id
- subscription_status = 'active'
        ↓
User redirected to /profile
(now shows Pro plan with higher limits)
```

### 2. Subscription Renewal

```
Subscription renewal date approaches
        ↓
Lemon Squeezy automatically charges card
        ↓
If successful:
  Webhook: subscription_updated
  Server updates renewal_date
  User continues with active subscription
        ↓
If payment fails:
  Subscription marked as past_due
  User can update payment method in customer portal
```

### 3. Subscription Cancellation

```
User cancels subscription
(via Lemon Squeezy customer portal)
        ↓
Lemon Squeezy sends subscription_cancelled webhook
        ↓
Server:
- Sets subscription_plan = 'free'
- Sets subscription_status = 'cancelled'
- Records subscription_cancelled_at
        ↓
User is downgraded to Free plan limits
- Can still access account
- Web searches capped at 3/month
- Lesson plans capped at 5/month
```

## API Flow Detailed

### Checkout Flow (Frontend)

```typescript
// User clicks upgrade button
const handleCheckout = async (plan: 'pro' | 'school') => {
  // 1. Call backend to create checkout session
  const response = await fetch('/api/checkout/create-session', {
    method: 'POST',
    body: JSON.stringify({
      plan: 'pro',
      email: user.email,
      userId: user.id,
      returnUrl: '/profile'
    })
  })

  // 2. Receive checkout URL
  const { checkoutUrl } = await response.json()

  // 3. Redirect to Lemon Squeezy
  window.location.href = checkoutUrl
}
```

### Checkout API (Backend)

```
POST /api/checkout/create-session

Input:
{
  plan: 'pro' | 'school',
  email: string,
  userId: string,
  returnUrl?: string
}

Process:
1. Validate plan type
2. Get variant ID from environment
3. Build checkout URL with:
   - Variant ID
   - Pre-filled email
   - Custom data (user_id)
   - Return URL

Output:
{
  success: true,
  checkoutUrl: 'https://checkout.lemonsqueezy.com/...'
}

User is redirected to external Lemon Squeezy checkout
```

### Webhook Flow (Backend)

```
Lemon Squeezy → /api/webhooks/lemon-squeezy

1. Verify webhook signature
2. Parse event type
3. Handle based on type:

order_completed:
  - Extract user_id from custom_data
  - Get plan type from variant_id
  - Update users table:
    - subscription_plan
    - lemon_squeezy_customer_id
    - lemon_squeezy_order_id
    - subscription_updated_at

subscription_created:
  - Store subscription ID
  - Store customer ID
  - Store renewal date
  - Set status to 'active'

subscription_updated:
  - Update renewal date
  - Update payment status
  - Update subscription_updated_at

subscription_cancelled:
  - Set plan to 'free'
  - Set status to 'cancelled'
  - Record cancellation timestamp

subscription_expired:
  - Set plan to 'free'
  - Set status to 'expired'
```

## Subscription Status States

```
Active
  ↓ (Renewal date passes)
  ↓ (Payment successful)
Active (renewed)

Active
  ↓ (Payment fails)
Past Due
  ↓ (Customer updates payment)
Active

Active
  ↓ (Customer cancels)
Cancelled → (Remains inactive)

Active
  ↓ (All renewals expire)
Expired → (Returns to Free)

Active
  ↓ (Customer manual downgrade)
Paused
```

## Limit Enforcement During Subscription

### When User Reaches Limit

1. **Web Search Limit** (most common case)
   - User clicks web search option
   - System checks monthly count
   - If count >= limit:
     - Disable web search button
     - Show upgrade prompt
     - User clicks "Upgrade to Pro"
     - Redirected to checkout

2. **During API Call**
   - User tries to send prompt with web search enabled
   - `generateAnswer` checks remaining searches
   - If remaining <= 0:
     - Throws limit error
     - Frontend catches and shows upgrade modal
     - User clicks upgrade button

## Database Schema

### Users Table Subscription Fields

```sql
-- Subscription tracking
subscription_plan       TEXT         DEFAULT 'free'
subscription_status     TEXT         DEFAULT 'active'
subscription_renewal_date   TIMESTAMP
subscription_cancelled_at   TIMESTAMP
subscription_updated_at     TIMESTAMP

-- Lemon Squeezy references
lemon_squeezy_customer_id       TEXT UNIQUE
lemon_squeezy_subscription_id   TEXT
lemon_squeezy_order_id          TEXT
```

### Webhook Data Flow

```
Lemon Squeezy Event
  ↓
Extract meta.event_name
  ↓
Extract data.attributes:
  - customer_id
  - subscription_id
  - variant_id
  - status
  - renews_at
  - custom_data.user_id
  ↓
Update users table
```

## Error Handling

### Webhook Errors

```
Invalid Signature
  → 401 Unauthorized
  → Webhook not processed
  → Log for investigation

Unknown Event Type
  → 200 OK (acknowledge receipt)
  → Log warning
  → No action taken

Missing user_id
  → 200 OK (acknowledge receipt)
  → Log warning
  → Webhook not processed (can't identify user)

Database Error
  → 500 Internal Server Error
  → Webhook may be retried
  → Log full error for debugging
```

### Checkout Errors

```
Invalid Plan
  → 400 Bad Request
  → Clear error message
  → User stays on pricing page

Missing Environment Variables
  → 500 Server Error
  → Clear error message
  → User sees "Contact support"

API Rate Limit
  → 429 Too Many Requests
  → User shown "Please wait"
  → Automatic retry after delay
```

## Testing Checklist

### Before Production

- [ ] Lemon Squeezy test mode enabled
- [ ] Webhook secret configured correctly
- [ ] Variant IDs verified
- [ ] Database migration run
- [ ] All environment variables set
- [ ] Checkout flow tested end-to-end
- [ ] Webhook delivery tested with test event
- [ ] Subscription status API working
- [ ] Limit enforcement working
- [ ] Downgrade after cancellation working

### Production Deployment

1. Create products in Lemon Squeezy (production mode)
2. Get variant IDs from production products
3. Create webhook in production account
4. Update environment variables:
   - `LEMON_SQUEEZY_WEBHOOK_SECRET`
   - `LEMON_SQUEEZY_PRO_VARIANT_ID`
   - `LEMON_SQUEEZY_SCHOOL_VARIANT_ID`
   - `NEXT_PUBLIC_APP_URL` (set to production domain)
5. Run database migration in production
6. Test with real payment (refund immediately for testing)
7. Monitor webhook logs for 24 hours

## Revenue Tracking

Lemon Squeezy provides:
- Revenue dashboard
- Customer analytics
- Subscription metrics
- Churn rate
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)

Access these via Lemon Squeezy dashboard.

## Customer Portal

Lemon Squeezy provides a customer portal where users can:
- Update payment method
- View invoices
- Cancel subscription
- Update billing address
- View subscription status

Portal URL is provided in webhook data:
```
attributes.urls.customer_portal
```

Can be displayed in user profile or sent via email.

## Cancellation & Refunds

### Cancellation
- User cancels via Lemon Squeezy portal
- Webhook updates status to 'cancelled'
- User downgraded to Free plan immediately
- Can re-upgrade anytime

### Refunds
- Handled through Lemon Squeezy dashboard
- Refund webhook triggers subscription update
- User not automatically downgraded (can be manual)

### Expired Subscriptions
- After cancellation, subscription stays active until renewal date
- On renewal date, system marks as 'expired'
- User downgraded to Free plan
- Can re-subscribe anytime
