// Plan configuration and limits
// Centralized definitions for all subscription plans

export type PlanType = 'free' | 'pro' | 'school'

export interface PlanLimits {
    lessonPlansPerMonth: number | 'unlimited'
    chatsPerDay: number | 'unlimited'
    fileUploadsPerDay: number | 'unlimited'
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
            chatsPerDay: 10, // Updated to 10 chats/day
            fileUploadsPerDay: 5, // Updated to 5 uploads/day
            maxFileSize: 25,
            features: ['basic-chat', 'lesson-plans', 'basic-tools', 'file-uploads']
        },
        features: [
            'Limited chat (10/day)',
            '5 AI-generated lesson plans per month',
            'Basic resource generation',
            'File uploads (5 per day, 25MB max)',
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
            chatsPerDay: 'unlimited',
            fileUploadsPerDay: 'unlimited',
            maxFileSize: 100,
            features: ['advanced-chat', 'lesson-plans', 'all-tools', 'file-uploads', 'export']
        },
        features: [
            'Everything in Free',
            'Unlimited lesson plans',
            'Unlimited chat',
            'Unlimited file uploads (100MB max per file)',
            'Priority support',
            'Custom teaching style calibration',
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
            chatsPerDay: 'unlimited',
            fileUploadsPerDay: 'unlimited',
            maxFileSize: 500,
            features: ['advanced-chat', 'lesson-plans', 'all-tools', 'file-uploads', 'export', 'admin', 'analytics', 'sso']
        },
        features: [
            'Everything in Pro',
            'Unlimited file uploads (500MB max per file)',
            'Admin dashboard',
            'Shared resource library',
            'District-wide analytics',
            'Dedicated success manager',
            'SSO & Advanced Security'
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
    const limit = PLAN_CONFIGS[plan].limits.chatsPerDay
    return limit === 'unlimited' || currentCount < limit
}

export function canUploadFile(plan: PlanType, currentCount: number): boolean {
    const limit = PLAN_CONFIGS[plan].limits.fileUploadsPerDay
    return limit === 'unlimited' || currentCount < limit
}

export function getRemainingLessonPlans(plan: PlanType, currentCount: number): number | 'unlimited' {
    const limit = PLAN_CONFIGS[plan].limits.lessonPlansPerMonth
    if (limit === 'unlimited') return 'unlimited'
    return Math.max(0, limit - currentCount)
}

export function getRemainingChats(plan: PlanType, currentCount: number): number | 'unlimited' {
    const limit = PLAN_CONFIGS[plan].limits.chatsPerDay
    if (limit === 'unlimited') return 'unlimited'
    return Math.max(0, limit - currentCount)
}

export function getRemainingFileUploads(plan: PlanType, currentCount: number): number | 'unlimited' {
    const limit = PLAN_CONFIGS[plan].limits.fileUploadsPerDay
    if (limit === 'unlimited') return 'unlimited'
    return Math.max(0, limit - currentCount)
}

export function getUsagePercentage(limit: number | 'unlimited', current: number): number {
    if (limit === 'unlimited') return 0
    return Math.min(100, (current / limit) * 100)
}
