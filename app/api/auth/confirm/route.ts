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

    const trimmedEmail = email.trim().toLowerCase()

    // Validate email format
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create or verify user record in users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (!existingUser) {
      // Insert new user record with email (required field)
      const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        email: trimmedEmail,
        subscription_plan: 'free',
        daily_chats: 0,
        daily_file_uploads: 0,
        chat_reset_date: null,
        limit_hit_chat_at: null,
        limit_hit_upload_at: null,
        profile_image_url: null,
        full_name: null,
        school: null,
        grade_levels: null
      })

      if (insertError) {
        console.error('Error creating user record:', insertError)
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        )
      }
    } else if (!existingUser.email) {
      // User exists but email is missing - update it
      const { error: updateError } = await supabase
        .from('users')
        .update({ email: trimmedEmail })
        .eq('id', userId)

      if (updateError) {
        console.error('Error updating user email:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user email' },
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
