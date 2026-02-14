import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()
        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
        )

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
            ],
            state: userId, // Pass userId through OAuth state
        })

        return NextResponse.json({ authUrl })
    } catch (error) {
        console.error('Error generating Google auth URL:', error)
        return NextResponse.json(
            { error: 'Failed to generate authorization URL' },
            { status: 500 }
        )
    }
}
