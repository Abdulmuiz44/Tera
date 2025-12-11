import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get settings
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No settings found, return defaults
      const defaults = {
        user_id: userId,
        notifications_enabled: true,
        dark_mode: true,
        email_notifications: true,
        marketing_emails: false,
        data_retention_days: 90,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return NextResponse.json(defaults)
    }

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Settings API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await request.json()

    // Upsert settings
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving settings:', error)
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Settings API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
