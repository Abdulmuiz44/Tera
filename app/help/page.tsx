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
1. Go to the Pricing page
2. Click the "Upgrade to Pro" or "Go Premium" button
3. Review your plan details and click proceed
4. You'll be redirected to our secure payment page powered by Lemon Squeezy
5. Complete your payment using your preferred method
6. Your subscription will be activated immediately

Once upgraded, all premium features will be available in your account right away.`
      },
      {
        title: 'What payment methods do you accept?',
        content: `We accept all major payment methods including:
• Credit cards (Visa, Mastercard, American Express)
• PayPal
• Other methods supported by Lemon Squeezy

All payments are processed securely through Lemon Squeezy, a trusted payment processor. Your payment information is never stored on our servers.`
      },
      {
        title: 'How do I manage my subscription?',
        content: `You can manage your subscription by:
1. Visiting your Profile page
2. Looking for the "Billing" or "Subscription" section
3. From there you can:
   - View your current plan and billing details
   - Update your payment method
   - Pause or cancel your subscription
   - Access the customer portal for detailed billing history

All changes take effect immediately.`
      },
      {
        title: 'Do you offer refunds?',
        content: `Yes! We offer a 7-day money-back guarantee on all paid plans. If you're not satisfied with your subscription within the first 7 days, you can request a refund by contacting our support team at Teraaiguide@gmail.com.

Refunds will be processed back to your original payment method within 5-10 business days.`
      },
      {
        title: 'Can I downgrade my plan?',
        content: `Yes, you can downgrade at any time. To downgrade:
1. Go to your Profile page
2. Visit your subscription settings
3. Select a lower-tier plan or the Free plan
4. Your billing will adjust on your next billing date

No penalties or additional charges apply. Your account will retain its current features through the end of your billing period.`
      },
      {
        title: 'What happens when my subscription expires?',
        content: `When your subscription expires:
1. You'll receive an email reminder 3 days before renewal
2. If payment fails, you have a 5-day grace period to update your payment method
3. After the grace period, your account reverts to the Free plan
4. Your data is never deleted - you'll still have access to it
5. All conversations and files remain in your account

You can reactivate your subscription at any time by visiting the Pricing page.`
      }
    ]
  },
  {
    id: 'plans',
    title: 'Understanding Your Plans',
    icon: '📊',
    articles: [
      {
        title: 'What\'s included in the Free plan?',
        content: `The Free plan includes:
• Unlimited AI conversations — chat as much as you want!
• 3 file uploads per day (10MB each)
• 5 web searches per month
• Access to basic tools and features
• Mobile & desktop access
• No credit card required

Perfect for anyone who wants to learn with Tera!`
      },
      {
        title: 'What\'s the difference between Pro and Plus?',
        content: `Pro plan ($5/month):
• Everything in Free, plus:
• 25 file uploads per day (500MB each)
• 100 web searches per month
• Deep Research Mode
• Export to PDF/Word
• Priority email support
• Perfect for serious learners who need more power

Plus plan ($15/month):
• Everything in Pro, plus:
• Unlimited file uploads (2GB each)
• Unlimited web searches
• Advanced analytics dashboard
• Team collaboration features
• 24/7 priority support
• Custom AI training
• API access
• Perfect for professionals and teams`
      },
      {
        title: 'Can I switch plans anytime?',
        content: `Yes! You can switch plans anytime:
• Upgrade anytime and get immediate access to new features
• Downgrade anytime with billing adjusted at next renewal
• No penalties or hidden fees
• Your data and conversation history follows you across all plans

Changes take effect immediately. Your billing will adjust proportionally if you upgrade or downgrade mid-month.`
      },
      {
        title: 'Is there a discount for annual billing?',
        content: `Currently, we offer monthly billing. We're working on annual plans with special discounts - stay tuned!

If you have specific needs or want to discuss bulk licensing for teams, please contact us at Teraaiguide@gmail.com.`
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔧',
    articles: [
      {
        title: 'My payment was declined. What should I do?',
        content: `If your payment was declined:
1. Check that your card details are correct
2. Ensure you have sufficient funds
3. Try a different payment method or card
4. Contact your bank to verify international transactions are allowed
5. Try again using PayPal or another payment method

If the problem persists, please contact our support team at Teraaiguide@gmail.com with:
• Your email address
• The error message received
• The payment method you tried`
      },
      {
        title: 'I\'m not seeing my premium features after upgrading',
        content: `If you don't see your premium features:
