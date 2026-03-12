'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import UserMenu from './UserMenu'

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

export const navigation = [
  { label: 'Chat', icon: 'chat', href: '/new' },
  { label: 'Tools', icon: 'tools', href: '/tools' },
  { label: 'History', icon: 'history', href: '/history' },
  { label: 'Notes', icon: 'notes', href: '/notes' },
  { label: 'Settings', icon: 'settings', href: '/settings' },
  { label: 'Profile', icon: 'profile', href: '/profile' },
  { label: 'Pricing', icon: 'pricing', href: '/pricing' },
  { label: 'About', icon: 'about', href: '/about' },
]

interface SidebarProps {
  expanded: boolean
  onToggle: () => void
  onNewChat?: () => void
  user?: User | null
  onSignOut?: () => void
}

const IconChat = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10h10" />
    <path d="M7 14h6" />
    <path d="M4 7.8C4 6.25 5.25 5 6.8 5h10.4C18.75 5 20 6.25 20 7.8v6.4c0 1.55-1.25 2.8-2.8 2.8H11l-4.5 3v-3H6.8C5.25 17 4 15.75 4 14.2V7.8Z" />
  </svg>
)

const IconTools = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" />
  </svg>
)

const IconHistory = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <path d="M12 7v5l3 2" />
  </svg>
)

const IconNotes = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 4.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V6a1.5 1.5 0 0 1 1.5-1.5Z" />
    <path d="M14 4.5V9h4" />
    <path d="M9 12h6" />
    <path d="M9 16h4.5" />
  </svg>
)

const IconSettings = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3.75 14 5l2.4-.35 1.15 2.15 2.1 1.2-.35 2.4L20.25 12l-.95 1.6.35 2.4-2.1 1.2-1.15 2.15L14 19l-2 1.25L10 19l-2.4.35-1.15-2.15-2.1-1.2.35-2.4L3.75 12l.95-1.6-.35-2.4 2.1-1.2L7.6 4.65 10 5l2-1.25Z" />
    <circle cx="12" cy="12" r="3.1" />
  </svg>
)

const IconProfile = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.25" />
    <path d="M5 18.5a7 7 0 0 1 14 0" />
  </svg>
)

const IconPricing = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
    <path d="M3.5 10h17" />
    <path d="M8 15h2.5" />
  </svg>
)

const IconAbout = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 10v5" />
    <path d="M12 7.5h.01" />
  </svg>
)

const getIcon = (iconName: string): React.ReactNode => {
  const icons: Record<string, () => React.ReactNode> = {
    chat: IconChat,
    tools: IconTools,
    history: IconHistory,
    notes: IconNotes,
    settings: IconSettings,
    profile: IconProfile,
    pricing: IconPricing,
    about: IconAbout,
  }
  const Icon = icons[iconName]
  return Icon ? <Icon /> : null
}

export default function Sidebar({ expanded, onToggle, onNewChat, user, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const isToolsRoute = pathname?.startsWith('/tools')

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 p-3 transition-all duration-300 ${expanded ? 'w-[312px] translate-x-0' : '-translate-x-full md:w-[104px] md:translate-x-0'}`}>
      <div className="flex h-full flex-col rounded-[30px] border border-tera-border bg-tera-panel/90 p-3 backdrop-blur-xl shadow-panel">
        <div className={`flex items-center gap-3 rounded-[24px] px-2 py-2 ${expanded ? 'justify-between' : 'justify-center md:flex-col md:gap-4'}`}>
          <Link href="/new" className={`group flex min-w-0 items-center gap-3 ${expanded ? '' : 'md:flex-col'}`}>
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-tera-border bg-white/[0.03]">
              <Image src="/images/TERA_LOGO_ONLY1.png" alt="Tera" fill className="block object-contain p-2 dark:hidden" priority />
              <Image src="/images/TERA_LOGO_ONLY.png" alt="Tera" fill className="hidden object-contain p-2 dark:block" priority />
            </div>
            {expanded && (
              <div className="min-w-0">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-tera-secondary">Tera</p>
                <p className="mt-1 truncate text-sm font-medium text-tera-primary">Focused workspace</p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={onToggle}
            className="tera-icon-button h-11 w-11 shrink-0 rounded-2xl"
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {expanded ? (
                <>
                  <path d="M14 6 8 12l6 6" />
                  <path d="M20 6 14 12l6 6" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={onNewChat}
            className={expanded ? 'tera-button-primary w-full justify-between rounded-[22px] px-4 py-3' : 'tera-icon-button mx-auto h-12 w-12 rounded-[18px]'}
            title="Start new chat"
            aria-label="Start new chat"
          >
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              {expanded && <span>New chat</span>}
            </span>
            {expanded && <span className="text-[0.65rem] uppercase tracking-[0.22em] opacity-70">N</span>}
          </button>
        </div>

        <div className="mt-5 flex-1 overflow-y-auto px-1 custom-scrollbar">
          {expanded && <p className="px-3 text-[0.68rem] uppercase tracking-[0.28em] text-tera-secondary">Navigation</p>}
          <nav className="mt-3 flex flex-col gap-1.5">
            {navigation.map((item) => {
              const isActive = item.href === '/new' ? pathname?.startsWith('/new') : item.href === '/tools' ? isToolsRoute : pathname === item.href

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(event) => {
                    if (item.label === 'Chat' && pathname?.startsWith('/new') && onNewChat) {
                      event.preventDefault()
                      onNewChat()
                    }
                  }}
                  className={`group relative flex min-h-12 items-center gap-3 rounded-[18px] px-3 py-3 text-sm transition ${isActive ? 'border border-tera-border bg-white/[0.07] text-tera-primary' : 'border border-transparent text-tera-secondary hover:border-tera-border hover:bg-white/[0.04] hover:text-tera-primary'}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] ${isActive ? 'bg-tera-highlight text-tera-accent' : 'bg-white/[0.03]'}`}>
                    {getIcon(item.icon)}
                  </div>
                  {expanded && <span className="flex-1 font-medium">{item.label}</span>}
                  {!expanded && (
                    <span className="pointer-events-none absolute left-full ml-3 hidden rounded-full border border-tera-border bg-tera-elevated px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-tera-primary opacity-0 shadow-soft-lg transition group-hover:opacity-100 md:block">
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {expanded && (
          <div className="mt-4 rounded-[24px] border border-tera-border bg-white/[0.03] px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-tera-secondary">System</p>
            <p className="mt-2 text-sm leading-6 text-tera-primary">Search, write, and organize in one calm interface that stays usable on mobile.</p>
          </div>
        )}

        <div className="mt-4">
          <UserMenu user={user || null} expanded={expanded} onSignOut={onSignOut || (() => {})} />
        </div>
      </div>
    </aside>
  )
}
