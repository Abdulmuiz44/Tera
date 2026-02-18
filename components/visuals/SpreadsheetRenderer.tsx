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
        const errorMsg = result.error || ''
        if (
          errorMsg.includes('not authenticated') ||
          errorMsg.includes('authorize') ||
          errorMsg.includes('authorized') ||
          errorMsg.includes('invalid_grant') ||
          errorMsg.includes('expired')
        ) {
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

        {/* Data Table (Read-only) */}
        <div className="overflow-x-auto rounded-lg border border-tera-border bg-tera-panel/50">
          <table className="w-full text-sm">
            <tbody>
              {(config.data || []).map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx === 0 ? 'bg-tera-muted border-b border-tera-border' : 'border-b border-tera-border last:border-0'}>
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
        </div>

        <p className="text-xs text-tera-secondary italic">
          * Google Sheets integration is currently disabled.
        </p>
      </div>
    </div>
  )
}
