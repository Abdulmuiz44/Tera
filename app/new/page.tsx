'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import PromptShell from '@/components/PromptShell'
import type { TeacherTool } from '@/components/ToolCard'
import { UniversalTool } from '@/lib/tools-data'

export default function ChatPage() {
  const { user } = useAuth()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [selectedTool, setSelectedTool] = useState<TeacherTool>(UniversalTool)

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="flex-1 overflow-hidden">
        <PromptShell
          tool={selectedTool}
          onToolChange={setSelectedTool}
          sessionId={null}
          user={user}
        />
      </main>
    </div>
  )
}
