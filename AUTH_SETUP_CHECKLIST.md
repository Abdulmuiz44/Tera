# Authentication Setup Checklist

## Critical: Database Setup

### Step 1: Create Users Table (if not exists)
- [ ] Run migration: `migrations/setup_auth_users_table.sql` in Supabase SQL Editor
- [ ] Verify table exists: `SELECT * FROM users;` (should return 0 rows initially)
- [ ] Verify indexes exist: `idx_users_email`, `idx_users_created_at`
- [ ] Verify RLS is enabled: `ALTER TABLE users ENABLE ROW LEVEL SECURITY;`

### Step 2: Verify User Settings Table
- [ ] Run migration: `migrations/create_user_settings_table.sql`
- [ ] Verify table exists and RLS policies are in place

### Step 3: Verify Auth Configuration
- [ ] Database > Trigger → Check if auth triggers exist
- [ ] Check Supabase auth.users table exists
- [ ] Users table should have FOREIGN KEY to auth.users(id)

## Critical: Environment Variables

### Step 1: Update .env.local
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon key (public)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (SECRET - never commit)
- [ ] `NEXT_PUBLIC_APP_URL` - http://localhost:3000 (dev), https://yourdomain.com (prod)

```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # KEEP SECRET!
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Critical: Supabase Configuration

### Step 1: Email Authentication
- [ ] Go to Authentication > Providers > Email
- [ ] Enable "Email/Password" is optional (OTP only needed)
- [ ] Configure email template redirects to include: `/auth/callback`
- [ ] Test email sending:
  1. Go to /auth/signup
  2. Enter test email
  3. Check email for confirmation link

### Step 2: Configure Email OTP Settings
- [ ] Authentication > Providers > Email
- [ ] Set OTP expiry (default: 24 hours)
- [ ] Enable "Confirm email" for signups
- [ ] Add redirect URL: `http://localhost:3000/auth/callback` (dev)
- [ ] Add redirect URL: `https://yourdomain.com/auth/callback` (prod)

### Step 3: Google OAuth Setup
- [ ] Create Google OAuth credentials:
  1. Go to Google Cloud Console
  2. Create new project or select existing
  3. Enable Google+ API
  4. Create OAuth 2.0 credentials (Web application)
  5. Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (dev)
     - `https://yourdomain.com/auth/callback` (prod)
  6. Note: Client ID and Client Secret

- [ ] Add to Supabase:
  1. Authentication > Providers > Google
  2. Enable Google
  3. Paste Client ID and Client Secret
  4. Add redirect URLs if not auto-detected

### Step 4: Verify Email Templates
- [ ] Authentication > Email Templates
- [ ] Check templates exist:
  - [ ] Confirm signup
  - [ ] Magic link
  - [ ] Change email
  - [ ] Reset password (optional)
- [ ] Verify links include `{{ confirmation_url }}` or similar placeholder
- [ ] Test by triggering emails

## Development Testing

### Test 1: Email Signup Flow
- [ ] Visit `http://localhost:3000/auth/signup`
- [ ] Enter test email (e.g., test@example.com)
- [ ] Click "Sign up with Email"
- [ ] See `/auth/verify-email` page
- [ ] Check email (may be in spam)
- [ ] Click confirmation link
- [ ] Should redirect to `/new` (dashboard)
- [ ] Verify user appears in Supabase: `SELECT * FROM users;`

### Test 2: Email Signin Flow (Existing User)
- [ ] Visit `http://localhost:3000/auth/signin`
- [ ] Enter test email (from Test 1)
- [ ] See "Check your email" message
- [ ] Check email for magic link
- [ ] Click magic link
- [ ] Should redirect to `/new`

### Test 3: Email Signin Flow (Non-existent User)
- [ ] Visit `http://localhost:3000/auth/signin`
- [ ] Enter non-existent email (e.g., notexist@example.com)
- [ ] Should see error: "User not found. Please sign up first."
- [ ] Should NOT receive email

