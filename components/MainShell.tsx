"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Sidebar, { navigation } from './Sidebar'
import PromptShell from './PromptShell'
import type { TeacherTool } from './ToolCard'
import { teacherTools } from '@/lib/teacher-tools'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'
import { useSearchParams, usePathname } from 'next/navigation'

function MainShellContent() {
  const [selectedTool, setSelectedTool] = useState<TeacherTool>(teacherTools[0])
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [authDialog, setAuthDialog] = useState<'signIn' | 'signUp' | null>(null)
  const [email, setEmail] = useState('')
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlSessionId = searchParams?.get('sessionId')
  const isToolsRoute = pathname?.startsWith('/tools')
  const { user, loading, signOut, userReady } = useAuth()

  const [sessionId, setSessionId] = useState<string | null>(urlSessionId || null)

  // Sync with URL
  useEffect(() => {
    if (urlSessionId) {
      setSessionId(urlSessionId)
    }
  }, [urlSessionId])

  const handleNewChat = () => {
    setSessionId(crypto.randomUUID())
    // Optional: Clear URL param
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('sessionId')
      window.history.pushState({}, '', url)
    }
  }

  const handleSignIn = async () => {
    if (!email.trim()) {
      setAuthMessage('Enter your email to continue')
      return
    }
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''
    const isLocal = origin.includes('localhost')
    const redirectTarget = isLocal ? `${origin}/new` : 'https://teraai.chat/new'
    setAuthLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTarget }
      })
      if (error) throw error
      setAuthMessage(`A confirmation link has been sent to ${email}, pls check`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send sign-in link'
      setAuthMessage(message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email.trim()) {
      setAuthMessage('Enter your email to continue')
      return
    }
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''
    const isLocal = origin.includes('localhost')
    const redirectTarget = isLocal ? `${origin}/new` : 'https://teraai.chat/new'
    setAuthLoading(true)
    const fallbackPassword = `${Date.now()}-${Math.random()}`
    const securePassword = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackPassword
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: securePassword,
        options: { emailRedirectTo: redirectTarget }
      })
      if (error) throw error
      if (data.user?.id && data.user.email) {
        const { error: syncError } = await supabase.from('users').upsert({
          id: data.user.id,
          email: data.user.email
        })
        if (syncError) {
          setAuthMessage(syncError.message)
          return
        }
      }
      setAuthMessage('Account created. Check your email for confirmation link.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account'
      setAuthMessage(message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthLoading(true)
    try {
      const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''
      const isLocal = origin.includes('localhost')
      const redirectTo = isLocal ? `${origin}/new` : 'https://teraai.chat/new'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: redirectTo ? { redirectTo } : undefined
      })
      if (error) throw error
      setAuthMessage('Redirecting to Google…')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to redirect to Google'
      setAuthMessage(message)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#050505] text-white">
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded(!sidebarExpanded)}
        onNewChat={handleNewChat}
        user={user}
        onSignOut={signOut}
      />

      <main className={`relative flex flex-1 flex-col items-center justify-start px-3 pt-10 md:px-6 md:pt-10 transition-all duration-300 ease-in-out`}>
        {/* Mobile Menu Button */}
        <button
          className="absolute left-4 top-4 z-40 rounded-full border border-white/10 bg-tera-panel p-2 text-white md:hidden"
          onClick={() => setSidebarExpanded(true)}
        >
          ☰
        </button>

        <PromptShell
          key={sessionId}
          sessionId={sessionId}
          tool={selectedTool}
          onToolChange={setSelectedTool}
          user={user}
          userReady={userReady}
          onRequireSignIn={() => setAuthDialog('signIn')}
        />
        <div className="absolute right-4 top-4 flex flex-col items-end gap-2 md:flex-row md:items-center">
          {user ? (
            <>
              <button
                type="button"
                className="rounded-full bg-white px-3 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.4em] text-[#050505] transition hover:bg-white/90 md:hidden"
                onClick={signOut}
              >
                Sign out
              </button>
              <button
                type="button"
                className="hidden rounded-full bg-white px-3 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.4em] text-[#050505] transition hover:bg-white/90 md:block md:px-4 md:py-2 md:text-xs"
                onClick={signOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#050505] transition hover:bg-white/90 md:hidden"
                onClick={() => setAuthDialog('signIn')}
              >
                Sign in
              </button>
              <div className="hidden md:flex md:items-center md:gap-2">
                <button
                  type="button"
                  className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#050505] transition hover:bg-white/90"
                  onClick={() => setAuthDialog('signIn')}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  className="rounded-full bg-white px-3 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.4em] text-[#050505] transition hover:bg-white/90 md:px-4 md:py-2 md:text-xs"
                  onClick={() => setAuthDialog('signUp')}
                >
                  Sign up
                </button>
              </div>
            </>
          )}
        </div>
        {authDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setAuthDialog(null)} />
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-[#060606]/95 p-6 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50">
                <span>{authDialog === 'signIn' ? 'Sign In' : 'Sign Up'}</span>
                <button className="text-white/50 hover:text-white" onClick={() => setAuthDialog(null)}>
                  ✕
                </button>
              </div>
              <p className="mt-4 text-sm text-white/70">
                {user
                  ? `Signed in as ${user.email}`
                  : authDialog === 'signIn'
                    ? 'Enter your email, you will receive an authentication link in your email'
                    : 'Enter your email to get started...'}
              </p>
              {!user && (
                <input
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                />
              )}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full rounded-full border border-white/20 px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white hover:text-white"
                  onClick={() => setAuthDialog(null)}
                >
                  Cancel
                </button>
                {!user && (
                  <button
                    type="button"
                    className="w-full rounded-full bg-white px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[#050505] transition hover:bg-white/90"
                    onClick={authDialog === 'signIn' ? handleSignIn : handleSignUp}
                    disabled={authLoading}
                  >
                    {authDialog === 'signIn' ? 'Send link' : 'Create account'}
                  </button>
                )}
                <button
                  type="button"
                  className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white hover:text-white"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                >
                  Continue with Google
                </button>
              </div>
              <p className="mt-4 text-center text-[0.6rem] text-white/40">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="underline hover:text-white" onClick={() => setAuthDialog(null)}>
                  Terms
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="underline hover:text-white" onClick={() => setAuthDialog(null)}>
                  Privacy Policy
                </Link>
                .
              </p>
              {authMessage && <p className="mt-3 text-[0.7rem] uppercase tracking-[0.3em] text-tera-neon">{authMessage}</p>}
              {user && (
                <p className="mt-4 text-xs text-white/60">You are already signed in. Thank you!</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function MainShell() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-[#050505] text-white">Loading...</div>}>
      <MainShellContent />
    </Suspense>
  )
}
