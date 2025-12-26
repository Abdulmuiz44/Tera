/**
 * Web Search Usage Tracking
 * Tracks and limits web searches based on subscription plan:
 * - Free: 5/month
 * - Pro: 50/month  
 * - Plus: 80/month
 */

import { supabaseServer } from './supabase-server'
import { getPlanConfig } from './plan-config'

const MONTHLY_WEB_SEARCH_LIMITS = {
  free: 5,
  pro: 50,
  plus: Infinity // Unlimited (was showing 80 in pricing but Plus should have unlimited)
}

const RESET_INTERVAL_DAYS = 30

/**
 * Get user's remaining web searches for current month
 */
export async function getWebSearchRemaining(userId: string): Promise<{ remaining: number; total: number; resetDate: string | null; plan: string }> {
  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('monthly_web_searches, web_search_reset_date, subscription_plan')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Failed to get web search usage:', error)
      return { remaining: 3, total: 3, resetDate: null, plan: 'free' }
    }

    if (!data) {
      return { remaining: 3, total: 3, resetDate: null, plan: 'free' }
    }

    const plan = (data.subscription_plan || 'free') as 'free' | 'pro' | 'plus'
    const limit = MONTHLY_WEB_SEARCH_LIMITS[plan]

    // Check if reset date has passed (reset monthly)
    const now = new Date()
    const resetDate = data.web_search_reset_date ? new Date(data.web_search_reset_date) : null

    if (!resetDate || now > resetDate) {
      // If reset date has passed, the user has the full limit available.
      // The actual reset of the counter in the DB will be handled by the increment function.
      return { remaining: limit === Infinity ? 999999 : limit, total: limit === Infinity ? 999999 : limit, resetDate: resetDate?.toISOString() || null, plan }
    }

    if (limit === Infinity) {
      return { remaining: 999999, total: 999999, resetDate: resetDate?.toISOString() || null, plan }
    }

    const remaining = Math.max(0, limit - (data.monthly_web_searches || 0))
    return { remaining, total: limit, resetDate: resetDate?.toISOString() || null, plan }
  } catch (error) {
    console.error('Error getting web search usage:', error)
    return { remaining: 3, total: 3, resetDate: null, plan: 'free' }
  }
}

/**
 * Check if user can perform a web search
 */
export async function canPerformWebSearch(userId: string): Promise<boolean> {
  const { remaining } = await getWebSearchRemaining(userId)
  return remaining > 0
}

/**
 * Increment web search count
 */
export async function incrementWebSearchCount(userId: string): Promise<boolean> {
  try {
    // Get user's status ONCE
    const { data: user, error: fetchError } = await supabaseServer
      .from('users')
      .select('monthly_web_searches, web_search_reset_date, subscription_plan')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      console.error('Failed to get user for web search increment:', fetchError)
      return false
    }

    const plan = (user.subscription_plan || 'free') as 'free' | 'pro' | 'plus'
    const limit = MONTHLY_WEB_SEARCH_LIMITS[plan]
    const now = new Date()
    const resetDate = user.web_search_reset_date ? new Date(user.web_search_reset_date) : null

    let currentSearches = user.monthly_web_searches || 0
    const updatePayload: { monthly_web_searches: number; web_search_reset_date?: string } = { monthly_web_searches: 0 }

    // Check if we need to reset the count
    if (!resetDate || now > resetDate) {
      currentSearches = 0
      const nextReset = new Date()
      nextReset.setDate(nextReset.getDate() + 30)
      updatePayload.web_search_reset_date = nextReset.toISOString()
    }

    // Check if user has remaining searches (skip for unlimited)
    if (limit !== Infinity && currentSearches >= limit) {
      console.warn(`User ${userId} has no remaining web searches.`)
      return false
    }

    // Increment and update
    updatePayload.monthly_web_searches = currentSearches + 1

    const { error: updateError } = await supabaseServer
      .from('users')
      .update(updatePayload)
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to increment web search count:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error incrementing web search count:', error)
    return false
  }
}

/**
 * Get formatted message for web search limit
 */
export function getWebSearchLimitMessage(remaining: number, total: number): string {
  if (total === Infinity || total > 9999) {
    return '🔍 Web Search (Unlimited)'
  }

  if (remaining <= 0) {
    return `🔍 Web Search Limit Reached (${total}/${total} searches used)`
  }

  const percentage = Math.round((remaining / total) * 100)
  if (remaining <= 10) {
    return `🔍 Web Search (${remaining}/${total} remaining) - Low`
  }

  return `🔍 Web Search (${remaining}/${total})`
}

export const WEB_SEARCH_LIMITS = MONTHLY_WEB_SEARCH_LIMITS
export const getDefaultLimit = (plan: 'free' | 'pro' | 'plus' = 'free') => MONTHLY_WEB_SEARCH_LIMITS[plan]
