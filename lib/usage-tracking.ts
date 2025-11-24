// Usage tracking utilities
// Functions to track and manage user usage across plans

import { supabase } from './supabase'
import type { PlanType } from './plan-config'

export interface UsageStats {
    monthlyLessonPlans: number
    dailyChats: number
    planResetDate: Date
    chatResetDate: Date
}

export interface UserProfile {
    id: string
    email: string
    subscriptionPlan: PlanType
    monthlyLessonPlans: number
    dailyChats: number
    planResetDate: Date | null
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
        monthlyLessonPlans: data.monthly_lesson_plans || 0,
        dailyChats: data.daily_chats || 0,
        planResetDate: data.plan_reset_date ? new Date(data.plan_reset_date) : null,
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
        .select('monthly_lesson_plans, daily_chats, plan_reset_date, chat_reset_date')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching usage stats:', error)
        return null
    }

    return {
        monthlyLessonPlans: data.monthly_lesson_plans || 0,
        dailyChats: data.daily_chats || 0,
        planResetDate: data.plan_reset_date ? new Date(data.plan_reset_date) : new Date(),
        chatResetDate: data.chat_reset_date ? new Date(data.chat_reset_date) : new Date()
    }
}

/**
 * Check if counters need to be reset
 */
export async function checkAndResetUsage(userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('users')
        .select('plan_reset_date, chat_reset_date')
        .eq('id', userId)
        .single()

    if (error || !data) return false

    const now = new Date()
    const updates: Record<string, any> = {}
    let needsUpdate = false

    // Check monthly lesson plan reset
    if (data.plan_reset_date && now >= new Date(data.plan_reset_date)) {
        const nextResetDate = new Date(now)
        nextResetDate.setMonth(nextResetDate.getMonth() + 1)
        updates.monthly_lesson_plans = 0
        updates.plan_reset_date = nextResetDate.toISOString()
        needsUpdate = true
    }

    // Check daily chat reset
    if (data.chat_reset_date && now >= new Date(data.chat_reset_date)) {
        const nextChatResetDate = new Date(now)
        nextChatResetDate.setDate(nextChatResetDate.getDate() + 1)
        updates.daily_chats = 0
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
 * Increment lesson plan counter
 */
export async function incrementLessonPlans(userId: string): Promise<boolean> {
    // First check and reset if needed
    await checkAndResetUsage(userId)

    const { error } = await supabase.rpc('increment_lesson_plans', { user_id: userId })

    if (error) {
        // Fallback if function doesn't exist - manual increment
        const { data, error: fetchError } = await supabase
            .from('users')
            .select('monthly_lesson_plans')
            .eq('id', userId)
            .single()

        if (fetchError || !data) return false

        const { error: updateError } = await supabase
            .from('users')
            .update({ monthly_lesson_plans: (data.monthly_lesson_plans || 0) + 1 })
            .eq('id', userId)

        return !updateError
    }

    return true
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
 * Update user profile information
 */
export async function updateUserProfile(
    userId: string,
    updates: Partial<{
        fullName: string
        school: string
        gradeLevels: string[]
        profileImageUrl: string
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
