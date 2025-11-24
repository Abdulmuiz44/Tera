'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/usage-tracking'
import Image from 'next/image'
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
  const remainingChats = getRemainingChats(profile.subscriptionPlan as PlanType, profile.dailyChats)

  const lessonPlanLimit = planConfig.limits.lessonPlansPerMonth
  const chatLimit = planConfig.limits.chatsPerDay

  const lessonPlanPercentage = getUsagePercentage(lessonPlanLimit, profile.monthlyLessonPlans)
  const chatPercentage = getUsagePercentage(chatLimit, profile.dailyChats)

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
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon"
                >
                  Edit profile
                </button>
              )}
            </div>
          </header>

          {/* Profile Card */}
          <div className="rounded-[28px] bg-tera-panel border border-white/10 p-8 shadow-glow-md">
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
                      <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full rounded-lg bg-tera-muted border border-white/10 px-4 py-2 text-white focus:border-tera-neon focus:outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">School / Institution</label>
                      <input
                        type="text"
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        className="w-full rounded-lg bg-tera-muted border border-white/10 px-4 py-2 text-white focus:border-tera-neon focus:outline-none"
                        placeholder="Enter your school or institution"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Grade Levels</label>
                      <input
                        type="text"
                        value={formData.gradeLevels.join(', ')}
                        onChange={(e) => setFormData({
                          ...formData,
                          gradeLevels: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        className="w-full rounded-lg bg-tera-muted border border-white/10 px-4 py-2 text-white focus:border-tera-neon focus:outline-none"
                        placeholder="e.g., K-2, 3-5, Middle School"
                      />
                      <p className="mt-1 text-xs text-white/40">Separate multiple levels with commas</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold text-white">{displayName}</h2>
                    <p className="text-white/60 mt-1">{email}</p>
                    {formData.school && (
                      <p className="text-white/80 mt-2">🏫 {formData.school}</p>
                    )}
                    {formData.gradeLevels.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {formData.gradeLevels.map((level, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80 border border-white/10"
                          >
                            {level}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 text-sm text-white/40">
                      Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </>
                )}
              </div>

              {/* Current Plan Badge */}
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${profile.subscriptionPlan === 'school'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : profile.subscriptionPlan === 'pro'
                    ? 'bg-tera-neon/20 text-tera-neon border border-tera-neon/30'
                    : 'bg-white/10 text-white/80 border border-white/10'
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lesson Plans Usage */}
            <div className="rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Lesson Plans</h3>
                <span className="text-2xl">📚</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">{profile.monthlyLessonPlans}</span>
                    <span className="text-white/60">
                      / {lessonPlanLimit === 'unlimited' ? '∞' : lessonPlanLimit} this month
                    </span>
                  </div>

                  {lessonPlanLimit !== 'unlimited' && (
                    <>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${lessonPlanPercentage >= 90
                            ? 'bg-red-500'
                            : lessonPlanPercentage >= 70
                              ? 'bg-yellow-500'
                              : 'bg-tera-neon'
                            }`}
                          style={{ width: `${lessonPlanPercentage}%` }}
                        />
                      </div>

                      <p className="text-sm text-white/60 mt-2">
                        {remainingLessonPlans} remaining
                      </p>
                    </>
                  )}

                  {lessonPlanLimit === 'unlimited' && (
                    <div className="flex items-center gap-2 text-sm text-tera-neon">
                      Unlimited usage
                      <Image src="/images/TERA_LOGO_ONLY.png" alt="Tera" width={16} height={16} className="object-contain inline-block" />
                    </div>
                  )}
                </div>

                {profile.subscriptionPlan === 'free' && lessonPlanPercentage >= 80 && (
                  <div className="rounded-lg bg-tera-neon/10 border border-tera-neon/30 p-3">
                    <p className="text-sm text-tera-neon">
                      ⚠️ You're approaching your monthly limit. <Link href="/pricing" className="underline font-medium">Upgrade to Pro</Link> for unlimited access.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Usage */}
            <div className="rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Chat Sessions</h3>
                <span className="text-2xl">💬</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-white">{profile.dailyChats}</span>
                    <span className="text-white/60">
                      / {chatLimit === 'unlimited' ? '∞' : chatLimit} today
                    </span>
                  </div>

                  {chatLimit !== 'unlimited' && (
                    <>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
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

                      <p className="text-sm text-white/60 mt-2">
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
          <div className="rounded-[28px] bg-tera-panel border border-white/10 p-8 shadow-glow-md">
            <h3 className="text-xl font-semibold text-white mb-6">Your {planConfig.displayName} Plan Features</h3>

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
