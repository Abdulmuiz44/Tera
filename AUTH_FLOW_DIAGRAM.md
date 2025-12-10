# Authentication Flow Diagram

## Sign Up Flow

```
User visits /auth/signup
    ↓
Enter Email + Password
    ↓
Validate Password Strength
(8 chars, 1 uppercase, 1 number)
    ↓
Passwords Match Check
    ↓
Send to Supabase Auth
    ↓
User Created ✓
    ↓
Try Auto Sign In
    ↓
├─ Success → Redirect to /new
├─ Email Verification Required → Redirect to /auth/verify-email?email=user@example.com
    ↓
User Receives Email with Link
    ↓
User Clicks Email Verification Link
    ↓
Redirects to /auth/callback?code=...
    ↓
Exchange Code for Session
    ↓
Auto Redirect to /new
    ↓
User Profile Auto-Created in DB
(First time trigger in Supabase)
```

## Sign In Flow

```
User visits /auth/signin
    ↓
Enter Email + Password
    ↓
Send to Supabase Auth
    ↓
├─ Valid → Session Created ✓
├─ Invalid → Show Error Message
    ↓
Redirect to /new (on success)
    ↓
AuthContext Updates
    ↓
Protected Pages Now Accessible
```

## Google OAuth Flow (Sign Up)

```
User visits /auth/signup
    ↓
Clicks "Sign up with Google"
    ↓
Redirected to Google Consent Screen
    ↓
User Approves & Google Redirects
    ↓
Redirects to /auth/callback?code=...
    ↓
Exchange Code for Session
    ↓
├─ New Google Account → Auto Create User Profile
├─ Existing Google Account → Load Existing Profile
    ↓
Redirect to /new
    ↓
User Fully Authenticated
```

## Google OAuth Flow (Sign In)

```
User visits /auth/signin
    ↓
Clicks "Sign in with Google"
    ↓
Redirected to Google Consent Screen
(or auto-approved if logged into Google)
    ↓
Google Redirects Back
    ↓
/auth/callback Exchanges Code
    ↓
Session Created
    ↓
Redirect to /new
    ↓
AuthContext Updates
```

## Protected Route Flow

```
User Visits Protected Page
    ↓
withProtectedRoute HOC Checks Auth
    ↓
useAuth() Gets Current User
    ↓
├─ User Found → Render Component
├─ No User → Show Loading Spinner
├─ Still No User After Load → Redirect to /auth/signin
```

---

## Component Architecture

```
App Layout (root)
  ↓
AuthProvider
  ├─ Manages global auth state
  ├─ Listens for auth changes
  ├─ Provides useAuth() hook
  ↓
Routes
  ├─ Public Routes
  │  ├─ /auth/signin
  │  ├─ /auth/signup
  │  ├─ /auth/verify-email
  │  └─ /auth/callback (invisible)
  │
  └─ Protected Routes
     ├─ /new
     ├─ /history
     ├─ /profile
     └─ /settings
        (All wrapped with withProtectedRoute)
```

---

## State Management

### AuthContext State
```typescript
{
  user: User | null        // Current authenticated user
  loading: boolean         // Auth check in progress
  signOut: () => Promise   // Logout function
}
```

### Sign In Form State
```typescript
{
  email: string
  password: string
  loading: boolean
  error: string
  showPassword: boolean
}
```

### Sign Up Form State
```typescript
{
  email: string
  password: string
  confirmPassword: string
  loading: boolean
  error: string
  showPassword: boolean
  showConfirmPassword: boolean
}
```

---

## API Routes

### `GET /auth/callback`
- Purpose: Handle OAuth code exchange
- Input: `code` and `next` (optional) query params
- Output: Redirect to `/new` or `/auth/signin?error=auth_failed`
- Handles: Google OAuth, email confirmation

---

## Database Trigger Flow

```
Google/Supabase Auth Creates User
    ↓
on_auth_user_created Trigger Fires
    ↓
INSERT into users table
{
  id: from auth.users.id,
  email: from auth.users.email,
  subscription_plan: 'free',
  monthly_lesson_plans: 0,
  daily_chats: 0,
  daily_file_uploads: 0,
  monthly_web_searches: 0,
  plan_reset_date: now() + 1 month,
  chat_reset_date: now() + 1 day,
  web_search_reset_date: now() + 30 days,
  created_at: now()
}
    ↓
User Profile Ready to Use
```

