'use client'

import { useAuth } from '@/components/AuthProvider'
import { useState } from 'react'

interface TrainingJob {
  id: string
  name: string
  status: 'pending' | 'training' | 'completed' | 'failed'
  progress: number
  createdAt: string
  completedAt?: string
}

export default function TrainingPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<TrainingJob[]>([])
  const [loading, setLoading] = useState(false)
  const [training, setTraining] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    modelName: '',
    dataUrl: '',
    epochs: 3,
    description: ''
  })

  const handleSubmitTraining = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.modelName.trim() || !formData.dataUrl.trim()) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setTraining(true)
      setError('')
      setSuccess('')

      const res = await fetch('/api/plus/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...formData
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to start training')
      }

      const data = await res.json()
      setSuccess(`Training job "${data.name}" started! Check back for updates.`)
      setFormData({ modelName: '', dataUrl: '', epochs: 3, description: '' })
      await loadJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start training')
    } finally {
      setTraining(false)
    }
  }

  const loadJobs = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/plus/training?userId=${user?.id}`)
      if (!res.ok) throw new Error('Failed to load training jobs')
      const data = await res.json()
      setJobs(data.jobs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10'
      case 'training':
        return 'text-tera-neon bg-tera-neon/10'
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'failed':
        return 'text-red-500 bg-red-500/10'
      default:
        return 'text-tera-secondary'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-tera-primary mb-2">Custom AI Training</h2>
        <p className="text-tera-secondary">Fine-tune AI models with your own data</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-500">
          {success}
        </div>
      )}

      {/* Training Form */}
      <div className="bg-tera-panel border border-tera-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-tera-primary mb-4">Start New Training Job</h3>
        <form onSubmit={handleSubmitTraining} className="space-y-4">
          <div>
            <label className="block text-tera-primary text-sm font-medium mb-2">Model Name *</label>
            <input
              type="text"
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              placeholder="e.g., my-custom-teacher-model"
              className="w-full px-4 py-2.5 bg-tera-muted border border-tera-border rounded-lg text-tera-primary placeholder-tera-secondary focus:outline-none focus:border-tera-neon"
              disabled={training}
            />
          </div>

          <div>
            <label className="block text-tera-primary text-sm font-medium mb-2">Data URL *</label>
            <input
              type="url"
              value={formData.dataUrl}
              onChange={(e) => setFormData({ ...formData, dataUrl: e.target.value })}
              placeholder="https://example.com/training-data.json"
              className="w-full px-4 py-2.5 bg-tera-muted border border-tera-border rounded-lg text-tera-primary placeholder-tera-secondary focus:outline-none focus:border-tera-neon"
              disabled={training}
            />
            <p className="text-tera-secondary text-xs mt-1">JSON file with training examples</p>
          </div>

          <div>
            <label className="block text-tera-primary text-sm font-medium mb-2">Training Epochs</label>
            <input
              type="number"
              value={formData.epochs}
              onChange={(e) => setFormData({ ...formData, epochs: parseInt(e.target.value) })}
              min="1"
              max="10"
              className="w-full px-4 py-2.5 bg-tera-muted border border-tera-border rounded-lg text-tera-primary focus:outline-none focus:border-tera-neon"
              disabled={training}
            />
            <p className="text-tera-secondary text-xs mt-1">Number of training iterations (1-10)</p>
          </div>

          <div>
            <label className="block text-tera-primary text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this model for?"
              rows={3}
              className="w-full px-4 py-2.5 bg-tera-muted border border-tera-border rounded-lg text-tera-primary placeholder-tera-secondary focus:outline-none focus:border-tera-neon resize-none"
              disabled={training}
            />
          </div>

          <button
            type="submit"
            disabled={training}
            className="w-full px-6 py-2.5 bg-tera-neon text-tera-bg rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
          >
            {training ? 'Starting Training...' : 'Start Training'}
          </button>
        </form>
      </div>

      {/* Training Jobs */}
      <div className="bg-tera-panel border border-tera-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-tera-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-tera-primary">Training Jobs</h3>
          <button
            onClick={loadJobs}
            disabled={loading}
            className="px-4 py-1.5 bg-tera-muted hover:bg-tera-muted/80 rounded text-sm font-medium text-tera-primary disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-tera-neon/20 border-t-tera-neon rounded-full animate-spin mb-4"></div>
            <p className="text-tera-secondary">Loading training jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-tera-secondary">
            No training jobs yet. Start one to get began!
          </div>
        ) : (
          <div className="divide-y divide-tera-border">
            {jobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-tera-muted/10 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-tera-primary">{job.name}</h4>
                    <p className="text-tera-secondary text-sm">Created {new Date(job.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-tera-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-tera-neon to-tera-primary rounded-full h-2 transition-all duration-500"
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
                <p className="text-tera-secondary text-xs mt-2">{job.progress}% complete</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-tera-primary/5 border border-tera-border rounded-lg p-6">
        <h4 className="font-semibold text-tera-primary mb-3">How Custom Training Works</h4>
        <ol className="space-y-2 text-tera-secondary text-sm list-decimal list-inside">
          <li>Upload your training data (JSON format with examples)</li>
          <li>Configure training parameters (epochs, batch size, learning rate)</li>
          <li>Start the training job (typically takes 30 minutes to 2 hours)</li>
          <li>Monitor progress in real-time with live updates</li>
          <li>Once complete, deploy your custom model immediately</li>
          <li>Use it alongside standard Tera models</li>
        </ol>
        <p className="text-tera-secondary text-xs mt-4">Note: Training data must follow the specified JSON schema for best results.</p>
      </div>
    </div>
  )
}