1. Refresh your browser (Ctrl+R or Cmd+R)
2. Log out and log back in
3. Clear your browser cache
4. Try a different browser to confirm
5. Wait 5-10 minutes for your account to sync

If features still don't appear:
• Check your Profile page to confirm your plan is active
• Email support at Teraaiguide@gmail.com with a screenshot`
      },
      {
        title: 'How do I cancel my subscription?',
        content: `To cancel your subscription:
1. Go to your Profile page
2. Navigate to your subscription settings
3. Click "Cancel Subscription"
4. Confirm your cancellation

Your account will:
• Remain active through the end of your billing period
• Revert to the Free plan after expiration
• Retain all your data and conversation history
• Be able to reactivate anytime

You'll receive a confirmation email with cancellation details.`
      },
      {
        title: 'I was charged twice. What do I do?',
        content: `If you were charged twice:
1. Don't panic - this is usually a processing issue, not a duplicate charge
2. Check your bank/card statement in 24-48 hours - temporary holds typically clear automatically
3. Check your email for confirmation messages
4. Review your billing history in your Profile

If you see two actual charges:
• Email us at Teraaiguide@gmail.com with:
  - Screenshots of your charges
  - Your transaction dates
  - Your account email
  - Order/receipt numbers if available
• We'll investigate immediately and refund if needed`
      }
    ]
  },
  {
    id: 'general',
    title: 'General Questions',
    icon: '❓',
    articles: [
      {
        title: 'Is there a contract?',
        content: `No contracts at all! 

• Cancel anytime with no penalties
• Your account remains active through your billing period
• No hidden fees or surprise charges
• Downgrade to a lower plan whenever you want

We believe in earning your subscription every day, not locking you in.`
      },
      {
        title: 'How is my data protected?',
        content: `Your data security is our top priority:
• We use enterprise-grade encryption (TLS/SSL)
• All data is encrypted in transit and at rest
• We comply with GDPR, CCPA, and other privacy standards
• Regular security audits and penetration testing
• Your conversations and files are private by default
• We never sell or share your data with third parties

Learn more in our Privacy Policy and Terms of Service.`
      },
      {
        title: 'Can I use Tera for commercial purposes?',
        content: `Absolutely! Both Pro and Plus plans support commercial use:
• Build projects for clients
• Use for business research and analysis
• Generate content for commercial products
• Plus plan includes additional tools for teams

For enterprise or bulk licensing needs, contact us at Teraaiguide@gmail.com.`
      },
      {
        title: 'Do you offer educational discounts?',
        content: `We're committed to making Tera accessible to students! 

Contact our support team at Teraaiguide@gmail.com with:
• Proof of enrollment (student ID or institutional email)
• Your intended use case

We offer discounted rates for verified students and educators.`
      }
    ]
  }
]

export default function HelpPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>(['billing'])
  const [expandedArticles, setExpandedArticles] = useState<string[]>([])

  const toggleSection = (id: string) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const toggleArticle = (id: string) => {
    setExpandedArticles(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  return (
    <div className="w-full bg-tera-bg text-tera-primary custom-scrollbar font-sans selection:bg-tera-neon/30">
      <main className="overflow-y-auto min-h-screen">
        {/* Background Gradient Mesh */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-tera-neon/5 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 py-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <p className="text-xs uppercase tracking-[0.5em] text-tera-neon mb-4">Help Center</p>
            <h1 className="text-4xl font-bold leading-tight text-tera-primary mb-4">How Can We Help?</h1>
            <p className="text-tera-secondary max-w-2xl">
              Find answers to common questions about billing, plans, and using Tera
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {HELP_SECTIONS.map(section => (
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

          {/* Help Sections */}
          <div className="space-y-6">
            {HELP_SECTIONS.map(section => (
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

          {/* Contact Section */}
          <div className="mt-12 p-8 bg-gradient-to-r from-tera-neon/10 to-blue-500/10 border border-tera-neon/30 rounded-lg text-center">
            <h3 className="text-xl font-bold text-tera-primary mb-3">Still need help?</h3>
            <p className="text-tera-secondary mb-4">
              Our support team is here to help. Reach out anytime!
            </p>
            <a
              href="mailto:Teraaiguide@gmail.com"
              className="inline-block px-6 py-3 bg-tera-neon text-black font-semibold rounded-lg hover:opacity-90 transition"
            >
              Contact Support
            </a>
          </div>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-tera-neon hover:underline font-semibold"
            >
              ← Back to Pricing
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
