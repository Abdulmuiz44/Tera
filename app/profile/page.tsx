'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/usage-tracking'
import { getPlanConfig, getRemainingChats, getRemainingFileUploads, getUsagePercentage, type PlanType } from '@/lib/plan-config'
import Link from 'next/link'
import Image from 'next/image'

export default function ProfilePage() {
    const { user } = useAuth()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({ fullName: '', school: '', gradeLevels: [] as string[] })
    const [recentSessions, setRecentSessions] = useState<any[]>([])
    const [sessionsLoading, setSessionsLoading] = useState(true)
    const [portalLoading, setPortalLoading] = useState(false)
    const [chatUnlockTime, setChatUnlockTime] = useState<string>('')
    const [uploadUnlockTime, setUploadUnlockTime] = useState<string>('')
    const [chatUnlocksAt, setChatUnlocksAt] = useState<Date | null>(null)
    const [uploadUnlocksAt, setUploadUnlocksAt] = useState<Date | null>(null)

    useEffect(() => {
        if (user) {
            loadProfile()
            loadRecentSessions()
        }
    }, [user])

    useEffect(() => {
        if (!profile?.limitHitChatAt) {
            setChatUnlockTime('')
            setChatUnlocksAt(null)
            return
        }

        const calculateTime = () => {
            const unlocksAt = new Date(profile.limitHitChatAt!.getTime() + 24 * 60 * 60 * 1000)
            setChatUnlocksAt(unlocksAt)

            const now = new Date()
            const diff = unlocksAt.getTime() - now.getTime()

            if (diff <= 0) {
                setChatUnlockTime('Available now')
            } else {
                const hours = Math.floor(diff / (60 * 60 * 1000))
                const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
                setChatUnlockTime(`${hours}h ${minutes}m`)
            }
        }

        calculateTime()
        const interval = setInterval(calculateTime, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [profile?.limitHitChatAt])

    useEffect(() => {
        if (!profile?.limitHitUploadAt) {
            setUploadUnlockTime('')
            setUploadUnlocksAt(null)
            return
        }

        const calculateTime = () => {
            const unlocksAt = new Date(profile.limitHitUploadAt!.getTime() + 24 * 60 * 60 * 1000)
            setUploadUnlocksAt(unlocksAt)

            const now = new Date()
            const diff = unlocksAt.getTime() - now.getTime()

            if (diff <= 0) {
                setUploadUnlockTime('Available now')
            } else {
                const hours = Math.floor(diff / (60 * 60 * 1000))
                const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
                setUploadUnlockTime(`${hours}h ${minutes}m`)
            }
        }

        calculateTime()
        const interval = setInterval(calculateTime, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [profile?.limitHitUploadAt])

    const loadRecentSessions = async () => {
        if (!user) return
        setSessionsLoading(true)
        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .select('id, session_id, title, created_at, tool')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3)

            if (error) throw error
            setRecentSessions(data || [])
        } catch (error) {
            console.error('Error loading sessions:', error)
        } finally {
            setSessionsLoading(false)
        }
    }

    const loadProfile = async () => {
        if (!user) return
        setLoading(true)
        const data = await getUserProfile(user.id)
        setProfile(data)
        setFormData({
            fullName: data?.fullName || '',
            school: data?.school || '',
            gradeLevels: data?.gradeLevels || [],
        })
        setLoading(false)
    }

    const handleSave = async () => {
        if (!user || !profile) return
        setSaving(true)
        try {
            await updateUserProfile(user.id, {
                ...profile,
                ...formData,
            })
            setProfile({ ...profile, ...formData })
            setEditing(false)
        } catch (error) {
            console.error('Error saving profile:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            fullName: profile?.fullName || '',
            school: profile?.school || '',
            gradeLevels: profile?.gradeLevels || [],
        })
        setEditing(false)
    }

    const handleManageSubscription = async () => {
        if (!user) return
        setPortalLoading(true)
        try {
            const response = await fetch('/api/billing/create-portal-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            })

            if (!response.ok) throw new Error('Failed to create portal session')

            const { portalUrl } = await response.json()
            if (portalUrl) window.location.href = portalUrl
        } catch (error) {
            console.error('Error opening portal:', error)
            alert('Failed to load billing portal. Please try again.')
        } finally {
            setPortalLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center bg-tera-bg text-tera-primary">
                <div className="text-tera-secondary">Loading profile...</div>
            </div>
        )
    }

    if (!profile || !user) {
        return (
            <div className="flex flex-col h-full w-full items-center justify-center bg-tera-bg text-tera-primary">
                <div className="text-tera-secondary">Error loading profile</div>
            </div>
        )
    }

    const planConfig = getPlanConfig(profile.subscriptionPlan as PlanType)
    const remainingChats = getRemainingChats(profile.subscriptionPlan as PlanType, profile.dailyChats)
    const chatLimit = planConfig.limits.chatsPerDay
    const chatPercentage = getUsagePercentage(chatLimit as number, profile.dailyChats)

    // File upload calculations
    const remainingUploads = getRemainingFileUploads(profile.subscriptionPlan as PlanType, profile.dailyFileUploads)
    const fileUploadsPerDay = planConfig.limits.fileUploadsPerDay
    const uploadPercentage = fileUploadsPerDay === 'unlimited' ? 0 : getUsagePercentage(fileUploadsPerDay as number, profile.dailyFileUploads)

    const email = user.email || ''
    const displayName = formData.fullName || profile.fullName || (email ? email.split('@')[0] : '') || 'User'
    const initials = (displayName || 'User')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const chatResetDate = profile.chatResetDate ? new Date(profile.chatResetDate) : null
    const daysUntilReset = chatResetDate ? Math.ceil((chatResetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

    return (
        <div className="w-full px-4 py-6 md:px-6 md:py-10 bg-tera-bg text-tera-primary">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.5em] text-tera-secondary">TERA</p>
                        <h1 className="text-3xl font-semibold leading-tight text-tera-primary">Profile</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleCancel}
                                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/30"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="rounded-full border border-tera-neon bg-tera-neon/10 px-4 py-2 text-sm text-tera-neon transition hover:bg-tera-neon/20"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save changes'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="rounded-full border border-tera-border px-4 py-2 text-sm text-tera-primary transition hover:border-tera-neon"
                            >
                                Edit profile
                            </button>
                        )}
                    </div>
                </header>

                {/* Profile Card */}
                <div className="rounded-[28px] bg-tera-panel border border-tera-border p-8 shadow-glow-md">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tera-neon/40 to-blue-500/40 text-white font-bold text-3xl">
                            {initials}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            {editing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-tera-primary/80 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full rounded-lg bg-tera-muted border border-tera-border px-4 py-2 text-tera-primary focus:border-tera-neon focus:outline-none"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-tera-primary/80 mb-2">Organization / Company (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.school}
                                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                            className="w-full rounded-lg bg-tera-muted border border-tera-border px-4 py-2 text-tera-primary focus:border-tera-neon focus:outline-none"
                                            placeholder="Enter your organization, company, or institution"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-tera-primary/80 mb-2">Interests (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.gradeLevels.join(', ')}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                gradeLevels: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                            })}
                                            className="w-full rounded-lg bg-tera-muted border border-tera-border px-4 py-2 text-tera-primary focus:border-tera-neon focus:outline-none"
                                            placeholder="e.g., Machine Learning, Data Science, Web Development"
                                        />
                                        <p className="mt-1 text-xs text-tera-secondary">Separate multiple interests with commas</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-semibold text-tera-primary">{displayName}</h2>
                                    <p className="text-tera-secondary mt-1">{email}</p>
                                    {formData.school && (
                                        <p className="text-tera-primary/80 mt-2">🏢 {formData.school}</p>
                                    )}
                                    {formData.gradeLevels.length > 0 && (
                                        <div className="flex gap-2 mt-3">
                                            {formData.gradeLevels.map((level, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 rounded-full bg-tera-muted text-xs text-tera-primary/80 border border-tera-border"
                                                >
                                                    {level}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-4 text-sm text-tera-secondary">
                                        Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Current Plan Badge */}
                        <div className="text-right">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${profile.subscriptionPlan === 'plus'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : profile.subscriptionPlan === 'pro'
                                    ? 'bg-tera-neon/20 text-tera-neon border border-tera-neon/30'
                                    : 'bg-tera-muted text-tera-primary/80 border border-tera-border'
                                }`}>
                                {planConfig.displayName} Plan
                            </div>
                            <div className="mt-3 space-x-4">
                                {profile.subscriptionPlan !== 'free' && (
                                    <button
                                        onClick={handleManageSubscription}
                                        disabled={portalLoading}
                                        className="text-sm text-tera-secondary hover:text-tera-primary underline disabled:opacity-50"
                                    >
                                        {portalLoading ? 'Loading...' : 'Manage subscription'}
                                    </button>
                                )}
                                <Link
                                    href="/pricing"
                                    className="text-sm text-tera-neon hover:underline"
                                >
                                    {profile.subscriptionPlan === 'free' ? 'Upgrade plan →' : 'Change plan →'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Statistics */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Chat Usage */}
                    <div className="rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-tera-primary">Chat Sessions</h3>
                            <span className="text-2xl">💬</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-3xl font-bold text-tera-primary">{profile.dailyChats}</span>
                                    <span className="text-tera-secondary">
                                        / {chatLimit === 'unlimited' ? '∞' : chatLimit} today
                                    </span>
                                </div>

                                {chatLimit !== 'unlimited' && (
                                    <>
                                        <div className="w-full bg-tera-muted rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${chatPercentage >= 90
                                                    ? 'bg-red-500'
                                                    : chatPercentage >= 70
                                                        ? 'bg-yellow-500'
                                                        : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${chatPercentage}%` }}
                                            />
                                        </div>

                                        <p className="text-sm text-tera-secondary mt-2">
                                            {remainingChats} remaining
                                        </p>
                                    </>
                                )}

                                {chatLimit === 'unlimited' && (
                                    <div className="flex items-center gap-2 text-sm text-blue-400">
                                        Unlimited usage
                                        <div className="relative inline-block w-4 h-4 ml-1 align-sub">
                                            <Image
                                                src="/images/TERA_LOGO_ONLY1.png"
                                                alt="Tera"
                                                fill
                                                className="object-contain block dark:hidden"
                                            />
                                            <Image
                                                src="/images/TERA_LOGO_ONLY.png"
                                                alt="Tera"
                                                fill
                                                className="object-contain hidden dark:block"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {profile.subscriptionPlan === 'free' && chatPercentage >= 80 && !chatUnlockTime && (
                                <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
                                    <p className="text-sm text-blue-400">
                                        ⚠️ You're approaching your daily limit. <Link href="/pricing" className="underline font-medium">Upgrade to Pro</Link> for unlimited chats.
                                    </p>
                                </div>
                            )}

                            {chatUnlockTime && (
                                <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-3">
                                    <p className="text-sm text-orange-400">
                                        🔒 Chat limit reached. Access unlocks in: <span className="font-semibold text-tera-neon">{chatUnlockTime}</span>
                                    </p>
                                </div>
                            )}

                            {/* Recent Sessions List */}
                            <div className="mt-6 pt-6 border-t border-tera-border">
                                <h4 className="text-sm font-semibold text-tera-primary mb-4 flex items-center justify-between">
                                    Recent Sessions
                                    <Link href="/history" className="text-xs text-tera-neon hover:underline font-normal">View all →</Link>
                                </h4>

                                {sessionsLoading ? (
                                    <div className="text-xs text-tera-secondary animate-pulse">Loading recent sessions...</div>
                                ) : recentSessions.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                        {recentSessions.map((session) => (
                                            <Link
                                                key={session.id}
                                                href={`/new/${session.session_id}`}
                                                className="flex items-center justify-between p-3 rounded-xl bg-tera-muted/50 border border-tera-border hover:border-tera-neon/50 transition group"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-tera-primary truncate group-hover:text-tera-neon transition-colors">
                                                        {session.title || 'Untitled Session'}
                                                    </p>
                                                    <p className="text-[10px] text-tera-secondary uppercase tracking-tight mt-0.5">
                                                        {session.tool || 'Universal'} • {new Date(session.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-tera-secondary group-hover:text-tera-neon transition-colors">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                </svg>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-tera-secondary py-2 italic text-center">No recent sessions found. Start a new chat!</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* File Upload Usage */}
                <div className="rounded-[28px] bg-tera-panel border border-tera-border p-6 shadow-glow-md">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-tera-primary">File Uploads</h3>
                        <span className="text-2xl">📁</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-3xl font-bold text-tera-primary">{profile.dailyFileUploads}</span>
                                <span className="text-tera-secondary">
                                    / {fileUploadsPerDay === 'unlimited' ? '∞' : fileUploadsPerDay} today
                                </span>
                            </div>

                            {fileUploadsPerDay !== 'unlimited' && (
                                <>
                                    <div className="w-full bg-tera-muted rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${uploadPercentage >= 90
                                                ? 'bg-red-500'
                                                : uploadPercentage >= 70
                                                    ? 'bg-yellow-500'
                                                    : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${uploadPercentage}%` }}
                                        />
                                    </div>

                                    <p className="text-sm text-tera-secondary mt-2">
                                        {remainingUploads} remaining
                                    </p>
                                </>
                            )}

                            {fileUploadsPerDay === 'unlimited' && (
                                <div className="flex items-center gap-2 text-sm text-blue-400">
                                    Unlimited uploads
                                    <div className="relative inline-block w-4 h-4 ml-1 align-sub">
                                        <Image
                                            src="/images/TERA_LOGO_ONLY1.png"
                                            alt="Tera"
                                            fill
                                            className="object-contain block dark:hidden"
                                        />
                                        <Image
                                            src="/images/TERA_LOGO_ONLY.png"
                                            alt="Tera"
                                            fill
                                            className="object-contain hidden dark:block"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {profile.subscriptionPlan === 'free' && uploadPercentage >= 80 && !uploadUnlockTime && (
                            <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
                                <p className="text-sm text-blue-400">
                                    ⚠️ You're approaching your daily upload limit. <Link href="/pricing" className="underline font-medium">Upgrade to Pro</Link> for more uploads.
                                </p>
                            </div>
                        )}

                        {uploadUnlockTime && (
                            <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-3">
                                <p className="text-sm text-orange-400">
                                    🔒 Upload limit reached. Access unlocks in: <span className="font-semibold text-tera-neon">{uploadUnlockTime}</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Plan Features */}
                <div className="rounded-[28px] bg-tera-panel border border-tera-border p-8 shadow-glow-md">
                    <h3 className="text-xl font-semibold text-tera-primary mb-6">Your {planConfig.displayName} Plan Features</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {planConfig.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <span className="mt-1 text-tera-neon">✓</span>
                                <span className="text-tera-primary/80">{feature}</span>
                            </div>
                        ))}
                    </div>

                    {profile.subscriptionPlan !== 'plus' && (
                        <div className="mt-8 pt-6 border-t border-tera-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg font-medium text-tera-primary">
                                        Want more features?
                                    </h4>
                                    <p className="text-sm text-tera-secondary mt-1">
                                        Upgrade to unlock unlimited access and advanced features
                                    </p>
                                </div>
                                <Link
                                    href="/pricing"
                                    className="px-6 py-3 rounded-lg bg-tera-neon text-black font-medium hover:bg-tera-neon/90 transition"
                                >
                                    View Plans
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Billing Cycle Info */}
                {chatResetDate && (
                    <div className="rounded-[28px] bg-tera-muted border border-tera-border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-tera-secondary">Daily usage resets in</p>
                                <p className="text-lg font-semibold text-tera-primary mt-1">
                                    {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-tera-secondary">Next reset date</p>
                                <p className="text-lg font-semibold text-tera-primary mt-1">
                                    {chatResetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
