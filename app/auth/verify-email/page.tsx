'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const [loading, setLoading] = useState(false)
    const [resent, setResent] = useState(false)
    const [error, setError] = useState('')

    const handleResendEmail = async () => {
        if (!email) {
            setError('Email not found')
            return
        }

        setError('')
        setLoading(true)

        try {
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup',
                email: email
            })

            if (resendError) {
                setError(resendError.message)
                return
            }

            setResent(true)
            setTimeout(() => setResent(false), 3000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resend email')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050505] to-[#1a1a1a] px-4">
            {/* Background glow effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-tera-neon/10 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-tera-neon/10 rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-tera-panel/60 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-tera-neon/10 border border-tera-neon/30 rounded-full mb-4">
                            <span className="text-2xl">📧</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
                        <p className="text-white/60 text-sm">
                            We've sent a confirmation link to <span className="font-semibold text-white">{email}</span>
                        </p>
                    </div>

                    {/* Success Message */}
                    {resent && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">✓ Verification email sent successfully</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="mb-8 space-y-3 text-sm text-white/70">
                        <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-tera-neon/20 text-tera-neon text-xs font-semibold">1</span>
                            <span>Check your email inbox for the verification link</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-tera-neon/20 text-tera-neon text-xs font-semibold">2</span>
                            <span>Click the link to verify your email address</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-tera-neon/20 text-tera-neon text-xs font-semibold">3</span>
                            <span>You'll be automatically signed in and redirected</span>
                        </div>
                    </div>

                    {/* Check spam notice */}
                    <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <p className="text-white/60 text-xs">
                            💡 <span className="font-semibold">Didn't receive the email?</span> Check your spam or junk folder.
                        </p>
                    </div>

                    {/* Resend Button */}
                    <button
                        onClick={handleResendEmail}
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Resend Verification Email'}
                    </button>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-white/60 text-sm mb-2">Wrong email?</p>
                        <Link href="/auth/signup" className="text-tera-neon hover:text-tera-neon/80 font-semibold transition">
                            Create new account
                        </Link>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center mt-6">
                    <Link href="/auth/signin" className="text-white/40 hover:text-white/60 text-sm transition">
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}
