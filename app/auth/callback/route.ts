import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/new'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        // Redirect to the next page (default: /new)
        return NextResponse.redirect(new URL(next, requestUrl.origin))
      }
    } catch (err) {
      console.error('Auth callback error:', err)
    }
  }

  // Return to an error page with instructions
  return NextResponse.redirect(new URL('/auth/signin?error=auth_failed', requestUrl.origin))
}
