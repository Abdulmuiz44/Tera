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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.redirect(new URL('/new?error=missing_code', request.url))
  }

  try {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token) {
      throw new Error('No access token received from Google')
    }

    // State should contain the userId (you'll set this when initiating OAuth)
    // For now, we'll redirect to a page where the user can verify the connection
    const userId = state || ''

    if (userId && tokens.access_token) {
      await saveGoogleTokens(
        userId,
        tokens.access_token,
        tokens.refresh_token || ''
      )
    }

    // Redirect back to chat with success message
    return NextResponse.redirect(
      new URL('/new?spreadsheet_connected=true', request.url)
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    const errorMessage = error instanceof Error ? error.message : 'OAuth failed'
    return NextResponse.redirect(
      new URL(`/new?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }
}
