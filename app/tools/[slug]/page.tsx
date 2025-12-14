import { notFound } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PromptShell from '@/components/PromptShell'
import { allTools, slugify } from '@/lib/tools-data'
import { type TeacherTool } from '@/components/ToolCard'
import ClientToolPage from './ClientToolPage'

export function generateStaticParams() {
  if (!Array.isArray(allTools) || allTools.length === 0) {
    return []
  }
  return allTools.map((tool) => ({
    slug: slugify(tool.name),
  }))
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params
  const tool = allTools.find((t) => slugify(t.name) === slug)

  if (!tool) {
    notFound()
  }

  return <ClientToolPage tool={tool} />
}
