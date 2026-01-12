import { NextRequest, NextResponse } from 'next/server'
import { getWebSearchRemaining, incrementWebSearchCount } from '@/lib/web-search-usage'

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

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const action = slug[0]

  if (action === 'web') {
    try {
      const body = await request.json()
      const { query, limit = 10, userId, filters = {}, deepSearch = false } = body as {
        query: string
        limit?: number
        userId?: string
        filters?: SearchFilters
        deepSearch?: boolean
      }

      // Validate input
      if (!query || typeof query !== 'string') {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
      }

      const trimmedQuery = query.trim().slice(0, 500)
      if (trimmedQuery.length === 0) {
        return NextResponse.json({ error: 'Query cannot be empty' }, { status: 400 })
      }

      // Check usage limit if userId provided
      if (userId) {
        try {
          const { remaining, total, resetDate } = await getWebSearchRemaining(userId)
          if (remaining <= 0) {
            const formattedResetDate = resetDate ? new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'next month'
            return NextResponse.json({
              success: false, results: [], message: `🔍 Monthly search limit reached (${total} searches used). Resets ${formattedResetDate}. Upgrade for more searches.`,
              remaining: 0, total, resetDate
            }, { status: 429 })
          }
        } catch (limitError) { }
      }

      // Determine search limit based on deep search mode
      const searchLimit = deepSearch ? Math.min(limit * 2, 20) : Math.min(limit, 10)

      // Perform web search with filters
      const searchResults = await performWebSearch(trimmedQuery, searchLimit, filters)
      if (!searchResults.success) {
        return NextResponse.json({
          success: false,
          results: [],
          query: trimmedQuery,
          message: searchResults.message || 'Web search failed.'
        }, { status: 500 })
      }

      const results = (searchResults.results || []).slice(0, searchLimit)

      // Increment usage count only if we got results
      if (userId && results.length > 0) {
        try { await incrementWebSearchCount(userId) } catch (countError) { }
      }

      // Generate related searches
      const relatedSearches = generateRelatedSearches(trimmedQuery, results)

      return NextResponse.json({
        success: true,
        results,
        query: trimmedQuery,
        count: results.length,
        relatedSearches,
        provider: searchResults.provider
      })
    } catch (error) {
      console.error('Search API error:', error)
      return NextResponse.json({ success: false, results: [], message: 'Web search failed.' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

async function performWebSearch(
  query: string,
  limit: number,
  filters: SearchFilters = {}
): Promise<{ success: boolean; results: SearchResult[]; message?: string; provider?: string }> {
  // Try search providers in order: Google CSE → Brave → DuckDuckGo → Mock

  // 1. Try Google Custom Search API (primary)
  try {
    const googleResults = await searchWithGoogleCSE(query, limit, filters)
    if (googleResults.length > 0) {
      console.log(`✅ Google CSE returned ${googleResults.length} results`)
      return { success: true, results: googleResults, provider: 'google' }
    }
  } catch (error) {
    console.warn('Google CSE failed:', error instanceof Error ? error.message : 'Unknown error')
  }

  // 2. Fallback to Brave Search API
  try {
    const braveResults = await searchWithBraveAPI(query, limit)
    if (braveResults.length > 0) {
      console.log(`✅ Brave API returned ${braveResults.length} results`)
      return { success: true, results: braveResults, provider: 'brave' }
    }
  } catch (error) {
    console.warn('Brave API failed:', error instanceof Error ? error.message : 'Unknown error')
  }

  // 3. Fallback to DuckDuckGo
  try {
    const ddgResults = await searchWithDuckDuckGo(query, limit)
    if (ddgResults.length > 0) {
      console.log(`✅ DuckDuckGo returned ${ddgResults.length} results`)
      return { success: true, results: ddgResults, provider: 'duckduckgo' }
    }
  } catch (error) {
    console.warn('DuckDuckGo failed:', error instanceof Error ? error.message : 'Unknown error')
  }

  // 4. Final fallback to mock results (for development)
  console.warn('⚠️ All search providers failed, using mock results')
  return {
    success: true,
    results: generateMockResults(query, limit),
    provider: 'mock',
    message: 'Using fallback results. Configure API keys for real search.'
  }
}

/**
 * Google Custom Search API
 * Requires: GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX environment variables
 */
async function searchWithGoogleCSE(
  query: string,
  limit: number,
  filters: SearchFilters = {}
): Promise<SearchResult[]> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY
  const cx = process.env.GOOGLE_CSE_CX

  if (!apiKey || !cx) {
    throw new Error('Google CSE credentials not configured')
  }

  // Build URL with filters
  const params = new URLSearchParams({
    key: apiKey,
    cx: cx,
    q: query,
    num: String(Math.min(limit, 10)) // Google CSE max is 10 per request
  })

  // Apply date filter
  if (filters.dateRange && filters.dateRange !== 'all') {
    const dateRestrict: Record<string, string> = {
      'day': 'd1',
      'week': 'w1',
      'month': 'm1',
      'year': 'y1'
    }
    if (dateRestrict[filters.dateRange]) {
      params.append('dateRestrict', dateRestrict[filters.dateRange])
    }
  }

  // Apply content type filter
  if (filters.type === 'news') {
    params.append('searchType', 'news')
  } else if (filters.type === 'images') {
    params.append('searchType', 'image')
  }

  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?${params.toString()}`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Google CSE API error: ${response.status} - ${errorData.error?.message || 'Unknown'}`)
  }

  const data = await response.json() as {
    items?: Array<{
      title: string
      link: string
      snippet: string
      displayLink: string
      pagemap?: {
        cse_thumbnail?: Array<{ src: string }>
        metatags?: Array<{ 'article:published_time'?: string }>
      }
    }>
  }

  if (!data.items || !Array.isArray(data.items)) {
    return []
  }

  return data.items.map((item) => ({
    title: item.title || '',
    url: item.link || '',
    snippet: item.snippet || '',
    source: item.displayLink?.replace('www.', '') || extractDomain(item.link),
    date: item.pagemap?.metatags?.[0]?.['article:published_time'] || null,
    favicon: `https://www.google.com/s2/favicons?domain=${item.displayLink}&sz=32`,
    type: 'web' as const
  })).filter(r => r.title && r.url && r.snippet)
}

/**
 * Brave Search API
 */
async function searchWithBraveAPI(query: string, limit: number): Promise<SearchResult[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'Tera/1.0'
  }

  if (apiKey) {
    headers['X-Subscription-Token'] = apiKey
  }

  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`
  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`Brave API failed: ${response.status}`)
  }

  const data = await response.json() as {
    web?: {
      results?: Array<{
        title: string
        url: string
        description?: string
        snippet?: string
        published_at?: string
      }>
    }
  }

  if (!data.web || !Array.isArray(data.web.results)) {
    return []
  }

  return data.web.results.map((item) => ({
    title: item.title || '',
    url: item.url || '',
    snippet: item.description || item.snippet || '',
    source: extractDomain(item.url),
    date: item.published_at || null,
    favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(item.url)}&sz=32`,
    type: 'web' as const
  })).filter(r => r.title && r.url && r.snippet)
}

