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
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-transparent text-tera-primary">
      {sidebarExpanded && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
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

      <main
        className={`relative flex min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${sidebarExpanded ? 'md:ml-[320px]' : 'md:ml-[92px]'}`}
      >
        <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-4 md:hidden">
          <button
            type="button"
            className="tera-icon-button pointer-events-auto"
            onClick={() => setSidebarExpanded(true)}
            aria-label="Open navigation"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h10" />
            </svg>
          </button>
          <button
            type="button"
            className="tera-icon-button pointer-events-auto"
            onClick={handleNewChat}
            title="Start new chat"
            aria-label="Start new chat"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

        {children}
      </main>
    </div>
  )
}
