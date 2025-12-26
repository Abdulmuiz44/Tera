'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import PromptShell from '@/components/PromptShell'
import type { TeacherTool } from '@/components/ToolCard'
import { UniversalTool } from '@/lib/tools-data'

export default function ChatSessionPage() {
    const params = useParams()
    const router = useRouter()
    const { user, userReady } = useAuth()
    const [selectedTool, setSelectedTool] = useState<TeacherTool>(UniversalTool)
    const sessionId = params.id as string

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
