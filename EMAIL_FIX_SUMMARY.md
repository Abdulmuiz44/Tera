# Email Not Saving - Fix Summary

## What Was Wrong
New users signing up weren't having their emails stored in the Supabase `users` table.

## Root Causes
1. **No email validation** - Code allowed empty emails: `email: data.user.email || ''`
2. **RLS policies** - Service role might not have had explicit insert permissions
3. **No fallback** - If user record existed without email, no update was attempted
4. **Lost metadata** - OAuth data (avatar, full name) wasn't being captured

## What Was Fixed

### 1. app/auth/callback/route.ts (Modified)
```typescript
// BEFORE: Could insert empty email
email: data.user.email || '',

// AFTER: Validates email exists, stores in lowercase
if (!data.user.email) {
  return NextResponse.redirect(...error=no_email...)
}
email: data.user.email.toLowerCase(),

// BONUS: Captures profile data from OAuth
profile_image_url: data.user.user_metadata?.avatar_url || null,
full_name: data.user.user_metadata?.full_name || null,

// FALLBACK: Updates email if user exists without it
else if (!existingUser.email) {
  // update email
}
```

### 2. app/api/auth/confirm/route.ts (Modified)
```typescript
// BEFORE: No email validation
if (!userId || !email) { return error }

// AFTER: Validates email format
const trimmedEmail = email.trim().toLowerCase()
if (!trimmedEmail || !trimmedEmail.includes('@')) {
  return error
}

// BONUS: Can update email for existing users
else if (!existingUser.email) {
  // update email
}
```

### 3. migrations/fix_email_rls.sql (New File)
- Ensures email column is NOT NULL
- Fixes RLS policies for service role
- Creates unique constraint on email
- Run in Supabase SQL Editor

## What You Need to Do

### Immediate Actions
1. ✅ Code changes already applied
2. ⏳ Run the RLS migration in Supabase

### Running the RLS Migration
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste content from `migrations/fix_email_rls.sql`
4. Click "Run"

### Testing
1. Create a new test account
2. Sign up with email
3. Click verification link
4. Check Supabase users table
5. Email should be populated

### Cleanup (Optional)
If existing users are missing emails:
```sql
-- Check for users without emails
SELECT COUNT(*) FROM users WHERE email IS NULL OR email = '';

-- If any exist, populate from auth.users
UPDATE users u
SET email = a.email
FROM auth.users a
WHERE u.id = a.id AND (u.email IS NULL OR u.email = '');
```

## Files Changed
- `app/auth/callback/route.ts` - Email validation + metadata capture
- `app/api/auth/confirm/route.ts` - Email validation + fallback update
- `migrations/fix_email_rls.sql` - RLS policy fixes (NEW)
- `CRITICAL_FIX_REQUIRED.md` - Documentation updated
- `EMAIL_NOT_SAVING_FIX.md` - Detailed fix guide (NEW)

## Status
🟢 **Code fixes complete** - Ready for RLS migration

## Next Steps
1. Run SQL migration in Supabase
2. Test signup flow
3. Verify email is saved
4. Monitor new signups
