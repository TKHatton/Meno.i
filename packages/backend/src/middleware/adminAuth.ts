/**
 * Admin authentication middleware
 * Verifies JWT token and checks if user is authorized admin
 */

import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

/**
 * Extract JWT token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Admin authentication middleware
 * Verifies that the user is authenticated and is an authorized admin
 *
 * Usage:
 *   router.get('/admin/endpoint', requireAdmin, (req, res) => { ... });
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract JWT token from Authorization header
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided. Please sign in.',
        code: 'NO_TOKEN'
      });
      return;
    }

    // Verify JWT token with Supabase
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.warn(`⚠️  Invalid admin token attempt from ${req.ip}`);
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token. Please sign in again.',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    // Get allowed admin emails from environment
    const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

    // Development mode warning
    if (allowedEmails.length === 0) {
      console.warn('⚠️  WARNING: No ALLOWED_ADMIN_EMAILS configured. Admin access is DISABLED.');
      res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access is not configured. Please contact the system administrator.',
        code: 'ADMIN_NOT_CONFIGURED'
      });
      return;
    }

    // Check if user's email is in the allowed admin list
    if (!user.email || !allowedEmails.includes(user.email)) {
      console.warn(`⚠️  Unauthorized admin access attempt by ${user.email || 'unknown'} from ${req.ip}`);
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have admin access. This incident has been logged.',
        code: 'NOT_ADMIN'
      });
      return;
    }

    // User is authenticated and authorized
    // Attach user info to request for use in route handlers
    (req as any).user = {
      id: user.id,
      email: user.email,
      role: 'admin'
    };

    console.log(`✅ Admin access granted to ${user.email}`);
    next();

  } catch (error) {
    console.error('Error in admin authentication:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify admin authentication',
      code: 'AUTH_ERROR'
    });
  }
}

/**
 * Optional admin middleware (doesn't block if not admin)
 * Attaches user info to request if authenticated, but allows access either way
 *
 * Useful for endpoints that show different data for admins vs regular users
 */
export async function optionalAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      // No token, continue without user info
      next();
      return;
    }

    // Verify token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      // Invalid token, continue without user info
      next();
      return;
    }

    // Check if user is admin
    const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const isAdmin = user.email && allowedEmails.includes(user.email);

    // Attach user info to request
    (req as any).user = {
      id: user.id,
      email: user.email,
      role: isAdmin ? 'admin' : 'user'
    };

    next();

  } catch (error) {
    console.error('Error in optional admin check:', error);
    // Don't block request on error, just continue without user info
    next();
  }
}

/**
 * Helper to check if current user is admin (for use in route handlers)
 */
export function isAdmin(req: Request): boolean {
  const user = (req as any).user;
  return user && user.role === 'admin';
}

/**
 * Helper to get current user info (for use in route handlers)
 */
export function getCurrentUser(req: Request): { id: string; email: string; role: string } | null {
  return (req as any).user || null;
}
