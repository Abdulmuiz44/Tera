/**
 * Currency Converter and Geolocation Handler
 * Automatically detects user location and converts prices to local currency
 */

export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  exchangeRate: number
  countryCode: string
}

// Exchange rates (base currency: USD)
// These should be updated regularly from an API in production
const EXCHANGE_RATES: Record<string, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 1,
    countryCode: 'US'
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    exchangeRate: 1550, // Approximate rate
    countryCode: 'NG'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    exchangeRate: 0.79,
    countryCode: 'GB'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    exchangeRate: 0.92,
    countryCode: 'EU'
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    exchangeRate: 83.12,
    countryCode: 'IN'
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    exchangeRate: 1.36,
    countryCode: 'CA'
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    exchangeRate: 1.52,
    countryCode: 'AU'
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    exchangeRate: 149.5,
    countryCode: 'JP'
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    exchangeRate: 165,
    countryCode: 'KE'
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    exchangeRate: 18.5,
    countryCode: 'ZA'
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    exchangeRate: 17.05,
    countryCode: 'MX'
  },
  BRL: {
    code: 'BRL',
    symbol: 'R$',
    name: 'Brazilian Real',
    exchangeRate: 4.97,
    countryCode: 'BR'
  }
}

// Country to currency mapping
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  GR: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  JP: 'JPY',
  IN: 'INR',
  CA: 'CAD',
  AU: 'AUD',
  NG: 'NGN',
  KE: 'KES',
  ZA: 'ZAR',
  MX: 'MXN',
  BR: 'BRL'
}

/**
 * Get currency info for a country code
 */
export function getCurrencyForCountry(countryCode: string): CurrencyInfo {
  const currencyCode = COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'USD'
  return EXCHANGE_RATES[currencyCode] || EXCHANGE_RATES.USD
}

/**
 * Convert USD price to local currency
 */
export function convertPrice(usdPrice: number, targetCurrency: string = 'USD'): number {
  const currency = EXCHANGE_RATES[targetCurrency.toUpperCase()]
  if (!currency) {
    return usdPrice
  }
  
  // Apply exchange rate and round to 2 decimal places
  const converted = usdPrice * currency.exchangeRate
  return Math.round(converted * 100) / 100
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  const currencyInfo = EXCHANGE_RATES[currency.toUpperCase()]
  if (!currencyInfo) {
    return `$${price.toFixed(2)}`
  }
  
  return `${currencyInfo.symbol}${price.toFixed(2)}`
}

/**
 * Get user's country and currency from server-side geolocation API
 * This is called from client-side and hits our backend endpoint for accurate IP-based geolocation
 */
export async function getUserCountryAndCurrency(): Promise<{ countryCode: string; currency: CurrencyInfo }> {
  try {
    // Call our backend API endpoint for geolocation
    const response = await fetch('/api/user/geo-currency', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        countryCode: data.countryCode,
        currency: data.currency as CurrencyInfo
      }
    }
    
    throw new Error('Failed to fetch geolocation data')
  } catch (error) {
    console.warn('Failed to get user location, falling back to browser detection:', error)
    
    try {
      // Fallback to browser locale detection
      const userLang = typeof navigator !== 'undefined' ? (navigator.language || navigator.languages?.[0]) : 'en-US'
      
      // Extract country code from language if available (e.g., 'en-US' -> 'US')
      const countryCode = userLang?.split('-')[1]?.toUpperCase() || 'US'
      const currency = getCurrencyForCountry(countryCode)
      
      return { countryCode, currency }
    } catch {
      // Final fallback to USD
      return { countryCode: 'US', currency: EXCHANGE_RATES.USD }
    }
  }
}

/**
 * Update exchange rates from an external API
 * Call this periodically to keep rates current
 */
export async function updateExchangeRates(): Promise<void> {
  try {
    // Using exchangerate-api.com free tier (limited calls)
    // For production, use a more reliable service
    const response = await fetch(
      `https://open.er-api.com/v6/latest/USD`,
      { headers: { 'Accept': 'application/json' } }
    )
    
    if (!response.ok) return
    
    const data = await response.json()
    
    // Update rates for currencies we support
    Object.keys(EXCHANGE_RATES).forEach(code => {
      if (code !== 'USD' && data.rates[code]) {
        EXCHANGE_RATES[code].exchangeRate = data.rates[code]
      }
    })
  } catch (error) {
    console.warn('Failed to update exchange rates:', error)
    // Continue using cached rates
  }
}

export default {
  getCurrencyForCountry,
  convertPrice,
  formatPrice,
  getUserCountryAndCurrency,
  updateExchangeRates,
  EXCHANGE_RATES,
  COUNTRY_TO_CURRENCY
}
