/**
 * Web Search Usage Tracking
 * Tracks and limits web searches based on subscription plan:
 * - Free: 5/month
 * - Pro: 100/month  
 * - Plus: unlimited
 * Tracks and limits web searches based on subscription plan.
 * Limits are sourced from centralized plan config to avoid drift.
 */

import { supabaseServer } from './supabase-server'
import type { PlanType } from './plan-config'

const MONTHLY_WEB_SEARCH_LIMITS: Record<PlanType, number | typeof Infinity> = {
  free: 5,
  pro: 100,
  plus: Infinity,
const MONTHLY_WEB_SEARCH_LIMITS = {
  free: getPlanConfig('free').limits.webSearchesPerMonth as number,
  pro: getPlanConfig('pro').limits.webSearchesPerMonth as number,
  plus: Infinity
}

const RESET_INTERVAL_DAYS = 30

export interface WebSearchUsageState {
  used: number
  limit: number | 'unlimited'
  remaining: number | 'unlimited'
  resetDate: string | null
  plan: PlanType
}

async function normalizeWebSearchUsage(userId: string): Promise<{ used: number; resetDate: Date | null; plan: PlanType } | null> {
  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('monthly_web_searches, web_search_reset_date, subscription_plan')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          used: 0,
          resetDate: null,
          plan: 'free',
        }
      }

      console.warn('Network issue getting web search usage (using fallback):', error instanceof Error ? error.message : String(error))
      return {
        used: 0,
        resetDate: null,
        plan: 'free',
      }
    }

    const plan = (data.subscription_plan || 'free') as PlanType
    const now = new Date()
    const resetDate = data.web_search_reset_date ? new Date(data.web_search_reset_date) : null

    if (!resetDate || now > resetDate) {
      const nextReset = new Date(now)
      nextReset.setDate(nextReset.getDate() + RESET_INTERVAL_DAYS)

      const { error: updateError } = await supabaseServer
        .from('users')
        .update({
          monthly_web_searches: 0,
          web_search_reset_date: nextReset.toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Failed to normalize web search usage:', updateError)
        return {
          used: 0,
          resetDate: nextReset,
          plan,
        }
      }

      return {
        used: 0,
        resetDate: nextReset,
        plan,
      }
    }

    return {
      used: data.monthly_web_searches || 0,
      resetDate,
      plan,
    }
  } catch (error) {
    console.warn('Error normalizing web search usage (using fallback):', error)
    return {
      used: 0,
      resetDate: null,
      plan: 'free',
    }
  }
}

export async function getWebSearchUsageState(userId: string): Promise<WebSearchUsageState> {
  const state = await normalizeWebSearchUsage(userId)

  if (!state) {
    return {
      used: 0,
      limit: 5,
      remaining: 5,
      resetDate: null,
      plan: 'free',
    }
  }

  const limit = MONTHLY_WEB_SEARCH_LIMITS[state.plan]

  if (limit === Infinity) {
    return {
      used: state.used,
      limit: 'unlimited',
      remaining: 'unlimited',
      resetDate: state.resetDate ? state.resetDate.toISOString() : null,
      plan: state.plan,
    }
  }

  return {
    used: state.used,
    limit,
    remaining: Math.max(0, limit - state.used),
    resetDate: state.resetDate ? state.resetDate.toISOString() : null,
    plan: state.plan,
  }
}

/**
 * Get user's remaining web searches for current month
 */
export async function getWebSearchRemaining(userId: string): Promise<{ remaining: number; total: number; resetDate: string | null; plan: string }> {
  const state = await getWebSearchUsageState(userId)

  if (state.limit === 'unlimited') {
    return { remaining: 999999, total: 999999, resetDate: state.resetDate, plan: state.plan }
  }

  return {
    remaining: state.remaining as number,
    total: state.limit,
    resetDate: state.resetDate,
    plan: state.plan,
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
    const state = await normalizeWebSearchUsage(userId)

    if (!state) return false

    const limit = MONTHLY_WEB_SEARCH_LIMITS[state.plan]

    if (limit !== Infinity && state.used >= limit) {
      console.warn(`User ${userId} has no remaining web searches.`)
      return false
    }

    const { error: updateError } = await supabaseServer
      .from('users')
      .update({ monthly_web_searches: state.used + 1 })
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
  if (total > 9999) {
    return 'Web Search (Unlimited)'
  }

  if (remaining <= 0) {
    return `Web Search Limit Reached (${total}/${total} searches used)`
  }

  if (remaining <= 10) {
    return `Web Search (${remaining}/${total} remaining) - Low`
  }

  return `Web Search (${remaining}/${total})`
}

export const WEB_SEARCH_LIMITS = MONTHLY_WEB_SEARCH_LIMITS
export const getDefaultLimit = (plan: PlanType = 'free') => MONTHLY_WEB_SEARCH_LIMITS[plan]


