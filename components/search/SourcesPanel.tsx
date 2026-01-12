'use client'

import React, { useState } from 'react'
import SourceCard from './SourceCard'
import CitationExport from './CitationExport'

interface Source {
    title: string
    url: string
    snippet: string
    source: string
    date?: string | null
    favicon?: string | null
}

interface SourcesPanelProps {
    sources: Source[]
    highlightedIndex?: number
    onSourceClick?: (index: number) => void
    collapsible?: boolean
    defaultExpanded?: boolean
}

export default function SourcesPanel({
    sources,
    highlightedIndex,
    onSourceClick,
    collapsible = true,
    defaultExpanded = false
}: SourcesPanelProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    if (sources.length === 0) {
        return null
    }

    const content = (
        <div className="space-y-3">
            {/* Header with export options */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    <span className="font-medium text-tera-primary">
                        {sources.length} Source{sources.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <CitationExport sources={sources} />
            </div>

            {/* Source cards grid */}
            <div className="grid gap-3 sm:grid-cols-2">
                {sources.map((source, index) => (
                    <SourceCard
                        key={`${source.url}-${index}`}
                        {...source}
                        index={index}
                        isHighlighted={highlightedIndex === index}
                        onCitationClick={onSourceClick}
                    />
                ))}
            </div>
        </div>
    )

    if (!collapsible) {
        return (
            <div className="mt-4 p-4 rounded-2xl bg-tera-muted/50 border border-tera-border">
                {content}
            </div>
        )
    }

    return (
        <div className="mt-4 rounded-2xl bg-tera-muted/50 border border-tera-border overflow-hidden">
            {/* Collapsible header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-tera-muted transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">📚</span>
                    <span className="font-medium text-tera-primary">
                        View {sources.length} Source{sources.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <svg
                    className={`w-5 h-5 text-tera-secondary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expandable content */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="p-4 pt-0 border-t border-tera-border">
                    {content}
                </div>
            </div>
        </div>
    )
}
