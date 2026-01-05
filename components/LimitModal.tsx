'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface LimitModalProps {
    isOpen: boolean
    limitType: 'chats' | 'file-uploads' | 'web-search' | null
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
            title: 'Daily Chat Limit Reached',
            message: 'You\'ve reached your daily limit of prompts/messages you can send.',
            current: 10,
            upgrade: 'Pro or Plus',
        },
        'file-uploads': {
            title: 'File Upload Limit Reached',
            message: 'You\'ve reached your daily file upload limit.',
            current: 5,
            upgrade: 'Pro for 20 uploads, Plus for unlimited',
        },
        'web-search': {
            title: 'Monthly Web Search Limit Reached',
            message: 'You\'ve reached your monthly web search limit.',
            current: 5,
            upgrade: 'Pro for 50 searches, Plus for 80',
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
                className={`dark:bg-black dark:border-tera-neon bg-white border-tera-neon border rounded-2xl p-6 md:p-8 max-w-md w-full my-auto transition-all duration-300 transform max-h-[90vh] overflow-y-auto ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
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
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full dark:bg-tera-neon/20 dark:border-tera-neon dark:border bg-tera-neon/20 border border-tera-neon flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-7 h-7 md:w-8 md:h-8 text-tera-neon"
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
                <h2 className="text-xl md:text-2xl font-bold dark:text-white text-black text-center mb-2 md:mb-3">{info.title}</h2>

                {/* Message */}
                <p className="dark:text-white/80 text-black/70 text-center mb-2 text-sm md:text-base">{info.message}</p>

                {/* Unlock Time Info */}
                {timeRemaining && (
                    <div className="dark:bg-orange-500/20 dark:border-orange-500/50 bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <p className="dark:text-orange-200 text-orange-800 text-center text-xs md:text-sm">
                            <span className="font-semibold">Access Unlocks In:</span>
                            <span className="block mt-1 text-tera-neon font-medium text-sm">{timeRemaining}</span>
                        </p>
                    </div>
                )}

                {/* Limit Info */}
                <div className="dark:bg-white/10 dark:border-white/20 bg-black/5 border border-black/10 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                        <span className="dark:text-white/60 text-black/60 text-xs md:text-sm">Your Free Plan:</span>
                        <span className="text-tera-neon font-semibold text-xs md:text-sm">{info.current} per day</span>
                    </div>
                </div>

                {/* Upgrade Info */}
                <div className="dark:bg-tera-neon/10 dark:border-tera-neon/30 bg-tera-neon/10 border border-tera-neon/30 rounded-lg p-3 mb-4">
                    <p className="dark:text-white text-black text-xs md:text-sm">
                        <span className="font-semibold">Upgrade to {info.upgrade}</span>
                        <span className="dark:text-white/70 text-black/70 ml-2">for higher limits and more features</span>
                    </p>
                </div>

                {/* Plan Comparison */}
                <div className="space-y-1.5 mb-4 text-xs md:text-sm">
                    {limitType === 'chats' && (
                        <>
                            <div className="flex justify-between dark:text-white/80 text-black/70">
                                <span>Free:</span>
                                <span className="font-medium">10 prompts/day</span>
                            </div>
                            <div className="flex justify-between dark:text-white/80 text-black/70">
                                <span>Pro:</span>
                                <span className="font-medium text-tera-neon">Unlimited prompts/day</span>
                            </div>
                            <div className="flex justify-between dark:text-white/80 text-black/70">
                                <span>Plus:</span>
                                <span className="font-medium text-tera-neon">Unlimited prompts/day</span>
                            </div>
                        </>
                    )}
                    {limitType === 'file-uploads' && (
                        <>
                            <div className="flex justify-between dark:text-white/80 text-black/70">
                                <span>Free:</span>
                                <span className="font-medium">5 uploads/day (25MB)</span>
                            </div>
                            <div className="flex justify-between dark:text-white/80 text-black/70">
                                <span>Pro:</span>
                                <span className="font-medium text-tera-neon">20 uploads/day (500MB)</span>
                            </div>
                            <div className="flex justify-between dark:text-white/80 text-black/70">
                                <span>Plus:</span>
                                <span className="font-medium text-tera-neon">Unlimited (2GB)</span>
                            </div>
                        </>
                    )}
                    {limitType === 'web-search' && (
                        <>
                            <div className="flex justify-between dark:text-white/80 text-black/70">
                                <span>Free:</span>
                                <span className="font-medium">5 searches/month</span>
                            </div>
                            <div className="flex justify-between dark:text-white/80 text-black/70">
                                <span>Pro:</span>
                                <span className="font-medium text-tera-neon">50 searches/month</span>
                            </div>
                            <div className="flex justify-between dark:text-white/80 text-black/70">
                                <span>Plus:</span>
                                <span className="font-medium text-tera-neon">80 searches/month</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Buttons - Only Upgrade button (forced) */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleUpgrade}
                        className="w-full px-4 py-2 md:py-2.5 rounded-lg bg-tera-neon text-tera-bg dark:text-black font-semibold hover:bg-tera-neon/90 transition-colors text-sm md:text-base"
                    >
                        Upgrade to Pro/Plus
                    </button>
                </div>
            </div>
        </div>
    )
}
