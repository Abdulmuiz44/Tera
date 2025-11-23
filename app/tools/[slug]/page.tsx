'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PromptShell from '@/components/PromptShell'
import { teacherTools } from '@/lib/teacher-tools'
import { type TeacherTool } from '@/components/ToolCard'

interface PageProps {
  params: { slug: string }
}

export default function ToolPage({ params }: PageProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const tool = teacherTools.find((t: TeacherTool) => t.name.toLowerCase().replace(/\s+/g, '-') === params.slug)

  if (!tool) {
    notFound()
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="relative flex-1 overflow-hidden px-6 py-10 transition-all duration-300">
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="w-full max-w-3xl">
            <PromptShell tool={tool} />
          </div>
        </div>
      </main>
    </div>
  )
}
