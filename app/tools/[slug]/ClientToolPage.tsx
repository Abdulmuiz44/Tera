'use client'

import PromptShell from '@/components/PromptShell'
import { TeacherTool } from '@/components/ToolCard'
import { useAuth } from '@/components/AuthProvider'

export default function ClientToolPage({ tool }: { tool: TeacherTool }) {
    const { user, userReady } = useAuth()

    return (
        <div className="flex flex-col h-screen w-full bg-tera-bg text-tera-primary">
            {/* Sidebar handled by AppLayout */}

            <main className="relative flex-1 flex flex-col transition-all duration-300">
                {/* Mobile Menu Button - Handled by AppLayout */}

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
