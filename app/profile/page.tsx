'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import { getUserProfile } from '@/lib/usage-tracking'
import { getPlanConfig, getRemainingChats, getUsagePercentage } from '@/lib/plan-config'
import type { UserProfile, PlanType } from '@/lib/plan-config'
import Link from 'next/link'

export default function ProfilePage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
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
      <div className="flex h-screen bg-white dark:bg-black">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </main>
      </div>
    )
  }

  if (!profile || !user) {
    return (
      <div className="flex h-screen bg-white dark:bg-black">
        <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
        </main>
      </div>
    )
  }

  const planConfig = getPlanConfig(profile.subscriptionPlan as PlanType)
  const remainingChats = getRemainingChats(profile.subscriptionPlan as PlanType, profile.dailyChats)
  const chatLimit = planConfig.limits.chatsPerDay
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
        </div>
      </main>
    </div>
  )
}