---

## Error Handling

### Sign In/Sign Up Errors

| Error | Handling |
|-------|----------|
| Email already exists | Show message, link to sign in |
| Invalid password format | Show validation requirements |
| Weak password | Show strength requirements |
| Passwords don't match | Show error on confirm field |
| Network error | Show generic error, retry option |
| Invalid credentials | Show generic "Invalid email/password" |
| Google OAuth fails | Show error, suggest trying email |

### Protected Route Errors

| Scenario | Handling |
|----------|----------|
| User not authenticated | Redirect to /auth/signin |
| Session expired | AuthContext detects, updates UI |
| User deleted account | onAuthStateChange updates, redirect |

---

## Password Strength Rules

```
✅ Accepted
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)

Examples of Strong Passwords:
- Password1
- Tera2024
- MyApp123

Examples of Weak Passwords:
- password (no uppercase, no number)
- PASSWORD1 (no lowercase)
- Password (no number)
- 12345678 (no letters)
```

---

## Email Verification Flow

```
User Signs Up with Email
    ↓
Supabase Sends Verification Email
    ↓
Email Contains: Confirmation Link + Token
    ↓
User Clicks Link in Email
    ↓
Browser Redirects to /auth/callback?code=...
    ↓
Callback Handler Exchanges Code
    ↓
User Email Marked as Verified
    ↓
User Auto Signed In
    ↓
Redirect to /new
    ↓
ready to use app
```

If User Needs to Resend:
```
User on /auth/verify-email
    ↓
Click "Resend Verification Email"
    ↓
Supabase Sends New Email
    ↓
User Receives Email
    ↓
Same flow as above
```

---

## Session Management

### Session Creation
```
successful auth → Session Token Created
                → Stored in Browser
                → Sent with Every Request
```

### Session Persistence
```
Page Reload → AuthProvider Checks Session
           → Loads User if Session Valid
           → Updates AuthContext
           → Components Re-Render
```

### Session Expiry
```
Token Expiring → Supabase Auto-Refreshes
             → No User Action Needed
             → Stay Logged In
```

### Logout
```
User Clicks Sign Out
    ↓
signOut() Function Called
    ↓
Supabase Clears Session
    ↓
AuthContext Updates (user = null)
    ↓
Redirect to /auth/signin
    ↓
All Protected Routes No Longer Accessible
```

---

## UI/UX Features

### Sign In Page
- Clean modal design
- Two sign-in methods (email + Google)
- Password visibility toggle
- Forgot password link
- Link to sign up page
- Error messages displayed inline
- Loading state on buttons

### Sign Up Page
- Password strength indicator message
- Confirm password validation
- Password visibility toggles (both fields)
- Google sign-up option
- Link to sign in page
- Real-time validation feedback
- Clear error messages

### Email Verification Page
- Shows which email was used
- Clear instructions (3 steps)
- Spam folder warning
- Resend button with loading state
- Link to try different email
- Success message on resend

---

## Testing Scenarios

### Scenario 1: New User Email Signup
1. Visit /auth/signup
2. Enter: user@example.com, Password123
3. Confirm: Password123
4. Click "Create Account"
5. Check email for verification link
6. Click link in email
7. Auto redirected to /new
8. User profile created in DB

### Scenario 2: Existing User Signin
1. Visit /auth/signin
2. Enter: user@example.com, Password123
3. Click "Sign In"
4. Redirected to /new
5. Can access protected routes

### Scenario 3: Google OAuth
1. Visit /auth/signup or /auth/signin
2. Click Google button
3. Approve Google permissions
4. Automatically redirected to /new
5. User profile auto-created (if new)

### Scenario 4: Protected Route Access
1. Not logged in
2. Try to visit /new
3. Redirected to /auth/signin
4. Sign in successfully
5. Now can access /new

### Scenario 5: Session Persistence
1. Sign in to app
2. Refresh page
3. Still logged in (session restored)
4. Can see user email in profile

---

Created: December 2024
