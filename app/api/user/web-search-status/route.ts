import { NextRequest, NextResponse } from 'next/server'
import { getWebSearchRemaining } from '@/lib/web-search-usage'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const { remaining, total, resetDate, plan } = await getWebSearchRemaining(userId)
    
    const resetDateObj = resetDate ? new Date(resetDate) : null
    const formattedResetDate = resetDateObj?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })

    const percentageUsed = total > 0 ? Math.round((( total - remaining) / total) * 100) : 0
    const isLow = remaining <= Math.ceil(total * 0.2) // Low if <= 20% remaining

    return NextResponse.json({
      success: true,
      remaining,
      total,
      resetDate,
      formattedResetDate,
      plan,
      percentageUsed,
      isLow,
      message: getStatusMessage(remaining, total, plan)
    })
  } catch (error) {
    console.error('❌ Error fetching web search status:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch web search status',
        remaining: 0,
        total: 0,
        plan: 'free'
      },
      { status: 500 }
    )
  }
}

function getStatusMessage(remaining: number, total: number, plan: string): string {
  if (remaining === 0) {
    return `🔍 Limit Reached (0/${total})`
  }
  
  if (remaining <= 2) {
    return `🔍 Last ${remaining} search(es) remaining`
  }

  return `🔍 Web Search (${remaining}/${total})`
}
