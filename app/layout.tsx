import '@/styles/globals.css'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/AuthProvider'
import AppLayout from '@/components/AppLayout'
import { Analytics } from "@vercel/analytics/react"

export const metadata = {
  title: 'Tera - AI Learning & Teaching Companion',
  description: 'Your brilliant AI companion for learning anything and teaching everything. Chat naturally with Tera like texting a friend - get homework help, create lesson plans, explore new skills, and more.',
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: '#00FFA3',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon is handled by metadata */}
      </head>
      <body className="bg-tera-bg text-white min-h-screen font-sans">
        <AuthProvider>
          <AppLayout>
            {children}
            <Analytics />
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
