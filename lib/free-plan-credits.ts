import { supabaseServer } from './supabase-server'
import type { PlanType } from './plan-config'

const PLAN_MONTHLY_CREDIT_CAPS: Record<PlanType, number> = {
  free: 150,
  pro: 1500,
  plus: 5000
}
const RESET_INTERVAL_DAYS = 30

type CreditState = {
  used: number
  remaining: number
  total: number
  resetDate: string | null
  plan: PlanType
}

export function getFreePlanCreditCap() {
  return PLAN_MONTHLY_CREDIT_CAPS.free
}

export function getPlanCreditCap(plan: PlanType): number {
  return PLAN_MONTHLY_CREDIT_CAPS[plan]
}

export async function getUserCreditsRemaining(userId: string): Promise<CreditState> {
  const nextResetFromNow = () => {
    const date = new Date()
    date.setDate(date.getDate() + RESET_INTERVAL_DAYS)
    return date.toISOString()
  }

  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('subscription_plan, free_plan_credits_used, free_plan_credits_reset_date')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return { used: 0, remaining: PLAN_MONTHLY_CREDIT_CAPS.free, total: PLAN_MONTHLY_CREDIT_CAPS.free, resetDate: nextResetFromNow(), plan: 'free' }
    }

    const plan = (data.subscription_plan || 'free') as PlanType
    const total = getPlanCreditCap(plan)

    const now = new Date()
    const resetDate = data.free_plan_credits_reset_date ? new Date(data.free_plan_credits_reset_date) : null
    if (!resetDate || now > resetDate) {
      return { used: 0, remaining: total, total, resetDate: nextResetFromNow(), plan }
    }

    const used = data.free_plan_credits_used || 0
    const remaining = Math.max(0, total - used)
    return { used, remaining, total, resetDate: resetDate.toISOString(), plan }
  } catch (error) {
    return { used: 0, remaining: PLAN_MONTHLY_CREDIT_CAPS.free, total: PLAN_MONTHLY_CREDIT_CAPS.free, resetDate: nextResetFromNow(), plan: 'free' }
  }
}

export async function incrementUserCredits(userId: string, cost: number): Promise<boolean> {
  try {
    const { data, error } = await supabaseServer
      .from('users')
      .select('subscription_plan, free_plan_credits_used, free_plan_credits_reset_date')
      .eq('id', userId)
      .single()

    if (error || !data) return false

    const now = new Date()
    const resetDate = data.free_plan_credits_reset_date ? new Date(data.free_plan_credits_reset_date) : null

    let used = data.free_plan_credits_used || 0
    const updatePayload: { free_plan_credits_used: number; free_plan_credits_reset_date?: string } = { free_plan_credits_used: used }

    if (!resetDate || now > resetDate) {
      used = 0
      const nextReset = new Date()
      nextReset.setDate(nextReset.getDate() + RESET_INTERVAL_DAYS)
      updatePayload.free_plan_credits_reset_date = nextReset.toISOString()
    }

    updatePayload.free_plan_credits_used = used + Math.max(1, cost)

    const { error: updateError } = await supabaseServer
      .from('users')
      .update(updatePayload)
      .eq('id', userId)

    return !updateError
  } catch (error) {
    return false
  }
}
