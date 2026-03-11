'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

type User = {
  id: string
  email?: string | null
  user_metadata?: {
    full_name?: string
    plan?: string
    subscription_plan?: string
    [key: string]: any
  } | null
  name?: string | null
  image?: string | null
}

interface UserMenuProps {
  user: User | null
  expanded: boolean
  onSignOut: () => void
}

const menuItems = [
  {
    label: 'Pricing',
    href: '/pricing',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
        <path d="M3.5 10h17" />
        <path d="M8 15h2.5" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.75 14 5l2.4-.35 1.15 2.15 2.1 1.2-.35 2.4L20.25 12l-.95 1.6.35 2.4-2.1 1.2-1.15 2.15L14 19l-2 1.25L10 19l-2.4.35-1.15-2.15-2.1-1.2.35-2.4L3.75 12l.95-1.6-.35-2.4 2.1-1.2L7.6 4.65 10 5l2-1.25Z" />
        <circle cx="12" cy="12" r="3.1" />
      </svg>
    ),
  },
  {
    label: 'About',
    href: '/about',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v5" />
        <path d="M12 7.5h.01" />
      </svg>
    ),
  },
]

export default function UserMenu({ user, expanded, onSignOut }: UserMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  if (!user) {
    return expanded ? (
      <div className="grid grid-cols-2 gap-2">
        <Link href="/auth/signin" className="tera-button-secondary justify-center rounded-2xl px-3 py-3 text-sm">
          Log in
        </Link>
        <Link href="/auth/signup" className="tera-button-primary justify-center rounded-2xl px-3 py-3 text-sm">
          Sign up
        </Link>
      </div>
    ) : (
      <div className="flex justify-center">
        <Link href="/auth/signin" className="tera-icon-button h-12 w-12 rounded-2xl" title="Log in">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3" />
            <path d="M10 17 15 12 10 7" />
            <path d="M15 12H4" />
          </svg>
        </Link>
      </div>
    )
  }

  const email = user.email || ''
  const name = user.user_metadata?.full_name || (email ? email.split('@')[0] : '') || user.name || 'User'
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const plan = user.user_metadata?.plan || user.user_metadata?.subscription_plan || 'Free'

  return (
    <div className="relative" ref={dropdownRef}>
      {dropdownOpen && (
        <div className={`absolute bottom-full mb-3 w-[290px] overflow-hidden rounded-[26px] border border-tera-border bg-tera-elevated/95 shadow-panel backdrop-blur-2xl ${expanded ? 'left-0' : 'left-1/2 -translate-x-1/2'}`}>
          <div className="border-b border-tera-border px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-tera-neon/20 to-white/[0.04] text-sm font-semibold text-tera-primary">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-tera-primary">{name}</p>
                <p className="truncate text-xs text-tera-secondary">{email}</p>
              </div>
            </div>
          </div>

          <div className="border-b border-tera-border px-4 py-3">
            <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3">
              <div>
                <p className="text-[0.62rem] uppercase tracking-[0.3em] text-tera-secondary">Plan</p>
                <p className="mt-1 text-sm font-medium text-tera-primary">{plan}</p>
              </div>
              <Link href="/pricing" className="tera-button-primary rounded-2xl px-3 py-2 text-xs">
                Upgrade
              </Link>
            </div>
          </div>

          <div className="px-2 py-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-[18px] px-3 py-3 text-sm text-tera-primary transition hover:bg-white/[0.05]"
                onClick={() => setDropdownOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <span className="text-tera-secondary">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <svg className="h-4 w-4 text-tera-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </Link>
            ))}
          </div>

          <div className="border-t border-tera-border px-2 py-2">
            <button
              type="button"
              onClick={() => {
                onSignOut()
                setDropdownOpen(false)
              }}
              className="flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left text-sm text-red-300 transition hover:bg-red-500/10"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 7h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3" />
                <path d="M10 17 15 12 10 7" />
                <path d="M15 12H4" />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setDropdownOpen((current) => !current)}
        className={`flex w-full items-center gap-3 rounded-[22px] border border-tera-border bg-white/[0.04] px-3 py-3 text-left transition hover:border-white/16 hover:bg-white/[0.06] ${expanded ? '' : 'justify-center'}`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-tera-neon/20 to-white/[0.04] text-sm font-semibold text-tera-primary">
          {initials}
        </div>

        {expanded && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-tera-primary">{name}</p>
              <p className="truncate text-xs text-tera-secondary">{plan} plan</p>
            </div>
            <svg className={`h-4 w-4 shrink-0 text-tera-secondary transition ${dropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
