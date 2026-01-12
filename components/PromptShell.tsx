"use client"

import React, { ChangeEvent, useCallback, useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { generateAnswer } from '@/app/actions/generate'
import type { User } from '@supabase/supabase-js'
import type { TeacherTool } from './ToolCard'
import type { AttachmentReference, AttachmentType } from '@/lib/attachment'
import { supabase } from '@/lib/supabase'
import { compressImage } from '@/lib/image-compression'
import UpgradePrompt from './UpgradePrompt'
import VoiceControls from './VoiceControls'
import WebSearchStatus from './WebSearchStatus'
import LimitModal from './LimitModal'
import SourcesPanel from './search/SourcesPanel'
import { shouldEnableWebSearch } from '@/lib/smart-query-detector'
import { saveSearchQuery, saveBookmark, isBookmarked, deleteBookmark } from '@/lib/search-history'

type Message = {
    id: string
    role: 'user' | 'tera'
    content: string
    attachments?: AttachmentReference[]
    timestamp?: number
}

type ConversationEntry = {
    id: string
    userMessage?: Message
    assistantMessage?: Message
    sessionId?: string | null
}

type QueuedMessage = {
    prompt: string
    attachments: AttachmentReference[]
}

const createId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))

import dynamic from 'next/dynamic'

const ChartRenderer = dynamic(() => import('./visuals/ChartRenderer'), { ssr: false })
const MermaidRenderer = dynamic(() => import('./visuals/MermaidRenderer'), { ssr: false })
const SpreadsheetRenderer = dynamic(() => import('./visuals/SpreadsheetRenderer'), { ssr: false })
const UniversalVisualRenderer = dynamic(() => import('./visuals/UniversalVisualRenderer'), { ssr: false })
const SourcesPanelRenderer = dynamic(() => import('./search/SourcesPanel'), { ssr: false })
const ResearchModeToggle = dynamic(() => import('./search/ResearchModeToggle'), { ssr: false })
const SearchHistoryRenderer = dynamic(() => import('./search/SearchHistory'), { ssr: false })

type ContentBlock =
    | { type: 'text', content: string, isHeader: boolean }
    | { type: 'chart', config: any }
    | { type: 'mermaid', chart: string }
    | { type: 'code', language: string, code: string }
    | { type: 'spreadsheet', config: any }
    | { type: 'universal-visual', code: string, language: string, title: string }
    | { type: 'web-sources', sources: Array<{ title: string; url: string; snippet: string; source: string; favicon?: string }> }




