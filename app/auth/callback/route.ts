import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // OAuth callbacks with Supabase use hash fragments (#) not query params
  // The Supabase client library automatically handles session creation from the URL
  // Just render the callback page which handles the redirect
  const requestUrl = new URL(request.url)
  
  // For email confirmation links and password reset links (with code param)
  if (requestUrl.searchParams.has('code')) {
    return NextResponse.redirect(new URL('/auth/callback-page', requestUrl.origin))
  }

  // For OAuth (hash-based) - Supabase auto-detects and creates session
  // Redirect to the callback page that will handle the redirect
  return NextResponse.redirect(new URL('/auth/callback-page', requestUrl.origin))
}
