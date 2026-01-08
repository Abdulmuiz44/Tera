'use client'

import { useAuth } from '@/components/AuthProvider'
import { useEffect, useState } from 'react'
import { useState as useClipboard } from 'react'

interface ApiKey {
  id: string
  maskedKey: string
  suffix: string
  createdAt: string
  lastUsedAt: string | null
}

export default function ApiKeysPage() {
  const { user } = useAuth()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showFullKey, setShowFullKey] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchApiKeys()
    }
  }, [user?.id])

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/plus/api-keys?userId=${user?.id}`)
      if (!res.ok) throw new Error('Failed to fetch API keys')
      const data = await res.json()
      setKeys(data.keys || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const generateApiKey = async () => {
    try {
      setGenerating(true)
      setError('')
      setSuccess('')

      const res = await fetch('/api/plus/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate API key')
      }

      const data = await res.json()
      setSuccess(`API key generated! Save it now: ${data.fullKey}`)
      setShowFullKey(data.fullKey)
      await fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate API key')
    } finally {
      setGenerating(false)
    }
  }

  const revokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return

    try {
      const res = await fetch(`/api/plus/api-keys?keyId=${keyId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to revoke API key')
      await fetchApiKeys()
      setSuccess('API key revoked successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(''), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-tera-primary mb-2">API Keys</h2>
        <p className="text-tera-secondary">Generate and manage API keys for programmatic access</p>
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

      {/* Generate Button */}
      <div className="bg-tera-panel border border-tera-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-tera-primary mb-1">Generate New API Key</h3>
            <p className="text-tera-secondary text-sm">Create a new API key for your application</p>
          </div>
          <button
            onClick={generateApiKey}
            disabled={generating}
            className="px-6 py-2.5 bg-tera-neon text-tera-bg rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 whitespace-nowrap"
          >
            {generating ? 'Generating...' : 'Generate Key'}
          </button>
        </div>
      </div>

      {/* Full Key Display (only shown after generation) */}
      {showFullKey && (
        <div className="bg-tera-neon/10 border border-tera-neon/50 rounded-lg p-6">
          <h4 className="font-semibold text-tera-neon mb-2">⚠️ Save Your API Key</h4>
          <p className="text-tera-secondary text-sm mb-4">This is the only time you'll see the full key. Save it somewhere safe!</p>
          <div className="bg-tera-muted p-4 rounded border border-tera-border flex items-center justify-between">
            <code className="text-tera-primary font-mono text-sm break-all">{showFullKey}</code>
            <button
              onClick={() => copyToClipboard(showFullKey)}
              className="ml-4 px-3 py-1.5 bg-tera-neon text-tera-bg rounded text-sm font-medium whitespace-nowrap hover:opacity-90 transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-tera-panel border border-tera-border rounded-lg overflow-hidden">
        <div className="p-6 border-b border-tera-border">
          <h3 className="text-lg font-semibold text-tera-primary">Your API Keys ({keys.length})</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-tera-neon/20 border-t-tera-neon rounded-full animate-spin mb-4"></div>
            <p className="text-tera-secondary">Loading API keys...</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center text-tera-secondary">
            No API keys yet. Generate one to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tera-muted/50 border-b border-tera-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tera-primary">API Key</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tera-primary">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tera-primary">Last Used</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-tera-primary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tera-border">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-tera-muted/20 transition">
                    <td className="px-6 py-4">
                      <code className="bg-tera-muted px-3 py-1 rounded text-sm text-tera-primary font-mono">
                        {key.maskedKey}...{key.suffix}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-tera-secondary text-sm">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-tera-secondary text-sm">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => revokeKey(key.id)}
                        className="text-red-500 hover:text-red-400 transition text-sm font-medium"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documentation */}
      <div className="bg-tera-primary/5 border border-tera-border rounded-lg p-6">
        <h4 className="font-semibold text-tera-primary mb-4">API Documentation</h4>
        <div className="space-y-4 text-sm text-tera-secondary">
          <div>
            <p className="font-medium text-tera-primary mb-1">Authentication</p>
            <p>Include your API key in the Authorization header:</p>
            <code className="block bg-tera-muted p-2 rounded mt-1 text-tera-primary">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <div>
            <p className="font-medium text-tera-primary mb-1">Base URL</p>
            <code className="block bg-tera-muted p-2 rounded mt-1 text-tera-primary">
              https://api.tera.ai/v1
            </code>
          </div>
          <div>
            <p className="font-medium text-tera-primary mb-1">Endpoints</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code className="text-tera-primary">POST /chat</code> - Generate AI response</li>
              <li><code className="text-tera-primary">GET /usage</code> - Get usage statistics</li>
              <li><code className="text-tera-primary">POST /upload</code> - Upload files for analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
