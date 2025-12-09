import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutUrlForPlan } from '@/lib/lemon-squeezy'

export async function POST(request: NextRequest) {
  try {
    const { plan, email, userId, returnUrl } = await request.json()

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

    // Get checkout URL
    const checkoutUrl = await getCheckoutUrlForPlan(plan, email, userId, returnUrl)

    return NextResponse.json({
      success: true,
      checkoutUrl
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
