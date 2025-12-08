import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { applyOperations, validateData } from '@/lib/spreadsheet-operations'
import type { EditOperation } from '@/lib/spreadsheet-operations'
import { updateSheetData } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, spreadsheetId, operations, syncToGoogle } = body

    if (!userId || !spreadsheetId || !operations) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, spreadsheetId, operations' },
        { status: 400 }
      )
    }

    if (!Array.isArray(operations)) {
      return NextResponse.json(
        { error: 'operations must be an array' },
        { status: 400 }
      )
    }

    // Get current spreadsheet data
    const { data: spreadsheet } = await supabaseServer
      .from('google_spreadsheets')
      .select('*')
      .eq('user_id', userId)
      .eq('spreadsheet_id', spreadsheetId)
      .single()

    if (!spreadsheet) {
      return NextResponse.json(
        { error: 'Spreadsheet not found' },
        { status: 404 }
      )
    }

    // Get current data from memory (stored as JSON string)
    let currentData = []
    if (spreadsheet.current_data) {
      try {
        currentData = typeof spreadsheet.current_data === 'string'
          ? JSON.parse(spreadsheet.current_data)
          : spreadsheet.current_data
      } catch (e) {
        console.error('Error parsing current_data:', e)
        currentData = []
      }
    }

    // Apply operations
    const { data: newData, errors } = applyOperations(currentData, operations)

    // Validate new data
    const validation = validateData(newData)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid data after operations',
          validationErrors: validation.errors
        },
        { status: 400 }
      )
    }

    // Save to database
    const { error: updateError } = await supabaseServer
      .from('google_spreadsheets')
      .update({
        current_data: JSON.stringify(newData),
        last_edited_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('spreadsheet_id', spreadsheetId)

    if (updateError) {
      throw updateError
    }

    // Optionally sync to Google Sheets
    if (syncToGoogle && spreadsheetId) {
      try {
        const sheetTitle = spreadsheet.title || 'Sheet1'
        await updateSheetData(userId, spreadsheetId, sheetTitle, newData)
      } catch (syncError) {
        console.warn('Failed to sync to Google Sheets:', syncError)
        // Don't fail the entire request, just warn
      }
    }

    return NextResponse.json({
      success: true,
      data: newData,
      operationErrors: errors,
      synced: syncToGoogle,
      stats: {
        rows: newData.length,
        columns: newData[0]?.length || 0
      }
    })
  } catch (error) {
    console.error('Error editing spreadsheet:', error)
    const message = error instanceof Error ? error.message : 'Failed to edit spreadsheet'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
