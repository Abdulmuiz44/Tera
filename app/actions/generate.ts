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
  attachments?: AttachmentReference[]
}

export async function generateAnswer({ prompt, tool, authorId, attachments = [] }: GenerateProps) {

  const answer = await generateTeacherResponse({ prompt, tool })

  await supabaseServer.from('chat_sessions').insert({
    user_id: authorId,
    tool,
    prompt,
    response: answer,
    attachments,
    created_at: new Date().toISOString()
  })

  revalidatePath('/')

  return answer
}
