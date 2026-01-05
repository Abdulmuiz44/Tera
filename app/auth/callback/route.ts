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

      // Create or verify user record in the users table
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existingUser) {
        // Insert new user record with default values
        const { error: insertError } = await supabaseAdmin.from('users').insert({
          id: data.user.id,
          email: data.user.email || '',
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
          // Continue anyway - the session is valid
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
