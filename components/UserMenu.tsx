'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'

interface UserMenuProps {
    user: User | null
    expanded: boolean
    onSignOut: () => void
}

export default function UserMenu({ user, expanded, onSignOut }: UserMenuProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }

        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownOpen])

    if (!user) {
        return (
            <div className={`flex items-center gap-2 ${!expanded ? 'flex-col' : ''}`}>
                <Link
                    href="/auth/signin"
                    className={`w-full text-center px-4 py-2 rounded-lg bg-white text-black dark:bg-black dark:text-white font-semibold text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-800 ${!expanded ? 'w-auto' : ''}`}
                >
                    {expanded ? 'Login' : '🚪'}
                </Link>
                <Link
                    href="/auth/signup"
                    className={`w-full text-center px-4 py-2 rounded-lg bg-white text-black dark:bg-black dark:text-white font-semibold text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-800 ${!expanded ? 'w-auto' : ''}`}
                >
                    {expanded ? 'Sign Up' : '👤'}
                </Link>
            </div>
        )
    }

    // Get user's first and last name initials from email
     const email = user.email || ''
     const name = user.user_metadata?.full_name || (email ? email.split('@')[0] : '') || 'User'
     const initials = (name || 'User')
         .split(' ')
         .map((n: string) => n[0])
         .join('')
         .toUpperCase()
         .slice(0, 2)

    const menuItems = [
        {
            label: 'Upgrade plan',
            icon: <div className="w-4 h-4 relative flex items-center justify-center"><Image src="/images/TERA_LOGO_ONLY.png" alt="Tera" width={16} height={16} className="object-contain" /></div>,
            href: '/pricing'
        },
        { label: 'Personalization', icon: '🎨', href: '/settings' },
        { label: 'Settings', icon: '⚙️', href: '/settings' },
        { label: 'Help', icon: '❓', href: '/help', hasChevron: true },
    ]

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Menu */}
            {dropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl backdrop-blur-xl overflow-hidden">
                    {/* User Info Section */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-tera-neon/40 to-blue-500/40 text-white font-semibold">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{name}</div>
                            <div className="text-xs text-white/60 truncate">@{email.split('@')[0]}</div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center justify-between px-4 py-3 text-white hover:bg-white/5 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-base">{item.icon}</span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                {item.hasChevron && <span className="text-white/40">›</span>}
                            </Link>
                        ))}

                        {/* Separator */}
                        <div className="h-px bg-white/5 my-2" />

                        {/* Logout */}
                        <button
                            onClick={() => {
                                onSignOut()
                                setDropdownOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/5 transition-colors w-full text-left"
                        >
                            <span className="text-base">🚪</span>
                            <span className="text-sm font-medium">Log out</span>
                        </button>
                    </div>
                </div>
            )}

            {/* User Profile Button */}
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-3 w-full rounded-xl border border-white/10 bg-tera-panel px-3 py-3 hover:bg-tera-muted transition-all ${expanded ? '' : 'justify-center'
                    }`}
            >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tera-neon/40 to-blue-500/40 text-white font-semibold text-sm">
                    {initials}
                </div>

                {/* User Info - Only visible when expanded */}
                {expanded && (
                    <>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-medium text-white truncate max-w-[120px]">{name}</div>
                            <div className="text-xs text-white/60">
                                {user.user_metadata?.plan || user.user_metadata?.subscription_plan || 'Free'}
                            </div>
                        </div>

                        {/* Upgrade Button */}
                        <Link
                            href="/pricing"
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Upgrade
                        </Link>
                    </>
                )}
            </button>
        </div>
    )
}
