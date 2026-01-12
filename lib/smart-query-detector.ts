/**
 * Smart Query Detector
 * Automatically detects when a query requires real-time web data
 */

// Keywords that typically indicate need for real-time data
const REAL_TIME_KEYWORDS = [
    // Time-sensitive triggers
    'latest', 'recent', 'today', 'yesterday', 'this week', 'this month',
    'current', 'now', 'breaking', 'just', 'new', 'updated',

    // Year references (current and future)
    '2024', '2025', '2026', '2027',

    // News and events
    'news', 'headlines', 'update', 'announced', 'released', 'launched',

    // Financial/market data
    'price', 'stock', 'crypto', 'bitcoin', 'ethereum', 'market',
    'trading', 'exchange rate', 'currency',

    // Weather
    'weather', 'forecast', 'temperature',

    // Sports and entertainment
    'score', 'game', 'match', 'results', 'standings', 'winner',
    'box office', 'trending', 'viral',

    // Research and facts
    'research', 'study', 'statistics', 'data', 'report',
    'how many', 'what is the', 'who is the', 'where is',

    // Comparison and reviews
    'review', 'comparison', 'vs', 'versus', 'compare',
    'best', 'top', 'ranking', 'rated'
]

// Phrases that strongly indicate real-time needs
const REAL_TIME_PHRASES = [
    'what happened',
    'is it true',
    'did they',
    'has there been',
    'any updates on',
    'latest on',
    'news about',
    'what\'s new',
    'status of',
    'current state',
    'right now',
    'at the moment',
    'as of today',
    'this year',
    'last year'
]

// Questions that typically DON'T need web search (knowledge-based)
const KNOWLEDGE_PATTERNS = [
    /^(what is|define|explain|describe) (a |an |the )?(concept|theory|principle|law|rule)/i,
    /^(how to|how do (i|you)|steps to|tutorial)/i,
    /^(teach me|help me understand|explain to me)/i,
    /^(create|generate|write|make) (a |an )?(code|program|script|function)/i,
    /^(solve|calculate|compute|evaluate)/i
]

/**
 * Determines if a query should trigger automatic web search
 * @param query - The user's search query
 * @returns boolean - true if web search should be auto-enabled
 */
export function shouldEnableWebSearch(query: string): boolean {
    if (!query || query.trim().length < 5) {
        return false
    }

    const normalizedQuery = query.toLowerCase().trim()

    // Check if it's a knowledge-based query that doesn't need web search
    for (const pattern of KNOWLEDGE_PATTERNS) {
        if (pattern.test(normalizedQuery)) {
            // But still check for time-sensitive keywords within the query
            const hasTimeKeyword = REAL_TIME_KEYWORDS.some(keyword =>
                normalizedQuery.includes(keyword.toLowerCase())
            )
            if (!hasTimeKeyword) {
                return false
            }
        }
    }

    // Check for real-time keywords
    for (const keyword of REAL_TIME_KEYWORDS) {
        if (normalizedQuery.includes(keyword.toLowerCase())) {
            return true
        }
    }

    // Check for real-time phrases
    for (const phrase of REAL_TIME_PHRASES) {
        if (normalizedQuery.includes(phrase.toLowerCase())) {
            return true
        }
    }

    // Check for question patterns that often need current data
    const questionPatterns = [
        /^(who|what|when|where|why|how) (is|are|was|were|did|does|do|has|have|will)/i,
        /\?$/  // Ends with question mark
    ]

    for (const pattern of questionPatterns) {
        if (pattern.test(normalizedQuery)) {
            // Additional check: does it reference current events?
            const eventKeywords = ['president', 'ceo', 'leader', 'champion', 'winner', 'trending']
            if (eventKeywords.some(k => normalizedQuery.includes(k))) {
                return true
            }
        }
    }

    return false
}

/**
 * Get search type recommendation based on query
 * @param query - The user's search query
 * @returns 'news' | 'academic' | 'general' | 'none'
 */
export function getRecommendedSearchType(query: string): 'news' | 'academic' | 'general' | 'none' {
    const normalizedQuery = query.toLowerCase().trim()

    // News-oriented keywords
    const newsKeywords = ['news', 'breaking', 'headlines', 'announced', 'released', 'update', 'latest']
    if (newsKeywords.some(k => normalizedQuery.includes(k))) {
        return 'news'
    }

    // Academic-oriented keywords
    const academicKeywords = ['research', 'study', 'paper', 'journal', 'scientific', 'academic', 'thesis']
    if (academicKeywords.some(k => normalizedQuery.includes(k))) {
        return 'academic'
    }

    // Check if should enable at all
    if (shouldEnableWebSearch(query)) {
        return 'general'
    }

    return 'none'
}

/**
 * Extract key search terms from a natural language query
 * @param query - The user's query
 * @returns string - Optimized search query
 */
export function optimizeSearchQuery(query: string): string {
    // Remove common filler words for better search results
    const fillerWords = [
        'please', 'can you', 'could you', 'would you', 'i want to know',
        'tell me', 'show me', 'find me', 'help me', 'i need',
        'what about', 'regarding', 'concerning', 'about the'
    ]

    let optimized = query.toLowerCase().trim()

    for (const filler of fillerWords) {
        optimized = optimized.replace(new RegExp(filler, 'gi'), ' ')
    }

    // Clean up extra spaces
    optimized = optimized.replace(/\s+/g, ' ').trim()

    return optimized
}

export const REAL_TIME_TRIGGER_KEYWORDS = REAL_TIME_KEYWORDS
