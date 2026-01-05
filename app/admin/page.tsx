'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { isAdminUser } from '@/lib/admin'
import Link from 'next/link'

interface AnalyticsData {
    summary: {
        totalUsers: number
        chatLimitHits: number
        uploadLimitHits: number
        lockedOutUsers: number
        upgradeRate: number
        upgradedAfterLimit: number
    }
    subscriptionBreakdown: Record<string, number>
    lockedOutUsers: any[]
    recentLimitHits: any[]
    upgradeConversions: any[]
}

export default function AdminPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [authorized, setAuthorized] = useState(false)
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [error, setError] = useState<string>('')
    const [activeTab, setActiveTab] = useState<'overview' | 'locked' | 'conversions'>('overview')

    useEffect(() => {
        // If user not loaded yet, wait
        if (!user && loading) {
            return
        }

        // If user doesn't exist, redirect to signin
        if (!user) {
            router.push('/auth/signin')
            return
        }

        // Check if user is an admin
        if (!isAdminUser(user.email)) {
            setError('Access Denied: You do not have admin permissions')
            setAuthorized(false)
            setLoading(false)
            return
        }

        setAuthorized(true)
        fetchAnalytics()
    }, [user, router, loading])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id })
            })

            if (!response.ok) throw new Error('Failed to fetch analytics')
            const data = await response.json()
            setAnalytics(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-tera-bg">
                <div className="text-tera-secondary">Loading...</div>
            </div>
        )
    }

    if (!authorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-tera-bg">
                <div className="text-center max-w-md">
                    <div className="text-4xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-tera-primary mb-2">Access Denied</h1>
                    <p className="text-tera-secondary mb-6">{error}</p>
                    <Link href="/" className="text-tera-neon hover:underline">Return to Home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-tera-bg text-tera-primary">
            <div className="px-4 py-6 md:px-8 md:py-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.5em] text-tera-secondary">ADMIN</p>
                                <h1 className="text-4xl font-bold text-tera-primary">Analytics Dashboard</h1>
                            </div>
                            <button
                                onClick={fetchAnalytics}
                                disabled={loading}
                                className="px-4 py-2 bg-tera-neon text-black font-medium rounded-lg hover:bg-tera-neon/90 transition disabled:opacity-50"
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                        <p className="text-tera-secondary">Monitor limit hits, unlock rates, and upgrade conversions</p>
                    </div>

                    {error && error !== 'Access Denied: You do not have admin permissions' && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-tera-secondary animate-pulse">Loading analytics...</div>
                        </div>
                    ) : analytics ? (
                        <>
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                <StatCard
                                    title="Total Users"
                                    value={analytics.summary.totalUsers}
                                    icon="👥"
                                    color="blue"
                                />
                                <StatCard
                                    title="Chat Limit Hits"
                                    value={analytics.summary.chatLimitHits}
                                    icon="💬"
                                    color="orange"
                                />
                                <StatCard
                                    title="Upload Limit Hits"
                                    value={analytics.summary.uploadLimitHits}
                                    icon="📁"
                                    color="red"
                                />
                                <StatCard
                                    title="Currently Locked Out"
                                    value={analytics.summary.lockedOutUsers}
                                    icon="🔒"
                                    color="purple"
                                />
                                <StatCard
                                    title="Upgrade Rate"
                                    value={`${analytics.summary.upgradeRate}%`}
                                    icon="📈"
                                    color="green"
                                />
                                <StatCard
                                    title="Upgraded After Limit"
                                    value={analytics.summary.upgradedAfterLimit}
                                    icon="✅"
                                    color="tera-neon"
                                />
                            </div>

                            {/* Plan Distribution */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <div className="rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md">
                                    <h2 className="text-xl font-semibold text-tera-primary mb-6">Subscription Plans</h2>
                                    <div className="space-y-4">
                                        {Object.entries(analytics.subscriptionBreakdown).map(([plan, count]) => (
                                            <div key={plan} className="flex items-center justify-between">
                                                <div className="capitalize font-medium">{plan} Plan</div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-40 bg-tera-muted rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-tera-neon rounded-full"
                                                            style={{
                                                                width: `${(count / analytics.summary.totalUsers) * 100}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-right min-w-fit">
                                                        <span className="text-lg font-bold text-tera-neon">{count}</span>
                                                        <span className="text-xs text-tera-secondary ml-2">
                                                            ({((count / analytics.summary.totalUsers) * 100).toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md">
                                    <h2 className="text-xl font-semibold text-tera-primary mb-6">Quick Stats</h2>
                                    <div className="space-y-4">
                                        <StatRow
                                            label="Total Limit Hits"
                                            value={analytics.summary.chatLimitHits + analytics.summary.uploadLimitHits}
                                            color="orange"
                                        />
                                        <StatRow
                                            label="Conversion Rate"
                                            value={`${analytics.summary.upgradeRate}%`}
                                            color="green"
                                        />
                                        <StatRow
                                            label="Free Plan Users"
                                            value={analytics.subscriptionBreakdown.free}
                                            color="blue"
                                        />
                                        <StatRow
                                            label="Pro/Plus Users"
                                            value={analytics.subscriptionBreakdown.pro + analytics.subscriptionBreakdown.plus}
                                            color="tera-neon"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md">
                                <div className="flex gap-4 mb-6 border-b border-tera-border">
                                    {(['overview', 'locked', 'conversions'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 font-medium transition-colors ${activeTab === tab
                                                    ? 'text-tera-neon border-b-2 border-tera-neon'
                                                    : 'text-tera-secondary hover:text-tera-primary'
                                                }`}
                                        >
                                            {tab === 'overview' && 'Recent Activity'}
                                            {tab === 'locked' && 'Locked Out Users'}
                                            {tab === 'conversions' && 'Upgraded Users'}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                {activeTab === 'overview' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-tera-primary mb-4">Recent Limit Hits (Last 7 Days)</h3>
                                        {analytics.recentLimitHits.length > 0 ? (
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {analytics.recentLimitHits.map((hit, idx) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-tera-muted border border-tera-border/50">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="font-medium text-tera-primary truncate">{hit.email}</p>
                                                            <span className={`text-xs px-2 py-1 rounded ${hit.subscription_plan === 'free' ? 'bg-blue-500/20 text-blue-300' :
                                                                    hit.subscription_plan === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                                                                        'bg-orange-500/20 text-orange-300'
                                                                }`}>
                                                                {hit.subscription_plan}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-tera-secondary">
                                                            {hit.limit_hit_chat_at && `Chat: ${new Date(hit.limit_hit_chat_at).toLocaleString()}`}
                                                            {hit.limit_hit_upload_at && hit.limit_hit_chat_at && ' | '}
                                                            {hit.limit_hit_upload_at && `Upload: ${new Date(hit.limit_hit_upload_at).toLocaleString()}`}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-tera-secondary italic text-center py-6">No recent limit hits</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'locked' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-tera-primary mb-4">Currently Locked Out Users</h3>
                                        {analytics.lockedOutUsers.length > 0 ? (
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {analytics.lockedOutUsers.map((user, idx) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-tera-muted border border-tera-border/50">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="font-medium text-tera-primary truncate">{user.email}</p>
                                                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300">Locked</span>
                                                        </div>
                                                        <p className="text-xs text-tera-secondary">
                                                            {user.limit_hit_chat_at && `🔒 Chat unlocks: ${new Date(new Date(user.limit_hit_chat_at).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}`}
                                                        </p>
                                                        <p className="text-xs text-tera-secondary">
                                                            {user.limit_hit_upload_at && `🔒 Upload unlocks: ${new Date(new Date(user.limit_hit_upload_at).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}`}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-tera-secondary italic text-center py-6">No locked out users</p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'conversions' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-tera-primary mb-4">Users Who Upgraded After Hitting Limit</h3>
                                        {analytics.upgradeConversions.length > 0 ? (
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {analytics.upgradeConversions.map((user, idx) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-tera-muted border border-tera-border/50">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="font-medium text-tera-primary truncate">{user.email}</p>
                                                            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300">
                                                                {user.subscription_plan}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-tera-secondary">
                                                            Hit limit at: {new Date(user.limit_hit_chat_at || user.limit_hit_upload_at).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-tera-secondary">
                                                            Account created: {new Date(user.created_at).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-tera-secondary italic text-center py-6">No conversions yet</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-8 text-center text-tera-secondary text-sm">
                                <p>Last updated: {new Date().toLocaleString()}</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-tera-secondary">No analytics data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

interface StatCardProps {
    title: string
    value: string | number
    icon: string
    color?: string
}

function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-500/10 border-blue-500/30',
        orange: 'bg-orange-500/10 border-orange-500/30',
        red: 'bg-red-500/10 border-red-500/30',
        purple: 'bg-purple-500/10 border-purple-500/30',
        green: 'bg-green-500/10 border-green-500/30',
        'tera-neon': 'bg-tera-neon/10 border-tera-neon/30',
    }

    return (
        <div className={`rounded-[28px] border p-6 shadow-glow-md ${colorClasses[color as keyof typeof colorClasses]}`}>
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-tera-secondary">{title}</h3>
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-3xl font-bold text-tera-primary">{value}</p>
        </div>
    )
}

interface StatRowProps {
    label: string
    value: string | number
    color?: string
}

function StatRow({ label, value, color = 'blue' }: StatRowProps) {
    const colorClasses = {
        blue: 'text-blue-400',
        orange: 'text-orange-400',
        green: 'text-green-400',
        'tera-neon': 'text-tera-neon',
    }

    return (
        <div className="flex justify-between items-center">
            <span className="text-tera-secondary">{label}</span>
            <span className={`font-bold ${colorClasses[color as keyof typeof colorClasses]}`}>{value}</span>
        </div>
    )
}
