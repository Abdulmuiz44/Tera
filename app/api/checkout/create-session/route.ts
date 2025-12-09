import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutUrlForPlan } from '@/lib/lemon-squeezy'
import { convertPrice } from '@/lib/currency-converter'

export async function POST(request: NextRequest) {
  try {
    const { plan, email, userId, returnUrl, currencyCode } = await request.json()

    // Validate inputs
    if (!plan || !['pro', 'plus'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get checkout URL (Lemon Squeezy handles pricing in their dashboard)
    // We pass currency info for reference but LS manages actual pricing
    const checkoutUrl = await getCheckoutUrlForPlan(plan, email, userId, returnUrl, currencyCode)

    return NextResponse.json({
      success: true,
      checkoutUrl,
      currency: currencyCode
    })
  } catch (error) {
    console.error('Checkout creation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
