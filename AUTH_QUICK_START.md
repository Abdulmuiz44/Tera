# Authentication Quick Start Guide

## 1. Database Migration (5 minutes)

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste content from: `migrations/setup_auth_users_table.sql`
3. Click "Run"
4. Verify: `SELECT * FROM users;` (should return 0 rows)

## 2. Environment Setup (5 minutes)

1. Open `.env.local`
2. Add these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Get keys from Supabase → Settings → API

## 3. Email Configuration (10 minutes)

### For Development (Easy - Use Supabase Default)
No action needed. Supabase provides email testing.

### For Production (Configure SMTP or Resend)
1. Go to Supabase → Authentication → Email Templates
2. Configure SMTP provider OR Resend
3. Update email addresses and custom domains

## 4. Google OAuth Setup (10 minutes - Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Tera Auth"
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (dev)
   - `https://yourdomain.com/auth/callback` (prod)
6. Copy Client ID and Secret
7. In Supabase → Authentication → Providers → Google:
   - Enable Google
   - Paste Client ID and Secret

## 5. Test the Auth Flow (5 minutes)

### Email Signup Test
```bash
1. Go to: http://localhost:3000/auth/signup
2. Enter: test@example.com
3. Click: "Sign up with Email"
4. You'll see: /auth/verify-email page
5. Check your email for confirmation link
6. Click the link
7. You should be redirected to: /new (dashboard)
```

### Email Signin Test
```bash
1. Go to: http://localhost:3000/auth/signin
2. Enter: test@example.com (the one you just signed up with)
3. Click: "Continue"
4. You should see: "Check your email for an authentication link"
5. Check your email for signin link
6. Click the link
7. You should be redirected to: /new (dashboard)
```

### Google OAuth Test
```bash
1. Go to: http://localhost:3000/auth/signup
2. Click: "Continue with Google"
3. Sign in with your Google account
4. Authorize Tera
5. You should be redirected to: /new (dashboard)
```

## 6. Verify User Data

After completing signup/signin tests:

1. Go to Supabase Dashboard → Table Editor
2. Click → users table
3. You should see your test users:
   - email column has your test emails
   - created_at has timestamp
   - id matches auth.users id

## How the Auth Flow Works

```
SIGNUP (Email):
user@example.com → signup page → API validates email → Supabase sends OTP
→ user clicks email link → account created → dashboard

SIGNUP (Google):
"Continue with Google" → Google login → Supabase auto-creates auth account
→ user record created in database → dashboard

SIGNIN:
user@example.com → signin page → API validates user exists → Supabase sends OTP
→ user clicks email link → session created → dashboard
```

## File Changes Summary

### New API Routes
- `app/api/auth/signup/route.ts` - Validates email uniqueness, sends OTP
- `app/api/auth/signin/route.ts` - Validates user exists, sends magic link
- `app/api/auth/confirm/route.ts` - Creates user record after email confirmation

### Updated Pages
- `app/auth/signup/page.tsx` - Now uses signup API
- `app/auth/signin/page.tsx` - Now uses signin API with better validation
- `app/auth/callback/route.ts` - Now creates user records in database
- `app/auth/callback-page/page.tsx` - Fixed hydration issues

### New Utilities
- `lib/auth-utils.ts` - Helper functions for user management

### New Migrations
- `migrations/setup_auth_users_table.sql` - Creates users table with RLS

## Common Issues & Solutions

### "Email already registered"
**Solution**: You already signed up with that email. Try signin instead.

### "User not found"
**Solution**: Email not registered. Go to signup to create an account.

### No email received
**Solutions**:
1. Check spam folder
2. Check Supabase logs in Dashboard → Logs
3. Verify SMTP is configured (for production)
4. Use Supabase email testing feature

### OAuth redirects to signup
**Solution**: Make sure Google Client ID/Secret are correct in Supabase

### User not appearing in database
**Solutions**:
1. Refresh page → `SELECT * FROM users;` in SQL Editor
2. Check if SUPABASE_SERVICE_ROLE_KEY is set
3. Check browser console for errors
4. Check Supabase logs

## Next Steps

1. ✅ Database migration complete
2. ✅ Environment variables set
3. ✅ Auth flows tested
4. 🔲 Configure password reset (optional)
5. 🔲 Set up 2FA (optional)
6. 🔲 Configure rate limiting (recommended)
7. 🔲 Deploy to production

## Production Checklist

Before going live:
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Update Supabase redirect URLs to production domain
- [ ] Configure production email service (SMTP/Resend)
- [ ] Test auth flow in production
- [ ] Set up monitoring/alerts
- [ ] Enable rate limiting on auth endpoints
- [ ] Test user isolation (RLS policies)

## Need Help?

1. Check `AUTH_FLOW_IMPLEMENTATION.md` for detailed docs
2. Check `AUTH_SETUP_CHECKLIST.md` for troubleshooting
3. Review Supabase logs: Dashboard → Logs → Auth
4. Check browser console for error messages
5. Check email spam folder for sent emails

## Tech Stack

- **Frontend**: Next.js 14 (TypeScript + React)
- **Auth**: Supabase Auth (OTP + OAuth)
- **Database**: PostgreSQL (Supabase)
- **Security**: Row Level Security (RLS)

---

You're all set! The auth flow is now properly configured with:
✅ Email-based signup with confirmation
✅ Google OAuth integration
✅ Email-based signin with validation
✅ Automatic user record creation
✅ Data stored in Supabase database
