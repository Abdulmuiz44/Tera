'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'

interface AnalyticsData {
  totalChats: number
  totalUploads: number
  mostUsedTool: string
  avgResponseTime: number
  chatsByTool: { [key: string]: number }
  dailyActivity: { date: string; chats: number }[]
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="tera-card">
      <p className="tera-eyebrow">Metric</p>
      <p className="mt-3 text-sm text-tera-secondary">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-tera-primary">{value}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.id) {
      void fetchAnalytics()
    }
  }, [user?.id])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/plus/analytics?userId=${user?.id}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-tera-secondary">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="tera-eyebrow">Analytics</p>
        <h2 className="mt-3 text-3xl font-semibold text-tera-primary">Advanced usage dashboard</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-tera-secondary">Review total chats, uploads, tool distribution, and recent activity from the Plus workspace.</p>
      </div>

      {error && <div className="rounded-[20px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total chats" value={stats?.totalChats || 0} />
        <StatCard label="File uploads" value={stats?.totalUploads || 0} />
        <StatCard label="Most used tool" value={stats?.mostUsedTool || 'N/A'} />
        <StatCard label="Avg response time" value={`${stats?.avgResponseTime || 0}s`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tera-card">
          <p className="tera-eyebrow">Distribution</p>
          <h3 className="mt-3 text-xl font-semibold text-tera-primary">Chats by tool</h3>
          <div className="mt-5 space-y-3">
            {stats?.chatsByTool && Object.entries(stats.chatsByTool).map(([tool, count]) => (
              <div key={tool}>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-tera-secondary">{tool}</span>
                  <span className="text-tera-primary">{count}</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-tera-neon" style={{ width: `${(count / (stats?.totalChats || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tera-card">
          <p className="tera-eyebrow">Activity</p>
          <h3 className="mt-3 text-xl font-semibold text-tera-primary">Daily activity</h3>
          <div className="mt-5 space-y-3">
            {stats?.dailyActivity?.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="w-20 text-sm text-tera-secondary">{day.date}</span>
                <div className="h-2.5 flex-1 rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-tera-neon" style={{ width: `${(day.chats / 10) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-sm text-tera-primary">{day.chats}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={fetchAnalytics} className="tera-button-secondary">Refresh analytics</button>
      </div>
    </div>
  )
}
