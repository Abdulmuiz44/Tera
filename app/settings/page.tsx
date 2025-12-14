'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

type UserSettings = {
  notifications_enabled: boolean
  dark_mode: boolean
  email_notifications: boolean
  marketing_emails: boolean
  data_retention_days: number
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    dark_mode: true,
    email_notifications: true,
    marketing_emails: false,
    data_retention_days: 90,
  })

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'x-user-id': user?.id || '',
        },
      })

      if (!response.ok) {
        console.warn('Failed to fetch settings, using defaults')
        return
      }

      const data = await response.json()
      setSettings({
        notifications_enabled: data.notifications_enabled ?? true,
        dark_mode: data.dark_mode ?? true,
        email_notifications: data.email_notifications ?? true,
        marketing_emails: data.marketing_emails ?? false,
        data_retention_days: data.data_retention_days ?? 90,
      })
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setMessageType('success')
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessageType('error')
      setMessage('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const toggleSetting = (key: keyof UserSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Settings</h1>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                messageType === 'success'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-800'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-800'
              }`}
            >
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
          ) : (
            <div className="space-y-8">
              {/* Preferences Section */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive notifications about your activities</p>
                    </div>
                    <label className="relative inline-block w-12 h-6 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications_enabled}
                        onChange={() => toggleSetting('notifications_enabled')}
                        className="sr-only peer"
                      />
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 peer-checked:bg-black dark:peer-checked:bg-white rounded-full transition"></div>
                      <div className="absolute left-0.5 top-0.5 bg-white dark:bg-black w-5 h-5 rounded-full transition peer-checked:translate-x-6"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Get email updates on important changes</p>
                    </div>
                    <label className="relative inline-block w-12 h-6 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.email_notifications}
                        onChange={() => toggleSetting('email_notifications')}
                        className="sr-only peer"
                      />
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 peer-checked:bg-black dark:peer-checked:bg-white rounded-full transition"></div>
                      <div className="absolute left-0.5 top-0.5 bg-white dark:bg-black w-5 h-5 rounded-full transition peer-checked:translate-x-6"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-black dark:text-white">Marketing Emails</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive tips and feature announcements</p>
                    </div>
                    <label className="relative inline-block w-12 h-6 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketing_emails}
                        onChange={() => toggleSetting('marketing_emails')}
                        className="sr-only peer"
                      />
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 peer-checked:bg-black dark:peer-checked:bg-white rounded-full transition"></div>
                      <div className="absolute left-0.5 top-0.5 bg-white dark:bg-black w-5 h-5 rounded-full transition peer-checked:translate-x-6"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy Section */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Privacy & Data</h2>
                
                <div>
                  <p className="font-medium text-black dark:text-white mb-3">Data Retention</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">How long we keep your deleted data in our system</p>
                  <select
                    value={settings.data_retention_days}
                    onChange={(e) => updateSetting('data_retention_days', parseInt(e.target.value))}
                    className="rounded-lg bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 px-4 py-2 text-black dark:text-white text-sm focus:outline-none focus:border-black dark:focus:border-white"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>6 months</option>
                    <option value={365}>1 year</option>
                  </select>
                </div>
              </div>

              {/* Account Section */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Account</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">Email Address</p>
                    <p className="text-black dark:text-white font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">Account Created</p>
                    <p className="text-black dark:text-white font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition"
                >
                  Sign Out
                </button>
              </div>

              {/* Save Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
