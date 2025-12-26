import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { createSpreadsheet, appendDataToSheet, updateSheetData } from '@/lib/google-sheets'
import { applyOperations, validateData } from '@/lib/spreadsheet-operations'
import { getSpreadsheetEditHistory, getSpreadsheetEditCount } from '@/lib/spreadsheet-edit-tracking'

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
    const action = params.slug[0]

    try {
        const body = await request.json()

        if (action === 'create') {
            const { userId, title, sheetTitle, data } = body
            if (!userId || !title) return NextResponse.json({ error: 'Missing userId or title' }, { status: 400 })

            const spreadsheet = await createSpreadsheet(userId, title, sheetTitle)
            if (data && Array.isArray(data) && data.length > 0) {
                await appendDataToSheet(userId, spreadsheet.spreadsheetId, sheetTitle || 'Sheet1', data)
            }
            return NextResponse.json({ success: true, spreadsheet })
        }

        if (action === 'edit') {
            const { userId, spreadsheetId, operations, syncToGoogle } = body
            if (!userId || !spreadsheetId || !operations) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

            const { data: spreadsheet } = await supabaseServer
                .from('google_spreadsheets')
                .select('*')
                .eq('user_id', userId)
                .eq('spreadsheet_id', spreadsheetId)
                .single()

            if (!spreadsheet) return NextResponse.json({ error: 'Spreadsheet not found' }, { status: 404 })

            let currentData = []
            if (spreadsheet.current_data) {
                try {
                    currentData = typeof spreadsheet.current_data === 'string' ? JSON.parse(spreadsheet.current_data) : spreadsheet.current_data
                } catch (e) { currentData = [] }
            }

            const { data: newData, errors } = applyOperations(currentData, operations)
            const validation = validateData(newData)
            if (!validation.valid) return NextResponse.json({ error: 'Invalid data', validationErrors: validation.errors }, { status: 400 })

            const { error: updateError } = await supabaseServer
                .from('google_spreadsheets')
                .update({ current_data: JSON.stringify(newData), last_edited_at: new Date().toISOString() })
                .eq('user_id', userId)
                .eq('spreadsheet_id', spreadsheetId)

            if (updateError) throw updateError

            if (syncToGoogle && spreadsheetId) {
                try { await updateSheetData(userId, spreadsheetId, spreadsheet.title || 'Sheet1', newData) } catch (e) { }
            }

            return NextResponse.json({ success: true, data: newData, operationErrors: errors, synced: syncToGoogle })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
        console.error(`Error in sheets ${action}:`, error)
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
    }
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
    const action = params.slug[0]

    if (action === 'edit-history') {
        try {
            const { searchParams } = new URL(request.url)
            const spreadsheetId = searchParams.get('spreadsheetId')
            const limit = parseInt(searchParams.get('limit') || '50')
            const offset = parseInt(searchParams.get('offset') || '0')
            const count = searchParams.get('count') === 'true'

            if (!spreadsheetId) return NextResponse.json({ error: 'spreadsheetId required' }, { status: 400 })

            const historyResult = await getSpreadsheetEditHistory(spreadsheetId, limit, offset)
            if (!historyResult.success) return NextResponse.json({ error: historyResult.error }, { status: 500 })

            let editCount: number | null = null
            if (count) {
                const countResult = await getSpreadsheetEditCount(spreadsheetId)
                if (countResult.success) editCount = countResult.count || 0
            }

            return NextResponse.json({ success: true, edits: historyResult.edits || [], count: editCount, limit, offset })
        } catch (error) {
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
