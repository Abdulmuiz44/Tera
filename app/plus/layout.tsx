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
        router.push('/auth/signin')
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('subscription_plan')
        .eq('id', user.id)
        .single()

      if (error || data?.subscription_plan !== 'plus') {
        router.push('/pricing')
      } else {
        setIsAuthorized(true)
      }
    }

    if (userReady) {
      void checkSubscription()
    }
  }, [router, user, userReady])

  if (!userReady || !isAuthorized) {
    return (
      <div className="tera-page flex items-center justify-center text-sm text-tera-secondary">
        Verifying Plus access...
      </div>
    )
  }

  return (
    <div className="tera-page">
      <div className="tera-page-shell pt-24 md:pt-10">
        <div className="tera-surface overflow-hidden px-6 py-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="tera-eyebrow">Plus</p>
              <h1 className="mt-2 text-2xl font-semibold text-tera-primary">Advanced workspace</h1>
            </div>
            <a href="/plus/analytics" className="tera-button-secondary">Analytics</a>
          </div>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
