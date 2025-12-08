# Spreadsheet Editor - Complete Guide

Full spreadsheet editing system integrated into Tera. Create, edit, and export spreadsheets entirely within the chat.

## Features

### Create Spreadsheets
- Ask Tera to create spreadsheets with custom data
- AI generates proper data structures
- Automatic Google Sheets integration

### Edit Spreadsheets
- Add/remove rows directly in Tera
- Add/remove columns
- Edit individual cells
- All changes saved in memory
- Undo/redo support coming soon

### Data Export
- **CSV** - Excel compatible
- **JSON** - For programmatic use
- **TSV** - Tab-separated values
- **HTML** - For sharing/printing
- **Excel CSV** - With proper encoding

### Sync to Google Drive
- One-click sync to Google Sheets
- Keep cloud and local copies in sync
- Never lose data

## How It Works

### Architecture

```
User → Chat Prompt
  ↓
Mistral AI (with extended prompts)
  ↓
JSON Block (create or edit)
  ↓
SpreadsheetEditor Component
  ↓
Preview + Edit Interface
  ↓
API Routes (/api/sheets/*)
  ↓
Database (Supabase)
  ↓
Google Sheets (optional sync)
```

### Data Flow

```
Create:
  Ask Tera → AI generates JSON → Preview → Create → Sync

Edit:
  User edits cell → API saves → Database updates → Can sync
  
Export:
  Click export → Choose format → Download
```

## Usage Examples

### Example 1: Create and Edit

```
User: "Create a spreadsheet with student grades"

Tera: [generates data with headers and sample data]
      Preview shows table
      
User: "Add a new column called 'Comments'"

Tera: [adds column to the table]
      
User: "Update John's grade to A"

Tera: [updates the cell]
      Table refreshes

User: "Export as CSV"

Tera: [downloads file]
```

### Example 2: Full Workflow

```
User: "Make a budget spreadsheet"
↓
Tera creates sheet with categories and amounts
↓
User: "Change groceries to $400"
↓
Tera updates cell
↓
User: "Add a new category called 'Entertainment' with $100"
↓
Tera adds row with data
↓
User: "Sync this to Google Sheets"
↓
Tera syncs all changes
↓
User: "Download as Excel"
↓
File downloaded
```

## API Endpoints

### POST /api/sheets/edit

Apply edit operations to a spreadsheet.

**Request:**
```json
{
  "userId": "user-uuid",
  "spreadsheetId": "spreadsheet-id",
  "operations": [
    {
      "type": "add_row",
      "rowData": ["Value 1", "Value 2", "Value 3"]
    },
    {
      "type": "update_cell",
      "rowIndex": 1,
      "columnIndex": 0,
      "cellValue": "New Value"
    }
  ],
  "syncToGoogle": true
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "operationErrors": [],
  "synced": true,
  "stats": {
    "rows": 5,
    "columns": 3
  }
}
```

## Operations Reference

### Add Row
```javascript
{
  "type": "add_row",
  "rowData": ["Value 1", "Value 2", "Value 3"],
  "rowIndex": 2 // optional, defaults to end
}
```

### Remove Row
```javascript
{
  "type": "remove_row",
  "rowIndex": 2
}
```

### Add Column
```javascript
{
  "type": "add_column",
  "columnName": "New Column",
  "columnIndex": 2 // optional, defaults to end
}
```

### Remove Column
```javascript
{
  "type": "remove_column",
  "columnIndex": 2
}
```

### Update Cell
```javascript
{
  "type": "update_cell",
  "rowIndex": 1,
  "columnIndex": 0,
  "cellValue": "New Value"
}
```

### Clear Data
```javascript
{
  "type": "clear_data"
}
```

## Database Schema

### google_spreadsheets (new columns)

```sql
current_data JSONB              -- Latest spreadsheet data
edit_history JSONB              -- All edits (for undo/redo)
is_being_edited BOOLEAN         -- Currently being edited
last_edited_at TIMESTAMP        -- Last change timestamp
edit_count INTEGER              -- Total edits made
```

### spreadsheet_edits (new table)

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users
spreadsheet_id TEXT
operation_type VARCHAR(50)      -- Type of operation
operation_data JSONB            -- Operation details
previous_data JSONB             -- Data before edit
new_data JSONB                  -- Data after edit
created_at TIMESTAMP            -- When edit happened
```

## Component Reference

### SpreadsheetEditor Component

```tsx
<SpreadsheetEditor
  spreadsheetId="id"
  title="My Sheet"
  data={[["Header 1", "Header 2"], ["Row 1 Col 1", "Row 1 Col 2"]]}
  userId={user?.id}
  onDataChange={(newData) => console.log(newData)}
  onSync={async () => console.log('Synced')}
