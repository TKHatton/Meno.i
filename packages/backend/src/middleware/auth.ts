/**
 * Authentication middleware
 * Verifies JWT tokens from Supabase Auth
 */

import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

/**
 * Middleware to authenticate user via JWT token
 * Extracts token from Authorization header and verifies with Supabase
 *
 * Usage:
 *   router.post('/protected', authenticateUser, (req, res) => {
 *     const userId = req.user.id;
 *     ...
 *   });
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error('Auth error:', error);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication middleware
 * Checks for auth token but doesn't reject if missing (for guest mode)
 *
 * Usage:
 *   router.post('/chat', optionalAuth, (req, res) => {
 *     const userId = req.user?.id; // May be undefined for guests
 *     ...
 *   });
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue as guest
      next();
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    // Try to verify token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (!error && user) {
      // Valid token - attach user to request
      req.user = {
        id: user.id,
        email: user.email,
      };
    }

    // Continue regardless of token validity (guest mode allowed)
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue on error (guest mode)
    next();
  }
}
