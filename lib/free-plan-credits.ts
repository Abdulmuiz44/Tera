import { supabaseServer } from './supabase-server'
import type { PlanType } from './plan-config'

const PLAN_MONTHLY_CREDIT_CAPS: Record<PlanType, number> = {
  free: 150,
  pro: 1500,
  plus: 5000
}
const RESET_INTERVAL_DAYS = 30
const RESET_INTERVAL_MS = RESET_INTERVAL_DAYS * 24 * 60 * 60 * 1000

type CreditState = {
  used: number
  remaining: number
  total: number
  resetDate: string | null
  plan: PlanType
}

type UserCreditRecord = {
  plan: PlanType
  used: number
  resetDate: Date | null
}

export function getFreePlanCreditCap() {
  return PLAN_MONTHLY_CREDIT_CAPS.free
}

export function getPlanCreditCap(plan: PlanType): number {
  return PLAN_MONTHLY_CREDIT_CAPS[plan]
}

function getNextResetDate(from: Date = new Date()) {
  const date = new Date(from)
  date.setDate(date.getDate() + RESET_INTERVAL_DAYS)
  return date
}

function normalizePlan(plan: string | null | undefined): PlanType {
  if (plan === 'pro' || plan === 'plus') {
    return plan
  }

  return 'free'
}

async function getUserCreditRecord(userId: string): Promise<UserCreditRecord | null> {
  const { data, error } = await supabaseServer
    .from('users')
    .select('subscription_plan, free_plan_credits_used, free_plan_credits_reset_date')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return {
    plan: normalizePlan(data.subscription_plan),
    used: Math.max(0, Number(data.free_plan_credits_used || 0)),
    resetDate: data.free_plan_credits_reset_date ? new Date(data.free_plan_credits_reset_date) : null,
  }
}

async function getUserPlan(userId: string): Promise<PlanType> {
  const { data, error } = await supabaseServer
    .from('users')
    .select('subscription_plan')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) {
    return 'free'
  }

  return normalizePlan(data.subscription_plan)
}

async function getSessionCreditUsage(userId: string, windowStart: Date): Promise<number> {
  const { data, error } = await supabaseServer
    .from('chat_sessions')
    .select('token_usage')
    .eq('user_id', userId)
    .gte('created_at', windowStart.toISOString())

  if (error || !data) {
    return 0
  }

  return data.reduce((sum: number, row: { token_usage?: number | null }) => sum + Math.max(0, Number(row.token_usage || 0)), 0)
}

export async function getUserCreditsRemaining(userId: string): Promise<CreditState> {
  try {
    const now = new Date()
    const record = await getUserCreditRecord(userId)
    const plan = record?.plan ?? await getUserPlan(userId)
    const total = getPlanCreditCap(plan)

    const activeResetDate = record?.resetDate && now <= record.resetDate
      ? record.resetDate
      : getNextResetDate(now)
    const windowStart = new Date(activeResetDate.getTime() - RESET_INTERVAL_MS)
    const sessionUsage = await getSessionCreditUsage(userId, windowStart)
    const storedUsage = record?.resetDate && now <= record.resetDate ? record.used : 0
    const used = Math.max(storedUsage, sessionUsage)
    const remaining = Math.max(0, total - used)
    return { used, remaining, total, resetDate: activeResetDate.toISOString(), plan }
  } catch (error) {
    const resetDate = getNextResetDate().toISOString()
    return { used: 0, remaining: PLAN_MONTHLY_CREDIT_CAPS.free, total: PLAN_MONTHLY_CREDIT_CAPS.free, resetDate, plan: 'free' }
  }
}

export async function incrementUserCredits(userId: string, cost: number): Promise<boolean> {
  try {
    const record = await getUserCreditRecord(userId)

    if (!record) return true

    const now = new Date()
    const resetDate = record.resetDate

    let used = record.used
    const updatePayload: { free_plan_credits_used: number; free_plan_credits_reset_date?: string } = { free_plan_credits_used: used }

    if (!resetDate || now > resetDate) {
      used = 0
      const nextReset = getNextResetDate(now)
      updatePayload.free_plan_credits_reset_date = nextReset.toISOString()
    }

    updatePayload.free_plan_credits_used = used + Math.max(1, cost)

    const { error: updateError } = await supabaseServer
      .from('users')
      .update(updatePayload)
      .eq('id', userId)

    return !updateError
  } catch (error) {
    return true
  }
}
