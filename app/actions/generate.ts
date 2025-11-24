"use server"

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { supabaseServer } from '@/lib/supabase-server'
import { generateTeacherResponse } from '@/lib/mistral'
import type { AttachmentReference } from '@/lib/attachment'

type GenerateProps = {
  prompt: string
  tool: string
  authorId: string
  authorEmail?: string
  attachments?: AttachmentReference[]
  sessionId?: string | null
}

export async function generateAnswer({ prompt, tool, authorId, authorEmail, attachments = [], sessionId }: GenerateProps) {

  const answer = await generateTeacherResponse({ prompt, tool, attachments })

  // Ensure user exists in users table before inserting chat session
  if (authorId && authorEmail) {
    await supabaseServer.from('users').upsert({
      id: authorId,
      email: authorEmail
    }, {
      onConflict: 'id'
    })
  }

  const currentSessionId = sessionId || crypto.randomUUID()
  // Simple title generation: first 50 chars of prompt
  const title = sessionId ? undefined : prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '')

  const { data, error } = await supabaseServer.from('chat_sessions').insert({
    user_id: authorId,
    tool,
    prompt,
    response: answer,
    attachments,
    created_at: new Date().toISOString(),
    session_id: currentSessionId,
    title: title
  })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  revalidatePath('/')
  revalidatePath('/history')

  return { answer, sessionId: currentSessionId }
}
