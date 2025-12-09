import { NextRequest, NextResponse } from 'next/server'
import { getSpreadsheetEditHistory, getSpreadsheetEditCount } from '@/lib/spreadsheet-edit-tracking'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spreadsheetId = searchParams.get('spreadsheetId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const count = searchParams.get('count') === 'true'

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'spreadsheetId is required' },
        { status: 400 }
      )
    }

    // Get edit history
    const historyResult = await getSpreadsheetEditHistory(spreadsheetId, limit, offset)

    if (!historyResult.success) {
      return NextResponse.json(
        { error: historyResult.error || 'Failed to fetch edit history' },
        { status: 500 }
      )
    }

    // Get count if requested
    let editCount: number | null = null
    if (count) {
      const countResult = await getSpreadsheetEditCount(spreadsheetId)
      if (countResult.success) {
        editCount = countResult.count || 0
      }
    }

    return NextResponse.json({
      success: true,
      edits: historyResult.edits || [],
      count: editCount,
      limit,
      offset
    })
  } catch (error) {
    console.error('Error in edit-history API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
