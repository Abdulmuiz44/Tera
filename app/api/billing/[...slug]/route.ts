import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutUrlForPlan, getCustomerPortalUrl } from '@/lib/lemon-squeezy'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params
    const action = slug[0]

    try {
        const body = await request.json()

        if (action === 'create-session') {
            const { plan, email, userId, returnUrl, currencyCode } = body
            if (!plan || !['pro', 'plus'].includes(plan) || !email || !userId) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
            }
            const checkoutUrl = await getCheckoutUrlForPlan(plan, email, userId, returnUrl, currencyCode)
            return NextResponse.json({ success: true, checkoutUrl, currency: currencyCode })
        }

        if (action === 'create-portal-session') {
            const { userId } = body
            if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

            // Get customer ID from database
            const { data: user, error } = await supabaseServer
                .from('users')
                .select('lemon_squeezy_customer_id')
                .eq('id', userId)
                .single()

            if (error || !user?.lemon_squeezy_customer_id) {
                return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
            }

            const portalUrl = await getCustomerPortalUrl(user.lemon_squeezy_customer_id)
            return NextResponse.json({ success: true, portalUrl })
        }

        if (action === 'status') {
            const { userId } = body
            if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
            const { data, error } = await supabaseServer
                .from('users')
                .select('subscription_plan, subscription_status, subscription_renewal_date, subscription_cancelled_at')
                .eq('id', userId)
                .single()
            if (error) throw error
            return NextResponse.json({
                success: true,
                plan: data?.subscription_plan || 'free',
                status: data?.subscription_status,
                renewalDate: data?.subscription_renewal_date,
                cancelledAt: data?.subscription_cancelled_at
            })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Billing API error (${action}):`, errorMessage)
        return NextResponse.json({ 
            error: 'Failed',
            details: errorMessage 
        }, { status: 500 })
    }
}
