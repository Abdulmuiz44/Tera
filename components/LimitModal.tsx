'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface LimitModalProps {
    isOpen: boolean
    limitType: 'chats' | 'file-uploads' | 'web-search' | 'research-mode' | null
    currentPlan: string
    onClose: () => void
    unlocksAt?: Date
}

export default function LimitModal({ isOpen, limitType, currentPlan, onClose, unlocksAt }: LimitModalProps) {
    const router = useRouter()
    const [isClosing, setIsClosing] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState<string>('')

    useEffect(() => {
        if (!unlocksAt) return

        const updateTime = () => {
            const now = new Date()
            const diff = unlocksAt.getTime() - now.getTime()

            if (diff <= 0) {
                setTimeRemaining('Available now')
            } else {
                const hours = Math.floor(diff / (60 * 60 * 1000))
                const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))

                if (hours > 0) {
                    setTimeRemaining(`${hours}h ${minutes}m remaining`)
                } else {
                    setTimeRemaining(`${minutes}m remaining`)
                }
            }
        }

        updateTime()
        const interval = setInterval(updateTime, 60000) // Update every minute

        return () => clearInterval(interval)
    }, [unlocksAt])

    if (!isOpen || !limitType) return null

    const limitInfo: Record<string, { title: string; message: string; current: number; upgrade: string }> = {
        'chats': {
            title: 'Something Went Wrong',
            message: 'There was an issue processing your message. Please try again.',
            current: 0,
            upgrade: 'Contact support if this persists',
        },
        'file-uploads': {
            title: 'File Upload Limit Reached',
            message: 'You\'ve reached your daily file upload limit.',
            current: 3,
            upgrade: 'Pro for 25 uploads, Plus for unlimited',
        },
        'web-search': {
            title: 'Monthly Web Search Limit Reached',
            message: 'You\'ve reached your monthly web search limit.',
            current: 5,
            upgrade: 'Pro for 100 searches, Plus for unlimited',
        },
        'research-mode': {
            title: 'Deep Research Mode',
            message: 'Deep Research is a Pro/Plus feature for comprehensive multi-source research.',
            current: 0,
            upgrade: 'Pro or Plus',
        },
    }

    const info = limitInfo[limitType]

    const handleUpgrade = () => {
        setIsClosing(true)
        setTimeout(() => {
            router.push('/pricing')
            onClose()
        }, 300)
    }

    return (
        <div
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 overflow-auto p-4 ${isClosing ? 'opacity-0' : 'opacity-100'
                }`}
        >
            <div
                className={`bg-tera-panel-strong border border-tera-border rounded-2xl p-6 md:p-8 max-w-md w-full my-auto transition-all duration-300 transform max-h-[90vh] overflow-y-auto text-tera-primary ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => {
                        setIsClosing(true)
                        setTimeout(onClose, 300)
                    }}
                    className="absolute top-4 right-4 text-tera-secondary hover:text-tera-primary transition-colors"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4 md:mb-6">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full tera-accent-surface flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-7 h-7 md:w-8 md:h-8 tera-accent-text"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c.866-1.5 2.845-2.751 5.169-2.751s4.303 1.253 5.169 2.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl md:text-2xl font-bold text-tera-primary text-center mb-2 md:mb-3">{info.title}</h2>

                {/* Message */}
                <p className="text-tera-secondary text-center mb-2 text-sm md:text-base">{info.message}</p>

                {/* Unlock Time Info */}
                {timeRemaining && (
                    <div className="tera-accent-surface rounded-lg p-3 mb-4">
                        <p className="text-tera-secondary text-center text-xs md:text-sm">
                            <span className="font-semibold">Access Unlocks In:</span>
                            <span className="block mt-1 tera-accent-text font-medium text-sm">{timeRemaining}</span>
                        </p>
                    </div>
                )}

                {/* Limit Info */}
                <div className="tera-surface-subtle rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-tera-secondary text-xs md:text-sm">Your Free Plan:</span>
                        <span className="tera-accent-text font-semibold text-xs md:text-sm">
                            {limitType === 'chats' && 'Unlimited conversations'}
                            {limitType === 'file-uploads' && `${info.current} uploads/day`}
                            {limitType === 'web-search' && `${info.current} searches/month`}
                            {limitType === 'research-mode' && 'Not available'}
                        </span>
                    </div>
                </div>

                {/* Upgrade Info */}
                <div className="tera-accent-surface rounded-lg p-3 mb-4">
                    <p className="text-tera-primary text-xs md:text-sm">
                        <span className="font-semibold">Upgrade to {info.upgrade}</span>
                        <span className="text-tera-secondary ml-2">for higher limits and more features</span>
                    </p>
                </div>

                {/* Plan Comparison */}
                <div className="space-y-1.5 mb-4 text-xs md:text-sm">
                    {limitType === 'chats' && (
                        <>
                            <div className="flex justify-between text-tera-secondary">
                                <span>All Plans:</span>
                                <span className="font-medium tera-accent-text">Unlimited conversations</span>
                            </div>
                        </>
                    )}
                    {limitType === 'file-uploads' && (
                        <>
                            <div className="flex justify-between text-tera-secondary">
                                <span>Free:</span>
                                <span className="font-medium">3 uploads/day (10MB)</span>
                            </div>
                            <div className="flex justify-between text-tera-secondary">
                                <span>Pro:</span>
                                <span className="font-medium tera-accent-text">25 uploads/day (500MB)</span>
                            </div>
                            <div className="flex justify-between text-tera-secondary">
                                <span>Plus:</span>
                                <span className="font-medium tera-accent-text">Unlimited (2GB)</span>
                            </div>
                        </>
                    )}
                    {limitType === 'web-search' && (
                        <>
                            <div className="flex justify-between text-tera-secondary">
                                <span>Free:</span>
                                <span className="font-medium">5 searches/month</span>
                            </div>
                            <div className="flex justify-between text-tera-secondary">
                                <span>Pro:</span>
                                <span className="font-medium tera-accent-text">100 searches/month</span>
                            </div>
                            <div className="flex justify-between text-tera-secondary">
                                <span>Plus:</span>
                                <span className="font-medium tera-accent-text">Unlimited searches</span>
                            </div>
                        </>
                    )}
                    {limitType === 'research-mode' && (
                        <>
                            <div className="flex justify-between text-tera-secondary">
                                <span>Free:</span>
                                <span className="font-medium">Not available</span>
                            </div>
                            <div className="flex justify-between text-tera-secondary">
                                <span>Pro:</span>
                                <span className="font-medium tera-accent-text">✓ Deep Research Mode</span>
                            </div>
                            <div className="flex justify-between text-tera-secondary">
                                <span>Plus:</span>
                                <span className="font-medium tera-accent-text">✓ Deep Research Mode</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Buttons - Only Upgrade button (forced) */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleUpgrade}
                        className="tera-button-primary w-full px-4 py-2 md:py-2.5 rounded-lg font-semibold transition-colors text-sm md:text-base"
                    >
                        Upgrade to Pro/Plus
                    </button>
                </div>
            </div>
        </div>
    )
}
