-- Fix: Ensure Email is Saved for New Users
-- This migration ensures RLS policies don't block service role from inserting emails

-- Step 1: Ensure email column is NOT NULL (should be from setup_auth_users_table.sql)
ALTER TABLE users
ALTER COLUMN email SET NOT NULL;

-- Step 2: Drop the overly restrictive service role policy
DROP POLICY IF EXISTS "Allow service role to insert users" ON users;

-- Step 3: Recreate RLS policies correctly
-- The service role should be able to insert user records
CREATE POLICY "Service role can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Step 4: Ensure SELECT policy allows reading own data
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Step 5: Ensure UPDATE policy allows updating own data
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Step 6: Ensure email uniqueness constraint
ALTER TABLE users
DROP CONSTRAINT IF EXISTS unique_email;

ALTER TABLE users
ADD CONSTRAINT unique_email UNIQUE (email);

-- Step 7: Verify the fix - this should show the structure
-- Run in Supabase to verify:
-- SELECT * FROM users LIMIT 1;
-- The email column should be visible and NOT NULL
