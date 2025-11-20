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
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="w-full max-w-3xl">
            <PromptShell tool={tool} />
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
