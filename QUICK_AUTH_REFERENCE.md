# Quick Auth Reference Card

## 🚀 One-Minute Setup

```bash
# 1. Add to app/layout.tsx
import { AuthProvider } from '@/lib/auth-context'

export default function RootLayout({ children }) {
  return <html><body><AuthProvider>{children}</AuthProvider></body></html>
}

# 2. Create .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 3. Protect routes
import { withProtectedRoute } from '@/lib/protected-route'
export default withProtectedRoute(MyPage)

# 4. Get user in components
import { useAuth } from '@/lib/auth-context'
const { user, signOut } = useAuth()
```

---

## 📍 File Locations

| What | Where |
|------|-------|
| Sign in page | `app/auth/signin/page.tsx` |
| Sign up page | `app/auth/signup/page.tsx` |
| Email verify | `app/auth/verify-email/page.tsx` |
| OAuth callback | `app/auth/callback/route.ts` |
| Auth context | `lib/auth-context.tsx` |
| Route protection | `lib/protected-route.tsx` |

---

## 🔗 URLs

```
/auth/signin              ← Email sign in
/auth/signup             ← Create account
/auth/verify-email       ← Verify email
/auth/callback           ← OAuth handler (invisible)
```

---

## 💾 Env Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Common Code

### Sign In
```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})
```

### Sign Up
```tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: `${APP_URL}/auth/callback` }
})
```

### Google
```tsx
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${APP_URL}/auth/callback` }
})
```

### Get User
```tsx
const { user, loading, signOut } = useAuth()
```

### Protect Route
```tsx
export default withProtectedRoute(MyPage)
```

### Sign Out
```tsx
await signOut()
```

---

## ✅ Checklist

- [ ] Update app/layout.tsx
- [ ] Add environment variables
- [ ] Configure Supabase
- [ ] Run SQL migrations
- [ ] Protect routes
- [ ] Test locally
- [ ] Deploy

---

## 📖 Full Docs

- **Setup**: `AUTH_SETUP_GUIDE.md`
- **Flows**: `AUTH_FLOW_DIAGRAM.md`
- **Checklist**: `AUTH_IMPLEMENTATION_CHECKLIST.md`
- **Code**: `AUTH_CODE_EXAMPLES.md`
- **Overview**: `AUTH_SYSTEM_COMPLETE.md`

---

## 🆘 Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| Auth not working | Check env vars and Supabase URL |
| Protected route redirects | Add AuthProvider to layout |
| Google OAuth fails | Check redirect URI matches |
| Email not arriving | Check spam folder, verify Supabase email |
| Lost session on refresh | Enable cookies, check env |

---

## 📱 Features

✅ Email/Password auth
✅ Google OAuth
✅ Email verification
✅ Session persistence
✅ Protected routes
✅ Password validation
✅ Dark modern UI
✅ Mobile responsive

---

## 🎨 Styling

- Dark: `from-[#050505] to-[#1a1a1a]`
- Neon: `tera-neon`
- Panel: `tera-panel`
- White buttons
- Glassmorphism
- Responsive

---

## 💡 Tips

1. **Use `withProtectedRoute`** for simple protection
2. **Use `useAuth()`** for conditional UI
3. **Check `user?.email`** to get user email
4. **Call `signOut()`** to log out
5. **Env vars are read at build time** - restart dev server after changing

---

## 🚀 Deploy

```bash
# 1. Push code
git push

# 2. Set env vars on platform (Vercel/Netlify/etc)
# 3. Update Google OAuth redirect URI
# 4. Test on production
# 5. Monitor Supabase logs
```

---

## 📊 Database

User table auto-created with:
- `id` (from auth)
- `email`
- `subscription_plan` (free/pro/plus)
- `daily_chats`, `monthly_lesson_plans`, etc
- `created_at`

---

**Get started**: Follow `AUTH_IMPLEMENTATION_CHECKLIST.md`

Good luck! 🎉
