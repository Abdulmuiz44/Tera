'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleCallback = async () => {
      try {
        const errorParam = searchParams.get('error')
        
        if (errorParam) {
          console.error('Auth error:', errorParam)
          setError('Authentication failed. Redirecting to sign in...')
          setTimeout(() => router.push('/auth/signin'), 2000)
          return
        }

        // Check if there's a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          setError('Error checking session. Redirecting...')
          setTimeout(() => router.push('/auth/signin'), 2000)
          return
        }

        if (!session?.user) {
          console.error('No session or user found')
          setError('No session found. Redirecting...')
          setTimeout(() => router.push('/auth/signin'), 2000)
          return
        }

        // Session exists, redirect to dashboard
        router.push('/new')
      } catch (err) {
        console.error('Callback error:', err)
        setError('An error occurred. Redirecting...')
        setTimeout(() => router.push('/auth/signin'), 2000)
      }
    }

    handleCallback()
  }, [router, searchParams, mounted])

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
