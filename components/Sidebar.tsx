'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { label: 'Chat', icon: '💬', href: '/' },
  { label: 'Tools', icon: '🧰', href: '/tools/lesson-plan-generator' },
  { label: 'History', icon: '⏱️', href: '/history' },
  { label: 'Notes', icon: '📝', href: '/history' },
  { label: 'Settings', icon: '⚙️', href: '/history' }
]

export default function Sidebar() {
  const pathname = usePathname()
  const isToolsRoute = pathname?.startsWith('/tools')

  return (
    <aside className="hidden md:flex flex-col items-center w-[88px] h-screen px-2 py-6 bg-tera-bg border-r border-white/5 shadow-glow-sm">
      <div className="flex items-center justify-center w-12 h-12 mb-8 rounded-full bg-gradient-to-br from-tera-neon/40 to-white/10 animate-pulse-glow">
        <span className="text-xl font-semibold tracking-[0.2em] text-white">T</span>
      </div>
      <div className="flex flex-col gap-3">
        {navigation.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : item.href === '/tools/lesson-plan-generator' ? isToolsRoute : pathname === item.href
          return (
            <Link key={item.label} href={item.href} className="group relative flex items-center justify-center">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-tera-panel transition-all duration-200 group-hover:border-white/30 group-hover:bg-tera-muted ${isActive ? 'border-white/50 bg-tera-muted' : ''}`}
              >
                <span className="text-lg">{item.icon}</span>
              </span>
              <span className="absolute -right-24 whitespace-nowrap rounded-full border border-white/10 bg-tera-panel/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60 opacity-0 transition-all duration-200 group-hover:opacity-100">
                {item.label}
              </span>
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
