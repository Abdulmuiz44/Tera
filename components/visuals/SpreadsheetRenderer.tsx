'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const SpreadsheetEditor = dynamic(() => import('../SpreadsheetEditor'), {
  ssr: false,
  loading: () => <div className="text-white/50 text-sm">Loading editor...</div>
})
const SpreadsheetEditHistory = dynamic(() => import('../SpreadsheetEditHistory'), {
  ssr: false,
  loading: () => <div className="text-white/50 text-sm">Loading history...</div>
})

interface SpreadsheetConfig {
  action: string
  title: string
  sheetTitle?: string
  data: any[][]
  chartType?: string
}

interface SpreadsheetStatus {
  state: 'idle' | 'creating' | 'success' | 'error'
  message?: string
  spreadsheetUrl?: string
  spreadsheetId?: string
}

export default function SpreadsheetRenderer({ config, userId }: { config: SpreadsheetConfig; userId?: string }) {
  const [status, setStatus] = useState<SpreadsheetStatus>({ state: 'idle' })
  const [needsAuth, setNeedsAuth] = useState(false)
  const [spreadsheetData, setSpreadsheetData] = useState(config.data)
  const [showHistory, setShowHistory] = useState(false)

  const handleAuthorizeGoogle = async () => {
    if (!userId) {
      setStatus({ state: 'error', message: 'You must be logged in' })
      return
    }

    try {
      const response = await fetch('/api/auth/google/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to generate auth URL')
      }

      const result = await response.json()

      // Redirect to Google OAuth
      window.location.href = result.authUrl
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authorization failed'
      setStatus({ state: 'error', message })
    }
  }

  const handleCreateSpreadsheet = async () => {
    if (!userId) {
      setStatus({ state: 'error', message: 'You must be logged in to create spreadsheets' })
      return
    }

    setStatus({ state: 'creating', message: 'Creating your spreadsheet...' })

    try {
      const response = await fetch('/api/sheets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: config.title,
          sheetTitle: config.sheetTitle || 'Sheet1',
          data: config.data
        })
      })

      if (!response.ok) {
        const result = await response.json()
        // Check if it's an auth error
        if (result.error?.includes('not authenticated') || result.error?.includes('authorize')) {
          setNeedsAuth(true)
          setStatus({ state: 'error', message: 'Please authorize Google Sheets access first' })
          return
        }
        throw new Error(result.error || 'Failed to create spreadsheet')
      }

      const result = await response.json()

      setStatus({
        state: 'success',
        message: 'Spreadsheet created successfully!',
        spreadsheetUrl: result.spreadsheet.url,
        spreadsheetId: result.spreadsheet.id
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setStatus({ state: 'error', message })
    }
  }

  // Show editor if spreadsheet is created
  if (status.state === 'success' && status.spreadsheetId) {
    return (
      <div className="w-full rounded-2xl bg-tera-panel border border-white/10 p-6 my-4 space-y-6">
        {/* Editor */}
        <SpreadsheetEditor
          spreadsheetId={status.spreadsheetId}
          title={config.title}
          data={spreadsheetData}
          userId={userId}
          onDataChange={setSpreadsheetData}
        />

        {/* Toggle History */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-blue-400 hover:text-blue-300 transition"
        >
          {showHistory ? 'Hide' : 'Show'} Edit History
        </button>

        {/* Edit History */}
        {showHistory && (
          <SpreadsheetEditHistory
            spreadsheetId={status.spreadsheetId}
            limit={20}
          />
        )}

        {/* Link to Google Sheets */}
        {status.spreadsheetUrl && (
          <a
            href={status.spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-tera-primary px-4 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-tera-bg transition hover:opacity-90"
          >
            Open in Google Sheets →
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl bg-tera-panel border border-tera-border p-6 my-4">
      <div className="space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-lg font-semibold text-tera-primary">{config.title}</h3>
          {config.chartType && (
            <p className="text-sm text-tera-secondary mt-1">Chart Type: {config.chartType}</p>
          )}
        </div>

        {/* Data Preview */}
        <div className="overflow-x-auto rounded-lg border border-tera-border">
          <table className="w-full text-sm">
            <tbody>
              {(config.data || []).slice(0, 6).map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx === 0 ? 'bg-tera-muted' : 'border-t border-tera-border'}>
                  {row.map((cell, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-2 text-tera-primary ${rowIdx === 0 ? 'font-semibold' : ''}`}
                    >
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {config.data.length > 6 && (
            <p className="text-xs text-tera-secondary mt-2">... and {config.data.length - 6} more rows</p>
          )}
        </div>

        {/* Status Message */}
        {status.state !== 'idle' && (
          <div
            className={`rounded-lg p-3 text-sm border ${status.state === 'error'
              ? 'bg-red-500/10 text-red-500 border-red-500/20'
              : 'bg-tera-primary text-tera-bg border-tera-primary'
              }`}
          >
            {status.message}
          </div>
        )}

        {/* Action Buttons */}
        {needsAuth || (status.state === 'error' && status.message?.includes('authorize')) ? (
          <button
            onClick={handleAuthorizeGoogle}
            className="w-full rounded-full border border-tera-border px-4 py-2 text-sm font-semibold text-tera-primary transition hover:bg-tera-muted"
          >
            Authorize Google Sheets
          </button>
        ) : status.state === 'creating' ? (
          <button
            disabled
            className="w-full rounded-full bg-tera-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-tera-bg transition opacity-50 cursor-not-allowed"
          >
            Creating...
          </button>
        ) : status.state === 'idle' || status.state === 'error' ? (
          <button
            onClick={handleCreateSpreadsheet}
            className="w-full rounded-full bg-tera-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-tera-bg transition hover:opacity-90"
          >
            Create Spreadsheet
          </button>
        ) : null}
      </div>
    </div>
  )
}
