import Sidebar from '@/components/Sidebar'

export default function SettingsPage() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">Tera</p>
              <h1 className="text-3xl font-semibold leading-tight text-white">Settings</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon">
                Edit preferences
              </button>
            </div>
          </header>
          <div className="flex-1 rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md">
            <h2 className="text-xl font-semibold text-white mb-4">Configure your workspace</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-tera-muted p-4">
                <p className="text-white/60">Nothing to adjust yet. Customize once you start chatting.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
