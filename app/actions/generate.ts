"use server"

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { generateTeacherResponse } from '@/lib/mistral'

type GenerateProps = {
  prompt: string
  tool: string
  authorId: string
}

export async function generateAnswer({ prompt, tool, authorId }: GenerateProps) {

  const answer = await generateTeacherResponse({ prompt, tool })

  await supabase.from('chat_sessions').insert({
    user_id: authorId,
    tool,
    prompt,
    response: answer,
    created_at: new Date().toISOString()
  })

  revalidatePath('/')

  return answer
}
