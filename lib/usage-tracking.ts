// Usage tracking utilities
// Functions to track and manage user usage across plans

import { supabase } from './supabase'
import type { PlanType } from './plan-config'
import { PLAN_CONFIGS, canStartChat, canUploadFile, getRemainingChats, getRemainingFileUploads } from './plan-config'

export interface UsageStats {
    dailyChats: number
    dailyFileUploads: number
    chatResetDate: Date
}

export interface UserProfile {
    id: string
    email: string
    subscriptionPlan: PlanType
    dailyChats: number
    dailyFileUploads: number
    chatResetDate: Date | null
    profileImageUrl: string | null
    fullName: string | null
    school: string | null
    gradeLevels: string[] | null
    createdAt: Date
}

/**
 * Fetch user profile with usage stats
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching user profile:', error)
        return null
    }

    return {
        id: data.id,
        email: data.email,
        subscriptionPlan: (data.subscription_plan || 'free') as PlanType,
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

/**
 * Get just the usage stats
 */
export async function getUsageStats(userId: string): Promise<UsageStats | null> {
    const { data, error } = await supabase
        .from('users')
        .select('daily_chats, daily_file_uploads, chat_reset_date')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching usage stats:', error)
        return null
    }

    return {
        dailyChats: data.daily_chats || 0,
        dailyFileUploads: data.daily_file_uploads || 0,
        chatResetDate: data.chat_reset_date ? new Date(data.chat_reset_date) : new Date()
    }
}

/**
 * Check if counters need to be reset
 */
export async function checkAndResetUsage(userId: string): Promise<boolean> {
    const { data, error } = await supabase
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
        const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)

        if (updateError) {
            console.error('Error resetting usage:', updateError)
            return false
        }
        return true
    }

    return false
}



/**
 * Check if user can start a new chat
 */
export async function canUserStartChat(userId: string): Promise<{ allowed: boolean; remaining: number | 'unlimited'; reason?: string }> {
    const profile = await getUserProfile(userId)
    if (!profile) return { allowed: false, remaining: 0, reason: 'User not found' }

    // Reset if needed
    await checkAndResetUsage(userId)

    // Get fresh stats after potential reset
    const stats = await getUsageStats(userId)
    if (!stats) return { allowed: false, remaining: 0, reason: 'Could not fetch usage stats' }

    const allowed = canStartChat(profile.subscriptionPlan, stats.dailyChats)
    const remaining = getRemainingChats(profile.subscriptionPlan, stats.dailyChats)

    if (!allowed) {
        const limit = PLAN_CONFIGS[profile.subscriptionPlan].limits.chatsPerDay
        return {
            allowed: false,
            remaining: 0,
            reason: `You've reached your daily limit of ${limit} chats. Reset at midnight.`
        }
    }

    return { allowed: true, remaining }
}

/**
 * Check if user can upload files
 */
export async function canUserUploadFiles(userId: string, fileCount: number = 1): Promise<{ allowed: boolean; remaining: number | 'unlimited'; reason?: string }> {
    const profile = await getUserProfile(userId)
    if (!profile) return { allowed: false, remaining: 0, reason: 'User not found' }

    // Reset if needed
    await checkAndResetUsage(userId)

    // Get fresh stats after potential reset
    const stats = await getUsageStats(userId)
    if (!stats) return { allowed: false, remaining: 0, reason: 'Could not fetch usage stats' }

    const totalAfter = stats.dailyFileUploads + fileCount
    const allowed = canUploadFile(profile.subscriptionPlan, totalAfter - 1) // Check if we can add this many

    const remaining = getRemainingFileUploads(profile.subscriptionPlan, stats.dailyFileUploads)

    if (!allowed) {
        const limit = PLAN_CONFIGS[profile.subscriptionPlan].limits.fileUploadsPerDay
        const remainingStr = remaining === 'unlimited' ? 'unlimited' : remaining
        return {
            allowed: false,
            remaining: remaining === 'unlimited' ? 'unlimited' : 0,
            reason: `Daily upload limit reached (${limit}). ${remaining} remaining. Reset at midnight.`
        }
    }

    return { allowed: true, remaining }
}

/**
 * Validate file size against plan limits
 */
export async function validateFileSize(userId: string, fileSizeMB: number): Promise<{ allowed: boolean; maxSize: number; reason?: string }> {
    const profile = await getUserProfile(userId)
    if (!profile) return { allowed: false, maxSize: 0, reason: 'User not found' }

    const maxFileSize = PLAN_CONFIGS[profile.subscriptionPlan].limits.maxFileSize

    if (fileSizeMB > maxFileSize) {
        return {
            allowed: false,
            maxSize: maxFileSize,
            reason: `File exceeds max size for ${profile.subscriptionPlan} plan (${maxFileSize}MB limit). Upgrade to increase file size limit.`
        }
    }

    return { allowed: true, maxSize: maxFileSize }
}

/**
 * Increment chat counter
 */
export async function incrementChats(userId: string): Promise<boolean> {
    // First check and reset if needed
    await checkAndResetUsage(userId)

    // Manual increment since we changed the column name and RPC might be outdated
    const { data, error: fetchError } = await supabase
        .from('users')
        .select('daily_chats')
        .eq('id', userId)
        .single()

    if (fetchError || !data) return false

    const { error: updateError } = await supabase
        .from('users')
        .update({ daily_chats: (data.daily_chats || 0) + 1 })
        .eq('id', userId)

    return !updateError
}

/**
 * Increment file upload counter
 */
export async function incrementFileUploads(userId: string, count: number = 1): Promise<boolean> {
    // First check and reset if needed
    await checkAndResetUsage(userId)

    const { data, error: fetchError } = await supabase
        .from('users')
        .select('daily_file_uploads')
        .eq('id', userId)
        .single()

    if (fetchError || !data) return false

    const { error: updateError } = await supabase
        .from('users')
        .update({ daily_file_uploads: (data.daily_file_uploads || 0) + count })
        .eq('id', userId)

    return !updateError
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
    userId: string,
    updates: Partial<{
        fullName: string | null
        school: string | null
        gradeLevels: string[] | null
        profileImageUrl: string | null
    }>
): Promise<boolean> {
    const dbUpdates: Record<string, unknown> = {}

    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName
    if (updates.school !== undefined) dbUpdates.school = updates.school
    if (updates.gradeLevels !== undefined) dbUpdates.grade_levels = updates.gradeLevels
    if (updates.profileImageUrl !== undefined) dbUpdates.profile_image_url = updates.profileImageUrl

    const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId)

    if (error) {
        console.error('Error updating user profile:', error)
        return false
    }

    return true
}

/**
 * Update user subscription plan
 */
export async function updateSubscriptionPlan(
    userId: string,
    plan: PlanType
): Promise<boolean> {
    const { error } = await supabase
        .from('users')
        .update({ subscription_plan: plan })
        .eq('id', userId)

    if (error) {
        console.error('Error updating subscription plan:', error)
        return false
    }

    return true
}
