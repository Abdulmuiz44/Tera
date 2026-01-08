'use client'

import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PlusLayout({ children }: { children: React.ReactNode }) {
  const { user, userReady } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('subscription_plan')
        .eq('id', user.id)
        .single()

      if (error || data?.subscription_plan !== 'plus') {
        router.push('/upgrade?reason=plus-only')
      } else {
        setIsAuthorized(true)
      }
    }

    if (userReady && user) {
      void checkSubscription()
    }
  }, [user, userReady, router])

  if (!userReady || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tera-bg">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-tera-neon/20 border-t-tera-neon rounded-full animate-spin mb-4"></div>
          <p className="text-tera-secondary">Verifying access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tera-bg">
      {/* Plus Features Header */}
      <div className="border-b border-tera-border bg-tera-panel/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-tera-primary">Plus Plan Features</h1>
            <p className="text-tera-secondary text-sm">Unlock advanced capabilities</p>
          </div>
          <div className="flex gap-4">
            <a href="/plus/analytics" className="text-tera-primary hover:text-tera-neon transition">Analytics</a>
            <a href="/plus/team" className="text-tera-primary hover:text-tera-neon transition">Team</a>
            <a href="/plus/api-keys" className="text-tera-primary hover:text-tera-neon transition">API Keys</a>
            <a href="/plus/training" className="text-tera-primary hover:text-tera-neon transition">Training</a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
