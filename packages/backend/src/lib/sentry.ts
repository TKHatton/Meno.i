/**
 * Sentry error tracking setup for backend
 * Captures errors and performance traces in API routes
 */

import * as Sentry from '@sentry/node';

let sentryInitialized = false;

/**
 * Initialize Sentry for backend
 */
export function initSentry() {
  if (sentryInitialized) return;

  const dsn = process.env.SENTRY_DSN;

  if (!dsn || dsn === '__') {
    console.log('🔍 Sentry not configured (SENTRY_DSN missing)');
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

      // Only send errors in production
      enabled: process.env.NODE_ENV === 'production',

      // Filter out sensitive data
      beforeSend(event) {
        // Remove any potentially sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      },
    });

    console.log('🔍 Sentry error tracking initialized (backend)');
    sentryInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) return;

  Sentry.captureException(error, { extra: context });
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (!sentryInitialized) return;

  Sentry.captureMessage(message, level);
}

/**
 * Start a new span for performance monitoring
 * Note: Use Sentry.startSpan() in newer versions
 */
export function startTransaction(name: string, op: string) {
  if (!sentryInitialized) return null;

  // For newer Sentry versions, use startSpan instead
  // return Sentry.startSpan({ name, op }, () => { ... });
  console.log(`Performance tracking: ${op} - ${name}`);
  return null;
}

export { Sentry };
