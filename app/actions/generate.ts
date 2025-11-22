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
}

export async function generateAnswer({ prompt, tool, authorId, authorEmail, attachments = [] }: GenerateProps) {

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

  const { data, error } = await supabaseServer.from('chat_sessions').insert({
    user_id: authorId,
    tool,
    prompt,
    response: answer,
    attachments,
    created_at: new Date().toISOString()
  })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  revalidatePath('/')
  revalidatePath('/history')

  return { answer, sessionId: data?.id ?? null }
}
