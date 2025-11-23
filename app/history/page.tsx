"use client"

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

type ChatSession = {
  id: string
  prompt: string
  response: string
  created_at: string
  tool: string
  attachments?: { name: string; url: string; type: string }[]
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
    let query = supabase
      .from('chat_sessions')
      .select('id,prompt,response,created_at,tool,attachments', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (searchQuery) {
      query = query.or(`prompt.ilike.%${searchQuery}%,response.ilike.%${searchQuery}%`)
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Failed to load chat history', error)
      setConversations([])
    } else if (data) {
      setConversations(data as ChatSession[])
      setHasMore(count ? from + data.length < count : false)
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
      .from('chat_sessions')
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
    <p className="text-white/60">{user ? 'No conversations found.' : 'Sign in to view your history.'}</p>
  )

  return (
    <div className="flex flex-col md:flex-row h-screen w-full md:ml-[88px]">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-white">Chat History</h1>
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
                className="rounded-lg border border-white/10 bg-tera-muted px-4 py-2 text-sm text-white placeholder-white/40 focus:border-tera-neon focus:outline-none"
              />
              <button
                onClick={handleExport}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon"
              >
                Export JSON
              </button>
            </div>
          </header>
          <div className="flex-1 rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md overflow-hidden flex flex-col">
            <h2 className="text-xl font-semibold text-white mb-4">Your Recent Conversations</h2>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {loading && <p className="text-white/60">Loading history...</p>}
              {!loading && conversations.length === 0 && placeholder}
              {conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href="/chat"
                  className="block rounded-2xl border border-white/10 bg-tera-muted p-4 transition hover:border-tera-neon"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-xs uppercase tracking-[0.4em] text-white/40">{conversation.tool}</p>
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">
                      {new Date(conversation.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-white/80 font-medium line-clamp-2">{conversation.prompt}</p>
                  <p className="mt-2 text-sm text-white/60 line-clamp-2">{conversation.response}</p>
                  {conversation.attachments && Array.isArray(conversation.attachments) && conversation.attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {conversation.attachments.map((attachment, idx) =>
                        attachment.type === 'image' ? (
                          <div key={idx} className="rounded-lg overflow-hidden border border-white/10">
                            <img src={attachment.url} alt={attachment.name} className="h-12 w-12 object-cover" />
                          </div>
                        ) : (
                          <div key={idx} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1">
                            <span className="text-xs">📄</span>
                            <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/70 truncate max-w-[100px]">{attachment.name}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="rounded-lg px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-white/60">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore || loading}
                className="rounded-lg px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
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
