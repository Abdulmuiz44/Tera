'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { PLAN_CONFIGS } from '@/lib/plan-config'

type CurrencyConfig = {
  code: string
  symbol: string
  rate: number
}

type PaidPlan = 'pro' | 'plus'

const CURRENCY_CODES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1 },
  CAD: { code: 'CAD', symbol: 'CA$', rate: 1.35 },
  MXN: { code: 'MXN', symbol: 'Mex$', rate: 16.7 },
  EUR: { code: 'EUR', symbol: 'EUR ', rate: 0.92 },
  GBP: { code: 'GBP', symbol: 'GBP ', rate: 0.79 },
  CHF: { code: 'CHF', symbol: 'CHF ', rate: 0.9 },
  SEK: { code: 'SEK', symbol: 'SEK ', rate: 10.6 },
  NOK: { code: 'NOK', symbol: 'NOK ', rate: 10.7 },
  DKK: { code: 'DKK', symbol: 'DKK ', rate: 6.9 },
  PLN: { code: 'PLN', symbol: 'PLN ', rate: 3.95 },
  CZK: { code: 'CZK', symbol: 'CZK ', rate: 23.5 },
  HUF: { code: 'HUF', symbol: 'HUF ', rate: 360 },
  TRY: { code: 'TRY', symbol: 'TRY ', rate: 32.5 },
  JPY: { code: 'JPY', symbol: 'JPY ', rate: 154 },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.52 },
  NZD: { code: 'NZD', symbol: 'NZ$', rate: 1.65 },
  CNY: { code: 'CNY', symbol: 'CNY ', rate: 7.24 },
  HKD: { code: 'HKD', symbol: 'HK$', rate: 7.83 },
  SGD: { code: 'SGD', symbol: 'S$', rate: 1.35 },
  KRW: { code: 'KRW', symbol: 'KRW ', rate: 1375 },
  INR: { code: 'INR', symbol: 'INR ', rate: 83.5 },
  IDR: { code: 'IDR', symbol: 'IDR ', rate: 16100 },
  MYR: { code: 'MYR', symbol: 'MYR ', rate: 4.75 },
  PHP: { code: 'PHP', symbol: 'PHP ', rate: 57.5 },
  THB: { code: 'THB', symbol: 'THB ', rate: 36.8 },
  VND: { code: 'VND', symbol: 'VND ', rate: 25450 },
  TWD: { code: 'TWD', symbol: 'NT$', rate: 32.5 },
  AED: { code: 'AED', symbol: 'AED ', rate: 3.67 },
  SAR: { code: 'SAR', symbol: 'SAR ', rate: 3.75 },
  ILS: { code: 'ILS', symbol: 'ILS ', rate: 3.75 },
  ZAR: { code: 'ZAR', symbol: 'R', rate: 18.5 },
  NGN: { code: 'NGN', symbol: 'NGN ', rate: 1450 },
  EGP: { code: 'EGP', symbol: 'EGP ', rate: 47.5 },
  KES: { code: 'KES', symbol: 'KES ', rate: 130 },
  GHS: { code: 'GHS', symbol: 'GHS ', rate: 14.5 },
  BRL: { code: 'BRL', symbol: 'R$', rate: 5.15 },
  ARS: { code: 'ARS', symbol: 'ARS ', rate: 875 },
  CLP: { code: 'CLP', symbol: 'CLP ', rate: 950 },
  COP: { code: 'COP', symbol: 'COP ', rate: 3900 },
  PEN: { code: 'PEN', symbol: 'PEN ', rate: 3.75 },
}

const comparisonRows = [
  { feature: 'AI Conversations', free: 'Unlimited', pro: 'Unlimited', plus: 'Unlimited' },
  { feature: 'File Uploads per Day', free: '3', pro: '25', plus: 'Unlimited' },
  { feature: 'Max File Size', free: '10 MB', pro: '500 MB', plus: '2 GB' },
  { feature: 'Monthly Web Searches', free: '5', pro: '100', plus: 'Unlimited' },
  { feature: 'Deep Research Mode', free: '-', pro: 'Yes', plus: 'Yes' },
  { feature: 'All AI Tools', free: 'Basic', pro: 'Full', plus: 'Full' },
  { feature: 'Export to PDF and Word', free: '-', pro: 'Yes', plus: 'Yes' },
  { feature: 'Priority Support', free: '-', pro: 'Yes', plus: '24/7' },
  { feature: 'Analytics Dashboard', free: '-', pro: '-', plus: 'Advanced' },
]

