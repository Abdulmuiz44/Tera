'use client'

import React from 'react'

interface ResearchModeToggleProps {
    enabled: boolean
    onToggle: (enabled: boolean) => void
    isSearching?: boolean
    sourceCount?: number
}

export default function ResearchModeToggle({
    enabled,
    onToggle,
    isSearching = false,
    sourceCount = 0
}: ResearchModeToggleProps) {
    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => onToggle(!enabled)}
                disabled={isSearching}
                className={`
          relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
          transition-all duration-200
          ${enabled
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50 text-purple-300'
                        : 'bg-tera-muted border border-tera-border text-tera-secondary hover:border-purple-500/30'
                    }
          ${isSearching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
            >
                {/* Icon */}
                <svg
                    className={`w-4 h-4 ${enabled ? 'text-purple-400' : 'text-tera-secondary'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                </svg>

                <span>Deep Research</span>

                {/* Toggle indicator */}
                <div
                    className={`
            w-8 h-4 rounded-full transition-colors duration-200
            ${enabled ? 'bg-purple-500' : 'bg-tera-border'}
          `}
                >
                    <div
                        className={`
              w-3 h-3 rounded-full bg-white transition-transform duration-200 mt-0.5
              ${enabled ? 'translate-x-4.5 ml-4' : 'translate-x-0.5 ml-0.5'}
            `}
                    />
                </div>
            </button>

            {/* Status indicator when researching */}
            {isSearching && enabled && (
                <div className="flex items-center gap-2 text-sm text-purple-400">
                    <div className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Researching from {sourceCount}+ sources</span>
                </div>
            )}

            {/* Info tooltip */}
            {enabled && !isSearching && (
                <span className="text-xs text-tera-secondary">
                    Searches 20+ sources for comprehensive results
                </span>
            )}
        </div>
    )
}
