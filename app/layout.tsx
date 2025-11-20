import '@/styles/globals.css'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata = {
  title: 'TERA',
  description: 'AI assistant reimagined for teachers, inspired by Grok'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-tera-bg text-white min-h-screen font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
