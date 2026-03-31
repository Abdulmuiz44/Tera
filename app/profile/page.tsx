'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import UsageMetricCard from '@/components/UsageMetricCard'
import { fetchUserProfile, fetchUserSessions, fetchUserUsageSummary, updateUserProfile } from '@/app/actions/user'
import type { UserProfile } from '@/lib/usage-tracking'
import type { ProfileUsageSummary } from '@/lib/profile-usage'
import { TERA_USAGE_REFRESH_EVENT } from '@/lib/usage-events'

function formatMemberSince(createdAt: Date) {
  return createdAt.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}
import { checkLimitReset, fetchCreditUsage, fetchDailyTokenUsage, fetchUserProfile, fetchUserSessions, updateUserProfile } from '@/app/actions/user'
import { type UserProfile } from '@/lib/usage-tracking'
import { getPlanConfig, getRemainingChats, getRemainingFileUploads, getUsagePercentage, type PlanType } from '@/lib/plan-config'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [usageSummary, setUsageSummary] = useState<ProfileUsageSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [usageLoading, setUsageLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ fullName: '', school: '', gradeLevels: [] as string[] })
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [creditUsage, setCreditUsage] = useState<{ used: number; remaining: number; total: number; resetDate: string | null } | null>(null)
  const [dailyTokenUsage, setDailyTokenUsage] = useState(0)

  const loadUsageSummary = useCallback(async () => {
    if (!user) return

    setUsageLoading(true)
    try {
      const summary = await fetchUserUsageSummary(user.id)
      setUsageSummary(summary)
    } catch (error) {
      console.error('Error loading usage summary:', error)
    } finally {
      setUsageLoading(false)
    }
  }, [user])

  const loadRecentSessions = useCallback(async () => {
  useEffect(() => {
    if (user) {
      void loadProfile()
      void loadRecentSessions()
      void loadCreditUsage()
      void loadDailyTokenUsage()
    }
  }, [user])

  const loadCreditUsage = async () => {
    if (!user) return
    try {
      const usage = await fetchCreditUsage(user.id)
      if (!usage) return
      setCreditUsage({
        used: usage.used,
        remaining: usage.remaining,
        total: usage.total,
        resetDate: usage.resetDate,
      })
    } catch (error) {
      console.error('Error loading credit usage:', error)
    }
  }

  const loadDailyTokenUsage = async () => {
    if (!user) return
    try {
      const usage = await fetchDailyTokenUsage(user.id)
      if (!usage) return
      setDailyTokenUsage(usage.usedToday)
    } catch (error) {
      console.error('Error loading daily token usage:', error)
    }
  }

  const loadRecentSessions = async () => {
    if (!user) return
    setSessionsLoading(true)
    try {
      const sessions = await fetchUserSessions(user.id)
      setRecentSessions(sessions)
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setSessionsLoading(false)
    }
  }, [user])

  const loadProfile = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchUserProfile(user.id)
      if (data) {
        setProfile(data)
        setFormData({
          fullName: data.fullName || '',
          school: data.school || '',
          gradeLevels: data.gradeLevels || [],
        })
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    void Promise.all([
      loadProfile(),
      loadUsageSummary(),
      loadRecentSessions(),
    ])
  }, [loadProfile, loadRecentSessions, loadUsageSummary, user])

  useEffect(() => {
    const handleUsageRefresh = () => {
      void loadUsageSummary()
    }

    window.addEventListener(TERA_USAGE_REFRESH_EVENT, handleUsageRefresh)
    return () => window.removeEventListener(TERA_USAGE_REFRESH_EVENT, handleUsageRefresh)
  }, [loadUsageSummary])

  const handleSave = async () => {
    if (!user || !profile) return
    setSaving(true)
    try {
      await updateUserProfile(user.id, { ...profile, ...formData })
      setProfile({ ...profile, ...formData })
      setEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleManageSubscription = async () => {
    if (!user) return
    setPortalLoading(true)
    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
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
    return <div className="tera-page flex items-center justify-center text-sm text-tera-secondary">Loading profile...</div>
  }

  if (!profile || !user) {
    return <div className="tera-page flex items-center justify-center text-sm text-tera-secondary">Unable to load profile.</div>
  }

  const planConfig = getPlanConfig(profile.subscriptionPlan as PlanType)
  const remainingChats = getRemainingChats(profile.subscriptionPlan as PlanType, profile.dailyChats)
  const remainingUploads = getRemainingFileUploads(profile.subscriptionPlan as PlanType, profile.dailyFileUploads)
  const uploadLimit = planConfig.limits.fileUploadsPerDay
  const uploadPercentage = uploadLimit === 'unlimited' ? 0 : getUsagePercentage(uploadLimit as number, profile.dailyFileUploads)
  const creditPercentage = creditUsage ? Math.min(100, Math.round((creditUsage.used / Math.max(1, creditUsage.total)) * 100)) : 0
  const creditResetLabel = creditUsage?.resetDate
    ? new Date(creditUsage.resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'in 30 days'

  const email = user.email || ''
  const displayName = formData.fullName || profile.fullName || (email ? email.split('@')[0] : '') || 'User'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="tera-page">
      <div className="tera-page-shell pt-24 md:pt-10">
        <div className="tera-page-header">
          <div>
            <p className="tera-eyebrow">Workspace</p>
            <h1 className="tera-title mt-3">Profile</h1>
            <p className="tera-subtitle mt-4">Manage your identity, review live usage across Tera, and keep subscription details close to the main workspace.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {editing ? (
              <>
                <button type="button" onClick={() => setEditing(false)} className="tera-button-secondary" disabled={saving}>Cancel</button>
                <button type="button" onClick={handleSave} className="tera-button-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
              </>
            ) : (
              <button type="button" onClick={() => setEditing(true)} className="tera-button-secondary">Edit profile</button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="tera-surface p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-br from-tera-neon/20 to-white/[0.04] text-3xl font-semibold text-tera-primary">
                  {initials}
                </div>
                <div className="min-w-0">
                  {editing ? (
                    <div className="space-y-4">
                      <input value={formData.fullName} onChange={(event) => setFormData({ ...formData, fullName: event.target.value })} className="tera-input w-full" placeholder="Full name" />
                      <input value={formData.school} onChange={(event) => setFormData({ ...formData, school: event.target.value })} className="tera-input w-full" placeholder="Organization or company" />
                      <input value={formData.gradeLevels.join(', ')} onChange={(event) => setFormData({ ...formData, gradeLevels: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) })} className="tera-input w-full" placeholder="Interests, comma separated" />
                    </div>
                  ) : (
                    <>
                      <p className="tera-eyebrow">Identity</p>
                      <h2 className="mt-3 text-3xl font-semibold text-tera-primary">{displayName}</h2>
                      <p className="mt-2 text-sm text-tera-secondary">{email}</p>
                      {formData.school && <p className="mt-2 text-sm text-tera-primary/90">{formData.school}</p>}
                      {formData.gradeLevels.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {formData.gradeLevels.map((tag) => (
                            <span key={tag} className="rounded-full border border-tera-border bg-white/[0.04] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-tera-secondary">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-[22px] border border-tera-border bg-white/[0.03] px-5 py-4 text-left md:min-w-[220px]">
                <p className="tera-eyebrow">Member since</p>
                <p className="mt-3 text-xl font-semibold text-tera-primary">{formatMemberSince(profile.createdAt)}</p>
                <p className="mt-2 text-sm text-tera-secondary">Usage cards below refresh from the same tracked counters Tera uses while you work.</p>
                <p className="tera-eyebrow">Plan</p>
                <p className="mt-3 text-xl font-semibold text-tera-primary">{planConfig.displayName}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {profile.subscriptionPlan === 'free' ? (
                    <Link href="/pricing" className="tera-button-upgrade">Upgrade</Link>
                  ) : (
                    <button type="button" onClick={handleManageSubscription} disabled={portalLoading} className="tera-button-secondary disabled:opacity-60">
                      {portalLoading ? 'Loading...' : 'Manage'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="tera-surface p-6 md:p-8">
            <p className="tera-eyebrow">Subscription</p>
            <h2 className="mt-3 text-3xl font-semibold text-tera-primary">{usageSummary?.planDisplayName || 'Current plan'}</h2>
            <p className="mt-3 text-sm leading-7 text-tera-secondary">Upgrade to expand uploads and web search limits, or manage billing details from the same place you review activity.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {profile.subscriptionPlan === 'free' ? (
                <Link href="/pricing" className="tera-button-primary">Upgrade</Link>
              ) : (
                <button type="button" onClick={handleManageSubscription} disabled={portalLoading} className="tera-button-secondary disabled:opacity-60">
                  {portalLoading ? 'Loading...' : 'Manage'}
                </button>
              )}
              <button type="button" onClick={() => void loadUsageSummary()} disabled={usageLoading} className="tera-button-secondary disabled:opacity-60">
                {usageLoading ? 'Refreshing...' : 'Refresh usage'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="tera-eyebrow">Balance</p>
              <h2 className="mt-3 text-3xl font-semibold text-tera-primary">Usage dashboard</h2>
              <p className="mt-3 text-sm leading-7 text-tera-secondary">A live view of the counters Tera updates when you send messages, upload files, or run web search.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {usageSummary ? (
              <>
                <UsageMetricCard title="Messages" metric={usageSummary.messages} />
                <UsageMetricCard title="Web search" metric={usageSummary.webSearch} />
                <UsageMetricCard title="File uploads" metric={usageSummary.uploads} />
                <div className="tera-card h-full">
                  <div className="flex h-full flex-col justify-between gap-6">
                    <div>
                      <p className="text-sm font-medium text-tera-secondary">Account</p>
                      <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-tera-primary">{usageSummary.planDisplayName}</p>
                      <p className="mt-3 text-sm text-tera-secondary">This card mirrors the plan limits that power the rest of the dashboard.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-[20px] border border-tera-border bg-white/[0.03] px-4 py-4">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-tera-secondary">Messages</span>
                          <span className="text-tera-primary">{usageSummary.messages.isUnlimited ? 'Unlimited' : usageSummary.messages.limit}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                          <span className="text-tera-secondary">Uploads / day</span>
                          <span className="text-tera-primary">{usageSummary.uploads.isUnlimited ? 'Unlimited' : usageSummary.uploads.limit}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                          <span className="text-tera-secondary">Web search / month</span>
                          <span className="text-tera-primary">{usageSummary.webSearch.isUnlimited ? 'Unlimited' : usageSummary.webSearch.limit}</span>
                        </div>
                      </div>
                      <p className="text-sm text-tera-secondary">Usage updates immediately after successful activity in this tab.</p>
                    <p className="text-sm text-tera-secondary">Remaining: {remainingChats === 'unlimited' ? 'Unlimited' : remainingChats}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-tera-secondary">Tokens used today</p>
                      <p className="mt-2 text-3xl font-semibold text-tera-primary">{dailyTokenUsage}</p>
                    </div>
                    <p className="text-sm text-tera-secondary">
                      Monthly remaining: {creditUsage ? `${creditUsage.remaining} / ${creditUsage.total}` : 'Loading...'}
                    </p>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full ${creditPercentage >= 85 ? 'bg-red-400' : creditPercentage >= 60 ? 'bg-amber-400' : 'bg-tera-neon'}`}
                      style={{ width: `${creditPercentage}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-tera-secondary">
                    {creditPercentage >= 85
                      ? 'You are close to your monthly credit limit. Upgrade for higher limits.'
                      : 'Credits are charged by tokens consumed as you chat with Tera.'}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-tera-secondary">
                    Today: {dailyTokenUsage} tokens used · Credits reset on {creditResetLabel}
                  </p>
                </div>
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-tera-secondary">File uploads today</p>
                      <p className="mt-2 text-3xl font-semibold text-tera-primary">{profile.dailyFileUploads}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="tera-card lg:col-span-2">
                <p className="text-sm text-tera-secondary">Unable to load usage summary right now. Profile details are still available.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 tera-card">
          <p className="tera-eyebrow">Recent sessions</p>
          <div className="mt-4 space-y-3">
            {sessionsLoading ? (
              <p className="text-sm text-tera-secondary">Loading recent sessions...</p>
            ) : recentSessions.length > 0 ? (
              recentSessions.map((session) => (
                <Link key={session.session_id} href={`/new/${session.session_id}`} className="block rounded-[20px] border border-tera-border bg-white/[0.03] px-4 py-4 transition hover:border-white/16 hover:bg-white/[0.05]">
                  <p className="truncate text-sm font-medium text-tera-primary">{session.title || 'Untitled session'}</p>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.22em] text-tera-secondary">{session.tool || 'Universal'} � {new Date(session.created_at).toLocaleDateString()}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-tera-secondary">No recent sessions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
