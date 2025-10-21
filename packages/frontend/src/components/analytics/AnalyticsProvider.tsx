/**
 * Analytics Provider
 * Initializes PostHog and Sentry on the client-side
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initAnalytics, analytics } from '@/lib/analytics';
import { initSentry } from '@/lib/sentry';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
    initSentry();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      analytics.pageView(pathname);
    }
  }, [pathname]);

  return <>{children}</>;
}
