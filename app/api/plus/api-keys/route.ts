import { supabaseServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

function generateApiKey(): { full: string; masked: string; suffix: string } {
  const key = `tera_${crypto.randomBytes(32).toString('hex')}`
  const masked = key.substring(0, 10)
  const suffix = key.substring(key.length - 4)
  return { full: key, masked, suffix }
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Verify user is Plus plan
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('subscription_plan')
      .eq('id', userId)
      .single()

    if (userError || user?.subscription_plan !== 'plus') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch API keys
    const { data: keys, error } = await supabaseServer
      .from('api_keys')
      .select('id, masked_key, suffix, created_at, last_used_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      keys: keys?.map(k => ({
        id: k.id,
        maskedKey: k.masked_key,
        suffix: k.suffix,
        createdAt: k.created_at,
        lastUsedAt: k.last_used_at
      })) || []
    })
  } catch (error) {
    console.error('API keys fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Verify user is Plus plan
    const { data: user, error: userError } = await supabaseServer
      .from('users')
      .select('subscription_plan')
      .eq('id', userId)
      .single()

    if (userError || user?.subscription_plan !== 'plus') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Generate API key
    const { full, masked, suffix } = generateApiKey()
    const keyHash = hashApiKey(full)

    // Store hashed key in database
    const { data: apiKey, error } = await supabaseServer
      .from('api_keys')
      .insert({
        user_id: userId,
        key_hash: keyHash,
        masked_key: masked,
        suffix: suffix
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      fullKey: full,
      maskedKey: masked,
      suffix: suffix,
      createdAt: apiKey.created_at
    })
  } catch (error) {
    console.error('API key generation error:', error)
    return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const keyId = request.nextUrl.searchParams.get('keyId')

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 })
    }

    // Delete API key
    const { error } = await supabaseServer
      .from('api_keys')
      .delete()
      .eq('id', keyId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API key deletion error:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
