import { NextRequest, NextResponse } from 'next/server'
import { getWebSearchRemaining, incrementWebSearchCount } from '@/lib/web-search-usage'

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, userId } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Trim query for better search results
    const trimmedQuery = query.trim().slice(0, 500)

    if (!process.env.SERPER_API_KEY) {
      console.error('❌ SERPER_API_KEY not configured in environment')
      return NextResponse.json(
        {
          success: false,
          results: [],
          message: 'Web search service not configured. Contact support.'
        },
        { status: 503 }
      )
    }

    // Check usage limit if userId provided
    if (userId) {
      try {
        const { remaining, total, resetDate, plan } = await getWebSearchRemaining(userId)
        
        console.log(`🔍 Web Search Check [${plan.toUpperCase()}]: ${remaining}/${total} remaining`)
        
        if (remaining <= 0) {
          const formattedResetDate = resetDate 
            ? new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'next month'
          
          console.warn(`⚠️ User ${userId} has reached monthly web search limit`)
          return NextResponse.json(
            {
              success: false,
              results: [],
              message: `🔍 Monthly search limit reached (${total} searches). Resets ${formattedResetDate}. Upgrade to Pro for 50 searches/month.`,
              remaining: 0,
              total,
              resetDate
            },
            { status: 429 }
          )
        }
      } catch (limitError) {
        console.error('⚠️ Error checking limits, allowing search:', limitError)
        // Don't block search if we can't check limits
      }
    }

    // Perform the actual search
    console.log(`🔍 Starting web search: "${trimmedQuery}"`)
    const searchResponse = await serperSearch(trimmedQuery, limit)
    
    // Parse response
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error(`❌ Serper API error: ${searchResponse.status} - ${errorText}`)
      
      if (searchResponse.status === 429) {
        return NextResponse.json(
          {
            success: false,
            results: [],
            message: 'Web search service temporarily rate limited. Try again in a moment.'
          },
          { status: 429 }
        )
      }
      
      if (searchResponse.status === 403) {
        return NextResponse.json(
          {
            success: false,
            results: [],
            message: 'Web search API key is invalid or expired.'
          },
          { status: 503 }
        )
      }

      throw new Error(`Serper API error: ${searchResponse.status}`)
    }

    const data = await searchResponse.json()
    
    if (!data.organic || data.organic.length === 0) {
      console.warn(`⚠️ No search results for query: "${trimmedQuery}"`)
      return NextResponse.json({
        success: true,
        results: [],
        query: trimmedQuery,
        message: 'No results found. Try a different search term.'
      })
    }

    // Format and filter results
    const results = data.organic
      .slice(0, limit)
      .map((result: any) => ({
        title: result.title || 'Untitled',
        url: result.link || '',
        snippet: result.snippet || result.description || '',
        source: result.source || new URL(result.link).hostname,
        date: result.date || null,
        favicon: result.favicon || null
      }))
      .filter(r => r.url && r.snippet) // Ensure we have content

    console.log(`✅ Search successful: ${results.length} results found`)

    // Increment usage counter if userId provided
    if (userId && results.length > 0) {
      try {
        await incrementWebSearchCount(userId)
        console.log(`📊 Search count incremented for user ${userId}`)
      } catch (countError) {
        console.warn('⚠️ Failed to increment search count:', countError)
        // Don't fail the search if we can't update the counter
      }
    }

    return NextResponse.json({
      success: true,
      results,
      query: trimmedQuery
    })

  } catch (error) {
    console.error('❌ Web search error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        success: false,
        results: [],
        message: 'Web search failed. Please try again.',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

async function serperSearch(query: string, limit: number) {
  const apiKey = process.env.SERPER_API_KEY
  if (!apiKey) {
    throw new Error('SERPER_API_KEY not configured')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: Math.min(limit, 20), // Cap at 20 results
        gl: 'us',
        hl: 'en',
        autocorrect: true,
        page: 1
      }),
      signal: controller.signal
    })

    return response
  } finally {
    clearTimeout(timeoutId)
  }
}
