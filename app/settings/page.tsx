'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'

type TeacherProfile = {
  school: string
  grade_levels: string[]
}

type TeachingStyle = {
  style: string
}

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [school, setSchool] = useState('')
  const [gradeLevels, setGradeLevels] = useState<string[]>([])
  const [style, setStyle] = useState('')
  const [message, setMessage] = useState('')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSettings()
    }
  }, [user])

  const fetchSettings = async () => {
    setLoading(true)

    // Fetch profile
    const { data: profileData } = await supabase
      .from('teacher_profiles')
      .select('school, grade_levels')
      .eq('user_id', user?.id)
      .single()

    if (profileData) {
      setSchool(profileData.school || '')
      setGradeLevels(profileData.grade_levels || [])
    }

    // Fetch style
    const { data: styleData } = await supabase
      .from('teaching_styles')
      .select('style')
      .eq('user_id', user?.id)
      .single()

    if (styleData) {
      setStyle(styleData.style || '')
    }

    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage('')

    // Upsert profile
    const { error: profileError } = await supabase
      .from('teacher_profiles')
      .upsert({ user_id: user.id, school, grade_levels: gradeLevels }, { onConflict: 'user_id' })

    // Upsert style
    const { error: styleError } = await supabase
      .from('teaching_styles')
      .upsert({ user_id: user.id, style }, { onConflict: 'user_id' })

    if (profileError || styleError) {
      console.error('Error saving settings:', profileError, styleError)
      setMessage('Failed to save settings.')
    } else {
      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  const toggleGradeLevel = (level: string) => {
    if (gradeLevels.includes(level)) {
      setGradeLevels(gradeLevels.filter(l => l !== level))
    } else {
      setGradeLevels([...gradeLevels, level])
    }
  }

  const availableGrades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Higher Ed']

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">Tera</p>
              <h1 className="text-3xl font-semibold leading-tight text-white">Settings</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-tera-neon disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </header>

          <div className="flex-1 rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-6">Configure your workspace</h2>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {message}
              </div>
            )}

            {loading ? (
              <p className="text-white/60">Loading settings...</p>
            ) : (
              <div className="space-y-8 max-w-2xl">
                {/* School Section */}
                <div className="space-y-3">
                  <label className="text-sm uppercase tracking-wider text-white/60">School / Institution</label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Lincoln High School"
                    className="w-full rounded-lg bg-tera-muted border border-white/10 px-4 py-3 text-white focus:border-tera-neon focus:outline-none"
                  />
                </div>

                {/* Grade Levels Section */}
                <div className="space-y-3">
                  <label className="text-sm uppercase tracking-wider text-white/60">Grade Levels</label>
                  <div className="flex flex-wrap gap-2">
                    {availableGrades.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => toggleGradeLevel(grade)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${gradeLevels.includes(grade)
                          ? 'bg-tera-neon/20 border-tera-neon text-white'
                          : 'bg-transparent border-white/10 text-white/60 hover:border-white/30'
                          }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teaching Style Section */}
                <div className="space-y-3">
                  <label className="text-sm uppercase tracking-wider text-white/60">Teaching Style / Philosophy</label>
                  <textarea
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="Describe your teaching style (e.g. inquiry-based, project-based learning, direct instruction...)"
                    className="w-full rounded-lg bg-tera-muted border border-white/10 px-4 py-3 text-white focus:border-tera-neon focus:outline-none h-32 resize-none"
                  />
                  <p className="text-xs text-white/40">Tera uses this to personalize lesson plans and suggestions.</p>
                </div>

                {/* Account Info (Read-only) */}
                <div className="pt-8 border-t border-white/10 space-y-3">
                  <label className="text-sm uppercase tracking-wider text-white/60">Account Email</label>
                  <div className="w-full rounded-lg bg-white/5 border border-white/5 px-4 py-3 text-white/40 cursor-not-allowed">
                    {user?.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
