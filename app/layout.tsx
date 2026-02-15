import '@/styles/globals.css'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/AuthProvider'
import AppLayout from '@/components/AppLayout'
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from '@/components/ThemeProvider'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export const metadata = {
  title: 'Tera - Your AI Learning Companion for Anyone',
  description: 'Tera is your AI Learning Companion for anyone — students, teachers, professionals, and curious minds. Unlimited free conversations, homework help, skill building, and concept mastery.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/app/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/app/icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon is handled by metadata */}
      </head>
      <body className="bg-tera-bg text-tera-primary min-h-screen font-sans">
        <AuthProvider>
          <ThemeProvider>
            <AppLayout>
              {children}
              <Analytics />
            </AppLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
