'use client'

import Link from 'next/link'

interface UpgradePromptProps {
    type: 'lesson-plans' | 'chats' | 'file-uploads' | 'web-search' | 'research-mode'
    onClose?: () => void
    inline?: boolean
}

export default function UpgradePrompt({ type, onClose, inline = false }: UpgradePromptProps) {
    const messages = {
        'lesson-plans': {
            title: 'Lesson Plan Limit Reached',
            description: "You've reached your monthly limit of 5 lesson plans on the Free plan.",
            benefit: 'Upgrade to Pro for unlimited lesson plans and advanced features.',
            icon: '📚'
        },
        'chats': {
            title: 'Something Went Wrong',
            description: "There was an issue processing your message. All plans include unlimited conversations.",
            benefit: 'Please try again or contact support if this persists.',
            icon: '💬'
        },
        'file-uploads': {
            title: 'File Upload Limit Reached',
            description: "You've reached your daily limit of 3 file uploads on the Free plan.",
            benefit: 'Upgrade to Pro for 25 uploads/day or Plus for unlimited.',
            icon: '📎'
        },
        'web-search': {
            title: 'Web Search Limit Reached',
            description: "You've reached your monthly limit of 5 web searches on the Free plan.",
            benefit: 'Upgrade to Pro (100/month) or Plus (unlimited) to unlock more searches.',
            icon: '🔍'
        },
        'research-mode': {
            title: 'Deep Research Mode',
            description: "Deep Research mode (comprehensive multi-source research) is only available on Pro and Plus plans.",
            benefit: 'Upgrade to access Deep Research and other advanced features.',
            icon: '🔭'
        }
    }

    const message = messages[type]

    if (inline) {
        return (
            <div className="rounded-xl bg-tera-neon/10 border border-tera-neon/30 p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">{message.icon}</span>
                    <div className="flex-1">
                        <h3 className="font-semibold text-tera-primary mb-1">{message.title}</h3>
                        <p className="text-sm text-tera-primary/70 mb-3">{message.description}</p>
                        <p className="text-sm text-tera-neon font-medium mb-3">{message.benefit}</p>
                        <Link
                            href="/pricing"
                            className="inline-block px-4 py-2 rounded-lg bg-tera-neon text-tera-bg dark:text-black text-sm font-medium hover:bg-tera-neon/90 transition"
                        >
                            View Plans
                        </Link>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-tera-secondary hover:text-tera-primary transition"
                            aria-label="Close"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative max-w-md w-full mx-4 rounded-2xl bg-tera-panel border border-tera-border shadow-2xl p-6">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-tera-secondary hover:text-tera-primary transition"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                )}

                <div className="text-center">
                    <div className="text-5xl mb-4">{message.icon}</div>
                    <h2 className="text-2xl font-bold text-tera-primary mb-2">{message.title}</h2>
                    <p className="text-tera-primary/70 mb-4">{message.description}</p>
                    <p className="text-tera-neon mb-6 font-medium">{message.benefit}</p>

                    <div className="flex gap-3">
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 rounded-lg border border-tera-border text-tera-primary hover:bg-tera-muted transition"
                            >
                                Maybe Later
                            </button>
                        )}
                        <Link
                            href="/pricing"
                            className="flex-1 px-4 py-3 rounded-lg bg-tera-neon text-tera-bg dark:text-black font-semibold hover:bg-tera-neon/90 transition text-center"
                        >
                            View Plans
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
