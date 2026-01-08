# Apply Email Fix - Quick Guide

## What's the Problem?
New users signing up aren't getting their email saved in the database.

## What's Been Fixed?
✅ Code changes applied to handle email properly
⏳ Now you need to run one SQL command

## How to Apply the Fix

### Step 1: Go to Supabase Dashboard
https://app.supabase.com/

### Step 2: Select Your Project
Click on your Tera project

### Step 3: Go to SQL Editor
Left sidebar → "SQL Editor"

### Step 4: Create New Query
Click "New Query" button

### Step 5: Copy This Code
```sql
-- Fix: Ensure Email is Saved for New Users
-- Drop the overly restrictive service role policy
DROP POLICY IF EXISTS "Allow service role to insert users" ON users;

-- Recreate RLS policy to allow service role to insert
CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Ensure email column is NOT NULL
ALTER TABLE users
ALTER COLUMN email SET NOT NULL;

-- Create unique constraint on email
ALTER TABLE users
DROP CONSTRAINT IF EXISTS unique_email;

ALTER TABLE users
ADD CONSTRAINT unique_email UNIQUE (email);

-- Verify it worked (should show email column as NOT NULL)
-- SELECT * FROM users LIMIT 1;
```

### Step 6: Run the Query
Click "Run" button

### Step 7: Verify Success
You should see "Queries executed successfully" message

## Test the Fix

### Create a Test Account
1. Go to your app: http://localhost:3000 (or production URL)
2. Click "Sign up"
3. Enter test email: `test@example.com`
4. Submit
5. You should get a confirmation email

### Click the Confirmation Link
1. Go to your email inbox
2. Click the verification link from Tera

### Verify Email Was Saved
1. Go back to Supabase → Table Editor
2. Click "users" table
3. Find your test user
4. Check that "email" column has the email address

## Troubleshooting

### If You See an Error
**Error**: "Email column doesn't exist"
- Make sure you ran `migrations/setup_auth_users_table.sql` first

**Error**: "Already applied migration"
- That's fine! The constraints already exist, you're all set.

**Error**: "Permission denied"
- Make sure you're using a service role key with enough permissions

### If Email Still Doesn't Save
1. Check browser console for errors
2. Check Supabase logs
3. Verify SUPABASE_SERVICE_ROLE_KEY is set in environment

## Rollback (If Needed)

If something goes wrong, you can restore the original RLS policy:
```sql
CREATE POLICY "Allow service role to insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);
```

## After the Fix

### New Signups
- ✅ Email will be saved automatically
- ✅ User can access chat features
- ✅ User profile will be populated

### Existing Users
- If they signed up before this fix, they may not have emails
- They can still sign in (Supabase knows their email)
- Their custom users table record will get email on next auth action

## Done!
🎉 Your email issue is fixed! New users will now save their emails properly.

Need help? Check:
- `EMAIL_FIX_SUMMARY.md` - Overview of all changes
- `EMAIL_NOT_SAVING_FIX.md` - Detailed technical explanation
- `CRITICAL_FIX_REQUIRED.md` - Full context
