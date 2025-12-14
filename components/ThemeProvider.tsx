"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark') // Default to dark
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // 1. Check localStorage
        const savedTheme = localStorage.getItem('tera-theme') as Theme
        if (savedTheme) {
            setThemeState(savedTheme)
        } else {
            // 2. Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                setThemeState('light')
            }
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('tera-theme', theme)
    }, [theme, mounted])

    const toggleTheme = () => {
        setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'))
    }

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }

    // Avoid hydration mismatch by rendering default theme initially
    // We must provide the Context even if not mounted, otherwise useTheme() hook will fail in children

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {/* 
              We can optionally hide content until mounted to prevent flash, 
              but for SEO/Prerender we usually want to show default content. 
              The 'theme' state defaults to 'dark', so it matches server render.
            */}
            {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
            {/* 
                Actually, relying on visibility:hidden is safer for layout 
                but good for SEO? No. 
                For prerendering 'settings', we want content.
                Let's just render {children}. 
                If flash occurs, we can optimize later with script in head.
             */}
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
