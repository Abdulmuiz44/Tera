'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if there's a valid session (handles both OAuth and email confirmation)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          setError('Authentication failed. Please try again.')
          setTimeout(() => router.push('/auth/signin'), 2000)
          return
        }

        // Session exists, redirect to dashboard
        router.push('/new')
      } catch (err) {
        console.error('Callback error:', err)
        setError('An error occurred during authentication')
        setTimeout(() => router.push('/auth/signin'), 2000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050505] to-[#1a1a1a]">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-400 mb-4">{error}</p>
            <p className="text-white/60 text-sm">Redirecting...</p>
          </>
        ) : (
          <>
            <div className="inline-block w-8 h-8 border-4 border-tera-neon/20 border-t-tera-neon rounded-full animate-spin mb-4"></div>
            <p className="text-white/60">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  )
}
