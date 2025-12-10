# Authentication Code Examples

Quick reference for using auth in your components.

---

## Getting Current User

### In Client Components

```tsx
'use client'

import { useAuth } from '@/lib/auth-context'

export function UserProfile() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not logged in</div>

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### In Server Components

```tsx
import { supabaseServer } from '@/lib/supabase-server'

export async function ServerUserInfo() {
  const { data: { user } } = await supabaseServer.auth.getUser()

  if (!user) return <div>Not logged in</div>

  return <div>Server user: {user.email}</div>
}
```

---

## Conditional Rendering Based on Auth

```tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

export function Navigation() {
  const { user, loading } = useAuth()

  if (loading) return <nav>Loading...</nav>

  return (
    <nav>
      {user ? (
        <>
          <span>Hello, {user.email}</span>
          <Link href="/profile">Profile</Link>
          <Link href="/new">Chat</Link>
        </>
      ) : (
        <>
          <Link href="/auth/signin">Sign In</Link>
          <Link href="/auth/signup">Sign Up</Link>
        </>
      )}
    </nav>
  )
}
```

---

## Protecting Routes

### Using HOC (Higher Order Component)

```tsx
import { withProtectedRoute } from '@/lib/protected-route'

function MyPage() {
  return <div>Only logged-in users see this</div>
}

export default withProtectedRoute(MyPage)
```

### Using Hook (in client components)

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useEffect } from 'react'

export function ProtectedComponent() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>This requires authentication</div>
}
```

---

## Sign In Programmatically

```tsx
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function MyComponent() {
  const router = useRouter()

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password123'
    })

    if (error) {
      console.error('Sign in failed:', error.message)
      return
    }

    if (data.user) {
      router.push('/new')
    }
  }

  return <button onClick={handleSignIn}>Sign In</button>
}
```

---

## Sign Up Programmatically

```tsx
import { supabase } from '@/lib/supabase'

export function SignUpForm() {
  const handleSignUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      console.error('Sign up failed:', error.message)
      return
    }

    if (data.user) {
      console.log('User created:', data.user.email)
      // Show verify email message or redirect
    }
  }

  return (
    <button onClick={() => handleSignUp('user@example.com', 'Password123')}>
      Sign Up
    </button>
  )
}
```

---

## Google OAuth Programmatically

```tsx
import { supabase } from '@/lib/supabase'

export function GoogleSignIn() {
  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      console.error('Google sign in failed:', error.message)
    }
  }

  return <button onClick={handleGoogleSignIn}>Sign in with Google</button>
}
```

---

## Sign Out

```tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  return <button onClick={handleSignOut}>Sign Out</button>
}
```

---

## Get User Profile Data

```tsx
import { supabase } from '@/lib/supabase'

export async function getUserProfileWithData(userId: string) {
  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch profile:', error)
    return null
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    school: profile.school,
    subscriptionPlan: profile.subscription_plan,
    createdAt: new Date(profile.created_at)
  }
}
```

---

## Update User Profile

```tsx
import { supabase } from '@/lib/supabase'

export async function updateUserProfile(
  userId: string,
  updates: {
    fullName?: string
    school?: string
    gradeLevels?: string[]
  }
) {
  const { data, error } = await supabase
    .from('users')
    .update({
      full_name: updates.fullName,
      school: updates.school,
      grade_levels: updates.gradeLevels
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Failed to update profile:', error)
    return null
  }

  return data
}
```

---

## Check if User Has Feature

```tsx
import { hasFeature } from '@/lib/plan-config'

export function Feature() {
  const { user } = useAuth()
  const userPlan = user?.user_metadata?.subscription_plan || 'free'

  if (!hasFeature(userPlan, 'export')) {
    return <div>This feature requires Pro plan</div>
  }

  return <div>Feature content here</div>
}
```

---

## Handle Auth Errors

