"use server"

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { supabaseServer } from '@/lib/supabase-server'
import { generateTeacherResponse } from '@/lib/mistral'
import type { AttachmentReference } from '@/lib/attachment'
import { getUserProfile, incrementLessonPlans, incrementChats } from '@/lib/usage-tracking'
import { canGenerateLessonPlan, canStartChat, getPlanConfig } from '@/lib/plan-config'

type GenerateProps = {
  prompt: string
  tool: string
  authorId: string
  authorEmail?: string
  attachments?: AttachmentReference[]
  sessionId?: string | null
}

export async function generateAnswer({ prompt, tool, authorId, authorEmail, attachments = [], sessionId }: GenerateProps) {

  // Get user profile and check limits
  const userProfile = await getUserProfile(authorId)

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Check plan limits based on tool type
  const isLessonPlanTool = tool === 'lesson-plan-generator'
  const isChatTool = !isLessonPlanTool

  // Check if user has reached their limits
  if (isLessonPlanTool && !canGenerateLessonPlan(userProfile.subscriptionPlan, userProfile.monthlyLessonPlans)) {
    const planConfig = getPlanConfig(userProfile.subscriptionPlan)
    throw new Error(`You've reached your monthly limit of ${planConfig.limits.lessonPlansPerMonth} lesson plans. Upgrade to Pro for unlimited access.`)
  }

  if (isChatTool && !canStartChat(userProfile.subscriptionPlan, userProfile.monthlyChats)) {
    const planConfig = getPlanConfig(userProfile.subscriptionPlan)
    const limit = planConfig.limits.chatsPerMonth
    throw new Error(`You've reached your monthly limit of ${limit} chats. Upgrade to Pro for unlimited access.`)
  }

  // Generate the AI response
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

  // Increment usage counters after successful generation
  if (isLessonPlanTool) {
    await incrementLessonPlans(authorId)
  } else {
    await incrementChats(authorId)
  }

  revalidatePath('/')
  revalidatePath('/history')
  revalidatePath('/profile')

  return { answer, sessionId: currentSessionId }
}
