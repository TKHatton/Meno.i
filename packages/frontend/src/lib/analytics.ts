/**
 * Analytics utilities for PostHog
 * Privacy-first: Only tracks events, never content
 */

// PostHog client (lazy loaded)
let posthog: any = null;
let posthogInitialized = false;
let posthogLoading = false;

/**
 * Check if PostHog should be loaded
 */
function shouldLoadPostHog(): boolean {
  if (typeof window === 'undefined') return false;
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  return !!(apiKey && apiKey !== '__' && apiKey !== 'phc_your_posthog_key_here' && !apiKey.includes('your'));
}

/**
 * Initialize PostHog (client-side only)
 * Only loads if NEXT_PUBLIC_POSTHOG_KEY is properly configured
 */
export function initAnalytics() {
  if (!shouldLoadPostHog()) {
    console.log('📊 PostHog not configured - analytics disabled');
    return;
  }

  if (posthogInitialized || posthogLoading) return;

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY!;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  posthogLoading = true;

  try {
    // Dynamically import PostHog only when configured
    import('posthog-js').then((module) => {
      posthog = module.default;
      posthog.init(apiKey, {
        api_host: apiHost,
        loaded: (ph: any) => {
          console.log('📊 PostHog analytics initialized');
        },
        // Privacy settings
        person_profiles: 'identified_only',
        autocapture: false,
        capture_pageview: false,
        disable_session_recording: true,
      });
      posthogInitialized = true;
      posthogLoading = false;
    }).catch((error) => {
      console.error('Failed to load PostHog:', error);
      posthogLoading = false;
    });
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
    posthogLoading = false;
  }
}

/**
 * Track a custom event
 * @param eventName - Name of the event
 * @param properties - Optional event properties (never include content!)
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!shouldLoadPostHog() || !posthog || !posthogInitialized) return;

  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView() {
  if (!shouldLoadPostHog() || !posthog || !posthogInitialized) return;

  try {
    posthog.capture('$pageview');
  } catch (error) {
    console.error('Failed to track pageview:', error);
  }
}

/**
 * Identify user (call after sign-in)
 * @param userId - User's unique ID
 * @param properties - Optional user properties
 */
export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (!shouldLoadPostHog() || !posthog || !posthogInitialized) return;

  try {
    posthog.identify(userId, properties);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
}

/**
 * Reset user identity (call after sign-out)
 */
export function resetUser() {
  if (!shouldLoadPostHog() || !posthog || !posthogInitialized) return;

  try {
    posthog.reset();
  } catch (error) {
    console.error('Failed to reset user:', error);
  }
}

// Privacy-focused tracking helpers
export const analytics = {
  // Track message sent (no content!)
  messageSent: (streamingEnabled: boolean) => {
    trackEvent('message_sent', { streaming_enabled: streamingEnabled });
  },

  // Track safety trigger (no content!)
  safetyTriggered: () => {
    trackEvent('safety_triggered');
  },

  // Track sign-in
  signIn: (provider: string) => {
    trackEvent('sign_in', { provider });
  },

  // Track sign-out
  signOut: () => {
    trackEvent('sign_out');
    resetUser();
  },

  // Track page visit
  pageView: (page: string) => {
    trackPageView();
    trackEvent('page_visit', { page });
  },

  // Track conversation actions
  conversationDeleted: () => {
    trackEvent('conversation_deleted');
  },

  conversationViewed: () => {
    trackEvent('conversation_viewed');
  },
};
