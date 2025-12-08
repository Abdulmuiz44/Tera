# Google Sheets API Reference

Complete API documentation for the Google Sheets integration.

## Core APIs

### 1. Create Spreadsheet

**Endpoint:** `POST /api/sheets/create`

**Authentication:** Requires logged-in user with Google authorization

**Request Body:**
```json
{
  "userId": "uuid-of-user",
  "title": "Q1 Sales Report",
  "sheetTitle": "Sheet1",
  "data": [
    ["Month", "Revenue", "Growth %"],
    ["January", "50000", "5"],
    ["February", "55000", "10"],
    ["March", "60500", "10"]
  ]
}
```

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| userId | string | ✅ | User's UUID from auth |
| title | string | ✅ | Spreadsheet title |
| sheetTitle | string | ❌ | First sheet name (default: "Sheet1") |
| data | array[] | ✅ | 2D array of data rows |

**Response (Success):**
```json
{
  "success": true,
  "spreadsheet": {
    "spreadsheetId": "1BxiMVs0XRA5nFMKUVfIrZg-I2mVZY3Vqx...",
    "title": "Q1 Sales Report",
    "url": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMKUVfIrZg-I2mVZY3Vqx.../edit"
  }
}
```

**Response (Error):**
```json
{
  "error": "User has not authorized Google Sheets access"
}
```

**Error Codes:**
| Code | Message | Solution |
|------|---------|----------|
| 400 | Missing required fields | Provide userId, title, data |
| 404 | User not found | Verify user exists |
| 500 | User not authenticated | User must authorize Google |
| 500 | API quota exceeded | Wait or upgrade Google plan |

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/sheets/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Sales Data",
    "data": [["Name", "Amount"], ["John", "100"], ["Jane", "200"]]
  }'
```

**Example JavaScript:**
```javascript
const response = await fetch('/api/sheets/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    title: 'My Spreadsheet',
    data: [
      ['Column 1', 'Column 2'],
      ['Value 1', 'Value 2']
    ]
  })
});

const result = await response.json();
console.log(result.spreadsheet.url); // Direct link to Google Sheet
```

---

### 2. Start Google OAuth

**Endpoint:** `POST /api/auth/google/start`

**Authentication:** Requires logged-in user

**Request Body:**
```json
{
  "userId": "uuid-of-user"
}
```

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/auth?client_id=...&redirect_uri=...&scope=..."
}
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| userId | string | User's UUID |

**Scopes Requested:**
- `https://www.googleapis.com/auth/spreadsheets` - Create/edit sheets
- `https://www.googleapis.com/auth/drive` - Access Google Drive

**Example JavaScript:**
```javascript
const response = await fetch('/api/auth/google/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: user.id })
});

const { authUrl } = await response.json();
window.location.href = authUrl; // Redirect to Google OAuth
```

---

### 3. OAuth Callback

**Endpoint:** `GET /api/auth/google/callback`

**Called by:** Google OAuth flow (automatic)

**Query Parameters:**
| Name | Description |
|------|-------------|
| code | Authorization code from Google |
| state | User ID (passed back) |
| error | If authorization failed |

**Automatic Redirect:** User is redirected to `/new?spreadsheet_connected=true`

**No manual implementation needed** - handled automatically by the system.

---

## Library Functions

### In `lib/google-sheets.ts`

#### `createSpreadsheet(userId, title, sheetTitle?)`
Create a new Google Spreadsheet

```typescript
import { createSpreadsheet } from '@/lib/google-sheets'

const result = await createSpreadsheet(
  'user-uuid',
  'My Sheet',
  'Sheet1'
)
// Returns: { spreadsheetId, title, url }
```

#### `appendDataToSheet(userId, spreadsheetId, range, data, options?)`
Add data to a sheet

```typescript
await appendDataToSheet(
  'user-uuid',
  '1BxiMVs...',
  'Sheet1',
  [['Header 1', 'Header 2'], ['Value 1', 'Value 2']]
)
```

#### `updateSheetData(userId, spreadsheetId, range, data)`
Replace data in a sheet

```typescript
await updateSheetData(
  'user-uuid',
  '1BxiMVs...',
  'A1:B3',
  [['Updated', 'Data']]
)
```

#### `getSheetData(userId, spreadsheetId, range)`
Read data from a sheet

```typescript
const data = await getSheetData(
  'user-uuid',
  '1BxiMVs...',
  'A1:Z100'
)
// Returns: 2D array of values
```

#### `getUserSpreadsheets(userId)`
Get all spreadsheets created by a user

```typescript
const sheets = await getUserSpreadsheets('user-uuid')
// Returns: Array of {id, user_id, spreadsheet_id, title, created_at}
```

#### `formatCells(userId, spreadsheetId, sheetId, requests)`
Format cells (colors, fonts, etc.)

