'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check if user has reset session from email link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError('Invalid or expired reset link. Please request a new one.')
            }
        }
        checkSession()
    }, [])

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) return 'Password must be at least 8 characters'
        if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter'
        if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
        return null
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Validate passwords match
            if (password !== confirmPassword) {
                setError('Passwords do not match')
                setLoading(false)
                return
            }

            // Validate password strength
            const passwordError = validatePassword(password)
            if (passwordError) {
                setError(passwordError)
                setLoading(false)
                return
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            })

            if (updateError) {
                setError(updateError.message)
                return
            }

            setSuccess(true)
            // Redirect to signin after 2 seconds
            setTimeout(() => {
                router.push('/auth/signin')
            }, 2000)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset password')
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
                        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-white/60 text-sm">Enter your new password below</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">
                                ✓ Password reset successfully! Redirecting to sign in...
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
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">New Password</label>
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
                                <p className="text-xs text-white/40 mt-2">Min 8 chars, 1 uppercase, 1 number</p>
                            </div>

                            <div>
                                <label className="block text-white/80 text-sm font-medium mb-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        disabled={loading}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-tera-neon focus:ring-1 focus:ring-tera-neon/50 transition disabled:opacity-50 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition"
                                        disabled={loading}
                                    >
                                        {showConfirmPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className="w-full py-2.5 px-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <p className="text-white/70 text-sm">
                                Your password has been reset. Signing you in...
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <Link href="/auth/signin" className="text-white/40 hover:text-white/60 text-sm transition">
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
