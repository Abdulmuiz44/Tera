'use client'

import React, { useState } from 'react'
import {
    formatCitation,
    formatBibliography,
    copyToClipboard,
    CITATION_FORMATS,
    getFormatDisplayName,
    type CitationFormat,
    type CitationSource
} from '@/lib/citation-formatter'

interface CitationExportProps {
    sources: CitationSource[]
    compact?: boolean
}

export default function CitationExport({ sources, compact = true }: CitationExportProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFormat, setSelectedFormat] = useState<CitationFormat>('apa')
    const [copySuccess, setCopySuccess] = useState<string | null>(null)

    if (sources.length === 0) {
        return null
    }

    const handleCopyAll = async () => {
        const bibliography = formatBibliography(sources, selectedFormat)
        const success = await copyToClipboard(bibliography)

        if (success) {
            setCopySuccess('all')
            setTimeout(() => setCopySuccess(null), 2000)
        }
    }

    const handleCopySingle = async (index: number) => {
        const citation = formatCitation(sources[index], selectedFormat)
        const success = await copyToClipboard(citation)

        if (success) {
            setCopySuccess(`single-${index}`)
            setTimeout(() => setCopySuccess(null), 2000)
        }
    }

    if (compact) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-tera-muted border border-tera-border hover:border-tera-neon/50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Cite</span>
                </button>

                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-tera-bg border border-tera-border shadow-xl z-50 overflow-hidden">
                            {/* Format selector */}
                            <div className="p-3 border-b border-tera-border">
                                <label className="text-xs text-tera-secondary mb-2 block">Citation Format</label>
                                <div className="flex gap-1">
                                    {CITATION_FORMATS.map(format => (
                                        <button
                                            key={format}
                                            onClick={() => setSelectedFormat(format)}
                                            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedFormat === format
                                                    ? 'bg-tera-neon text-black'
                                                    : 'bg-tera-muted text-tera-secondary hover:text-tera-primary'
                                                }`}
                                        >
                                            {format.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Copy all button */}
                            <div className="p-3 border-b border-tera-border">
                                <button
                                    onClick={handleCopyAll}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-tera-neon/20 text-tera-neon hover:bg-tera-neon/30 transition-colors"
                                >
                                    {copySuccess === 'all' ? (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span>Copy All Citations</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Individual citations */}
                            <div className="max-h-60 overflow-y-auto p-3 space-y-2">
                                {sources.map((source, index) => (
                                    <div
                                        key={index}
                                        className="p-2 rounded-lg bg-tera-muted text-xs"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-tera-secondary line-clamp-2 flex-1">
                                                <span className="font-medium text-tera-primary">[{index + 1}]</span>{' '}
                                                {formatCitation(source, selectedFormat)}
                                            </p>
                                            <button
                                                onClick={() => handleCopySingle(index)}
                                                className="flex-shrink-0 p-1 rounded hover:bg-tera-border transition-colors"
                                            >
                                                {copySuccess === `single-${index}` ? (
                                                    <svg className="w-3.5 h-3.5 text-tera-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5 text-tera-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        )
    }

    // Full view (non-compact)
    return (
        <div className="rounded-xl bg-tera-muted border border-tera-border p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-tera-primary">Export Citations</h3>
                <div className="flex gap-1">
                    {CITATION_FORMATS.map(format => (
                        <button
                            key={format}
                            onClick={() => setSelectedFormat(format)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${selectedFormat === format
                                    ? 'bg-tera-neon text-black'
                                    : 'bg-tera-bg text-tera-secondary hover:text-tera-primary'
                                }`}
                        >
                            {format.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleCopyAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-tera-neon text-black font-medium hover:bg-tera-neon/90 transition-colors"
            >
                {copySuccess === 'all' ? 'Copied to Clipboard!' : `Copy All ${sources.length} Citations`}
            </button>
        </div>
    )
}
