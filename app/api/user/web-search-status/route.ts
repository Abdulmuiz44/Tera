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

    const { remaining, total, resetDate } = await getWebSearchRemaining(userId)

    return NextResponse.json({
      success: true,
      remaining,
      total,
      resetDate
    })
  } catch (error) {
    console.error('Error fetching web search status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch web search status' },
      { status: 500 }
    )
  }
}
