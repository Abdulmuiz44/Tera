/**
 * Web Search Client
 * Calls the /api/search/web endpoint which uses SerpScrap for web scraping
 * SerpScrap is a free, self-hosted alternative to commercial search APIs
 */

export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
  date?: string | null
  favicon?: string | null
  type?: 'web' | 'news' | 'academic' | 'video' | 'image'
}

export interface SearchFilters {
  type?: 'all' | 'news' | 'academic' | 'videos' | 'images'
  dateRange?: 'day' | 'week' | 'month' | 'year' | 'all'
  domains?: string[]
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
 * Search the web for information using SerpScrap
 * @param query - Search query
 * @param limit - Number of results (1-20, default 10)
 * @param userId - User ID for quota tracking
 * @returns Search results with metadata
 */
export async function searchWeb(
  query: string,
  limit: number = 10,
  userId?: string
): Promise<SearchResponse> {
  try {
    // Validate input
    if (!query || query.trim().length === 0) {
      console.warn('⚠️ Search query is empty')
      return {
        success: false,
        results: [],
        query,
        message: 'Search query cannot be empty'
      }
    }

    const trimmedQuery = query.trim()
    const clampedLimit = Math.max(1, Math.min(limit, 20))

    console.log(`🔍 Initiating web search: "${trimmedQuery}"`)

    // SERVER-SIDE EXECUTION (Direct)
    if (typeof window === 'undefined') {
      try {
        console.log('🖥️ Server-side search detected, calling internal service...')
        const { performWebSearchInternal } = await import('./web-search-service')
        const data = await performWebSearchInternal(trimmedQuery, clampedLimit)

        return {
          success: data.success,
          results: data.results,
          query: trimmedQuery,
          message: data.message
        }
      } catch (serverError) {
        console.error('❌ Server-side search failed:', serverError)
        // Fallback to fetch if direct call fails (though usually fetch will fail too if it's a relative URL)
      }
    }

    // CLIENT-SIDE EXECUTION (API Fetch)
    const response = await fetch('/api/search/web', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: trimmedQuery,
        limit: clampedLimit,
        userId
      })
    })

    console.log(`📥 API Response: ${response.status}`)

    // Handle rate limiting (429)
    if (response.status === 429) {
      const data = await response.json()
      console.warn('⚠️ Rate limited or quota reached')
      return {
        success: false,
        results: [],
        query: trimmedQuery,
        message: data.message || 'Monthly search limit reached',
        remaining: data.remaining,
        total: data.total,
        resetDate: data.resetDate
      }
    }

    // Handle service unavailable (503)
    if (response.status === 503) {
      const data = await response.json()
      console.error('❌ Service unavailable:', data.message)
      return {
        success: false,
        results: [],
        query: trimmedQuery,
        message: data.message || 'Web search service temporarily unavailable'
      }
    }

    // Handle other errors
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error(`❌ API error ${response.status}:`, error)
      return {
        success: false,
        results: [],
        query: trimmedQuery,
        message: error.message || `Search failed with status ${response.status}`
      }
    }

    // Parse successful response
    const data: SearchResponse = await response.json()

    if (!data.success) {
      console.warn('⚠️ Search returned success=false:', data.message)
      return {
        success: false,
        results: [],
        query: trimmedQuery,
        message: data.message || 'Search did not return results'
      }
    }

    if (!data.results || data.results.length === 0) {
      console.log('ℹ️ No results found')
      return {
        success: true,
        results: [],
        query: trimmedQuery,
        message: 'No results found. Try a different search term.'
      }
    }

    // Validate results
    const validResults = data.results.filter(r =>
      r.title && r.url && r.snippet && r.source
    )

    if (validResults.length === 0) {
      console.warn('⚠️ Results found but none were valid')
      return {
        success: true,
        results: [],
        query: trimmedQuery,
        message: 'Results found but were invalid.'
      }
    }

    console.log(`✅ Search successful: ${validResults.length} results`)
    return {
      success: true,
      results: validResults,
      query: trimmedQuery
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('❌ Web search error:', message)

    // Provide specific error messages
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

    if (message.includes('abort')) {
      return {
        success: false,
        results: [],
        query,
        message: 'Search was cancelled. Please try again.'
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
 * Format search results for AI context
 * Creates structured text for the LLM to use as sources
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'No search results available.'
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
 * Check if search results are valid
 */
export function hasValidResults(results: SearchResult[]): boolean {
  return results.length > 0 && results.every(r =>
    r.title && r.url && r.snippet && r.source
  )
}

/**
 * Extract domain from URL for display
 */
export function getDomain(url: string): string {
  try {
    const domain = new URL(url).hostname
    return domain.replace(/^www\./, '')
  } catch {
    return url
  }
}
