// Plan configuration and limits
// Centralized definitions for all subscription plans

export type PlanType = 'free' | 'pro' | 'school'

export interface PlanLimits {
    lessonPlansPerMonth: number | 'unlimited'
    chatsPerMonth: number | 'unlimited'
    fileUploadsPerChat: number
    maxFileSize: number // in MB
    features: string[]
}

export interface PlanConfig {
    name: string
    displayName: string
    price: number
    period: string
    description: string
    limits: PlanLimits
    features: string[]
}

// Plan configurations
export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
    free: {
        name: 'free',
        displayName: 'Free',
        price: 0,
        period: '/month',
        description: 'Perfect for trying out Tera in your classroom.',
        limits: {
            lessonPlansPerMonth: 5,
            chatsPerMonth: 20, // "Limited chat" = 20 chats/month
            fileUploadsPerChat: 0,
            maxFileSize: 0,
            features: ['basic-chat', 'lesson-plans', 'basic-tools']
        },
        features: [
            'Limited basic chat (20/month)',
            '5 AI-generated lesson plans per month',
            'Basic resource generation',
            'Community support'
        ]
    },
    pro: {
        name: 'pro',
        displayName: 'Pro',
        price: 5,
        period: '/month',
        description: 'For teachers who want to supercharge their workflow.',
        limits: {
            lessonPlansPerMonth: 'unlimited',
            chatsPerMonth: 'unlimited',
            fileUploadsPerChat: 5,
            maxFileSize: 10,
            features: ['advanced-chat', 'lesson-plans', 'all-tools', 'file-uploads', 'export']
        },
        features: [
            'Everything in Free',
            'Unlimited lesson plans',
            'Unlimited chat',
            'Priority support',
            'Custom teaching style calibration',
            'File uploads in chat',
            'Export to PDF & Word'
        ]
    },
    school: {
        name: 'school',
        displayName: 'School',
        price: 20,
        period: '/per user/month',
        description: 'For schools and districts looking to empower their staff.',
        limits: {
            lessonPlansPerMonth: 'unlimited',
            chatsPerMonth: 'unlimited',
            fileUploadsPerChat: 10,
            maxFileSize: 50,
            features: ['advanced-chat', 'lesson-plans', 'all-tools', 'file-uploads', 'export', 'admin', 'analytics', 'sso']
        },
        features: [
            'Everything in Pro',
            'Admin dashboard',
            'Shared resource library',
            'District-wide analytics',
            'Dedicated success manager',
            'SSO & Advanced Security',
            'Unlimited file uploads'
        ]
    }
}

// Helper functions
export function getPlanConfig(plan: PlanType): PlanConfig {
    return PLAN_CONFIGS[plan]
}

export function hasFeature(plan: PlanType, feature: string): boolean {
    return PLAN_CONFIGS[plan].limits.features.includes(feature)
}

export function canGenerateLessonPlan(plan: PlanType, currentCount: number): boolean {
    const limit = PLAN_CONFIGS[plan].limits.lessonPlansPerMonth
    return limit === 'unlimited' || currentCount < limit
}

export function canStartChat(plan: PlanType, currentCount: number): boolean {
    const limit = PLAN_CONFIGS[plan].limits.chatsPerMonth
    return limit === 'unlimited' || currentCount < limit
}

export function getRemainingLessonPlans(plan: PlanType, currentCount: number): number | 'unlimited' {
    const limit = PLAN_CONFIGS[plan].limits.lessonPlansPerMonth
    if (limit === 'unlimited') return 'unlimited'
    return Math.max(0, limit - currentCount)
}

export function getRemainingChats(plan: PlanType, currentCount: number): number | 'unlimited' {
    const limit = PLAN_CONFIGS[plan].limits.chatsPerMonth
    if (limit === 'unlimited') return 'unlimited'
    return Math.max(0, limit - currentCount)
}

export function getUsagePercentage(limit: number | 'unlimited', current: number): number {
    if (limit === 'unlimited') return 0
    return Math.min(100, (current / limit) * 100)
}
