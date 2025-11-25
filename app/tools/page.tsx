'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { teacherTools } from '@/lib/teacher-tools'
import { useAuth } from '@/components/AuthProvider'

export default function ToolsPage() {
    const [sidebarExpanded, setSidebarExpanded] = useState(false)
    const { user, signOut } = useAuth()

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505] text-white">
            <Sidebar
                expanded={sidebarExpanded}
                onToggle={() => setSidebarExpanded(!sidebarExpanded)}
                user={user}
                onSignOut={signOut}
            />

            <main className="relative flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-10 transition-all duration-300">
                {/* Mobile Menu Button */}
                <button
                    className="absolute left-4 top-4 z-40 rounded-full border border-white/10 bg-tera-panel p-2 text-white md:hidden"
                    onClick={() => setSidebarExpanded(true)}
                >
                    ☰
                </button>

                <div className="max-w-6xl mx-auto space-y-8 pt-10 md:pt-0">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Teacher Tools
                        </h1>
                        <p className="text-white/60 max-w-2xl">
                            Select a tool to get started. Each tool is designed to help you save time and improve your teaching workflow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teacherTools.map((tool) => (
                            <Link
                                key={tool.name}
                                href={`/new?tool=${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 transition-all hover:border-tera-neon/50 hover:bg-[#222] hover:shadow-lg hover:shadow-tera-neon/5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-4xl">{tool.icon}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-tera-neon">
                                        →
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-white group-hover:text-tera-neon transition-colors">
                                        {tool.name}
                                    </h3>
                                    <p className="text-sm text-white/60 leading-relaxed">
                                        {tool.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto pt-4">
                                    {tool.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 text-white/40 border border-white/5"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
