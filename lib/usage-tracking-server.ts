import { supabaseServer } from './supabase-server'

/**
 * Check if counters need to be reset (Server Side)
 */
export async function checkAndResetUsageServer(userId: string): Promise<boolean> {
    const { data, error } = await supabaseServer
        .from('users')
        .select('chat_reset_date')
        .eq('id', userId)
        .single()

    if (error || !data) return false

    const now = new Date()
    const updates: Record<string, any> = {}
    let needsUpdate = false

    // Check daily chat reset
    if (data.chat_reset_date && now >= new Date(data.chat_reset_date)) {
        const nextChatResetDate = new Date(now)
        nextChatResetDate.setDate(nextChatResetDate.getDate() + 1)
        updates.daily_chats = 0
        updates.daily_file_uploads = 0
        updates.chat_reset_date = nextChatResetDate.toISOString()
        needsUpdate = true
    }

    if (needsUpdate) {
        const { error: updateError } = await supabaseServer
            .from('users')
            .update(updates)
            .eq('id', userId)

        if (updateError) {
            console.error('Error resetting usage (server):', updateError)
            return false
        }
        return true
    }

    return false
}

/**
 * Increment chat counter (Server Side)
 */
export async function incrementChatsServer(userId: string): Promise<boolean> {
    // First check and reset if needed
    await checkAndResetUsageServer(userId)

    const { data, error: fetchError } = await supabaseServer
        .from('users')
        .select('daily_chats')
        .eq('id', userId)
        .single()

    if (fetchError || !data) return false

    const { error: updateError } = await supabaseServer
        .from('users')
        .update({ daily_chats: (data.daily_chats || 0) + 1 })
        .eq('id', userId)

    return !updateError
}

/**
 * Increment file upload counter (Server Side)
 */
export async function incrementFileUploadsServer(userId: string, count: number = 1): Promise<boolean> {
    // First check and reset if needed
    await checkAndResetUsageServer(userId)

    const { data, error: fetchError } = await supabaseServer
        .from('users')
        .select('daily_file_uploads')
        .eq('id', userId)
        .single()

    if (fetchError || !data) return false

    const { error: updateError } = await supabaseServer
        .from('users')
        .update({ daily_file_uploads: (data.daily_file_uploads || 0) + count })
        .eq('id', userId)

    return !updateError
}

/**
 * Fetch user profile with usage stats (Server Side)
 */
export async function getUserProfileServer(userId: string) {
    const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching user profile (server):', error)
        return null
    }

    return {
        id: data.id,
        email: data.email,
        subscriptionPlan: (data.subscription_plan || 'free') as 'free' | 'pro' | 'plus',
        dailyChats: data.daily_chats || 0,
        dailyFileUploads: data.daily_file_uploads || 0,
        chatResetDate: data.chat_reset_date ? new Date(data.chat_reset_date) : null,
        profileImageUrl: data.profile_image_url,
        fullName: data.full_name,
        school: data.school,
        gradeLevels: data.grade_levels,
        createdAt: new Date(data.created_at)
    }
}
