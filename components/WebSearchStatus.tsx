'use client'

import React, { useEffect, useState } from 'react'

interface WebSearchStatusProps {
  isSearching: boolean
  query?: string
  status?: 'idle' | 'searching' | 'processing' | 'complete'
  resultCount?: number
  error?: string
}

export default function WebSearchStatus({
  isSearching,
  query = '',
  status = 'searching',
  resultCount = 0,
  error
}: WebSearchStatusProps) {
  const [dots, setDots] = useState(0)

  useEffect(() => {
    if (!isSearching) return

    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4)
    }, 500)

    return () => clearInterval(interval)
  }, [isSearching])

  const dotDisplay = '.'.repeat(dots)

  if (error) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%]">
          <div className="flex items-start gap-3 rounded-2xl bg-tera-muted border border-tera-border px-6 py-4 text-tera-primary">
            <span className="text-lg mt-1">⚠️</span>
            <div className="flex-1">
              <div className="font-medium">Web Search Failed</div>
              <div className="text-sm text-tera-secondary mt-1">{error}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isSearching && resultCount === 0) {
    return null
  }

  if (isSearching) {
    const statusTextMap: Record<string, string> = {
      searching: 'Searching the web',
      processing: 'Processing queries',
      complete: 'Synthesis complete',
      idle: 'Preparing search'
    }
    const statusText = statusTextMap[status] || 'Searching the web'

    return (
      <div className="flex justify-start">
        <div className="max-w-[85%]">
          <div className="flex items-start gap-3 rounded-2xl bg-tera-muted border border-tera-border px-6 py-4 text-tera-primary">
            <div className="mt-1">
              <span className="text-xl">🔍</span>
            </div>
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {statusText}{dotDisplay}
              </div>
              {query && (
                <div className="text-sm text-tera-secondary mt-1">
                  Query: <span className="text-tera-primary">{query}</span>
                </div>
              )}
              <div className="mt-2 flex gap-1">
                <span className="inline-block w-2 h-2 bg-tera-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="inline-block w-2 h-2 bg-tera-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="inline-block w-2 h-2 bg-tera-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'complete' && resultCount > 0) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%]">
          <div className="flex items-start gap-3 rounded-2xl bg-tera-muted border border-tera-border px-6 py-4 text-tera-primary">
            <span className="text-lg mt-1">✅</span>
            <div className="flex-1">
              <div className="font-medium">Web search complete</div>
              <div className="text-sm text-tera-secondary mt-1">
                Found {resultCount} relevant result{resultCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
