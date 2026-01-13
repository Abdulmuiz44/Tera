import { google } from 'googleapis'
import { supabaseServer } from './supabase-server'

const sheets = google.sheets('v4')
const drive = google.drive('v3')

// Get OAuth2 client
function getOAuth2Client(userId?: string) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
  )

  // If userId is provided, listen for token updates and save them
  if (userId) {
    client.on('tokens', async (tokens) => {
      console.log('🔄 Google tokens refreshed automatically')
      if (tokens.access_token) {
        // We need the existing refresh token if the new one is missing
        let refreshToken = tokens.refresh_token
        if (!refreshToken) {
          // Fetch existing refresh token to ensure we don't lose it
          const existing = await getUserGoogleToken(userId)
          refreshToken = existing?.google_refresh_token
        }

        if (refreshToken) {
          await saveGoogleTokens(userId, tokens.access_token, refreshToken)
          console.log('✅ Refreshed Google tokens saved to DB')
        }
      }
    })
  }

  return client
}

// Get user's stored Google access token
async function getUserGoogleToken(userId: string) {
  const { data } = await supabaseServer
    .from('user_integrations')
    .select('google_access_token, google_refresh_token')
    .eq('user_id', userId)
    .single()

  return data
}

// Save Google tokens after OAuth
export async function saveGoogleTokens(userId: string, accessToken: string, refreshToken: string) {
  const { error } = await supabaseServer
    .from('user_integrations')
    .upsert({
      user_id: userId,
      google_access_token: accessToken,
      google_refresh_token: refreshToken,
      updated_at: new Date()
    })

  if (error) {
    console.error('Error saving Google tokens:', error)
    // Don't throw here to avoid breaking the request flow if DB fails specifically on save
  }
}

// Create authenticated sheets client
async function getAuthenticatedSheetsClient(userId: string) {
  const tokens = await getUserGoogleToken(userId)
  if (!tokens?.google_access_token) {
    throw new Error('User has not authorized Google Sheets access')
  }

  // Pass userId so we can listen for refreshes
  const oauth2Client = getOAuth2Client(userId)

  oauth2Client.setCredentials({
    access_token: tokens.google_access_token,
    refresh_token: tokens.google_refresh_token
  })

  return google.sheets({ version: 'v4', auth: oauth2Client })
}

// Create a new spreadsheet
export async function createSpreadsheet(userId: string, title: string, sheetTitle?: string) {
  try {
    // Use the authenticated client helper to ensure token refresh logic is active
    const sheetsClient = await getAuthenticatedSheetsClient(userId)


    // Create spreadsheet
    const response = await sheetsClient.spreadsheets.create({
      requestBody: {
        properties: {
          title: title,
          autoRecalc: 'ON_CHANGE'
        },
        sheets: [
          {
            properties: {
              title: sheetTitle || 'Sheet1'
            }
          }
        ]
      }
    })

    const spreadsheetId = response.data.spreadsheetId
    if (!spreadsheetId) throw new Error('Failed to create spreadsheet')

    // Save spreadsheet reference
    await supabaseServer.from('google_spreadsheets').insert({
      user_id: userId,
      spreadsheet_id: spreadsheetId,
      title: title,
      created_at: new Date()
    })

    return {
      spreadsheetId,
      title,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    }
  } catch (error) {
    console.error('Error creating spreadsheet:', error)
    throw error
  }
}

// Add data to spreadsheet
export async function appendDataToSheet(
  userId: string,
  spreadsheetId: string,
  range: string,
  data: any[][],
  options?: { insertData?: boolean }
) {
  try {
    const sheetsClient = await getAuthenticatedSheetsClient(userId)

    const response = await sheetsClient.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      insertDataOption: options?.insertData ? 'INSERT_ROWS' : undefined,
      requestBody: {
        values: data
      }
    })

    return response.data
  } catch (error) {
    console.error('Error appending data:', error)
    throw error
  }
}

// Update data in spreadsheet
export async function updateSheetData(
  userId: string,
  spreadsheetId: string,
  range: string,
  data: any[][]
) {
  try {
    const sheetsClient = await getAuthenticatedSheetsClient(userId)

    const response = await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: data
      }
    })

    return response.data
  } catch (error) {
    console.error('Error updating data:', error)
    throw error
  }
}

// Format cells (colors, fonts, borders, etc.)
export async function formatCells(
  userId: string,
  spreadsheetId: string,
  sheetId: number,
  requests: any[]
) {
  try {
    const sheetsClient = await getAuthenticatedSheetsClient(userId)

    const response = await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests
      }
    })

    return response.data
  } catch (error) {
    console.error('Error formatting cells:', error)
    throw error
  }
}

// Create chart
export async function createChart(
  userId: string,
  spreadsheetId: string,
  chartConfig: {
    title: string
    type: string
    sheetId: number
    dataRange: string
  }
) {
  try {
    const sheetsClient = await getAuthenticatedSheetsClient(userId)

    const request: any = {
      title: chartConfig.title,
      chartType: chartConfig.type.toUpperCase(),
      sourceRange: {
        sheetId: chartConfig.sheetId,
        sources: [
          {
            sheetId: chartConfig.sheetId,
            rowIndex: 0,
            columnIndex: 0
          }
        ]
      }
    }

    const response = await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addChart: {
              chart: request
            }
          }
        ]
      }
    })

    return response.data
  } catch (error) {
    console.error('Error creating chart:', error)
    throw error
  }
}

// Get spreadsheet data
export async function getSheetData(
  userId: string,
  spreadsheetId: string,
  range: string
) {
  try {
    const sheetsClient = await getAuthenticatedSheetsClient(userId)

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId,
      range
    })

    return response.data.values || []
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    throw error
  }
}

// Get user's spreadsheets
export async function getUserSpreadsheets(userId: string) {
  const { data } = await supabaseServer
    .from('google_spreadsheets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return data || []
}

// Delete spreadsheet reference (from our DB, not Google)
export async function deleteSpreadsheetReference(userId: string, spreadsheetId: string) {
  const { error } = await supabaseServer
    .from('google_spreadsheets')
    .delete()
    .eq('user_id', userId)
    .eq('spreadsheet_id', spreadsheetId)

  if (error) throw error
}
