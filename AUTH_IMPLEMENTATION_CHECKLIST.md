# Auth Implementation Checklist

## Files Created ✅

- [x] `app/auth/signin/page.tsx` - Sign in page
- [x] `app/auth/signup/page.tsx` - Sign up page  
- [x] `app/auth/verify-email/page.tsx` - Email verification
- [x] `app/auth/callback/route.ts` - OAuth callback handler
- [x] `lib/auth-context.tsx` - Auth state management
- [x] `lib/protected-route.tsx` - Route protection HOC
- [x] `AUTH_SETUP_GUIDE.md` - Complete setup instructions
- [x] `AUTH_FLOW_DIAGRAM.md` - Visual flow diagrams

---

## Step 1: Supabase Configuration

### Enable Auth Methods
- [ ] Go to Supabase Dashboard
- [ ] Navigate to Authentication → Providers
- [ ] Enable **Email/Password**
  - [ ] Disable "Confirm email" if testing (or use real email)
- [ ] Enable **Google**
  - [ ] Paste Google Client ID
  - [ ] Paste Google Client Secret
- [ ] Verify both are checked/enabled

### Google OAuth Setup (if not done)
- [ ] Create Google Cloud project
- [ ] Create OAuth 2.0 Web credentials
- [ ] Add authorized redirect URIs:
  ```
  http://localhost:3000/auth/callback
  https://yourdomain.com/auth/callback
  ```
- [ ] Copy Client ID → paste in Supabase
- [ ] Copy Client Secret → paste in Supabase

### Email Configuration
- [ ] Go to Authentication → Email Templates
- [ ] Verify confirmation email template
- [ ] Add your app URL to magic link (if using)
- [ ] Send test email to confirm it works

---

## Step 2: Environment Variables

### Local Development (.env.local)
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (.env.production)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

- [ ] Copy values from Supabase Settings
- [ ] Add to `.env.local` for local development
- [ ] Add to deployment platform (Vercel, etc)
- [ ] Test with `echo $NEXT_PUBLIC_APP_URL` to verify

---

## Step 3: Database Setup

### Create Users Table
- [ ] Go to Supabase SQL Editor
- [ ] Copy SQL from AUTH_SETUP_GUIDE.md section "Database Schema"
- [ ] Run all SQL commands:
  - [ ] CREATE TABLE users
  - [ ] CREATE FUNCTION handle_new_user()
  - [ ] CREATE TRIGGER on_auth_user_created
- [ ] Verify table created successfully
- [ ] Verify trigger is active

### Test Database Trigger
- [ ] Create user via /auth/signup
- [ ] Check "users" table in Supabase
- [ ] Verify user row was auto-created
- [ ] Verify all default values are set

---

## Step 4: Update App Layout

### Wrap App with AuthProvider
```tsx
// app/layout.tsx
import { AuthProvider } from '@/lib/auth-context'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

- [ ] Update `app/layout.tsx`
- [ ] Import AuthProvider
- [ ] Wrap children with `<AuthProvider>`
- [ ] Save and test

---

## Step 5: Protect Existing Routes

### Update Protected Pages
For any page that requires authentication (e.g., `/new`, `/history`, `/profile`):

```tsx
// Before
export default function MyPage() {
  return <div>...</div>
}

// After
import { withProtectedRoute } from '@/lib/protected-route'

function MyPage() {
  return <div>...</div>
}

export default withProtectedRoute(MyPage)
```

Pages to wrap:
- [ ] `app/new/page.tsx`
- [ ] `app/history/page.tsx`
- [ ] `app/profile/page.tsx`
- [ ] `app/settings/page.tsx`

---

## Step 6: Local Testing

### Test Email/Password Sign Up
- [ ] Navigate to `http://localhost:3000/auth/signup`
- [ ] Enter email: `test@example.com`
- [ ] Enter password: `TestPass123`
- [ ] Confirm password: `TestPass123`
- [ ] Click "Create Account"
- [ ] If email required: Check inbox for verification link
- [ ] Click verification link
- [ ] Should redirect to `/new`
- [ ] Should be logged in
- [ ] Check Supabase: user should exist in `users` table

### Test Email/Password Sign In
- [ ] Navigate to `http://localhost:3000/auth/signin`
- [ ] Enter same email and password
- [ ] Click "Sign In"
- [ ] Should redirect to `/new`
- [ ] Should be logged in

### Test Google OAuth (Dev)
For testing Google OAuth locally, you need to:

Option A: Use Google CLI
```bash
# Install Google CLI
npm install -g firebase-tools

# Create test OAuth token
firebase login
```

Option B: Use Supabase Test Mode
- [ ] In Supabase, find "Test User" feature
- [ ] Create test Google user
- [ ] Use for testing

Option C: Deploy to staging
- [ ] Push to staging domain (e.g., staging.yourdomain.com)
- [ ] Add staging domain to Google OAuth redirect URIs
- [ ] Test Google OAuth on staging

### Test Protected Routes
- [ ] Sign out via profile page (or clear cookies)
- [ ] Try to navigate to `/new`
- [ ] Should redirect to `/auth/signin`
- [ ] Sign in
- [ ] Should redirect to `/new`
- [ ] Should be accessible

### Test Session Persistence
- [ ] Sign in to app
- [ ] Refresh page (Cmd/Ctrl + R)
- [ ] Should still be logged in
- [ ] Check console: should not see "Loading..." for long

---

