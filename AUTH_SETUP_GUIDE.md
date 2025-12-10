# Authentication Setup Guide

Complete guide to set up Supabase authentication with Email & Google OAuth.

## Files Created

### Pages
- `app/auth/signin/page.tsx` - Sign in page with email/password and Google
- `app/auth/signup/page.tsx` - Sign up page with validation and Google
- `app/auth/verify-email/page.tsx` - Email verification page
- `app/auth/callback/route.ts` - OAuth callback handler

### Utilities
- `lib/auth-context.tsx` - React context for auth state management
- `lib/protected-route.tsx` - HOC wrapper for protecting routes

---

## Supabase Configuration

### 1. Enable Authentication Methods

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Email/Password** auth
3. Enable **Google** OAuth

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select your project
3. Enable **Google+ API**
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```
6. Copy the **Client ID** and **Client Secret**
7. In Supabase dashboard:
   - Go to Auth → Providers → Google
   - Paste Client ID and Client Secret
   - Enable the provider

### 3. Email Configuration

Supabase has built-in email templates. You can customize them:

1. Go to **Authentication** → **Email Templates**
2. Customize confirmation email template
3. Add your app URL to the confirmation link

---

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## Integration with App Layout

Update `app/layout.tsx` to include AuthProvider:

```tsx
import { AuthProvider } from '@/lib/auth-context'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

---

## Using Authentication in Components

### Get Current User

```tsx
'use client'

import { useAuth } from '@/lib/auth-context'

export function Profile() {
  const { user, signOut } = useAuth()

  return (
    <div>
      <p>Logged in as: {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Protect Routes

```tsx
import { withProtectedRoute } from '@/lib/protected-route'

function MyProtectedPage() {
  return <div>This requires authentication</div>
}

export default withProtectedRoute(MyProtectedPage)
```

---

## Database Schema

Ensure your `users` table in Supabase has these fields:

```sql
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
  
  -- Set initial reset dates
  UPDATE public.users 
  SET 
    plan_reset_date = now() + interval '1 month',
    chat_reset_date = now() + interval '1 day',
    web_search_reset_date = now() + interval '30 days'
  WHERE id = new.id;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## Features

### Sign In Page
- ✅ Email/password authentication
- ✅ Google OAuth button
- ✅ Error handling
- ✅ Password visibility toggle
- ✅ Link to sign up
- ✅ Forgot password link (ready to implement)
- ✅ Modern modal design with neon styling

### Sign Up Page
- ✅ Email/password registration
- ✅ Password strength validation:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
- ✅ Password confirmation
- ✅ Google OAuth button
- ✅ Email verification flow
- ✅ Error handling
- ✅ Modern modal design

### Email Verification Page
- ✅ Shows email that was used
- ✅ Instructions for user
- ✅ Resend email button
- ✅ Spam folder reminder
- ✅ Link to try different email

### OAuth Callback
- ✅ Handles Google auth code exchange
- ✅ Automatic session management
- ✅ Redirect to dashboard after auth
- ✅ Error handling with redirect

---

## Testing Checklist

### Email/Password Sign Up
- [ ] Enter email and password
- [ ] Receive validation errors for weak password
- [ ] Confirmation email arrives
- [ ] Click link in email
- [ ] Auto sign in and redirect to /new
- [ ] Check users table in Supabase

### Email/Password Sign In
- [ ] Sign up first
- [ ] Sign out
- [ ] Sign in with email/password
- [ ] Redirect to /new

### Google OAuth (Sign Up)
- [ ] Click "Sign up with Google"
- [ ] Approve permissions
- [ ] Auto create user record
- [ ] Redirect to /new

### Google OAuth (Sign In)
- [ ] Sign up with Google first
- [ ] Sign out
- [ ] Click "Sign in with Google"
- [ ] Should recognize existing account
- [ ] Redirect to /new

### Protected Routes
- [ ] Access protected page while logged out → redirect to signin
- [ ] Access protected page while logged in → allow
- [ ] Sign out → session cleared

---

## Styling Notes

All pages use your existing Tera design system:
- `bg-gradient-to-br from-[#050505] to-[#1a1a1a]` - Dark background
- `tera-neon` color for accents (primary teal/green)
- `tera-panel` for card backgrounds
- Glassmorphism with `backdrop-blur-xl`
- Subtle glow effects with pseudo-elements

---

## Next Steps

1. ✅ Create auth pages (DONE)
2. Add to `app/layout.tsx` → AuthProvider
3. Set up Supabase auth providers
4. Configure environment variables
5. Run migrations for users table
6. Test sign up flow
7. Test sign in flow
8. Test Google OAuth
9. Wrap protected routes with withProtectedRoute()
10. Deploy to production

---

## Common Issues

### "Google OAuth not working"
- Verify Client ID/Secret in Supabase
- Check redirect URLs match exactly
- Ensure NEXT_PUBLIC_SUPABASE_URL is correct

### "Email verification not arriving"
- Check Supabase email templates
- Verify custom domain is configured
- Check spam folder
- Test with different email

### "Redirect loop after auth"
- Ensure AuthProvider wraps all routes
- Check that callback route is correctly configured
- Verify NEXT_PUBLIC_APP_URL matches your domain

---

## Security Notes

✅ All passwords validated on client AND server
✅ Supabase handles password hashing
✅ OAuth tokens stored securely
✅ Session managed by Supabase auth
✅ Protected routes check auth before rendering
✅ Email verification prevents fake accounts

---

Last Updated: Dec 2024
