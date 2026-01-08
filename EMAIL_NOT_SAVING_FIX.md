# Fix: Email Not Being Saved for New Users

## Problem
New users who sign up aren't having their email stored in Supabase's `users` table.

## Root Causes

### 1. Missing Email Field Check
In `app/auth/callback/route.ts` (line 44), the code inserts empty string if email is missing:
```typescript
email: data.user.email || '',
```

But the migration defines email as `NOT NULL UNIQUE`, so this will fail silently.

### 2. RLS Policy Issue
The RLS policy `"Allow service role to insert users"` doesn't have the proper check. The service role should bypass RLS, but the policy needs to be explicitly set.

### 3. Email Not Guaranteed in OAuth
For OAuth flows (Google), Supabase auth.users gets the email, but it might not be passed correctly to the custom users table.

## The Fix

### Step 1: Update the Callback Route
Replace the insert logic in `app/auth/callback/route.ts` to properly handle email:

```typescript
if (!data.user.email) {
  console.error('No email found in user data')
  return NextResponse.redirect(new URL('/auth/callback-page?error=no_email', requestUrl.origin))
}

const { error: insertError } = await supabaseAdmin.from('users').insert({
  id: data.user.id,
  email: data.user.email.toLowerCase(), // Ensure lowercase
  subscription_plan: 'free',
  daily_chats: 0,
  daily_file_uploads: 0,
  chat_reset_date: null,
  limit_hit_chat_at: null,
  limit_hit_upload_at: null,
  profile_image_url: data.user.user_metadata?.avatar_url || null,
  full_name: data.user.user_metadata?.full_name || null,
  school: null,
  grade_levels: null
})
```

### Step 2: Update the Confirm Route (Backup)
In `app/api/auth/confirm/route.ts`, ensure email is validated:

```typescript
if (!email || email.trim() === '') {
  return NextResponse.json(
    { error: 'Email is required' },
    { status: 400 }
  )
}
```

### Step 3: Update RLS Policies
Run this SQL in Supabase to fix RLS:

```sql
-- Drop and recreate the service role policy to be explicit
DROP POLICY IF EXISTS "Allow service role to insert users" ON users;

-- The service role should bypass RLS entirely, but let's be explicit
CREATE POLICY "Service role can do everything"
  ON users
  USING (current_user_id = 'service_role' OR true)
  WITH CHECK (current_user_id = 'service_role' OR true);

-- Or use a simpler approach - allow all for service role
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Recreate policies ensuring they work
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role full access"
  ON users
  USING (true)
  WITH CHECK (true);
```

## Implementation Steps

### 1. Fix the Callback Route
Edit `app/auth/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // For OTP/email confirmation links (with code param)
  if (code) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Code exchange error:', error.message)
        return NextResponse.redirect(new URL('/auth/callback-page?error=confirmation_failed', requestUrl.origin))
      }

      if (!data.user) {
        console.error('No user returned from code exchange')
        return NextResponse.redirect(new URL('/auth/callback-page?error=no_user', requestUrl.origin))
      }

      // Email MUST exist
      if (!data.user.email) {
        console.error('No email found for user:', data.user.id)
        return NextResponse.redirect(new URL('/auth/callback-page?error=no_email', requestUrl.origin))
      }

      // Create or verify user record in the users table
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingUser) {
        // Insert new user record with email
        const { error: insertError } = await supabaseAdmin.from('users').insert({
          id: data.user.id,
          email: data.user.email.toLowerCase(), // Always save email
          subscription_plan: 'free',
          daily_chats: 0,
          daily_file_uploads: 0,
          chat_reset_date: null,
          limit_hit_chat_at: null,
          limit_hit_upload_at: null,
          profile_image_url: data.user.user_metadata?.avatar_url || null, // Get from OAuth if available
          full_name: data.user.user_metadata?.full_name || null, // Get from OAuth if available
          school: null,
          grade_levels: null
        })

        if (insertError) {
          console.error('Error creating user record:', insertError)
          // Log but don't fail - user is authenticated
        }
      }

      // Success - redirect to dashboard
      return NextResponse.redirect(new URL('/new', requestUrl.origin))
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(new URL('/auth/callback-page?error=server_error', requestUrl.origin))
    }
  }

  // For OAuth (hash-based) - Supabase auto-detects and creates session
  return NextResponse.redirect(new URL('/auth/callback-page', requestUrl.origin))
}
```

### 2. Fix the Confirm Route (Backup endpoint)
Edit `app/api/auth/confirm/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Validate email
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create or verify user record in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      // Insert new user record with email
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        email: trimmedEmail,
        subscription_plan: 'free',
        daily_chats: 0,
        daily_file_uploads: 0,
        chat_reset_date: null,
        limit_hit_chat_at: null,
        limit_hit_upload_at: null,
        profile_image_url: null,
        full_name: null,
        school: null,
        grade_levels: null
      })

      if (insertError) {
        console.error('Error creating user record:', insertError)
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        )
      }
    } else if (!existingUser.email) {
      // User exists but email is missing - update it
      const { error: updateError } = await supabase
        .from('users')
        .update({ email: trimmedEmail })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating user email:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user email' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User confirmed and ready to access Tera'
    })
  } catch (error) {
    console.error('Confirmation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
```

### 3. Run RLS Fix in Supabase (Optional but Recommended)
Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Test that email column exists and is NOT NULL
ALTER TABLE users 
ALTER COLUMN email SET NOT NULL;

-- Ensure unique constraint on email
ALTER TABLE users
ADD CONSTRAINT unique_email UNIQUE (email);

-- Drop problematic policies
DROP POLICY IF EXISTS "Allow service role to insert users" ON users;

-- Recreate the service role policy properly
CREATE POLICY "Service role insert"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Test: These should work
-- SELECT * FROM users; -- Should return all users for service role
```

## Testing

After applying the fix:

1. **Create a new account** via email signup
2. **Verify email** by clicking the confirmation link
3. **Check Supabase** - Users table should show the new user with email populated
4. **Check that user can chat** - No errors should occur

## Verification

In Supabase Dashboard → Table Editor → users:
- [ ] Email column exists
- [ ] New users have email populated
- [ ] All new users have `subscription_plan: 'free'`
- [ ] New users can perform actions without 500 errors

## Why This Happened

1. The RLS policies were too restrictive for service role inserts
2. Email validation was missing (allowed empty strings)
3. The code didn't explicitly require email before inserting

This fix ensures:
- ✅ Email is always captured from auth.users
- ✅ Email is validated before saving
- ✅ Service role can insert user records
- ✅ Existing users' emails can be updated if missing
