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

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', trimmedEmail)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please sign in instead.' },
        { status: 409 }
      )
    }

    // Ignore "not found" errors, they're expected for new users
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError)
      return NextResponse.json(
        { error: 'Failed to check user existence' },
        { status: 500 }
      )
    }

    // Send OTP - this will trigger signup confirmation email
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        shouldCreateUser: true
      }
    })

    if (otpError) {
      console.error('OTP error:', otpError)
      return NextResponse.json(
        { error: otpError.message || 'Failed to send confirmation email' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent. Please check your inbox.',
      email: trimmedEmail
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
