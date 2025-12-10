'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function SignInPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            })

            if (signInError) {
                setError(signInError.message)
                return
            }

            if (data.user) {
                router.push('/new')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError('')
        setLoading(true)

        try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL
            const { data, error: googleError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${appUrl}/auth/callback`
                }
            })

            if (googleError) {
                setError(googleError.message)
                return
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Google sign in failed')
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
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-white/60 text-sm">Sign in to continue learning with Tera</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Email Form */}
                    <form onSubmit={handleSignIn} className="space-y-4 mb-6">
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

                        <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-tera-neon focus:ring-1 focus:ring-tera-neon/50 transition disabled:opacity-50 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition"
                                    disabled={loading}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                        <span className="text-white/40 text-xs uppercase tracking-wider">Or continue with</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-white/10 to-transparent"></div>
                    </div>

                    {/* Google Button */}
                    <button
                        onClick={handleGoogleSignIn}
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

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-white/60 text-sm">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" className="text-tera-neon hover:text-tera-neon/80 font-semibold transition">
                                Sign up
                            </Link>
                        </p>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="mt-4 text-center">
                        <Link href="/auth/forgot-password" className="text-tera-neon/60 hover:text-tera-neon text-xs font-medium transition">
                            Forgot password?
                        </Link>
                    </div>
                </div>

                {/* Terms */}
                <p className="text-center text-white/40 text-xs mt-6">
                    By signing in, you agree to our{' '}
                    <Link href="/terms" className="text-tera-neon hover:underline">
                        Terms
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-tera-neon hover:underline">
                        Privacy
                    </Link>
                </p>
            </div>
        </div>
    )
}
