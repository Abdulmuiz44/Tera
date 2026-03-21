'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { checkLimitReset, fetchUserProfile, fetchUserSessions, updateUserProfile } from '@/app/actions/user'
import { type UserProfile } from '@/lib/usage-tracking'
import { getPlanConfig, getRemainingChats, getRemainingFileUploads, getUsagePercentage, type PlanType } from '@/lib/plan-config'

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

  useEffect(() => {
    if (user) {
      void loadProfile()
      void loadRecentSessions()
    }
  }, [user])

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
  }

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    await checkLimitReset(user.id)
    const data = await fetchUserProfile(user.id)
    if (data) {
      setProfile(data)
      setFormData({
        fullName: data.fullName || '',
        school: data.school || '',
        gradeLevels: data.gradeLevels || [],
      })
    }
    setLoading(false)
  }

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
            <p className="tera-subtitle mt-4">Manage your identity, review usage, and keep subscription details close to the main workspace.</p>
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

          <div className="space-y-6">
            <div className="tera-card">
              <p className="tera-eyebrow">Usage</p>
              <div className="mt-4 space-y-5">
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-tera-secondary">Messages today</p>
                      <p className="mt-2 text-3xl font-semibold text-tera-primary">{profile.dailyChats}</p>
                    </div>
                    <p className="text-sm text-tera-secondary">Remaining: {remainingChats === 'unlimited' ? 'Unlimited' : remainingChats}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-tera-secondary">File uploads today</p>
                      <p className="mt-2 text-3xl font-semibold text-tera-primary">{profile.dailyFileUploads}</p>
                    </div>
                    <p className="text-sm text-tera-secondary">Remaining: {remainingUploads === 'unlimited' ? 'Unlimited' : remainingUploads}</p>
                  </div>
                  {uploadLimit !== 'unlimited' && (
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full bg-tera-neon" style={{ width: `${uploadPercentage}%` }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="tera-card">
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
      </div>
    </div>
  )
}
