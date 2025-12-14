'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import { teacherTools, studentTools, learnerTools, slugify } from '@/lib/tools-data'

export default function ToolsPage() {
  const { user } = useAuth()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'learners'>('teachers')

  const allTools = [...teacherTools, ...studentTools, ...learnerTools]
  
  const activeTools = 
    activeTab === 'teachers' ? teacherTools :
    activeTab === 'students' ? studentTools :
    learnerTools

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Tools</h1>

          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2 rounded font-medium transition-all ${
                activeTab === 'teachers'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              For Teachers
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded font-medium transition-all ${
                activeTab === 'students'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              For Students
            </button>
            <button
              onClick={() => setActiveTab('learners')}
              className={`px-4 py-2 rounded font-medium transition-all ${
                activeTab === 'learners'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              For Everyone
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTools.map((tool) => (
              <Link
                key={tool.name}
                href={`/new?tool=${slugify(tool.name)}`}
                className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg hover:border-black dark:hover:border-white transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-black dark:text-white">{tool.name}</h3>
                  <span className="text-2xl">{tool.icon}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
