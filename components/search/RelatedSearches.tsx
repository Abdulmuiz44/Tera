'use client'

import React from 'react'

interface RelatedSearchesProps {
    searches: string[]
    onSearchClick: (query: string) => void
    isLoading?: boolean
}

export default function RelatedSearches({
    searches,
    onSearchClick,
    isLoading = false
}: RelatedSearchesProps) {
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 flex-wrap mt-4">
                <span className="text-sm text-tera-secondary">Related:</span>
                {[1, 2, 3].map(i => (
                    <div
                        key={i}
                        className="h-8 w-24 rounded-full bg-tera-muted animate-pulse"
                    />
                ))}
            </div>
        )
    }

    if (searches.length === 0) {
        return null
    }

    return (
        <div className="flex items-center gap-2 flex-wrap mt-4">
            <span className="text-sm text-tera-secondary flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Related:
            </span>
            {searches.map((search, index) => (
                <button
                    key={index}
                    onClick={() => onSearchClick(search)}
                    className="px-3 py-1.5 text-sm rounded-full bg-tera-muted border border-tera-border text-tera-secondary hover:text-tera-primary hover:border-tera-neon/50 hover:bg-tera-neon/10 transition-colors"
                >
                    {search}
                </button>
            ))}
        </div>
    )
}
