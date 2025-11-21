"use client"

import { useState } from 'react'
import Link from 'next/link'
import Sidebar, { navigation } from './Sidebar'
import PromptShell from './PromptShell'
import type { TeacherTool } from './ToolCard'
import { teacherTools } from '@/lib/teacher-tools'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'
import { usePathname } from 'next/navigation'

export default function MainShell() {
  const [selectedTool, setSelectedTool] = useState<TeacherTool>(teacherTools[0])
  const [menuOpen, setMenuOpen] = useState(false)
  const [authDialog, setAuthDialog] = useState<'signIn' | 'signUp' | null>(null)
  const [email, setEmail] = useState('')
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const pathname = usePathname()
  const isToolsRoute = pathname?.startsWith('/tools')
  const { user, loading, signOut } = useAuth()

  const handleSignIn = async () => {
    if (!email.trim()) {
      setAuthMessage('Enter your email to continue')
      return
    }
    const redirectTarget = typeof window !== 'undefined' ? `${window.location.origin}/chat` : 'http://localhost:3000/chat'
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
    const redirectTarget = typeof window !== 'undefined' ? `${window.location.origin}/chat` : 'http://localhost:3000/chat'
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
      const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
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
      <Sidebar />
      <main className="relative flex flex-1 flex-col items-center justify-start px-3 pt-10 md:px-6 md:pt-10">
        <PromptShell
          tool={selectedTool}
          onToolChange={setSelectedTool}
          user={user}
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
                className="rounded-full border border-white/30 px-3 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:border-white hover:text-white md:hidden"
                onClick={() => setAuthDialog('signIn')}
              >
                Sign in
              </button>
              <div className="hidden md:flex md:items-center md:gap-2">
                <button
                  type="button"
                  className="rounded-full border border-white/30 px-3 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:border-white hover:text-white md:px-4 md:py-2 md:text-xs"
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
        <button
          type="button"
          className="absolute left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-lg text-white hover:border-white/50 md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
            <div className="relative flex w-3/5 max-w-xs flex-col gap-6 rounded-3xl border border-white/10 bg-[#090909]/90 p-6 text-white shadow-2xl backdrop-blur md:hidden">
              <button
                type="button"
                className="self-end text-sm font-semibold uppercase tracking-[0.3em] text-white/60"
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : item.href === '/tools/lesson-plan-generator'
                      ? isToolsRoute
                      : pathname === item.href
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-xs font-normal uppercase tracking-[0.4em] transition ${
                        isActive ? 'border-tera-neon bg-tera-neon/40 text-white' : 'border-white/10 bg-transparent text-white/70'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-normal uppercase tracking-[0.2em] text-white/80">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}
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
