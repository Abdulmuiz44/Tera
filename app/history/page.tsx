'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'

interface ChatSession {
  id: string
  title: string
  created_at: string
  session_id: string
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchSessions = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at, session_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) {
        setSessions(data as ChatSession[])
      }
      setLoading(false)
    }

    fetchSessions()
  }, [user])

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Chat History</h1>

          {loading ? (
            <div className="text-center text-gray-600 dark:text-gray-400">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No chat history yet</p>
              <Link
                href="/new"
                className="inline-block px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition"
              >
                Start a new chat
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/new/${session.session_id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <h3 className="font-medium text-black dark:text-white truncate">
                    {session.title || 'Untitled chat'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {new Date(session.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
