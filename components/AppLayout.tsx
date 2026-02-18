'use client'

import { useState, ReactNode } from 'react'
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
        <div className="flex h-[100dvh] w-full overflow-hidden bg-tera-bg text-tera-primary">
            {/* Overlay for mobile when sidebar is open */}
            {sidebarExpanded && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarExpanded(false)}
                />
            )}

            <Sidebar
                expanded={sidebarExpanded}
                onToggle={() => setSidebarExpanded(!sidebarExpanded)}
                onNewChat={handleNewChat}
                user={user}
                onSignOut={signOut}
            />

            <main className={`relative flex flex-1 flex-col h-full overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ml-0 ${sidebarExpanded ? 'md:ml-[280px]' : 'md:ml-[72px]'}`}>
                {/* Mobile Menu Button - Left */}
                <button
                    className="fixed left-4 top-4 z-40 rounded-full border border-tera-border bg-tera-panel p-2 text-tera-primary md:hidden"
                    onClick={() => setSidebarExpanded(true)}
                >
                    ☰
                </button>

                {/* New Chat Button - Right */}
                <button
                    className="fixed right-4 top-4 z-40 flex items-center justify-center rounded-full border border-tera-border bg-tera-panel p-2.5 text-tera-primary transition-all hover:bg-tera-muted hover:scale-105 active:scale-95 shadow-glow-sm"
                    onClick={handleNewChat}
                    title="Start New Chat"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>

                {children}
            </main>
        </div>
    )
}
