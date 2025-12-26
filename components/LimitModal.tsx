'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LimitModalProps {
  isOpen: boolean
  limitType: 'chats' | 'file-uploads' | 'web-search' | null
  currentPlan: string
  onClose: () => void
}

export default function LimitModal({ isOpen, limitType, currentPlan, onClose }: LimitModalProps) {
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)

  if (!isOpen || !limitType) return null

  const limitInfo: Record<string, { title: string; message: string; current: number; upgrade: string }> = {
    'chats': {
      title: 'Daily Chat Limit Reached',
      message: 'You\'ve reached your daily conversation limit.',
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

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white border border-tera-neon rounded-2xl p-8 max-w-md w-full mx-4 transition-all duration-300 transform ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-tera-neon/20 border border-tera-neon flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-tera-neon"
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
        <h2 className="text-2xl font-bold text-black text-center mb-3">{info.title}</h2>

        {/* Message */}
        <p className="text-black/70 text-center mb-2">{info.message}</p>

        {/* Limit Info */}
        <div className="bg-black/5 border border-black/10 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-black/60 text-sm">Your Free Plan:</span>
            <span className="text-tera-neon font-semibold">{info.current} per day</span>
          </div>
        </div>

        {/* Upgrade Info */}
        <div className="bg-tera-neon/10 border border-tera-neon/30 rounded-lg p-4 mb-6">
          <p className="text-black text-sm">
            <span className="font-semibold">Upgrade to {info.upgrade}</span>
            <span className="text-black/70 ml-2">for higher limits and more features</span>
          </p>
        </div>

        {/* Plan Comparison */}
        <div className="space-y-2 mb-6 text-sm">
          {limitType === 'chats' && (
            <>
              <div className="flex justify-between text-black/70">
                <span>Free:</span>
                <span className="font-medium">10 conversations/day</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Pro:</span>
                <span className="font-medium text-tera-neon">Unlimited</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Plus:</span>
                <span className="font-medium text-tera-neon">Unlimited</span>
              </div>
            </>
          )}
          {limitType === 'file-uploads' && (
            <>
              <div className="flex justify-between text-black/70">
                <span>Free:</span>
                <span className="font-medium">5 uploads/day (25MB)</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Pro:</span>
                <span className="font-medium text-tera-neon">20 uploads/day (500MB)</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Plus:</span>
                <span className="font-medium text-tera-neon">Unlimited (2GB)</span>
              </div>
            </>
          )}
          {limitType === 'web-search' && (
            <>
              <div className="flex justify-between text-black/70">
                <span>Free:</span>
                <span className="font-medium">5 searches/month</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Pro:</span>
                <span className="font-medium text-tera-neon">50 searches/month</span>
              </div>
              <div className="flex justify-between text-black/70">
                <span>Plus:</span>
                <span className="font-medium text-tera-neon">80 searches/month</span>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-black/20 text-black hover:bg-black/5 transition-colors font-medium"
          >
            Try Again Tomorrow
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-2.5 rounded-lg bg-tera-neon text-black font-semibold hover:bg-tera-neon/90 transition-colors"
          >
            Upgrade to Pro/Plus
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-black/40 hover:text-black transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
