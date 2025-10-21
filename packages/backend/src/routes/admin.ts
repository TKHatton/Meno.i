/**
 * Admin routes for MenoAI
 * Handles admin-only operations like safety logs
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getSafetyLogs, isSupabaseConfigured } from '../lib/supabase';

const router = Router();

/**
 * Admin authorization middleware
 * Checks if user email is in ALLOWED_ADMIN_EMAILS
 */
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const allowedEmails = process.env.ALLOWED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

  // For development, allow if no admin emails configured
  if (allowedEmails.length === 0) {
    console.warn('⚠️  No ALLOWED_ADMIN_EMAILS configured. Allowing admin access for development.');
    next();
    return;
  }

  // In production, require proper authentication
  // For now, we'll check a simple email query param (replace with proper auth in production)
  const userEmail = req.query.email as string || req.headers['x-admin-email'] as string;

  if (!userEmail || !allowedEmails.includes(userEmail)) {
    res.status(403).json({
      error: 'Unauthorized',
      message: 'Admin access required'
    });
    return;
  }

  next();
}

/**
 * GET /api/admin/safety
 * Get recent safety logs with message previews
 *
 * Query params:
 *   - days: Number of days to look back (default: 7)
 *   - email: Admin email for authorization (temporary - use proper auth in production)
 */
router.get('/safety', requireAdmin, async (req, res) => {
  try {
    if (!isSupabaseConfigured) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Safety logs require Supabase configuration'
      });
    }

    const days = parseInt(req.query.days as string) || 7;

    if (days < 1 || days > 365) {
      return res.status(400).json({
        error: 'Invalid days parameter',
        message: 'Days must be between 1 and 365'
      });
    }

    console.log(`📊 Fetching safety logs for last ${days} days`);

    const logs = await getSafetyLogs(days);

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        userId: log.user_id,
        messageId: log.message_id,
        triggerPhrase: log.trigger_phrase,
        escalationAction: log.escalation_action,
        createdAt: log.created_at,
        messagePreview: log.messages?.content?.substring(0, 100) || 'N/A',
        conversationId: log.messages?.conversation_id || null
      })),
      count: logs.length,
      days
    });

  } catch (error) {
    console.error('Error in /admin/safety:', error);
    res.status(500).json({
      error: 'Failed to retrieve safety logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/stats
 * Get basic usage statistics (future enhancement)
 */
router.get('/stats', requireAdmin, async (req, res) => {
  // Placeholder for future statistics endpoint
  res.json({
    message: 'Statistics endpoint coming soon',
    totalUsers: 0,
    totalConversations: 0,
    totalMessages: 0,
    safetyEvents: 0
  });
});

export default router;
