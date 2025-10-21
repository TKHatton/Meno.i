/**
 * Root layout for MenoAI
 * This wraps all pages in the application
 */

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
// import AnalyticsProvider from '@/components/analytics/AnalyticsProvider'

export const metadata: Metadata = {
  title: 'MenoAI - Your Compassionate Menopause Companion',
  description: 'Emotional intelligence support for women navigating perimenopause and menopause',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Analytics temporarily disabled - enable when PostHog is configured */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
