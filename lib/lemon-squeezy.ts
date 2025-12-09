/**
 * Lemon Squeezy API Integration
 * Handles payment processing, subscription management, and webhooks
 */

export interface LemonSqueezyCheckoutData {
  email?: string
  custom?: {
    user_id?: string
  }
}

export interface LemonSqueezyWebhookData {
  id: string
  type: string
  attributes: {
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    refunded: boolean
    failed: boolean
    product_id: number
    variant_id: number
    customer_id: number
    subscription_id?: number
    order_number: string
    user_name: string
    user_email: string
    created_at: string
    updated_at: string
    test_mode: boolean
    custom_data?: {
      user_id?: string
    }
  }
}

export interface LemonSqueezySubscriptionWebhook {
  id: string
  type: string
  attributes: {
    store_id: number
    customer_id: number
    order_id: number
    product_id: number
    variant_id: number
    product_name: string
    variant_name: string
    user_name: string
    user_email: string
    status: 'on_trial' | 'active' | 'paused' | 'past_due' | 'unpaid' | 'cancelled' | 'expired'
    status_formatted: string
    card_brand: string
    card_last_four: string
    pause_at: string | null
    cancelled_at: string | null
    trial_ends_at: string | null
    billing_anchor: number
    urls: {
      update_payment_method: string
      customer_portal: string
    }
    renews_at: string
    ends_at: string | null
    created_at: string
    updated_at: string
    test_mode: boolean
    custom_data?: {
      user_id?: string
    }
  }
}

interface CheckoutOptions {
  email?: string
  userId?: string
  returnUrl?: string
}

/**
 * Create a Lemon Squeezy checkout URL
 */
export async function createCheckout(variantId: string, options: CheckoutOptions = {}): Promise<string> {
  const baseUrl = 'https://checkout.lemonsqueezy.com/checkout/buy'
  
  const params = new URLSearchParams({
    checkout_option_0_value_type: 'license_key',
    checkout_option_1_key: 'email_address',
    checkout_option_1_value: options.email || '',
    checkout_data_custom_user_id: options.userId || '',
    checkout_return_url: options.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/new`
  })

  return `${baseUrl}/${variantId}?${params.toString()}`
}

/**
 * Verify Lemon Squeezy webhook signature
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    console.error('LEMON_SQUEEZY_WEBHOOK_SECRET not configured')
    return false
  }

  try {
    const crypto = require('crypto')
    const hash = crypto
      .createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    return hash === signature
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}

/**
 * Map Lemon Squeezy variant ID to plan type
 */
export function mapVariantToPlan(variantId: string): 'pro' | 'plus' | null {
  const proVariantId = process.env.LEMON_SQUEEZY_PRO_VARIANT_ID
  const plusVariantId = process.env.LEMON_SQUEEZY_PLUS_VARIANT_ID

  if (variantId === proVariantId) {
    return 'pro'
  } else if (variantId === plusVariantId) {
    return 'plus'
  }

  return null
}

/**
 * Get checkout URL for a specific plan
 */
export async function getCheckoutUrlForPlan(
  plan: 'pro' | 'plus',
  email: string,
  userId: string,
  returnUrl?: string
): Promise<string> {
  const variantId = plan === 'pro'
    ? process.env.LEMON_SQUEEZY_PRO_VARIANT_ID
    : process.env.LEMON_SQUEEZY_PLUS_VARIANT_ID

  if (!variantId) {
    throw new Error(`Lemon Squeezy variant ID not configured for ${plan} plan`)
  }

  return createCheckout(variantId, {
    email,
    userId,
    returnUrl
  })
}
