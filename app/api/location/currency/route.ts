import { NextResponse } from 'next/server'

const FALLBACK_CURRENCY = 'USD'

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2500)

  try {
    const response = await fetch('https://ipapi.co/json/', {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'tera-pricing/1.0',
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      return NextResponse.json({ currency: FALLBACK_CURRENCY, countryCode: '' })
    }

    const data = await response.json()

    return NextResponse.json({
      currency: typeof data?.currency === 'string' ? data.currency : FALLBACK_CURRENCY,
      countryCode: typeof data?.country_code === 'string' ? data.country_code : '',
    })
  } catch {
    return NextResponse.json({ currency: FALLBACK_CURRENCY, countryCode: '' })
  } finally {
    clearTimeout(timeout)
  }
}
