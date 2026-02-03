'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { isAdminUser } from '@/lib/admin'
import Link from 'next/link'

interface AnalyticsData {
    summary: {
        totalUsers: number
        newUsersToday: number
        newUsersWeek: number
        newUsersMonth: number
        activeUsersToday: number
        activeUsersWeek: number
        totalChatSessions: number
        chatsToday: number
        chatsThisWeek: number
        totalWebSearches: number
        avgChatsPerUser: number
        chatLimitHits: number
        uploadLimitHits: number
        lockedOutUsers: number
        upgradeRate: number
        upgradedAfterLimit: number
    }
    subscriptionBreakdown: Record<string, number>
    dailyActivity: Array<{ date: string; chats: number; newUsers: number }>
    topActiveUsers: Array<{ id: string; email: string; subscription_plan: string; chatCount: number }>
    recentSignups: Array<{ id: string; email: string; subscription_plan: string; created_at: string }>
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
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'limits'>('overview')

    useEffect(() => {
        if (!user && loading) return
        if (!user) {
            router.push('/auth/signin')
            return
        }
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
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || ''
                },
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

    const maxChats = Math.max(...(analytics?.dailyActivity?.map(d => d.chats) || [1]))

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
                        <p className="text-tera-secondary">Real-time data from your database</p>
                    </div>

                    {error && error !== 'Access Denied: You do not have admin permissions' && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-3">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-tera-neon border-t-transparent"></div>
                                <span className="text-tera-secondary animate-pulse">Loading analytics...</span>
                            </div>
                        </div>
                    ) : analytics ? (
                        <>
                            {/* Key Metrics - Top Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <MetricCard
                                    title="Total Users"
                                    value={analytics.summary.totalUsers}
                                    icon="👥"
                                    subtext={`+${analytics.summary.newUsersToday} today`}
                                    color="blue"
                                />
                                <MetricCard
                                    title="Total Chats"
                                    value={analytics.summary.totalChatSessions}
                                    icon="💬"
                                    subtext={`${analytics.summary.chatsToday} today`}
                                    color="purple"
                                />
                                <MetricCard
                                    title="Active Today"
                                    value={analytics.summary.activeUsersToday}
                                    icon="🔥"
                                    subtext={`${analytics.summary.activeUsersWeek} this week`}
                                    color="orange"
                                />
                                <MetricCard
                                    title="Web Searches"
                                    value={analytics.summary.totalWebSearches}
                                    icon="🔍"
                                    subtext="This month"
                                    color="green"
                                />
                            </div>

                            {/* Secondary Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                                <SmallMetricCard
                                    title="Avg Chats/User"
                                    value={analytics.summary.avgChatsPerUser}
                                />
                                <SmallMetricCard
                                    title="New This Week"
                                    value={analytics.summary.newUsersWeek}
                                    color="green"
                                />
                                <SmallMetricCard
                                    title="Chats This Week"
                                    value={analytics.summary.chatsThisWeek}
                                    color="blue"
                                />
                                <SmallMetricCard
                                    title="Limit Hits"
                                    value={analytics.summary.chatLimitHits + analytics.summary.uploadLimitHits}
                                    color="orange"
                                />
                                <SmallMetricCard
                                    title="Upgrade Rate"
                                    value={`${analytics.summary.upgradeRate}%`}
                                    color="tera-neon"
                                />
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Daily Activity Chart */}
                                <div className="rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md">
                                    <h2 className="text-xl font-semibold text-tera-primary mb-6 flex items-center gap-2">
                                        <span>📊</span> Daily Activity (Last 7 Days)
                                    </h2>
                                    <div className="space-y-3">
                                        {analytics.dailyActivity.map((day, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <span className="text-xs text-tera-secondary w-24 flex-shrink-0">{day.date}</span>
                                                <div className="flex-1 flex items-center gap-2">
                                                    <div className="flex-1 bg-tera-muted rounded-full h-4 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-tera-neon to-blue-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${maxChats > 0 ? (day.chats / maxChats) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-tera-neon w-12 text-right">{day.chats}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-tera-border/50 flex justify-between text-xs text-tera-secondary">
                                        <span>💬 Chats per day</span>
                                        <span>Avg: {Math.round(analytics.dailyActivity.reduce((a, d) => a + d.chats, 0) / 7)}/day</span>
                                    </div>
                                </div>

                                {/* Subscription Breakdown */}
                                <div className="rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md">
                                    <h2 className="text-xl font-semibold text-tera-primary mb-6 flex items-center gap-2">
                                        <span>📋</span> Subscription Plans
                                    </h2>
                                    <div className="space-y-4">
                                        {Object.entries(analytics.subscriptionBreakdown).map(([plan, count]) => {
                                            const percentage = analytics.summary.totalUsers > 0
                                                ? ((count / analytics.summary.totalUsers) * 100).toFixed(1)
                                                : 0
                                            const colors: Record<string, string> = {
                                                free: 'bg-blue-500',
                                                pro: 'bg-purple-500',
                                                plus: 'bg-tera-neon',
                                                school: 'bg-orange-500'
                                            }
                                            return (
                                                <div key={plan} className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="capitalize font-medium">{plan} Plan</span>
                                                        <span className="text-tera-secondary">{count} ({percentage}%)</span>
                                                    </div>
                                                    <div className="w-full bg-tera-muted rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full ${colors[plan] || 'bg-gray-500'} rounded-full`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-tera-border/50 grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-tera-secondary">Paid Users:</span>
                                            <span className="text-tera-neon font-bold ml-2">
                                                {(analytics.subscriptionBreakdown.pro || 0) + (analytics.subscriptionBreakdown.plus || 0)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-tera-secondary">Free Users:</span>
                                            <span className="text-blue-400 font-bold ml-2">{analytics.subscriptionBreakdown.free || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Section */}
                            <div className="rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md">
                                <div className="flex gap-2 mb-6 border-b border-tera-border pb-2 overflow-x-auto">
                                    {(['overview', 'users', 'activity', 'limits'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab
                                                    ? 'text-tera-neon bg-tera-neon/10 border-b-2 border-tera-neon'
                                                    : 'text-tera-secondary hover:text-tera-primary'
                                                }`}
                                        >
                                            {tab === 'overview' && '📈 Overview'}
                                            {tab === 'users' && '👥 Users'}
                                            {tab === 'activity' && '🔥 Top Users'}
                                            {tab === 'limits' && '🔒 Limits'}
                                        </button>
                                    ))}
                                </div>

                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-tera-primary mb-4">User Growth</h3>
                                            <div className="space-y-3">
                                                <StatRow label="Today" value={`+${analytics.summary.newUsersToday}`} color="green" />
                                                <StatRow label="This Week" value={`+${analytics.summary.newUsersWeek}`} color="blue" />
                                                <StatRow label="This Month" value={`+${analytics.summary.newUsersMonth}`} color="purple" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-tera-primary mb-4">Engagement</h3>
                                            <div className="space-y-3">
                                                <StatRow label="Chats Today" value={analytics.summary.chatsToday} color="blue" />
                                                <StatRow label="Active Today" value={analytics.summary.activeUsersToday} color="orange" />
                                                <StatRow label="Avg Chats/User" value={analytics.summary.avgChatsPerUser} color="purple" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-tera-primary mb-4">Conversions</h3>
                                            <div className="space-y-3">
                                                <StatRow label="Upgraded After Limit" value={analytics.summary.upgradedAfterLimit} color="green" />
                                                <StatRow label="Currently Locked" value={analytics.summary.lockedOutUsers} color="red" />
                                                <StatRow label="Upgrade Rate" value={`${analytics.summary.upgradeRate}%`} color="tera-neon" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Users Tab */}
                                {activeTab === 'users' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-tera-primary mb-4">Recent Signups</h3>
                                        {analytics.recentSignups.length > 0 ? (
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {analytics.recentSignups.map((user, idx) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-tera-muted border border-tera-border/50 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-tera-primary truncate">{user.email}</p>
                                                            <p className="text-xs text-tera-secondary">
                                                                Joined {new Date(user.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded ${user.subscription_plan === 'free' ? 'bg-blue-500/20 text-blue-300' :
                                                                user.subscription_plan === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                                                                    'bg-tera-neon/20 text-tera-neon'
                                                            }`}>
                                                            {user.subscription_plan || 'free'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-tera-secondary italic text-center py-6">No recent signups</p>
                                        )}
                                    </div>
                                )}

                                {/* Top Users Tab */}
                                {activeTab === 'activity' && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-tera-primary mb-4">Most Active Users (Last 7 Days)</h3>
                                        {analytics.topActiveUsers.length > 0 ? (
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {analytics.topActiveUsers.map((user, idx) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-tera-muted border border-tera-border/50 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg font-bold text-tera-secondary w-6">{idx + 1}</span>
                                                            <div>
                                                                <p className="font-medium text-tera-primary truncate">{user.email}</p>
                                                                <span className={`text-xs px-2 py-0.5 rounded ${user.subscription_plan === 'free' ? 'bg-blue-500/20 text-blue-300' :
                                                                        user.subscription_plan === 'pro' ? 'bg-purple-500/20 text-purple-300' :
                                                                            'bg-tera-neon/20 text-tera-neon'
                                                                    }`}>
                                                                    {user.subscription_plan || 'free'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-2xl font-bold text-tera-neon">{user.chatCount}</span>
                                                            <p className="text-xs text-tera-secondary">chats</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-tera-secondary italic text-center py-6">No activity data</p>
                                        )}
                                    </div>
                                )}

                                {/* Limits Tab */}
                                {activeTab === 'limits' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-tera-primary mb-4">Currently Locked Out</h3>
                                            {analytics.lockedOutUsers.length > 0 ? (
                                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                                    {analytics.lockedOutUsers.map((user, idx) => (
                                                        <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                                            <p className="font-medium text-tera-primary truncate">{user.email}</p>
                                                            <p className="text-xs text-tera-secondary mt-1">
                                                                {user.limit_hit_chat_at && `Chat unlocks: ${new Date(new Date(user.limit_hit_chat_at).getTime() + 24 * 60 * 60 * 1000).toLocaleString()}`}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-tera-secondary italic text-center py-6">No locked users ✅</p>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-tera-primary mb-4">Upgraded After Limit</h3>
                                            {analytics.upgradeConversions.length > 0 ? (
                                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                                    {analytics.upgradeConversions.map((user, idx) => (
                                                        <div key={idx} className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                                            <p className="font-medium text-tera-primary truncate">{user.email}</p>
                                                            <span className="text-xs text-green-400">{user.subscription_plan}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-tera-secondary italic text-center py-6">No conversions yet</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-8 text-center text-tera-secondary text-sm">
                                <p>Last refreshed: {new Date().toLocaleString()}</p>
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

// Metric Card Component
function MetricCard({ title, value, icon, subtext, color = 'blue' }: {
    title: string
    value: string | number
    icon: string
    subtext?: string
    color?: string
}) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500/10 border-blue-500/30',
        purple: 'bg-purple-500/10 border-purple-500/30',
        orange: 'bg-orange-500/10 border-orange-500/30',
        green: 'bg-green-500/10 border-green-500/30',
        red: 'bg-red-500/10 border-red-500/30',
        'tera-neon': 'bg-tera-neon/10 border-tera-neon/30',
    }

    return (
        <div className={`rounded-2xl md:rounded-[28px] border p-4 md:p-6 shadow-glow-md ${colorClasses[color]}`}>
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-xs md:text-sm font-medium text-tera-secondary">{title}</h3>
                <span className="text-xl md:text-2xl">{icon}</span>
            </div>
            <p className="text-2xl md:text-4xl font-bold text-tera-primary">{value.toLocaleString()}</p>
            {subtext && <p className="text-xs text-tera-secondary mt-1">{subtext}</p>}
        </div>
    )
}

// Small Metric Card Component
function SmallMetricCard({ title, value, color = 'default' }: {
    title: string
    value: string | number
    color?: string
}) {
    const textColors: Record<string, string> = {
        default: 'text-tera-primary',
        green: 'text-green-400',
        blue: 'text-blue-400',
        orange: 'text-orange-400',
        red: 'text-red-400',
        'tera-neon': 'text-tera-neon',
    }

    return (
        <div className="rounded-xl bg-tera-muted border border-tera-border/50 p-3 md:p-4">
            <p className="text-xs text-tera-secondary mb-1">{title}</p>
            <p className={`text-lg md:text-xl font-bold ${textColors[color]}`}>{value.toLocaleString()}</p>
        </div>
    )
}

// Stat Row Component
function StatRow({ label, value, color = 'default' }: {
    label: string
    value: string | number
    color?: string
}) {
    const colorClasses: Record<string, string> = {
        default: 'text-tera-primary',
        blue: 'text-blue-400',
        green: 'text-green-400',
        orange: 'text-orange-400',
        purple: 'text-purple-400',
        red: 'text-red-400',
        'tera-neon': 'text-tera-neon',
    }

    return (
        <div className="flex justify-between items-center py-2 border-b border-tera-border/30 last:border-0">
            <span className="text-tera-secondary text-sm">{label}</span>
            <span className={`font-bold ${colorClasses[color]}`}>{value}</span>
        </div>
    )
}
