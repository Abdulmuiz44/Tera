/**
 * Spreadsheet Operations Library
 * Handles all edit operations: add/remove rows/columns, update cells, etc.
 */

export interface SpreadsheetData {
  title: string
  sheetTitle: string
  data: any[][]
}

export interface EditOperation {
  type: 'add_row' | 'remove_row' | 'add_column' | 'remove_column' | 'update_cell' | 'clear_data'
  rowIndex?: number
  columnIndex?: number
  rowData?: any[]
  columnName?: string
  cellValue?: any
  position?: 'start' | 'end' | 'after' | 'before'
}

/**
 * Add a new row to the spreadsheet
 */
export function addRow(
  data: any[][],
  rowData: any[],
  position: number = data.length
): any[][] {
  const newData = [...data]
  newData.splice(position, 0, rowData)
  return newData
}

/**
 * Remove a row from the spreadsheet
 */
export function removeRow(data: any[][], rowIndex: number): any[][] {
  if (rowIndex < 0 || rowIndex >= data.length) {
    throw new Error(`Invalid row index: ${rowIndex}`)
  }
  return data.filter((_, idx) => idx !== rowIndex)
}

/**
 * Add a new column to the spreadsheet
 */
export function addColumn(
  data: any[][],
  columnName: string,
  columnIndex: number = data[0]?.length || 0
): any[][] {
  if (data.length === 0) {
    return [[columnName]]
  }

  return data.map((row, rowIdx) => {
    const newRow = [...row]
    const value = rowIdx === 0 ? columnName : '' // Header row gets column name
    newRow.splice(columnIndex, 0, value)
    return newRow
  })
}

/**
 * Remove a column from the spreadsheet
 */
export function removeColumn(data: any[][], columnIndex: number): any[][] {
  if (data.length === 0) return data

  if (columnIndex < 0 || columnIndex >= data[0].length) {
    throw new Error(`Invalid column index: ${columnIndex}`)
  }

  return data.map(row => row.filter((_, idx) => idx !== columnIndex))
}

/**
 * Update a specific cell
 */
export function updateCell(
  data: any[][],
  rowIndex: number,
  columnIndex: number,
  value: any
): any[][] {
  if (rowIndex < 0 || rowIndex >= data.length) {
    throw new Error(`Invalid row index: ${rowIndex}`)
  }

  if (columnIndex < 0 || columnIndex >= data[rowIndex].length) {
    throw new Error(`Invalid column index: ${columnIndex}`)
  }

  const newData = data.map((row, rIdx) =>
    rIdx === rowIndex
      ? row.map((cell, cIdx) => (cIdx === columnIndex ? value : cell))
      : row
  )

  return newData
}

/**
 * Update a row's data
 */
export function updateRow(data: any[][], rowIndex: number, rowData: any[]): any[][] {
  if (rowIndex < 0 || rowIndex >= data.length) {
    throw new Error(`Invalid row index: ${rowIndex}`)
  }

  return data.map((row, idx) => (idx === rowIndex ? rowData : row))
}

/**
 * Insert multiple rows
 */
export function insertRows(data: any[][], startIndex: number, rows: any[][]): any[][] {
  const newData = [...data]
  newData.splice(startIndex, 0, ...rows)
  return newData
}

/**
 * Clear all data (keep headers)
 */
export function clearData(data: any[][]): any[][] {
  if (data.length === 0) return data
  // Keep header row, clear rest
  return [data[0]]
}

/**
 * Get column index by header name
 */
export function getColumnIndex(data: any[][], columnName: string): number {
  if (data.length === 0) return -1
  return data[0].indexOf(columnName)
}

/**
 * Get column name by index
 */
export function getColumnName(data: any[][], columnIndex: number): string {
  if (data.length === 0 || columnIndex < 0 || columnIndex >= data[0].length) {
    return ''
  }
  return String(data[0][columnIndex])
}

/**
 * Get row by index
 */
export function getRow(data: any[][], rowIndex: number): any[] {
  if (rowIndex < 0 || rowIndex >= data.length) {
    throw new Error(`Invalid row index: ${rowIndex}`)
  }
  return data[rowIndex]
}

