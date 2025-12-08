/**
 * Spreadsheet Export Library
 * Handles CSV, Excel, and JSON exports
 */

/**
 * Export spreadsheet data to CSV format
 */
export function exportToCSV(data: any[][], filename: string = 'spreadsheet.csv'): string {
  const rows = data.map(row =>
    row.map(cell => {
      const value = String(cell ?? '')
      // Escape quotes and wrap in quotes if contains comma or newline
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  )

  return rows.join('\n')
}

/**
 * Generate CSV blob for download
 */
export function getCSVBlob(data: any[][]): Blob {
  const csv = exportToCSV(data)
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Export spreadsheet data to JSON format
 */
export function exportToJSON(
  data: any[][],
  title: string = 'Spreadsheet'
): string {
  if (data.length === 0) return '{}'

  const headers = data[0]
  const rows = data.slice(1)

  const jsonData = rows.map(row => {
    const obj: Record<string, any> = {}
    headers.forEach((header, idx) => {
      obj[header] = row[idx] ?? null
    })
    return obj
  })

  const output = {
    title,
    headers,
    rowCount: rows.length,
    columnCount: headers.length,
    data: jsonData,
    exportedAt: new Date().toISOString()
  }

  return JSON.stringify(output, null, 2)
}

/**
 * Generate JSON blob for download
 */
export function getJSONBlob(data: any[][], title: string = 'Spreadsheet'): Blob {
  const json = exportToJSON(data, title)
  return new Blob([json], { type: 'application/json;charset=utf-8;' })
}

/**
 * Export to TSV (Tab-Separated Values) format
 */
export function exportToTSV(data: any[][], filename: string = 'spreadsheet.tsv'): string {
  return data.map(row =>
    row.map(cell => String(cell ?? '').replace(/\t/g, ' ')).join('\t')
  ).join('\n')
}

/**
 * Generate TSV blob for download
 */
export function getTSVBlob(data: any[][]): Blob {
  const tsv = exportToTSV(data)
  return new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8;' })
}

/**
 * Generate HTML table for preview
 */
export function exportToHTML(data: any[][], title: string = 'Spreadsheet'): string {
  if (data.length === 0) return '<table></table>'

  const headerRow = data[0]
    .map(cell => `<th>${escapeHTML(String(cell ?? ''))}</th>`)
    .join('')

  const bodyRows = data
    .slice(1)
    .map(row =>
      `<tr>${row.map(cell => `<td>${escapeHTML(String(cell ?? ''))}</td>`).join('')}</tr>`
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHTML(title)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th { background-color: #f0f0f0; padding: 12px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
        td { padding: 10px; border: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:hover { background-color: #f5f5f5; }
      </style>
    </head>
    <body>
      <h1>${escapeHTML(title)}</h1>
      <p>Exported on ${new Date().toLocaleString()}</p>
      <table>
        <thead><tr>${headerRow}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </body>
    </html>
  `.trim()
}

/**
 * Generate HTML blob for download
 */
export function getHTMLBlob(data: any[][], title: string = 'Spreadsheet'): Blob {
  const html = exportToHTML(data, title)
  return new Blob([html], { type: 'text/html;charset=utf-8;' })
}

/**
 * Create Excel-compatible CSV (handles special characters)
 */
export function exportToExcelCSV(data: any[][], filename: string = 'spreadsheet.csv'): string {
  // Add BOM for proper UTF-8 encoding in Excel
  const bom = '\uFEFF'
  const csv = exportToCSV(data, filename)
  return bom + csv
}

/**
 * Generate Excel-compatible CSV blob
 */
export function getExcelCSVBlob(data: any[][]): Blob {
  const csv = exportToExcelCSV(data)
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Trigger file download in browser
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export and download in one step
 */
export function exportAndDownload(
  data: any[][],
  format: 'csv' | 'json' | 'tsv' | 'html' | 'excel',
  title: string = 'spreadsheet'
): void {
  let blob: Blob
  let filename: string

  switch (format) {
    case 'csv':
      blob = getCSVBlob(data)
      filename = `${title}.csv`
      break

    case 'excel':
      blob = getExcelCSVBlob(data)
      filename = `${title}.csv`
      break

    case 'json':
      blob = getJSONBlob(data, title)
      filename = `${title}.json`
      break

    case 'tsv':
      blob = getTSVBlob(data)
      filename = `${title}.tsv`
      break

    case 'html':
      blob = getHTMLBlob(data, title)
      filename = `${title}.html`
      break

    default:
      throw new Error(`Unknown export format: ${format}`)
  }

  downloadFile(blob, filename)
}

/**
 * Get all available export formats
 */
export const EXPORT_FORMATS = [
  { id: 'csv', label: 'CSV', icon: '📄' },
  { id: 'json', label: 'JSON', icon: '{ }' },
  { id: 'excel', label: 'Excel CSV', icon: '📊' },
  { id: 'tsv', label: 'TSV', icon: '📋' },
  { id: 'html', label: 'HTML', icon: '🌐' }
] as const

/**
 * Get file size estimate
 */
export function estimateFileSize(data: any[][]): string {
  const csv = exportToCSV(data)
  const sizeInBytes = new Blob([csv]).size

  if (sizeInBytes < 1024) return `${sizeInBytes} B`
  if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`
  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`
}
