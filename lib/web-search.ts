export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
}

export interface SearchResponse {
  success: boolean
  results: SearchResult[]
  query: string
  message?: string
}

/**
 * Search the web for information
 */
export async function searchWeb(query: string, limit: number = 5, userId?: string): Promise<SearchResponse> {
  try {
    const response = await fetch('/api/search/web', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit, userId })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Search failed:', error)
      return {
        success: false,
        results: [],
        query,
        message: error.message || 'Search failed'
      }
    }

    return await response.json()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Web search error:', message)
    return {
      success: false,
      results: [],
      query,
      message
    }
  }
}

/**
 * Format search results as text for AI context
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return 'No search results found.'

  return results
    .map((r, i) => `${i + 1}. ${r.title}\nSource: ${r.source}\nSnippet: ${r.snippet}\nURL: ${r.url}`)
    .join('\n\n')
}
