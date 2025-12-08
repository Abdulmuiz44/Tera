import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createSpreadsheet, appendDataToSheet } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, sheetTitle, data } = body

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title' },
        { status: 400 }
      )
    }

    // Verify user is authenticated
    const { data: user } = await supabaseServer
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create spreadsheet
    const spreadsheet = await createSpreadsheet(userId, title, sheetTitle)

    // Add data if provided
    if (data && Array.isArray(data) && data.length > 0) {
      await appendDataToSheet(userId, spreadsheet.spreadsheetId, sheetTitle || 'Sheet1', data)
    }

    return NextResponse.json({
      success: true,
      spreadsheet
    })
  } catch (error) {
    console.error('Error creating spreadsheet:', error)
    const message = error instanceof Error ? error.message : 'Failed to create spreadsheet'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
