// Plan configuration and limits
// Centralized definitions for all subscription plans

export type PlanType = 'free' | 'pro' | 'plus'

export interface PlanLimits {
    chatsPerDay: number | 'unlimited'
    fileUploadsPerDay: number | 'unlimited'
    webSearchesPerMonth: number | 'unlimited'
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
        description: 'Start exploring AI-powered learning for free.',
        limits: {
            chatsPerDay: 15,
            fileUploadsPerDay: 5,
            webSearchesPerMonth: 5,
            maxFileSize: 25,
            features: ['basic-chat', 'basic-tools', 'file-uploads', 'web-search']
        },
        features: [
            'Up to 15 AI conversations per day',
            '5 file uploads per day (25MB each)',
            '5 web searches per month',
            'Basic AI tools & features',
            'Mobile & desktop access',
            'Community support'
        ]
    },
    pro: {
        name: 'pro',
        displayName: 'Pro',
        price: 5,
        period: '/month',
        description: 'Unlimited knowledge, unlimited possibilities.',
        limits: {
            chatsPerDay: 'unlimited',
            fileUploadsPerDay: 20,
            webSearchesPerMonth: 50,
            maxFileSize: 500,
            features: ['advanced-chat', 'all-tools', 'file-uploads', 'export', 'web-search', 'priority-support']
        },
        features: [
            'Unlimited AI conversations',
            '20 file uploads per day (500MB each)',
            '50 web searches per month',
            'Access to all tools & features',
            'Export to PDF & Word',
            'Priority email support',
            'Advanced customization',
            'No ads, no limits on creativity'
        ]
    },
    plus: {
        name: 'plus',
        displayName: 'Plus',
        price: 15,
        period: '/month',
        description: 'For power users who need everything.',
        limits: {
            chatsPerDay: 'unlimited',
            fileUploadsPerDay: 'unlimited',
            webSearchesPerMonth: 'unlimited',
            maxFileSize: 2000,
            features: ['advanced-chat', 'all-tools', 'file-uploads', 'export', 'admin', 'analytics', 'sso', 'web-search', 'priority-support', 'custom-ai']
        },
        features: [
            'Everything in Pro, plus:',
            'Unlimited web searches',
            'Unlimited file uploads (2GB each)',
            'Advanced analytics dashboard',
            'Team collaboration features',
            'API access',
            'Dedicated account manager',
            '24/7 priority support',
            'Custom AI model training',
            'Batch file processing',
            'Advanced data export options'
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

export function canStartChat(plan: PlanType, currentCount: number): boolean {
    const limit = PLAN_CONFIGS[plan].limits.chatsPerDay
    return limit === 'unlimited' || currentCount < limit
}

export function canUploadFile(plan: PlanType, currentCount: number): boolean {
    const limit = PLAN_CONFIGS[plan].limits.fileUploadsPerDay
    return limit === 'unlimited' || currentCount < limit
}

export function canPerformWebSearch(plan: PlanType, currentCount: number): boolean {
    const limit = PLAN_CONFIGS[plan].limits.webSearchesPerMonth
    return limit === 'unlimited' || currentCount < limit
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
