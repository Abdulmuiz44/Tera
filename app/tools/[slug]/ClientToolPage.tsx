'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import PromptShell from '@/components/PromptShell'
import { TeacherTool } from '@/components/ToolCard'
import { useAuth } from '@/components/AuthProvider'

export default function ClientToolPage({ tool }: { tool: TeacherTool }) {
    const [sidebarExpanded, setSidebarExpanded] = useState(false)
    const { user, signOut, userReady } = useAuth()

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505] text-white">
            <Sidebar
                expanded={sidebarExpanded}
                onToggle={() => setSidebarExpanded(!sidebarExpanded)}
                user={user}
                onSignOut={signOut}
            />

            <main className="relative flex-1 flex flex-col transition-all duration-300">
                {/* Mobile Menu Button */}
                <button
                    className="absolute left-4 top-4 z-40 rounded-full border border-white/10 bg-tera-panel p-2 text-white md:hidden"
                    onClick={() => setSidebarExpanded(true)}
                >
                    ☰
                </button>

                <div className="flex-1 w-full max-w-4xl mx-auto pt-16 md:pt-4 px-4 h-full flex flex-col items-center justify-center">
                    <PromptShell
                        tool={tool}
                        user={user}
                        userReady={userReady}
                    />
                </div>
            </main>
        </div>
    )
}
