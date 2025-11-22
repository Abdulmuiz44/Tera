'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export const navigation = [
  { label: 'Chat', icon: '💬', href: '/chat' },
  { label: 'Tools', icon: '🧰', href: '/tools/lesson-plan-generator' },
  { label: 'History', icon: '⏱️', href: '/history' },
  { label: 'Notes', icon: '📝', href: '/notes' },
  { label: 'Settings', icon: '⚙️', href: '/settings' },
  { label: 'Profile', icon: '👤', href: '/profile' },
  { label: 'Pricing', icon: '💳', href: '/pricing' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isToolsRoute = pathname?.startsWith('/tools')
  const [expanded, setExpanded] = useState(false)

  const toggle = () => setExpanded(prev => !prev)

  return (
    <aside
      className={`hidden md:flex flex-col items-center ${expanded ? 'w-[200px]' : 'w-[72px]'} h-screen px-2 py-6 bg-tera-bg border-r border-white/5 shadow-glow-sm fixed left-0 top-0`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-tera-neon/40 to-white/10 animate-pulse-glow">
        <span className="text-xl font-semibold tracking-[0.2em] text-white">T</span>
      </div>
      {/* Menu toggle button placed above the first navigation item */}
      <button
        onClick={toggle}
        className="mb-4 rounded-full border border-white/10 bg-tera-panel p-2 text-sm text-white hover:bg-tera-muted"
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded ? '«' : '☰'}
      </button>
      <div className="flex flex-col gap-3">
        {navigation.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : item.href === '/tools/lesson-plan-generator' ? isToolsRoute : pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group relative flex items-center justify-center"
            >
              <span
                className={`flex ${expanded ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full border border-white/10 bg-tera-panel transition-all duration-200 group-hover:border-white/30 group-hover:bg-tera-muted ${isActive ? 'border-white/50 bg-tera-muted' : ''}`}
              >
                <span className="text-base">{item.icon}</span>
              </span>
              {/* Show label when expanded, otherwise tooltip */}
              {expanded ? (
                <span className="ml-3 text-sm text-white">{item.label}</span>
              ) : (
                <span className="absolute -right-24 whitespace-nowrap rounded-full border border-white/10 bg-tera-panel/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60 opacity-0 transition-all duration-200 group-hover:opacity-100">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
      <div className="flex items-center justify-center w-full mt-auto text-xs tracking-widest uppercase text-white/70">
        Private
      </div>
    </aside>
  )
}
