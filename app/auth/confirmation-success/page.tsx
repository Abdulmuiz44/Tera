'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ConfirmationSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setEmail(session.user.email)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error getting session:', err)
        setLoading(false)
      }
    }

    getSession()
  }, [])

  const handleGoToLogin = () => {
    router.push('/auth/signin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tera-bg">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-tera-neon/20 border-t-tera-neon rounded-full animate-spin mb-4"></div>
          <p className="text-tera-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-tera-bg px-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-tera-neon/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-tera-neon/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-tera-panel/60 border border-tera-border rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-3xl font-bold text-tera-primary mb-2">Email Verified</h1>
            <p className="text-tera-secondary text-sm">
              Your email has been successfully confirmed
            </p>
          </div>

          {/* Success Message */}
          <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">
              ✓ Account activation complete
            </p>
          </div>

          {/* Info */}
          <div className="mb-8 space-y-3 text-sm text-tera-secondary">
            <p className="text-center">
              Your account is now active and ready to use. You can sign in with your email address.
            </p>
            {email && (
              <p className="text-center font-medium text-tera-primary">
                Email: {email}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            onClick={handleGoToLogin}
            className="w-full py-2.5 px-4 bg-tera-primary text-tera-bg font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            Go to Login
          </button>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-tera-secondary text-sm">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-tera-neon hover:text-tera-neon/80 font-semibold transition">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/auth/signin" className="text-tera-secondary hover:text-tera-primary text-sm transition">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
