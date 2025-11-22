import Sidebar from '@/components/Sidebar'
import { supabaseServer } from '@/lib/supabase-server'
import Link from 'next/link'

export const revalidate = 30

type Props = {
  params: Promise<{
    id: string
  }>
}

type ChatSession = {
  id: string
  prompt: string
  response: string
  tool: string
  attachments?: { name: string; url: string; type: string }[]
  created_at: string
}

export default async function ChatSessionPage({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabaseServer
    .from('chat_sessions')
    .select('id,prompt,response,tool,attachments,created_at')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-white/70">Unable to load chat session.</div>
        </main>
      </div>
    )
  }

  const session = data as ChatSession

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">Tera</p>
              <h1 className="text-3xl font-semibold leading-tight text-white">Conversation</h1>
            </div>
            <Link
              href="/history"
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon"
            >
              Back to history
            </Link>
          </header>
          <div className="flex-1 rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md space-y-6">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/40">{session.tool}</p>
              <p className="mt-2 text-lg text-white">{session.prompt}</p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-white/80">{session.response}</p>
              <p className="mt-3 text-[0.6rem] uppercase tracking-[0.3em] text-white/40">
                {new Date(session.created_at).toLocaleString()}
              </p>
            </div>
            {session.attachments && session.attachments.length > 0 && (
              <div className="space-y-3">
                <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/40">Attachments</p>
                <div className="flex flex-col gap-3">
                  {session.attachments.map((attachment) => (
                    <a
                      key={attachment.url}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80"
                    >
                      <span>{attachment.name}</span>
                      <span className="text-white/40">{attachment.type}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