const parseContent = (content: string): ContentBlock[] => {
    const blocks: ContentBlock[] = []

    // Extract web sources section if present
    const webSourcesMatch = content.match(/--- SOURCES FROM WEB ---\n([\s\S]*?)$/i)
    let contentToProcess = content
    let webSources: Array<{ title: string; url: string; snippet: string; source: string; favicon?: string }> = []

    if (webSourcesMatch) {
        contentToProcess = content.substring(0, webSourcesMatch.index || 0)
        const sourcesText = webSourcesMatch[1]

        // Parse web search results format
        const sourceRegex = /(\d+)\.\s+(.+?)\nSource:\s+(.+?)\n(.+?)(?=\n\n\d+\.|$)/gs
        let match
        while ((match = sourceRegex.exec(sourcesText)) !== null) {
            webSources.push({
                title: match[2],
                source: match[3],
                snippet: match[4],
                url: `https://${match[3]}` // Construct URL from source
            })
        }

        // Add web sources block if we found any
        if (webSources.length > 0) {
            blocks.push({
                type: 'web-sources',
                sources: webSources.map(s => ({
                    ...s,
                    // Try to generate a favicon URL if not present
                    favicon: `https://www.google.com/s2/favicons?domain=${s.source}&sz=32`
                }))
            })
        }
    }

    // Split by code blocks
    const parts = contentToProcess.split(/(```[\s\S]*?```)/g)

    parts.forEach(part => {
        if (!part.trim()) return

        if (part.startsWith('```')) {
            const match = part.match(/```(\w+)?(?::(\w+))?\n([\s\S]*?)```/)
            if (match) {
                const [, lang, type, code] = match
                const cleanCode = code ? code.trim() : ''

                // Check if code contains chart keys (relaxed check)
                const isChart = (c: string) => (c.includes('"data"') && c.includes('"type"')) || (c.includes('"series"'))
                const isSpreadsheet = (c: string) => c.includes('"action"') && (c.includes('"data"') || c.includes('"title"'))
                const isHTML = (c: string) => c.includes('<!DOCTYPE') || c.includes('<html') || c.includes('<body')
                const isVisualization = (c: string) => c.includes('THREE.') || c.includes('requestAnimationFrame') || c.includes('canvas.getContext')

                // PRIORITY ORDER: HTML/Visuals > Mermaid > JSON Charts/Spreadsheets > Code

                // Check for HTML/Three.js/Canvas visualizations FIRST
                if (type === 'visual' || isHTML(cleanCode) || isVisualization(cleanCode) || ['html', 'svg', 'canvas', 'jsx', 'javascript'].includes(lang || '')) {
                    // Universal visual rendering for HTML, SVG, Canvas, Three.js, etc.
                    blocks.push({
                        type: 'universal-visual',
                        code: cleanCode,
                        language: lang || 'html',
                        title: `${lang?.toUpperCase() || 'Visual'} Visualization`
                    })
                } else if (lang === 'mermaid') {
                    // Only treat as Mermaid if explicitly marked as mermaid language
                    blocks.push({ type: 'mermaid', chart: cleanCode })
                } else if ((lang === 'json' && type === 'spreadsheet') || isSpreadsheet(cleanCode)) {
                    try {
                        // Remove comments from JSON (// and /* */)
                        const jsonStr = cleanCode
                            .replace(/\/\/.*$/gm, '')
                            .replace(/\/\*[\s\S]*?\*\//g, '')

                        const config = JSON.parse(jsonStr)
                        blocks.push({ type: 'spreadsheet', config })
                    } catch (e) {
                        console.warn('Failed to parse spreadsheet JSON', e)
                        blocks.push({ type: 'code', language: lang || 'json', code: cleanCode })
                    }
                } else if ((lang === 'json' && type === 'chart') || isChart(cleanCode)) {
                    try {
                        // Remove comments from JSON (// and /* */)
                        const jsonStr = cleanCode
                            .replace(/\/\/.*$/gm, '')
                            .replace(/\/\*[\s\S]*?\*\//g, '')

                        const config = JSON.parse(jsonStr)

                        // Validate chart config
                        if (!config.data || !Array.isArray(config.data) || config.data.length === 0) {
                            console.warn('Invalid chart: missing data array', config)
                            blocks.push({ type: 'code', language: 'json', code: cleanCode })
                        } else if (!config.series || !Array.isArray(config.series) || config.series.length === 0) {
                            console.warn('Invalid chart: missing series array', config)
                            blocks.push({ type: 'code', language: 'json', code: cleanCode })
                        } else {
                            blocks.push({ type: 'chart', config })
                        }
                    } catch (e) {
                        console.warn('Failed to parse chart JSON', e)
                        blocks.push({ type: 'code', language: lang || 'json', code: cleanCode })
                    }
                } else {
                    blocks.push({ type: 'code', language: lang || 'text', code: cleanCode })
                }
                return
            }
        }

        // Process regular text paragraphs
        const paragraphs = part.split(/\n\n+/).filter(p => p.trim())
        paragraphs.forEach(p => {
            const isMarkdownHeader = p.startsWith('#')
            const isAllCapsHeader = p === p.toUpperCase() && p.length < 50 && !p.includes('.')

            blocks.push({
                type: 'text',
                content: p.replace(/^#+\s*/, ''),
                isHeader: isMarkdownHeader || isAllCapsHeader
            })
        })
    })

    return blocks
}

export default function PromptShell({
    tool,
    onToolChange,
    user,
    userReady,
    onRequireSignIn,
    sessionId,
    initialPrompt
}: {
    tool: TeacherTool
    onToolChange?: (tool: TeacherTool) => void
    user?: User | null
    userReady?: boolean
    onRequireSignIn?: () => void
    sessionId?: string | null
    initialPrompt?: string
}) {
    const [prompt, setPrompt] = useState(initialPrompt || '')
    const [status, setStatus] = useState<'idle' | 'loading'>('idle')
    const [conversations, setConversations] = useState<ConversationEntry[]>([])
    const [attachmentOpen, setAttachmentOpen] = useState(false)
    const [attachmentMessage, setAttachmentMessage] = useState<string | null>(null)
    const [pendingAttachments, setPendingAttachments] = useState<AttachmentReference[]>([])
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const [conversationActive, setConversationActive] = useState(false)
    const [hasBumpedInput, setHasBumpedInput] = useState(false)
    const [historyLoading, setHistoryLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const imageInputRef = useRef<HTMLInputElement | null>(null)
    const cameraInputRef = useRef<HTMLInputElement | null>(null)
    const [isPending, startTransition] = useTransition()
    const conversationRef = useRef<HTMLDivElement | null>(null)
    const [queuedMessage, setQueuedMessage] = useState<QueuedMessage | null>(null)
    const showInitialPrompt = conversations.every((entry) => !entry.userMessage)
    const [isListening, setIsListening] = useState(false)
    const recognitionRef = useRef<any>(null)
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null)
    const [upgradePromptType, setUpgradePromptType] = useState<'chats' | 'file-uploads' | 'web-search' | 'research-mode' | null>(null)
    const [limitModalType, setLimitModalType] = useState<'chats' | 'file-uploads' | 'web-search' | 'research-mode' | null>(null)
    const [limitUnlocksAt, setLimitUnlocksAt] = useState<Date | undefined>(undefined)
    const [currentUserPlan, setCurrentUserPlan] = useState<string>('free')
    const [webSearchEnabled, setWebSearchEnabled] = useState(false)
    const [researchMode, setResearchMode] = useState(false)
    const [webSearchRemaining, setWebSearchRemaining] = useState(100)
    const [isWebSearching, setIsWebSearching] = useState(false)
    const [currentSearchQuery, setCurrentSearchQuery] = useState('')
    const [webSearchStatus, setWebSearchStatus] = useState<'idle' | 'searching' | 'processing' | 'complete'>('idle')
    const [webSearchResultCount, setWebSearchResultCount] = useState(0)
    const [searchHistoryOpen, setSearchHistoryOpen] = useState(false)
    const requestIdRef = useRef(0)


    // Update currentSessionId if prop changes (e.g. new chat from parent)
    useEffect(() => {
        setCurrentSessionId(sessionId || null)
    }, [sessionId])

    // Update prompt if initialPrompt changes
    useEffect(() => {
        if (initialPrompt) {
            setPrompt(initialPrompt)
        }
    }, [initialPrompt])

    const uploadAttachment = async (file: File, type: AttachmentType) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)
        if (user?.id) {
            formData.append('userId', user.id)
        }

        const response = await fetch('/api/user/attachments', {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            // Try to parse the error message
            let errorMessage = 'Unable to upload attachment'
            try {
                const errorData = await response.json()
                if (errorData.error) {
                    errorMessage = errorData.error
                }
            } catch (e) {
                // Fallback to default error
            }
            throw new Error(errorMessage)
        }

        return (await response.json()) as AttachmentReference
    }

    const handleFileSelect = (type: 'image' | 'file' | 'camera') => {
        if (type === 'image') {
            imageInputRef.current?.click()
        } else if (type === 'camera') {
            cameraInputRef.current?.click()
        } else {
            fileInputRef.current?.click()
        }
        setAttachmentOpen(false)
    }

    const handleAttachmentUpload = async (event: ChangeEvent<HTMLInputElement>, type: AttachmentType) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setAttachmentMessage('Compressing & Uploading...')

            let fileToUpload = file
            if (type === 'image') {
                try {
                    fileToUpload = await compressImage(file)
                } catch (err) {
                    console.warn('Image compression failed, uploading original', err)
                }
            }

            const attachment = await uploadAttachment(fileToUpload, type)
            setPendingAttachments((prev) => [...prev, attachment])
            setAttachmentMessage(null)
        } catch (error) {
            console.error('Upload failed', error)
            const message = error instanceof Error ? error.message : 'Upload failed'

            // Check for limit errors and show modal
            if (message.includes('limit') && (message.includes('upload') || message.includes('file'))) {
                setLimitModalType('file-uploads')
                // Try to extract unlocksAt from error or calculate it
                const now = new Date()
                const unlocksAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
                setLimitUnlocksAt(unlocksAt)
                setAttachmentMessage(null)
            } else {
                setAttachmentMessage(message)
            }
        } finally {
            event.target.value = ''
        }
    }

    const handleEditMessage = (id: string, message: Message) => {
        setPrompt(message.content)
        setPendingAttachments(message.attachments || [])
        setEditingMessageId(id)
        const textarea = document.querySelector('textarea')
        if (textarea) textarea.focus()
    }

    const buildUserMessage = (id: string, content: string, attachments: AttachmentReference[]): Message => ({
        id: `${id}-user`,
        role: 'user',
        content,
        attachments: attachments.length > 0 ? attachments : undefined,
        timestamp: Date.now()
    })

    // Format timestamp for display
    const formatTimestamp = (timestamp?: number) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffMins < 1440) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const handleStop = () => {
        // Increment request ID to invalidate any pending requests
        requestIdRef.current += 1
        setStatus('idle')
    }

    const processMessage = useCallback((messageToSend: string, attachmentsToSend: AttachmentReference[]) => {
        setStatus('loading')
        // Increment request ID for new request
        const currentRequestId = ++requestIdRef.current

        const entryId = editingMessageId ?? createId()
        const userMessage = buildUserMessage(entryId, messageToSend, attachmentsToSend)
        setConversations((prev) => {
            if (editingMessageId) {
                return prev.map((entry) =>
                    entry.id === editingMessageId
                        ? { ...entry, userMessage, assistantMessage: undefined }
                        : entry
                )
            }
            return [...prev, { id: entryId, userMessage }]
        })
        setConversationActive(true)
        if (!hasBumpedInput) {
            setHasBumpedInput(true)
        }
        startTransition(async () => {
            try {
                // Check if we should auto-enable web search based on query content
                // Only if not explicitly toggled by user (we rely on current toggle state if set)
                let useWebSearch = webSearchEnabled

                if (!webSearchEnabled && shouldEnableWebSearch(messageToSend)) {
                    // Auto-enable for real-time queries
                    useWebSearch = true
                    console.log('🤖 Auto-enabled web search for:', messageToSend)
                }

                // Set up web search tracking
                if (useWebSearch) {
                    setIsWebSearching(true)
                    setCurrentSearchQuery(messageToSend)
                    setWebSearchStatus('searching')
                    setWebSearchResultCount(0)

                    // Track search in history
                    if (user?.id) {
                        // Fire and forget save to history
                        saveSearchQuery(user.id, messageToSend, 0)
                            .catch(err => console.error('Failed to save search history', err))
                    }
                }

                const result = await generateAnswer({
                    prompt: messageToSend,
                    tool: tool.name,
                    authorId: user?.id ?? '',
                    authorEmail: user?.email ?? undefined,
                    attachments: attachmentsToSend,
                    sessionId: currentSessionId,
                    chatId: editingMessageId ?? undefined,
                    enableWebSearch: useWebSearch,
                    researchMode: researchMode && useWebSearch // Only send researchMode if web search is enabled/active
                })

                const { answer, sessionId: newSessionId, chatId: savedChatId, error: limitError } = result

                // Clear web search status
                if (useWebSearch) {
                    setIsWebSearching(false)
                    setWebSearchStatus('complete')
                    // Auto-reset after 2 seconds
                    setTimeout(() => {
                        setWebSearchStatus('idle')
                        setCurrentSearchQuery('')
                    }, 2000)
                }

                // Check if this request is still valid (hasn't been stopped or superseded)
                if (currentRequestId !== requestIdRef.current) {
                    console.log('🛑 Request cancelled/superseded, ignoring response')
                    return
                }

                // Handle limit errors
                if (limitError) {
                    const now = new Date()
                    const unlocksAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

                    if (limitError.includes('messages')) {
                        setLimitModalType('chats')
                        setLimitUnlocksAt(unlocksAt)
                    } else if (limitError.includes('file uploads')) {
                        setLimitModalType('file-uploads')
                        setLimitUnlocksAt(unlocksAt)
                    } else if (limitError.includes('web search')) {
                        setLimitModalType('web-search')
                        setLimitUnlocksAt(unlocksAt)
                    }

                    setConversations((prev) =>
                        prev.map((entry) =>
                            entry.id === entryId
                                ? {
                                    ...entry,
                                    assistantMessage: {
                                        id: createId(),
                                        role: 'tera',
                                        content: limitError
                                    }
                                }
                                : entry
                        )
                    )
                    setAttachmentMessage(limitError)
                    setStatus('idle')
                    return
                }

                if (newSessionId && newSessionId !== currentSessionId) {
                    setCurrentSessionId(newSessionId)
                }

                const assistantMessage: Message = {
                    id: createId(),
                    role: 'tera',
                    content: answer,
                    timestamp: Date.now()
                }
                setConversations((prev) =>
                    prev.map((entry) =>
                        entry.id === entryId ? {
                            ...entry,
                            assistantMessage,
                            sessionId: newSessionId
                        } : entry
                    )
                )

                // Update editingMessageId to the saved chat ID for future edits
                if (editingMessageId && savedChatId) {
                    setEditingMessageId(savedChatId)
                }
            } catch (error) {
                // Check if this request is still valid
                if (currentRequestId !== requestIdRef.current) {
                    return
                }

                const message = error instanceof Error ? error.message : 'Unable to generate a reply'
                console.error('generateAnswer failed', error)

                // Check for limit errors and show modal instead
                const now = new Date()
                const unlocksAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

                if (message.includes('limit') && (message.includes('chats') || message.includes('messages'))) {
                    setLimitModalType('chats')
                    setLimitUnlocksAt(unlocksAt)
                } else if (message.includes('limit') && message.includes('file uploads')) {
                    setLimitModalType('file-uploads')
                    setLimitUnlocksAt(unlocksAt)
                } else if (message.includes('limit') && message.includes('web-search')) {
                    setLimitModalType('web-search')
                    setLimitUnlocksAt(unlocksAt)
                } else if (message === 'limit web-search') {
                    setLimitModalType('web-search')
                    setLimitUnlocksAt(unlocksAt)
                }

                setConversations((prev) =>
                    prev.map((entry) =>
                        entry.id === entryId
                            ? {
                                ...entry,
                                assistantMessage: {
                                    id: createId(),
                                    role: 'tera',
                                    content: message
                                }
                            }
                            : entry
                    )
                )
                setAttachmentMessage(message)
            } finally {
                // Only reset status if this is still the active request
                if (currentRequestId === requestIdRef.current) {
                    setStatus('idle')
                }
            }
            // Removed setPrompt('') and setPendingAttachments([]) from here to clear immediately
            setEditingMessageId(null)
            setQueuedMessage(null)
        })
    }, [editingMessageId, hasBumpedInput, tool.name, user?.id, currentSessionId])

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        if (status === 'loading') return // Prevent submit while loading

        const messageToSend = prompt.trim()
        if (!messageToSend && pendingAttachments.length === 0) return

        if (!user) {
            setQueuedMessage({
                prompt: messageToSend,
                attachments: [...pendingAttachments]
            })
            // Save to localStorage for persistence across redirects (e.g. Google Sign In)
            if (typeof window !== 'undefined') {
                const messageData = {
                    prompt: messageToSend,
                    attachments: [...pendingAttachments]
                }
                console.log('🔴 SAVING to localStorage:', messageData)
                localStorage.setItem('tera_queued_message', JSON.stringify(messageData))
            }
            setAttachmentMessage('Sign in to send your message. It will be posted automatically once you authenticate.')
            onRequireSignIn?.()
            return
        }
        if (!userReady) {
            setQueuedMessage({
                prompt: messageToSend,
                attachments: [...pendingAttachments]
            })
            setAttachmentMessage('Hang tight—finalizing your account before sending.')
            return
        }

        // Clear UI immediately
        const attachmentsToSend = [...pendingAttachments]
        setPrompt('')
        setPendingAttachments([])

        processMessage(messageToSend, attachmentsToSend)
    }

    useEffect(() => {
        // Always check for persisted message on mount
        console.log('🟢 MOUNT EFFECT: Checking localStorage...')
        if (typeof window !== 'undefined' && !queuedMessage) {
            const savedMessage = localStorage.getItem('tera_queued_message')
            console.log('🟢 localStorage value:', savedMessage)
            if (savedMessage) {
                try {
                    console.log('🟢 Found queued message, parsing...')
                    const parsed = JSON.parse(savedMessage)
                    console.log('🟢 Parsed message:', parsed)
                    setQueuedMessage(parsed)
                    console.log('🟢 Set queuedMessage state')
                } catch (e) {
                    console.error('🔴 Failed to parse queued message', e)
                    localStorage.removeItem('tera_queued_message')
                }
            } else {
                console.log('🟢 No saved message found in localStorage')
            }
        } else {
            console.log('🟢 Skipping restore (window undefined or queuedMessage already set)')
        }
    }, []) // Run once on mount

    useEffect(() => {
        console.log('🔵 PROCESS EFFECT: userReady=', userReady, 'queuedMessage=', queuedMessage)
        if (userReady && queuedMessage) {
            console.log('🔵 Processing queued message:', queuedMessage)
            processMessage(queuedMessage.prompt, queuedMessage.attachments)

            // Clean up
            console.log('🔵 Cleaning up localStorage and queuedMessage state')
            localStorage.removeItem('tera_queued_message')
            setQueuedMessage(null)
        }
    }, [userReady, queuedMessage, processMessage])

    useEffect(() => {
        if (!user) {
            setConversations([])
            return
        }

        let isMounted = true
        const userId = user.id

        async function loadChatHistory() {
            // If no sessionId is provided (New Chat), don't load history
            if (!sessionId) {
                setConversations([])
                return
            }

            setHistoryLoading(true)
            try {
                const { data, error } = await supabase
                    .from('chat_sessions')
                    .select('id, prompt, response, attachments, created_at')
                    .eq('user_id', userId)
                    .eq('session_id', sessionId) // Filter by session ID
                    .order('created_at', { ascending: true })
                    .limit(50)

                if (isMounted && !error && data) {
                    const loadedConversations: ConversationEntry[] = data.map((session) => ({
                        id: session.id,
                        sessionId: session.id, // This is actually the row ID, but we use it as entry ID. The real session ID is passed in prop.
                        userMessage: {
                            id: `${session.id}-user`,
                            role: 'user' as const,
                            content: session.prompt,
                            attachments: session.attachments as AttachmentReference[] | undefined,
                            timestamp: new Date(session.created_at).getTime()
                        },
                        assistantMessage: {
                            id: `${session.id}-assistant`,
                            role: 'tera' as const,
                            content: session.response,
                            timestamp: new Date(session.created_at).getTime() + 1000 // Slight offset
                        }
                    }))
                    setConversations(loadedConversations)
                    setConversationActive(loadedConversations.length > 0)
                }
            } catch (error) {
                console.error('Failed to load chat history', error)
            } finally {
                if (isMounted) {
                    setHistoryLoading(false)
                }
            }
        }

        loadChatHistory()

        return () => {
            isMounted = false
        }
    }, [user, sessionId])

    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (conversationActive || status === 'loading') {
            // Small timeout to ensure DOM is updated
            setTimeout(scrollToBottom, 100)
        }
    }, [conversations, conversationActive, status])

    // Load web search remaining count and update periodically
    useEffect(() => {
        if (!user?.id) return

        const fetchWebSearchStatus = async () => {
            try {
                const response = await fetch('/api/user/web-search-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                })

                if (!response.ok) {
                    console.warn('Failed to fetch web search status:', response.status)
                    return
                }

                const data = await response.json()
                if (data.success && data.remaining !== undefined) {
                    setWebSearchRemaining(data.remaining)
                    if (data.plan) {
                        setCurrentUserPlan(data.plan)
                    }
                    console.log(`🔍 Web Search Status: ${data.remaining}/${data.total} (${data.plan?.toUpperCase()})`)
                }
            } catch (err) {
                console.warn('Failed to fetch web search status:', err)
            }
        }

        // Fetch immediately
        fetchWebSearchStatus()

        // Refetch every 30 seconds to keep count updated
        const interval = setInterval(fetchWebSearchStatus, 30000)
        return () => clearInterval(interval)
    }, [user?.id])

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = true
            recognitionRef.current.interimResults = true

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = ''
                let finalTranscript = ''

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript
                    } else {
                        interimTranscript += event.results[i][0].transcript
                    }
                }

                if (finalTranscript) {
                    setPrompt((prev) => prev + (prev ? ' ' : '') + finalTranscript)
                }
            }

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error)
                setIsListening(false)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        }
    }, [])

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
        } else {
            recognitionRef.current?.start()
            setIsListening(true)
        }
    }

    const showSendButton = (prompt.trim().length > 0 || pendingAttachments.length > 0) && status !== 'loading'
    const showStopButton = status === 'loading'
    const showMicButton = !showSendButton && !showStopButton

    return (
        <div className="flex h-full w-full flex-col relative bg-tera-bg text-tera-primary">
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 pb-28 md:pb-6" ref={conversationRef}>
                <div className="mx-auto max-w-3xl space-y-8">
                    {showInitialPrompt ? (
                        <div className="fixed inset-0 flex items-center justify-center text-center pointer-events-none -mt-20">
                            <div className="pointer-events-auto flex flex-col items-center">
                                <div className="mb-8 rounded-full bg-gradient-to-br from-tera-neon/20 to-transparent p-6 mx-auto w-fit">
                                    <span className="flex items-center justify-center w-32 h-32">
                                        <div className="relative w-[120px] h-[120px]">
                                            <Image
                                                src="/images/TERA_LOGO_ONLY1.png"
                                                alt="Tera"
                                                fill
                                                className="object-contain block dark:hidden opacity-80"
                                                priority={false}
                                            />
                                            <Image
                                                src="/images/TERA_LOGO_ONLY.png"
                                                alt="Tera"
                                                fill
                                                className="object-contain hidden dark:block opacity-80"
                                                priority={false}
                                            />
                                        </div>
                                    </span>
                                </div>
                                <h2 className="text-3xl font-semibold text-tera-primary">How can Tera help you today?</h2>
                            </div>
                        </div>
                    ) : (
                        conversations.map((entry) => (
                            <div key={entry.id} className="space-y-6">
                                {/* User Message */}
                                {entry.userMessage && (
                                    <div className="flex justify-end group">
                                        <div className="flex items-end gap-2 max-w-[80%]">
                                            {/* Edit Button - visible on hover */}
                                            <button
                                                onClick={() => handleEditMessage(entry.id, entry.userMessage!)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-tera-primary/50 hover:text-tera-primary transition"
                                                title="Edit message"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                    <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                                                </svg>
                                            </button>

                                            <div className="flex flex-col items-end gap-1 w-full">
                                                <div className="rounded-2xl bg-tera-muted border border-tera-border/50 px-6 py-4 text-tera-primary backdrop-blur-sm w-full">
                                                    <p className="whitespace-pre-wrap leading-relaxed">{entry.userMessage.content}</p>
                                                    {entry.userMessage.attachments && entry.userMessage.attachments.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {entry.userMessage.attachments.map((att, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-xs">
                                                                    <span>{att.type === 'image' ? '🖼️' : '📄'}</span>
                                                                    <span className="truncate max-w-[150px]">{att.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Timestamp and checkmarks */}
                                                <div className="flex items-center gap-1.5 px-2 text-xs text-tera-secondary">
                                                    <span>{formatTimestamp(entry.userMessage.timestamp)}</span>
                                                    <span className="text-tera-secondary/60">✓✓</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Assistant Message */}
                                {entry.assistantMessage && (
                                    <div className="flex justify-start w-full">
                                        <div className="w-full">
                                            <div className="rounded-xl md:rounded-2xl bg-tera-panel border border-tera-border px-3 md:px-6 py-3 md:py-4 text-tera-primary shadow-lg">
                                                <div className="space-y-4 w-full">
                                                    {parseContent(entry.assistantMessage.content).map((block, idx) => {
                                                        if (block.type === 'universal-visual') {
                                                            return <UniversalVisualRenderer key={idx} code={block.code} language={block.language} title={block.title} />
                                                        }
                                                        if (block.type === 'chart') {
                                                            return <ChartRenderer key={idx} config={block.config} />
                                                        }
                                                        if (block.type === 'spreadsheet') {
                                                            return <SpreadsheetRenderer key={idx} config={block.config} userId={user?.id} />
                                                        }
                                                        if (block.type === 'mermaid') {
                                                            return <MermaidRenderer key={idx} chart={block.chart} />
                                                        }
                                                        if (block.type === 'web-sources') {
                                                            return (
                                                                <div key={idx} className="my-4 animate-in fade-in duration-300">
                                                                    <SourcesPanelRenderer
                                                                        sources={block.sources.map(s => ({
                                                                            ...s,
                                                                            // Try to generate a favicon URL if not present
                                                                            favicon: s.favicon || `https://www.google.com/s2/favicons?domain=${s.source}&sz=32`
                                                                        }))}
                                                                        collapsible={true}
                                                                        defaultExpanded={false}
                                                                    />
                                                                </div>
                                                            )
                                                        }
                                                        if (block.type === 'code') {
                                                            return (
                                                                <div key={idx} className="my-4 rounded-lg bg-black/5 dark:bg-black/30 border border-tera-border overflow-hidden w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                                    <div className="flex items-center justify-between px-3 md:px-4 py-2 border-b border-tera-border/50 bg-black/10 gap-2">
                                                                        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider truncate">
                                                                            {block.language || 'code'}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(block.code)
                                                                            }}
                                                                            className="p-1.5 text-white/40 hover:text-tera-neon transition-colors flex-shrink-0"
                                                                            title="Copy code"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3.75H19.5A2.25 2.25 0 0121.75 6v10.5A2.25 2.25 0 0119.5 18.75h-2.25m-16.5 0h2.25m0 0v2.25m0-2.25v-8.25m0 0H3.75A2.25 2.25 0 015.25 5.25H7.5" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                    <pre className="p-3 md:p-4 font-mono text-xs md:text-sm overflow-x-auto text-tera-primary dark:text-tera-neon w-full">
                                                                        <code>{block.code}</code>
                                                                    </pre>
                                                                </div>
                                                            )
                                                        }
                                                        return block.isHeader ? (
                                                            <h3 key={idx} className="font-bold text-base md:text-lg mt-2 text-tera-primary w-full break-words animate-in fade-in slide-in-from-left duration-300">
                                                                {block.content}
                                                            </h3>
                                                        ) : (
                                                            <p key={idx} className="leading-relaxed whitespace-pre-wrap text-sm md:text-base w-full break-words animate-in fade-in duration-300">
                                                                {block.content.split(/((?:https?:\/\/|www\.)[^\s]+)/g).map((part, i) => {
                                                                    if (part.match(/^(https?:\/\/|www\.)/)) {
                                                                        const href = part.startsWith('http') ? part : `https://${part}`
                                                                        return (
                                                                            <a
                                                                                key={i}
                                                                                href={href}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-tera-neon hover:underline break-all"
                                                                            >
                                                                                {part}
                                                                            </a>
                                                                        )
                                                                    }
                                                                    return part
                                                                })}
                                                            </p>
                                                        )
                                                    })}
                                                </div>
                                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-tera-border">
                                                    <span className="text-xs text-tera-secondary/60">{formatTimestamp(entry.assistantMessage.timestamp)}</span>
                                                    <VoiceControls text={entry.assistantMessage.content} messageId={entry.id} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {/* Web Search Status */}
                    {(isWebSearching || webSearchStatus !== 'idle') && (
                        <div className="flex items-center gap-4">
                            <WebSearchStatus
                                isSearching={isWebSearching}
                                query={currentSearchQuery}
                                status={webSearchStatus}
                                resultCount={webSearchResultCount}
                            />
                        </div>
                    )}
                    {status === 'loading' && (
                        <div className="flex justify-start">
                            <div className="max-w-[85%]">
                                <div className="flex items-center gap-3 rounded-2xl bg-tera-panel border border-tera-border px-6 py-4 text-tera-primary/60 shadow-md">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-tera-neon/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-tera-neon/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-tera-neon/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                    <span className="font-medium">Tera is Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-tera-border bg-tera-bg px-2 py-3 backdrop-blur-xl md:sticky md:py-4 md:px-8">
                <div className="mx-auto max-w-3xl relative">
                    <div className={`relative flex flex-col gap-2 rounded-xl md:rounded-[24px] border border-tera-border bg-tera-panel p-2 shadow-2xl ring-1 ring-tera-border/50 transition-all ${conversationActive ? 'focus-within:ring-tera-neon/30 focus-within:border-tera-neon/30' : 'focus-within:ring-tera-primary/10'}`}>

                        {/* Active Tools & Attachments Preview */}
                        <div className="flex flex-wrap items-center gap-2 px-2 pt-2">
                            {/* Web Search Toggle Badge */}
                            {webSearchEnabled && (
                                <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/30 px-3 py-2 text-xs font-semibold shadow-sm">
                                    <span>🔍</span>
                                    <span>Web Search ON ({webSearchRemaining})</span>
                                </div>
                            )}

                            {/* Research Mode Toggle - Moved to Dropdown */}

                            {/* Attachments Preview */}
                            {pendingAttachments.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {pendingAttachments.map((att, idx) => (
                                        <div key={idx} className="group relative flex items-center gap-2 rounded-lg bg-tera-panel px-3 py-2 text-xs text-tera-primary border border-tera-border">
                                            <span>{att.type === 'image' ? '🖼️' : '📄'}</span>
                                            <span className="truncate max-w-[200px]">{att.name}</span>
                                            <button
                                                onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                className="ml-2 rounded-full bg-tera-muted p-1 hover:bg-tera-muted/80"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-end gap-2">
                            {/* Left Actions */}
                            <div className="flex items-center gap-1 pb-1.5 pl-2">
                                <div className="relative">
                                    <button
                                        onClick={() => setAttachmentOpen(!attachmentOpen)}
                                        className="rounded-full p-2 text-tera-secondary transition hover:bg-tera-muted hover:text-tera-primary"
                                        title="Add attachment"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                    </button>

                                    {attachmentOpen && (
                                        <div className="absolute bottom-full left-0 mb-2 w-56 overflow-hidden rounded-xl border border-tera-border bg-tera-panel shadow-xl backdrop-blur-xl">
                                            {/* File & Media Section */}
                                            <button
                                                onClick={() => handleFileSelect('camera')}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-tera-primary hover:bg-tera-muted border-b border-tera-border"
                                            >
                                                <span>📷</span> Open Camera
                                            </button>
                                            <button
                                                onClick={() => handleFileSelect('image')}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-tera-primary hover:bg-tera-muted border-b border-tera-border"
                                            >
                                                <span>🖼️</span> Upload image
                                            </button>
                                            <button
                                                onClick={() => handleFileSelect('file')}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-tera-primary hover:bg-tera-muted border-b border-tera-border"
                                            >
                                                <span>📄</span> Upload file
                                            </button>

                                            {/* Web Search Option */}
                                            <button
                                                onClick={() => {
                                                    if (webSearchRemaining > 0) {
                                                        setWebSearchEnabled(!webSearchEnabled)
                                                        setAttachmentOpen(false)
                                                    } else {
                                                        setUpgradePromptType('web-search')
                                                        setAttachmentOpen(false)
                                                    }
                                                }}
                                                disabled={webSearchRemaining <= 0}
                                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${webSearchRemaining <= 0
                                                    ? 'text-red-300/50 cursor-not-allowed opacity-60 hover:bg-red-500/10'
                                                    : webSearchEnabled
                                                        ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
                                                        : 'text-tera-primary hover:bg-tera-muted'
                                                    }`}
                                                title={webSearchRemaining <= 0 ? 'Monthly web search limit reached - Upgrade to continue' : 'Search the web for current information'}
                                            >
                                                <span>🔍</span>
                                                <div className="flex-1">
                                                    <div>Web Search {webSearchEnabled ? '(ON)' : ''}</div>
                                                    <div className={`text-xs ${webSearchRemaining <= 0 ? 'text-red-300/50' : 'text-tera-secondary'}`}>
                                                        {webSearchRemaining <= 0 ? 'Limit reached' : `${webSearchRemaining} remaining`}
                                                    </div>
                                                </div>
                                            </button>



                                            {/* Research Mode Toggle - Moved from main UI */}
                                            <button
                                                onClick={() => {
                                                    const isPro = currentUserPlan === 'pro' || currentUserPlan === 'plus' || currentUserPlan === 'lifetime'
                                                    if (!isPro) {
                                                        setAttachmentOpen(false)
                                                        setUpgradePromptType('research-mode') // Reuse or create a type
                                                        return
                                                    }
                                                    setResearchMode(!researchMode)
                                                    setAttachmentOpen(false)
                                                }}
                                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm border-t border-tera-border transition ${researchMode ? 'text-tera-neon bg-tera-neon/5' : 'text-tera-primary hover:bg-tera-muted'
                                                    }`}
                                            >
                                                <span>🔭</span>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span>Deep Research</span>
                                                    {researchMode && <span className="text-[10px] font-bold bg-tera-neon/20 px-1.5 py-0.5 rounded text-tera-neon">ON</span>}
                                                    {!(currentUserPlan === 'pro' || currentUserPlan === 'plus' || currentUserPlan === 'lifetime') && (
                                                        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-black px-1.5 py-0.5 rounded ml-2">PRO</span>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Textarea */}
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit(e)
                                    }
                                }}
                                placeholder={isListening ? "Listening... 🎤" : "Ask Tera Anything..."}
                                className="max-h-[120px] min-h-[44px] w-full resize-none bg-transparent text-base text-tera-primary placeholder-tera-secondary/60 focus:outline-none m-0 p-3 font-normal leading-relaxed"
                                rows={1}
                                style={{ height: 'auto' }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement
                                    target.style.height = 'auto'
                                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                                }}
                            />

                            {/* Dynamic Action Button */}
                            <div className="mb-1.5 mr-1.5">
                                {showStopButton && (
                                    <button
                                        onClick={handleStop}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black border border-white/20 dark:border-black/20 transition hover:bg-black/80 dark:hover:bg-white/90"
                                        title="Stop generating"
                                    >
                                        <div className="h-3 w-3 bg-current rounded-[2px]" />
                                    </button>
                                )}

                                {showSendButton && (
                                    <button
                                        onClick={handleSubmit}
                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-tera-accent text-tera-bg transition hover:bg-tera-accent/90"
                                        title="Send message"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                                        </svg>
                                    </button>
                                )}

                                {showMicButton && (
                                    <button
                                        onClick={toggleListening}
                                        className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-tera-muted text-tera-primary hover:bg-tera-muted/80'}`}
                                        title="Voice input"
                                    >
                                        <span className="text-xl">🎤</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Hidden Inputs */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => handleAttachmentUpload(e, 'file')}
            />
            {/* ... other inputs ... */}

            {/* Search History Modal */}
            {
                searchHistoryOpen && user?.id && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="relative w-full max-w-md">
                            <button
                                onClick={() => setSearchHistoryOpen(false)}
                                className="absolute -top-10 right-0 text-white/80 hover:text-white"
                            >
                                Close ✕
                            </button>
                            <SearchHistoryRenderer
                                userId={user.id}
                                onSelectQuery={(query) => {
                                    setPrompt(query)
                                    setSearchHistoryOpen(false)
                                    if (!webSearchEnabled) setWebSearchEnabled(true)
                                }}
                                onSelectBookmark={(url) => {
                                    window.open(url, '_blank')
                                }}
                            />
                        </div>
                    </div>
                )
            }

            <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleAttachmentUpload(e, 'image')}
            />
            <input
                type="file"
                ref={cameraInputRef}
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleAttachmentUpload(e, 'image')}
            />

            {
                upgradePromptType && (
                    <UpgradePrompt
                        type={upgradePromptType}
                        onClose={() => setUpgradePromptType(null)}
                    />
                )
            }

            <LimitModal
                isOpen={limitModalType !== null}
                limitType={limitModalType}
                currentPlan={currentUserPlan}
                unlocksAt={limitUnlocksAt}
                onClose={() => {
                    setLimitModalType(null)
                    setLimitUnlocksAt(undefined)
                }}
            />
        </div >
    )
}
