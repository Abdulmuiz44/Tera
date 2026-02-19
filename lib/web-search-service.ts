
import { SearchFilters, SearchResult } from './web-search';

export interface SearchProviderResponse {
    success: boolean;
    results: SearchResult[];
    message?: string;
    provider?: string;
}

export type SearchProgressCallback = (status: string, details?: string) => void;

/**
 * Shared server-side logic for performing web searches
 * This can be called from API routes or directly from other server-side components (like lib/mistral.ts)
 */
export async function performWebSearchInternal(
    query: string,
    limit: number,
    filters: SearchFilters = {},
    onProgress?: SearchProgressCallback
): Promise<SearchProviderResponse> {
    const trimmedQuery = query.trim();

    // Primary: SearXNG (Privacy-respecting meta-search)
    try {
        const searxngUrl = process.env.SEARXNG_BASE_URL;
        if (searxngUrl) {
            if (onProgress) onProgress('searching', `Fetching from SearXNG: ${searxngUrl}`);

            const response = await fetch(`${searxngUrl}/search?q=${encodeURIComponent(trimmedQuery)}&format=json&limit=${limit}`, {
                next: { revalidate: 3600 }
            });

            if (response.ok) {
                const data = await response.json();
                const results = (data.results || []).map((r: any) => ({
                    title: r.title,
                    url: r.url,
                    snippet: r.content || '',
                    source: r.engine || extractDomain(r.url),
                    favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(r.url)}&sz=32`,
                    type: 'web' as const
                }));

                if (results.length > 0) {
                    if (onProgress) onProgress('complete', `SearXNG found ${results.length} results`);
                    return { success: true, results, provider: 'searxng' };
                }
            }
        }
    } catch (error) {
        console.warn('SearXNG failed:', error instanceof Error ? error.message : 'Unknown error');
        if (onProgress) onProgress('processing', 'SearXNG failed, trying fallback...');
    }

    // Fallback 1: Google Custom Search API
    try {
        if (onProgress) onProgress('searching', 'Trying Google Search...');
        const googleResults = await searchWithGoogleCSE(trimmedQuery, limit, filters);
        if (googleResults.length > 0) {
            if (onProgress) onProgress('complete', `Google found ${googleResults.length} results`);
            return { success: true, results: googleResults, provider: 'google' };
        }
    } catch (error) {
        console.warn('Google CSE failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Fallback 2: Brave Search API
    try {
        if (onProgress) onProgress('searching', 'Trying Brave Search...');
        const braveResults = await searchWithBraveAPI(trimmedQuery, limit);
        if (braveResults.length > 0) {
            if (onProgress) onProgress('complete', `Brave found ${braveResults.length} results`);
            return { success: true, results: braveResults, provider: 'brave' };
        }
    } catch (error) {
        console.warn('Brave API failed:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Final fallback to mock results (for development)
    console.warn('⚠️ All search providers failed, using mock results');
    if (onProgress) onProgress('complete', 'Using mock fallback results');

    return {
        success: true,
        results: generateMockResults(trimmedQuery, limit),
        provider: 'mock',
        message: 'Using fallback results. Configure SEARXNG_BASE_URL for real search.'
    };
}

/**
 * Google Custom Search API
 */
async function searchWithGoogleCSE(
    query: string,
    limit: number,
    filters: SearchFilters = {}
): Promise<SearchResult[]> {
    const apiKey = process.env.GOOGLE_CSE_API_KEY;
    const cx = process.env.GOOGLE_CSE_CX;

    if (!apiKey || !cx) {
        throw new Error('Google CSE credentials not configured');
    }

    const params = new URLSearchParams({
        key: apiKey,
        cx: cx,
        q: query,
        num: String(Math.min(limit, 10))
    });

    if (filters.dateRange && filters.dateRange !== 'all') {
        const dateRestrict: Record<string, string> = {
            'day': 'd1', 'week': 'w1', 'month': 'm1', 'year': 'y1'
        };
        if (dateRestrict[filters.dateRange]) {
            params.append('dateRestrict', dateRestrict[filters.dateRange]);
        }
    }

    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
    if (!response.ok) throw new Error(`Google API error: ${response.status}`);

    const data = await response.json();
    return (data.items || []).map((item: any) => ({
        title: item.title || '',
        url: item.link || '',
        snippet: item.snippet || '',
        source: item.displayLink?.replace('www.', '') || extractDomain(item.link),
        favicon: `https://www.google.com/s2/favicons?domain=${item.displayLink}&sz=32`,
        type: 'web' as const
    }));
}

/**
 * Brave Search API
 */
async function searchWithBraveAPI(query: string, limit: number): Promise<SearchResult[]> {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) throw new Error('Brave API key not configured');

    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${limit}`;
    const response = await fetch(url, {
        headers: { 'X-Subscription-Token': apiKey, 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`Brave API error: ${response.status}`);

    const data = await response.json();
    return (data.web?.results || []).map((item: any) => ({
        title: item.title || '',
        url: item.url || '',
        snippet: item.description || item.snippet || '',
        source: extractDomain(item.url),
        favicon: `https://www.google.com/s2/favicons?domain=${extractDomain(item.url)}&sz=32`,
        type: 'web' as const
    }));
}

function generateMockResults(query: string, limit: number): SearchResult[] {
    return [
        {
            title: `${query} - Wikipedia`,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
            snippet: `General overview and facts about ${query}. From the free encyclopedia.`,
            source: 'wikipedia.org',
            type: 'web'
        }
    ];
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return url;
    }
}
