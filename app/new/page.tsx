'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import PromptShell from '@/components/PromptShell'
import type { TeacherTool } from '@/components/ToolCard'
import { UniversalTool } from '@/lib/tools-data'

export default function ChatPage() {
  const { user } = useAuth()
  const [selectedTool, setSelectedTool] = useState<TeacherTool>(UniversalTool)

  return (
    <div className="w-full h-screen bg-white dark:bg-black">
      <PromptShell
        tool={selectedTool}
        onToolChange={setSelectedTool}
        sessionId={null}
        user={user}
      />
    </div>
  )
}
