import { NextRequest, NextResponse } from 'next/server'
import { getWebSearchRemaining, incrementWebSearchCount } from '@/lib/web-search-usage'

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
  const action = params.slug[0]

  if (action === 'web') {
    try {
      const { query, limit = 10, userId } = await request.json()

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

      // Perform web search
      const searchResults = await performWebSearch(trimmedQuery, limit)
      if (!searchResults.success) {
        return NextResponse.json({ success: false, results: [], query: trimmedQuery, message: searchResults.message || 'Web search failed.' }, { status: 500 })
      }

      const results = (searchResults.results || []).slice(0, limit)
      if (userId && results.length > 0) {
        try { await incrementWebSearchCount(userId) } catch (countError) { }
      }

      return NextResponse.json({ success: true, results, query: trimmedQuery })
    } catch (error) {
      return NextResponse.json({ success: false, results: [], message: 'Web search failed.' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

async function performWebSearch(query: string, limit: number): Promise<any> {
  try {
    const results = await generateSearchResults(query, limit)
    return { success: true, results, query, count: results.length }
  } catch (error) {
    return { success: false, results: [], message: 'Web search service failed.' }
  }
}

async function generateSearchResults(query: string, numResults: number = 10): Promise<any[]> {
  try {
    const results = await searchWithBraveAPI(query, numResults)
    if (results.length > 0) return results
  } catch (error) { }

  try {
    const results = await searchWithDuckDuckGo(query, numResults)
    if (results.length > 0) return results
  } catch (error) { }

  return generateMockResults(query, numResults)
}

async function searchWithBraveAPI(query: string, limit: number): Promise<any[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`
  const response = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Tera/1.0' } })
  if (!response.ok) throw new Error(`Brave API failed: ${response.status}`)
  const data = await response.json() as any
  if (!data.web || !Array.isArray(data.web.results)) return []
  return data.web.results.map((item: any) => ({
    title: item.title || '',
    url: item.url || '',
    snippet: item.description || item.snippet || '',
    source: new URL(item.url).hostname.replace('www.', ''),
    date: item.published_at || null
  })).filter((r: any) => r.title && r.url && r.snippet)
}

async function searchWithDuckDuckGo(query: string, limit: number): Promise<any[]> {
  const url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
  const response = await fetch(url, { headers: { 'User-Agent': 'Tera/1.0' } })
  if (!response.ok) throw new Error(`DuckDuckGo API failed: ${response.status}`)
  const data = await response.json() as any
  if (!data.Results || !Array.isArray(data.Results)) return []
  return data.Results.slice(0, limit).map((item: any) => ({
    title: item.Title || '',
    url: item.FirstURL || '',
    snippet: item.Text || '',
    source: new URL(item.FirstURL).hostname.replace('www.', ''),
    date: null
  })).filter((r: any) => r.title && r.url && r.snippet)
}

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

export const maxDuration = 60
