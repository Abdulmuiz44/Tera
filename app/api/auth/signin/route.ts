import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Validate user exists in database before sending magic link
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', trimmedEmail)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'User not found. Please sign up first.',
          signUpRequired: true
        },
        { status: 404 }
      )
    }

    // User exists, send magic link
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        shouldCreateUser: false
      }
    })

    if (otpError) {
      console.error('OTP error:', otpError)
      return NextResponse.json(
        { error: otpError.message || 'Failed to send sign in email' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Sign in link sent to your email. Please check your inbox.',
      email: trimmedEmail
    })
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
