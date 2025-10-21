/**
 * Root layout for MenoAI
 * This wraps all pages in the application
 */

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
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
        {/* Skip to main content for keyboard navigation */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        {/* Analytics temporarily disabled - enable when PostHog is configured */}
        <AccessibilityProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
