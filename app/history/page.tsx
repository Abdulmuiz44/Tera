"use client"

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

type ChatSession = {
  session_id: string
  title: string | null
  last_message: string
  created_at: string
  tool: string
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
      // Try to query the view first
      let query = supabase
        .from('distinct_chat_sessions')
        .select('session_id,title,last_message,created_at,tool', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,last_message.ilike.%${searchQuery}%`)
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query.range(from, to)

      if (error) {
        // If view doesn't exist, fall back to regular table
        console.warn('View not found, falling back to chat_sessions table:', error)

        const fallbackQuery = supabase
          .from('chat_sessions')
          .select('id,session_id,title,prompt,created_at,tool', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(from, to)

        const fallbackResult = await fallbackQuery

        if (fallbackResult.error) {
          console.error('Failed to load chat history', fallbackResult.error)
          setConversations([])
        } else if (fallbackResult.data) {
          // Transform to match ChatSession type
          const transformed = fallbackResult.data.map(item => ({
            session_id: item.session_id || item.id,
            title: item.title || null,
            last_message: item.prompt,
            created_at: item.created_at,
            tool: item.tool
          }))
          setConversations(transformed as ChatSession[])
          setHasMore(fallbackResult.count ? from + fallbackResult.data.length < fallbackResult.count : false)
        }
      } else if (data) {
        setConversations(data as ChatSession[])
        setHasMore(count ? from + data.length < count : false)
      }
    } catch (err) {
      console.error('Unexpected error loading history:', err)
      setConversations([])
    }

    setLoading(false)
  }, [user, searchQuery, page])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory()
    }, 500) // Debounce search

    return () => clearTimeout(timer)
  }, [fetchHistory])

  const handleExport = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('distinct_chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error || !data) {
      console.error('Export failed', error)
      return
    }

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
      {/* Sidebar handled by AppLayout */}
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
                  setPage(1) // Reset to first page on search
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
                  href={`/new?sessionId=${conversation.session_id}`}
                  className="block rounded-2xl border border-tera-border bg-tera-muted p-4 transition hover:border-tera-neon"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase tracking-[0.4em] text-tera-secondary">{conversation.tool}</p>
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
