import '@/styles/globals.css'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/AuthProvider'
import AppLayout from '@/components/AppLayout'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '@/components/ThemeProvider'

const shouldRenderAnalytics =
  process.env.VERCEL === '1' ||
  process.env.VERCEL === 'true' ||
  Boolean(process.env.VERCEL_URL)

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#06080d',
}

export const metadata = {
  title: 'Tera - Your AI Learning Companion for Anything',
  description: 'Tera is your AI Learning Companion for anything - from school and work to skills, projects, and curiosity. Unlimited free conversations, homework help, skill building, and concept mastery.',
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
      <body className="min-h-screen bg-tera-bg font-sans text-tera-primary antialiased">
        <AuthProvider>
          <ThemeProvider>
            <AppLayout>
              {children}
              {shouldRenderAnalytics ? <Analytics /> : null}
            </AppLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
