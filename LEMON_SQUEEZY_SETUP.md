# Lemon Squeezy Integration Setup

This guide explains how to set up the Lemon Squeezy payment integration for Tera.

## Prerequisites

1. Create a [Lemon Squeezy](https://www.lemonsqueezy.com) account
2. Set up your products and variants for the subscription plans
3. Get your API credentials

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Lemon Squeezy Configuration
LEMON_SQUEEZY_WEBHOOK_SECRET=<your_webhook_secret>
LEMON_SQUEEZY_PRO_VARIANT_ID=<pro_plan_variant_id>
LEMON_SQUEEZY_SCHOOL_VARIANT_ID=<school_plan_variant_id>
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change in production
```

## Setting Up Products and Variants in Lemon Squeezy

### 1. Pro Plan Product
- **Name**: Tera Pro Plan
- **Price**: $5/month (recurring)
- **Description**: Unlimited lesson plans, unlimited chats, 50 web searches/month
- **Note the Variant ID** - use this for `LEMON_SQUEEZY_PRO_VARIANT_ID`

### 2. School Plan Product
- **Name**: Tera School Plan
- **Price**: $20/month per user (recurring)
- **Description**: Unlimited everything, admin dashboard, analytics
- **Note the Variant ID** - use this for `LEMON_SQUEEZY_SCHOOL_VARIANT_ID`

## Setting Up Webhooks

1. Go to Lemon Squeezy Dashboard → Settings → Webhooks
2. Create a new webhook with the following URL:
   ```
   https://your-domain.com/api/webhooks/lemon-squeezy
   ```
3. Select the following events:
   - `order_completed`
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
4. Copy the Webhook Secret and add it to your `.env.local` as `LEMON_SQUEEZY_WEBHOOK_SECRET`

## Database Migration

Run the migration to add Lemon Squeezy fields:

```sql
-- Run the contents of lib/migrations/add-lemon-squeezy-fields.sql
-- Or use your Supabase dashboard to run the SQL query
```

Fields added:
- `lemon_squeezy_customer_id` - Reference to Lemon Squeezy customer
- `lemon_squeezy_subscription_id` - Reference to active subscription
- `lemon_squeezy_order_id` - Reference to purchase order
- `subscription_status` - Current status (active, cancelled, expired, etc.)
- `subscription_renewal_date` - When subscription renews
- `subscription_cancelled_at` - When subscription was cancelled
- `subscription_updated_at` - Last update timestamp

## Checkout Flow

### Pro Plan
1. User clicks "Upgrade to Pro" on pricing page
2. User is redirected to Lemon Squeezy checkout
3. After payment, webhook updates user's subscription in database
4. User is redirected back to profile page

### School Plan
1. User clicks "Contact Sales"
2. User is directed to email sales@teralearn.ai
3. Sales team handles the subscription setup

## Webhook Events

### order_completed
- Triggered when a one-time purchase or first payment is made
- Updates user's subscription plan and customer ID

### subscription_created
- Triggered when a subscription is created
- Sets up subscription tracking with renewal date

### subscription_updated
- Triggered when subscription details change (payment method, status, etc.)
- Updates subscription status and renewal date

### subscription_cancelled
- Triggered when subscription is cancelled
- Downgrades user to free plan
- Records cancellation timestamp

### subscription_expired
- Triggered when subscription ends after all renewals
- Downgrades user to free plan

## Testing Webhooks Locally

To test webhooks locally, you can use:

1. **Lemon Squeezy Test Mode** - Enable test mode in Lemon Squeezy dashboard
2. **ngrok** - Expose your local server:
   ```bash
   ngrok http 3000
   ```
3. Update the webhook URL in Lemon Squeezy to your ngrok URL

## API Endpoints

### POST /api/checkout/create-session
Creates a checkout session for a plan upgrade.

**Request:**
```json
{
  "plan": "pro",  // or "school"
  "email": "user@example.com",
  "userId": "user-id-from-supabase",
  "returnUrl": "https://yourdomain.com/profile"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.lemonsqueezy.com/..."
}
```

### POST /api/subscription/status
Gets the user's current subscription status.

**Request:**
```json
{
  "userId": "user-id-from-supabase"
}
```

**Response:**
```json
{
  "success": true,
  "plan": "pro",  // "free", "pro", or "school"
  "status": "active",  // "active", "cancelled", "expired", etc.
  "renewalDate": "2025-01-15T00:00:00Z",
  "cancelledAt": null
}
```

### POST /api/webhooks/lemon-squeezy
Receives webhook events from Lemon Squeezy (automatic).

## Customer Portal

Lemon Squeezy provides a customer portal for users to:
- Update payment method
- Cancel subscription
- View invoice history

The portal URL is provided in subscription webhook data.

## Pricing Tiers and Limits

### Free Plan
- 3 web searches/month
- 5 lesson plans/month
- 10 chats/day
- 5 file uploads/day
- 25MB max file size

### Pro Plan
- 50 web searches/month
- Unlimited lesson plans
- Unlimited chats
- Unlimited file uploads
- 100MB max file size per file

### School Plan
- 80 web searches/month
- Unlimited lesson plans
- Unlimited chats
- Unlimited file uploads
- 500MB max file size per file
- Admin dashboard
- Analytics

## Troubleshooting

### Webhook not processing
- Check webhook signature in logs
- Verify `LEMON_SQUEEZY_WEBHOOK_SECRET` is correct
- Check Lemon Squeezy webhook delivery logs

### Checkout not opening
- Verify variant IDs are correct
- Check `LEMON_SQUEEZY_PRO_VARIANT_ID` and `LEMON_SQUEEZY_SCHOOL_VARIANT_ID`
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### Subscription not updating
- Check user ID is being passed correctly
- Verify database fields exist (run migration)
- Check subscription webhook events in Lemon Squeezy logs

## Production Deployment

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Update webhook URL in Lemon Squeezy to production domain
3. Disable test mode in Lemon Squeezy
4. Test a real subscription purchase
5. Monitor webhook logs for any issues