```typescript
await formatCells('user-uuid', '1BxiMVs...', 0, [
  {
    updateCells: {
      range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
      rows: [{
        values: [{
          userEnteredFormat: {
            backgroundColor: { red: 0, green: 0, blue: 1 }
          }
        }]
      }],
      fields: 'userEnteredFormat(backgroundColor)'
    }
  }
])
```

---

## Data Structures

### Spreadsheet JSON Format (from Mistral AI)

When Tera creates a spreadsheet response:

```json
{
  "action": "create",
  "title": "Quarterly Revenue",
  "sheetTitle": "Q1",
  "data": [
    ["Month", "Revenue", "Growth"],
    ["January", "50000", "5%"],
    ["February", "55000", "10%"],
    ["March", "60500", "10%"]
  ],
  "chartType": "bar"
}
```

**Fields:**
- `action` - Always "create"
- `title` - Spreadsheet name
- `sheetTitle` - First sheet name (default: Sheet1)
- `data` - 2D array of values
- `chartType` - Optional (bar, line, pie, area, scatter)

### ContentBlock Type (TypeScript)

```typescript
type ContentBlock =
  | { type: 'text', content: string, isHeader: boolean }
  | { type: 'chart', config: any }
  | { type: 'mermaid', chart: string }
  | { type: 'code', language: string, code: string }
  | { type: 'spreadsheet', config: any }
```

### SpreadsheetRenderer Props

```typescript
interface SpreadsheetConfig {
  action: string
  title: string
  sheetTitle?: string
  data: any[][]
  chartType?: string
}

// Usage in React
<SpreadsheetRenderer config={config} userId={user?.id} />
```

---

## Database Schema

### user_integrations

Stores Google OAuth tokens for users

```sql
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expiry TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id)
);
```

### google_spreadsheets

Tracks spreadsheets created by users

```sql
CREATE TABLE google_spreadsheets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  spreadsheet_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, spreadsheet_id)
);
```

---

## Error Handling

### Common Errors

```javascript
try {
  await createSpreadsheet(userId, title, data)
} catch (error) {
  if (error.message.includes('not authenticated')) {
    // Show Google auth button
  } else if (error.message.includes('quota')) {
    // Show quota exceeded message
  } else if (error.message.includes('timeout')) {
    // Show network error message
  } else {
    console.error('Unknown error:', error)
  }
}
```

### User-Facing Error Messages

| User Action | Error | Solution |
|-------------|-------|----------|
| Create without auth | "User not authenticated with Google" | Click "Authorize Google Sheets" |
| First time use | Click "Create Spreadsheet" | Authorize with Google in popup |
| Network issue | "Network timeout" | Check internet, try again |
| API limit | "API quota exceeded" | Wait or upgrade Google plan |

---

## Rate Limiting

Google Sheets API limits:
- 300 requests per minute (free tier)
- 10 million cells read/writes per day

Current implementation:
- Creates 1 request per spreadsheet
- Appends data in 1 request
- No automatic batching (can be added)

---

## Security Considerations

✅ **Implemented:**
- OAuth 2.0 authentication
- Secure token storage (Supabase)
- Row-Level Security (RLS)
- User isolation (can't see others' sheets)
- No token exposure to client

⚠️ **Additional Recommendations:**
- Implement token refresh logic
- Add audit logging
- Monitor API usage per user
- Rate limit per user
- Add IP whitelisting for production

---

## Example: Complete Flow

```typescript
// 1. User clicks "Create Spreadsheet"
async function createUserSpreadsheet(user, config) {
  try {
    // 2. Call the API endpoint
    const response = await fetch('/api/sheets/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        title: config.title,
        data: config.data
      })
    })

    if (!response.ok) {
      const error = await response.json()
      
      // 3. Handle auth error
      if (error.error?.includes('not authenticated')) {
        // Redirect to Google auth
        const authResponse = await fetch('/api/auth/google/start', {
          method: 'POST',
          body: JSON.stringify({ userId: user.id })
        })
        const { authUrl } = await authResponse.json()
        window.location.href = authUrl
        return
      }
      
      throw new Error(error.error)
    }

    // 4. Success - get spreadsheet info
    const result = await response.json()
    console.log('Spreadsheet created:', result.spreadsheet.url)
    
    // 5. Open in new tab
    window.open(result.spreadsheet.url, '_blank')
  } catch (error) {
    console.error('Failed to create spreadsheet:', error)
    // Show error to user
  }
}
```

---

## Testing with Postman

### Request 1: Create Spreadsheet

**Method:** POST  
**URL:** `http://localhost:3000/api/sheets/create`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Test Sheet",
  "sheetTitle": "Data",
  "data": [
    ["Name", "Age", "City"],
    ["Alice", "30", "New York"],
    ["Bob", "25", "Los Angeles"]
  ]
}
```

### Request 2: Start OAuth

**Method:** POST  
**URL:** `http://localhost:3000/api/auth/google/start`

**Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

**Last Updated:** December 2024  
**Version:** 1.0.0
