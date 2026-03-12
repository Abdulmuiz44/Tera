'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode')
    const prefill = searchParams.get('prefill')

    const deepResearchPrompt = 'Help me perform deep research on: '
    const initialPrompt = mode === 'deep-research' ? deepResearchPrompt : (prefill || undefined)
    const initialResearchIntent = mode === 'deep-research'

    const handleRequireSignIn = () => {
        router.push('/auth/signin')
    }

    return (
        <div className="w-full h-[100dvh] bg-tera-bg overflow-hidden text-tera-primary">
            <PromptShell
                tool={selectedTool}
                onToolChange={setSelectedTool}
                sessionId={sessionId}
                user={user}
                userReady={userReady}
                onRequireSignIn={handleRequireSignIn}
                initialPrompt={initialPrompt}
                initialResearchIntent={initialResearchIntent}
            />
        </div>
    )
}
