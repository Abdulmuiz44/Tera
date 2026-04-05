'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import UsageMetricCard from '@/components/UsageMetricCard'
import { fetchCreditUsage, fetchUserProfile, fetchUserSessions, fetchUserUsageSummary, updateUserProfile } from '@/app/actions/user'
import { buildUsageMetricSummary, type ProfileUsageSummary } from '@/lib/profile-usage'
import { TERA_USAGE_REFRESH_EVENT } from '@/lib/usage-events'
import type { UserProfile } from '@/lib/usage-tracking'

type CreditUsageState = {
  used: number
  remaining: number
  total: number
  resetDate: string | null
} | null

function formatMemberSince(createdAt: Date) {
  return createdAt.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [usageSummary, setUsageSummary] = useState<ProfileUsageSummary | null>(null)
  const [creditUsage, setCreditUsage] = useState<CreditUsageState>(null)
  const [loading, setLoading] = useState(true)
  const [usageLoading, setUsageLoading] = useState(true)
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ fullName: '', school: '', gradeLevels: [] as string[] })
  const [recentSessions, setRecentSessions] = useState<any[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  const loadUsageSummary = useCallback(async () => {
    if (!user) return

    setUsageLoading(true)
    try {
      const summary = await fetchUserUsageSummary(user.id)
      setUsageSummary(summary)
    } catch (error) {
      console.error('Error loading usage summary:', error)
      setUsageSummary(null)
    } finally {
      setUsageLoading(false)
    }
  }, [user])

  const loadCreditUsage = useCallback(async () => {
    if (!user) return

    setCreditsLoading(true)
    try {
      const usage = await fetchCreditUsage(user.id)
      setCreditUsage(usage)
    } catch (error) {
      console.error('Error loading credit usage:', error)
      setCreditUsage(null)
    } finally {
      setCreditsLoading(false)
    }
  }, [user])

  const loadRecentSessions = useCallback(async () => {
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
      loadCreditUsage(),
      loadRecentSessions(),
    ])
  }, [loadCreditUsage, loadProfile, loadRecentSessions, loadUsageSummary, user])

  useEffect(() => {
    const handleUsageRefresh = () => {
      void Promise.all([loadUsageSummary(), loadCreditUsage()])
    }

    window.addEventListener(TERA_USAGE_REFRESH_EVENT, handleUsageRefresh)
    return () => window.removeEventListener(TERA_USAGE_REFRESH_EVENT, handleUsageRefresh)
  }, [loadCreditUsage, loadUsageSummary])

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

  const email = user.email || ''
  const displayName = formData.fullName || profile.fullName || (email ? email.split('@')[0] : '') || 'User'
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const creditMetric = creditUsage
    ? buildUsageMetricSummary(
        creditUsage.used,
        creditUsage.total,
        creditUsage.resetDate ? new Date(creditUsage.resetDate) : null,
      )
    : null

  const usageCardsLoading = usageLoading || creditsLoading

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
              </div>
            </div>
          </div>

          <div className="tera-surface p-6 md:p-8">
            <p className="tera-eyebrow">Subscription</p>
            <h2 className="mt-3 text-3xl font-semibold text-tera-primary">{usageSummary?.planDisplayName || 'Current plan'}</h2>
            <p className="mt-3 text-sm leading-7 text-tera-secondary">Manage billing details, review your monthly credits, and keep subscription details close to the rest of the workspace.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {profile.subscriptionPlan === 'free' ? (
                <Link href="/pricing" className="tera-button-primary">Upgrade</Link>
              ) : (
                <button type="button" onClick={handleManageSubscription} disabled={portalLoading} className="tera-button-secondary disabled:opacity-60">
                  {portalLoading ? 'Loading...' : 'Manage'}
                </button>
              )}
              <button type="button" onClick={() => void Promise.all([loadUsageSummary(), loadCreditUsage()])} disabled={usageLoading || creditsLoading} className="tera-button-secondary disabled:opacity-60">
                {usageLoading || creditsLoading ? 'Refreshing...' : 'Refresh usage'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="tera-eyebrow">Balance</p>
              <h2 className="mt-3 text-3xl font-semibold text-tera-primary">Usage dashboard</h2>
              <p className="mt-3 text-sm leading-7 text-tera-secondary">A live view of the counters Tera updates when you send messages, upload files, run web search, or spend monthly credits.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {usageCardsLoading || !usageSummary || !creditMetric ? (
              <div className="tera-card lg:col-span-2">
                <p className="text-sm text-tera-secondary">Loading usage summary...</p>
              </div>
            ) : (
              <>
                <UsageMetricCard title="Messages" metric={usageSummary.messages} />
                <UsageMetricCard title="Web search" metric={usageSummary.webSearch} />
                <UsageMetricCard title="File uploads" metric={usageSummary.uploads} />
                <UsageMetricCard title="Monthly credits" metric={creditMetric} />
              </>
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
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.22em] text-tera-secondary">{session.tool || 'Universal'} · {new Date(session.created_at).toLocaleDateString()}</p>
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
