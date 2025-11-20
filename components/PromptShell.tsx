"use client"

import React, { ChangeEvent, useRef, useState, useTransition } from 'react'
import { generateAnswer } from '@/app/actions/generate'
import type { TeacherTool } from './ToolCard'
import { teacherTools } from '@/lib/teacher-tools'

const toolbarActions = teacherTools.map((tool) => tool.name)

export default function PromptShell({ tool, onToolChange }: { tool: TeacherTool; onToolChange?: (tool: TeacherTool) => void }) {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [messages, setMessages] = useState(
    () => [
      {
        role: 'tera',
        content: 'Ask TERA anything about lesson planning, assessments, or communication.'
      }
    ]
  )
  const [floaterShift, setFloaterShift] = useState(0)
  const [inputDropped, setInputDropped] = useState(false)
  const [attachmentOpen, setAttachmentOpen] = useState(false)
  const [attachmentMessage, setAttachmentMessage] = useState<string | null>(null)
  const [snippet, setSnippet] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAttachmentMessage(`File queued: ${file.name}`)
    setAttachmentOpen(false)
    event.target.value = ''
  }

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setAttachmentMessage(`Image queued: ${file.name}`)
    setAttachmentOpen(false)
    event.target.value = ''
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const messageToSend = prompt.trim()
    if (!messageToSend) return
    setStatus('loading')
    const userMessage = { role: 'user', content: messageToSend }
    setMessages((prev) => [...prev, userMessage])
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
          authorId: 'demo-user'
        })
        setMessages((prev) => [...prev, { role: 'tera', content: answer }])
      } catch (error) {
        setMessages((prev) => [...prev, { role: 'tera', content: 'Error generating response from TERA.' }])
      } finally {
        setStatus('idle')
      }
    })
  }

  return (
    <section className="relative flex h-[60vh] w-full max-w-5xl flex-col justify-center text-left font-sans text-white">
      <div className="flex flex-col items-center gap-4 px-4">
        <div className="text-xl font-light tracking-wide text-white/70">Send a message...</div>
        <div className="flex flex-wrap gap-3 text-sm text-white/60">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            {messages[messages.length - 1]?.content ?? 'Awaiting prompt'}
          </span>
          <span>•</span>
          <span className="text-white/40">{tool.name}</span>
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
      </div>
      <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
      <input type="file" className="hidden" accept="image/*" ref={imageInputRef} onChange={handleImageSelect} />
    </section>
  )
}
