const navigation = [
  { label: 'Chat', icon: '💬' },
  { label: 'Tools', icon: '🧰' },
  { label: 'History', icon: '⏱️' },
  { label: 'Notes', icon: '📝' },
  { label: 'Settings', icon: '⚙️' }
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col items-center w-[88px] h-screen px-2 py-6 bg-tera-bg border-r border-white/5 shadow-glow-sm">
      <div className="flex items-center justify-center w-12 h-12 mb-8 rounded-full bg-gradient-to-br from-tera-neon/40 to-white/10 animate-pulse-glow">
        <span className="text-xl font-semibold tracking-[0.2em] text-white">T</span>
      </div>
      <div className="flex flex-col gap-3">
        {navigation.map((item) => (
          <button
            key={item.label}
            className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 bg-tera-panel hover:bg-tera-muted focus-visible:ring-2 focus-visible:ring-tera-neon/70"
            aria-label={item.label}
          >
            <span className="text-lg">{item.icon}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center w-full mt-auto text-xs tracking-widest uppercase text-white/70">
        Private
      </div>
    </aside>
  )
}
