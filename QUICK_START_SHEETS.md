# Quick Start: Google Sheets Integration

Get Tera creating Google Spreadsheets in 5 minutes.

## 1. Get Google OAuth Credentials (2 min)

1. Go to https://console.cloud.google.com
2. Create/select a project
3. Enable APIs:
   - Google Sheets API
   - Google Drive API
4. Create OAuth 2.0 credentials (Web Application)
5. Add redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Secret

## 2. Update Environment (1 min)

Add to `.env.local`:
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## 3. Create Database Tables (1 min)

1. Open Supabase SQL Editor
2. Copy-paste `lib/supabase-schema-google-sheets.sql`
3. Run it

## 4. Test It (1 min)

1. Start Tera: `npm run dev`
2. Chat → Select "Spreadsheet Creator" tool
3. Ask: "Create a spreadsheet with 3 columns: Name, Age, City and add sample data"
4. Click "Create Spreadsheet"
5. Authorize with Google when prompted
6. Check Google Drive - your sheet should be there!

## Example Prompts to Try

- "Make a Google Sheet with my favorite movies and ratings"
- "Create a spreadsheet tracking monthly expenses"
- "Build a spreadsheet with climate data from 5 cities"
- "Create a student grade tracker spreadsheet"

## What You'll See

1. **Tera's Response** - AI generates spreadsheet with data
2. **Preview** - Table showing what will be created
3. **Create Button** - Creates the actual spreadsheet
4. **Auth Popup** - If first time, authorize Google access
5. **Success** - Direct link to Google Sheets

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Missing GOOGLE_CLIENT_ID" | Add credentials to `.env.local` |
| "Database error" | Run the SQL schema file in Supabase |
| "Not authenticated" | Click "Authorize Google Sheets" first |
| "Spreadsheet didn't create" | Check Google API quota limits |

## That's It!

Your users can now ask Tera to create spreadsheets with data and visualizations. The sheets appear in their Google Drive automatically.

## Visual Features Included

- ✅ Table preview of data
- ✅ Status messages (creating, success, error)
- ✅ Direct link to spreadsheet
- ✅ Google authorization flow
- ✅ Error handling

## What's Happening Behind the Scenes

1. User asks Tera for a spreadsheet
2. Mistral AI creates a JSON block with data
3. UI shows preview table
4. User clicks "Create"
5. App calls Google Sheets API
6. Sheet created with data
7. Direct link provided

Enjoy! 🎉
