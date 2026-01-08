import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // For OTP/email confirmation links (with code param)
  if (code) {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Code exchange error:', error.message)
        return NextResponse.redirect(new URL('/auth/callback-page?error=confirmation_failed', requestUrl.origin))
      }

      if (!data.user) {
        console.error('No user returned from code exchange')
        return NextResponse.redirect(new URL('/auth/callback-page?error=no_user', requestUrl.origin))
      }

      // Email MUST exist for user creation
      if (!data.user.email) {
        console.error('No email found for user:', data.user.id)
        return NextResponse.redirect(new URL('/auth/callback-page?error=no_email', requestUrl.origin))
      }

      // Create or verify user record in the users table
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('id', data.user.id)
        .single()

      if (!existingUser) {
        // Insert new user record with email (required field)
        const insertData = {
          id: data.user.id,
          email: data.user.email.toLowerCase(),
          subscription_plan: 'free',
          daily_chats: 0,
          daily_file_uploads: 0,
          chat_reset_date: null,
          limit_hit_chat_at: null,
          limit_hit_upload_at: null,
          profile_image_url: data.user.user_metadata?.avatar_url || null,
          full_name: data.user.user_metadata?.full_name || null,
          school: null,
          grade_levels: null
        }

        console.log('Attempting to insert user:', insertData)

        const { error: insertError } = await supabaseAdmin.from('users').insert(insertData)

        if (insertError) {
          console.error('INSERT FAILED - Full error:', JSON.stringify(insertError, null, 2))
          console.error('Trying to insert:', insertData)
        } else {
          console.log('User inserted successfully')
        }
      } else if (!existingUser.email) {
        // User exists but email is missing - update it
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ email: data.user.email.toLowerCase() })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Error updating user email:', updateError)
        }
      }

      // Success - redirect to dashboard
      return NextResponse.redirect(new URL('/new', requestUrl.origin))
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(new URL('/auth/callback-page?error=server_error', requestUrl.origin))
    }
  }

  // For OAuth (hash-based) - Supabase auto-detects and creates session
  return NextResponse.redirect(new URL('/auth/callback-page', requestUrl.origin))
}
