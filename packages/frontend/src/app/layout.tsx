/**
 * Root layout for MenoAI
 * This wraps all pages in the application
 */

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import DesktopHeader from '@/components/navigation/DesktopHeader'
import BottomNav from '@/components/navigation/BottomNav'
// import AnalyticsProvider from '@/components/analytics/AnalyticsProvider'

export const metadata: Metadata = {
  title: 'Meno.i - Your Compassionate Menopause Companion',
  description: 'Emotional intelligence support for women navigating perimenopause and menopause',
  keywords: 'menopause, perimenopause, emotional support, AI companion',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logo-square.jpg',
    apple: '/images/logo-square.jpg',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Meno.i',
  },
  openGraph: {
    title: 'Meno.i - Your Compassionate Menopause Companion',
    description: 'Emotional intelligence support for women navigating perimenopause and menopause',
    url: 'https://menoi.netlify.app',
    siteName: 'Meno.i',
    images: ['/images/logo-square.jpg'],
  },
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
            <DesktopHeader />
            <main id="main-content">
              {children}
            </main>
            <BottomNav />
          </AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
