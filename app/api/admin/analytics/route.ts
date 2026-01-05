import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminUser } from '@/lib/admin'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Get user ID from header
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin access by checking user's email from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()
    
    if (userError || !user || !isAdminUser(user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get analytics data
    const analytics = await getAnalyticsData()
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

async function getAnalyticsData() {
  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // Users who hit chat limit
  const { count: chatLimitHits } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .not('limit_hit_chat_at', 'is', null)

  // Users who hit upload limit
  const { count: uploadLimitHits } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .not('limit_hit_upload_at', 'is', null)

  // Subscription breakdown
  const { data: subscriptionBreakdown } = await supabase
    .from('users')
    .select('subscription_plan')

  const plans = { free: 0, pro: 0, plus: 0, school: 0 }
  subscriptionBreakdown?.forEach((user: any) => {
    const plan = user.subscription_plan || 'free'
    plans[plan as keyof typeof plans]++
  })

  // Users who upgraded after hitting limit
  const { data: upgradedAfterLimit } = await supabase
    .from('users')
    .select('id, email, subscription_plan, limit_hit_chat_at, limit_hit_upload_at, created_at')
    .neq('subscription_plan', 'free')
    .or('limit_hit_chat_at.not.is.null, limit_hit_upload_at.not.is.null')

  // Users still locked out
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const { data: lockedOutUsers } = await supabase
    .from('users')
    .select('id, email, subscription_plan, limit_hit_chat_at, limit_hit_upload_at')
    .or(`limit_hit_chat_at.gt.${oneDayAgo}, limit_hit_upload_at.gt.${oneDayAgo}`)

  // Recent limit hits (last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentLimitHits } = await supabase
    .from('users')
    .select('id, email, subscription_plan, limit_hit_chat_at, limit_hit_upload_at, created_at')
    .or(`limit_hit_chat_at.gte.${sevenDaysAgo}, limit_hit_upload_at.gte.${sevenDaysAgo}`)
    .order('created_at', { ascending: false })
    .limit(50)

  // Upgrade rate calculation
  const upgradedCount = (upgradedAfterLimit || []).length
  const totalLimitHits = (chatLimitHits || 0) + (uploadLimitHits || 0)
  const upgradeRate = totalLimitHits > 0 ? ((upgradedCount / totalLimitHits) * 100).toFixed(2) : '0.00'

  return {
    summary: {
      totalUsers: totalUsers || 0,
      chatLimitHits: chatLimitHits || 0,
      uploadLimitHits: uploadLimitHits || 0,
      lockedOutUsers: (lockedOutUsers || []).length,
      upgradeRate: parseFloat(upgradeRate),
      upgradedAfterLimit: upgradedCount,
    },
    subscriptionBreakdown: plans,
    lockedOutUsers: (lockedOutUsers || []).slice(0, 20),
    recentLimitHits: recentLimitHits || [],
    upgradeConversions: upgradedAfterLimit || [],
  }
}
