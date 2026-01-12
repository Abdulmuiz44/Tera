'use client'

import React from 'react'

interface SourceCardProps {
    title: string
    url: string
    snippet: string
    source: string
    date?: string | null
    favicon?: string | null
    index: number
    onCitationClick?: (index: number) => void
    isHighlighted?: boolean
}

export default function SourceCard({
    title,
    url,
    snippet,
    source,
    date,
    favicon,
    index,
    onCitationClick,
    isHighlighted = false
}: SourceCardProps) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
        block rounded-xl border p-4 transition-all duration-200
        hover:shadow-lg hover:scale-[1.02]
        ${isHighlighted
                    ? 'border-tera-neon bg-tera-neon/10 shadow-md'
                    : 'border-tera-border bg-tera-muted hover:border-tera-neon/50'
                }
      `}
            onClick={(e) => {
                if (onCitationClick) {
                    e.preventDefault()
                    onCitationClick(index)
                }
            }}
        >
            <div className="flex items-start gap-3">
                {/* Source number badge */}
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-tera-neon/20 text-tera-neon text-xs font-bold flex items-center justify-center">
                    {index + 1}
                </span>

                <div className="flex-1 min-w-0">
                    {/* Header with favicon and source */}
                    <div className="flex items-center gap-2 mb-1">
                        {favicon && (
                            <img
                                src={favicon}
                                alt=""
                                className="w-4 h-4 rounded-sm"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                }}
                            />
                        )}
                        <span className="text-xs text-tera-secondary truncate">{source}</span>
                        {date && (
                            <span className="text-xs text-tera-secondary/60">
                                · {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h4 className="font-medium text-tera-primary line-clamp-2 mb-1">
                        {title}
                    </h4>

                    {/* Snippet */}
                    <p className="text-sm text-tera-secondary line-clamp-2">
                        {snippet}
                    </p>
                </div>

                {/* External link icon */}
                <svg
                    className="w-4 h-4 text-tera-secondary flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                </svg>
            </div>
        </a>
    )
}
