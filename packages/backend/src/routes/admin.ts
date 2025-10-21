/**
 * Admin routes for MenoAI
 * Handles admin-only operations like safety logs
 *
 * SECURITY: All routes protected by JWT-based admin authentication
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getSafetyLogs, isSupabaseConfigured } from '../lib/supabase';
import { adminLimiter } from '../middleware/rateLimiter';
import { requireAdmin, getCurrentUser } from '../middleware/adminAuth';

const router = Router();

// Apply admin-specific rate limiting
router.use(adminLimiter);

// Apply JWT-based admin authentication to ALL admin routes
router.use(requireAdmin);

/**
 * GET /api/admin/safety
 * Get recent safety logs with message previews
 *
 * Requires: JWT authentication with admin email in ALLOWED_ADMIN_EMAILS
 *
 * Query params:
 *   - days: Number of days to look back (default: 7, max: 365)
 */
router.get('/safety', async (req, res) => {
  try {
    // Get authenticated admin user info
    const adminUser = getCurrentUser(req);
    const days = parseInt(req.query.days as string) || 7;

    console.log(`📊 Admin ${adminUser?.email} accessing safety logs (${days} days)`);

    if (!isSupabaseConfigured) {
      return res.status(503).json({
        error: 'Database not configured',
        message: 'Safety logs require Supabase configuration'
      });
    }

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
 * Get basic usage statistics
 *
 * Requires: JWT authentication with admin email in ALLOWED_ADMIN_EMAILS
 */
router.get('/stats', async (req, res) => {
  const adminUser = getCurrentUser(req);
  console.log(`📊 Admin ${adminUser?.email} accessing statistics`);

  // Placeholder for future statistics endpoint
  res.json({
    message: 'Statistics endpoint coming soon',
    totalUsers: 0,
    totalConversations: 0,
    totalMessages: 0,
    safetyEvents: 0,
    accessedBy: adminUser?.email
  });
});

export default router;
