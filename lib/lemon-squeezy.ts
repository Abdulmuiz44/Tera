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
 * Create a Lemon Squeezy checkout URL using the API
 */
export async function createCheckout(variantId: string, options: CheckoutOptions = {}): Promise<string> {
  try {
    const storeId = process.env.NEXT_PUBLIC_LEMON_STORE_ID
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY

    if (!storeId || !apiKey) {
      throw new Error('Missing Lemon Squeezy configuration: Store ID or API Key')
    }

    // Use Lemon Squeezy API to create checkout
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: options.email || '',
              custom: {
                user_id: options.userId || ''
              }
            },
            product_options: {
              redirect_url: options.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/new`
            }
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: storeId.toString()
              }
            },
            variant: {
              data: {
                type: 'variants',
                id: variantId.toString()
              }
            }
          }
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Lemon Squeezy API error:', error)
      throw new Error(`Failed to create checkout: ${response.status}`)
    }

    const data = await response.json()
    const checkoutUrl = data.data?.attributes?.url

    if (!checkoutUrl) {
      throw new Error('No checkout URL returned from Lemon Squeezy API')
    }

    return checkoutUrl
  } catch (error) {
    console.error('Checkout creation failed:', error)
    throw error
  }
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
  returnUrl?: string,
  currencyCode?: string
): Promise<string> {
  // Validate environment variables
  const storeId = process.env.NEXT_PUBLIC_LEMON_STORE_ID
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY
  
  if (!storeId) {
    throw new Error('NEXT_PUBLIC_LEMON_STORE_ID not configured')
  }
  if (!apiKey) {
    throw new Error('LEMON_SQUEEZY_API_KEY not configured')
  }

  const variantId = plan === 'pro'
    ? process.env.LEMON_SQUEEZY_PRO_VARIANT_ID
    : process.env.LEMON_SQUEEZY_PLUS_VARIANT_ID

  if (!variantId) {
    throw new Error(`LEMON_SQUEEZY_${plan.toUpperCase()}_VARIANT_ID not configured`)
  }

  return createCheckout(variantId, {
    email,
    userId,
    returnUrl
  })
}

/**
 * Get customer portal URL
 */
export async function getCustomerPortalUrl(customerId: string): Promise<string> {
  try {
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY
    if (!apiKey) throw new Error('Missing Lemon Squeezy API Key')

    // List 'customers' to find the one with this ID, referencing its 'link' to customer portal?
    // Actually, creating a signed URL is better. But simplest way per LS docs is:
    // GET https://api.lemonsqueezy.com/v1/customers/:id
    // response.data.attributes.urls.customer_portal

    const response = await fetch(`https://api.lemonsqueezy.com/v1/customers/${customerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch customer: ${response.status}`)
    }

    const data = await response.json()
    const portalUrl = data.data?.attributes?.urls?.customer_portal

    if (!portalUrl) {
      throw new Error('No customer portal URL returned')
    }

    return portalUrl
  } catch (error) {
    console.error('Failed to get customer portal URL:', error)
    throw error
  }
}
