"use server"

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { supabaseServer } from '@/lib/supabase-server'
import { generateTeacherResponse } from '@/lib/mistral'
import type { AttachmentReference } from '@/lib/attachment'
import { getUserProfile, incrementLessonPlans, incrementChats, incrementFileUploads } from '@/lib/usage-tracking'
import { canGenerateLessonPlan, canStartChat, canUploadFile, canPerformWebSearch, getPlanConfig } from '@/lib/plan-config'
import { getWebSearchRemaining } from '@/lib/web-search-usage'

type GenerateProps = {
  prompt: string
  tool: string
  authorId: string
  authorEmail?: string
  attachments?: AttachmentReference[]
  sessionId?: string | null
  chatId?: string
  enableWebSearch?: boolean
}

export async function generateAnswer({ prompt, tool, authorId, authorEmail, attachments = [], sessionId, chatId, enableWebSearch = false }: GenerateProps) {

  // Ensure user exists in users table FIRST
  if (authorId && authorEmail) {
    const { error } = await supabaseServer.from('users').upsert({
      id: authorId,
      email: authorEmail
    }, {
      onConflict: 'id'
    })

    if (error) {
      console.error('Error creating/updating user:', error)
    }
  }

  // Get user profile and check limits
  let userProfile = await getUserProfile(authorId)

  // If profile still doesn't exist, create a default one
  if (!userProfile) {
    console.warn('User profile not found, creating default profile for:', authorId)
    userProfile = {
      id: authorId,
      email: authorEmail || '',
      subscriptionPlan: 'free',
      monthlyLessonPlans: 0,
      dailyChats: 0,
      dailyFileUploads: 0,
      planResetDate: null,
      chatResetDate: null,
      profileImageUrl: null,
      fullName: null,
      school: null,
      gradeLevels: null,
      createdAt: new Date()
    }
  }

  // Check file upload limits if attachments are present
  if (attachments.length > 0 && !canUploadFile(userProfile.subscriptionPlan, userProfile.dailyFileUploads)) {
    const planConfig = getPlanConfig(userProfile.subscriptionPlan)
    const limit = planConfig.limits.fileUploadsPerDay
    throw new Error(`You've reached your daily limit of ${limit} file uploads. Upgrade to Pro for unlimited access.`)
  }

  // Check plan limits based on tool type
  const isLessonPlanTool = tool === 'lesson-plan-generator'
  const isChatTool = !isLessonPlanTool

  // Check if user has reached their limits
  if (isLessonPlanTool && !canGenerateLessonPlan(userProfile.subscriptionPlan, userProfile.monthlyLessonPlans)) {
    const planConfig = getPlanConfig(userProfile.subscriptionPlan)
    throw new Error(`You've reached your monthly limit of ${planConfig.limits.lessonPlansPerMonth} lesson plans. Upgrade to Pro for unlimited access.`)
  }

  if (isChatTool && !canStartChat(userProfile.subscriptionPlan, userProfile.dailyChats)) {
    const planConfig = getPlanConfig(userProfile.subscriptionPlan)
    const limit = planConfig.limits.chatsPerDay
    throw new Error(`You've reached your daily limit of ${limit} chats. Upgrade to Pro for unlimited access.`)
  }

  // Check web search limits if enabled
  if (enableWebSearch) {
    const { remaining } = await getWebSearchRemaining(authorId)
    if (remaining <= 0) {
      throw new Error('limit web-search')
    }
  }

  // Fetch chat history if sessionId exists
  let history: { role: 'user' | 'assistant'; content: string }[] = []

  if (sessionId) {
    const { data: historyData } = await supabaseServer
      .from('chat_sessions')
      .select('prompt, response, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (historyData) {
      // Format history and reverse to chronological order
      history = historyData
        .map(msg => [
          { role: 'user' as const, content: msg.prompt },
          { role: 'assistant' as const, content: msg.response }
        ])
        .flat()
        .reverse()
    }
  }

  // Generate the AI response
  const answer = await generateTeacherResponse({ prompt, tool, attachments, history, userId: authorId, enableWebSearch })

  const currentSessionId = sessionId || crypto.randomUUID()
  // Simple title generation: first 50 chars of prompt
  const title = sessionId ? undefined : prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '')

  let savedChatId = chatId

  if (chatId) {
    // Update existing row
    const { error } = await supabaseServer
      .from('chat_sessions')
      .update({
        prompt,
        response: answer,
        attachments,
        // We don't update created_at or session_id usually, but ensure they match just in case?
        // Usually just updating content is enough.
      })
      .eq('id', chatId)
      .eq('user_id', authorId)

    if (error) {
      throw error
    }
  } else {
    // Insert new row
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
     if (data?.id) {
       savedChatId = data.id
     }
  }

  // Increment usage counters after successful generation
  if (isLessonPlanTool) {
    await incrementLessonPlans(authorId)
  } else {
    await incrementChats(authorId)
  }

  // Increment file upload counter if attachments were used
  if (attachments.length > 0) {
    await incrementFileUploads(authorId, attachments.length)
  }

  revalidatePath('/')
  revalidatePath('/history')
  revalidatePath('/profile')

  return { answer, sessionId: currentSessionId, chatId: savedChatId }
}
