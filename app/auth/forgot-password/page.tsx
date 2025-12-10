'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const appUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                email.trim(),
                {
                    redirectTo: `${appUrl}/auth/reset-password`
                }
            )

            if (resetError) {
                setError(resetError.message)
                return
            }

            setSuccess(true)
            setEmail('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email')
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

            {/* Auth Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-tera-panel/60 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                        <p className="text-white/60 text-sm">Enter your email to receive a password reset link</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">
                                ✓ Check your email for a password reset link. It expires in 1 hour.
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {!success ? (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    disabled={loading}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-tera-neon focus:ring-1 focus:ring-tera-neon/50 transition disabled:opacity-50"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4 text-center">
                            <p className="text-white/70 text-sm">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="text-tera-neon hover:text-tera-neon/80 font-semibold transition"
                            >
                                Try another email
                            </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center space-y-3">
                        <p className="text-white/60 text-sm">
                            Remember your password?{' '}
                            <Link href="/auth/signin" className="text-tera-neon hover:text-tera-neon/80 font-semibold transition">
                                Sign in
                            </Link>
                        </p>
                        <p className="text-white/60 text-sm">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" className="text-tera-neon hover:text-tera-neon/80 font-semibold transition">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
