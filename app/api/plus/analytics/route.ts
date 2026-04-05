import { supabaseServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('subscription_plan')
      .eq('id', userId)
      .single()

    if (userError || user?.subscription_plan !== 'plus') {
      return NextResponse.json({ error: 'Unauthorized - Plus plan required' }, { status: 403 })
    }

    const { data: chats } = await supabaseServer
      .from('chat_sessions')
      .select('tool, created_at, attachments')
      .eq('user_id', userId)

    const totalChats = chats?.length || 0
    const totalUploads = chats?.reduce((sum: number, chat: any) => {
      if (Array.isArray(chat.attachments)) {
        return sum + chat.attachments.length
      }
      return sum
    }, 0) || 0

    const chatsByTool: { [key: string]: number } = {}
    chats?.forEach((chat: any) => {
      const tool = chat.tool || 'Universal'
      chatsByTool[tool] = (chatsByTool[tool] || 0) + 1
    })

    const mostUsedTool = Object.entries(chatsByTool).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Universal'

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
        chats: count,
      })
    }

    const avgResponseTime = 2.5

    return NextResponse.json({
      totalChats,
      totalUploads,
      mostUsedTool,
      avgResponseTime,
      chatsByTool,
      dailyActivity,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
