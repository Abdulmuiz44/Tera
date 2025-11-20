import { notFound } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PromptShell from '@/components/PromptShell'
import { teacherTools } from '@/lib/teacher-tools'
import { type TeacherTool } from '@/components/ToolCard'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params
  const tool = teacherTools.find((t: TeacherTool) => t.name.toLowerCase().replace(/\s+/g, '-') === slug)

  if (!tool) {
    notFound()
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">TERA</p>
              <h1 className="text-3xl font-semibold leading-tight text-white">{tool.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon">
                ✨ Upgrade
              </button>
            </div>
          </header>
          <PromptShell />
          <div className="flex-1 rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md">
            <h2 className="text-xl font-semibold text-white mb-4">Tool Interface</h2>
            <p className="text-white/60 mb-4">{tool.description}</p>
            {/* Placeholder for tool-specific form */}
            <div className="space-y-4">
              <input
                className="w-full bg-tera-muted border border-white/10 rounded-lg px-4 py-2 text-white"
                placeholder="Enter your inputs here..."
              />
              <button className="rounded-full bg-tera-neon px-6 py-2 text-white font-semibold">
                Generate
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export async function generateStaticParams() {
  return teacherTools.map((tool: TeacherTool) => ({
    slug: tool.name.toLowerCase().replace(/\s+/g, '-'),
  }))
}
