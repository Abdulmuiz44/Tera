import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import { isAdminUser } from '@/lib/admin'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin access
    if (!isAdminUser(session.user.email)) {
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
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // ===== USER METRICS =====
  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  // New users today
  const { count: newUsersToday } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart)

  // New users this week
  const { count: newUsersWeek } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

  // New users this month
  const { count: newUsersMonth } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo)

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
    if (plans.hasOwnProperty(plan)) {
      plans[plan as keyof typeof plans]++
    }
  })

  // ===== CHAT SESSION METRICS =====
  // Total chat sessions
  const { count: totalChatSessions } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })

  // Chat sessions today
  const { count: chatsToday } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', todayStart)

  // Chat sessions this week
  const { count: chatsThisWeek } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo)

  // Active users today (users who had chats today)
  const { data: activeUsersData } = await supabase
    .from('chat_sessions')
    .select('user_id')
    .gte('created_at', todayStart)
  const activeUsersToday = new Set(activeUsersData?.map((c: any) => c.user_id) || []).size

  // Active users this week
  const { data: weeklyActiveData } = await supabase
    .from('chat_sessions')
    .select('user_id')
    .gte('created_at', sevenDaysAgo)
  const activeUsersWeek = new Set(weeklyActiveData?.map((c: any) => c.user_id) || []).size

  // ===== WEB SEARCH METRICS =====
  // Total web searches (sum of monthly_web_searches column)
  const { data: webSearchData } = await supabase
    .from('users')
    .select('monthly_web_searches')
  const totalWebSearches = webSearchData?.reduce((sum: number, u: any) => sum + (u.monthly_web_searches || 0), 0) || 0

  // ===== DAILY ACTIVITY CHART DATA (Last 7 days) =====
  const dailyActivity = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

    const { count: dayChats } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dayStart.toISOString())
      .lt('created_at', dayEnd.toISOString())

    const { count: dayUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dayStart.toISOString())
      .lt('created_at', dayEnd.toISOString())

    dailyActivity.push({
      date: dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      chats: dayChats || 0,
      newUsers: dayUsers || 0
    })
  }

  // ===== TOP ACTIVE USERS =====
  const { data: topUsersData } = await supabase
    .from('chat_sessions')
    .select('user_id')
    .gte('created_at', sevenDaysAgo)

  const userChatCount: Record<string, number> = {}
  topUsersData?.forEach((chat: any) => {
    if (chat.user_id) {
      userChatCount[chat.user_id] = (userChatCount[chat.user_id] || 0) + 1
    }
  })

  // Get top 10 users by chat count
  const topUserIds = Object.entries(userChatCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id)

  const { data: topUsersInfo } = await supabase
    .from('users')
    .select('id, email, subscription_plan, created_at')
    .in('id', topUserIds.length > 0 ? topUserIds : ['none'])

  const topActiveUsers = topUsersInfo?.map((user: any) => ({
    ...user,
    chatCount: userChatCount[user.id] || 0
  })).sort((a: any, b: any) => b.chatCount - a.chatCount) || []

  // ===== RECENT SIGNUPS =====
  const { data: recentSignups } = await supabase
    .from('users')
    .select('id, email, subscription_plan, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  // Users who upgraded after hitting limit
  const { data: upgradedAfterLimit } = await supabase
    .from('users')
    .select('id, email, subscription_plan, limit_hit_chat_at, limit_hit_upload_at, created_at')
    .neq('subscription_plan', 'free')
    .or('limit_hit_chat_at.not.is.null, limit_hit_upload_at.not.is.null')

  // Users still locked out
  const { data: lockedOutUsers } = await supabase
    .from('users')
    .select('id, email, subscription_plan, limit_hit_chat_at, limit_hit_upload_at')
    .or(`limit_hit_chat_at.gt.${oneDayAgo}, limit_hit_upload_at.gt.${oneDayAgo}`)

  // Recent limit hits (last 7 days)
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

  // Average chats per user
  const avgChatsPerUser = totalUsers && totalUsers > 0 ? Math.round((totalChatSessions || 0) / totalUsers) : 0

  return {
    summary: {
      totalUsers: totalUsers || 0,
      newUsersToday: newUsersToday || 0,
      newUsersWeek: newUsersWeek || 0,
      newUsersMonth: newUsersMonth || 0,
      activeUsersToday: activeUsersToday || 0,
      activeUsersWeek: activeUsersWeek || 0,
      totalChatSessions: totalChatSessions || 0,
      chatsToday: chatsToday || 0,
      chatsThisWeek: chatsThisWeek || 0,
      totalWebSearches: totalWebSearches || 0,
      avgChatsPerUser,
      chatLimitHits: chatLimitHits || 0,
      uploadLimitHits: uploadLimitHits || 0,
      lockedOutUsers: (lockedOutUsers || []).length,
      upgradeRate: parseFloat(upgradeRate),
      upgradedAfterLimit: upgradedCount,
    },
    subscriptionBreakdown: plans,
    dailyActivity,
    topActiveUsers: topActiveUsers.slice(0, 10),
    recentSignups: recentSignups || [],
    lockedOutUsers: (lockedOutUsers || []).slice(0, 20),
    recentLimitHits: recentLimitHits || [],
    upgradeConversions: upgradedAfterLimit || [],
  }
}
