'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import PromptShell from '@/components/PromptShell'
import type { TeacherTool } from '@/components/ToolCard'
import { UniversalTool } from '@/lib/tools-data'

export default function ChatPage() {
  const { user, userReady } = useAuth()
  const [selectedTool, setSelectedTool] = useState<TeacherTool>(UniversalTool)
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('sessionId')

  const handleRequireSignIn = () => {
    router.push('/auth/signin')
  }

  return (
    <div className="w-full h-screen bg-white dark:bg-black">
      <PromptShell
        tool={selectedTool}
        onToolChange={setSelectedTool}
        sessionId={sessionId}
        user={user}
        userReady={userReady}
        onRequireSignIn={handleRequireSignIn}
      />
    </div>
  )
}
