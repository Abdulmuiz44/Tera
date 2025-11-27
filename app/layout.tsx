import '@/styles/globals.css'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/AuthProvider'
import AppLayout from '@/components/AppLayout'

export const metadata = {
  title: 'Tera - AI Assistant for Teachers',
  description: 'AI assistant reimagined for teachers. Create lesson plans, generate quizzes, and get teaching support.',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
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
          </AppLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