### Test 4: Google OAuth Signup
- [ ] Visit `http://localhost:3000/auth/signup`
- [ ] Click "Continue with Google"
- [ ] Go through Google auth
- [ ] Should redirect to `/new`
- [ ] Verify user appears in Supabase users table

### Test 5: Duplicate Email Prevention
- [ ] Sign up with email1@test.com
- [ ] Try to sign up again with email1@test.com
- [ ] Should see error: "Email already registered. Please sign in instead."

## Production Deployment

### Step 1: Update Environment Variables
- [ ] Set `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
- [ ] Update `SUPABASE_SERVICE_ROLE_KEY` (use secret management)
- [ ] Remove service role key from repository

### Step 2: Update Redirect URLs in Supabase
- [ ] Authentication > Providers > Email
  - [ ] Add: `https://yourdomain.com/auth/callback`
  - [ ] Remove: `http://localhost:3000/auth/callback` (optional, for testing)

- [ ] Authentication > Providers > Google
  - [ ] Add: `https://yourdomain.com/auth/callback`
  - [ ] Verify Google OAuth credentials have production redirect URL

### Step 3: Configure Email Service
- [ ] Supabase > Authentication > Email Templates
  - [ ] Update email addresses to use your domain
  - [ ] Update template text if needed
  - [ ] Configure SMTP or Resend for production emails

### Step 4: Enable RLS Policies
- [ ] Test that users can only access their own data
- [ ] Verify `users` table has proper RLS policies
- [ ] Test with multiple accounts

### Step 5: Set Up Monitoring
- [ ] Monitor signup errors in logs
- [ ] Monitor failed signin attempts
- [ ] Set up alerts for authentication failures

### Step 6: Test Production Auth Flow
- [ ] Deploy to production
- [ ] Test signup with real email
- [ ] Test signin with real email
- [ ] Test Google OAuth
- [ ] Verify emails are delivered

## Troubleshooting

### Issue: Users table doesn't exist
**Solution**: 
1. Go to Supabase Dashboard
2. Run this SQL in the SQL Editor:
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Issue: Users not receiving emails
**Solution**:
1. Check SMTP configuration in Supabase
2. Check email templates have correct variables
3. Check spam folder
4. Test with Supabase email test feature

### Issue: OAuth redirect not working
**Solution**:
1. Verify redirect URL in Supabase matches exactly
2. Verify Google OAuth credentials are correct
3. Check browser console for errors
4. Verify `NEXT_PUBLIC_APP_URL` matches redirect URL

### Issue: User record not created after signup
**Solution**:
1. Check API route `/api/auth/signup` is deployed
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Check database permissions
4. Check Supabase logs for errors

### Issue: Signin fails for existing user
**Solution**:
1. Verify user exists in `users` table: `SELECT * FROM users WHERE email = 'test@example.com';`
2. Verify email matches exactly (case-sensitive in database)
3. Check if user was created via OAuth (may be pending email confirmation)

## References

- API Routes Created:
  - `/app/api/auth/signup/route.ts` - Signup validation and OTP
  - `/app/api/auth/signin/route.ts` - Signin validation
  - `/app/api/auth/confirm/route.ts` - Confirmation handler

- Updated Pages:
  - `/app/auth/signup/page.tsx` - Signup UI
  - `/app/auth/signin/page.tsx` - Signin UI
  - `/app/auth/callback-page/page.tsx` - OAuth callback
  - `/app/auth/callback/route.ts` - Email confirmation handler

- New Files:
  - `/lib/auth-utils.ts` - Auth utility functions
  - `/migrations/setup_auth_users_table.sql` - Database migration
  - `/AUTH_FLOW_IMPLEMENTATION.md` - Full documentation
  - `/AUTH_SETUP_CHECKLIST.md` - This file

## Questions?

If something isn't working:
1. Check browser console for errors
2. Check Supabase logs
3. Verify environment variables
4. Check database for user records
5. Test email delivery
6. Review error messages in API responses
