'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const navigation = [
  { label: 'Chat', icon: '💬', href: '/chat' },
  { label: 'Tools', icon: '🧰', href: '/tools/lesson-plan-generator' },
  { label: 'History', icon: '⏱️', href: '/history' },
  { label: 'Notes', icon: '📝', href: '/notes' },
  { label: 'Settings', icon: '⚙️', href: '/settings' },
  { label: 'Profile', icon: '👤', href: '/profile' },
  { label: 'Pricing', icon: '💳', href: '/pricing' },
]

interface SidebarProps {
  expanded: boolean
  onToggle: () => void
}

export default function Sidebar({ expanded, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const isToolsRoute = pathname?.startsWith('/tools')

  return (
    <aside
      className={`hidden md:flex flex-col items-start ${expanded ? 'w-[200px]' : 'w-[72px]'} h-screen px-3 py-6 bg-tera-bg border-r border-white/5 shadow-glow-sm transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-gradient-to-br from-tera-neon/40 to-white/10 animate-pulse-glow mx-auto">
        <span className="text-xl font-semibold tracking-[0.2em] text-white">T</span>
      </div>

      {/* Menu toggle button */}
      <button
        onClick={onToggle}
        className="mb-4 mx-auto rounded-full border border-white/10 bg-tera-panel p-2 text-sm text-white hover:bg-tera-muted transition-all"
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded ? '«' : '☰'}
      </button>

      <div className={`flex flex-col gap-3 w-full ${expanded ? 'items-start' : 'items-center'}`}>
        {navigation.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : item.href === '/tools/lesson-plan-generator' ? isToolsRoute : pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group relative flex items-center ${expanded ? 'w-full px-3' : 'justify-center'} transition-all`}
            >
              <span
                className={`flex ${expanded ? 'h-8 w-8' : 'h-10 w-10'} items-center justify-center rounded-full border border-white/10 bg-tera-panel transition-all duration-200 group-hover:border-white/30 group-hover:bg-tera-muted ${isActive ? 'border-white/50 bg-tera-muted' : ''}`}
              >
                <span className="text-base">{item.icon}</span>
              </span>

              {/* Show label when expanded, otherwise tooltip */}
              {expanded ? (
                <span className="ml-3 text-sm text-white whitespace-nowrap">{item.label}</span>
              ) : (
                <span className="absolute left-full ml-2 whitespace-nowrap rounded-full border border-white/10 bg-tera-panel/90 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60 opacity-0 transition-all duration-200 group-hover:opacity-100 pointer-events-none">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <div className={`flex items-center ${expanded ? 'justify-start pl-3' : 'justify-center'} w-full mt-auto text-xs tracking-widest uppercase text-white/70 transition-all`}>
        {expanded ? 'Private' : 'P'}
      </div>
    </aside>
  )
}
