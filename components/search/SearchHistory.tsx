'use client'

import React, { useState, useEffect } from 'react'
import {
    getSearchHistory,
    clearSearchHistory,
    getBookmarks,
    deleteBookmark,
    type SearchHistoryEntry,
    type SearchBookmark
} from '@/app/actions/search'

interface SearchHistoryProps {
    userId: string
    onSelectQuery: (query: string) => void
    onSelectBookmark: (url: string) => void
}

export default function SearchHistory({ userId, onSelectQuery, onSelectBookmark }: SearchHistoryProps) {
    const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history')
    const [history, setHistory] = useState<SearchHistoryEntry[]>([])
    const [bookmarks, setBookmarks] = useState<SearchBookmark[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [userId, activeTab])

    const loadData = async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'history') {
                const data = await getSearchHistory(userId)
                setHistory(data)
            } else {
                const data = await getBookmarks(userId)
                setBookmarks(data)
            }
        } catch (error) {
            console.error('Failed to load search data', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClearHistory = async () => {
        if (confirm('Are you sure you want to clear your entire search history?')) {
            await clearSearchHistory(userId)
            setHistory([])
        }
    }

    const handleDeleteBookmark = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        await deleteBookmark(userId, id)
        setBookmarks(prev => prev.filter(b => b.id !== id))
    }

    return (
        <div className="w-full max-w-md bg-tera-panel border border-tera-border rounded-xl overflow-hidden shadow-xl">
            {/* Tabs */}
            <div className="flex border-b border-tera-border">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'history'
                        ? 'bg-tera-muted text-tera-primary border-b-2 border-tera-neon'
                        : 'text-tera-secondary hover:text-tera-primary hover:bg-tera-muted/50'
                        }`}
                >
                    🕒 History
                </button>
                <button
                    onClick={() => setActiveTab('bookmarks')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'bookmarks'
                        ? 'bg-tera-muted text-tera-primary border-b-2 border-tera-neon'
                        : 'text-tera-secondary hover:text-tera-primary hover:bg-tera-muted/50'
                        }`}
                >
                    🔖 Bookmarks
                </button>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto p-2">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-6 h-6 border-2 border-tera-neon border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activeTab === 'history' ? (
                    <div className="space-y-1">
                        {history.length === 0 ? (
                            <div className="text-center p-8 text-tera-secondary text-sm">
                                No search history yet
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-end px-2 py-1">
                                    <button
                                        onClick={handleClearHistory}
                                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Clear History
                                    </button>
                                </div>
                                {history.map((entry) => (
                                    <button
                                        key={entry.id}
                                        onClick={() => onSelectQuery(entry.query)}
                                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-tera-muted/50 transition-colors text-left group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-tera-primary truncate">{entry.query}</p>
                                            <p className="text-xs text-tera-secondary">
                                                {new Date(entry.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="text-xs text-tera-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                                            ↗
                                        </span>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {bookmarks.length === 0 ? (
                            <div className="text-center p-8 text-tera-secondary text-sm">
                                No bookmarks saved yet
                            </div>
                        ) : (
                            bookmarks.map((bookmark) => (
                                <div
                                    key={bookmark.id}
                                    onClick={() => onSelectBookmark(bookmark.url)}
                                    className="w-full p-3 rounded-lg border border-tera-border bg-tera-muted/20 hover:bg-tera-muted/50 transition-colors cursor-pointer group relative"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-tera-primary line-clamp-1">
                                                {bookmark.title}
                                            </h4>
                                            <p className="text-xs text-tera-secondary mt-1 line-clamp-2">
                                                {bookmark.snippet}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-tera-secondary/80 bg-tera-muted px-1.5 py-0.5 rounded">
                                                    {bookmark.source}
                                                </span>
                                                <span className="text-[10px] text-tera-secondary/60">
                                                    {new Date(bookmark.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteBookmark(bookmark.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-tera-secondary hover:text-red-400 transition-all"
                                            title="Remove bookmark"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
