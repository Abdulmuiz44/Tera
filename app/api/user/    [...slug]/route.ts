import { NextRequest, NextResponse } from 'next/server'
import { getCurrencyForCountry, EXCHANGE_RATES } from '@/lib/currency-converter'
import { getWebSearchRemaining } from '@/lib/web-search-usage'

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
    const action = params.slug[0]

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
            const currency = getCurrencyForCountry(countryCode)
            return NextResponse.json({ success: true, countryCode, currency })
        } catch (e) {
            return NextResponse.json({ success: true, countryCode: 'US', currency: EXCHANGE_RATES.USD })
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function POST(request: NextRequest, { params }: { params: { slug: string[] } }) {
    const action = params.slug[0]

    if (action === 'web-search-status') {
        try {
            const { userId } = await request.json()
            if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

            const { remaining, total, resetDate, plan } = await getWebSearchRemaining(userId)
            const percentageUsed = total > 0 ? Math.round(((total - remaining) / total) * 100) : 0

            return NextResponse.json({
                success: true, remaining, total, resetDate, plan, percentageUsed,
                isLow: remaining <= Math.ceil(total * 0.2),
                message: remaining === 0 ? `🔍 Limit Reached (0/${total})` : (remaining <= 2 ? `🔍 Last ${remaining} search(es) remaining` : `🔍 Web Search (${remaining}/${total})`)
            })
        } catch (error) {
            return NextResponse.json({ error: 'Failed' }, { status: 500 })
        }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
