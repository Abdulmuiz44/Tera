'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PLAN_CONFIGS = {
  free: {
    name: 'free',
    displayName: 'Free',
    price: 0,
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '10 messages per day',
      '5 file uploads per day',
      '5 web searches per month',
      'Basic tools & features',
      'Mobile & desktop access'
    ]
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 5,
    period: '/month',
    description: 'For serious learners',
    features: [
      'Unlimited AI conversations',
      '20 file uploads per day',
      '50 web searches per month',
      'All tools & features',
      'Priority support',
      'Export to PDF/Word'
    ]
  },
  plus: {
    name: 'plus',
    displayName: 'Plus',
    price: 15,
    period: '/month',
    description: 'For professionals',
    features: [
      'Everything in Pro',
      'Unlimited file uploads',
      'Unlimited web searches',
      'Advanced analytics',
      'Team collaboration',
      '24/7 priority support',
      'Custom AI training',
      'API access'
    ]
  }
}

const CURRENCY_CODES: Record<string, { code: string; symbol: string; rate: number }> = {
  // North America
  'USD': { code: 'USD', symbol: '$', rate: 1 },
  'CAD': { code: 'CAD', symbol: 'CA$', rate: 1.35 },
  'MXN': { code: 'MXN', symbol: 'Mex$', rate: 16.7 },

  // Europe
  'EUR': { code: 'EUR', symbol: '€', rate: 0.92 },
  'GBP': { code: 'GBP', symbol: '£', rate: 0.79 },
  'CHF': { code: 'CHF', symbol: 'Fr.', rate: 0.90 },
  'SEK': { code: 'SEK', symbol: 'kr', rate: 10.6 },
  'NOK': { code: 'NOK', symbol: 'kr', rate: 10.7 },
  'DKK': { code: 'DKK', symbol: 'kr', rate: 6.9 },
  'PLN': { code: 'PLN', symbol: 'zł', rate: 3.95 },
  'CZK': { code: 'CZK', symbol: 'Kč', rate: 23.5 },
  'HUF': { code: 'HUF', symbol: 'Ft', rate: 360 },
  'TRY': { code: 'TRY', symbol: '₺', rate: 32.5 },

  // Asia Pacific
  'JPY': { code: 'JPY', symbol: '¥', rate: 154 },
  'AUD': { code: 'AUD', symbol: 'A$', rate: 1.52 },
  'NZD': { code: 'NZD', symbol: 'NZ$', rate: 1.65 },
  'CNY': { code: 'CNY', symbol: '¥', rate: 7.24 },
  'HKD': { code: 'HKD', symbol: 'HK$', rate: 7.83 },
  'SGD': { code: 'SGD', symbol: 'S$', rate: 1.35 },
  'KRW': { code: 'KRW', symbol: '₩', rate: 1375 },
  'INR': { code: 'INR', symbol: '₹', rate: 83.5 },
  'IDR': { code: 'IDR', symbol: 'Rp', rate: 16100 },
  'MYR': { code: 'MYR', symbol: 'RM', rate: 4.75 },
  'PHP': { code: 'PHP', symbol: '₱', rate: 57.5 },
  'THB': { code: 'THB', symbol: '฿', rate: 36.8 },
  'VND': { code: 'VND', symbol: '₫', rate: 25450 },
  'TWD': { code: 'TWD', symbol: 'NT$', rate: 32.5 },

  // Middle East & Africa
  'AED': { code: 'AED', symbol: 'د.إ', rate: 3.67 },
  'SAR': { code: 'SAR', symbol: '﷼', rate: 3.75 },
  'ILS': { code: 'ILS', symbol: '₪', rate: 3.75 },
  'ZAR': { code: 'ZAR', symbol: 'R', rate: 18.5 },
  'NGN': { code: 'NGN', symbol: '₦', rate: 1450 },
  'EGP': { code: 'EGP', symbol: 'E£', rate: 47.5 },
  'KES': { code: 'KES', symbol: 'KSh', rate: 130 },
  'GHS': { code: 'GHS', symbol: 'GH₵', rate: 14.5 },

  // South America
  'BRL': { code: 'BRL', symbol: 'R$', rate: 5.15 },
  'ARS': { code: 'ARS', symbol: 'AT$', rate: 875 }, // Highly volatile, estimated
  'CLP': { code: 'CLP', symbol: 'CLP$', rate: 950 },
  'COP': { code: 'COP', symbol: 'COL$', rate: 3900 },
  'PEN': { code: 'PEN', symbol: 'S/', rate: 3.75 },
}

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
  const [currency, setCurrency] = useState<typeof CURRENCY_CODES['USD'] | null>(null)
  const [countryCode, setCountryCode] = useState('')

  useEffect(() => {
    const loadUserAndCurrency = async () => {
      try {
        // Get currency from IP
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()
        const currencyCode = data.currency || 'USD'
        const currency = CURRENCY_CODES[currencyCode] || CURRENCY_CODES['USD']
        setCurrency(currency)
        setCountryCode(data.country_code || '')
      } catch (error) {
        console.error('Error fetching currency:', error)
        setCurrency(CURRENCY_CODES['USD'])
      }

      try {
        // Get authenticated user
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          const response = await fetch('/api/billing/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: authUser.id })
          })
          const data = await response.json()
          if (data.success) {
            setCurrentPlan(data.plan)
          }
        }
      } catch (error) {
        console.error('Error loading user plan:', error)
      }
    }
    loadUserAndCurrency()
  }, [supabase])

  const handleCheckout = async (plan: 'pro' | 'plus') => {
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
          currencyCode: currency?.code || 'USD',
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const data = await response.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL returned')
      }
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
      popular: false,
      highlighted: false,
      displayPrice: 0,
      displayCurrency: currency
    },
    {
      ...PLAN_CONFIGS.pro,
      cta: 'Upgrade to Pro',
      current: currentPlan === 'pro',
      popular: true,
      highlighted: true,
      displayPrice: currency ? convertPrice(PLAN_CONFIGS.pro.price, currency.code) : PLAN_CONFIGS.pro.price,
      displayCurrency: currency
    },
    {
      ...PLAN_CONFIGS.plus,
      cta: 'Go Premium',
      current: currentPlan === 'plus',
      popular: false,
      highlighted: false,
      displayPrice: currency ? convertPrice(PLAN_CONFIGS.plus.price, currency.code) : PLAN_CONFIGS.plus.price,
      displayCurrency: currency
    }
  ]

  return (
    <div className="w-full bg-tera-bg text-tera-primary custom-scrollbar font-sans selection:bg-tera-neon/30">
      <main className="overflow-y-auto">
        {/* Background Gradient Mesh */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-tera-neon/5 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-16 space-y-6">
            <p className="text-xs uppercase tracking-[0.5em] text-tera-neon">Pricing</p>
            <h1 className="text-4xl font-bold leading-tight text-tera-primary mt-2">Unlock Your Potential</h1>
            <p className="text-tera-secondary mt-2 max-w-2xl">Choose the perfect plan to supercharge your learning and productivity with AI</p>
          </div>

          <div className="flex-1 rounded-[28px] bg-tera-panel/40 border border-tera-border p-8 shadow-glow-md overflow-y-auto">
            {/* Comparison Table */}
            <div className="max-w-7xl mx-auto">
              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${plan.highlighted
                      ? 'bg-tera-panel border-tera-neon shadow-[0_0_40px_-10px_rgba(0,255,170,0.3)] scale-105 z-10'
                      : 'bg-tera-panel border-tera-border hover:border-tera-neon/30'
                      } p-8`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-tera-neon to-tera-neon/80 px-4 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-lg">
                        ⭐ Most Popular
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-tera-primary">{plan.displayName}</h3>
                      <p className="text-tera-secondary text-sm mt-1">{plan.description}</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className={`text-4xl font-black ${plan.highlighted ? 'text-tera-neon' : 'text-tera-primary'}`}>
                          {plan.displayCurrency ? plan.displayCurrency.symbol : '$'}{plan.displayPrice.toFixed(2)}
                        </span>
                        <span className="text-tera-secondary">{plan.period}</span>
                      </div>
                      {currency && currency.code !== 'USD' && (
                        <p className="text-xs text-tera-secondary/60 mt-2">
                          {currency.code} • Based on {countryCode}
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <ul className="mb-8 flex-1 space-y-3 border-t border-tera-border pt-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-tera-primary/90">
                          <span className={`mt-1 text-lg flex-shrink-0 ${plan.highlighted ? 'text-tera-neon' : 'text-tera-neon/60'}`}>✨</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      disabled={plan.current || (loading && (plan.name === 'pro' || plan.name === 'plus'))}
                      onClick={() => {
                        if (plan.name === 'free') {
                          if (!user) {
                            router.push('/auth/signin')
                          } else {
                            router.push('/new')
                          }
                        } else if (plan.name === 'pro') {
                          handleCheckout('pro')
                        } else if (plan.name === 'plus') {
                          handleCheckout('plus')
                        }
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-base ${plan.current
                        ? 'bg-tera-muted text-tera-secondary cursor-default'
                        : 'bg-tera-primary text-tera-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
                        }`}
                    >
                      {plan.current ? '✓ Current Plan' : (loading && (plan.name === 'pro' || plan.name === 'plus') ? 'Processing...' : plan.cta)}
                    </button>
                  </div>
                ))}
              </div>

              {/* Feature Comparison Table */}
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
                      {[
                        { feature: 'Daily AI Conversations', free: '10', pro: 'Unlimited', plus: 'Unlimited' },
                        { feature: 'Monthly Web Searches', free: '5', pro: '50', plus: '80' },
                        { feature: 'File Uploads (per day)', free: '5', pro: '20', plus: 'Unlimited' },
                        { feature: 'Max File Size', free: '25 MB', pro: '500 MB', plus: '2 GB' },
                        { feature: 'All Tools & Features', free: '✓ Basic', pro: '✓ All', plus: '✓ All' },
                        { feature: 'Export to PDF/Word', free: '—', pro: '✓', plus: '✓' },
                        { feature: 'Priority Support', free: '—', pro: '✓', plus: '✓ 24/7' },
                        { feature: 'Analytics Dashboard', free: '—', pro: '—', plus: '✓ Advanced' },
                        { feature: 'Team Collaboration', free: '—', pro: '—', plus: '✓' },
                        { feature: 'API Access', free: '—', pro: '—', plus: '✓' },
                        { feature: 'Custom AI Training', free: '—', pro: '—', plus: '✓' },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-tera-border hover:bg-tera-muted/50 transition">
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

              {/* FAQ Section */}
              <div className="border-t border-tera-border pt-12 mt-12">
                <h2 className="text-2xl font-bold text-tera-primary mb-8 text-center">Frequently Asked Questions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {[
                    { q: 'Can I upgrade my plan?', a: 'Yes! You can upgrade to Pro or Plus anytime. Your new features will be available immediately.' },
                    { q: 'Is there a contract?', a: 'No contracts. Cancel anytime. Your account remains active through your billing period.' },
                    { q: 'Do you offer refunds?', a: 'Yes, we offer a 7-day money-back guarantee on all paid plans.' },
                    { q: 'Can I use it for teams?', a: 'Plus plan includes team collaboration. Pro plan works great for individuals.' },
                    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and more through Lemon Squeezy.' },
                    { q: 'Is my data secure?', a: 'Yes! We use enterprise-grade encryption and comply with GDPR, CCPA, and other standards.' }
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-tera-muted/30 border border-tera-border rounded-lg p-4">
                      <h3 className="font-semibold text-tera-primary mb-2">{faq.q}</h3>
                      <p className="text-tera-secondary text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-tera-muted/30 border border-tera-border rounded-lg text-center max-w-2xl mx-auto">
                  <p className="text-tera-secondary text-sm">Have other questions? We're here to help!</p>
                  <a href="mailto:Teraaiguide@gmail.com" className="text-tera-neon hover:underline font-semibold mt-2 inline-block">
                    Contact us at Teraaiguide@gmail.com
                  </a>
                </div>
              </div>

              {/* CTA Section */}
              <div className="border-t border-tera-border pt-12 mt-12 text-center">
                <h2 className="text-2xl font-bold text-tera-primary mb-4">Ready to Get Started?</h2>
                <p className="text-tera-secondary mb-8 max-w-2xl mx-auto">
                  Join thousands of learners and professionals using Tera to unlock their potential. Start free, upgrade anytime.
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
