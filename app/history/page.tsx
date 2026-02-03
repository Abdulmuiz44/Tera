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
      const { sessions, hasMore } = await fetchHistoryPageData(user.id, page, pageSize, searchQuery)
      setConversations(sessions)
      setHasMore(hasMore)

    } catch (err) {
      console.error('Unexpected error loading history:', err)
      setConversations([])
    }

    setLoading(false)
  }, [user, searchQuery, page])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleExport = () => {
    const data = conversations.map(c => ({
      sessionId: c.session_id,
      title: c.title,
      message: c.last_message,
      tool: c.tool,
      date: c.created_at
    }))

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tera-history-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const placeholder = (
    <p className="text-tera-secondary">{user ? 'No conversations found.' : 'Sign in to view your history.'}</p>
  )

  return (
    <div className="flex flex-col h-screen w-full bg-tera-bg text-tera-primary">
      <main className="relative flex-1 overflow-hidden px-6 py-10 transition-all duration-300">
        <div className="flex flex-col h-full gap-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-tera-primary">Chat History</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="rounded-lg border border-tera-border bg-tera-muted px-4 py-2 text-sm text-tera-primary placeholder-tera-secondary focus:border-tera-neon focus:outline-none"
              />
              <button
                onClick={handleExport}
                className="rounded-full border border-tera-border px-4 py-2 text-sm text-tera-primary transition hover:border-tera-neon"
              >
                Export JSON
              </button>
            </div>
          </header>
          <div className="flex-1 rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md overflow-hidden flex flex-col">
            <h2 className="text-xl font-semibold text-tera-primary mb-4">Your Recent Conversations</h2>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {loading && <p className="text-tera-secondary">Loading history...</p>}
              {!loading && conversations.length === 0 && placeholder}
              {conversations.map((conversation, index) => (
                <Link
                  key={`${conversation.session_id}-${conversation.created_at}-${index}`}
                  href={`/new/${conversation.session_id}`}
                  className="block rounded-2xl border border-tera-border bg-tera-muted p-4 transition hover:border-tera-neon"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase tracking-[0.4em] text-tera-secondary">{conversation.tool || 'Chat'}</p>
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-tera-secondary">
                      {new Date(conversation.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-tera-primary/90 font-medium line-clamp-2">{conversation.title || 'Untitled Chat'}</p>
                  <p className="mt-2 text-sm text-tera-secondary/80 line-clamp-2">{conversation.last_message}</p>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between border-t border-tera-border pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-lg px-4 py-2 text-sm text-tera-primary hover:bg-tera-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-tera-secondary">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore || loading}
                className="rounded-lg px-4 py-2 text-sm text-tera-primary hover:bg-tera-muted disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
