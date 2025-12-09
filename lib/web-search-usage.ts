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
  plus: 80
}

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
      // Reset the counter - next reset is 30 days from now
      const nextReset = new Date()
      nextReset.setDate(nextReset.getDate() + 30)
      
      await supabaseServer
        .from('users')
        .update({
          monthly_web_searches: 0,
          web_search_reset_date: nextReset.toISOString()
        })
        .eq('id', userId)
        .then(({ error }) => {
          if (error) console.error('Failed to reset web search count:', error)
        })

      return { remaining: limit, total: limit, resetDate: nextReset.toISOString(), plan }
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
    // First check if they can search
    const canSearch = await canPerformWebSearch(userId)
    if (!canSearch) {
      return false
    }

    // Increment the counter
    const { remaining, total } = await getWebSearchRemaining(userId)
    const newCount = total - (remaining - 1)
    
    const { error } = await supabaseServer
      .from('users')
      .update({ monthly_web_searches: newCount })
      .eq('id', userId)

    return !error
  } catch (error) {
    console.error('Failed to increment web search count:', error)
    return false
  }
}

/**
 * Get formatted message for web search limit
 */
export function getWebSearchLimitMessage(remaining: number, total: number): string {
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
