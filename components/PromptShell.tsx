"use client"

import React, { ChangeEvent, useRef, useState, useTransition } from 'react'
import { generateAnswer } from '@/app/actions/generate'
import type { TeacherTool } from './ToolCard'
import type { AttachmentReference, AttachmentType } from '@/lib/attachment'

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
}

const createId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))

const structureResponse = (content: string) => {
  const segments = content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (!segments.length) {
    return [{ text: 'Awaiting TERA response...', emoji: '🛸' }]
  }

  return segments.flatMap((segment, index) => {
    const sentenceParts = segment
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)

    return sentenceParts.map((sentence, sentenceIndex) => ({
      text: sentence,
      emoji: sentenceIndex === 0 && index === 0 ? '🚀' : '✨'
    }))
  })
}

export default function PromptShell({ tool, onToolChange }: { tool: TeacherTool; onToolChange?: (tool: TeacherTool) => void }) {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [conversations, setConversations] = useState<ConversationEntry[]>([
    {
      id: createId(),
      assistantMessage: {
        id: createId(),
        role: 'tera',
        content: 'Ask Tera anything about lesson planning, assessments, or communication.'
      }
    }
  ])
  const [floaterShift, setFloaterShift] = useState(0)
  const [inputDropped, setInputDropped] = useState(false)
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const [attachmentMessage, setAttachmentMessage] = useState<string | null>(null)
  const [snippet, setSnippet] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState<AttachmentReference[]>([])
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [isPending, startTransition] = useTransition()

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
      setAttachmentMessage(`Image queued: ${attachment.name}`)
    } catch (error) {
      setAttachmentMessage('Upload failed. Try again.')
    } finally {
      setAttachmentOpen(false)
      event.target.value = ''
    }
  }

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setAttachmentMessage('Message copied to clipboard')
    } catch (error) {
      setAttachmentMessage('Copy failed')
    }
  }

  const buildUserMessage = (entryId: string, content: string) => ({
    id: entryId,
    role: 'user' as const,
    content,
    attachments: pendingAttachments.length ? [...pendingAttachments] : undefined
  })

  const handleEditMessage = (entryId: string, message: Message) => {
    if (message.role === 'user') {
      setPrompt(message.content)
      setEditingMessageId(entryId)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const messageToSend = prompt.trim()
    if (!messageToSend) return
    setStatus('loading')
    const entryId = editingMessageId ?? createId()
    const userMessage = buildUserMessage(entryId, messageToSend)
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
    setPrompt('')
    const dropDistance = 140
    if (!inputDropped) {
      setInputDropped(true)
      requestAnimationFrame(() => {
        setFloaterShift(dropDistance)
      })
    } else {
      setFloaterShift(dropDistance + 5)
      setTimeout(() => setFloaterShift(dropDistance), 300)
    }
    startTransition(async () => {
      try {
        const answer = await generateAnswer({
          prompt: messageToSend,
          tool: tool.name,
          authorId: 'demo-user',
          attachments: pendingAttachments
        })
        const assistantMessage: Message = {
          id: createId(),
          role: 'tera',
          content: answer
        }
        setConversations((prev) =>
          prev.map((entry) => (entry.id === entryId ? { ...entry, assistantMessage } : entry))
        )
      } catch (error) {
        setConversations((prev) =>
          prev.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  assistantMessage: {
                    id: createId(),
                    role: 'tera',
                    content: 'Error generating response from TERA.'
                  }
                }
              : entry
          )
        )
      } finally {
        setStatus('idle')
      }
    })
    setPendingAttachments([])
    setEditingMessageId(null)
  }

  return (
    <section className="relative flex h-[60vh] w-full max-w-5xl flex-col justify-center text-left font-sans text-white">
      <div className="flex flex-col gap-6 px-4">
        <div className="text-xl font-light tracking-wide text-white/70">What can Tera help you with?</div>
        <div className="flex flex-col gap-4">
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
                  </div>
                </div>
              )}
              {entry.assistantMessage && (
                <div className="group relative flex w-full justify-end">
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
                        <p key={`${entry.assistantMessage!.id}-${index}`} className="text-white leading-relaxed">
                          <span className="mr-2 text-white/60">{segment.emoji}</span>
                          {segment.text}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isPending && (
            <div className="flex w-full justify-end">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
                <span className="h-2 w-2 animate-pulse rounded-full bg-tera-neon" />
                TERA is typing...
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="absolute left-1/2 bottom-10 w-full max-w-2xl -translate-x-1/2"
        style={{ transform: `translate(-50%, ${floaterShift}px)` }}
      >
        <form className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#111111] p-4 shadow-2xl" onSubmit={handleSubmit}>
          <button
            type="button"
            className="relative rounded-full border border-white/10 bg-transparent p-2 text-lg text-white/60 hover:text-white"
            onClick={() => setAttachmentOpen((prev) => !prev)}
          >
            📎
            {attachmentOpen && (
              <div className="absolute left-1/2 top-full z-10 mt-3 -translate-x-1/2 w-60 rounded-2xl border border-white/10 bg-[#111111] p-4 text-sm text-white shadow-2xl">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Add attachment</p>
                <div className="mt-3 space-y-2">
                  <div
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-white/70 hover:border-white/30"
                    role="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span>Upload file</span>
                    <span className="text-white/50">↥</span>
                  </div>
                  <div
                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-white/70 hover:border-white/30"
                    role="button"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <span>Upload image</span>
                    <span className="text-white/50">↥</span>
                  </div>
                  <div className="rounded-xl border border-white/10 px-3 py-2">
                    <label className="text-[0.6rem] uppercase tracking-[0.3em] text-white/40">Add text</label>
                    <textarea
                      className="mt-2 w-full rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs text-white outline-none"
                      placeholder="Type snippet..."
                      value={snippet}
                      onChange={(event) => setSnippet(event.target.value)}
                    />
                    <button
                      type="button"
                      className="mt-2 w-full rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:bg-white/10"
                      onClick={() => {
                        if (!snippet.trim()) return
                        setPrompt((prev) => `${prev}${prev ? '\n' : ''}${snippet.trim()}`)
                        setSnippet('')
                        setAttachmentMessage('Text snippet added')
                        setAttachmentOpen(false)
                      }}
                    >
                      Add
                    </button>
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
          <div className="mt-2 flex flex-wrap gap-2">
            {pendingAttachments.map((attachment) => (
              <span key={attachment.url} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                {attachment.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
