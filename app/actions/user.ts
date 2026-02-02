'use server'

import { getUserProfileServer, checkAndResetUsageServer } from '@/lib/usage-tracking-server'
import { supabaseServer } from '@/lib/supabase-server'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function fetchUserProfile(userId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.id !== userId) return null

        const profile = await getUserProfileServer(userId)
        return profile
    } catch (error) {
        console.error('Error fetching user profile:', error)
        return null
    }
}

export async function updateUserProfile(userId: string, updates: any) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.id !== userId) return false

        const dbUpdates: any = {}
        if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName
        if (updates.school !== undefined) dbUpdates.school = updates.school
        if (updates.gradeLevels !== undefined) dbUpdates.grade_levels = updates.gradeLevels
        if (updates.profileImageUrl !== undefined) dbUpdates.profile_image_url = updates.profileImageUrl

        const { error } = await supabaseServer
            .from('users')
            .update(dbUpdates)
            .eq('id', userId)

        if (error) throw error
        revalidatePath('/profile')
        return true
    } catch (error) {
        console.error('Error updating profile:', error)
        return false
    }
}

export async function checkLimitReset(userId: string) {
    const session = await auth()
    if (!session?.user?.id || session.user.id !== userId) return null
    return await checkAndResetUsageServer(userId)
}

export async function fetchUserSessions(userId: string, limit: number = 20) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.id !== userId) return []

        const { data, error } = await supabaseServer
            .from('chat_sessions')
            .select('session_id, title, created_at, prompt, tool')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        // De-duplicate by session_id
        const uniqueSessions = Array.from(new Map(data.map((item: any) => [item.session_id, item])).values())
        return uniqueSessions
    } catch (error) {
        console.error('Error fetching sessions:', error)
        return []
    }
}

export async function fetchChatHistory(userId: string, sessionId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id || session.user.id !== userId) return []

        const { data, error } = await supabaseServer
            .from('chat_sessions')
            .select('id, prompt, response, attachments, created_at')
            .eq('user_id', userId)
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .limit(50)

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching chat history:', error)
        return []
    }
}
