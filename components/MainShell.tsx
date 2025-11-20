"use client"

import { useState } from 'react'
import Sidebar from './Sidebar'
import PromptShell from './PromptShell'
import QuickActionBar from './QuickActionBar'
import ToolCard, { type TeacherTool } from './ToolCard'
import ToolDetailPanel from './ToolDetailPanel'
import { teacherTools } from '@/lib/teacher-tools'

export default function MainShell() {
  const [selectedTool, setSelectedTool] = useState<TeacherTool>(teacherTools[0])

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col md:flex-row h-full w-full gap-6">
          <div className="flex flex-1 flex-col gap-8">
            <header className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-white/40">TERA</p>
                <h1 className="text-3xl font-semibold leading-tight text-white">Teacher Intelligence Canvas</h1>
              </div>
              <div className="flex items-center gap-4">
                <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon">
                  ✨ Upgrade
                </button>
              </div>
            </header>
            <QuickActionBar />
            <PromptShell />
            <div className="grid flex-1 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {teacherTools.map((tool) => (
                <ToolCard key={tool.name} tool={tool} selected={selectedTool.name === tool.name} onSelect={setSelectedTool} />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-x-6 bottom-6 flex items-center justify-end">
              <div className="group relative flex w-[260px] items-center gap-3 rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 px-5 py-4 shadow-glow-md">
                <div className="flex-1 text-sm text-white">
                  <p className="font-semibold text-white">TERA Pro</p>
                  <p className="text-white/40">Unlock classroom superpowers.</p>
                </div>
                <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-tera-bg transition group-hover:bg-tera-neon group-hover:text-white">
                  ✨
                </button>
              </div>
            </div>
          </div>
          <ToolDetailPanel tool={selectedTool} />
        </div>
      </main>
    </div>
  )
}
