// "use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserMenu from './UserMenu'
import type { User } from '@supabase/supabase-js'

export const navigation = [
  { label: 'Chat', icon: '💬', href: '/new' },
  { label: 'Tools', icon: '🧰', href: '/tools/lesson-plan-generator' },
  { label: 'History', icon: '⏱️', href: '/history' },
  { label: 'Notes', icon: '📝', href: '/notes' },
  { label: 'Settings', icon: '⚙️', href: '/settings' },
  { label: 'Profile', icon: '👤', href: '/profile' },
  { label: 'Pricing', icon: '💳', href: '/pricing' },
  { label: 'About', icon: 'ℹ️', href: '/about' },
]

interface SidebarProps {
  expanded: boolean
  onToggle: () => void
  onNewChat?: () => void
  user?: User | null
  onSignOut?: () => void
}

export default function Sidebar({ expanded, onToggle, onNewChat, user, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const isToolsRoute = pathname?.startsWith('/tools')

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col shrink-0 h-screen bg-tera-bg border-r border-white/5 shadow-glow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden md:relative
        ${expanded ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full md:w-[72px] md:translate-x-0'}
      `}
    >
      {/* Header Section */}
      <div className={`flex items-center ${expanded ? 'justify-between px-6' : 'justify-center'} h-20 mb-2 transition-all duration-300`}>
        {/* Logo - Only visible when expanded */}
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-tera-neon/40 to-white/10 animate-pulse-glow transition-all duration-300 ${expanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0 w-0 overflow-hidden'}`}
        >
          <span className="text-lg font-semibold tracking-[0.2em] text-white">T</span>
        </div>

        {/* Menu toggle button */}
        <button
          onClick={onToggle}
          className={`rounded-full border border-white/10 bg-tera-panel p-2 text-sm text-white hover:bg-tera-muted transition-all duration-300 ${expanded ? '' : 'hover:scale-110'}`}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? '<<' : '☰'}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-3 w-full px-3 flex-1 overflow-y-auto">
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
              className={`group relative flex items-center ${expanded ? 'w-full' : 'justify-center'} transition-all`}
            >
              <span
                className={`flex shrink-0 h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-tera-panel transition-all duration-200 group-hover:border-white/30 group-hover:bg-tera-muted ${isActive ? 'border-white/50 bg-tera-muted' : ''}`}
              >
                <span className="text-base">{item.icon}</span>
              </span>

              {/* Label */}
              <span
                className={`ml-3 text-sm text-white whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 overflow-hidden'}`}
              >
                {item.label}
              </span>

              {/* Tooltip for collapsed state */}
              {!expanded && (
                <span className="absolute left-full ml-4 whitespace-nowrap rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 pointer-events-none z-50">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* User Menu at Bottom */}
      <div className="w-full px-3 py-4 border-t border-white/5">
        <UserMenu user={user || null} expanded={expanded} onSignOut={onSignOut || (() => { })} />
      </div>
    </aside>
  )
}