const faqs = [
  { q: 'Can I upgrade my plan?', a: 'Yes. You can move to Pro or Plus at any time, and the new limits apply right away.' },
  { q: 'Is there a contract?', a: 'No. Plans are month to month and you can cancel anytime.' },
  { q: 'Do you offer refunds?', a: 'Yes. Paid plans include a 7-day money-back guarantee.' },
  { q: 'Can I use it for a team?', a: 'Tera is currently optimized for individual use. Reach out if you need organizational access or higher-volume usage.' },
  { q: 'What payment methods do you accept?', a: 'We accept major credit cards, PayPal, and other methods supported by Lemon Squeezy.' },
  { q: 'Is my data secure?', a: 'Yes. We use encrypted transport and storage, and the product is designed around standard privacy and access controls.' },
]

const convertPrice = (price: number, currencyCode: string): number => {
  const currency = CURRENCY_CODES[currencyCode]
  if (!currency) return price
  return Math.round(price * currency.rate * 100) / 100
}

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [currency, setCurrency] = useState<CurrencyConfig>(CURRENCY_CODES.USD)
  const [countryCode, setCountryCode] = useState('')

  useEffect(() => {
    const loadUserAndCurrency = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        const currencyCode = data.currency || 'USD'
        setCurrency(CURRENCY_CODES[currencyCode] || CURRENCY_CODES.USD)
        setCountryCode(data.country_code || '')
      } catch (error) {
        console.error('Error fetching currency:', error)
        setCurrency(CURRENCY_CODES.USD)
      }

      if (!user) return

      try {
        const response = await fetch('/api/billing/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        })

        const data = await response.json()
        if (data.success) {
          setCurrentPlan(data.plan)
        }
      } catch (error) {
        console.error('Error loading user plan:', error)
      }
    }

    void loadUserAndCurrency()
  }, [user])

  const handleCheckout = async (plan: PaidPlan) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (currentPlan === plan) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/billing/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          email: user.email,
          userId: user.id,
          currencyCode: currency.code,
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to create checkout session')
      }

      if (!data.checkoutUrl) {
        throw new Error('No checkout URL returned')
      }

      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('Checkout error:', error)
      const message = error instanceof Error ? error.message : 'Failed to initiate checkout'
      alert(`Error: ${message}. Please try again or contact support.`)
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      ...PLAN_CONFIGS.free,
      cta: 'Start Free',
      current: currentPlan === 'free',
      highlighted: false,
      popular: false,
      displayPrice: 0,
    },
    {
      ...PLAN_CONFIGS.pro,
      cta: 'Upgrade to Pro',
      current: currentPlan === 'pro',
      highlighted: true,
      popular: true,
      displayPrice: convertPrice(PLAN_CONFIGS.pro.price, currency.code),
    },
    {
      ...PLAN_CONFIGS.plus,
      cta: 'Upgrade to Plus',
      current: currentPlan === 'plus',
      highlighted: false,
      popular: false,
      displayPrice: convertPrice(PLAN_CONFIGS.plus.price, currency.code),
    },
  ]

  return (
    <div className="w-full bg-tera-bg text-tera-primary custom-scrollbar font-sans selection:bg-tera-neon/30">
      <main className="overflow-y-auto">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-tera-neon/5 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col items-center text-center mb-16 space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-tera-neon">Pricing</p>
            <h1 className="text-4xl font-bold leading-tight text-tera-primary mt-2">Unlock More of Tera</h1>
            <p className="text-tera-secondary mt-2 max-w-2xl">
              Conversations stay free. Upgrade when you need higher limits, deeper research, and Plus analytics.
            </p>
          </div>

          <div className="flex-1 rounded-[28px] bg-tera-panel/40 border border-tera-border p-8 shadow-glow-md overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative flex flex-col rounded-2xl border transition-all duration-300 p-8 ${
                      plan.highlighted
                        ? 'bg-tera-panel border-tera-neon shadow-[0_0_40px_-10px_rgba(0,255,170,0.3)] scale-105 z-10'
                        : 'bg-tera-panel border-tera-border hover:border-tera-neon/30'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-tera-neon to-tera-neon/80 px-4 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-lg">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-tera-primary">{plan.displayName}</h3>
                      <p className="text-tera-secondary text-sm mt-1">{plan.description}</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className={`text-4xl font-black ${plan.highlighted ? 'text-tera-neon' : 'text-tera-primary'}`}>
                          {currency.symbol}{plan.displayPrice.toFixed(2)}
                        </span>
                        <span className="text-tera-secondary">{plan.period}</span>
                      </div>
                      {currency.code !== 'USD' && (
                        <p className="text-xs text-tera-secondary/60 mt-2">
                          {currency.code}{countryCode ? ` - based on ${countryCode}` : ''}
                        </p>
                      )}
                    </div>

                    <ul className="mb-8 flex-1 space-y-3 border-t border-tera-border pt-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-tera-primary/90">
                          <span className={`mt-1 text-lg flex-shrink-0 ${plan.highlighted ? 'text-tera-neon' : 'text-tera-neon/60'}`}>+</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled={plan.current || (loading && plan.name !== 'free')}
                      onClick={() => {
                        if (plan.name === 'free') {
                          router.push(user ? '/new' : '/auth/signin')
                          return
                        }

                        void handleCheckout(plan.name as PaidPlan)
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-base ${
                        plan.current
                          ? 'bg-tera-muted text-tera-secondary cursor-default'
                          : 'bg-tera-primary text-tera-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
                      }`}
                    >
                      {plan.current ? 'Current Plan' : loading && plan.name !== 'free' ? 'Processing...' : plan.cta}
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-tera-border pt-12">
                <h2 className="text-2xl font-bold text-tera-primary mb-8 text-center">Detailed Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-tera-border">
                        <th className="text-left py-4 px-4 font-semibold text-tera-primary/80">Feature</th>
                        <th className="text-center py-4 px-4 font-semibold text-tera-primary/80">Free</th>
                        <th className="text-center py-4 px-4 font-semibold text-tera-primary/80">Pro</th>
                        <th className="text-center py-4 px-4 font-semibold text-tera-primary/80">Plus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.feature} className="border-b border-tera-border hover:bg-tera-muted/50 transition">
                          <td className="py-4 px-4 text-tera-primary font-medium">{row.feature}</td>
                          <td className="py-4 px-4 text-center text-tera-secondary">{row.free}</td>
                          <td className="py-4 px-4 text-center text-tera-secondary">{row.pro}</td>
                          <td className="py-4 px-4 text-center text-tera-secondary">{row.plus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-tera-border pt-12 mt-12 mb-12">
                <div className="p-6 bg-tera-neon/10 border border-tera-neon/30 rounded-lg text-center">
                  <p className="text-tera-secondary mb-3">Need help with billing or choosing a plan?</p>
                  <a
                    href="/help"
                    className="inline-block px-6 py-2 rounded-lg font-semibold transition hover:opacity-90 bg-black text-white dark:bg-tera-neon dark:text-black"
                  >
                    Visit Our Help Center
                  </a>
                </div>
              </div>

              <div className="border-t border-tera-border pt-12 mt-12">
                <h2 className="text-2xl font-bold text-tera-primary mb-8 text-center">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {faqs.map((faq) => (
                    <div key={faq.q} className="bg-tera-muted/30 border border-tera-border rounded-lg p-4">
                      <h3 className="font-semibold text-tera-primary mb-2">{faq.q}</h3>
                      <p className="text-tera-secondary text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-tera-muted/30 border border-tera-border rounded-lg text-center max-w-2xl mx-auto">
                  <p className="text-tera-secondary text-sm">Have other questions? We can help.</p>
                  <a href="mailto:Teraaiguide@gmail.com" className="text-tera-neon hover:underline font-semibold mt-2 inline-block">
                    Contact us at Teraaiguide@gmail.com
                  </a>
                </div>
              </div>

              <div className="border-t border-tera-border pt-12 mt-12 text-center">
                <h2 className="text-2xl font-bold text-tera-primary mb-4">Ready to Get Started?</h2>
                <p className="text-tera-secondary mb-8 max-w-2xl mx-auto">
                  Start free, then move up when you need more search volume, larger uploads, or analytics.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user ? (
                    <>
                      <button
                        onClick={() => router.push('/auth/signin')}
                        className="px-8 py-3 bg-tera-primary text-tera-bg font-semibold rounded-lg hover:opacity-90 transition shadow-lg"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => router.push('/auth/signup')}
                        className="px-8 py-3 bg-tera-panel border border-tera-border text-tera-primary font-semibold rounded-lg hover:bg-tera-muted transition"
                      >
                        Create Free Account
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => router.push('/new')}
                      className="px-8 py-3 bg-tera-primary text-tera-bg font-semibold rounded-lg hover:opacity-90 transition shadow-lg"
                    >
                      Start Using Tera
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-12 text-center border-t border-tera-border pt-8">
                <p className="text-sm text-tera-secondary">
                  Questions? <a href="mailto:Teraaiguide@gmail.com" className="text-tera-neon hover:underline">Contact our support team</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
