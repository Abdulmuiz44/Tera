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

    // Avoid hydration mismatch by rendering nothing until mounted
    // Or render children to avoid layout shift, but with default theme
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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
