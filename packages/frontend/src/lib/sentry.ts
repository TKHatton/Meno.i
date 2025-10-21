/**
 * Sentry error tracking setup for frontend
 * Captures errors and performance traces
 */

let sentryInitialized = false;

/**
 * Initialize Sentry (client-side only)
 */
export function initSentry() {
  if (typeof window === 'undefined') return; // Server-side
  if (sentryInitialized) return; // Already initialized

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn || dsn === '__') {
    console.log('🔍 Sentry not configured (NEXT_PUBLIC_SENTRY_DSN missing)');
    return;
  }

  try {
    // Dynamically import Sentry to avoid SSR issues
    import('@sentry/react').then((Sentry) => {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

        // Only send errors in production
        enabled: process.env.NODE_ENV === 'production',

        // Filter out sensitive data
        beforeSend(event) {
          // Remove any potentially sensitive data from the event
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers;
          }
          return event;
        },

        integrations: [
          Sentry.browserTracingIntegration(),
        ],
      });

      console.log('🔍 Sentry error tracking initialized');
      sentryInitialized = true;
    });
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  if (!sentryInitialized) return;

  import('@sentry/react').then((Sentry) => {
    Sentry.captureException(error, { extra: context });
  });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (typeof window === 'undefined') return;
  if (!sentryInitialized) return;

  import('@sentry/react').then((Sentry) => {
    Sentry.captureMessage(message, level);
  });
}
