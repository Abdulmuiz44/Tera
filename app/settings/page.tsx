'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useTheme } from '@/components/ThemeProvider'

type UserSettings = {
  notifications_enabled: boolean
  dark_mode: boolean
  email_notifications: boolean
  marketing_emails: boolean
  data_retention_days: number
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
<<<<<<< HEAD
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
=======
  const [autoSaving, setAutoSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'preferences' | 'privacy' | 'account'>('preferences')
>>>>>>> ed9d5f91f36688c26cec283eda62004420da3485
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

      // Sync global theme with fetched setting
      if (data.dark_mode !== undefined) {
        setTheme(data.dark_mode ? 'dark' : 'light')
      }
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
<<<<<<< HEAD
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
=======
    setSettings(prev => {
      const updated = { ...prev, [key]: value }
      saveSettingsAsync(updated)
      return updated
    })
  }

  const toggleSetting = (key: keyof UserSettings) => {
    setSettings(prev => {
      const newValue = !prev[key]
      const updated = { ...prev, [key]: newValue }

      // If toggling dark mode, update global theme immediately
      if (key === 'dark_mode') {
        setTheme(newValue ? 'dark' : 'light')
      }

      saveSettingsAsync(updated)
      return updated
    })
  }

  const saveSettingsAsync = async (settingsToSave: UserSettings) => {
    if (!user) return

    try {
      setAutoSaving(true)
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(settingsToSave),
      })

      if (!response.ok) {
        console.warn('Failed to auto-save settings - table may not exist yet')
        console.warn('Run: migrations/create_user_settings_table.sql in Supabase SQL Editor')
      }
    } catch (error) {
      console.error('Error auto-saving settings:', error)
      console.warn('Run: migrations/create_user_settings_table.sql in Supabase SQL Editor')
    } finally {
      setAutoSaving(false)
    }
  }

  return (
    <div className="w-full px-6 py-10 bg-tera-bg text-tera-primary">
      <div className="flex flex-col h-full gap-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-tera-secondary">Tera</p>
            <h1 className="text-3xl font-semibold leading-tight text-tera-primary">Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            {autoSaving && (
              <div className="flex items-center gap-2 text-tera-secondary text-xs">
                <div className="w-2 h-2 bg-tera-neon rounded-full animate-pulse"></div>
                <span>Auto-saving...</span>
              </div>
            )}
            {!autoSaving && !loading && (
              <div className="flex items-center gap-2 text-tera-secondary text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-tera-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>All saved</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 rounded-[28px] bg-tera-panel border border-tera-border shadow-glow-md overflow-hidden flex">
          {/* Sidebar Navigation */}
          <div className="w-48 border-r border-tera-border p-6 bg-tera-muted/30">
            <nav className="space-y-2">
              {[
                { id: 'preferences', label: 'Preferences', icon: 'bell' },
                { id: 'privacy', label: 'Privacy & Data', icon: 'lock' },
                { id: 'account', label: 'Account', icon: 'db' },
              ].map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition text-sm ${activeTab === id
                    ? 'bg-tera-neon/20 text-tera-neon border border-tera-neon'
                    : 'text-tera-secondary hover:text-tera-primary border border-transparent'
                    }`}
                >
                  {icon === 'bell' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31M5.25 9c0-.966.784-1.75 1.75-1.75s1.75.784 1.75 1.75-1.784 1.75-1.75 1.75S5.25 9.966 5.25 9zm5 13c.966 0 1.75-.784 1.75-1.75s-.784-1.75-1.75-1.75-1.75.784-1.75 1.75.784 1.75 1.75 1.75z" />
                    </svg>
                  )}
                  {icon === 'lock' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0a3 3 0 015.495 2.47M12 9.75a3 3 0 00-5.495 2.47m0 0H.75m0 0v8.25A2.25 2.25 0 002.25 22.5h19.5A2.25 2.25 0 0024 20.25V12a2.25 2.25 0 00-2.25-2.25h-.75m0 0V6.375a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6.375V9.75M9 19.5h6" />
                    </svg>
                  )}
                  {icon === 'db' && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-4.022 4.125-9 4.125S2.25 8.653 2.25 6.375m17.5 0c0-2.278-4.022-4.125-9-4.125S2.25 4.097 2.25 6.375m17.5 12.75c0 2.278-4.022 4.125-9 4.125s-9-1.847-9-4.125m17.5-6V21m0 0a9 9 0 01-9 9m9-9a9 9 0 00-9-9m0 0V6.375m0 9.375a9 9 0 009-9" />
                    </svg>
                  )}
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${messageType === 'success'
                  ? 'bg-tera-primary text-tera-bg border border-tera-primary'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {message}
              </div>
            )}

            {loading ? (
              <div className="text-tera-secondary">Loading settings...</div>
            ) : (
              <div className="max-w-3xl">
                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-tera-primary mb-6">Preferences</h2>
                    </div>

                    {/* Notification Settings */}
                    <div className="space-y-4">
                      <div className="border-b border-tera-border pb-4">
                        <h3 className="text-sm uppercase tracking-wider text-tera-secondary mb-4">Notifications</h3>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-tera-primary font-medium">Push Notifications</p>
                              <p className="text-tera-secondary text-sm mt-1">Receive notifications about your activities</p>
                            </div>
                            <label className="relative inline-block w-12 h-6 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.notifications_enabled}
                                onChange={() => toggleSetting('notifications_enabled')}
                                className="sr-only peer"
                              />
                              <div className="w-full h-full bg-white/10 peer-checked:bg-tera-neon rounded-full transition peer-checked:shadow-lg peer-checked:shadow-tera-neon/50"></div>
                              <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-6"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-tera-primary font-medium">Email Notifications</p>
                              <p className="text-tera-secondary text-sm mt-1">Get email updates on important changes</p>
                            </div>
                            <label className="relative inline-block w-12 h-6 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.email_notifications}
                                onChange={() => toggleSetting('email_notifications')}
                                className="sr-only peer"
                              />
                              <div className="w-full h-full bg-white/10 peer-checked:bg-tera-neon rounded-full transition peer-checked:shadow-lg peer-checked:shadow-tera-neon/50"></div>
                              <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-6"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-tera-primary font-medium">Marketing Emails</p>
                              <p className="text-tera-secondary text-sm mt-1">Receive tips and feature announcements</p>
                            </div>
                            <label className="relative inline-block w-12 h-6 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.marketing_emails}
                                onChange={() => toggleSetting('marketing_emails')}
                                className="sr-only peer"
                              />
                              <div className="w-full h-full bg-white/10 peer-checked:bg-tera-neon rounded-full transition peer-checked:shadow-lg peer-checked:shadow-tera-neon/50"></div>
                              <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-6"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Appearance Settings */}
                    <div className="space-y-4">
                      <div className="border-b border-tera-border pb-4">
                        <h3 className="text-sm uppercase tracking-wider text-tera-secondary mb-4">Appearance</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-tera-primary font-medium">Dark Mode</p>
                            <p className="text-tera-secondary text-sm mt-1">Use dark theme throughout the app</p>
                          </div>
                          <label className="relative inline-block w-12 h-6 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.dark_mode}
                              onChange={() => toggleSetting('dark_mode')}
                              className="sr-only peer"
                            />
                            <div className="w-full h-full bg-white/10 peer-checked:bg-tera-neon rounded-full transition peer-checked:shadow-lg peer-checked:shadow-tera-neon/50"></div>
                            <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-6"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy & Data Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-tera-primary mb-6">Privacy & Data</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="border border-tera-border rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-tera-neon mt-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-4.022 4.125-9 4.125S2.25 8.653 2.25 6.375m17.5 0c0-2.278-4.022-4.125-9-4.125S2.25 4.097 2.25 6.375m17.5 12.75c0 2.278-4.022 4.125-9 4.125s-9-1.847-9-4.125m17.5-6V21m0 0a9 9 0 01-9 9m9-9a9 9 0 00-9-9m0 0V6.375m0 9.375a9 9 0 009-9" />
                          </svg>
                          <div className="flex-1">
                            <h3 className="font-semibold text-tera-primary mb-2">Data Retention</h3>
                            <p className="text-tera-secondary text-sm mb-4">How long we keep your deleted data in our system</p>
                            <div className="flex items-center gap-4">
                              <select
                                value={settings.data_retention_days}
                                onChange={(e) => updateSetting('data_retention_days', parseInt(e.target.value))}
                                className="rounded-lg bg-tera-muted border border-tera-border px-4 py-2 text-tera-primary text-sm focus:outline-none focus:border-tera-neon"
                              >
                                <option value={7}>7 days</option>
                                <option value={30}>30 days</option>
                                <option value={90}>90 days</option>
                                <option value={180}>6 months</option>
                                <option value={365}>1 year</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-tera-border rounded-lg p-6 bg-tera-muted/30">
                        <h3 className="font-semibold text-tera-primary mb-4">Privacy Policy</h3>
                        <p className="text-tera-secondary text-sm mb-4">
                          We take your privacy seriously. Read our detailed privacy policy to understand how we handle your data.
                        </p>
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-tera-border text-tera-primary/80 hover:text-tera-primary hover:border-tera-primary/40 transition text-sm"
                        >
                          View Privacy Policy →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold text-tera-primary mb-6">Account</h2>
                    </div>

                    <div className="space-y-4">
                      {/* Account Info */}
                      <div className="border border-tera-border rounded-lg p-6">
                        <h3 className="font-semibold text-tera-primary mb-4">Account Information</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-tera-secondary mb-2">Email Address</p>
                            <p className="text-tera-primary font-medium">{user?.email}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider text-tera-secondary mb-2">Account Created</p>
                            <p className="text-tera-primary font-medium">
                              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 border border-tera-border rounded-lg p-6 hover:bg-tera-muted/50 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-tera-neon">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
                        </svg>
                        <div className="text-left">
                          <p className="font-semibold text-tera-primary">Sign Out</p>
                          <p className="text-tera-secondary text-sm">Sign out from your account on this device</p>
                        </div>
                      </button>

                      {/* Delete Account */}
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center gap-3 border border-red-500/20 bg-red-500/5 rounded-lg p-6 hover:bg-red-500/10 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-400">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.82 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        <div className="text-left">
                          <p className="font-semibold text-red-400">Delete Account</p>
                          <p className="text-red-300/60 text-sm">Permanently delete your account and all data</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
>>>>>>> ed9d5f91f36688c26cec283eda62004420da3485
        </div>
      </div>
    </div>
  )
}
