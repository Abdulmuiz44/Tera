'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { fetchHistoryPageData } from '@/app/actions/user'

interface ChatSession {
  id?: string
  title?: string | null
  created_at: string
  session_id: string
  last_message?: string | null
  tool?: string
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const pageSize = 25

  const fetchHistory = useCallback(async () => {
    if (!user) {
      setConversations([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const result = await fetchHistoryPageData(user.id, page, pageSize, searchQuery)
      setConversations(result.sessions)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Unexpected error loading history:', error)
      setConversations([])
    }

    setLoading(false)
  }, [page, pageSize, searchQuery, user])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleExport = () => {
    const data = conversations.map((conversation) => ({
      sessionId: conversation.session_id,
      title: conversation.title,
      message: conversation.last_message,
      tool: conversation.tool,
      date: conversation.created_at,
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `tera-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="tera-page">
      <div className="tera-page-shell pt-24 md:pt-10">
        <div className="tera-page-header">
          <div>
            <p className="tera-eyebrow">Workspace</p>
            <h1 className="tera-title mt-3">Chat history</h1>
            <p className="tera-subtitle mt-4">Search recent sessions, reopen previous conversations, or export a clean JSON archive.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search history"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setPage(1)
              }}
              className="tera-input min-w-[16rem]"
            />
            <button type="button" onClick={handleExport} className="tera-button-secondary">
              Export JSON
            </button>
          </div>
        </div>

        <div className="tera-surface mt-8 flex min-h-[60vh] flex-col p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-tera-border pb-5">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.3em] text-tera-secondary">Sessions</p>
              <h2 className="mt-2 text-xl font-semibold text-tera-primary">Your recent conversations</h2>
            </div>
            <p className="text-sm text-tera-secondary">Page {page}</p>
          </div>

          <div className="custom-scrollbar mt-6 flex-1 space-y-4 overflow-y-auto pr-2">
            {loading && <p className="text-sm text-tera-secondary">Loading history...</p>}
            {!loading && !user && <p className="text-sm text-tera-secondary">Sign in to view your history.</p>}
            {!loading && user && conversations.length === 0 && <p className="text-sm text-tera-secondary">No conversations found.</p>}
            {conversations.map((conversation, index) => (
              <Link
                key={`${conversation.session_id}-${conversation.created_at}-${index}`}
                href={`/new/${conversation.session_id}`}
                className="block rounded-[24px] border border-tera-border bg-white/[0.04] p-5 transition hover:border-white/16 hover:bg-white/[0.06]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="text-[0.62rem] uppercase tracking-[0.3em] text-tera-secondary">{conversation.tool || 'Chat'}</p>
                    <p className="mt-2 truncate text-base font-medium text-tera-primary">{conversation.title || 'Untitled chat'}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-tera-secondary">{conversation.last_message}</p>
                  </div>
                  <p className="shrink-0 text-xs uppercase tracking-[0.22em] text-tera-secondary">
                    {new Date(conversation.created_at).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-tera-border pt-5">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || loading}
              className="tera-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={!hasMore || loading}
              className="tera-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
