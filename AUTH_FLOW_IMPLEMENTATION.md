# Authentication Flow Implementation Guide

## Overview

This document explains the complete authentication flow for Tera, including email signup, Google OAuth, email verification, and signin validation.

## Architecture

### Auth Flow Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     SIGNUP FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User enters email → /auth/signup                           │
│  2. Form submits → POST /api/auth/signup                       │
│  3. API validates email not already registered                 │
│  4. Supabase sends OTP confirmation email                      │
│  5. User redirected → /auth/verify-email                       │
│  6. User clicks email link → /auth/callback (with code)        │
│  7. Code exchanged for session → POST /auth/callback           │
│  8. User record created in users table                         │
│  9. Redirected → /new (dashboard)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     GOOGLE OAUTH FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User clicks "Continue with Google"                         │
│  2. Supabase OAuth initiates → Google login                    │
│  3. User authorizes → Google callback                          │
│  4. Session created automatically                              │
│  5. Redirected → /auth/callback-page                           │
│  6. User record created/verified in users table                │
│  7. Redirected → /new (dashboard)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     SIGNIN FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User enters email → /auth/signin                           │
│  2. Form submits → POST /api/auth/signin                       │
│  3. API validates user exists in users table                   │
│  4. Supabase sends OTP signin email                            │
│  5. User sees confirmation message                             │
│  6. User clicks email link → /auth/callback (with code)        │
│  7. Code exchanged for session                                 │
│  8. Redirected → /new (dashboard)                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## API Routes

### `POST /api/auth/signup`

**Purpose**: Handle user signup with email validation and OTP generation

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Confirmation email sent. Please check your inbox.",
  "email": "user@example.com"
}
```

**Response (Error - Email already exists)**:
```json
{
  "error": "Email already registered. Please sign in instead.",
  "status": 409
}
```

**Behavior**:
1. Validates email is not already registered
2. Sends OTP confirmation email via Supabase
3. User must click email link to confirm signup

### `POST /api/auth/signin`

**Purpose**: Validate user exists before sending signin link

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Sign in link sent to your email. Please check your inbox.",
  "email": "user@example.com"
}
```

**Response (Error - User not found)**:
```json
{
  "error": "User not found. Please sign up first.",
  "signUpRequired": true,
  "status": 404
}
```

**Behavior**:
1. Checks if user exists in `users` table
2. If user not found, prompts to signup
3. If user exists, sends magic link via Supabase OTP

### `POST /api/auth/confirm`

**Purpose**: Confirm user after email verification

**Request**:
```json
{
  "userId": "uuid",
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User confirmed and ready to access Tera"
}
```

**Behavior**:
1. Creates or verifies user record in `users` table
2. Links authenticated user to user profile

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow service role to insert users" ON users FOR INSERT WITH CHECK (true);
```

## Environment Setup

Ensure these variables are in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

## File Structure

```
app/
├── auth/
│   ├── callback/
│   │   └── route.ts              # Handle email confirmation codes
│   ├── callback-page/
│   │   └── page.tsx              # OAuth callback handler
│   ├── signin/
│   │   └── page.tsx              # Signin page
│   ├── signup/
│   │   └── page.tsx              # Signup page
│   ├── verify-email/
│   │   └── page.tsx              # Email verification page
│   └── confirmation-success/
│       └── page.tsx              # Success page
├── api/
│   └── auth/
│       ├── signup/
│       │   └── route.ts          # Signup API
│       ├── signin/
│       │   └── route.ts          # Signin API
│       └── confirm/
│           └── route.ts          # Confirmation API

lib/
├── auth-utils.ts                 # Auth helper functions
├── auth-context.tsx              # Auth state provider
└── supabase.ts                   # Supabase client config
```

## Key Changes Made

### 1. User Creation on Signup/Google OAuth
- **Before**: No user record was created in the database
- **After**: User record automatically created when email is confirmed or Google OAuth completes

### 2. Email Validation on Signin
- **Before**: Anyone could attempt signin regardless of account existence
- **After**: System validates user exists before sending magic link

### 3. Centralized User Management
- Added `auth-utils.ts` with helper functions:
  - `ensureUserRecord()` - Create or verify user
  - `checkUserExists()` - Check if user registered
  - `getUserByEmail()` - Get user by email
  - `getUserById()` - Get user by ID

### 4. Proper OAuth Handling
- Updated callback route to create user records for OAuth signups
- Ensures Google authenticated users are stored in database

### 5. API Route Validation
- New API routes provide server-side validation
- Prevents frontend-only validation bypasses
- Better error handling and user guidance

## Testing the Flow

### Test Signup (Email)
1. Go to `/auth/signup`
2. Enter email address
3. Check email for confirmation link
4. Click link to confirm
5. Should be redirected to `/new` dashboard

### Test Signup (Google)
1. Go to `/auth/signup`
2. Click "Continue with Google"
3. Authorize with Google account
4. Should be redirected to `/new` dashboard

### Test Signin
1. Go to `/auth/signin`
2. Enter registered email
3. Check email for signin link
4. Click link to signin
5. Should be redirected to `/new` dashboard

### Test Signin Error
1. Go to `/auth/signin`
2. Enter unregistered email
3. Should see error: "User not found. Please sign up first."

## Supabase Configuration

### Email Templates

Make sure your Supabase project has proper email templates configured:

1. **Signup Confirmation Email**
   - Template: `confirm_signup`
   - Should include magic link with code parameter

2. **Signin Email**
   - Template: `magic_link`
   - Should include magic link with code parameter

### Auth Settings

1. Go to Supabase Dashboard → Authentication → Policies
2. Ensure:
   - Email confirmations are enabled
   - Magic link emails are enabled
   - Redirect URLs include:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

### OAuth Configuration

1. Set up Google OAuth in Supabase:
   - Add Google OAuth provider
   - Configure Google client ID and secret
   - Add redirect URLs

## Production Deployment

### Before Deploying

1. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   SUPABASE_SERVICE_ROLE_KEY=your_production_key
   ```

2. **Enable RLS Policies**
   - Verify all RLS policies are in place
   - Test user isolation

3. **Test Auth Flow**
   - Test signup with email
   - Test signin with existing user
   - Test Google OAuth

4. **Email Configuration**
   - Configure SMTP or Resend for emails
   - Test email delivery
   - Update email templates with production URLs

5. **Rate Limiting**
   - Implement rate limiting on auth endpoints
   - Prevent brute force attacks

## Troubleshooting

### Users can't receive confirmation emails
- Check Supabase email settings
- Verify email templates exist
- Check spam folder
- Verify SMTP configuration

### User records not being created
- Check API routes are deployed
- Verify service role key is set
- Check database permissions

### OAuth not working
- Verify Google OAuth credentials
- Check redirect URLs are correct
- Ensure OAuth provider is enabled in Supabase

### Users can't signin
- Verify user record exists in users table
- Check email address matches exactly
- Verify auth session is valid

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
