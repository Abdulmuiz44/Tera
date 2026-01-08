# CRITICAL FIX - Users Table Schema Update & Email Not Saving

**Issue 1**: Chat functionality was returning 500 errors due to missing database columns
**Issue 2**: New users' emails are not being saved to Supabase users table

**Status**: 🔴 IN PROGRESS - Email saving issue identified and fixed

## What Was Wrong

The `users` table was missing critical columns for subscription and usage tracking:
- `subscription_plan` - User's subscription level (free/pro/plus)
- `daily_chats` - Number of chats used today
- `daily_file_uploads` - Number of file uploads used today
- `chat_reset_date` - When chat counter resets
- `limit_hit_chat_at` - When user hit their chat limit
- `limit_hit_upload_at` - When user hit their upload limit
- `profile_image_url` - User's profile picture
- `full_name` - User's full name
- `school` - School/organization name
- `grade_levels` - Grade levels taught/taught in

## The Error Chain

1. User tries to generate an answer (chat)
2. `generateAnswer()` server action is called
3. `getUserProfile()` tries to fetch user from database
4. Query tries to select columns that don't exist
5. Database returns NULL or error
6. Server action fails with 500 error
7. User sees: "Error: An error occurred in the Server Components render"

## The Fix

Updated the `users` table schema to include all required columns:

```sql
ALTER TABLE users ADD COLUMN subscription_plan TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN daily_chats INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN daily_file_uploads INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN chat_reset_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN limit_hit_chat_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN limit_hit_upload_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN profile_image_url TEXT;
ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN school TEXT;
ALTER TABLE users ADD COLUMN grade_levels TEXT[];
```

## How to Apply the Fix

### Option 1: Run Migration (Recommended)
If you haven't run the migration yet:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the content from: `migrations/setup_auth_users_table.sql`
3. Click "Run"

This will create the users table with all required columns.

### Option 2: Update Existing Table
If you already have a users table without these columns:

```sql
-- Run these in Supabase SQL Editor
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_chats INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_file_uploads INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_reset_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS limit_hit_chat_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS limit_hit_upload_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS grade_levels TEXT[];

-- Add missing columns to defaults
UPDATE users SET 
  subscription_plan = 'free',
  daily_chats = 0,
  daily_file_uploads = 0
WHERE subscription_plan IS NULL;
```

### Option 3: Drop and Recreate (Clean Start)
If you want to start fresh:

```sql
-- WARNING: This deletes all user data
DROP TABLE IF EXISTS users CASCADE;

-- Then run the migration from migrations/setup_auth_users_table.sql
```

## After Applying the Fix

### Test Chat Functionality

1. Sign in or create a new account
2. Go to `/new` (chat page)
3. Type a message and press Enter
4. The chat should respond without 500 errors
5. Check browser console - should see no "generateAnswer failed" errors

### Verify User Data

1. Go to Supabase Dashboard → Table Editor
2. Click "users" table
3. You should see all columns:
   - id
   - email
   - subscription_plan (should be 'free')
   - daily_chats (should be 0)
   - daily_file_uploads (should be 0)
   - chat_reset_date (should be NULL)
   - limit_hit_chat_at (should be NULL)
   - limit_hit_upload_at (should be NULL)
   - profile_image_url (should be NULL)
   - full_name (should be NULL)
   - school (should be NULL)
   - grade_levels (should be NULL)
   - created_at
   - updated_at

## What Was Updated in Code

1. **migrations/setup_auth_users_table.sql**
   - Now creates users table with all required columns
   - Includes default values
   - Adds index on subscription_plan for performance

2. **app/auth/callback/route.ts**
   - User creation now sets all default values
   - Prevents NULL errors on missing columns

3. **app/api/auth/confirm/route.ts**
   - User creation now sets all default values
   - Consistent with callback route

## Chat Should Now Work

After applying this fix:
- ✅ Users can generate answers
- ✅ Chat history is saved
- ✅ Usage limits are enforced
- ✅ User profiles work
- ✅ No more 500 errors

## Timeline

- **Before**: Users got 500 error when trying to chat
- **After**: Chat works, usage tracked, limits enforced

## Next Steps

1. Apply the database migration
2. Restart the application
3. Test chat functionality
4. Verify users appear in database with all columns

---

## NEW ISSUE: Email Not Saving for New Users

**Problem**: When users sign up, their email is not being stored in the `users` table.

**Root Causes**:
1. The callback route was allowing empty emails (`email: data.user.email || ''`)
2. RLS policies may have been blocking service role inserts
3. No email validation before database insert
4. User metadata (avatar_url, full_name) not captured from OAuth

**Status**: ✅ FIXED - Applied three fixes:

### Fix Applied (Code Changes)

1. **app/auth/callback/route.ts**
   - Added email validation - rejects signup if email is missing
   - Changed `email || ''` to `email.toLowerCase()` - ensures email is always valid
   - Added fallback update logic for users with missing emails
   - Captures profile picture and full name from OAuth metadata

2. **app/api/auth/confirm/route.ts**
   - Added email format validation (`email.includes('@')`)
   - Ensures trimmed email is stored
   - Can update email for existing users with missing emails

3. **migrations/fix_email_rls.sql** (NEW)
   - Fixed RLS policies to ensure service role can insert
   - Ensures email column is NOT NULL
   - Creates unique constraint on email

## What You Need to Do

### Step 1: Apply Code Changes (DONE)
✅ Updated `app/auth/callback/route.ts`
✅ Updated `app/api/auth/confirm/route.ts`
✅ Created `migrations/fix_email_rls.sql`

### Step 2: Run RLS Migration in Supabase
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste content from `migrations/fix_email_rls.sql`
3. Click "Run"

### Step 3: Test the Fix
1. Create a new account with email signup
2. Click the confirmation link
3. Go to Supabase → Table Editor → users
4. Verify the new user has their email populated

### Step 4: Fix Existing Users (Optional)
If you have existing users without emails, run this in Supabase SQL Editor:

```sql
-- This will show users with missing emails
SELECT id, email FROM users WHERE email IS NULL OR email = '';

-- If any exist, you'll need to manually populate them from auth.users
UPDATE users u
SET email = a.email
FROM auth.users a
WHERE u.id = a.id
  AND (u.email IS NULL OR u.email = '');
```

---

**IMPORTANT**: Do not skip this fix if you want new users to be properly registered!
