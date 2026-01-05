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

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Code exchange error:', error.message)
        // Redirect to callback-page which will handle the error on client side
        return NextResponse.redirect(new URL('/auth/callback-page?error=confirmation_failed', requestUrl.origin))
      }

      // Success - redirect to dashboard directly
      return NextResponse.redirect(new URL('/new', requestUrl.origin))
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(new URL('/auth/callback-page?error=server_error', requestUrl.origin))
    }
  }

  // For OAuth (hash-based) - Supabase auto-detects and creates session
  // Redirect to the callback page that will handle the redirect
  return NextResponse.redirect(new URL('/auth/callback-page', requestUrl.origin))
}
