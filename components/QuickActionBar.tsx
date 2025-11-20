const quickActions = [
  { label: 'Lesson Plan Generator', icon: '🗂️' },
  { label: 'Worksheet & Quiz', icon: '📝' },
  { label: 'Concept Explainer', icon: '🧠' },
  { label: 'Rubric Builder', icon: '📊' }
]

export default function QuickActionBar() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {quickActions.map((action) => (
        <button
          key={action.label}
          className="flex items-center justify-between rounded-[26px] border border-white/5 bg-tera-panel px-5 py-4 text-left transition hover:border-tera-neon"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-white/50">Tool</p>
            <p className="text-base font-semibold text-white">{action.label}</p>
          </div>
          <span className="text-2xl">{action.icon}</span>
        </button>
      ))}
    </div>
  )
}
