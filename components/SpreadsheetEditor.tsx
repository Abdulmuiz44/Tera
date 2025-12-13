'use client'

import { useState, useCallback } from 'react'
import { exportAndDownload, EXPORT_FORMATS, estimateFileSize } from '@/lib/export-spreadsheet'
import type { EditOperation } from '@/lib/spreadsheet-operations'
import {
  trackCellUpdate,
  trackRowAdd,
  trackRowDelete,
  trackColumnAdd,
  trackColumnDelete,
  updateSpreadsheetData
} from '@/lib/spreadsheet-edit-tracking'

interface SpreadsheetEditorProps {
  spreadsheetId: string
  title: string
  data: any[][]
  userId?: string
  onDataChange?: (newData: any[][]) => void
  onSync?: () => Promise<void>
}

type EditMode = 'view' | 'edit' | 'add-row' | 'add-column'

export default function SpreadsheetEditor({
  spreadsheetId,
  title,
  data: initialData,
  userId,
  onDataChange,
  onSync
}: SpreadsheetEditorProps) {
  const [data, setData] = useState(initialData)
  const [editMode, setEditMode] = useState<EditMode>('view')
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [cellEditValue, setCellEditValue] = useState('')
  const [newRowData, setNewRowData] = useState<string[]>([])
  const [newColumnName, setNewColumnName] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // Edit cell handler
  const handleCellClick = (rowIdx: number, colIdx: number) => {
    if (editMode !== 'view') return
    setSelectedCell({ row: rowIdx, col: colIdx })
    setCellEditValue(String(data[rowIdx][colIdx] ?? ''))
    setEditMode('edit')
  }

  // Save cell edit
  const handleSaveCell = async () => {
    if (!selectedCell) return

    const oldValue = data[selectedCell.row][selectedCell.col]
    const newData = data.map((row, rIdx) =>
      rIdx === selectedCell.row
        ? row.map((cell, cIdx) => (cIdx === selectedCell.col ? cellEditValue : cell))
        : row
    )

    setData(newData)
    setEditMode('view')
    setSelectedCell(null)

    // Track and sync
    if (userId) {
      try {
        // Log to edit history
        await trackCellUpdate(
          userId,
          spreadsheetId,
          selectedCell.row,
          selectedCell.col,
          oldValue,
          cellEditValue
        )

        // Update current data in spreadsheet
        await updateSpreadsheetData(userId, spreadsheetId, newData)

        // Send to backend for Google Sheets sync
        const response = await fetch('/api/sheets/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            spreadsheetId,
            operations: [
              {
                type: 'update_cell',
                rowIndex: selectedCell.row,
                columnIndex: selectedCell.col,
                cellValue: cellEditValue
              }
            ],
            syncToGoogle: false
          })
        })
        if (!response.ok) {
          console.error('Failed to sync cell update')
        }
        showMessage('success', 'Cell updated')
        onDataChange?.(newData)
      } catch (error) {
        showMessage('error', 'Failed to update cell')
      }
    }
  }

  // Add row handler
  const handleAddRow = async () => {
    const rowToAdd = newRowData.length === 0
      ? Array(data[0]?.length || 0).fill('')
      : newRowData

    const newData = [...data, rowToAdd]
    setData(newData)
    setEditMode('view')
    setNewRowData([])

    // Track and sync
    if (userId) {
      try {
        // Log to edit history
        await trackRowAdd(userId, spreadsheetId, rowToAdd, newData.length - 1)

        // Update current data in spreadsheet
        await updateSpreadsheetData(userId, spreadsheetId, newData)

        // Send to backend for Google Sheets sync
        const response = await fetch('/api/sheets/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            spreadsheetId,
            operations: [
              {
                type: 'add_row',
                rowData: rowToAdd
              }
            ],
            syncToGoogle: false
          })
        })
        if (!response.ok) {
          console.error('Failed to sync row addition')
        }
        showMessage('success', 'Row added')
        onDataChange?.(newData)
      } catch (error) {
        showMessage('error', 'Failed to add row')
      }
    }
  }

  // Add column handler
  const handleAddColumn = async () => {
    if (!newColumnName) {
      showMessage('error', 'Column name required')
      return
    }

    const columnIndex = data[0]?.length || 0
    const newData = data.map((row, rowIdx) => [
      ...row,
      rowIdx === 0 ? newColumnName : ''
    ])

    setData(newData)
    setEditMode('view')
    setNewColumnName('')

    // Track and sync
    if (userId) {
      try {
        // Log to edit history
        await trackColumnAdd(userId, spreadsheetId, newColumnName, columnIndex)

        // Update current data in spreadsheet
        await updateSpreadsheetData(userId, spreadsheetId, newData)

        // Send to backend for Google Sheets sync
        const response = await fetch('/api/sheets/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            spreadsheetId,
            operations: [
              {
                type: 'add_column',
                columnName: newColumnName,
                columnIndex
              }
            ],
            syncToGoogle: false
          })
        })
        if (!response.ok) {
          console.error('Failed to sync column addition')
        }
        showMessage('success', 'Column added')
        onDataChange?.(newData)
      } catch (error) {
        showMessage('error', 'Failed to add column')
      }
    }
  }

  // Remove row
  const handleRemoveRow = async (rowIdx: number) => {
    if (rowIdx === 0) {
      showMessage('error', 'Cannot delete header row')
      return
    }

    const deletedRow = data[rowIdx]
    const newData = data.filter((_, idx) => idx !== rowIdx)
    setData(newData)

    if (userId) {
      try {
        // Log to edit history
        await trackRowDelete(userId, spreadsheetId, rowIdx, deletedRow)

        // Update current data in spreadsheet
        await updateSpreadsheetData(userId, spreadsheetId, newData)

        // Send to backend for Google Sheets sync
        const response = await fetch('/api/sheets/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            spreadsheetId,
            operations: [{ type: 'remove_row', rowIndex: rowIdx }],
            syncToGoogle: false
          })
        })
        if (!response.ok) {
          console.error('Failed to sync row deletion')
        }
        showMessage('success', 'Row deleted')
        onDataChange?.(newData)
      } catch (error) {
        showMessage('error', 'Failed to delete row')
      }
    }
  }

  // Sync to Google Sheets
  const handleSync = async () => {
    if (!userId) {
      showMessage('error', 'Must be logged in to sync')
      return
    }

    setSyncing(true)
    try {
      // Send all current data to Google
      const response = await fetch('/api/sheets/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          spreadsheetId,
          operations: [], // No operations, just sync current data
          syncToGoogle: true
        })
      })
      if (!response.ok) {
        throw new Error('Failed to sync spreadsheet')
      }

      showMessage('success', 'Synced to Google Sheets!')
      onSync?.()
    } catch (error) {
      showMessage('error', 'Failed to sync')
    } finally {
      setSyncing(false)
    }
  }

  // Export handler
  const handleExport = (format: string) => {
    setExporting(true)
    try {
      exportAndDownload(data, format as any, title)
      showMessage('success', `Exported as ${format.toUpperCase()}`)
    } catch (error) {
      showMessage('error', 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-tera-primary">{title}</h3>
          <p className="text-xs text-tera-secondary mt-1">
            {data.length - 1} rows × {data[0]?.length || 0} columns
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-3 text-sm border ${message.type === 'error'
              ? 'bg-red-500/10 text-red-500 border-red-500/20'
              : 'bg-tera-primary text-tera-bg border-tera-primary'
            }`}
        >
          {message.text}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-tera-border bg-tera-panel">
        <table className="w-full text-sm">
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={rowIdx === 0 ? 'bg-tera-muted border-b border-tera-border' : 'border-b border-tera-border'}
              >
                {/* Row number */}
                <td className="px-2 py-2 text-tera-secondary text-xs bg-tera-muted w-8 text-center border-r border-tera-border">
                  {rowIdx}
                </td>

                {/* Cells */}
                {row.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    onClick={() => rowIdx > 0 && handleCellClick(rowIdx, colIdx)}
                    className={`px-4 py-2 text-tera-primary cursor-pointer transition border-r border-tera-border last:border-r-0 ${rowIdx === 0 ? 'font-semibold' : ''
                      } ${selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                        ? 'bg-tera-muted/50 ring-2 ring-inset ring-tera-primary'
                        : 'hover:bg-tera-muted/30'
                      }`}
                  >
                    {selectedCell?.row === rowIdx && selectedCell?.col === colIdx ? (
                      <input
                        autoFocus
                        value={cellEditValue}
                        onChange={(e) => setCellEditValue(e.target.value)}
                        onBlur={handleSaveCell}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveCell()
                          if (e.key === 'Escape') setEditMode('view')
                        }}
                        className="w-full bg-transparent text-tera-primary outline-none"
                      />
                    ) : (
                      String(cell ?? '')
                    )}
                  </td>
                ))}

                {/* Delete row button */}
                {rowIdx > 0 && (
                  <td className="px-2 py-2 w-8 text-center">
                    <button
                      onClick={() => handleRemoveRow(rowIdx)}
                      className="text-tera-secondary hover:text-red-500 text-xs transition"
                      title="Delete row"
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setEditMode(editMode === 'add-row' ? 'view' : 'add-row')}
          className="rounded-full bg-white border border-tera-border px-4 py-2 text-xs font-bold text-black transition hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900"
        >
          + Row
        </button>

        <button
          onClick={() => setEditMode(editMode === 'add-column' ? 'view' : 'add-column')}
          className="rounded-full bg-white border border-tera-border px-4 py-2 text-xs font-bold text-black transition hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900"
        >
          + Column
        </button>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-full bg-tera-primary px-4 py-2 text-xs font-bold text-tera-bg transition hover:opacity-90 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync to Google'}
        </button>

        {/* Export dropdown */}
        <div className="relative group">
          <button className="rounded-full border border-tera-border px-4 py-2 text-xs font-bold text-tera-primary transition hover:bg-tera-muted">
            ↓ Export
          </button>
          <div className="absolute right-0 top-full hidden group-hover:block bg-tera-panel border border-tera-border rounded-lg overflow-hidden z-10 min-w-max shadow-lg">
            {EXPORT_FORMATS.map(fmt => (
              <button
                key={fmt.id}
                onClick={() => handleExport(fmt.id)}
                disabled={exporting}
                className="block w-full text-left px-4 py-2 text-xs text-tera-primary hover:bg-tera-muted transition disabled:opacity-50"
              >
                {fmt.icon} {fmt.label}
              </button>
            ))}
            <div className="px-4 py-2 text-xs text-tera-secondary border-t border-tera-border">
              ~{estimateFileSize(data)}
            </div>
          </div>
        </div>
      </div>

      {/* Add row form */}
      {editMode === 'add-row' && (
        <div className="rounded-lg bg-tera-muted border border-tera-border p-4 space-y-3">
          <h4 className="text-sm font-semibold text-tera-primary">Add New Row</h4>
          <div className="space-y-2">
            {(data[0] || []).map((header, idx) => (
              <input
                key={idx}
                placeholder={String(header)}
                value={newRowData[idx] ?? ''}
                onChange={(e) => {
                  const updated = [...newRowData]
                  updated[idx] = e.target.value
                  setNewRowData(updated)
                }}
                className="w-full rounded-lg bg-tera-panel border border-tera-border px-3 py-2 text-sm text-tera-primary placeholder-tera-secondary outline-none focus:border-tera-primary"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddRow}
              className="rounded-full bg-tera-primary px-3 py-1 text-xs font-bold text-tera-bg hover:opacity-90"
            >
              Add Row
            </button>
            <button
              onClick={() => setEditMode('view')}
              className="rounded-full border border-tera-border px-3 py-1 text-xs font-bold text-tera-primary hover:bg-tera-panel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add column form */}
      {editMode === 'add-column' && (
        <div className="rounded-lg bg-tera-muted border border-tera-border p-4 space-y-3">
          <h4 className="text-sm font-semibold text-tera-primary">Add New Column</h4>
          <input
            placeholder="Column name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="w-full rounded-lg bg-tera-panel border border-tera-border px-3 py-2 text-sm text-tera-primary placeholder-tera-secondary outline-none focus:border-tera-primary"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddColumn}
              className="rounded-full bg-tera-primary px-3 py-1 text-xs font-bold text-tera-bg hover:opacity-90"
            >
              Add Column
            </button>
            <button
              onClick={() => setEditMode('view')}
              className="rounded-full border border-tera-border px-3 py-1 text-xs font-bold text-tera-primary hover:bg-tera-panel"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
