'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

export default function SignUpPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleGoogleSignUp = async () => {
        setError('')
        setLoading(true)

        try {
            await signIn('google', {
                callbackUrl: '/new',
                redirect: true
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign up failed')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-tera-bg px-4">
            {/* Background glow effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-tera-neon/10 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-tera-neon/10 rounded-full blur-3xl opacity-20"></div>
            </div>

            {/* Auth Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-tera-panel/60 border border-tera-border rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="relative w-16 h-16">
                            <Image
                                src="/images/TERA_LOGO_ONLY.png"
                                alt="Tera"
                                fill
                                className="object-contain hidden dark:block"
                            />
                            <Image
                                src="/images/TERA_LOGO_ONLY1.png"
                                alt="Tera"
                                fill
                                className="object-contain block dark:hidden"
                            />
                        </div>
                    </div>

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-tera-primary mb-2">Create Account</h1>
                        <p className="text-tera-secondary text-sm">Start learning with AI-powered insights today</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-tera-muted border border-red-500/50 rounded-lg">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                        className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-medium text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        {loading ? 'Signing up...' : 'Sign up with Google'}
                    </button>

                    {/* Benefits */}
                    <div className="mt-8 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-tera-secondary">
                            <span className="text-tera-neon">✓</span>
                            <span>Unlimited AI conversations — free forever</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-tera-secondary">
                            <span className="text-tera-neon">✓</span>
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-tera-secondary">
                            <span className="text-tera-neon">✓</span>
                            <span>One-click sign up</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-tera-secondary text-sm">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="text-tera-neon hover:text-tera-neon/80 font-semibold transition">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Terms */}
                <p className="text-center text-tera-secondary text-xs mt-6">
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
