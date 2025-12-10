'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignUpPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const router = useRouter()

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // For signup, we proceed directly to Google OAuth
            // Email is optional here, user can signup with Google directly
            setSubmitted(true)
            setLoading(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign up failed')
            setLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setError('')
        setLoading(true)

        try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL
            const { error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${appUrl}/auth/callback`
                }
            })

            if (googleError) {
                setError(googleError.message)
                setLoading(false)
                return
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign up failed')
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
                        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-white/60 text-sm">Start learning with AI-powered insights today</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {!submitted ? (
                        <>
                            {/* Email Input */}
                            <form onSubmit={handleEmailSubmit} className="mb-6 space-y-4">
                                <div>
                                    <label className="block text-white/80 text-sm font-medium mb-2">Email (Optional)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        disabled={loading}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-tera-neon focus:ring-1 focus:ring-tera-neon/50 transition disabled:opacity-50"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : 'Continue'}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                                <span className="text-white/40 text-xs uppercase tracking-wider">Or sign up with</span>
                                <div className="flex-1 h-px bg-gradient-to-l from-white/10 to-transparent"></div>
                            </div>

                            {/* Google Button */}
                            <button
                                onClick={handleGoogleSignUp}
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-lg font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Confirmation Message */}
                            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <p className="text-green-400 text-sm">Ready to complete your signup with Google</p>
                            </div>

                            {/* Google Button - Full Width */}
                            <button
                                onClick={handleGoogleSignUp}
                                disabled={loading}
                                className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                {loading ? 'Creating account...' : 'Complete Signup with Google'}
                            </button>

                            {/* Back Button */}
                            <button
                                onClick={() => setSubmitted(false)}
                                className="w-full mt-4 py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg font-medium text-white transition"
                            >
                                Back
                            </button>
                        </>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-white/60 text-sm">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="text-tera-neon hover:text-tera-neon/80 font-semibold transition">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Terms */}
                <p className="text-center text-white/40 text-xs mt-6">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="text-tera-neon hover:underline">
                        Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-tera-neon hover:underline">
                        Privacy Policy
                    </Link>
                </p>
            </div>
        </div>
    )
}
