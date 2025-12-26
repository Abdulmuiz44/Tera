import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { saveGoogleTokens } from '@/lib/google-sheets'

function getOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
    )
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params
    const action = slug[0]

    if (action === 'start') {
        try {
            const body = await request.json()
            const { userId } = body
            if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

            const oauth2Client = getOAuth2Client()
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
                state: userId
            })

            return NextResponse.json({ authUrl })
        } catch (error) {
            return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params
    const action = slug[0]

    if (action === 'callback') {
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code) return NextResponse.redirect(new URL('/new?error=missing_code', request.url))

        try {
            const oauth2Client = getOAuth2Client()
            const { tokens } = await oauth2Client.getToken(code)
            if (!tokens.access_token) throw new Error('No access token received from Google')

            const userId = state || ''
            if (userId && tokens.access_token) {
                await saveGoogleTokens(userId, tokens.access_token, tokens.refresh_token || '')
            }

            return NextResponse.redirect(new URL('/new?spreadsheet_connected=true', request.url))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'OAuth failed'
            return NextResponse.redirect(new URL(`/new?error=${encodeURIComponent(errorMessage)}`, request.url))
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
