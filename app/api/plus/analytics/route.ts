import { supabaseServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Verify user is Plus plan
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('subscription_plan')
      .eq('id', userId)
      .single()

    if (userError || user?.subscription_plan !== 'plus') {
      return NextResponse.json({ error: 'Unauthorized - Plus plan required' }, { status: 403 })
    }

    // Get chat sessions for analytics
    const { data: chats } = await supabaseServer
      .from('chat_sessions')
      .select('tool, created_at')
      .eq('user_id', userId)

    // Get file uploads
    const { data: uploads } = await supabaseServer
      .from('file_uploads')
      .select('created_at')
      .eq('user_id', userId)

    // Calculate stats
    const totalChats = chats?.length || 0
    const totalUploads = uploads?.length || 0

    // Group chats by tool
    const chatsByTool: { [key: string]: number } = {}
    chats?.forEach((chat: any) => {
      const tool = chat.tool || 'Universal'
      chatsByTool[tool] = (chatsByTool[tool] || 0) + 1
    })

    const mostUsedTool = Object.entries(chatsByTool).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Universal'

    // Calculate daily activity (last 7 days)
    const dailyActivity: { date: string; chats: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const count = chats?.filter((c: any) => 
        c.created_at?.startsWith(dateStr)
      ).length || 0

      dailyActivity.push({
        date: dateStr,
        chats: count
      })
    }

    // Average response time (mock for now)
    const avgResponseTime = 2.5

    return NextResponse.json({
      totalChats,
      totalUploads,
      mostUsedTool,
      avgResponseTime,
      chatsByTool,
      dailyActivity
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