/**
 * DuckDuckGo Instant Answer API (fallback)
 */
async function searchWithDuckDuckGo(query: string, limit: number): Promise<SearchResult[]> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Tera/1.0' }
  })

  if (!response.ok) {
    throw new Error(`DuckDuckGo API failed: ${response.status}`)
  }

  const data = await response.json() as {
    RelatedTopics?: Array<{
      Text?: string
      FirstURL?: string
      Result?: string
    }>
    AbstractText?: string
    AbstractURL?: string
    AbstractSource?: string
  }

  const results: SearchResult[] = []

  // Add abstract if available
  if (data.AbstractText && data.AbstractURL) {
    results.push({
      title: data.AbstractSource || 'Summary',
      url: data.AbstractURL,
      snippet: data.AbstractText,
      source: extractDomain(data.AbstractURL),
      favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(data.AbstractURL)}&sz=32`,
      type: 'web'
    })
  }

  // Add related topics
  if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
    for (const topic of data.RelatedTopics.slice(0, limit - results.length)) {
      if (topic.FirstURL && topic.Text) {
        results.push({
          title: topic.Text.split(' - ')[0] || topic.Text.slice(0, 100),
          url: topic.FirstURL,
          snippet: topic.Text,
          source: extractDomain(topic.FirstURL),
          favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(topic.FirstURL)}&sz=32`,
          type: 'web'
        })
      }
    }
  }

  return results
}

/**
 * Mock results for development/fallback
 */
function generateMockResults(query: string, numResults: number = 10): SearchResult[] {
  const sources = [
    { domain: 'wikipedia.org', title: '{} - Wikipedia', snippet: 'Comprehensive information about {}. Learn facts, history, and details.' },
    { domain: 'stackoverflow.com', title: '{} - Stack Overflow', snippet: 'Community discussions and answers about {}. Find solutions and best practices.' },
    { domain: 'github.com', title: '{} · GitHub', snippet: 'Open source projects and repositories related to {}. Explore code and contribute.' },
    { domain: 'medium.com', title: 'Understanding {} - Medium', snippet: 'In-depth articles and perspectives on {}. Expert insights and tutorials.' },
    { domain: 'dev.to', title: '{} - DEV Community', snippet: 'Developer tutorials and discussions about {}. Learn from the community.' }
  ]

  return sources.slice(0, Math.min(numResults, 5)).map((source, i) => ({
    title: source.title.replace('{}', query),
    url: `https://${source.domain}/search?q=${encodeURIComponent(query)}`,
    snippet: source.snippet.replace(/{}/g, query),
    source: source.domain,
    date: null,
    favicon: `https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`,
    type: 'web' as const
  }))
}

/**
 * Generate related search suggestions
 */
function generateRelatedSearches(query: string, results: SearchResult[]): string[] {
  const suggestions: string[] = []

  // Extract common terms from results
  const allText = results.map(r => `${r.title} ${r.snippet}`).join(' ').toLowerCase()
  const words = allText.split(/\s+/).filter(w => w.length > 4)

  // Find frequent terms not in original query
  const queryWords = new Set(query.toLowerCase().split(/\s+/))
  const wordCounts = new Map<string, number>()

  for (const word of words) {
    if (!queryWords.has(word)) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
    }
  }

  // Get top related terms
  const topTerms = Array.from(wordCounts.entries())
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word)

  // Generate related searches
  for (const term of topTerms) {
    suggestions.push(`${query} ${term}`)
  }

  // Add common modifiers
  const modifiers = ['tutorial', 'examples', 'best practices', 'how to', 'guide']
  for (const mod of modifiers.slice(0, 2)) {
    if (!query.toLowerCase().includes(mod)) {
      suggestions.push(`${mod} ${query}`)
    }
  }

  return suggestions.slice(0, 5)
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export const maxDuration = 60
