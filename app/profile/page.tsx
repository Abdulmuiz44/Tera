import Sidebar from '@/components/Sidebar'

export default function ProfilePage() {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      <Sidebar />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">TERA</p>
              <h1 className="text-3xl font-semibold leading-tight text-white">Profile</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon">
                Update profile
              </button>
            </div>
          </header>
          <div className="flex-1 rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md">
            <h2 className="text-xl font-semibold text-white mb-4">Your educator identity</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-tera-muted p-4">
                <p className="text-white/60">We have no profile details yet. Complete a chat to save preferences.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
