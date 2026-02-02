'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import Image from 'next/image'

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    let errorMessage = 'An unidentified error occurred during authentication.'
    if (error === 'Configuration') errorMessage = 'There is a problem with the server configuration.'
    if (error === 'AccessDenied') errorMessage = 'Access was denied. You may not be allowed to sign in.'
    if (error === 'Verification') errorMessage = 'The verification token has expired or has been used.'
    if (error === 'OAuthSignin') errorMessage = 'Error in constructing an authorization URL.'
    if (error === 'OAuthCallback') errorMessage = 'Error in handling the response from an OAuth provider.'
    if (error === 'OAuthCreateAccount') errorMessage = 'Could not create OAuth provider user in the database.'
    if (error === 'EmailCreateAccount') errorMessage = 'Could not create email provider user in the database.'
    if (error === 'Callback') errorMessage = 'Error in the OAuth callback handler route.'
    if (error === 'OAuthAccountNotLinked') errorMessage = 'To confirm your identity, sign in with the same account you used originally.'
    if (error === 'SessionRequired') errorMessage = 'Please sign in to access this page.'

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
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

            <h1 className="text-3xl font-bold text-tera-primary mb-4">Authentication Error</h1>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md w-full mb-8">
                <p className="text-red-500 font-medium mb-1">Error Code: {error}</p>
                <p className="text-tera-secondary">{errorMessage}</p>
            </div>

            <div className="flex gap-4">
                <Link
                    href="/auth/signin"
                    className="px-6 py-2 bg-tera-neon text-black font-semibold rounded-full hover:opacity-90 transition"
                >
                    Try Again
                </Link>
                <Link
                    href="/"
                    className="px-6 py-2 border border-tera-border text-tera-primary rounded-full hover:bg-tera-muted transition"
                >
                    Go Home
                </Link>
            </div>
        </div>
    )
}

export default function ErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-tera-bg">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-tera-neon/5 rounded-full blur-3xl opacity-20"></div>
            </div>
            <Suspense fallback={<div className="text-tera-secondary">Loading error details...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    )
}
