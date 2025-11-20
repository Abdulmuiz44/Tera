export type TeacherTool = {
  name: string
  description: string
  icon: string
  tags: string[]
}

export type ToolCardProps = {
  tool: TeacherTool
  selected?: boolean
  onSelect?: (tool: TeacherTool) => void
}

export default function ToolCard({ tool, selected, onSelect }: ToolCardProps) {
  return (
    <article
      onClick={() => onSelect?.(tool)}
      className={`flex flex-col gap-4 rounded-[28px] border p-5 transition-all duration-200 shadow-glow-md ${
        selected
          ? 'border-tera-neon bg-gradient-to-br from-tera-panel/80 to-[#0f0f0f]'
          : 'border-white/10 bg-tera-panel hover:border-tera-neon'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tool.icon}</span>
          <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-white/50">New</span>
      </div>
      <p className="text-sm text-white/60">{tool.description}</p>
      <div className="flex flex-wrap gap-2">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/60"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  )
}
