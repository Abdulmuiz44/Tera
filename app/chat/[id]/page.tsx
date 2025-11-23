'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect } from 'react'

type ChatSession = {
  id: string
  prompt: string
  response: string
  tool: string
  attachments?: { name: string; url: string; type: string }[]
  created_at: string
}

export default function ChatSessionPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  useEffect(() => {
    async function loadSession() {
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('id,prompt,response,tool,attachments,created_at')
          .eq('id', params.id)
          .single()

        if (error || !data) {
          setError(true)
        } else {
          setSession(data as ChatSession)
        }
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-white/70">Loading...</div>
        </main>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-white/70">Unable to load chat session.</div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="relative flex-1 overflow-hidden px-6 py-10 transition-all duration-300">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Chat Session</h1>
              <p className="text-sm text-white/60">
                {new Date(session.created_at).toLocaleDateString()} at{' '}
                {new Date(session.created_at).toLocaleTimeString()}
              </p>
            </div>
            <Link
              href="/chat"
              className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wider text-white/70 transition hover:border-white hover:text-white"
            >
              Back to Chat
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto space-y-6">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl bg-white/10 px-6 py-4 text-white backdrop-blur-sm">
                <p className="whitespace-pre-wrap leading-relaxed">{session.prompt}</p>
                {session.attachments && session.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.attachments.map((att, idx) => (
                      <div key={idx} className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-xs">
                        <span>{att.type === 'image' ? '🖼️' : '📄'}</span>
                        <span className="truncate max-w-[150px]">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assistant Message */}
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="rounded-2xl bg-tera-panel border border-white/5 px-6 py-4 text-white/90 shadow-lg">
                  <p className="whitespace-pre-wrap leading-relaxed">{session.response}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
