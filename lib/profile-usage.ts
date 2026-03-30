import { getPlanConfig, type PlanType } from './plan-config'

export type UsageLimit = number | 'unlimited'

export interface UsageMetricSummary {
    used: number
    limit: UsageLimit
    remaining: number | 'unlimited'
    isUnlimited: boolean
    percentageRemaining: number
    percentageUsed: number
    resetAt: string | null
}

export interface ProfileUsageSummary {
    plan: PlanType
    planDisplayName: string
    messages: UsageMetricSummary
    uploads: UsageMetricSummary
    webSearch: UsageMetricSummary
}

export interface ProfileUsageSource {
    plan: PlanType
    dailyChats: number
    dailyFileUploads: number
    monthlyWebSearches: number
    chatResetDate: Date | null
    webSearchResetDate: Date | null
}

export function buildUsageMetricSummary(used: number, limit: UsageLimit, resetAt: Date | null): UsageMetricSummary {
    if (limit === 'unlimited') {
        return {
            used,
            limit,
            remaining: 'unlimited',
            isUnlimited: true,
            percentageRemaining: 100,
            percentageUsed: 0,
            resetAt: resetAt ? resetAt.toISOString() : null,
        }
    }

    const remaining = Math.max(0, limit - used)
    const percentageUsed = limit > 0 ? Math.min(100, (used / limit) * 100) : 0

    return {
        used,
        limit,
        remaining,
        isUnlimited: false,
        percentageRemaining: Math.max(0, 100 - percentageUsed),
        percentageUsed,
        resetAt: resetAt ? resetAt.toISOString() : null,
    }
}

export function buildProfileUsageSummary(source: ProfileUsageSource): ProfileUsageSummary {
    const planConfig = getPlanConfig(source.plan)

    return {
        plan: source.plan,
        planDisplayName: planConfig.displayName,
        messages: buildUsageMetricSummary(
            source.dailyChats,
            planConfig.limits.messagesPerDay,
            source.chatResetDate,
        ),
        uploads: buildUsageMetricSummary(
            source.dailyFileUploads,
            planConfig.limits.fileUploadsPerDay,
            source.chatResetDate,
        ),
        webSearch: buildUsageMetricSummary(
            source.monthlyWebSearches,
            planConfig.limits.webSearchesPerMonth,
            source.webSearchResetDate,
        ),
    }
}
