'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
<<<<<<< HEAD
import Sidebar from '@/components/Sidebar'
import { getUserProfile } from '@/lib/usage-tracking'
import { getPlanConfig, getRemainingChats, getUsagePercentage } from '@/lib/plan-config'
import type { UserProfile, PlanType } from '@/lib/plan-config'
=======

import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/usage-tracking'
import Image from 'next/image'
import { getPlanConfig, getRemainingChats, getUsagePercentage, type PlanType } from '@/lib/plan-config'
>>>>>>> ed9d5f91f36688c26cec283eda62004420da3485
import Link from 'next/link'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    const data = await getUserProfile(user.id)
    setProfile(data)
    setLoading(false)
  }

  if (loading) {
    return (
<<<<<<< HEAD
      <div className="flex h-screen bg-white dark:bg-black">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </main>
=======
      <div className="flex flex-col h-full w-full items-center justify-center bg-tera-bg text-tera-primary">
        <div className="text-tera-secondary">Loading profile...</div>
>>>>>>> ed9d5f91f36688c26cec283eda62004420da3485
      </div>
    )
  }

  if (!profile || !user) {
    return (
<<<<<<< HEAD
      <div className="flex h-screen bg-white dark:bg-black">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
        </main>
=======
      <div className="flex flex-col h-full w-full items-center justify-center bg-tera-bg text-tera-primary">
        <div className="text-tera-secondary">Error loading profile</div>
>>>>>>> ed9d5f91f36688c26cec283eda62004420da3485
      </div>
    )
  }

  const planConfig = getPlanConfig(profile.subscriptionPlan as PlanType)
  const remainingChats = getRemainingChats(profile.subscriptionPlan as PlanType, profile.dailyChats)
  const chatLimit = planConfig.limits.chatsPerDay
<<<<<<< HEAD
  const chatPercentage = getUsagePercentage(chatLimit as number, profile.dailyChats)

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Profile</h1>

          {/* User Info */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-white dark:text-black">
                {user.email?.[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-black dark:text-white">{profile.fullName || user.email}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-black dark:text-white mb-4">Subscription</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 dark:text-gray-400">Plan:</span>
              <span className="font-semibold text-black dark:text-white capitalize">{profile.subscriptionPlan}</span>
            </div>
            {profile.subscriptionPlan === 'free' && (
              <Link
                href="/pricing"
                className="inline-block px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded font-medium hover:opacity-90 transition"
              >
                Upgrade Plan
              </Link>
            )}
          </div>

          {/* Usage */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg p-6">
            <h3 className="font-semibold text-black dark:text-white mb-6">Daily Chat Usage</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Chats today:</span>
                <span className="font-semibold text-black dark:text-white">
                  {profile.dailyChats} / {chatLimit === 'unlimited' ? '∞' : chatLimit}
                </span>
              </div>

              {chatLimit !== 'unlimited' && (
                <>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-black dark:bg-white rounded-full h-full transition-all"
                      style={{ width: `${chatPercentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {remainingChats === 'unlimited' ? '∞' : remainingChats} chats remaining today
                  </p>
                </>
              )}

              {chatLimit === 'unlimited' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Unlimited usage</p>
              )}
            </div>
          </div>
=======

  const chatPercentage = getUsagePercentage(chatLimit, profile.dailyChats)

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
              <Link
                href="/pricing"
                className="inline-block mt-3 text-sm text-tera-neon hover:underline"
              >
                {profile.subscriptionPlan === 'free' ? 'Upgrade plan →' : 'Change plan →'}
              </Link>
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
                    <Image src="/images/TERA_LOGO_ONLY.png" alt="Tera" width={16} height={16} className="object-contain inline-block" />
                  </div>
                )}
              </div>

              {profile.subscriptionPlan === 'free' && chatPercentage >= 80 && (
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
                  <p className="text-sm text-blue-400">
                    ⚠️ You're approaching your daily limit. <Link href="/pricing" className="underline font-medium">Upgrade to Pro</Link> for unlimited chats.
                  </p>
                </div>
              )}
            </div>
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
>>>>>>> ed9d5f91f36688c26cec283eda62004420da3485
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
