import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer as supabase } from '@/lib/supabase-server'
import { sendProductUpdateBroadcast, type ProductUpdateAudience } from '@/lib/product-update-broadcast'

type DeployPayload = {
  id?: string
  deploy_id?: string
  state?: string
  name?: string
  title?: string
  branch?: string
  context?: string
  deploy_ssl_url?: string
  ssl_url?: string
  url?: string
  commit_ref?: string
  commit_url?: string
  committer?: string
}

function automationEnabled() {
  return process.env.AUTO_UPDATE_EMAILS_ENABLED === 'true'
}

function getSecretFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || ''
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice('bearer '.length).trim()
  }

  return request.headers.get('x-tera-automation-secret') || request.nextUrl.searchParams.get('secret')
}

function isAuthorized(request: NextRequest) {
  const expectedSecret = process.env.AUTOMATION_WEBHOOK_SECRET
  if (!expectedSecret) return false
  return getSecretFromRequest(request) === expectedSecret
}

function getMinIntervalHours() {
  const value = Number(process.env.AUTO_UPDATE_EMAIL_MIN_INTERVAL_HOURS || 12)
  return Number.isFinite(value) && value >= 0 ? value : 12
}

function getAudience(): ProductUpdateAudience {
  const value = process.env.AUTO_UPDATE_EMAIL_AUDIENCE
  if (value === 'all' || value === 'marketing') return value
  return 'email_notifications'
}

function getDeployId(payload: DeployPayload) {
  return payload.id || payload.deploy_id || payload.commit_ref || crypto.randomUUID()
}

function isProductionDeploy(payload: DeployPayload) {
  const context = (payload.context || '').toLowerCase()
  const branch = (payload.branch || '').toLowerCase()
  const state = (payload.state || '').toLowerCase()

  if (state && state !== 'ready' && state !== 'uploaded') return false
  if (context && context !== 'production') return false
  if (branch && branch !== 'main' && branch !== 'master') return false

  return true
}

async function hasRecentAutomaticBroadcast() {
  const minIntervalHours = getMinIntervalHours()
  if (minIntervalHours === 0) return false

  const since = new Date(Date.now() - minIntervalHours * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('product_update_broadcasts')
    .select('id')
    .eq('source', 'netlify_deploy')
    .gte('created_at', since)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

async function createBroadcastRecord(payload: DeployPayload, deployId: string) {
  const { data, error } = await supabase
    .from('product_update_broadcasts')
    .insert({
      source: 'netlify_deploy',
      source_id: deployId,
      subject: 'Tera has been updated',
      status: 'started',
      metadata: payload,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return null
    }
    throw error
  }

  return data?.id as number | undefined
}

async function updateBroadcastRecord(
  id: number,
  update: {
    status: 'sent' | 'failed' | 'skipped'
    recipientCount?: number
    sentCount?: number
    failedCount?: number
    error?: string
  },
) {
  const { error } = await supabase
    .from('product_update_broadcasts')
    .update({
      status: update.status,
      recipient_count: update.recipientCount ?? null,
      sent_count: update.sentCount ?? null,
      failed_count: update.failedCount ?? null,
      error_message: update.error ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[deploy_update_broadcast_update_failed]', { id, error })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json().catch(() => ({})) as DeployPayload
  const deployId = getDeployId(payload)

  if (!automationEnabled()) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'automation_disabled', deployId })
  }

  if (!isProductionDeploy(payload)) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'non_production_deploy', deployId })
  }

  try {
    if (await hasRecentAutomaticBroadcast()) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'min_interval_guard', deployId })
    }

    const broadcastId = await createBroadcastRecord(payload, deployId)
    if (!broadcastId) {
      return NextResponse.json({ ok: true, skipped: true, reason: 'duplicate_deploy', deployId })
    }

    const result = await sendProductUpdateBroadcast({
      subject: 'Tera has been updated',
      heading: 'Tera just got better',
      message: 'We shipped a new Tera update with improvements to the learning workspace, reliability, and product experience. Open Tera to continue learning with the latest version.',
      previewText: 'A new Tera update is live.',
      ctaLabel: 'Open Tera',
      ctaUrl: payload.deploy_ssl_url || payload.ssl_url || payload.url || process.env.NEXT_PUBLIC_APP_URL,
      audience: getAudience(),
      source: 'netlify_deploy',
      sourceId: deployId,
    })

    await updateBroadcastRecord(broadcastId, {
      status: result.ok ? 'sent' : 'failed',
      recipientCount: 'recipientCount' in result ? result.recipientCount : result.attempted,
      sentCount: 'sent' in result ? result.sent : 0,
      failedCount: 'failed' in result ? result.failed : 0,
      error: result.ok ? undefined : 'One or more product update emails failed',
    })

    return NextResponse.json({ ok: result.ok, deployId, broadcastId, result }, { status: result.ok ? 200 : 207 })
  } catch (error) {
    console.error('[deploy_update_broadcast_failed]', { deployId, error })
    return NextResponse.json({ error: 'Failed to send deploy update email', deployId }, { status: 500 })
  }
}
