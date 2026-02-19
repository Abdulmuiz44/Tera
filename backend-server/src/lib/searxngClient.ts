import axios from 'axios';

export interface SearxngSearchParams {
    query: string;
    numResults?: number;
    lang?: string;
}

export interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
    source?: string;
}

export interface WebSearchResponse {
    results: WebSearchResult[];
}

/**
 * Perform a web search using a self-hosted SearXNG instance.
 * @param params - Search parameters (query, limit, language)
 * @returns Normalized search results
 */
export async function searchWebWithSearxng(params: SearxngSearchParams): Promise<WebSearchResponse> {
    const baseUrl = process.env.SEARXNG_BASE_URL;

    if (!baseUrl) {
        throw new Error('SEARXNG_BASE_URL environment variable is not configured');
    }

    const { query, numResults = 5, lang = 'en' } = params;
    const limit = Math.max(1, Math.min(numResults, 10));

    try {
        console.log(`🔍 SearXNG Search: "${query}" (limit: ${limit}, lang: ${lang})`);
        const startTime = Date.now();

        const response = await axios.get(`${baseUrl}/search`, {
            params: {
                q: query,
                format: 'json',
                language: lang,
                limit: limit,
            },
            timeout: 5000, // 5 seconds timeout
        });

        const duration = Date.now() - startTime;
        console.log(`✅ SearXNG responded in ${duration}ms with status ${response.status}`);

        if (response.status !== 200) {
            throw new Error(`SearXNG API returned status ${response.status}`);
        }

        const results: WebSearchResult[] = (response.data.results || []).map((result: any) => ({
            title: result.title,
            url: result.url,
            snippet: result.content || '',
            source: result.engine || undefined,
        }));

        return { results };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('❌ SearXNG Network Error:', error.message);
            if (error.code === 'ECONNABORTED') {
                throw new Error('SearXNG request timed out after 5 seconds');
            }
        } else {
            console.error('❌ SearXNG Error:', error);
        }
        throw error;
    }
}
