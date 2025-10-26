/**
 * Journal routes for MenoAI Free Tier
 * Handles journal entry creation, reading, updating, and searching
 */

import { Router } from 'express';
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries,
  getJournalStats,
  isSupabaseConfigured,
} from '../lib/supabase';
import type { CreateJournalEntryDTO, UpdateJournalEntryDTO } from '@menoai/shared';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to journal endpoints
router.use(generalLimiter);

/**
 * POST /api/journal/entries
 * Create a new journal entry
 *
 * Body: CreateJournalEntryDTO
 * Response: { entry: JournalEntry }
 */
router.post('/entries', async (req, res) => {
  try {
    const { user_id, entry_date, content, mood_rating } = req.body;

    // Validation
    if (!user_id || !entry_date || !content) {
      return res.status(400).json({
        error: 'user_id, entry_date, and content are required',
      });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(entry_date)) {
      return res.status(400).json({
        error: 'entry_date must be in YYYY-MM-DD format',
      });
    }

    // Validate content length
    if (content.length < 1) {
      return res.status(400).json({
        error: 'content must not be empty',
      });
    }

    // Validate mood_rating if provided
    if (mood_rating !== undefined && (mood_rating < 1 || mood_rating > 4)) {
      return res.status(400).json({
        error: 'mood_rating must be between 1 and 4',
      });
    }

    const entryData: CreateJournalEntryDTO = {
      user_id,
      entry_date,
      content,
      mood_rating,
    };

    console.log(`📝 Creating journal entry for user ${user_id} on ${entry_date}`);

    const entry = await createJournalEntry(entryData);

    if (!entry) {
      return res.status(500).json({ error: 'Failed to create journal entry' });
    }

    res.status(201).json({ entry });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/journal/entries/:userId
 * Get journal entries for a user
 *
 * Query params: limit (default: 20), offset (default: 0)
 * Response: { entries: JournalEntry[] }
 */
router.get('/entries/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'limit must be between 1 and 100',
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        error: 'offset must be >= 0',
      });
    }

    console.log(`📖 Fetching journal entries for user ${userId} (limit: ${limit}, offset: ${offset})`);

    const entries = await getJournalEntries(userId, limit, offset);

    res.status(200).json({ entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/journal/entry/:entryId
 * Get a single journal entry by ID
 *
 * Query params: user_id (for verification)
 * Response: { entry: JournalEntry }
 */
router.get('/entry/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { user_id } = req.query;

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'user_id query parameter is required' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    console.log(`📄 Fetching journal entry ${entryId} for user ${user_id}`);

    const entry = await getJournalEntry(entryId, user_id);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.status(200).json({ entry });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/journal/entry/:entryId
 * Update a journal entry
 *
 * Body: UpdateJournalEntryDTO + user_id for verification
 * Response: { entry: JournalEntry }
 */
router.put('/entry/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { user_id, content, mood_rating } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Validate content if provided
    if (content !== undefined && content.length < 1) {
      return res.status(400).json({
        error: 'content must not be empty if provided',
      });
    }

    // Validate mood_rating if provided
    if (mood_rating !== undefined && (mood_rating < 1 || mood_rating > 4)) {
      return res.status(400).json({
        error: 'mood_rating must be between 1 and 4',
      });
    }

    const updateData: UpdateJournalEntryDTO = {};
    if (content !== undefined) updateData.content = content;
    if (mood_rating !== undefined) updateData.mood_rating = mood_rating;

    console.log(`✏️  Updating journal entry ${entryId} for user ${user_id}`);

    const entry = await updateJournalEntry(entryId, user_id, updateData);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found or unauthorized' });
    }

    res.status(200).json({ entry });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/journal/entry/:entryId
 * Delete a journal entry
 *
 * Body: { user_id: string }
 * Response: { success: boolean }
 */
router.delete('/entry/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    console.log(`🗑️  Deleting journal entry ${entryId} for user ${user_id}`);

    const success = await deleteJournalEntry(entryId, user_id);

    if (!success) {
      return res.status(404).json({ error: 'Journal entry not found or unauthorized' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/journal/search/:userId
 * Search journal entries by keyword
 *
 * Query params: q (search query), limit (default: 20)
 * Response: { entries: JournalEntry[] }
 */
router.get('/search/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'q query parameter is required' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: 'limit must be between 1 and 100',
      });
    }

    console.log(`🔍 Searching journal entries for user ${userId} with query "${q}"`);

    const entries = await searchJournalEntries(userId, q, limit);

    res.status(200).json({ entries });
  } catch (error) {
    console.error('Error searching journal entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/journal/stats/:userId
 * Get journal statistics for a user
 *
 * Response: { stats: JournalStats }
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    console.log(`📊 Fetching journal stats for user ${userId}`);

    const stats = await getJournalStats(userId);

    if (!stats) {
      return res.status(500).json({ error: 'Failed to calculate stats' });
    }

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error fetching journal stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
