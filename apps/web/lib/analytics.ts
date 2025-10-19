/**
 * Minimal PostHog client bootstrap. Safe to import without keys set.
 */
import posthog from 'posthog-js';

export function initAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  if (!key) return;
  if (typeof window !== 'undefined') {
    posthog.init(key, { api_host: host, autocapture: false });
  }
}

