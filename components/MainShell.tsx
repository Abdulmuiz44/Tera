"use client"

import { useState } from 'react'
import Link from 'next/link'
import Sidebar, { navigation } from './Sidebar'
import PromptShell from './PromptShell'
import type { TeacherTool } from './ToolCard'
import { teacherTools } from '@/lib/teacher-tools'
import { usePathname } from 'next/navigation'

export default function MainShell() {
  const [selectedTool, setSelectedTool] = useState<TeacherTool>(teacherTools[0])
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isToolsRoute = pathname?.startsWith('/tools')

  return (
    <div className="flex min-h-screen w-full bg-[#050505] text-white">
      <Sidebar />
      <main className="relative flex flex-1 items-center justify-center px-6 py-10">
        <PromptShell tool={selectedTool} onToolChange={setSelectedTool} />
        <div className="absolute right-4 top-4 hidden items-center gap-3 md:flex">
          <button className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70 transition hover:border-white hover:text-white">
            Sign in
          </button>
          <button className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#050505] transition hover:bg-white/90">
            Sign up
          </button>
        </div>
        <button
          type="button"
          className="absolute left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-lg text-white hover:border-white/50 md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOpen(false)} />
            <div className="relative flex w-3/5 max-w-xs flex-col gap-6 rounded-3xl border border-white/10 bg-[#090909]/90 p-6 text-white shadow-2xl backdrop-blur md:hidden">
              <button
                type="button"
                className="self-end text-sm font-semibold uppercase tracking-[0.3em] text-white/60"
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
              <nav className="flex flex-col gap-4">
                {navigation.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : item.href === '/tools/lesson-plan-generator'
                      ? isToolsRoute
                      : pathname === item.href
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-xs font-normal uppercase tracking-[0.4em] transition ${
                        isActive ? 'border-tera-neon bg-tera-neon/40 text-white' : 'border-white/10 bg-transparent text-white/70'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-normal uppercase tracking-[0.2em] text-white/80">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
