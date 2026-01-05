# Authentication Flow Diagrams

## Complete Auth Flow Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOWS                         │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  EMAIL SIGNUP FLOW                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [/auth/signup]  →  User enters email                                  │
│        ↓                                                                │
│  [POST /api/auth/signup]  →  Validate email not registered            │
│        ↓                                                                │
│        ✓ Email valid & new                                            │
│        ↓                                                                │
│  [Supabase]  →  Send OTP confirmation email                           │
│        ↓                                                                │
│  [/auth/verify-email]  →  Show verification message                   │
│        ↓                                                                │
│  User clicks link in email                                             │
│        ↓                                                                │
│  [/auth/callback?code=xxx]  →  Server-side code exchange              │
│        ↓                                                                │
│  [Session created]  →  User authenticated                             │
│        ↓                                                                │
│  [Database insert]  →  Create user record in 'users' table            │
│        ↓                                                                │
│  [/new]  →  Dashboard (authenticated)                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  EMAIL SIGNIN FLOW                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [/auth/signin]  →  User enters email                                  │
│        ↓                                                                │
│  [POST /api/auth/signin]  →  Check if user exists in database         │
│        ↓                                                                │
│        ✗ User not found  →  Return error  →  [UI shows error]         │
│        ↓                                                                │
│        ✓ User exists                                                   │
│        ↓                                                                │
│  [Supabase]  →  Send magic link email                                 │
│        ↓                                                                │
│  [UI shows]  →  "Check your email for signin link"                    │
│        ↓                                                                │
│  User clicks link in email                                             │
│        ↓                                                                │
│  [/auth/callback?code=xxx]  →  Server-side code exchange              │
│        ↓                                                                │
│  [Session created]  →  User authenticated                             │
│        ↓                                                                │
│  [/new]  →  Dashboard (authenticated)                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  GOOGLE OAUTH FLOW                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [/auth/signup or /auth/signin]  →  Click "Continue with Google"      │
│        ↓                                                                │
│  [Supabase OAuth]  →  Redirect to Google auth page                    │
│        ↓                                                                │
│  [Google]  →  User signs in with Google account                       │
│        ↓                                                                │
│  [Google]  →  User authorizes app access                              │
│        ↓                                                                │
│  [Google]  →  Redirect back with authorization code                   │
│        ↓                                                                │
│  [Supabase]  →  Exchange code for session (automatic)                 │
│        ↓                                                                │
│  [Session created]  →  User authenticated in Supabase                 │
│        ↓                                                                │
│  [/auth/callback-page]  →  Client-side callback handler               │
│        ↓                                                                │
│  [Check session]  →  Verify user is authenticated                     │
│        ↓                                                                │
│  [Database insert/verify]  →  Create/verify user record               │
│        ↓                                                                │
│  [/new]  →  Dashboard (authenticated)                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐          │
│  │  Signup     │  │  Signin     │  │  Google OAuth    │          │
│  │   Page      │  │   Page      │  │   Handler        │          │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘          │
│         │                │                 │                    │
│         └────────────────┼─────────────────┘                    │
│                          │                                      │
│                 (Email or Google OAuth)                         │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           ↓
┌───────────────────────────────────────────────────────────────────┐
│              API ROUTES (Next.js Backend)                         │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │ POST /api/auth/  │  │ POST /api/auth/  │  │ GET /auth/   │   │
│  │    signup        │  │    signin        │  │  callback    │   │
│  │                  │  │                  │  │              │   │
│  │ - Check email    │  │ - Check user     │  │ - Exchange   │   │
│  │   not taken      │  │   exists         │  │   code       │   │
│  │ - Call Supabase  │  │ - Call Supabase  │  │ - Create     │   │
│  │   OTP            │  │   OTP            │  │   user       │   │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘   │
│           │                     │                   │           │
│           └─────────────────────┼───────────────────┘           │
│                                 │                               │
└─────────────────────────────────┼───────────────────────────────┘
                                  ↓
┌───────────────────────────────────────────────────────────────────┐
│           SUPABASE (Auth + Database)                              │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  auth.users (Supabase Auth)                             │   │
│  │  - id (UUID)                                            │   │
│  │  - email                                                │   │
│  │  - email_confirmed_at                                  │   │
│  └────────────┬─────────────────────────────────────────────┘   │
│               │                                                  │
│  ┌────────────┴─────────────────────────────────────────────┐   │
│  │  users (Custom Table)                                   │   │
│  │  - id (UUID) → references auth.users(id)               │   │
│  │  - email (unique index)                                │   │
│  │  - created_at, updated_at                              │   │
│  │                                                         │   │
│  │  Row Level Security: Users can only access own data    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Decision Tree: Which Path to Take?

```
┌─────────────────────┐
│  Auth Page Opened   │
└──────────┬──────────┘
           │
      ┌────┴─────────────────────┐
      │                          │
      ↓                          ↓
  [SIGNUP]               [SIGNIN]
   /auth/signup           /auth/signin
      │                        │
      ├─────────────┬──────────┤
      │             │          │
      ↓             ↓          ↓
  Email      Google OAuth   Email
  Button      Button        Input
      │             │          │
      └─────────────┼──────────┘
                    │
              ┌─────┴─────┬────────────┐
              │           │            │
              ↓           ↓            ↓
          Email OTP    Google        Magic Link
          Check        Check         Check
          Email        User          User
          Unique       Exists        Exists
              │           │            │
          ┌───┴───┐       │       ┌─────┴────┐
          │       │       │       │          │
          ✓       ✗       ✓   ✓       ✗
         Send     Err    Auth    Send     Err
         OTP     Taken   Now     Link    Not Reg
          │       │       │       │        │
          └───┬───┴───────┼───┬───┴────────┘
              │           │   │
              ↓           ↓   ↓
         [Verify Email] [Login] [Suggest Signup]
         /verify-email  /new    Show Error
              │                 Link to signup
              │
          Click Link
          in Email
              │
              ↓
         [Exchange Code]
         /auth/callback
              │
              ↓
         [Create User]
         users table
              │
              ↓
         [Redirect]
         /new (Dashboard)
```

