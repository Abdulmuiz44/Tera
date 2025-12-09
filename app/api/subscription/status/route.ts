import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('users')
      .select('subscription_plan, subscription_status, subscription_renewal_date, subscription_cancelled_at')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to fetch subscription status:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscription status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      plan: data?.subscription_plan || 'free',
      status: data?.subscription_status,
      renewalDate: data?.subscription_renewal_date,
      cancelledAt: data?.subscription_cancelled_at
    })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
