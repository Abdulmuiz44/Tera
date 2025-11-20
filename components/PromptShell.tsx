"use client"

import { useState, useTransition } from 'react'
import { generateAnswer } from '@/app/actions/generate'

const actions = ['Lesson Plan', 'Worksheet', 'Concept Explainer', 'Rubric', 'Parent Note']

export default function PromptShell() {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [result, setResult] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!prompt.trim()) return
    setStatus('loading')
    startTransition(async () => {
      try {
        const answer = await generateAnswer({
          prompt,
          tool: 'General Chat', // or selected tool
          authorId: 'demo-user' // placeholder
        })
        setResult(answer)
      } catch (error) {
        setResult('Error generating response.')
      } finally {
        setStatus('idle')
      }
    })
  }

  return (
    <section className="flex flex-col gap-6 w-full max-w-4xl">
      <form
        className="flex flex-col gap-4 bg-tera-panel border border-white/5 rounded-[32px] px-6 py-6 shadow-glow-md"
        onSubmit={handleSubmit}
        aria-label="Teacher prompt"
      >
        <div className="flex items-center gap-3">
          <span className="text-white/60">📎</span>
          <input
            className="flex-1 bg-transparent outline-none text-lg text-white placeholder:text-white/40"
            placeholder="What do you need for your class?"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <span className="rounded-full border border-white/10 px-4 py-1 text-sm text-white/70">
            Auto
          </span>
          <button
            type="submit"
            className="grid w-10 h-10 place-items-center rounded-full bg-gradient-to-br from-tera-neon to-[#00bfa5] shadow-glow-sm transition-transform duration-200 hover:-translate-y-0.5"
            aria-label="Send prompt"
          >
            {status === 'loading' ? '•••' : '↗'}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {actions.map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-medium tracking-[0.2em] uppercase text-white/70 transition hover:border-tera-neon hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>
      </form>
      <div className="rounded-[28px] bg-gradient-to-br from-white/5 via-white/0 to-white/0 p-[1px] shadow-glow-sm animate-pulse-glow">
        <div className="rounded-[27px] bg-tera-panel p-5 text-sm text-white/60">
          Need an explanation or a quick note? Use TERA to craft teacher-approved responses, lesson hooks,
          or communications for parents.
        </div>
      </div>
      {result && (
        <div className="rounded-[28px] bg-tera-panel border border-white/10 p-5 shadow-glow-sm">
          <p className="text-white/80">{result}</p>
        </div>
      )}
    </section>
  )
}
