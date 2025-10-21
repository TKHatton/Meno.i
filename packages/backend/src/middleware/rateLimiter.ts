/**
 * Rate limiting middleware for API protection
 * Prevents abuse and ensures fair usage of the service
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * Applied to most endpoints as a baseline protection
 *
 * Limits: 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks and admin (if needed)
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === '/api/health';
  }
});

/**
 * Strict rate limiter for chat endpoints
 * Chat endpoints are resource-intensive (OpenAI API calls)
 *
 * Limits: 30 messages per 10 minutes per IP
 */
export const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit each IP to 30 chat messages per 10 minutes
  message: {
    error: 'Chat rate limit exceeded',
    message: 'You are sending messages too quickly. Please wait a moment before sending another message.',
    retryAfter: '10 minutes',
    tip: 'This limit helps us provide quality service to all users.'
  },
  standardHeaders: true,
  legacyHeaders: false
  // Note: We use default IP-based rate limiting
  // Future enhancement: Track by authenticated user ID
});

/**
 * Lenient rate limiter for health checks
 * Allow frequent health checks for monitoring
 *
 * Limits: 120 requests per 5 minutes per IP
 */
export const healthCheckLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 120, // More lenient for monitoring systems
  message: {
    error: 'Health check rate limit exceeded',
    message: 'Too many health check requests.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Admin dashboard rate limiter
 * Protect admin endpoints from abuse
 *
 * Limits: 60 requests per 10 minutes per IP
 */
export const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60,
  message: {
    error: 'Admin rate limit exceeded',
    message: 'Too many admin requests. Please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Very strict rate limiter for authentication endpoints
 * Prevent brute force attacks
 *
 * Limits: 10 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Very strict for security
  message: {
    error: 'Authentication rate limit exceeded',
    message: 'Too many authentication attempts. Please wait before trying again.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Track attempts more strictly
  skipSuccessfulRequests: false, // Count all requests, not just failed ones
});

/**
 * Ultra-strict rate limiter for expensive operations
 * For operations that are very resource-intensive
 *
 * Limits: 5 requests per 30 minutes per IP
 */
export const expensiveLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // Very strict
  message: {
    error: 'Rate limit exceeded for expensive operation',
    message: 'This operation is resource-intensive. Please wait before trying again.',
    retryAfter: '30 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Custom error handler for rate limit exceeded
 * Provides consistent error format across all rate limiters
 */
export const rateLimitErrorHandler = (req: any, res: any, next: any) => {
  // This will be called if any rate limiter rejects the request
  // The error is already sent by express-rate-limit, so we just log it
  if (res.headersSent) {
    console.warn(`⚠️  Rate limit exceeded for ${req.ip} on ${req.path}`);
  }
  next();
};

/**
 * Rate limit configuration summary
 * For documentation and monitoring
 */
export const rateLimitConfig = {
  general: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    description: 'General API endpoints'
  },
  chat: {
    windowMs: 10 * 60 * 1000,
    max: 30,
    description: 'Chat endpoints (OpenAI API)'
  },
  health: {
    windowMs: 5 * 60 * 1000,
    max: 120,
    description: 'Health check endpoint'
  },
  admin: {
    windowMs: 10 * 60 * 1000,
    max: 60,
    description: 'Admin dashboard'
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 10,
    description: 'Authentication endpoints'
  },
  expensive: {
    windowMs: 30 * 60 * 1000,
    max: 5,
    description: 'Expensive operations'
  }
};
