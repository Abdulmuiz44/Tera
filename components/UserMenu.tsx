'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
// Replaced Supabase User with compatible NextAuth interface
type User = {
    id: string
    email?: string | null
    user_metadata?: {
        full_name?: string
        plan?: string
        subscription_plan?: string
        [key: string]: any
    } | null
    name?: string | null
    image?: string | null
}

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
            <div className={`flex items-center gap-2 w-full ${!expanded ? 'flex-col justify-center' : ''}`}>
                <Link
                    href="/auth/signin"
                    className={`flex-1 text-center px-3 py-2 rounded-lg bg-tera-neon/10 text-tera-neon font-medium text-sm transition-colors hover:bg-tera-neon/20 border border-tera-neon/30 ${!expanded ? 'flex-none' : ''}`}
                >
                    {expanded ? 'Login' : 'In'}
                </Link>
                <Link
                    href="/auth/signup"
                    className={`flex-1 text-center px-3 py-2 rounded-lg bg-tera-neon/10 text-tera-neon font-medium text-sm transition-colors hover:bg-tera-neon/20 border border-tera-neon/30 ${!expanded ? 'flex-none' : ''}`}
                >
                    {expanded ? 'Sign Up' : 'Up'}
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
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            href: '/pricing'
        },
        {
            label: 'Settings',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6m-17.78 7.78l4.24-4.24m2.12-2.12l4.24-4.24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
            ),
            href: '/settings'
        },
        {
            label: 'About',
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
            ),
            href: '/about',
            hasChevron: false
        },
    ]

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Menu */}
            {dropdownOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-[280px] rounded-2xl border border-tera-border bg-tera-panel shadow-2xl backdrop-blur-xl overflow-hidden">
                    {/* User Info Section */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-tera-border">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-tera-neon/40 to-blue-500/40 text-tera-primary font-semibold">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-tera-primary truncate">{name}</div>
                            <div className="text-xs text-tera-secondary truncate">@{email.split('@')[0]}</div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center justify-between px-4 py-3 text-tera-primary hover:bg-tera-muted transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-4 h-4 text-tera-secondary">
                                        {item.icon}
                                    </div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                {item.hasChevron && <span className="text-tera-secondary/40">›</span>}
                            </Link>
                        ))}

                        {/* Separator */}
                        <div className="h-px bg-tera-border my-2" />

                        {/* Logout */}
                        <button
                            onClick={() => {
                                onSignOut()
                                setDropdownOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-3 text-tera-primary hover:bg-red-500/10 hover:text-red-400 transition-colors w-full text-left"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="text-sm font-medium">Log out</span>
                        </button>
                    </div>
                </div>
            )}

            {/* User Profile Button */}
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-3 w-full rounded-xl border border-tera-border bg-tera-panel px-3 py-3 hover:bg-tera-muted transition-all text-tera-primary ${expanded ? '' : 'justify-center'
                    }`}
            >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-tera-neon/40 to-blue-500/40 text-tera-primary font-semibold text-sm">
                    {initials}
                </div>

                {/* User Info - Only visible when expanded */}
                {expanded && (
                    <>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-medium text-tera-primary truncate max-w-[120px]">{name}</div>
                            <div className="text-xs text-tera-secondary">
                                {user.user_metadata?.plan || user.user_metadata?.subscription_plan || 'Free'}
                            </div>
                        </div>

                        {/* Upgrade Button */}
                        <Link
                            href="/pricing"
                            className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-medium text-tera-primary transition-colors"
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
