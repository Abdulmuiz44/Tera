'use client'

import { useState, type ReactNode } from 'react'
import Sidebar from './Sidebar'
import { useAuth } from './AuthProvider'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const { user, signOut } = useAuth()

  const handleNewChat = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/new'
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] w-full bg-transparent text-tera-primary">
      {sidebarExpanded && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarExpanded(false)}
          aria-label="Close navigation"
        />
      )}

      <Sidebar
        expanded={sidebarExpanded}
        onToggle={() => setSidebarExpanded((current) => !current)}
        onNewChat={handleNewChat}
        user={user}
        onSignOut={signOut}
      />

      <main className={`relative flex min-w-0 flex-1 flex-col transition-all duration-300 ${sidebarExpanded ? 'md:pl-[320px]' : 'md:pl-[104px]'}`}>
        <div className="pointer-events-none sticky top-0 z-30 border-b border-tera-border/80 bg-tera-bg/78 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-4">
            <button
              type="button"
              className="tera-icon-button pointer-events-auto h-11 w-11 rounded-2xl"
              onClick={() => setSidebarExpanded(true)}
              aria-label="Open navigation"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h10" />
              </svg>
            </button>
            <div className="pointer-events-none text-center">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-tera-secondary">Tera</p>
              <p className="mt-1 text-sm font-medium text-tera-primary">Workspace</p>
            </div>
            <button
              type="button"
              className="tera-button-primary pointer-events-auto h-11 min-w-[44px] rounded-2xl px-4 py-0 text-xs"
              onClick={handleNewChat}
              title="Start new chat"
              aria-label="Start new chat"
            >
              New
            </button>
          </div>
        </div>

        <div className="min-h-[100dvh]">{children}</div>
      </main>
    </div>
  )
}
