'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Minimum loading time to show the logo
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-6">
        {/* Logo with fade-in animation */}
        <div className="animate-fade-in relative w-[200px] h-[67px]">
          <Image
            src="/images/TERA_LOGO_ONLY1.png"
            alt="Tera Logo"
            fill
            className="object-contain block dark:hidden"
            priority
          />
          <Image
            src="/images/TERA_LOGO_ONLY.png"
            alt="Tera Logo"
            fill
            className="object-contain hidden dark:block"
            priority
          />
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-tera-neon animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-tera-neon animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-tera-neon animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
