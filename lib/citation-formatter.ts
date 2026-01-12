/**
 * Citation Formatter
 * Formats search sources into standard academic citation formats
 */

export interface CitationSource {
    title: string
    url: string
    source: string
    date?: string | null
    author?: string | null
}

export type CitationFormat = 'apa' | 'mla' | 'chicago'

/**
 * Format a source as an APA citation
 * Format: Author/Source. (Year, Month Day). Title. Source. URL
 */
function formatAPA(source: CitationSource): string {
    const date = source.date ? new Date(source.date) : new Date()
    const year = date.getFullYear()
    const month = date.toLocaleDateString('en-US', { month: 'long' })
    const day = date.getDate()

    const author = source.author || source.source

    return `${author}. (${year}, ${month} ${day}). ${source.title}. ${source.source}. ${source.url}`
}

/**
 * Format a source as an MLA citation
 * Format: Author/Source. "Title." Source, Date, URL.
 */
function formatMLA(source: CitationSource): string {
    const date = source.date ? new Date(source.date) : new Date()
    const formattedDate = date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })

    const author = source.author || source.source

    return `${author}. "${source.title}." ${source.source}, ${formattedDate}, ${source.url}.`
}

/**
 * Format a source as a Chicago citation
 * Format: Author/Source. "Title." Source. Last modified Date. URL.
 */
function formatChicago(source: CitationSource): string {
    const date = source.date ? new Date(source.date) : new Date()
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

    const author = source.author || source.source

    return `${author}. "${source.title}." ${source.source}. Last modified ${formattedDate}. ${source.url}.`
}

/**
 * Format a single source in the specified citation format
 */
export function formatCitation(source: CitationSource, format: CitationFormat): string {
    switch (format) {
        case 'apa':
            return formatAPA(source)
        case 'mla':
            return formatMLA(source)
        case 'chicago':
            return formatChicago(source)
        default:
            return formatAPA(source)
    }
}

/**
 * Format multiple sources into a bibliography
 */
export function formatBibliography(sources: CitationSource[], format: CitationFormat): string {
    const citations = sources.map((source, index) => {
        const citation = formatCitation(source, format)
        return `[${index + 1}] ${citation}`
    })

    return citations.join('\n\n')
}

/**
 * Get the display name for a citation format
 */
export function getFormatDisplayName(format: CitationFormat): string {
    switch (format) {
        case 'apa':
            return 'APA (7th Edition)'
        case 'mla':
            return 'MLA (9th Edition)'
        case 'chicago':
            return 'Chicago (17th Edition)'
        default:
            return format.toUpperCase()
    }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch (error) {
        // Fallback for older browsers
        try {
            const textarea = document.createElement('textarea')
            textarea.value = text
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            return true
        } catch {
            console.error('Failed to copy to clipboard:', error)
            return false
        }
    }
}

export const CITATION_FORMATS: CitationFormat[] = ['apa', 'mla', 'chicago']
