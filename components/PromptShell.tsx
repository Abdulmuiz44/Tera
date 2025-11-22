"use client"

import React, { ChangeEvent, useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { generateAnswer } from '@/app/actions/generate'
import type { User } from '@supabase/supabase-js'
import type { TeacherTool } from './ToolCard'
import type { AttachmentReference, AttachmentType } from '@/lib/attachment'
import { supabase } from '@/lib/supabase'

type Message = {
  id: string
  role: 'user' | 'tera'
  content: string
  attachments?: AttachmentReference[]
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

const structureResponse = (content: string) => {
  // Split by double newlines for paragraphs, or single newlines for sentences
  const paragraphs = content
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter(Boolean)

  if (!paragraphs.length) {
    return [{ text: 'Awaiting TERA response...', isHeader: false }]
  }

  return paragraphs.map((paragraph) => {
    // Check if it's a header (starts with # or is all caps and short)
    const isMarkdownHeader = paragraph.startsWith('#')
    const isAllCapsHeader = paragraph === paragraph.toUpperCase() && paragraph.length < 50 && !paragraph.includes('.')

    return {
      text: paragraph.replace(/^#+\s*/, ''), // Remove markdown header symbols
      isHeader: isMarkdownHeader || isAllCapsHeader
    }
  })
}

export default function PromptShell({
  tool,
  onToolChange,
  user,
  userReady,
  onRequireSignIn
}: {
  tool: TeacherTool
  onToolChange?: (tool: TeacherTool) => void
  user?: User | null
  userReady?: boolean
  onRequireSignIn?: () => void
}) {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [conversations, setConversations] = useState<ConversationEntry[]>([])
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const [attachmentMessage, setAttachmentMessage] = useState<string | null>(null)
  const [snippet, setSnippet] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentReference[]>([])
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [conversationActive, setConversationActive] = useState(false)
  const [hasBumpedInput, setHasBumpedInput] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [isPending, startTransition] = useTransition()
  const conversationRef = useRef<HTMLDivElement | null>(null)
  const [queuedMessage, setQueuedMessage] = useState<QueuedMessage | null>(null)
  const showInitialPrompt = conversations.every((entry) => !entry.userMessage)

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

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setAttachmentMessage(`Uploading ${file.name}...`)
    try {
      const attachment = await uploadAttachment(file, 'file')
      setPendingAttachments((prev) => [...prev, attachment])
      setAttachmentMessage(`File queued: ${attachment.name}`)
    } catch (error) {
      setAttachmentMessage('Upload failed. Try again.')
    } finally {
      setAttachmentOpen(false)
      event.target.value = ''
    }
  }

  const handleImageSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setAttachmentMessage(`Uploading ${file.name}...`)
    try {
      const attachment = await uploadAttachment(file, 'image')
      setPendingAttachments((prev) => [...prev, attachment])
      setAttachmentMessage(`Image added to the prompt`)
    } catch (error) {
      setAttachmentMessage('Upload failed. Try again.')
    } finally {
      setAttachmentOpen(false)
      event.target.value = ''
    }
  }

  const handleSearchWeb = () => {
    const query = window.prompt('What should Tera search for on the web?')?.trim()
    if (!query) return
    setAttachmentMessage(`Searching the web for “${query}”`)
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank')
    setAttachmentOpen(false)
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setAttachmentMessage('Message copied to clipboard')
    } catch (error) {
      setAttachmentMessage('Copy failed')
    }
  }

  const buildUserMessage = (entryId: string, content: string, attachments?: AttachmentReference[]) => ({
    id: entryId,
    role: 'user' as const,
    content,
    attachments: attachments && attachments.length ? [...attachments] : undefined
  })

  const handleEditMessage = (entryId: string, message: Message) => {
    if (message.role === 'user') {
      setPrompt(message.content)
      setEditingMessageId(entryId)
    }
  }

  const processMessage = useCallback((messageToSend: string, attachmentsToSend: AttachmentReference[]) => {
    setStatus('loading')
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
        const { answer, sessionId } = await generateAnswer({
          prompt: messageToSend,
          tool: tool.name,
          authorId: user?.id ?? '',
          authorEmail: user?.email ?? undefined,
          attachments: attachmentsToSend
        })
        const assistantMessage: Message = {
          id: createId(),
          role: 'tera',
          content: answer
        }
        setConversations((prev) =>
          prev.map((entry) =>
            entry.id === entryId ? { ...entry, assistantMessage, sessionId } : entry
          )
        )
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to generate a reply'
        console.error('generateAnswer failed', error)
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
        setStatus('idle')
      }
      setPendingAttachments([])
      setEditingMessageId(null)
      setPrompt('')
      setQueuedMessage(null)
    })
  }, [editingMessageId, hasBumpedInput, tool.name, user?.id])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const messageToSend = prompt.trim()
    if (!messageToSend) return
    if (!user) {
      setQueuedMessage({
        prompt: messageToSend,
        attachments: [...pendingAttachments]
      })
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
    processMessage(messageToSend, pendingAttachments)
  }

  useEffect(() => {
    if (userReady && queuedMessage) {
      processMessage(queuedMessage.prompt, queuedMessage.attachments)
    }
  }, [userReady, queuedMessage, processMessage])

  // Load previous chat sessions from Supabase
  useEffect(() => {
    if (!user) {
      setConversations([])
      return
    }

    let isMounted = true
    const userId = user.id // Capture user ID to avoid null check issues

    async function loadChatHistory() {
      setHistoryLoading(true)
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('id, prompt, response, attachments, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(50)

        if (isMounted && !error && data) {
          // Transform Supabase data into conversation format
          const loadedConversations: ConversationEntry[] = data.map((session) => ({
            id: session.id,
            sessionId: session.id,
            userMessage: {
              id: `${session.id}-user`,
              role: 'user' as const,
              content: session.prompt,
              attachments: session.attachments as AttachmentReference[] | undefined
            },
            assistantMessage: {
              id: `${session.id}-assistant`,
              role: 'tera' as const,
              content: session.response
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
  }, [user])

  useEffect(() => {
    if (conversationActive) {
      requestAnimationFrame(() => {
        conversationRef.current?.scrollTo({
          top: conversationRef.current.scrollHeight,
          behavior: 'smooth'
        })
      })
    }
  }, [conversations, conversationActive])

  return (
    <section className="relative flex flex-1 w-full max-w-full flex-col text-left font-sans text-white md:max-w-5xl">
      <div
        className={`flex flex-1 flex-col gap-6 px-2 md:px-4 ${showInitialPrompt ? 'justify-center items-center text-center' : ''
          }`}
      >
        {conversations.every((entry) => !entry.userMessage) && (
          <div className="text-center text-3xl font-semibold tracking-wide text-white/90">What can Tera help you with?</div>
        )}
        {user && !userReady && (
          <div className="mx-auto flex max-w-xs items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-[0.65rem] uppercase tracking-[0.4em] text-white/80">
            <span className="h-2 w-2 animate-ping rounded-full bg-tera-neon" />
            Finalizing your account… your pending message will send shortly.
          </div>
        )}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div ref={conversationRef} className="flex flex-1 min-h-0 flex-col gap-3 overflow-y-auto pr-2 pb-16">
            {conversations.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-3">
                {entry.userMessage && (
                  <div className="group relative flex w-full justify-end">
                    <div className="relative max-w-[72%] rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-right shadow-lg transition text-white">
                      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => entry.userMessage && handleEditMessage(entry.id, entry.userMessage)}
                          className="rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-white/80"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => entry.userMessage && handleCopyMessage(entry.userMessage.content)}
                          className="rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-white/80"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="leading-relaxed">{entry.userMessage?.content}</p>
                      {entry.userMessage.attachments && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {entry.userMessage.attachments.map((attachment) => (
                            <a
                              key={attachment.url}
                              href={attachment.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[0.6rem] uppercase tracking-[0.3em] text-white/70 transition hover:border-white"
                            >
                              {attachment.type === 'image' ? '🖼️' : '📄'} {attachment.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {entry.assistantMessage && (
                  <div className="group relative flex w-full justify-start">
                    <div className="relative max-w-[72%] rounded-2xl border border-white/10 bg-[#111111] px-5 py-4 text-left shadow-lg transition text-white">
                      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(entry.assistantMessage!.content)}
                          className="rounded-full border border-white/20 bg-white/5 px-2 py-1 text-[0.6rem] uppercase tracking-[0.35em] text-white/80"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {structureResponse(entry.assistantMessage.content).map((segment, index) => (
                          segment.isHeader ? (
                            <h3 key={`${entry.assistantMessage!.id}-${index}`} className="text-white font-bold text-lg mt-2 leading-relaxed">
                              {segment.text}
                            </h3>
                          ) : (
                            <p key={`${entry.assistantMessage!.id}-${index}`} className="text-white leading-relaxed">
                              {segment.text}
                            </p>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isPending && (
              <div className="flex w-full justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
                  <span className="h-2 w-2 animate-ping rounded-full bg-tera-neon" />
                  <span className="flex items-center gap-1 text-[0.6rem] font-semibold tracking-[0.4em] text-white/70">
                    Tera is Thinking...
                    <span className="flex items-center gap-[0.4rem] text-white/70">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse"
                          style={{ animationDelay: `${index * 0.15}s` }}
                        />
                      ))}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="sticky bottom-0 z-10 w-full rounded-3xl border border-white/5 bg-[#111111]/80 p-4 shadow-2xl backdrop-blur"
        style={{
          transform: hasBumpedInput ? 'translateY(6px)' : 'translateY(0)',
          transition: 'transform 0.35s ease'
        }}
      >
        <form className="flex items-center gap-3" onSubmit={handleSubmit}>
          <button
            type="button"
            className="relative rounded-full bg-transparent p-2 text-lg text-white/60 hover:text-white"
            onClick={() => setAttachmentOpen((prev) => !prev)}
          >
            ⊕
            {attachmentOpen && (
              <div className="absolute left-1/2 bottom-full z-10 mb-3 -translate-x-1/2 w-60 rounded-2xl border border-white/10 bg-[#111111] p-4 text-sm text-white shadow-2xl">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Add attachment</p>
                <div className="mt-3 space-y-2">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => imageInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        imageInputRef.current?.click()
                      }
                    }}
                    className="flex cursor-pointer w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-white/70 transition hover:border-white/30"
                  >
                    <span>Upload image</span>
                    <span className="text-white/50">↥</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        fileInputRef.current?.click()
                      }
                    }}
                    className="flex cursor-pointer w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-white/70 transition hover:border-white/30"
                  >
                    <span>Upload files</span>
                    <span className="text-white/50">↥</span>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleSearchWeb}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleSearchWeb()
                      }
                    }}
                    className="flex cursor-pointer w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-white/70 transition hover:border-white/30"
                  >
                    <span>Search the web</span>
                    <span className="text-white/50">🔍</span>
                  </div>
                </div>
              </div>
            )}
          </button>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            ref={imageInputRef}
            onChange={handleImageSelect}
          />
          <input
            className="flex-1 bg-transparent text-lg font-sans text-white placeholder:text-white/40 outline-none"
            placeholder="Send a message..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <button
            type="submit"
            className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/90 text-xs font-semibold uppercase tracking-[0.4em] text-[#040404]"
          >
            {status === 'loading' ? '•••' : '↑'}
          </button>
        </form>
        {attachmentMessage && (
          <p className="mt-2 text-xs uppercase tracking-[0.4em] text-white/50">{attachmentMessage}</p>
        )}
        {pendingAttachments.length > 0 && (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-[0.6rem] uppercase tracking-[0.4em] text-white/50">Tera will reference the following content</p>
            <div className="flex flex-col gap-2">
              {pendingAttachments.map((attachment) => (
                <div
                  key={attachment.url}
                  className="overflow-hidden rounded-2xl border border-white/10"
                >
                  {attachment.type === 'image' ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex items-center justify-between bg-[#050505] px-3 py-2 text-xs uppercase tracking-[0.4em] text-white/70">
                      <span>{attachment.name}</span>
                      <span className="text-white/40">{attachment.type}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
