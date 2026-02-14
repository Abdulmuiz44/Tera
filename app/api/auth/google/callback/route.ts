import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { saveGoogleTokens } from '@/lib/google-sheets'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')
        const state = searchParams.get('state') // userId
        const error = searchParams.get('error')

        if (error) {
            console.error('Google OAuth error:', error)
            return NextResponse.redirect(new URL('/?sheets_auth=error', request.url))
        }

        if (!code || !state) {
            return NextResponse.redirect(new URL('/?sheets_auth=missing_params', request.url))
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/google/callback`
        )

        // Exchange authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code)

        if (!tokens.access_token) {
            console.error('No access token received from Google')
            return NextResponse.redirect(new URL('/?sheets_auth=no_token', request.url))
        }

        // Save tokens to user_integrations table
        await saveGoogleTokens(
            state, // userId from OAuth state
            tokens.access_token,
            tokens.refresh_token || ''
        )

        console.log('✅ Google Sheets tokens saved for user:', state)

        // Redirect back to the app
        return NextResponse.redirect(new URL('/?sheets_auth=success', request.url))
    } catch (error) {
        console.error('Google OAuth callback error:', error)
        return NextResponse.redirect(new URL('/?sheets_auth=error', request.url))
    }
}
