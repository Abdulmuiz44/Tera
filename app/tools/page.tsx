'use client'

import { useState } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { teacherTools, studentTools, learnerTools, slugify } from '@/lib/tools-data'
import { useAuth } from '@/components/AuthProvider'

type ToolTab = 'teachers' | 'students' | 'learners'

export default function ToolsPage() {
    const [sidebarExpanded, setSidebarExpanded] = useState(false)
    const [activeTab, setActiveTab] = useState<ToolTab>('teachers')
    const { user, signOut } = useAuth()

    const activeTools = activeTab === 'teachers'
        ? teacherTools
        : activeTab === 'students'
            ? studentTools
            : learnerTools

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-tera-bg text-tera-primary">
            <Sidebar
                expanded={sidebarExpanded}
                onToggle={() => setSidebarExpanded(!sidebarExpanded)}
                user={user}
                onSignOut={signOut}
            />

            <main className="relative flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-10 transition-all duration-300">
                {/* Mobile Menu Button */}
                <button
                    className="absolute left-4 top-4 z-40 rounded-full border border-tera-border bg-tera-panel p-2 text-tera-primary md:hidden"
                    onClick={() => setSidebarExpanded(true)}
                >
                    ☰
                </button>

                <div className="max-w-6xl mx-auto space-y-8 pt-10 md:pt-0">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-tera-primary">
                                Discover Tools
                            </h1>
                            <p className="text-tera-secondary max-w-2xl">
                                Select a tool to get started. Each tool is designed to help you save time and improve your workflow.
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('teachers')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'teachers'
                                    ? 'bg-tera-neon text-black'
                                    : 'bg-tera-muted text-tera-secondary hover:bg-tera-muted/80 hover:text-tera-primary'
                                    }`}
                            >
                                For Teachers
                            </button>
                            <button
                                onClick={() => setActiveTab('students')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'students'
                                    ? 'bg-tera-neon text-black'
                                    : 'bg-tera-muted text-tera-secondary hover:bg-tera-muted/80 hover:text-tera-primary'
                                    }`}
                            >
                                For Students
                            </button>
                            <button
                                onClick={() => setActiveTab('learners')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'learners'
                                    ? 'bg-tera-neon text-black'
                                    : 'bg-tera-muted text-tera-secondary hover:bg-tera-muted/80 hover:text-tera-primary'
                                    }`}
                            >
                                For Everyone
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeTools.map((tool) => (
                            <Link
                                key={tool.name}
                                href={`/new?tool=${slugify(tool.name)}`}
                                className="group relative flex flex-col gap-4 rounded-2xl border border-tera-border bg-tera-panel p-6 transition-all hover:border-tera-neon/50 hover:shadow-lg hover:shadow-tera-neon/5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-4xl">{tool.icon}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-tera-neon">
                                        →
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-tera-primary group-hover:text-tera-neon transition-colors">
                                        {tool.name}
                                    </h3>
                                    <p className="text-sm text-tera-secondary leading-relaxed">
                                        {tool.description}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto pt-4">
                                    {tool.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-tera-muted text-tera-secondary border border-tera-border"
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
