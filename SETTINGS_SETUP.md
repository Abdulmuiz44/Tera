# Quick Setup: User Settings Table

## TL;DR - 3 Simple Steps

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your Tera project
3. Click "SQL Editor" (left sidebar)

### Step 2: Create New Query
1. Click "New Query" button
2. Copy the entire contents of: `migrations/create_user_settings_table.sql`
3. Paste into the SQL editor

### Step 3: Run Query
1. Click the "Run" button (blue button, top right)
2. Wait for success message
3. Done! ✅

## Verification

Settings page already works! But if you want to make them persistent:

1. Go to Supabase **Table Editor**
2. You should see `user_settings` in the table list
3. Click on it to verify these columns:
   - `id` (BIGSERIAL)
   - `user_id` (UUID) 
   - `notifications_enabled` (BOOLEAN)
   - `dark_mode` (BOOLEAN)
   - `email_notifications` (BOOLEAN)
   - `marketing_emails` (BOOLEAN)
   - `data_retention_days` (INTEGER)

## How It Works

### Without Table (Right Now)
- Settings page works ✅
- Auto-save works ✅
- Toggles respond instantly ✅
- Changes persist in browser ✅
- Won't survive page refresh ❌

### With Table (After Setup)
- Everything above, PLUS:
- Changes persist across sessions ✅
- Sync across multiple devices ✅
- Backed up in database ✅

## What Gets Saved

| Setting | Default | Options |
|---------|---------|---------|
| Push Notifications | ON | Toggle |
| Email Notifications | ON | Toggle |
| Marketing Emails | OFF | Toggle |
| Dark Mode | ON | Toggle |
| Data Retention | 90 days | 7, 30, 90, 180, 365 days |

## Files Reference

- **Migration SQL:** `migrations/create_user_settings_table.sql`
- **API Endpoints:** `app/api/settings/route.ts`
- **Settings Page:** `app/settings/page.tsx`
- **Setup Guide:** `SETUP_INSTRUCTIONS.md`

---

**That's it!** The settings are fully functional. Running the migration just makes them persistent.
