'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/usage-tracking'
import { getPlanConfig, getRemainingLessonPlans, getRemainingChats, getUsagePercentage, type PlanType } from '@/lib/plan-config'
import Link from 'next/link'

export default function ProfilePage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    school: '',
    gradeLevels: [] as string[]
  })

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

    if (data) {
      setFormData({
        fullName: data.fullName || '',
        school: data.school || '',
        gradeLevels: data.gradeLevels || []
      })
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    const success = await updateUserProfile(user.id, {
      fullName: formData.fullName || undefined,
      school: formData.school || undefined,
      gradeLevels: formData.gradeLevels.length > 0 ? formData.gradeLevels : undefined
    })

    if (success) {
      await loadProfile()
      setEditing(false)
    }

    setSaving(false)
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        school: profile.school || '',
        gradeLevels: profile.gradeLevels || []
      })
    }
    setEditing(false)
  }

  if (!user || loading) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        <main className="relative flex-1 flex items-center justify-center">
          <div className="text-white/40">Loading profile...</div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        <main className="relative flex-1 flex items-center justify-center">
          <div className="text-white/40">Error loading profile</div>
        </main>
      </div>
    )
  }

  const planConfig = getPlanConfig(profile.subscriptionPlan as PlanType)
  const remainingLessonPlans = getRemainingLessonPlans(profile.subscriptionPlan as PlanType, profile.monthlyLessonPlans)
  const remainingChats = getRemainingChats(profile.subscriptionPlan as PlanType, profile.monthlyChats)

  const lessonPlanLimit = planConfig.limits.lessonPlansPerMonth
  const chatLimit = planConfig.limits.chatsPerMonth

  const lessonPlanPercentage = getUsagePercentage(lessonPlanLimit, profile.monthlyLessonPlans)
  const chatPercentage = getUsagePercentage(chatLimit, profile.monthlyChats)

  const email = user.email || ''
  const displayName = formData.fullName || profile.fullName || email.split('@')[0] || 'User'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const resetDate = profile.planResetDate ? new Date(profile.planResetDate) : null
  const daysUntilReset = resetDate ? Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="relative flex-1 overflow-y-auto px-6 py-10 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">TERA</p>
              <h1 className="text-3xl font-semibold leading-tight text-white">Profile</h1>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {planConfig.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="mt-1 text-tera-neon">✓</span>
                          <span className="text-white/80">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {profile.subscriptionPlan !== 'school' && (
                      <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-white">
                              Want more features?
                            </h4>
                            <p className="text-sm text-white/60 mt-1">
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
                  {resetDate && (
                    <div className="rounded-[28px] bg-tera-muted border border-white/10 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/60">Usage resets in</p>
                          <p className="text-lg font-semibold text-white mt-1">
                            {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white/60">Next reset date</p>
                          <p className="text-lg font-semibold text-white mt-1">
                            {resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </main>
        </div>
        )
}
