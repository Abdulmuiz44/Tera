import { TeacherTool } from './ToolCard'

const samplePrompts: Record<string, string> = {
  'Lesson Plan Generator': 'Generate a 45-minute 8th-grade lesson on Newton’s laws including a lab, exit ticket, and reflection prompt.',
  'Worksheet & Quiz Generator': 'Create a 10-question mixed-format quiz for algebra inequalities with answer key and pacing suggestions.',
  'Concept Explainer': 'Explain photosynthesis to a 5th-grade class using analogies and a quick demo idea.',
  'Rubric Builder': 'Design a 4-level rubric for a lab report focusing on analysis, procedure, and collaboration.',
  'Parent Communication': 'Write a compassionate update for a parent about a student’s progress and request for at-home support.',
  'Classroom Quick Assist': 'Recommend three quick routines to de-escalate a disruptive group while keeping the class moving.',
  'Rewrite & Differentiate': 'Simplify this paragraph for ELL support, keeping the key science vocabulary intact.',
  'Teaching Materials Builder': 'Outline a bulletin board set of slides for the solar system unit that includes anchor questions.',
  'Warm-up Question Generator': 'Provide 5 openers that spark discourse about civic responsibility in government class.',
  'Research & Reading Simplifier': 'Summarize this 1200-word article into a 5-bullet reading guide with a vocabulary focus.'
}

export default function ToolDetailPanel({ tool }: { tool: TeacherTool }) {
  return (
    <section className="flex w-96 flex-col gap-6 p-6 rounded-[32px] border border-tera-border bg-tera-panel-strong shadow-panel">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.4em] text-tera-secondary">Tool insight</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tool.icon}</span>
          <h2 className="text-xl font-semibold text-tera-primary">{tool.name}</h2>
        </div>
        <p className="text-sm text-tera-secondary">{tool.description}</p>
      </header>
      <div className="flex flex-col gap-3 rounded-[26px] tera-surface-subtle p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-tera-secondary">Sample Prompt</p>
        <p className="text-sm text-tera-secondary">{samplePrompts[tool.name]}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-tera-border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tera-secondary">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-[26px] tera-surface-subtle p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-tera-secondary">Workflow</p>
        <ol className="flex flex-col gap-2 text-sm text-tera-secondary">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full tera-accent-dot" />
            Curate inputs (grade, topic, tone) →
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full tera-accent-dot" />
            Preview generated draft with highlights →
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full tera-accent-dot" />
            Save to Supabase lessons or share via link
          </li>
        </ol>
      </div>
      <button className="tera-button-primary mt-auto rounded-[26px] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition hover:-translate-y-0.5">
        Launch tool
      </button>
    </section>
  )
}
