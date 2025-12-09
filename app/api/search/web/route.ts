import { NextRequest, NextResponse } from 'next/server'
import { getWebSearchRemaining, incrementWebSearchCount, getWebSearchLimitMessage } from '@/lib/web-search-usage'

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5, userId } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    if (!process.env.SERPER_API_KEY) {
      console.warn('SERPER_API_KEY not configured')
      return NextResponse.json(
        {
          success: false,
          results: [],
          message: 'Web search not configured. Add SERPER_API_KEY to .env.local'
        }
      )
    }

    // Check usage limit if userId provided
    if (userId) {
      const { remaining, total, resetDate } = await getWebSearchRemaining(userId)
      
      if (remaining <= 0) {
        return NextResponse.json(
          {
            success: false,
            results: [],
            message: `Monthly web search limit reached (${total} searches). Resets on ${new Date(resetDate!).toLocaleDateString()}`,
            remaining,
            total,
            resetDate
          },
          { status: 429 }
        )
      }

      // Increment usage
      await incrementWebSearchCount(userId)
    }

    return await serperSearch(query, limit)
  } catch (error) {
    console.error('Web search error:', error)
    return NextResponse.json(
      { error: 'Web search failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

async function serperSearch(query: string, limit: number) {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY || '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: query,
      num: limit,
      gl: 'us',
      hl: 'en'
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Serper API error: ${response.statusText} - ${errorData.message || ''}`)
  }

  const data = await response.json()

  const results = (data.organic || []).map((result: any) => ({
    title: result.title,
    url: result.link,
    snippet: result.snippet,
    source: new URL(result.link).hostname
  }))

  return NextResponse.json({
    success: true,
    results,
    query
  })
}
