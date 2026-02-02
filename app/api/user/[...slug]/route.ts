import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrencyForCountry, EXCHANGE_RATES } from '@/lib/currency-converter'
import { getWebSearchRemaining } from '@/lib/web-search-usage'
import { getUserProfileServer, incrementFileUploadsServer } from '@/lib/usage-tracking-server'
import { canUploadFile, getPlanConfig } from '@/lib/plan-config'
import { auth } from '@/lib/auth'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DEFAULT_SETTINGS = (userId: string) => ({
    user_id: userId,
    notifications_enabled: true,
    dark_mode: true,
    email_notifications: true,
    marketing_emails: false,
    data_retention_days: 90,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params
    const action = slug[0]

    if (action === 'geo-currency') {
        try {
            let countryCode = request.headers.get('cf-ipcountry') || ''
            if (!countryCode) {
                try {
                    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
                    const ipResponse = await fetch(`http://ip-api.com/json/${clientIp}`, { headers: { 'Accept': 'application/json' }, cache: 'no-store' })
                    if (ipResponse.ok) {
                        const ipData = await ipResponse.json()
                        countryCode = (ipData.countryCode || 'US').toUpperCase()
                    } else countryCode = 'US'
                } catch (e) { countryCode = 'US' }
            }
            return NextResponse.json({ success: true, countryCode, currency: getCurrencyForCountry(countryCode) })
        } catch (e) {
            return NextResponse.json({ success: true, countryCode: 'US', currency: EXCHANGE_RATES.USD })
        }
    }

    if (action === 'settings') {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const userId = session.user.id
        try {
            const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).single()
            if (error && (error.code === 'PGRST116' || error.message?.includes('relation'))) return NextResponse.json(DEFAULT_SETTINGS(userId))
            if (error) throw error
            return NextResponse.json(data)
        } catch (err) {
            return NextResponse.json(DEFAULT_SETTINGS(userId))
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params
    const action = slug[0]

    if (action === 'web-search-status') {
        try {
            const { userId } = await request.json()
            if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
            const { remaining, total, resetDate, plan } = await getWebSearchRemaining(userId)
            return NextResponse.json({
                success: true, remaining, total, resetDate, plan, percentageUsed: total > 0 ? Math.round(((total - remaining) / total) * 100) : 0,
                isLow: remaining <= Math.ceil(total * 0.2),
                message: remaining === 0 ? `🔍 Limit Reached (0/${total})` : (remaining <= 2 ? `🔍 Last ${remaining} search(es) remaining` : `🔍 Web Search (${remaining}/${total})`)
            })
        } catch (error) { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
    }

    if (action === 'settings') {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const userId = session.user.id
        try {
            const settings = await request.json()
            const { data, error } = await supabase.from('user_settings').upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single()
            if (error && error.message?.includes('relation')) return NextResponse.json({ user_id: userId, ...settings, updated_at: new Date().toISOString() })
            if (error) throw error
            return NextResponse.json(data)
        } catch (err) { return NextResponse.json({ user_id: userId, ...(await request.json().catch(() => ({}))), updated_at: new Date().toISOString() }) }
    }

    if (action === 'attachments') {
        try {
            const formData = await request.formData()
            const file = formData.get('file') as File
            const type = formData.get('type') as string
            const session = await auth()
            if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            const userId = session.user.id
            if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

            if (userId) {
                const userProfile = await getUserProfileServer(userId)
                if (userProfile && !canUploadFile(userProfile.subscriptionPlan, userProfile.dailyFileUploads)) {
                    const limit = getPlanConfig(userProfile.subscriptionPlan).limits.fileUploadsPerDay
                    return NextResponse.json({ error: `Daily upload limit reached (${limit}). Upgrade for more.` }, { status: 403 })
                }
            }

            const fileExt = file.name.split('.').pop()
            const filePath = `${type}s/${Math.random().toString(36).substring(2)}.${fileExt}`
            const { error } = await supabase.storage.from('attachments').upload(filePath, file)
            if (error) throw error
            if (userId) await incrementFileUploadsServer(userId)
            const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath)
            return NextResponse.json({ name: file.name, url: publicUrl, type })
        } catch (error) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }) }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
