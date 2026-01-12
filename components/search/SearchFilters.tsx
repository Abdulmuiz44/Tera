'use client'

import React from 'react'

interface SearchFiltersProps {
    contentType: 'all' | 'news' | 'academic' | 'videos' | 'images'
    dateRange: 'all' | 'day' | 'week' | 'month' | 'year'
    onContentTypeChange: (type: 'all' | 'news' | 'academic' | 'videos' | 'images') => void
    onDateRangeChange: (range: 'all' | 'day' | 'week' | 'month' | 'year') => void
    compact?: boolean
}

const CONTENT_TYPES = [
    { value: 'all', label: 'All', icon: '🔍' },
    { value: 'news', label: 'News', icon: '📰' },
    { value: 'academic', label: 'Academic', icon: '📚' },
    { value: 'videos', label: 'Videos', icon: '🎬' },
    { value: 'images', label: 'Images', icon: '🖼️' }
] as const

const DATE_RANGES = [
    { value: 'all', label: 'Any time' },
    { value: 'day', label: 'Last 24h' },
    { value: 'week', label: 'Past week' },
    { value: 'month', label: 'Past month' },
    { value: 'year', label: 'Past year' }
] as const

export default function SearchFilters({
    contentType,
    dateRange,
    onContentTypeChange,
    onDateRangeChange,
    compact = true
}: SearchFiltersProps) {
    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {/* Content type chips */}
                <div className="flex gap-1 bg-tera-muted rounded-lg p-1">
                    {CONTENT_TYPES.map(type => (
                        <button
                            key={type.value}
                            onClick={() => onContentTypeChange(type.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${contentType === type.value
                                    ? 'bg-tera-neon text-black'
                                    : 'text-tera-secondary hover:text-tera-primary hover:bg-tera-bg'
                                }`}
                        >
                            <span>{type.icon}</span>
                            <span className="hidden sm:inline">{type.label}</span>
                        </button>
                    ))}
                </div>

                {/* Date range selector */}
                <select
                    value={dateRange}
                    onChange={(e) => onDateRangeChange(e.target.value as typeof dateRange)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-tera-muted border border-tera-border text-tera-primary focus:outline-none focus:border-tera-neon"
                >
                    {DATE_RANGES.map(range => (
                        <option key={range.value} value={range.value}>
                            {range.label}
                        </option>
                    ))}
                </select>
            </div>
        )
    }

    // Full view
    return (
        <div className="p-4 rounded-xl bg-tera-muted border border-tera-border space-y-4">
            <div>
                <label className="text-sm font-medium text-tera-primary mb-2 block">Content Type</label>
                <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map(type => (
                        <button
                            key={type.value}
                            onClick={() => onContentTypeChange(type.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${contentType === type.value
                                    ? 'bg-tera-neon text-black'
                                    : 'bg-tera-bg border border-tera-border text-tera-secondary hover:text-tera-primary hover:border-tera-neon/50'
                                }`}
                        >
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-tera-primary mb-2 block">Date Range</label>
                <div className="flex flex-wrap gap-2">
                    {DATE_RANGES.map(range => (
                        <button
                            key={range.value}
                            onClick={() => onDateRangeChange(range.value)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${dateRange === range.value
                                    ? 'bg-tera-neon text-black'
                                    : 'bg-tera-bg border border-tera-border text-tera-secondary hover:text-tera-primary hover:border-tera-neon/50'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
