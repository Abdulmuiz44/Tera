# Authentication - Production Setup

## Quick Setup for teraai.chat

### 1. Environment Variables

Set these in your deployment platform (Vercel, etc):

```env
# MUST be the production domain - this fixes the OAuth redirect issue
NEXT_PUBLIC_APP_URL=https://teraai.chat

# Supabase (from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Other existing variables
MISTRAL_API_KEY=...
SERPER_API_KEY=...
LEMON_SQUEEZY_WEBHOOK_SECRET=...
LEMON_SQUEEZY_PRO_VARIANT_ID=...
LEMON_SQUEEZY_PLUS_VARIANT_ID=...
```

### 2. Supabase Configuration

**Enable Auth Methods:**
1. Go to Supabase Dashboard
2. Authentication → Providers
3. Enable **Email/Password**
   - Toggle "Confirm email" ON (requires email confirmation)
4. Enable **Google OAuth**
   - Paste Google Client ID
   - Paste Google Client Secret

**Google OAuth Redirect URIs** (in both Google Console AND Supabase):
```
https://teraai.chat/auth/callback
https://your-project.supabase.co/auth/v1/callback
```

**Email Configuration:**
1. Go to Authentication → Email Templates
2. Customize confirmation email if needed
3. Verify "Magic Link" vs "Confirmation Link" is set

### 3. Database Migrations

Run this SQL in Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  subscription_plan TEXT DEFAULT 'free',
  monthly_lesson_plans INTEGER DEFAULT 0,
  daily_chats INTEGER DEFAULT 0,
  daily_file_uploads INTEGER DEFAULT 0,
  monthly_web_searches INTEGER DEFAULT 0,
  plan_reset_date TIMESTAMP,
  chat_reset_date TIMESTAMP,
  web_search_reset_date TIMESTAMP,
  full_name TEXT,
  school TEXT,
  grade_levels TEXT[],
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Auto-create user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  
  UPDATE public.users 
  SET 
    plan_reset_date = now() + interval '1 month',
    chat_reset_date = now() + interval '1 day',
    web_search_reset_date = now() + interval '30 days'
  WHERE id = new.id;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
```

### 4. Authentication Flows

#### Sign Up Flow
1. User visits `/auth/signup`
2. Enters email, password (validated: 8+, uppercase, number)
3. Confirms password
4. Account created in Supabase auth
5. Confirmation email sent
6. User clicks email link
7. Redirected to `/auth/callback` → `/auth/callback-page`
8. Session created, redirected to `/new`
9. User profile auto-created in `users` table

#### Sign In Flow
1. User visits `/auth/signin`
2. Enters email + password
3. Session created
4. Redirected to `/new`

#### Google OAuth Flow
1. User clicks "Google" button
2. Redirected to Google
3. User approves permissions
4. Google redirects to `https://teraai.chat/auth/callback#access_token=...`
5. Supabase library auto-processes token
6. Redirected to `/auth/callback-page`
7. Session verified and redirected to `/new`
8. User profile auto-created if new user

#### Forgot Password Flow
1. User visits `/auth/signin`
2. Clicks "Forgot password?"
3. Redirected to `/auth/forgot-password`
4. Enters email
5. Receives password reset email
6. Clicks link in email
7. Redirected to `/auth/reset-password`
8. Sets new password
9. Redirected to `/auth/signin`

### 5. User Data Storage

When user signs up or uses Google OAuth:
- Account created in `auth.users` (Supabase manages)
- Row auto-created in `users` table with:
  - `id` (from auth)
  - `email` (from auth)
  - `subscription_plan: 'free'` (default)
  - `created_at` (now)
  - All counters set to 0
  - Reset dates set (1 month, 1 day, 30 days)

### 6. Email Verification

**Must be enabled in Supabase settings:**
- Auth → Settings → Email
- Toggle "Confirm email" ON
- Use "Confirmation Link" (not Magic Link)

**Flow:**
1. User signs up
2. Email sent with confirmation link
3. User clicks link
4. Session created, user logged in
5. Redirected to `/auth/callback-page` → `/new`

### 7. Password Reset

**For users who forget password:**
1. Click "Forgot password?" on signin page
2. Receive reset email (valid 1 hour)
3. Click link in email
4. Set new password
5. Auto-redirected to signin

### 8. OAuth Token Handling

**Issue:** OAuth redirects to `localhost:3000` instead of `https://teraai.chat`
**Root Cause:** `NEXT_PUBLIC_APP_URL` not set in production
**Solution:** Set env variable before deploying

**How OAuth works:**
- Google redirects to callback URL with hash fragment: `#access_token=...`
- Supabase client library auto-detects from URL
- Session created automatically
- Page redirects to dashboard

### 9. Testing Checklist

- [ ] User can sign up with email
- [ ] Confirmation email arrives
- [ ] Click link → auto-signed in → redirected to `/new`
- [ ] New user row created in `users` table
- [ ] User can sign in with email
- [ ] User can use Google OAuth
- [ ] Google OAuth creates user row
- [ ] User can reset forgotten password
- [ ] Protected routes redirect when logged out
- [ ] Session persists on page refresh

### 10. Verification

Check user data storage:
```sql
-- View all users
SELECT id, email, subscription_plan, created_at FROM users;

-- Check a specific user
SELECT * FROM users WHERE email = 'user@example.com';
```

---

## Files Modified

- `app/auth/signin/page.tsx` - Forgot password link
- `app/auth/signup/page.tsx` - Fixed email redirect URL
- `app/auth/forgot-password/page.tsx` - NEW
- `app/auth/reset-password/page.tsx` - NEW
- `app/auth/callback/route.ts` - Updated handler
- `app/auth/callback-page/page.tsx` - NEW
- `.env.example` - Updated with correct variable names

## URLs

```
/auth/signin              Sign in
/auth/signup             Sign up
/auth/verify-email       Email verification
/auth/forgot-password    Password reset request
/auth/reset-password     Set new password
/auth/callback           Redirect handler (invisible)
/auth/callback-page      OAuth/email handler (invisible)
```

## Important Notes

1. **NEXT_PUBLIC_APP_URL** must match your production domain
   - For localhost: `http://localhost:3000`
   - For production: `https://teraai.chat`

2. Email confirmation is required
   - Users receive email
   - Must click link to activate account
   - Link expires in 24 hours (configurable in Supabase)

3. Password reset emails
   - Valid for 1 hour
   - Automatically create new session

4. User data is auto-created
   - No additional signup form needed
   - All fields pre-populated from auth
   - Subscription defaults to 'free'

5. OAuth is transparent
   - User doesn't see redirect
   - Auto-creates user account
   - No additional data required

---

**Status**: Ready for production
**Last Updated**: Dec 10, 2025