```tsx
export function parseAuthError(error: any): string {
  if (error?.code === 'invalid_credentials') {
    return 'Invalid email or password'
  }

  if (error?.code === 'email_address_invalid') {
    return 'Please enter a valid email'
  }

  if (error?.code === 'validation_failed') {
    return 'Password must be at least 8 characters'
  }

  if (error?.code === 'user_already_exists') {
    return 'This email is already registered'
  }

  if (error?.code === 'over_email_send_rate_limit') {
    return 'Too many emails sent. Please try again later'
  }

  return error?.message || 'An error occurred. Please try again'
}
```

---

## Session Management

### Get Current Session

```tsx
import { supabase } from '@/lib/supabase'

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  return data.session
}
```

### Listen to Session Changes

```tsx
import { supabase } from '@/lib/supabase'

export function setupAuthListener() {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event) // 'SIGNED_IN', 'SIGNED_OUT', etc
    console.log('Session:', session)

    if (event === 'SIGNED_IN') {
      // Handle sign in
    }

    if (event === 'SIGNED_OUT') {
      // Handle sign out
    }

    if (event === 'USER_UPDATED') {
      // Handle user update
    }
  })

  // Clean up subscription
  return () => data.subscription?.unsubscribe()
}
```

### Refresh Session

```tsx
import { supabase } from '@/lib/supabase'

export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession()

  if (error) {
    console.error('Failed to refresh session:', error)
    return null
  }

  return data.session
}
```

---

## Custom Hooks

### useAuthRequired

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function useAuthRequired() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  return { user, loading, isAuthenticated: !!user }
}

// Usage
export function MyPage() {
  const { isAuthenticated } = useAuthRequired()

  if (!isAuthenticated) return null

  return <div>Protected content</div>
}
```

### useUserProfile

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to fetch profile:', error)
      } else {
        setProfile(data)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [user])

  return { profile, loading }
}

// Usage
export function ProfilePage() {
  const { profile, loading } = useUserProfile()

  if (loading) return <div>Loading...</div>

  return <div>{profile?.full_name}</div>
}
```

---

## Testing Auth

### Mock Auth in Tests

```tsx
// __tests__/auth.test.ts
import { useAuth } from '@/lib/auth-context'

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn()
}))

it('shows user profile when logged in', () => {
  ;(useAuth as jest.Mock).mockReturnValue({
    user: { id: '1', email: 'test@example.com' },
    loading: false,
    signOut: jest.fn()
  })

  const { getByText } = render(<UserProfile />)
  expect(getByText('test@example.com')).toBeInTheDocument()
})
```

---

## Common Patterns

### Redirect after Sign In

```tsx
const handleSignIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  // Use search params to determine redirect
  const redirect = new URLSearchParams(window.location.search).get('next')
  router.push(redirect || '/new')
}
```

### Sign Out and Cleanup

```tsx
const handleSignOut = async () => {
  // Clear any app state
  clearAppState()

  // Clear local storage
  localStorage.clear()

  // Sign out
  await supabase.auth.signOut()

  // Redirect
  router.push('/auth/signin')
}
```

### Auto-Redirect Unauthenticated Users

```tsx
// In middleware or root layout
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export function AutoRedirect() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const pathname = usePathname()

  useEffect(() => {
    const publicRoutes = ['/auth/signin', '/auth/signup', '/pricing', '/']
    const isPublic = publicRoutes.includes(pathname)

    if (!loading && !user && !isPublic) {
      router.push('/auth/signin')
    }
  }, [user, loading, pathname, router])

  return null
}
```

---

## Troubleshooting

### Debug Auth State

```tsx
'use client'

import { useAuth } from '@/lib/auth-context'
import { useEffect } from 'react'

export function AuthDebug() {
  const { user, loading } = useAuth()

  useEffect(() => {
    console.log('Auth State:', {
      user: user?.email,
      userId: user?.id,
      loading,
      timestamp: new Date().toISOString()
    })
  }, [user, loading])

  return (
    <pre className="text-xs p-2 bg-gray-900 text-white rounded">
      {JSON.stringify({ user: user?.email, loading }, null, 2)}
    </pre>
  )
}
```

### Check Session in Console

```ts
// In browser console
const { data } = await supabase.auth.getSession()
console.log('Current session:', data.session)
```

### View Auth Logs

```ts
// View all auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('EVENT', event, 'SESSION', session)
})
```

---

Last Updated: December 2024
