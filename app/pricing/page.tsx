'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserCountryAndCurrency, convertPrice, formatPrice, type CurrencyInfo } from '@/lib/currency-converter'

export default function PricingPage() {
    const [sidebarExpanded, setSidebarExpanded] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [currentPlan, setCurrentPlan] = useState<string>('free')
    const [currency, setCurrency] = useState<CurrencyInfo | null>(null)
    const [countryCode, setCountryCode] = useState<string>('US')
    const router = useRouter()

    // Load user, subscription status, and user's country/currency
    useEffect(() => {
        const loadUserAndCurrency = async () => {
            // Get user's country and currency
            const { countryCode: userCountry, currency: userCurrency } = await getUserCountryAndCurrency()
            setCountryCode(userCountry)
            setCurrency(userCurrency)

            // Get authenticated user
            const { data: { user: authUser } } = await supabase.auth.getUser()
            setUser(authUser || null)

            if (authUser) {
                const response = await fetch('/api/subscription/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: authUser.id })
                })
                const data = await response.json()
                if (data.success) {
                    setCurrentPlan(data.plan)
                }
            }
        }
        loadUserAndCurrency()
    }, [])

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
            const response = await fetch('/api/checkout/create-session', {
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
        <div className="flex flex-col md:flex-row h-screen w-full bg-gradient-to-br from-[#050505] to-[#1a1a1a]">
            <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
            <main className="relative flex-1 overflow-hidden px-6 py-10">
                <div className="flex flex-col h-full gap-8">
                    <header className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.5em] text-tera-neon">Pricing</p>
                            <h1 className="text-4xl font-bold leading-tight text-white mt-2">Unlock Your Potential</h1>
                            <p className="text-white/60 mt-2 max-w-2xl">Choose the perfect plan to supercharge your learning and productivity with AI</p>
                        </div>
                    </header>

                    <div className="flex-1 rounded-[28px] bg-tera-panel/40 border border-white/5 p-8 shadow-glow-md overflow-y-auto">
                        {/* Comparison Table */}
                        <div className="max-w-7xl mx-auto">
                            {/* Pricing Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.name}
                                        className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${plan.highlighted
                                            ? 'bg-gradient-to-br from-tera-neon/10 to-tera-neon/5 border-tera-neon shadow-[0_0_40px_-10px_rgba(0,255,170,0.4)] scale-105 z-10'
                                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                            } p-8`}
                                    >
                                        {plan.highlighted && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-tera-neon to-tera-neon/80 px-4 py-1 text-xs font-bold uppercase tracking-wider text-black shadow-lg">
                                                ⭐ Most Popular
                                            </div>
                                        )}

                                        {/* Plan Header */}
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold text-white">{plan.displayName}</h3>
                                            <p className="text-white/60 text-sm mt-1">{plan.description}</p>
                                            <div className="mt-4 flex items-baseline gap-1">
                                                <span className={`text-4xl font-black ${plan.highlighted ? 'text-tera-neon' : 'text-white'}`}>
                                                    {plan.displayCurrency ? plan.displayCurrency.symbol : '$'}{plan.displayPrice.toFixed(2)}
                                                </span>
                                                <span className="text-white/60">{plan.period}</span>
                                            </div>
                                            {currency && currency.code !== 'USD' && (
                                                <p className="text-xs text-white/40 mt-2">
                                                    {currency.code} • Based on {countryCode}
                                                </p>
                                            )}
                                        </div>

                                        {/* Features List */}
                                        <ul className="mb-8 flex-1 space-y-3 border-t border-white/10 pt-6">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-white/90">
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
                                                ? 'bg-white/10 text-white/40 cursor-default'
                                                : 'bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed'
                                                }`}
                                        >
                                            {plan.current ? '✓ Current Plan' : (loading && (plan.name === 'pro' || plan.name === 'plus') ? 'Processing...' : plan.cta)}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Feature Comparison Table */}
                            <div className="border-t border-white/10 pt-12">
                                <h2 className="text-2xl font-bold text-white mb-8 text-center">Detailed Comparison</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-4 px-4 font-semibold text-white/80">Feature</th>
                                                <th className="text-center py-4 px-4 font-semibold text-white/80">Free</th>
                                                <th className="text-center py-4 px-4 font-semibold text-white/80">Pro</th>
                                                <th className="text-center py-4 px-4 font-semibold text-white/80">Plus</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { feature: 'Daily AI Conversations', free: '15', pro: 'Unlimited', plus: 'Unlimited' },
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
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                                                    <td className="py-4 px-4 text-white font-medium">{row.feature}</td>
                                                    <td className="py-4 px-4 text-center text-white/70">{row.free}</td>
                                                    <td className="py-4 px-4 text-center text-white/70">{row.pro}</td>
                                                    <td className="py-4 px-4 text-center text-white/70">{row.plus}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div className="border-t border-white/10 pt-12 mt-12">
                                <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                    {[
                                        { q: 'Can I upgrade my plan?', a: 'Yes! You can upgrade to Pro or Plus anytime. Your new features will be available immediately.' },
                                        { q: 'Is there a contract?', a: 'No contracts. Cancel anytime. Your account remains active through your billing period.' },
                                        { q: 'Do you offer refunds?', a: 'Yes, we offer a 7-day money-back guarantee on all paid plans.' },
                                        { q: 'Can I use it for teams?', a: 'Plus plan includes team collaboration. Pro plan works great for individuals.' },
                                        { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and more through Lemon Squeezy.' },
                                        { q: 'Is my data secure?', a: 'Yes! We use enterprise-grade encryption and comply with GDPR, CCPA, and other standards.' }
                                    ].map((faq, idx) => (
                                        <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                            <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                                            <p className="text-white/70 text-sm">{faq.a}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-lg text-center max-w-2xl mx-auto">
                                    <p className="text-white/70 text-sm">Have other questions? We're here to help!</p>
                                    <a href="mailto:Teraaiguide@gmail.com" className="text-tera-neon hover:underline font-semibold mt-2 inline-block">
                                        Contact us at Teraaiguide@gmail.com
                                    </a>
                                </div>
                            </div>

                            {/* CTA Section */}
                            <div className="border-t border-white/10 pt-12 mt-12 text-center">
                                <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
                                <p className="text-white/60 mb-8 max-w-2xl mx-auto">
                                    Join thousands of learners and professionals using Tera to unlock their potential. Start free, upgrade anytime.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {!user ? (
                                        <>
                                            <button
                                                onClick={() => router.push('/auth/signin')}
                                                className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition"
                                            >
                                                Sign In
                                            </button>
                                            <button
                                                onClick={() => router.push('/auth/signup')}
                                                className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition"
                                            >
                                                Create Free Account
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => router.push('/new')}
                                            className="px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition shadow-lg"
                                        >
                                            Start Using Tera
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-12 text-center border-t border-white/10 pt-8">
                                <p className="text-sm text-white/40">
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