## Database State Transitions

```
USER STATES DURING SIGNUP:

1. Initial State
   auth.users: [EMPTY]
   users: [EMPTY]

2. After OTP Sent
   auth.users: [PENDING - awaiting email confirmation]
   users: [EMPTY]

3. After Email Confirmed (Link Clicked)
   auth.users: [CONFIRMED - email_confirmed_at set]
   users: [INSERT NEW RECORD with id, email]

4. After Signin
   auth.users: [SESSION CREATED]
   users: [RECORD EXISTS]


USER STATES DURING GOOGLE OAUTH:

1. Initial State
   auth.users: [EMPTY]
   users: [EMPTY]

2. After Google Authorization
   auth.users: [CREATE WITH GOOGLE PROFILE]
   users: [EMPTY]

3. After Callback Processing
   auth.users: [SESSION CREATED]
   users: [INSERT NEW RECORD]


USER STATES DURING SIGNIN:

1. Initial State (User already registered)
   auth.users: [EXISTS - confirmed]
   users: [EXISTS]

2. After Magic Link Sent
   auth.users: [UNCHANGED]
   users: [UNCHANGED]

3. After Link Clicked
   auth.users: [SESSION CREATED]
   users: [UNCHANGED]
```

## Error Flow Diagram

```
┌──────────────────────┐
│   Auth Operation     │
└─────────┬────────────┘
          │
      ┌───┴───────────────────────┐
      │                           │
      ↓                           ↓
   SUCCESS                    ERROR
      │                           │
      ├─────────────┬─────────────┤
      │             │             │
      ↓             ↓             ↓
  Signup       Signin         Wrong Input
      │             │             │
      ├─ Email   ├─ User        ├─ Invalid Email
      │ already  │ not found    │
      │ taken    │              └─ [Show Error]
      │          │ [Prompt       Clear Field
      ↓          │  Signup]      Retry
   [Show        │
    Error]      ├─ User
   Suggest       │ exists
   Signin        │
   Option        ↓
                Send Link
                   │
                   ├─ Success
                   │ │
                   │ └─ [Show Confirmation]
                   │
                   └─ Network Error
                     │
                     └─ [Show Error]
                       [Retry Button]
```

## API Response Flow

```
REQUEST: POST /api/auth/signup
{
  "email": "user@example.com"
}
         │
         ↓
    VALIDATION
    ├─ Valid email format? ✓
    ├─ Email not empty? ✓
    ├─ Email not registered? ✓
    │   (Query users table)
         │
         ✓ All checks pass
         │
         ↓
    SEND OTP
    ├─ Call Supabase signInWithOtp
    │   ├─ Email redirect configured ✓
    │   ├─ Trigger email ✓
    │   └─ Return success ✓
         │
         ↓
RESPONSE (200 OK)
{
  "success": true,
  "message": "Confirmation email sent...",
  "email": "user@example.com"
}

---

REQUEST: POST /api/auth/signin
{
  "email": "notregistered@example.com"
}
         │
         ↓
    VALIDATION
    ├─ Valid email format? ✓
    ├─ Email not empty? ✓
    └─ User exists in DB? ✗
         │
         ✗ User not found
         │
         ↓
RESPONSE (404 NOT FOUND)
{
  "error": "User not found. Please sign up first.",
  "signUpRequired": true,
  "status": 404
}
```

## Session & Authentication Timeline

```
TIME                    ACTION
─────────────────────────────────────────────────────────

T0      User starts signup
        └─ No session

T1      User submits email
        └─ No session (frontend only)

T2      API validates & sends OTP
        └─ OTP code generated (expires in 24h)

T3      User receives email
        └─ Still no session

T4      User clicks link in email
        └─ Redirect to /auth/callback?code=abc123

T5      Server exchanges code
        └─ Session created in auth.users

T6      User record created in DB
        └─ Entry added to users table

T7      Client redirected to /new
        └─ Session cookie present
        └─ User fully authenticated
        └─ Can access protected routes

T8+     Future signin attempts
        └─ User already in DB
        └─ Faster validation
        └─ Direct to magic link
```

## Data Flow in Callback Handler

```
┌─────────────────────────────────────────────────────────┐
│ GET /auth/callback?code=abc123                          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
        ┌─────────────────────┐
        │ Validate Code       │
        ├─────────────────────┤
        │ ✓ Code present?     │
        │ ✓ Code valid?       │
        │ ✓ Not expired?      │
        └────────┬────────────┘
                 │
                 ↓
        ┌─────────────────────┐
        │ Exchange for        │
        │ Session             │
        ├─────────────────────┤
        │ ✓ Code → Session    │
        │ ✓ Get user ID       │
        │ ✓ Get email         │
        └────────┬────────────┘
                 │
                 ↓
        ┌─────────────────────┐
        │ Create User Record  │
        ├─────────────────────┤
        │ ✓ Check if exists   │
        │ ✓ If not: INSERT    │
        │ ✓ Store ID, email   │
        │ ✓ Set timestamps    │
        └────────┬────────────┘
                 │
                 ↓
        ┌─────────────────────┐
        │ Return Response     │
        ├─────────────────────┤
        │ Redirect: /new      │
        │ Status: 307/302     │
        │ Session cookie: ✓   │
        └─────────────────────┘
```

These diagrams show the complete flow, interactions, state changes, and data movement throughout the authentication system.
