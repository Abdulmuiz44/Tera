'use client'

import { useState } from 'react'
import Link from 'next/link'

const HELP_SECTIONS = [
  {
    id: 'billing',
    title: 'Billing & Payments',
    icon: '💳',
    articles: [
      {
        title: 'How do I upgrade my plan?',
        content: `To upgrade your plan:
1. Open the Pricing page
2. Choose Pro or Plus
3. Review your plan details
4. Continue to the secure checkout powered by Lemon Squeezy
5. Complete payment

Your new limits and features become available as soon as the subscription is active.`,
      },
      {
        title: 'What payment methods do you accept?',
        content: `We accept major credit cards, PayPal, and other payment methods supported by Lemon Squeezy.

Payments are processed securely through Lemon Squeezy. Tera does not store your payment details on its own servers.`,
      },
      {
        title: 'How do I manage my subscription?',
        content: `You can manage billing from your profile:
1. Open your Profile page
2. Find the subscription section
3. Open the billing portal

From there you can review your plan, update payment details, or cancel.`,
      },
      {
        title: 'Do you offer refunds?',
        content: `Yes. Paid plans include a 7-day money-back guarantee.

If you need help with a refund request, contact Teraaiguide@gmail.com with your account email and purchase details.`,
      },
      {
        title: 'What happens when my subscription expires?',
        content: `If a paid subscription ends, your account falls back to the Free plan.

Your conversations and account data remain available, but your limits return to the Free tier until you resubscribe.`,
      },
    ],
  },
  {
    id: 'plans',
    title: 'Understanding Your Plans',
    icon: '📊',
    articles: [
      {
        title: "What's included in the Free plan?",
        content: `The Free plan includes:
- Unlimited AI conversations
- 3 file uploads per day (10MB each)
- 5 web searches per month
- Basic AI tools and features
- Mobile and desktop access

It is designed to let you use Tera without a credit card.`,
      },
      {
        title: "What's the difference between Pro and Plus?",
        content: `Pro plan ($5/month):
- Everything in Free
- 25 file uploads per day (500MB each)
- 100 web searches per month
- Deep Research Mode
- Export to PDF and Word
- Priority support

Plus plan ($15/month):
- Everything in Pro
- Unlimited file uploads (2GB each)
- Unlimited web searches
- Advanced analytics dashboard
- 24/7 priority support
- Highest usage limits across Tera`,
      },
      {
        title: 'Can I switch plans anytime?',
        content: `Yes. You can upgrade or downgrade at any time.

Upgrades take effect immediately. Downgrades typically apply at the next renewal period.`,
      },
      {
        title: 'Do you offer annual billing?',
        content: `Tera currently uses monthly billing.

If you need higher-volume or organizational access, contact Teraaiguide@gmail.com.`,
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔧',
    articles: [
      {
        title: 'My payment was declined. What should I do?',
        content: `Try the following:
1. Re-check your card details
2. Confirm you have sufficient funds
3. Try another payment method
4. Contact your bank if international payments are blocked

If the problem continues, contact support with the error message and your account email.`,
      },
      {
        title: "I'm not seeing my premium features after upgrading",
        content: `If your paid features do not appear right away:
1. Refresh the page
2. Sign out and back in
3. Wait a few minutes for billing sync
4. Check your profile to confirm the active plan

If the issue continues, contact support with a screenshot and your account email.`,
      },
      {
        title: 'How do I cancel my subscription?',
        content: `Open your profile, launch the billing portal, and cancel from there.

Your paid access remains active until the end of the current billing period.`,
      },
      {
        title: 'I was charged twice. What should I do?',
        content: `First, check whether one charge is only a temporary authorization hold.

If you still see duplicate settled charges after 24-48 hours, email support with your account email and payment screenshots.`,
      },
    ],
  },
  {
    id: 'general',
    title: 'General Questions',
    icon: '❓',
    articles: [
      {
        title: 'Is there a contract?',
        content: `No. Plans are month to month with no long-term contract.`,
      },
      {
        title: 'How is my data protected?',
        content: `Tera uses encrypted transport and storage, standard authentication controls, and role-based access patterns around user data.`,
      },
      {
        title: 'Can I use Tera with a team?',
        content: `The current product is optimized for individual use.

If you need organizational access or higher-volume usage, contact Teraaiguide@gmail.com.`,
      },
      {
        title: 'Where do I get more help?',
        content: `For billing, account, or product questions, email Teraaiguide@gmail.com.`,
      },
    ],
  },
]

export default function HelpPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [expandedArticles, setExpandedArticles] = useState<string[]>([])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((current) =>
      current.includes(sectionId)
        ? current.filter((id) => id !== sectionId)
        : [...current, sectionId]
    )
  }

  const toggleArticle = (articleId: string) => {
    setExpandedArticles((current) =>
      current.includes(articleId)
        ? current.filter((id) => id !== articleId)
        : [...current, articleId]
    )
  }

  return (
    <div className="w-full bg-tera-bg text-tera-primary custom-scrollbar font-sans selection:bg-tera-neon/30">
      <main className="overflow-y-auto min-h-screen">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-tera-neon/5 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col items-center text-center mb-12">
            <p className="text-xs uppercase tracking-[0.5em] text-tera-neon mb-4">Help Center</p>
            <h1 className="text-4xl font-bold leading-tight text-tera-primary mb-4">How Can We Help?</h1>
            <p className="text-tera-secondary max-w-2xl">
              Find answers to common questions about billing, plans, and using Tera.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {HELP_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleSection(section.id)}
                className="flex items-center gap-3 p-4 rounded-lg bg-tera-panel border border-tera-border hover:border-tera-neon/30 transition text-left"
              >
                <span className="text-2xl">{section.icon}</span>
                <span className="font-semibold text-tera-primary">{section.title}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {HELP_SECTIONS.map((section) => (
              <div
                key={section.id}
                className="rounded-lg bg-tera-panel border border-tera-border overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-tera-muted/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <h2 className="text-xl font-bold text-tera-primary">{section.title}</h2>
                  </div>
                  <span className={`text-tera-neon transition ${expandedSections.includes(section.id) ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {expandedSections.includes(section.id) && (
                  <div className="px-6 pb-6 space-y-4 border-t border-tera-border pt-4">
                    {section.articles.map((article, idx) => {
                      const articleId = `${section.id}-${idx}`
                      const isExpanded = expandedArticles.includes(articleId)

                      return (
                        <div
                          key={articleId}
                          className="rounded-lg bg-tera-muted/30 border border-tera-border overflow-hidden"
                        >
                          <button
                            onClick={() => toggleArticle(articleId)}
                            className="w-full flex items-center justify-between p-4 hover:bg-tera-muted/50 transition text-left"
                          >
                            <h3 className="font-semibold text-tera-primary">{article.title}</h3>
                            <span className={`text-tera-neon transition ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-tera-border pt-4">
                              <p className="text-tera-secondary whitespace-pre-wrap leading-relaxed text-sm">
                                {article.content}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-tera-neon/10 to-blue-500/10 border border-tera-neon/30 rounded-lg text-center">
            <h3 className="text-xl font-bold text-tera-primary mb-3">Still need help?</h3>
            <p className="text-tera-secondary mb-4">
              Our support team is here to help.
            </p>
            <a
              href="mailto:Teraaiguide@gmail.com"
              className="inline-block px-6 py-3 bg-tera-neon text-black font-semibold rounded-lg hover:opacity-90 transition"
            >
              Contact Support
            </a>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-tera-neon hover:underline font-semibold"
            >
              Back to Pricing
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
