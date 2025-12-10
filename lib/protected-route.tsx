'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'

export function withProtectedRoute<P extends object>(
    Component: React.ComponentType<P>
) {
    return function ProtectedComponent(props: P) {
        const router = useRouter()
        const { user, loading } = useAuth()

        useEffect(() => {
            if (!loading && !user) {
                router.push('/auth/signin')
            }
        }, [user, loading, router])

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050505] to-[#1a1a1a]">
                    <div className="text-center">
                        <div className="inline-block w-8 h-8 border-4 border-tera-neon/20 border-t-tera-neon rounded-full animate-spin mb-4"></div>
                        <p className="text-white/60">Loading...</p>
                    </div>
                </div>
            )
        }

        if (!user) {
            return null
        }

        return <Component {...props} />
    }
}
