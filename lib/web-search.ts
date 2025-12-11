export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
  date?: string | null
  favicon?: string | null
}

export interface SearchResponse {
  success: boolean
  results: SearchResult[]
  query: string
  message?: string
  remaining?: number
  total?: number
  resetDate?: string
}

/**
 * Search the web for information with full error handling
 */
export async function searchWeb(
  query: string, 
  limit: number = 10, 
  userId?: string
): Promise<SearchResponse> {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: false,
        results: [],
        query,
        message: 'Search query cannot be empty'
      }
    }

    console.log(`🔍 Client: Initiating web search for "${query}"`)

    const response = await fetch('/api/search/web', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: query.trim(), 
        limit: Math.max(5, Math.min(limit, 20)), 
        userId 
      })
    })

    // Handle rate limiting
    if (response.status === 429) {
      const data = await response.json()
      console.warn('⚠️ Web search rate limited:', data.message)
      return {
        success: false,
        results: [],
        query,
        message: data.message || 'Monthly search limit reached',
        remaining: data.remaining,
        total: data.total,
        resetDate: data.resetDate
      }
    }

    // Handle service unavailable
    if (response.status === 503) {
      const data = await response.json()
      console.error('❌ Web search service unavailable:', data.message)
      return {
        success: false,
        results: [],
        query,
        message: data.message || 'Web search service temporarily unavailable'
      }
    }

    // Handle other errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('❌ Web search API error:', error)
      return {
        success: false,
        results: [],
        query,
        message: error.message || `Search failed with status ${response.status}`
      }
    }

    const data: SearchResponse = await response.json()
    
    if (!data.success) {
      console.warn('⚠️ Web search returned unsuccessfully:', data.message)
      return {
        success: false,
        results: [],
        query,
        message: data.message || 'Search did not return results'
      }
    }

    if (!data.results || data.results.length === 0) {
      console.log('ℹ️ No results found for query')
      return {
        success: true,
        results: [],
        query,
        message: 'No results found. Try a different search.'
      }
    }

    console.log(`✅ Web search successful: ${data.results.length} results`)
    return data

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Web search error:', message)
    
    // Check for specific error types
    if (message.includes('fetch failed') || message.includes('Failed to fetch')) {
      return {
        success: false,
        results: [],
        query,
        message: 'Network error. Check your connection and try again.'
      }
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return {
        success: false,
        results: [],
        query,
        message: 'Search timed out. Please try again.'
      }
    }

    return {
      success: false,
      results: [],
      query,
      message: 'Web search encountered an error. Please try again.'
    }
  }
}

/**
 * Format search results as context for AI
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No search results available for context.'
  }

  const formatted = results
    .map((r, i) => {
      const lines = [
        `[SOURCE ${i + 1}/${results.length}]`,
        `Title: ${r.title}`,
        `Website: ${r.source}`,
        `Content: ${r.snippet}`
      ]
      if (r.date) lines.push(`Date: ${r.date}`)
      lines.push(`URL: ${r.url}`)
      return lines.join('\n')
    })
    .join('\n\n---\n\n')

  return formatted
}

/**
 * Check if a response contains web search results
 */
export function hasSearchResults(results: SearchResult[]): boolean {
  return results.length > 0 && results.every(r => r.title && r.url && r.snippet)
}
