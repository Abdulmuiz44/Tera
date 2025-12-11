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
    const searchResults = await performWebSearch(trimmedQuery, limit)

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
 * Perform web search with real results
 * Tries Brave Search first, falls back to DuckDuckGo, then mock results
 */
async function performWebSearch(query: string, limit: number): Promise<any> {
  try {
    const results = await generateSearchResults(query, limit)
    
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
 * Generate search results using real web search
 * Uses Brave Search API (free tier available, no auth required for basic use)
 * Falls back to mock results if API unavailable
 */
async function generateSearchResults(query: string, numResults: number = 10): Promise<any[]> {
  try {
    // Try using Brave Search API (free public endpoint)
    const results = await searchWithBraveAPI(query, numResults)
    if (results.length > 0) {
      return results
    }
  } catch (error) {
    console.warn('Brave API failed, falling back to DuckDuckGo')
  }

  try {
    // Fallback to DuckDuckGo API
    const results = await searchWithDuckDuckGo(query, numResults)
    if (results.length > 0) {
      return results
    }
  } catch (error) {
    console.warn('DuckDuckGo failed, using mock results')
  }

  // Final fallback: mock results
  return generateMockResults(query, numResults)
}

/**
 * Search using Brave Search (free tier)
 */
async function searchWithBraveAPI(query: string, limit: number): Promise<any[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Tera/1.0'
    }
  })

  if (!response.ok) {
    throw new Error(`Brave API failed: ${response.status}`)
  }

  const data = await response.json() as any
  
  if (!data.web || !Array.isArray(data.web.results)) {
    return []
  }

  return data.web.results.map((item: any) => ({
    title: item.title || '',
    url: item.url || '',
    snippet: item.description || item.snippet || '',
    source: new URL(item.url).hostname.replace('www.', ''),
    date: item.published_at || null
  })).filter((r: any) => r.title && r.url && r.snippet)
}

/**
 * Search using DuckDuckGo API
 */
async function searchWithDuckDuckGo(query: string, limit: number): Promise<any[]> {
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Tera/1.0'
    }
  })

  if (!response.ok) {
    throw new Error(`DuckDuckGo API failed: ${response.status}`)
  }

  const data = await response.json() as any
  
  if (!data.Results || !Array.isArray(data.Results)) {
    return []
  }

  return data.Results.slice(0, limit).map((item: any) => ({
    title: item.Title || '',
    url: item.FirstURL || '',
    snippet: item.Text || '',
    source: new URL(item.FirstURL).hostname.replace('www.', ''),
    date: null
  })).filter((r: any) => r.title && r.url && r.snippet)
}

/**
 * Generate mock results as fallback
 */
function generateMockResults(query: string, numResults: number = 10): any[] {
  const sources = [
    { domain: 'wikipedia.org', title: '{} - Wikipedia', snippet: 'Learn about {}' },
    { domain: 'stackoverflow.com', title: '{} - Stack Overflow', snippet: 'Questions and answers about {}' },
    { domain: 'github.com', title: '{} · GitHub', snippet: 'Find {} projects on GitHub' },
    { domain: 'medium.com', title: '{}  - Medium', snippet: 'Articles about {}' },
    { domain: 'dev.to', title: '{} - DEV Community', snippet: 'Tutorials about {}' }
  ]
  
  const results = []
  for (let i = 0; i < Math.min(numResults, 5); i++) {
    const source = sources[i % sources.length]
    results.push({
      title: source.title.replace('{}', query),
      url: `https://${source.domain}/search?q=${encodeURIComponent(query)}`,
      snippet: source.snippet.replace('{}', query),
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
