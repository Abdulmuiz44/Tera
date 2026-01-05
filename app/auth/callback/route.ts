import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  // OAuth callbacks with Supabase use hash fragments (#) not query params
  // The Supabase client library automatically handles session creation from the URL
  // Just render the callback page which handles the redirect
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // For email confirmation links (with code param)
  if (code) {
    // Create a Supabase client to exchange the code for a session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Email confirmed successfully, redirect to confirmation success page
      return NextResponse.redirect(new URL('/auth/confirmation-success', requestUrl.origin))
    }
  }

  // For OAuth (hash-based) - Supabase auto-detects and creates session
  // Redirect to the callback page that will handle the redirect
  return NextResponse.redirect(new URL('/auth/callback-page', requestUrl.origin))
}
