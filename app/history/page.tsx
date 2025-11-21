"use client"

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

type ChatSession = {
  id: string
  prompt: string
  response: string
  created_at: string
  tool: string
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setConversations([])
      setLoading(false)
      return
    }

    let isMounted = true

    const userId = user.id
    async function fetchHistory() {
      setLoading(true)
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id,prompt,response,created_at,tool')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(25)

      if (isMounted) {
        if (error) {
          console.error('Failed to load chat history', error)
          setConversations([])
        } else if (data) {
          setConversations(data as ChatSession[])
        }
        setLoading(false)
      }
    }

    fetchHistory()

    return () => {
      isMounted = false
    }
  }, [user])

  const placeholder = (
    <div className="rounded-lg bg-tera-muted p-6 text-center text-white/60">
      {user ? 'You have no conversations yet. Start chatting from the main page.' : 'Sign in to view your history.'}
    </div>
  )

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">TERA</p>
              <h1 className="text-3xl font-semibold leading-tight text-white">Chat History</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon">
                {user ? 'Refresh' : 'Browse plan'}
              </button>
            </div>
          </header>
          <div className="flex-1 rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md">
            <h2 className="text-xl font-semibold text-white mb-4">Your Recent Conversations</h2>
            <div className="space-y-4">
              {loading && <p className="text-white/60">Loading history…</p>}
              {!loading && conversations.length === 0 && placeholder}
              {conversations.map((conversation) => (
                <div key={conversation.id} className="rounded-2xl border border-white/10 bg-tera-muted p-4">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/40">{conversation.tool}</p>
                  <p className="mt-2 text-sm text-white/80">{conversation.prompt}</p>
                  <p className="mt-2 text-sm text-white/90">{conversation.response}</p>
                  <p className="mt-2 text-[0.6rem] uppercase tracking-[0.3em] text-white/40">
                    {new Date(conversation.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
