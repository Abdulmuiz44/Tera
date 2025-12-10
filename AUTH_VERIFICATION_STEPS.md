# Google OAuth & Auth Setup - Verification Steps

## ✅ Setup Complete - Now Verify

### Your `.env.local` Should Have:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=https://teraai.chat
```

### Google Cloud Console Should Have:
- ✅ OAuth 2.0 Client ID created
- ✅ Client Secret copied
- ✅ Authorized redirect URIs:
  - `https://teraai.chat/auth/callback`
  - `https://your-project.supabase.co/auth/v1/callback`

### Supabase Dashboard Should Have:
- ✅ Authentication → Providers → Google enabled
- ✅ Google Client ID pasted
- ✅ Google Client Secret pasted
- ✅ Email/Password enabled
- ✅ "Confirm email" toggle ON
- ✅ Email templates configured

### Database Should Have:
- ✅ `users` table created
- ✅ Trigger `on_auth_user_created` set up
- ✅ Auto-create user function running

---

## 🧪 Test Sign Up Flow

### Local Testing (http://localhost:3000):
1. Visit `http://localhost:3000/auth/signup`
2. Enter email: `test@example.com`
3. Enter password: `TestPass123`
4. Confirm password: `TestPass123`
5. Click "Create Account"
6. Should see: "Check your email for verification link"
7. Check email inbox (or Supabase logs)
8. Click verification link
9. Should redirect to `/new`
10. Check Supabase: `users` table should have new row with:
    - `id` = user's ID
    - `email` = test@example.com
    - `subscription_plan` = free
    - `created_at` = now

### Production Testing (https://teraai.chat):
- Same flow as above
- Make sure redirect URL is `https://teraai.chat/auth/callback`

---

## 🔐 Test Google OAuth

### Local Testing:
1. Visit `http://localhost:3000/auth/signup`
2. Click "Sign up with Google"
3. Should redirect to Google login
4. Sign in with your Google account
5. Should show permissions request
6. Click "Allow"
7. Should redirect to `http://localhost:3000/auth/callback#access_token=...`
8. Should auto-redirect to `/new`
9. Should be logged in
10. Check Supabase `users` table - should have new row

### Production Testing:
- Same flow
- Should redirect to `https://teraai.chat/auth/callback#access_token=...`
- Should work without `localhost` errors

---

## 🔑 Test Sign In

1. Visit `/auth/signin`
2. Enter email from signup
3. Enter password from signup
4. Should redirect to `/new`
5. Should be logged in

---

## 🔑 Test Forgot Password

1. Visit `/auth/signin`
2. Click "Forgot password?"
3. Enter email
4. Should show: "Check your email for reset link"
5. Check email
6. Click reset link
7. Should redirect to `/auth/reset-password`
8. Set new password: `NewPass123`
9. Confirm: `NewPass123`
10. Should redirect to `/auth/signin`
11. Sign in with new password
12. Should work

---

## ❌ Troubleshooting

### "Google OAuth redirects to localhost instead of production"
**Problem:** `NEXT_PUBLIC_APP_URL` is wrong
**Solution:** 
- Check `.env.local` has `NEXT_PUBLIC_APP_URL=https://teraai.chat`
- Restart dev server: `npm run dev`
- Or redeploy to production

### "Email not arriving"
**Check:**
1. Supabase → Logs → Check for email errors
2. Check spam folder
3. Make sure "Confirm email" is enabled in Supabase
4. Check email template in Supabase settings

### "User row not created in database"
**Check:**
1. Supabase → Database → Extensions
2. Verify `pg_cron` is enabled (for triggers)
3. Run migration SQL again to recreate trigger
4. Check trigger exists: `on_auth_user_created`

### "Session lost after page refresh"
**Check:**
1. Browser cookies enabled
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. `NEXT_PUBLIC_SUPABASE_URL` is correct
4. AuthProvider wraps all routes in `app/layout.tsx`

### "Protected routes redirect to signin"
**Check:**
1. AuthProvider is in `app/layout.tsx`
2. Routes are wrapped with `withProtectedRoute()`
3. Session exists (check browser DevTools → Storage → Cookies)

---

## 📊 Test Results Checklist

- [ ] Email signup works
- [ ] Email verification required
- [ ] Confirmation link works
- [ ] User auto-redirects to `/new`
- [ ] User row created in database
- [ ] User can sign in with email/password
- [ ] Google OAuth works on localhost
- [ ] Google OAuth works on production domain
- [ ] Google creates user automatically
- [ ] Forgot password email arrives
- [ ] Password reset works
- [ ] Session persists on page refresh
- [ ] Protected routes work
- [ ] Logout works

---

## 🚀 When Everything Works

You'll see:

**Sign Up:**
```
1. Enter email/password → Click Create Account
2. See: "Check your email..."
3. Click email link → Auto-redirected to /new
4. Database has new user
```

**Google OAuth:**
```
1. Click "Sign up with Google"
2. See Google login → Click Allow
3. Auto-redirected to /new (no visible callback)
4. Database has new user with Google account
```

**Sign In:**
```
1. Enter email/password → Click Sign In
2. Auto-redirected to /new
3. Can access protected pages
```

---

## 📞 Quick Checks

**Is Auth Working?**
```
1. Open browser DevTools
2. Go to Console
3. Run: localStorage.getItem('sb-xxx-auth-token')
4. Should show JWT token (not null)
```

**Is Database Connected?**
```
1. Supabase Dashboard → users table
2. Should see rows after signup
3. Check email, subscription_plan fields
```

**Is Email Working?**
```
1. Supabase Dashboard → Logs
2. Filter by "email"
3. Should see "Email sent" logs
4. Check for errors if emails not arriving
```

---

## ✅ Final Verification

Everything is set up. Now:

1. **Make sure these URLs are in Supabase AND Google:**
   - `https://teraai.chat/auth/callback`
   - `https://your-project.supabase.co/auth/v1/callback`

2. **Make sure `.env.local` has:**
   - Correct Supabase URL and key
   - `NEXT_PUBLIC_APP_URL=https://teraai.chat` (or your domain)

3. **Test the flows above**

4. **Check Supabase logs for errors**

If everything passes the tests above, auth is fully functional!

---

**Status:** Ready to test
**Time to test:** ~10 minutes
