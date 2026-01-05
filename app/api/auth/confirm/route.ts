import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Create or verify user record in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      // Insert new user record
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        email: email.toLowerCase()
      })

      if (insertError) {
        console.error('Error creating user record:', insertError)
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User confirmed and ready to access Tera'
    })
  } catch (error) {
    console.error('Confirmation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
