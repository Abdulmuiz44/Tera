# Verify Authentication Implementation

Use this checklist to verify all changes are in place.

## ✅ Step 1: Verify New Files Exist

Run these checks in your project root:

```bash
# Check API routes exist
test -f app/api/auth/signup/route.ts && echo "✅ signup/route.ts" || echo "❌ signup/route.ts missing"
test -f app/api/auth/signin/route.ts && echo "✅ signin/route.ts" || echo "❌ signin/route.ts missing"
test -f app/api/auth/confirm/route.ts && echo "✅ confirm/route.ts" || echo "❌ confirm/route.ts missing"

# Check utility files exist
test -f lib/auth-utils.ts && echo "✅ auth-utils.ts" || echo "❌ auth-utils.ts missing"

# Check migration files exist
test -f migrations/setup_auth_users_table.sql && echo "✅ setup_auth_users_table.sql" || echo "❌ setup_auth_users_table.sql missing"

# Check documentation exists
test -f AUTH_QUICK_START.md && echo "✅ AUTH_QUICK_START.md" || echo "❌ AUTH_QUICK_START.md missing"
test -f AUTH_SETUP_CHECKLIST.md && echo "✅ AUTH_SETUP_CHECKLIST.md" || echo "❌ AUTH_SETUP_CHECKLIST.md missing"
test -f AUTH_FLOW_IMPLEMENTATION.md && echo "✅ AUTH_FLOW_IMPLEMENTATION.md" || echo "❌ AUTH_FLOW_IMPLEMENTATION.md missing"
```

**On Windows (PowerShell):**
```powershell
# Check API routes
(Test-Path app/api/auth/signup/route.ts) ? "✅ signup/route.ts" : "❌ signup/route.ts missing"
(Test-Path app/api/auth/signin/route.ts) ? "✅ signin/route.ts" : "❌ signin/route.ts missing"
(Test-Path app/api/auth/confirm/route.ts) ? "✅ confirm/route.ts" : "❌ confirm/route.ts missing"

# Check utility files
(Test-Path lib/auth-utils.ts) ? "✅ auth-utils.ts" : "❌ auth-utils.ts missing"

# Check migrations
(Test-Path migrations/setup_auth_users_table.sql) ? "✅ setup_auth_users_table.sql" : "❌ setup_auth_users_table.sql missing"

# Check documentation
(Test-Path AUTH_QUICK_START.md) ? "✅ AUTH_QUICK_START.md" : "❌ AUTH_QUICK_START.md missing"
```

## ✅ Step 2: Verify Modified Files

Check that these files have been updated with new authentication code:

### File: `app/auth/signup/page.tsx`
Should contain this import:
```typescript
import { supabase } from '@/lib/supabase'
```

Should call POST /api/auth/signup:
```typescript
const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() })
})
```

### File: `app/auth/signin/page.tsx`
Should call POST /api/auth/signin:
```typescript
const response = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim() })
})
```

Should handle signUpRequired error:
```typescript
if (data.signUpRequired) {
    setError(data.error + ' Click "Sign up" to create an account.')
}
```

### File: `app/auth/callback/route.ts`
Should create user records:
```typescript
const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', data.user.id)
    .single()

if (!existingUser) {
    const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: data.user.id,
        email: data.user.email || ''
    })
}
```

### File: `app/auth/callback-page/page.tsx`
Should have mounted state:
```typescript
const [mounted, setMounted] = useState(false)

useEffect(() => {
    setMounted(true)
}, [])
```

### File: `app/auth/verify-email/page.tsx`
Should pass emailRedirectTo in resend:
```typescript
const { error: resendError } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
})
```

## ✅ Step 3: Verify API Routes Content

### Check `app/api/auth/signup/route.ts`

Should have:
- ✅ `POST` function export
- ✅ Email validation (trim and lowercase)
- ✅ Check for existing user in database
- ✅ Call supabase.auth.signInWithOtp with shouldCreateUser: true
- ✅ Return proper success/error responses
- ✅ Handle "Email already registered" error

### Check `app/api/auth/signin/route.ts`

Should have:
- ✅ `POST` function export
- ✅ Email validation (trim and lowercase)
- ✅ Check if user exists in database
- ✅ Return 404 if user not found
- ✅ Call supabase.auth.signInWithOtp with shouldCreateUser: false
- ✅ Return success response with magic link message

### Check `app/api/auth/confirm/route.ts`

Should have:
- ✅ `POST` function export
- ✅ Accept userId and email parameters
- ✅ Check if user record already exists
- ✅ Insert new user record if not exists
- ✅ Handle errors gracefully

## ✅ Step 4: Type Check

Run TypeScript compilation:

```bash
pnpm type-check
```

Expected result:
- ✅ No errors in new auth files
- ✅ No errors in modified auth pages
- ⚠️ May have pre-existing errors in unrelated files (OK)

## ✅ Step 5: Run Build

```bash
# Clear caches first
rm -rf .next tsconfig.tsbuildinfo node_modules/.cache

# Then build
pnpm build
```

Expected result:
- ✅ Build completes successfully
- ✅ .next folder is created
- ✅ No errors related to auth files

## ✅ Step 6: Verify Database Setup

After running the migration in Supabase:

```sql
-- Check users table exists
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'users';

-- Check columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Should show: id, email, created_at, updated_at

-- Check RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'users';

-- Should show: t (true) in relrowsecurity
```

## ✅ Step 7: Test Signup Flow

1. Start dev server: `pnpm dev`
2. Go to `http://localhost:3000/auth/signup`
3. Enter email: `test@example.com`
4. Click "Sign up with Email"
5. Should see `/auth/verify-email` page
6. Check email for confirmation link (or check Supabase logs)
7. Click confirmation link
8. Should be redirected to `/new` (dashboard)

## ✅ Step 8: Test Signin Flow

### Test 1: Signin with Existing User
1. Go to `http://localhost:3000/auth/signin`
2. Enter email: `test@example.com` (from signup test)
3. Click "Continue"
4. Should see "Check your email for an authentication link"
5. Click link in email
6. Should be redirected to `/new`

### Test 2: Signin with Non-existent User
1. Go to `http://localhost:3000/auth/signin`
2. Enter email: `notexist@example.com`
3. Click "Continue"
4. Should see error: "User not found. Please sign up first."
5. Should NOT receive email

## ✅ Step 9: Verify User Data Storage

In Supabase Dashboard:

1. Go to Table Editor
2. Click "users" table
3. You should see your test user:
   - `id` column (UUID from auth.users)
   - `email` column (test@example.com)
   - `created_at` column (timestamp when signed up)
   - `updated_at` column (timestamp when last modified)

## ✅ Step 10: Run Full Test Suite

```bash
# Type check
pnpm type-check

# Build
pnpm build

# If starting fresh, also run:
pnpm install
```

All should complete without errors.

## Summary

If all these checks pass, the authentication implementation is complete and working correctly.

### Checklist Summary
- [ ] All new files exist (5 files)
- [ ] All modified files have correct code (5 files)
- [ ] API routes have proper implementation (3 routes)
- [ ] TypeScript compilation passes
- [ ] Build completes successfully
- [ ] Database migration is applied
- [ ] Database has users table with RLS
- [ ] Signup flow works end-to-end
- [ ] Signin flow works for existing users
- [ ] Signin flow rejects non-existent users
- [ ] User data is stored in database

**If all items are checked**: ✅ Ready for production

**If any item fails**: See troubleshooting guide in `AUTH_SETUP_CHECKLIST.md`
