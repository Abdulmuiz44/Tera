'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { PLAN_CONFIGS } from '@/lib/plan-config'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export default function PricingPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const router = useRouter()

  // Load user and subscription status
  useEffect(() => {
    const loadUser = async () => {
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
    loadUser()
  }, [])

  const handleCheckout = async (plan: 'pro' | 'school') => {
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
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to initiate checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      ...PLAN_CONFIGS.free,
      cta: 'Current Plan',
      current: currentPlan === 'free',
      popular: false
    },
    {
      ...PLAN_CONFIGS.pro,
      cta: 'Upgrade to Pro',
      current: currentPlan === 'pro',
      popular: true
    },
    {
      ...PLAN_CONFIGS.school,
      cta: 'Contact Sales',
      current: currentPlan === 'school',
      popular: false
    }
  ]

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505]">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="relative flex-1 overflow-hidden px-6 py-10">
        <div className="flex flex-col h-full gap-8">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-white/40">TERA</p>
              <h1 className="text-3xl font-semibold leading-tight text-white">Pricing</h1>
            </div>
          </header>

          <div className="flex-1 rounded-[28px] bg-tera-panel border border-white/10 p-6 shadow-glow-md overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-8 text-center">Choose the plan that fits your classroom</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${plan.popular
                    ? 'bg-white/5 border-tera-neon shadow-[0_0_30px_-10px_rgba(var(--tera-neon-rgb),0.3)] scale-105 z-10'
                    : 'bg-tera-muted border-white/10 hover:border-white/20'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-tera-neon px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-black">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-white">{plan.displayName}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">${plan.price}</span>
                      <span className="text-sm text-white/60">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-white/60">{plan.description}</p>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-white/80">
                        <span className="mt-1 text-tera-neon">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    disabled={plan.current || loading}
                    onClick={() => {
                      if (plan.name === 'pro') {
                        handleCheckout('pro')
                      } else if (plan.name === 'school') {
                        // Contact sales - open email or contact form
                        window.location.href = 'mailto:sales@teralearn.ai?subject=School%20Plan%20Inquiry'
                      }
                    }}
                    className={`w-full rounded-lg py-2 text-sm font-medium transition ${plan.current
                      ? 'bg-white/10 text-white/40 cursor-default'
                      : plan.popular
                        ? 'bg-tera-neon text-black hover:bg-tera-neon/90 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                  >
                    {loading && plan.name === 'pro' ? 'Processing...' : plan.cta}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-white/40">
                Questions? <a href="#" className="text-tera-neon hover:underline">Contact our support team</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
