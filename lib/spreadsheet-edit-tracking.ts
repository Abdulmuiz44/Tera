/**
 * Spreadsheet Edit Tracking
 * Functions to log, retrieve, and manage spreadsheet edits in Supabase
 */

import { createClient } from '@supabase/supabase-js'

let supabase: any = null

function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      console.warn('Supabase credentials not configured')
      return null
    }
    
    supabase = createClient(url, key)
  }
  return supabase
}

export interface SpreadsheetEdit {
  id?: string
  user_id: string
  spreadsheet_id: string
  operation_type: string
  operation_data: Record<string, any>
  previous_data?: Record<string, any> | null
  new_data?: Record<string, any> | null
  created_at?: string
}

/**
 * Log an edit operation to spreadsheet_edits table
 */
export async function logSpreadsheetEdit(
  userId: string,
  spreadsheetId: string,
  operationType: string,
  operationData: Record<string, any>,
  previousData?: any,
  newData?: any
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const client = getSupabaseClient()
    if (!client) return { success: false, error: 'Supabase not configured' }

    const { data, error } = await client
      .from('spreadsheet_edits')
      .insert({
        user_id: userId,
        spreadsheet_id: spreadsheetId,
        operation_type: operationType,
        operation_data: operationData,
        previous_data: previousData || null,
        new_data: newData || null
      })
      .select()

    if (error) {
      console.error('Failed to log edit:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error logging edit:', message)
    return { success: false, error: message }
  }
}

/**
 * Get edit history for a spreadsheet
 */
export async function getSpreadsheetEditHistory(
  spreadsheetId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ success: boolean; edits?: SpreadsheetEdit[]; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) return { success: false, error: 'Supabase not configured' }

    const { data, error } = await client
      .from('spreadsheet_edits')
      .select('*')
      .eq('spreadsheet_id', spreadsheetId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Failed to fetch edit history:', error)
      return { success: false, error: error.message }
    }

    return { success: true, edits: data || [] }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching edit history:', message)
    return { success: false, error: message }
  }
}

/**
 * Get edit count for a spreadsheet
 */
export async function getSpreadsheetEditCount(
  spreadsheetId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) return { success: false, error: 'Supabase not configured' }

    const { count, error } = await client
      .from('spreadsheet_edits')
      .select('*', { count: 'exact' })
      .eq('spreadsheet_id', spreadsheetId)

    if (error) {
      console.error('Failed to count edits:', error)
      return { success: false, error: error.message }
    }

    return { success: true, count: count || 0 }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error counting edits:', message)
    return { success: false, error: message }
  }
}

/**
 * Update spreadsheet current_data
 */
export async function updateSpreadsheetData(
  userId: string,
  spreadsheetId: string,
  currentData: any[][],
  editCount?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) return { success: false, error: 'Supabase not configured' }

    const { error } = await client
      .from('google_spreadsheets')
      .update({
        current_data: currentData,
        last_edited_at: new Date().toISOString(),
        edit_count: editCount !== undefined ? editCount : 0
      })
      .eq('user_id', userId)
      .eq('spreadsheet_id', spreadsheetId)

    if (error) {
      console.error('Failed to update spreadsheet data:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error updating spreadsheet data:', message)
    return { success: false, error: message }
  }
}

/**
 * Get spreadsheet current data
 */
export async function getSpreadsheetCurrentData(
  userId: string,
  spreadsheetId: string
): Promise<{ success: boolean; data?: any[][] | null; error?: string }> {
  try {
    const client = getSupabaseClient()
    if (!client) return { success: false, error: 'Supabase not configured' }

    const { data, error } = await client
      .from('google_spreadsheets')
      .select('current_data')
      .eq('user_id', userId)
      .eq('spreadsheet_id', spreadsheetId)
      .single()

    if (error) {
      console.error('Failed to fetch current data:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data?.current_data || null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching current data:', message)
    return { success: false, error: message }
  }
}

/**
 * Track a cell update
 */
export async function trackCellUpdate(
  userId: string,
  spreadsheetId: string,
  rowIndex: number,
  columnIndex: number,
  oldValue: any,
  newValue: any
): Promise<{ success: boolean; error?: string }> {
  return logSpreadsheetEdit(
    userId,
    spreadsheetId,
    'cell_update',
    {
      row: rowIndex,
      column: columnIndex,
      value: newValue
    },
    { oldValue },
    { newValue }
  )
}

/**
 * Track a row addition
 */
export async function trackRowAdd(
  userId: string,
  spreadsheetId: string,
  rowData: any[],
  position?: number
): Promise<{ success: boolean; error?: string }> {
  return logSpreadsheetEdit(
    userId,
    spreadsheetId,
    'row_add',
    {
      rowData,
      position: position || 'end'
    },
    null,
    { rowData }
  )
}

/**
 * Track a row deletion
 */
export async function trackRowDelete(
  userId: string,
  spreadsheetId: string,
  rowIndex: number,
  rowData: any[]
): Promise<{ success: boolean; error?: string }> {
  return logSpreadsheetEdit(
    userId,
    spreadsheetId,
    'row_delete',
    {
      rowIndex
    },
    { rowData },
    null
  )
}

/**
 * Track a column addition
 */
export async function trackColumnAdd(
  userId: string,
  spreadsheetId: string,
  columnName: string,
  columnIndex: number
): Promise<{ success: boolean; error?: string }> {
  return logSpreadsheetEdit(
    userId,
    spreadsheetId,
    'column_add',
    {
      columnName,
      columnIndex
    },
    null,
    { columnName }
  )
}

/**
 * Track a column deletion
 */
export async function trackColumnDelete(
  userId: string,
  spreadsheetId: string,
  columnIndex: number,
  columnName: string
): Promise<{ success: boolean; error?: string }> {
  return logSpreadsheetEdit(
    userId,
    spreadsheetId,
    'column_delete',
    {
      columnIndex,
      columnName
    },
    { columnName },
    null
  )
}
