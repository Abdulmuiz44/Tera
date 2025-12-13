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
        <div className="flex min-h-screen w-full bg-tera-bg text-tera-primary">
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

            <main className={`relative flex flex-1 flex-col min-h-screen transition-all duration-300 ease-in-out ml-0 ${sidebarExpanded ? 'md:ml-[280px] pb-32' : 'md:ml-[72px]'}`}>
                {/* Mobile Menu Button */}
                <button
                    className="fixed left-4 top-4 z-40 rounded-full border border-tera-border bg-tera-panel p-2 text-tera-primary md:hidden"
                    onClick={() => setSidebarExpanded(true)}
                >
                    ☰
                </button>

                {children}
            </main>
        </div>
    )
}
