"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import UserMenu from './UserMenu'
import type { User } from '@supabase/supabase-js'

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

// Icon components - clean SVG icons
const IconChat = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const IconTools = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 6V2M12 6a10 10 0 1 0 0 20M12 6v2m0 14v-2" />
    <path d="M16.24 7.76a6 6 0 0 0-8.48 0M7.76 16.24a6 6 0 0 0 8.48 0" />
  </svg>
)

const IconHistory = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const IconNotes = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const IconSettings = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6m-17.78 7.78l4.24-4.24m2.12-2.12l4.24-4.24" />
  </svg>
)

const IconProfile = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconPricing = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 5V3M8 5V3" />
    <circle cx="9" cy="13" r="1" />
    <circle cx="15" cy="13" r="1" />
  </svg>
)

const IconAbout = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
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
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col shrink-0 h-screen bg-tera-bg border-r border-tera-border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${expanded ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-20 md:translate-x-0'}
      `}
    >
      {/* Header Section - Always visible */}
      <div className="flex items-center justify-between h-16 px-3 md:px-2 border-b border-tera-border flex-shrink-0">
        {/* Logo - Only visible when expanded */}
        <div
          className={`relative flex items-center justify-center transition-all duration-300 ${
            expanded ? 'opacity-100 scale-100 w-12 h-5' : 'opacity-0 scale-0 w-0 h-0 overflow-hidden'
          }`}
        >
          <Image
            src="/images/TERA_LOGO_ONLY1.png"
            alt="Tera Logo"
            fill
            className="object-contain block dark:hidden"
            priority
          />
          <Image
            src="/images/TERA_LOGO_ONLY.png"
            alt="Tera Logo"
            fill
            className="object-contain hidden dark:block"
            priority
          />
        </div>

        {/* Menu toggle button - Always visible */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-8 h-8 rounded-md text-tera-secondary hover:text-tera-primary hover:bg-tera-muted transition-all duration-200"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            {expanded ? (
              <path d="M15 19l-7-7 7-7M8 19l-7-7 7-7" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Items - Fixed height, no scrolling */}
      <nav className="flex flex-col gap-0.5 w-full px-2 py-3 flex-shrink-0">
        {navigation.map((item) => {
          const isActive =
            item.href === '/new'
              ? pathname === '/new'
              : item.href === '/tools/lesson-plan-generator'
                ? isToolsRoute
                : pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.label === 'Chat' && pathname === '/new' && onNewChat) {
                  e.preventDefault()
                  onNewChat()
                }
              }}
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 min-h-10 ${
                isActive
                  ? 'bg-tera-neon/10 text-tera-neon'
                  : 'text-tera-secondary hover:text-tera-primary hover:bg-tera-muted'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                {getIcon(item.icon)}
              </div>

              {/* Label */}
              <span
                className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  expanded ? 'opacity-100 translate-x-0 flex-1' : 'opacity-0 -translate-x-4 absolute left-full w-0 overflow-hidden'
                }`}
              >
                {item.label}
              </span>

              {/* Tooltip for collapsed state */}
              {!expanded && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-tera-panel text-tera-primary text-xs font-medium rounded-md border border-tera-border shadow-lg opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap z-50">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Spacer - Takes remaining vertical space */}
      <div className="flex-1" />

      {/* Divider */}
      <div className="h-px bg-tera-border flex-shrink-0" />

      {/* User Menu - Stuck to bottom */}
      <div className={`w-full px-2 py-3 border-t border-tera-border flex-shrink-0 ${expanded ? '' : 'flex justify-center'}`}>
        <UserMenu user={user || null} expanded={expanded} onSignOut={onSignOut || (() => { })} />
      </div>
    </aside>
  )
}
