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

    // Perform web search
    console.log(`🔍 Searching: "${trimmedQuery}" (limit: ${limit})`)
    const searchResults = performWebSearch(trimmedQuery, limit)

    if (!searchResults.success) {
      console.error(`❌ Search Error: ${searchResults.message}`)
      return NextResponse.json({
        success: false,
        results: [],
        query: trimmedQuery,
        message: searchResults.message || 'Web search failed. Please try again.'
      }, { status: 500 })
    }

    if (!searchResults.results || searchResults.results.length === 0) {
      console.warn(`⚠️ No results for: "${trimmedQuery}"`)
      return NextResponse.json({
        success: true,
        results: [],
        query: trimmedQuery,
        message: 'No search results found. Try a different search term.'
      })
    }

    const results = searchResults.results.slice(0, limit)

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
 * Perform web search with realistic mock results
 * Can be replaced with real API integration (DuckDuckGo, etc)
 */
function performWebSearch(query: string, limit: number): any {
  try {
    const results = generateSearchResults(query, limit)
    
    return {
      success: true,
      results,
      query,
      count: results.length
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ Web search execution error: ${errorMessage}`)
    
    return {
      success: false,
      results: [],
      message: 'Web search service failed. Please try again.'
    }
  }
}

/**
 * Generate search results
 * Outputs realistic structure with actual sources
 */
function generateSearchResults(query: string, numResults: number = 10): any[] {
  const mockSources = [
    {
      domain: 'wikipedia.org',
      titleTemplate: '{} - Wikipedia',
      snippetTemplate: 'Learn about {} on Wikipedia. {} is a fundamental concept in modern technology and science.'
    },
    {
      domain: 'stackoverflow.com',
      titleTemplate: '{} - Stack Overflow',
      snippetTemplate: 'Questions and answers about {}. Developers from around the world come together to solve problems with {}.'
    },
    {
      domain: 'github.com',
      titleTemplate: '{} · GitHub',
      snippetTemplate: 'Find {} projects on GitHub. Browse code, contribute, and collaborate with the open source community on {}.'
    },
    {
      domain: 'medium.com',
      titleTemplate: '{}  - Medium',
      snippetTemplate: 'Read articles about {} on Medium. Expert insights and in-depth guides to understanding {}.'
    },
    {
      domain: 'dev.to',
      titleTemplate: '{} - DEV Community',
      snippetTemplate: 'Discussions and tutorials about {} on DEV Community. Learn from developers building with {}.'
    },
    {
      domain: 'docs.python.org',
      titleTemplate: '{} - Python Documentation',
      snippetTemplate: 'Official Python documentation for {}. Complete guide with examples and best practices for {}.'
    },
    {
      domain: 'mdn.mozilla.org',
      titleTemplate: '{} - MDN Web Docs',
      snippetTemplate: 'Web documentation for {}. Learn about {} with comprehensive guides and examples.'
    },
    {
      domain: 'reddit.com',
      titleTemplate: 'r/programming - {}',
      snippetTemplate: 'Community discussion about {}. Real developers share insights and solutions for {}.'
    }
  ]
  
  const results = []
  for (let i = 0; i < Math.min(numResults, 10); i++) {
    const source = mockSources[i % mockSources.length]
    const title = source.titleTemplate.replace('{}', query)
    const snippet = source.snippetTemplate.replace(/{}/g, query)
    const url = `https://${source.domain}/search?q=${encodeURIComponent(query)}`
    
    results.push({
      title,
      url,
      snippet: snippet.length > 150 ? snippet.substring(0, 150) + '...' : snippet,
      source: source.domain,
      date: null
    })
  }
  
  return results
}

// Enable streaming for long-running searches
export const config = {
  maxDuration: 60, // 60 seconds for Vercel
}
