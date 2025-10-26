/**
 * Symptom tracking routes for MenoAI Free Tier
 * Handles daily symptom logging and history
 */

import { Router } from 'express';
import {
  upsertSymptomLog,
  getSymptomLogs,
  getSymptomLogByDate,
  deleteSymptomLog,
  getSymptomStats,
  isSupabaseConfigured,
} from '../lib/supabase';
import type { CreateSymptomLogDTO } from '@menoai/shared';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to symptom endpoints
router.use(generalLimiter);

/**
 * POST /api/symptoms/log
 * Create or update symptom log for a specific date
 *
 * Body: CreateSymptomLogDTO
 * Response: { symptomLog: SymptomLog }
 */
router.post('/log', async (req, res) => {
  try {
    const { user_id, log_date, symptoms, energy_level, notes } = req.body;

    // Validation
    if (!user_id || !log_date || !symptoms) {
      return res.status(400).json({
        error: 'user_id, log_date, and symptoms are required',
      });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(log_date)) {
      return res.status(400).json({
        error: 'log_date must be in YYYY-MM-DD format',
      });
    }

    // Validate energy_level if provided
    if (energy_level !== undefined && (energy_level < 1 || energy_level > 5)) {
      return res.status(400).json({
        error: 'energy_level must be between 1 and 5',
      });
    }

    const logData: CreateSymptomLogDTO = {
      user_id,
      log_date,
      symptoms,
      energy_level,
      notes,
    };

    console.log(`📊 Logging symptoms for user ${user_id} on ${log_date}`);

    const symptomLog = await upsertSymptomLog(logData);

    if (!symptomLog) {
      return res.status(500).json({ error: 'Failed to save symptom log' });
    }

    res.status(200).json({ symptomLog });
  } catch (error) {
    console.error('Error saving symptom log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/symptoms/history/:userId
 * Get symptom logs for a user
 *
 * Query params: days (default: 7)
 * Response: { logs: SymptomLog[] }
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 7;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    if (days < 1 || days > 365) {
      return res.status(400).json({
        error: 'days must be between 1 and 365',
      });
    }

    console.log(`📈 Fetching ${days} days of symptom history for user ${userId}`);

    const logs = await getSymptomLogs(userId, days);

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching symptom history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/symptoms/date/:userId/:date
 * Get symptom log for a specific date
 *
 * Response: { log: SymptomLog | null }
 */
router.get('/date/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'date must be in YYYY-MM-DD format',
      });
    }

    console.log(`📅 Fetching symptom log for user ${userId} on ${date}`);

    const log = await getSymptomLogByDate(userId, date);

    res.status(200).json({ log });
  } catch (error) {
    console.error('Error fetching symptom log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/symptoms/stats/:userId
 * Get symptom tracking statistics
 *
 * Query params: period ('week' or 'month', default: 'month')
 * Response: { stats: SymptomStats }
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const period = (req.query.period as 'week' | 'month') || 'month';

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    if (period !== 'week' && period !== 'month') {
      return res.status(400).json({
        error: 'period must be either "week" or "month"',
      });
    }

    console.log(`📊 Fetching ${period} stats for user ${userId}`);

    const stats = await getSymptomStats(userId, period);

    if (!stats) {
      return res.status(500).json({ error: 'Failed to calculate stats' });
    }

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching symptom stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/symptoms/:logId
 * Delete a symptom log
 *
 * Body: { user_id: string }
 * Response: { success: boolean }
 */
router.delete('/:logId', async (req, res) => {
  try {
    const { logId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    console.log(`🗑️  Deleting symptom log ${logId} for user ${user_id}`);

    const success = await deleteSymptomLog(logId, user_id);

    if (!success) {
      return res.status(404).json({ error: 'Symptom log not found or unauthorized' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting symptom log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