## Step 7: Update Navigation Components

### Update Links to Auth Routes
In your Sidebar/Navbar components:

```tsx
// Import auth hook
import { useAuth } from '@/lib/auth-context'

export function Navbar() {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <div>
        <Link href="/auth/signin">Sign In</Link>
        <Link href="/auth/signup">Sign Up</Link>
      </div>
    )
  }

  return (
    <div>
      <span>{user.email}</span>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

- [ ] Find existing sign in/sign up links
- [ ] Update to `/auth/signin` and `/auth/signup`
- [ ] Update sign out button to use `useAuth()` hook
- [ ] Test links work correctly

---

## Step 8: Error Handling

### Test Error Scenarios
- [ ] Weak password on signup → should show error
- [ ] Passwords don't match → should show error
- [ ] Email already exists → should show error  
- [ ] Invalid email on signin → should show error
- [ ] Wrong password on signin → should show error
- [ ] Network error (disconnect internet) → should handle gracefully

### Test Error Messages
- [ ] All error messages are clear and helpful
- [ ] No console errors logged
- [ ] User can retry after error
- [ ] Error dismisses when form changes

---

## Step 9: Styling Verification

- [ ] Sign in page matches design system
- [ ] Sign up page matches design system
- [ ] Verify email page matches design system
- [ ] Dark background: `from-[#050505] to-[#1a1a1a]`
- [ ] Neon color used for accents
- [ ] Buttons use white background
- [ ] Glassmorphism effect on cards
- [ ] Glow effects visible
- [ ] Mobile responsive (test on phone)
- [ ] Tablet responsive (test on tablet)

---

## Step 10: Production Deployment

### Pre-deployment Checklist
- [ ] All tests passing locally
- [ ] Environment variables set in deployment platform
- [ ] Google OAuth redirect URI added for production domain
- [ ] Email is set to require confirmation (optional but recommended)
- [ ] Supabase email templates customized with your branding
- [ ] Password requirements are clear to users
- [ ] Privacy policy and terms links correct

### Deploy to Production
- [ ] Push code to main/production branch
- [ ] Wait for build to complete
- [ ] Verify all auth routes accessible
- [ ] Test sign up end-to-end
- [ ] Test sign in end-to-end
- [ ] Test Google OAuth if configured
- [ ] Test protected routes redirect properly
- [ ] Check Supabase logs for errors
- [ ] Monitor user signups in dashboard

### Post-deployment
- [ ] Send test emails to team members
- [ ] Have team members test signup/signin
- [ ] Check Supabase analytics
- [ ] Monitor for auth errors
- [ ] Have support info ready for users

---

## Common Issues & Solutions

### Issue: "Auth check failed"
**Solution:**
- [ ] Verify NEXT_PUBLIC_SUPABASE_URL is set
- [ ] Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is set
- [ ] Check Supabase project is running
- [ ] Check network requests in DevTools

### Issue: "Google OAuth not redirecting"
**Solution:**
- [ ] Verify redirect URI in Google Console
- [ ] Verify redirect URI in Supabase matches
- [ ] Check URL format is exactly the same
- [ ] Clear browser cookies and try again

### Issue: "Email verification not arriving"
**Solution:**
- [ ] Check spam/junk folder
- [ ] Verify email is enabled in Supabase
- [ ] Check email template in Supabase
- [ ] Try with different email address
- [ ] Check Supabase logs for email errors

### Issue: "Protected routes not redirecting"
**Solution:**
- [ ] Ensure AuthProvider wraps entire app
- [ ] Check withProtectedRoute is applied
- [ ] Verify AuthContext is imported correctly
- [ ] Check browser console for errors

### Issue: "Session not persisting on page refresh"
**Solution:**
- [ ] Check Supabase auth settings → Enable "Persist session"
- [ ] Check browser cookies are not blocked
- [ ] Verify useEffect in AuthProvider is running
- [ ] Check network tab for session request

---

## Rollback Plan

If issues occur in production:

1. [ ] Disable auth temporarily
   ```tsx
   // In AuthProvider, remove onAuthStateChange listener
   // Set user to null
   ```

2. [ ] Revert to previous deploy
   ```bash
   git revert <commit-hash>
   git push
   ```

3. [ ] Check Supabase logs for errors
   - Go to Logs in Supabase dashboard
   - Look for auth-related errors

4. [ ] Notify users of auth issues
   - Add banner to app
   - Send status email

---

## Verification Checklist (Final)

- [ ] Sign up works with email
- [ ] Sign in works with email  
- [ ] Sign out works
- [ ] Protected routes redirect when logged out
- [ ] Protected routes accessible when logged in
- [ ] Email verification flow works
- [ ] Session persists on page refresh
- [ ] Google OAuth works (if enabled)
- [ ] Error messages display correctly
- [ ] Loading states show correctly
- [ ] Styling matches design system
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Supabase logs show no errors
- [ ] Users table populated correctly

---

## Next Steps After Implementation

1. [ ] Add "Forgot Password" functionality
2. [ ] Add email change functionality in profile
3. [ ] Add two-factor authentication
4. [ ] Add password strength meter
5. [ ] Add social login (GitHub, etc)
6. [ ] Add account deletion feature
7. [ ] Add session management (multiple devices)
8. [ ] Add login activity logging
9. [ ] Add suspicious activity detection
10. [ ] Add passkey/biometric auth

---

**Status:** Ready for Implementation ✅

Last Updated: December 2024
