'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '0',
    period: '/month',
    features: [
      '15 chats per day',
      '5 file uploads per day',
      '5 web searches per month',
      'Basic features',
      'Mobile & desktop access'
    ],
    cta: 'Current Plan',
    isCurrent: true,
    ctaDisabled: true
  },
  {
    name: 'Pro',
    price: '5',
    period: '/month',
    features: [
      'Unlimited chats',
      '20 file uploads per day',
      '50 web searches per month',
      'All tools & features',
      'Priority support',
      'Advanced customization'
    ],
    cta: 'Upgrade to Pro',
    isCurrent: false,
    ctaDisabled: false
  },
  {
    name: 'Plus',
    price: '19',
    period: '/month',
    features: [
      'Everything in Pro',
      'Unlimited file uploads',
      '80 web searches per month',
      'Advanced analytics',
      'Team collaboration',
      '24/7 priority support'
    ],
    cta: 'Go Premium',
    isCurrent: false,
    ctaDisabled: false
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4 text-center">Simple, Transparent Pricing</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12">Choose the plan that works for you</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`border-2 rounded-lg p-6 transition ${
                  plan.isCurrent
                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                    : 'border-gray-300 dark:border-gray-800 hover:border-black dark:hover:border-white'
                }`}
              >
                <h2 className="text-2xl font-bold text-black dark:text-white mb-2">{plan.name}</h2>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-black dark:text-white">${plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                </div>

                <button
                  disabled={plan.ctaDisabled}
                  className={`w-full py-2 px-4 rounded font-medium mb-6 transition ${
                    plan.ctaDisabled
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-black dark:text-white mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-lg p-8">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-2">Can I upgrade my plan?</h4>
                <p className="text-gray-600 dark:text-gray-400">Yes! You can upgrade anytime. New features are available immediately.</p>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-2">Do you offer refunds?</h4>
                <p className="text-gray-600 dark:text-gray-400">Contact support at Teraaiguide@gmail.com for refund inquiries.</p>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-2">Can I cancel anytime?</h4>
                <p className="text-gray-600 dark:text-gray-400">Yes, you can cancel your subscription at any time without penalties.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