/**
 * Get cell value
 */
export function getCell(data: any[][], rowIndex: number, columnIndex: number): any {
  if (rowIndex < 0 || rowIndex >= data.length) {
    throw new Error(`Invalid row index: ${rowIndex}`)
  }
  if (columnIndex < 0 || columnIndex >= data[rowIndex].length) {
    throw new Error(`Invalid column index: ${columnIndex}`)
  }
  return data[rowIndex][columnIndex]
}

/**
 * Apply multiple operations in sequence
 */
export function applyOperations(
  data: any[][],
  operations: EditOperation[]
): { data: any[][]; errors: string[] } {
  let currentData = data
  const errors: string[] = []

  for (const op of operations) {
    try {
      switch (op.type) {
        case 'add_row':
          if (!op.rowData) throw new Error('rowData is required for add_row')
          currentData = addRow(currentData, op.rowData, op.rowIndex)
          break

        case 'remove_row':
          if (op.rowIndex === undefined) throw new Error('rowIndex is required for remove_row')
          currentData = removeRow(currentData, op.rowIndex)
          break

        case 'add_column':
          if (!op.columnName) throw new Error('columnName is required for add_column')
          currentData = addColumn(
            currentData,
            op.columnName,
            op.columnIndex || currentData[0]?.length
          )
          break

        case 'remove_column':
          if (op.columnIndex === undefined) throw new Error('columnIndex is required for remove_column')
          currentData = removeColumn(currentData, op.columnIndex)
          break

        case 'update_cell':
          if (op.rowIndex === undefined || op.columnIndex === undefined) {
            throw new Error('rowIndex and columnIndex are required for update_cell')
          }
          currentData = updateCell(currentData, op.rowIndex, op.columnIndex, op.cellValue)
          break

        case 'clear_data':
          currentData = clearData(currentData)
          break

        default:
          errors.push(`Unknown operation type: ${(op as any).type}`)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      errors.push(`Operation ${op.type} failed: ${message}`)
    }
  }

  return { data: currentData, errors }
}

/**
 * Validate spreadsheet data
 */
export function validateData(data: any[][]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return { valid: false, errors }
  }

  if (data.length === 0) {
    errors.push('Data cannot be empty')
    return { valid: false, errors }
  }

  const headerLength = data[0].length
  for (let i = 1; i < data.length; i++) {
    if (!Array.isArray(data[i])) {
      errors.push(`Row ${i} is not an array`)
    } else if (data[i].length !== headerLength) {
      errors.push(`Row ${i} has ${data[i].length} columns, expected ${headerLength}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Calculate statistics about the spreadsheet
 */
export function getStats(data: any[][]) {
  return {
    rows: data.length,
    columns: data[0]?.length || 0,
    headers: data[0] || [],
    dataRows: Math.max(0, data.length - 1) // Exclude header
  }
}

/**
 * Find and replace values
 */
export function findReplace(
  data: any[][],
  findValue: any,
  replaceValue: any,
  inColumn?: number
): any[][] {
  return data.map((row, rowIdx) =>
    row.map((cell, colIdx) => {
      if (inColumn !== undefined && colIdx !== inColumn) return cell
      return cell === findValue ? replaceValue : cell
    })
  )
}

/**
 * Sort data by column
 */
export function sortByColumn(
  data: any[][],
  columnIndex: number,
  descending: boolean = false
): any[][] {
  if (data.length <= 1) return data

  const header = data[0]
  const rows = data.slice(1)

  const sorted = rows.sort((a, b) => {
    const aVal = a[columnIndex]
    const bVal = b[columnIndex]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return descending ? bVal - aVal : aVal - bVal
    }

    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()

    if (descending) return bStr.localeCompare(aStr)
    return aStr.localeCompare(bStr)
  })

  return [header, ...sorted]
}

/**
 * Filter rows based on condition
 */
export function filterRows(
  data: any[][],
  columnIndex: number,
  filterFn: (value: any) => boolean
): any[][] {
  if (data.length <= 1) return data

  const header = data[0]
  const rows = data.slice(1).filter(row => filterFn(row[columnIndex]))

  return [header, ...rows]
}