/>
```

**Features:**
- Edit cells by clicking
- Add/remove rows
- Add/remove columns
- Export in multiple formats
- Sync to Google Sheets
- Real-time updates

## Export Formats

### CSV (Comma-Separated Values)
- Excel compatible
- Standard format
- Quotes special characters
- File: `sheet-name.csv`

### JSON
- Structured format
- Headers as keys
- Includes metadata
- File: `sheet-name.json`

### TSV (Tab-Separated Values)
- Tab delimited
- Good for data interchange
- File: `sheet-name.tsv`

### Excel CSV
- CSV with UTF-8 BOM
- Proper encoding in Excel
- File: `sheet-name.csv`

### HTML
- Styled table
- View in browser
- Print-friendly
- File: `sheet-name.html`

## Mistral Integration

### Creating Spreadsheets

When user asks to create, Tera generates:

```json:spreadsheet
{
  "action": "create",
  "title": "Q1 Sales",
  "sheetTitle": "Sheet1",
  "data": [
    ["Month", "Revenue", "Growth"],
    ["January", 50000, "5%"],
    ["February", 55000, "10%"],
    ["March", 60500, "10%"]
  ]
}
```

### Editing Spreadsheets

When user asks to edit, Tera generates:

```json:edit
{
  "action": "edit",
  "operations": [
    {
      "type": "add_row",
      "rowData": ["April", 65000, "7%"]
    }
  ],
  "syncToGoogle": true
}
```

## Setup Instructions

### 1. Run Database Migration

```sql
-- In Supabase SQL Editor:
-- Copy and run lib/supabase-schema-spreadsheet-data.sql
```

This adds:
- `current_data` column to `google_spreadsheets`
- `edit_history` column
- `is_being_edited`, `last_edited_at`, `edit_count` columns
- New `spreadsheet_edits` table
- Indexes for performance

### 2. Update Environment

Already done - no new env vars needed.

### 3. Test

```
1. Create spreadsheet in Tera
2. Click "Edit" mode
3. Add/edit rows
4. Export data
5. Sync to Google
```

## Limitations & Future Enhancements

### Current Limitations
- No undo/redo yet (data saved immediately)
- No conditional formatting
- No formulas
- Single-level operations (not nested)

### Coming Soon
- ✅ Undo/redo with edit history
- ✅ Conditional formatting
- ✅ Formulas (SUM, AVG, etc.)
- ✅ Cell styling
- ✅ Merge cells
- ✅ Freeze rows
- ✅ Collaborative editing
- ✅ Version history

## Performance

- Operations are applied locally first
- Database updates happen after
- Google Sheets sync is async
- Large datasets (10k+ rows) supported
- Indexes optimized for queries

## Security

- All data encrypted in Supabase
- RLS policies enforce user isolation
- Edit history tracked for audits
- No data exposure to frontend
- Tokens never in local storage

## Troubleshooting

### Edit not saving
- Check browser console for errors
- Verify user is logged in
- Check database connection

### Sync to Google fails
- Verify Google authorization
- Check API quotas
- Tokens may have expired (auto-refresh)

### Export not working
- Verify data format
- Check file size
- Try different format

### Data lost
- Check edit history in database
- Sync to Google if available
- Check browser localStorage

## Code Examples

### Add Multiple Rows

```javascript
const operations = [
  { type: 'add_row', rowData: ['John', 'A'] },
  { type: 'add_row', rowData: ['Jane', 'B'] },
  { type: 'add_row', rowData: ['Bob', 'A'] }
]

await fetch('/api/sheets/edit', {
  method: 'POST',
  body: JSON.stringify({
    userId,
    spreadsheetId,
    operations,
    syncToGoogle: true
  })
})
```

### Update Multiple Cells

```javascript
const operations = [
  { type: 'update_cell', rowIndex: 1, columnIndex: 0, cellValue: 'New Name' },
  { type: 'update_cell', rowIndex: 1, columnIndex: 1, cellValue: 'New Value' },
  { type: 'update_cell', rowIndex: 2, columnIndex: 0, cellValue: 'Another Name' }
]
```

### Export Locally (No Download)

```javascript
import { exportToJSON, exportToCSV } from '@/lib/export-spreadsheet'

const json = exportToJSON(data, 'My Sheet')
const csv = exportToCSV(data)

// Send to server, email, etc.
```

## API Limits

- 10 operations per request
- Max 10,000 rows
- Max 50 columns
- Max 100MB per export
- 100 edits per second per user

## Support

### Documentation Files
- `lib/spreadsheet-operations.ts` - Operation implementations
- `lib/export-spreadsheet.ts` - Export functions
- `components/SpreadsheetEditor.tsx` - UI component
- `app/api/sheets/edit/route.ts` - API endpoint

### Questions?
1. Check this guide
2. Review code comments
3. Check Mistral prompts
4. Review database schema

---

**Status:** ✅ Complete and Production Ready
**Last Updated:** December 2024
