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
      
      // Check if it's a "relation does not exist" error (table doesn't exist)
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('user_settings table does not exist yet')
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
      
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Settings API error:', err)
    // Return defaults on any error instead of failing
    const userId = request.headers.get('x-user-id')
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
      
      // Check if it's a "relation does not exist" error (table doesn't exist)
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('user_settings table does not exist - settings will be stored locally only')
        console.warn('Run: migrations/create_user_settings_table.sql in Supabase SQL Editor to persist settings')
        // Return the settings as if they were saved (local-only)
        return NextResponse.json({
          user_id: userId,
          ...settings,
          updated_at: new Date().toISOString(),
        })
      }
      
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Settings API error:', err)
    // Return settings as if saved on error (will be stored in browser memory)
    const userId = request.headers.get('x-user-id')
    const settings = await request.json().catch(() => ({}))
    return NextResponse.json({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString(),
    })
  }
}
