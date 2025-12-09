import { NextRequest, NextResponse } from 'next/server'
import { getCurrencyForCountry, EXCHANGE_RATES } from '@/lib/currency-converter'

/**
 * Get user's country and currency information based on IP geolocation
 * Falls back to browser language if needed
 */
export async function GET(request: NextRequest) {
  try {
    // Get user's IP and country from request headers or use geolocation API
    let countryCode = ''
    
    // Try to get from Cloudflare headers (if deployed on Cloudflare)
    const cfCountry = request.headers.get('cf-ipcountry')
    if (cfCountry) {
      countryCode = cfCountry.toUpperCase()
    }
    
    // Fallback: Use IP geolocation API
    if (!countryCode) {
      try {
        // Using ip-api.com (free tier, up to 45 requests/minute)
        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        
        const ipResponse = await fetch(
          `http://ip-api.com/json/${clientIp === 'unknown' ? '' : clientIp}`,
          { 
            headers: { 'Accept': 'application/json' },
            cache: 'no-store'
          }
        )
        
        if (ipResponse.ok) {
          const ipData = await ipResponse.json()
          countryCode = (ipData.countryCode || 'US').toUpperCase()
        } else {
          countryCode = 'US'
        }
      } catch (error) {
        console.warn('IP geolocation failed, defaulting to US:', error)
        countryCode = 'US'
      }
    }

    const currency = getCurrencyForCountry(countryCode)
    
    return NextResponse.json({
      success: true,
      countryCode,
      currency: {
        code: currency.code,
        symbol: currency.symbol,
        name: currency.name,
        exchangeRate: currency.exchangeRate
      }
    })
  } catch (error) {
    console.error('Geolocation/currency error:', error)
    
    // Fallback to USD
    const defaultCurrency = EXCHANGE_RATES.USD
    return NextResponse.json({
      success: true,
      countryCode: 'US',
      currency: {
        code: defaultCurrency.code,
        symbol: defaultCurrency.symbol,
        name: defaultCurrency.name,
        exchangeRate: defaultCurrency.exchangeRate
      }
    })
  }
}
