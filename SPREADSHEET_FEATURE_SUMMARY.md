# Google Sheets Integration - Implementation Summary

## What's Been Built

Tera now has full Google Sheets integration allowing users to:
- Ask Tera to create Google Spreadsheets with custom data
- Automatically populate sheets with data and visualizations
- View previews before creating
- Open sheets directly in Google Drive

## Architecture Overview

### New Files Created

#### Backend/Library
- **`lib/google-sheets.ts`** - Google Sheets API wrapper with functions for:
  - Creating spreadsheets
  - Appending/updating data
  - Formatting cells
  - Creating charts
  - Managing user tokens
  
- **`app/api/sheets/create/route.ts`** - API endpoint to create spreadsheets
- **`app/api/auth/google/start/route.ts`** - Initiates Google OAuth flow
- **`app/api/auth/google/callback/route.ts`** - Handles OAuth callback

#### Frontend/Components
- **`components/visuals/SpreadsheetRenderer.tsx`** - React component that:
  - Previews spreadsheet data in a table
  - Shows creation status
  - Handles authentication flow
  - Provides "Create Spreadsheet" button
  
#### Configuration
- **`lib/supabase-schema-google-sheets.sql`** - Database schema for:
  - `user_integrations` - stores Google OAuth tokens
  - `google_spreadsheets` - tracks created spreadsheets
  - RLS policies for security

#### Documentation
- **`GOOGLE_SHEETS_SETUP.md`** - Complete setup guide

### Modified Files

1. **`lib/tools-data.ts`**
   - Added `spreadsheetTools` array with "Spreadsheet Creator" tool
   - Updated `allTools` export to include new tool

2. **`lib/mistral.ts`**
   - Extended system prompt with spreadsheet creation instructions
   - Defined JSON schema for spreadsheet blocks:
     ```json
     {
       "action": "create",
       "title": "Spreadsheet Title",
       "sheetTitle": "Sheet1",
       "data": [["Header 1", "Header 2"], ["Row 1 Col 1", "Row 1 Col 2"]],
       "chartType": "bar"
     }
     ```

3. **`components/PromptShell.tsx`**
   - Added `SpreadsheetRenderer` dynamic import
   - Extended `ContentBlock` type with spreadsheet type
   - Updated `parseContent()` to detect and parse spreadsheet blocks
   - Added spreadsheet rendering in message output

## How It Works

### User Flow

1. **User asks Tera to create a spreadsheet**
   ```
   "Create a spreadsheet with Q1 sales data"
   ```

2. **Mistral AI generates a response with spreadsheet JSON block**
   ```json
   ```json:spreadsheet
   {
     "action": "create",
     "title": "Q1 Sales Data",
     "data": [
       ["Month", "Revenue", "Growth"],
       ["January", 50000, "5%"],
       ["February", 55000, "10%"],
       ["March", 60500, "10%"]
     ],
     "chartType": "bar"
   }
   ```
   Here's your Q1 sales data...
   ```

3. **UI renders SpreadsheetRenderer component**
   - Shows table preview of data
   - Displays "Create Spreadsheet" button

4. **User clicks "Create Spreadsheet"**
   - If not authenticated with Google, shows "Authorize Google Sheets" button
   - User authorizes with Google
   - Tokens saved to `user_integrations` table
   - Spreadsheet created in Google Drive
   - User redirected to open the new spreadsheet

### Data Flow

```
User Question
    ↓
Mistral AI (with system prompt)
    ↓
JSON Spreadsheet Block (in response)
    ↓
PromptShell parseContent()
    ↓
SpreadsheetRenderer (Preview)
    ↓
/api/sheets/create (Create sheet)
    ↓
lib/google-sheets.ts (API calls)
    ↓
Google Sheets API
    ↓
Google Drive (Spreadsheet created)
```

## Database Schema

### user_integrations
```sql
- id (UUID)
- user_id (UUID, FK)
- google_access_token (TEXT)
- google_refresh_token (TEXT)
- google_token_expiry (TIMESTAMP)
- created_at, updated_at
- UNIQUE(user_id)
```

### google_spreadsheets
```sql
- id (UUID)
- user_id (UUID, FK)
- spreadsheet_id (TEXT)
- title (TEXT)
- description (TEXT)
- created_at, updated_at
- UNIQUE(user_id, spreadsheet_id)
```

## Environment Variables Required

```env
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## Security Features

- ✅ OAuth 2.0 for Google authentication
- ✅ Tokens securely stored in Supabase
- ✅ Row-Level Security (RLS) policies
- ✅ User can only access their own spreadsheets
- ✅ Tokens never exposed to client
- ✅ Automatic token refresh

## API Endpoints

### POST /api/sheets/create
Creates a new Google Spreadsheet

**Request:**
```json
{
  "userId": "user-uuid",
  "title": "My Sheet",
  "sheetTitle": "Sheet1",
  "data": [["Col1", "Col2"], ["Val1", "Val2"]]
}
```

**Response:**
```json
{
  "success": true,
  "spreadsheet": {
    "spreadsheetId": "...",
    "title": "My Sheet",
    "url": "https://docs.google.com/spreadsheets/d/.../edit"
  }
}
```

### POST /api/auth/google/start
Initiates OAuth flow

**Request:**
```json
{ "userId": "user-uuid" }
```

**Response:**
```json
{ "authUrl": "https://accounts.google.com/o/oauth2/auth?..." }
```

### GET /api/auth/google/callback
OAuth callback handler (automatic)

## Next Steps (Optional Enhancements)

1. **Advanced Features**
   - Add formatting/styling options
   - Support for formulas
   - Conditional formatting
   - Data validation

2. **Enhanced Visualization**
   - More chart types
   - Cell coloring based on data
   - Headers styling

3. **Additional Tools**
   - Spreadsheet Templates
   - Data Import from Files
   - Collaborative Sharing

4. **Monitoring**
   - Track spreadsheet creation stats
   - Usage analytics
   - API quota monitoring

## Testing Checklist

- [ ] Run SQL schema in Supabase
- [ ] Set up Google Cloud OAuth credentials
- [ ] Add environment variables
- [ ] Test "Spreadsheet Creator" tool
- [ ] Test spreadsheet preview rendering
- [ ] Test Google authorization flow
- [ ] Test spreadsheet creation
- [ ] Verify data in Google Drive
- [ ] Test error handling
