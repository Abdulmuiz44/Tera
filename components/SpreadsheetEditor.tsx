'use client'

import { useState, useCallback } from 'react'
import { exportAndDownload, EXPORT_FORMATS, estimateFileSize } from '@/lib/export-spreadsheet'
import type { EditOperation } from '@/lib/spreadsheet-operations'

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

    const newData = data.map((row, rIdx) =>
      rIdx === selectedCell.row
        ? row.map((cell, cIdx) => (cIdx === selectedCell.col ? cellEditValue : cell))
        : row
    )

    setData(newData)
    setEditMode('view')
    setSelectedCell(null)

    // Send to backend
    if (userId) {
      try {
        await fetch('/api/sheets/edit', {
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

    // Send to backend
    if (userId) {
      try {
        await fetch('/api/sheets/edit', {
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

    const newData = data.map((row, rowIdx) => [
      ...row,
      rowIdx === 0 ? newColumnName : ''
    ])

    setData(newData)
    setEditMode('view')
    setNewColumnName('')

    // Send to backend
    if (userId) {
      try {
        await fetch('/api/sheets/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            spreadsheetId,
            operations: [
              {
                type: 'add_column',
                columnName: newColumnName,
                columnIndex: data[0]?.length || 0
              }
            ],
            syncToGoogle: false
          })
        })
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

    const newData = data.filter((_, idx) => idx !== rowIdx)
    setData(newData)

    if (userId) {
      try {
        await fetch('/api/sheets/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            spreadsheetId,
            operations: [{ type: 'remove_row', rowIndex: rowIdx }],
            syncToGoogle: false
          })
        })
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
      await fetch('/api/sheets/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          spreadsheetId,
          operations: [], // No operations, just sync current data
          syncToGoogle: true
        })
      })

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
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-xs text-white/50 mt-1">
            {data.length - 1} rows × {data[0]?.length || 0} columns
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === 'error'
              ? 'bg-red-500/20 text-red-200'
              : 'bg-green-500/20 text-green-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={rowIdx === 0 ? 'bg-white/10 border-b border-white/10' : 'border-b border-white/10'}
              >
                {/* Row number */}
                <td className="px-2 py-2 text-white/40 text-xs bg-black/20 w-8 text-center">
                  {rowIdx}
                </td>

                {/* Cells */}
                {row.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    onClick={() => rowIdx > 0 && handleCellClick(rowIdx, colIdx)}
                    className={`px-4 py-2 text-white/80 cursor-pointer transition ${
                      rowIdx === 0 ? 'font-semibold text-white' : ''
                    } ${
                      selectedCell?.row === rowIdx && selectedCell?.col === colIdx
                        ? 'bg-blue-500/30'
                        : 'hover:bg-white/5'
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
                        className="w-full bg-transparent text-white outline-none border-b border-white/30"
                      />
                    ) : (
                      String(cell ?? '')
                    )}
                  </td>
                ))}

                {/* Delete row button */}
                {rowIdx > 0 && (
                  <td className="px-2 py-2">
                    <button
                      onClick={() => handleRemoveRow(rowIdx)}
                      className="text-red-400 hover:text-red-300 text-xs"
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
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
        >
          + Row
        </button>

        <button
          onClick={() => setEditMode(editMode === 'add-column' ? 'view' : 'add-column')}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
        >
          + Column
        </button>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-full bg-green-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync to Google'}
        </button>

        {/* Export dropdown */}
        <div className="relative group">
          <button className="rounded-full bg-purple-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-purple-700">
            ↓ Export
          </button>
          <div className="absolute right-0 top-full hidden group-hover:block bg-black/90 border border-white/10 rounded-lg overflow-hidden z-10 min-w-max">
            {EXPORT_FORMATS.map(fmt => (
              <button
                key={fmt.id}
                onClick={() => handleExport(fmt.id)}
                disabled={exporting}
                className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-white/10 transition disabled:opacity-50"
              >
                {fmt.icon} {fmt.label}
              </button>
            ))}
            <div className="px-4 py-2 text-xs text-white/50 border-t border-white/10">
              ~{estimateFileSize(data)}
            </div>
          </div>
        </div>
      </div>

      {/* Add row form */}
      {editMode === 'add-row' && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-white">Add New Row</h4>
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
                className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddRow}
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black hover:bg-white/90"
            >
              Add Row
            </button>
            <button
              onClick={() => setEditMode('view')}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold text-white hover:border-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add column form */}
      {editMode === 'add-column' && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-white">Add New Column</h4>
          <input
            placeholder="Column name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="w-full rounded-lg bg-black/20 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddColumn}
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black hover:bg-white/90"
            >
              Add Column
            </button>
            <button
              onClick={() => setEditMode('view')}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold text-white hover:border-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
