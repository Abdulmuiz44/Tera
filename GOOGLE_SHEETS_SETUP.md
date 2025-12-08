# Google Sheets Integration Setup

This document explains how to set up Google Sheets integration for Tera.

## Prerequisites

You'll need:
- A Google Cloud project with Sheets API and Drive API enabled
- OAuth 2.0 credentials (Client ID and Client Secret)
- Supabase project with the new database schema applied

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API
4. Go to "Credentials" → "Create Credentials" → OAuth 2.0 Client ID (Web Application)
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`

## Step 2: Set Environment Variables

Add these to your `.env.local`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# For production, create a different set
# GOOGLE_REDIRECT_URI_PROD=https://yourdomain.com/api/auth/google/callback
```

## Step 3: Update Supabase Schema

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the SQL script from `lib/supabase-schema-google-sheets.sql`

This creates:
- `user_integrations` table (stores Google OAuth tokens)
- `google_spreadsheets` table (tracks created spreadsheets)
- RLS policies for security

## Step 4: Create Auth Endpoint

You'll need to create an endpoint for Google OAuth callback. Create `app/api/auth/google/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getOAuth2Client } from '@/lib/google-sheets'
import { saveGoogleTokens } from '@/lib/google-sheets'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.redirect('/new?error=missing_code')
  }

  try {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    // Get userId from state or current session
    const userId = state // In production, decode state properly

    if (tokens.access_token && userId) {
      await saveGoogleTokens(
        userId,
        tokens.access_token,
        tokens.refresh_token || ''
      )
    }

    return NextResponse.redirect('/new?spreadsheet_connected=true')
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect('/new?error=oauth_failed')
  }
}
```

## Step 5: Usage

Users can now use the "Spreadsheet Creator" tool to:

1. Ask Tera to create a spreadsheet with data
2. Tera will generate a spreadsheet JSON block
3. The UI will show a preview and "Create Spreadsheet" button
4. Click to create the sheet in Google Drive (requires Google auth)

## Example Prompts

- "Create a spreadsheet with sales data for Q1"
- "Make a Google Sheet with the population of top 10 countries"
- "Create a spreadsheet tracking my fitness goals with charts"

## API Routes

### POST /api/sheets/create

Creates a new Google Spreadsheet and populates it with data.

**Request:**
```json
{
  "userId": "user-uuid",
  "title": "My Spreadsheet",
  "sheetTitle": "Sheet1",
  "data": [
    ["Header 1", "Header 2"],
    ["Value 1", "Value 2"]
  ]
}
```

**Response:**
```json
{
  "success": true,
  "spreadsheet": {
    "spreadsheetId": "...",
    "title": "My Spreadsheet",
    "url": "https://docs.google.com/spreadsheets/d/.../edit"
  }
}
```

## Troubleshooting

- **"User not authenticated with Google"**: User needs to authorize Google access
- **Token expired**: Tokens auto-refresh via Google's OAuth flow
- **Spreadsheet not created**: Check Google API quota and rate limits

## Security Notes

- OAuth tokens are encrypted in Supabase
- Each user can only access their own spreadsheets
- RLS policies prevent cross-user access
- Tokens are never exposed to the client
