"use client"

import { useState } from 'react'
import Sidebar from './Sidebar'
import PromptShell from './PromptShell'
import type { TeacherTool } from './ToolCard'
import { teacherTools } from '@/lib/teacher-tools'

export default function MainShell() {
  const [selectedTool, setSelectedTool] = useState<TeacherTool>(teacherTools[0])

  return (
    <div className="flex min-h-screen w-full bg-[#050505] text-white">
      <Sidebar />
      <main className="relative flex flex-1 items-center justify-center px-6 py-10">
        <PromptShell tool={selectedTool} onToolChange={setSelectedTool} />
      </main>
    </div>
  )
}
