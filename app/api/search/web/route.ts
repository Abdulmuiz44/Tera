import { NextRequest, NextResponse } from 'next/server'
import { getWebSearchRemaining, incrementWebSearchCount } from '@/lib/web-search-usage'

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, userId } = await request.json()

    // Validate input
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      )
    }

    const trimmedQuery = query.trim().slice(0, 500)
    if (trimmedQuery.length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      )
    }

    // Validate API key
    if (!process.env.SERPER_API_KEY) {
      console.error('❌ SERPER_API_KEY not found in environment variables')
      return NextResponse.json(
        {
          success: false,
          results: [],
          message: 'Web search service not configured. Please contact support.'
        },
        { status: 503 }
      )
    }

    // Check usage limit if userId provided
    if (userId) {
      try {
        const { remaining, total, resetDate, plan } = await getWebSearchRemaining(userId)
        
        console.log(`🔍 [${plan.toUpperCase()}] Web Search Check: ${remaining}/${total} remaining`)
        
        if (remaining <= 0) {
          const formattedResetDate = resetDate 
            ? new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'next month'
          
          console.warn(`⚠️ User ${userId} reached monthly web search limit (${total}/${total})`)
          return NextResponse.json(
            {
              success: false,
              results: [],
              message: `🔍 Monthly search limit reached (${total} searches used). Resets ${formattedResetDate}. Upgrade for more searches.`,
              remaining: 0,
              total,
              resetDate
            },
            { status: 429 }
          )
        }
      } catch (limitError) {
        console.error('⚠️ Error checking limits:', limitError)
        // Continue - don't block search if limit check fails
      }
    }

    // Perform Serper API search
    console.log(`🔍 Searching: "${trimmedQuery}" (limit: ${limit})`)
    const searchResponse = await performSerperSearch(trimmedQuery, limit)

    // Return response
    if (searchResponse.ok) {
      const data = await searchResponse.json()
      
      if (!data.organic || data.organic.length === 0) {
        console.warn(`⚠️ No results for: "${trimmedQuery}"`)
        return NextResponse.json({
          success: true,
          results: [],
          query: trimmedQuery,
          message: 'No search results found. Try a different search term.'
        })
      }

      // Format results
      const results = data.organic
        .slice(0, limit)
        .map((item: any) => ({
          title: item.title || 'Untitled',
          url: item.link || '',
          snippet: item.snippet || item.description || '',
          source: item.source || extractDomain(item.link || ''),
          date: item.date || null,
          favicon: item.favicon || null
        }))
        .filter((r: any) => r.url && r.snippet && r.title)

      if (results.length === 0) {
        console.warn(`⚠️ No valid results after filtering for: "${trimmedQuery}"`)
        return NextResponse.json({
          success: true,
          results: [],
          query: trimmedQuery,
          message: 'No results with content found.'
        })
      }

      console.log(`✅ Search successful: ${results.length} results found for "${trimmedQuery}"`)

      // Increment usage counter
      if (userId) {
        try {
          await incrementWebSearchCount(userId)
          console.log(`📊 Search count incremented for user ${userId}`)
        } catch (countError) {
          console.warn('⚠️ Failed to increment search count:', countError)
          // Don't fail the response if counter update fails
        }
      }

      return NextResponse.json({
        success: true,
        results,
        query: trimmedQuery
      })
    } else {
      // Handle Serper API errors
      const errorText = await searchResponse.text().catch(() => '')
      
      console.error(`❌ Serper API Error: ${searchResponse.status} - ${errorText}`)

      if (searchResponse.status === 429) {
        return NextResponse.json(
          {
            success: false,
            results: [],
            message: '🔍 Search service rate limited. Please try again in a moment.'
          },
          { status: 429 }
        )
      }

      if (searchResponse.status === 403) {
        return NextResponse.json(
          {
            success: false,
            results: [],
            message: '🔍 Search service authentication failed. Contact support.'
          },
          { status: 503 }
        )
      }

      if (searchResponse.status === 402) {
        return NextResponse.json(
          {
            success: false,
            results: [],
            message: '🔍 Search quota exceeded. Please try again tomorrow.'
          },
          { status: 429 }
        )
      }

      throw new Error(`Serper API error: ${searchResponse.status} ${errorText}`)
    }

  } catch (error) {
    console.error('❌ Web search error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json(
      {
        success: false,
        results: [],
        message: 'Web search failed. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
      },
      { status: 500 }
    )
  }
}

/**
 * Perform the actual Serper API search
 * Matches the pattern: POST to google.serper.dev with X-API-KEY header
 */
async function performSerperSearch(query: string, limit: number) {
  const apiKey = process.env.SERPER_API_KEY
  
  if (!apiKey) {
    throw new Error('SERPER_API_KEY not configured')
  }

  // Build request body
  const requestBody = {
    q: query,
    num: Math.min(Math.max(limit, 1), 20), // Clamp between 1-20
    gl: 'us',
    hl: 'en',
    autocorrect: true,
    page: 1
  }

  console.log(`📡 Calling Serper API with query: "${query}"`)

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })

    console.log(`📥 Serper API Response: ${response.status} ${response.statusText}`)
    
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return 'unknown'
  }
}

// Enable streaming for long-running searches
export const config = {
  maxDuration: 60, // 60 seconds for Vercel
}
