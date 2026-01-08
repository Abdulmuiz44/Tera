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
    <div className="bg-tera-panel border border-tera-border rounded-lg p-6">
      <p className="text-tera-secondary text-sm mb-2">{label}</p>
      <p className="text-3xl font-bold text-tera-neon">{value}</p>
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
      fetchAnalytics()
    }
  }, [user?.id])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/plus/analytics?userId=${user?.id}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-tera-neon/20 border-t-tera-neon rounded-full animate-spin mb-4"></div>
          <p className="text-tera-secondary">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-tera-primary mb-2">Advanced Analytics Dashboard</h2>
        <p className="text-tera-secondary">Track your usage patterns and insights</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Chats" value={stats?.totalChats || 0} />
        <StatCard label="File Uploads" value={stats?.totalUploads || 0} />
        <StatCard label="Most Used Tool" value={stats?.mostUsedTool || 'N/A'} />
        <StatCard label="Avg Response Time" value={`${stats?.avgResponseTime || 0}s`} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chats by Tool */}
        <div className="bg-tera-panel border border-tera-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-tera-primary mb-4">Chats by Tool</h3>
          <div className="space-y-3">
            {stats?.chatsByTool && Object.entries(stats.chatsByTool).map(([tool, count]) => (
              <div key={tool}>
                <div className="flex justify-between mb-1">
                  <span className="text-tera-secondary text-sm">{tool}</span>
                  <span className="text-tera-primary font-medium">{count}</span>
                </div>
                <div className="w-full bg-tera-muted rounded-full h-2">
                  <div
                    className="bg-tera-neon rounded-full h-2 transition-all"
                    style={{
                      width: `${(count / (stats?.totalChats || 1)) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Activity */}
        <div className="bg-tera-panel border border-tera-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-tera-primary mb-4">Daily Activity (Last 7 Days)</h3>
          <div className="space-y-2">
            {stats?.dailyActivity?.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-tera-secondary text-sm w-20">{day.date}</span>
                <div className="flex-1 bg-tera-muted rounded h-6">
                  <div
                    className="bg-gradient-to-r from-tera-neon to-tera-primary rounded h-6 transition-all"
                    style={{
                      width: `${(day.chats / 10) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="text-tera-primary font-medium w-8">{day.chats}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Summary */}
      <div className="bg-tera-panel border border-tera-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-tera-primary mb-4">Usage Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-tera-secondary text-sm mb-1">Total Usage</p>
            <p className="text-2xl font-bold text-tera-neon">{(stats?.totalChats || 0) + (stats?.totalUploads || 0)}</p>
            <p className="text-tera-secondary text-xs mt-1">Interactions combined</p>
          </div>
          <div>
            <p className="text-tera-secondary text-sm mb-1">Platform Status</p>
            <p className="text-2xl font-bold text-tera-primary">Optimal</p>
            <p className="text-tera-secondary text-xs mt-1">All systems running smoothly</p>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchAnalytics}
          className="px-6 py-2 bg-tera-primary text-tera-bg rounded-lg hover:opacity-90 transition font-medium"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  )
}
