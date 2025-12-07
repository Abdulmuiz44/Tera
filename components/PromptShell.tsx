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

type ContentBlock =
  | { type: 'text', content: string, isHeader: boolean }
  | { type: 'chart', config: any }
  | { type: 'mermaid', chart: string }
  | { type: 'code', language: string, code: string }

const parseContent = (content: string): ContentBlock[] => {
  const blocks: ContentBlock[] = []

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  parts.forEach(part => {
    if (!part.trim()) return

    if (part.startsWith('```')) {
      const match = part.match(/```(\w+)?(?::(\w+))?\n([\s\S]*?)```/)
      if (match) {
        const [, lang, type, code] = match
        const cleanCode = code ? code.trim() : ''

        // Check if code contains chart keys (relaxed check)
        const isChart = (c: string) => (c.includes('"data"') && c.includes('"type"')) || (c.includes('"series"'))

        if ((lang === 'json' && type === 'chart') || (lang === 'json' && isChart(cleanCode))) {
          try {
            const config = JSON.parse(cleanCode)
            blocks.push({ type: 'chart', config })
          } catch (e) {
            blocks.push({ type: 'code', language: 'json', code: cleanCode })
          }
        } else if (lang === 'mermaid') {
          blocks.push({ type: 'mermaid', chart: cleanCode })
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
  const [upgradePromptType, setUpgradePromptType] = useState<'lesson-plans' | 'chats' | 'file-uploads' | null>(null)
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

    const response = await fetch('/api/attachments', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Unable to upload attachment')
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
      setAttachmentMessage('Upload failed. Please try again.')
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
        const { answer, sessionId: newSessionId, chatId: savedChatId } = await generateAnswer({
          prompt: messageToSend,
          tool: tool.name,
          authorId: user?.id ?? '',
          authorEmail: user?.email ?? undefined,
          attachments: attachmentsToSend,
          sessionId: currentSessionId,
          chatId: editingMessageId ?? undefined
        })

        // Check if this request is still valid (hasn't been stopped or superseded)
        if (currentRequestId !== requestIdRef.current) {
          console.log('🛑 Request cancelled/superseded, ignoring response')
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

        // Check for limit errors
        if (message.includes('limit') && message.includes('chats')) {
          setUpgradePromptType('chats')
        } else if (message.includes('limit') && message.includes('lesson plans')) {
          setUpgradePromptType('lesson-plans')
        } else if (message.includes('limit') && message.includes('file uploads')) {
          setUpgradePromptType('file-uploads')
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
    <div className="flex h-full w-full flex-col relative">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8" ref={conversationRef}>
        <div className="mx-auto max-w-3xl space-y-8">
          {showInitialPrompt ? (
            <div className="fixed inset-0 flex items-center justify-center text-center pointer-events-none -mt-20">
              <div className="pointer-events-auto flex flex-col items-center">
                <div className="mb-8 rounded-full bg-gradient-to-br from-tera-neon/20 to-transparent p-6 mx-auto w-fit">
                  <span className="flex items-center justify-center w-32 h-32">
                    <Image src="/images/TERA_LOGO_ONLY.png" alt="Tera" width={120} height={120} className="object-contain" />
                  </span>
                </div>
                <h2 className="text-3xl font-semibold text-white">How can Tera help you today?</h2>
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
                        className="opacity-0 group-hover:opacity-100 p-2 text-white/50 hover:text-white transition"
                        title="Edit message"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                        </svg>
                      </button>

                      <div className="flex flex-col items-end gap-1 w-full">
                        <div className="rounded-2xl bg-white/10 px-6 py-4 text-white backdrop-blur-sm w-full">
                          <p className="whitespace-pre-wrap leading-relaxed">{entry.userMessage.content}</p>
                          {entry.userMessage.attachments && entry.userMessage.attachments.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {entry.userMessage.attachments.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-xs">
                                  <span>{att.type === 'image' ? '🖼️' : '📄'}</span>
                                  <span className="truncate max-w-[150px]">{att.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Timestamp and checkmarks */}
                        <div className="flex items-center gap-1.5 px-2 text-xs text-white/40">
                          <span>{formatTimestamp(entry.userMessage.timestamp)}</span>
                          <span className="text-white/50">✓✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assistant Message */}
                {entry.assistantMessage && (
                  <div className="flex justify-start w-full">
                    <div className="w-full md:max-w-[85%]">
                      <div className="rounded-2xl bg-tera-panel border border-white/5 px-4 md:px-6 py-4 text-white/90 shadow-lg">
                        <div className="space-y-4">
                          {parseContent(entry.assistantMessage.content).map((block, idx) => {
                            if (block.type === 'chart') {
                              return <ChartRenderer key={idx} config={block.config} />
                            }
                            if (block.type === 'mermaid') {
                              return <MermaidRenderer key={idx} chart={block.chart} />
                            }
                            if (block.type === 'code') {
                              return (
                                <div key={idx} className="my-4 rounded-lg bg-black/30 p-4 font-mono text-xs overflow-x-auto text-tera-neon max-w-full">
                                  <pre>{block.code}</pre>
                                </div>
                              )
                            }
                            return block.isHeader ? (
                              <h3 key={idx} className="font-bold text-lg mt-2 text-white">
                                {block.content}
                              </h3>
                            ) : (
                              <p key={idx} className="leading-relaxed whitespace-pre-wrap">
                                {block.content}
                              </p>
                            )
                          })}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                          <span className="text-xs text-white/30">{formatTimestamp(entry.assistantMessage.timestamp)}</span>
                          <VoiceControls text={entry.assistantMessage.content} messageId={entry.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {status === 'loading' && (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="flex items-center gap-3 rounded-2xl bg-tera-panel px-6 py-4 text-white/60">
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
      <div className="sticky bottom-0 z-50 border-t border-white/10 bg-[#0a0a0a]/95 px-2 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto max-w-3xl relative">
          <div className={`relative flex flex-col gap-2 rounded-[24px] border border-white/10 bg-[#1a1a1a] p-2 shadow-2xl ring-1 ring-white/5 transition-all ${conversationActive ? 'focus-within:ring-tera-neon/50 focus-within:border-tera-neon/50' : 'focus-within:ring-white/20'}`}>

            {/* Inline Attachments Preview */}
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-2 pt-2">
                {pendingAttachments.map((att, idx) => (
                  <div key={idx} className="group relative flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-white">
                    <span>{att.type === 'image' ? '🖼️' : '📄'}</span>
                    <span className="truncate max-w-[200px]">{att.name}</span>
                    <button
                      onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))}
                      className="ml-2 rounded-full bg-white/10 p-1 hover:bg-white/20"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Left Actions */}
              <div className="flex items-center gap-1 pb-1.5 pl-2">
                <div className="relative">
                  <button
                    onClick={() => setAttachmentOpen(!attachmentOpen)}
                    className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                    title="Add attachment"
                  >
                    <span className="text-xl">⊕</span>
                  </button>

                  {attachmentOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-tera-panel shadow-xl backdrop-blur-xl">
                      <button
                        onClick={() => handleFileSelect('camera')}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-white/5"
                      >
                        <span>📷</span> Open Camera
                      </button>
                      <button
                        onClick={() => handleFileSelect('image')}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-white/5"
                      >
                        <span>🖼️</span> Upload image
                      </button>
                      <button
                        onClick={() => handleFileSelect('file')}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white hover:bg-white/5"
                      >
                        <span>📄</span> Upload file
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
                className="max-h-[200px] min-h-[52px] w-full resize-none bg-transparent py-3.5 px-2 text-white placeholder-white/40 focus:outline-none"
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`
                }}
              />

              {/* Dynamic Action Button */}
              <div className="mb-1.5 mr-1.5">
                {showStopButton && (
                  <button
                    onClick={handleStop}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-tera-neon text-white transition hover:bg-tera-neon/90"
                    title="Stop generating"
                  >
                    <div className="h-3 w-3 bg-white rounded-[2px]" />
                  </button>
                )}

                {showSendButton && (
                  <button
                    onClick={handleSubmit}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-tera-neon text-white transition hover:bg-tera-neon/90"
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
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
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

      {upgradePromptType && (
        <UpgradePrompt
          type={upgradePromptType}
          onClose={() => setUpgradePromptType(null)}
        />
      )}
    </div>
  )
}
