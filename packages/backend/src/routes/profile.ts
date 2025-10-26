/**
 * Profile routes for MenoAI Free Tier
 * Handles user profile creation, reading, and updating (including onboarding)
 */

import { Router } from 'express';
import {
  getUserProfile,
  upsertUserProfile,
  isSupabaseConfigured,
} from '../lib/supabase';
import type { UpdateProfileDTO } from '@menoai/shared';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply general rate limiting to profile endpoints
router.use(generalLimiter);

/**
 * GET /api/profile/:userId
 * Get user profile by user ID
 *
 * Response: { profile: UserProfile | null }
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    console.log(`👤 Fetching profile for user ${userId}`);

    const profile = await getUserProfile(userId);

    // Profile not existing is not an error (user might not have completed onboarding)
    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/profile/:userId
 * Create or update user profile
 *
 * Body: UpdateProfileDTO (partial fields allowed)
 * Response: { profile: UserProfile }
 */
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body as UpdateProfileDTO;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Validate menopause_stage if provided
    const validStages = ['perimenopause', 'menopause', 'postmenopause', 'unsure', 'learning'];
    if (profileData.menopause_stage && !validStages.includes(profileData.menopause_stage)) {
      return res.status(400).json({
        error: `menopause_stage must be one of: ${validStages.join(', ')}`,
      });
    }

    // Validate primary_concerns if provided
    if (profileData.primary_concerns) {
      if (!Array.isArray(profileData.primary_concerns)) {
        return res.status(400).json({
          error: 'primary_concerns must be an array',
        });
      }

      // Limit to 2 concerns as per PRD
      if (profileData.primary_concerns.length > 2) {
        return res.status(400).json({
          error: 'primary_concerns must have maximum 2 items',
        });
      }

      const validConcerns = [
        'hot_flashes',
        'sleep_issues',
        'mood_swings',
        'anxiety',
        'brain_fog',
        'memory_issues',
        'energy',
        'fatigue',
        'relationship_challenges',
        'understanding_symptoms',
        'other',
      ];

      const invalidConcerns = profileData.primary_concerns.filter(
        (concern) => !validConcerns.includes(concern)
      );

      if (invalidConcerns.length > 0) {
        return res.status(400).json({
          error: `Invalid primary_concerns: ${invalidConcerns.join(', ')}`,
        });
      }
    }

    console.log(`💾 Upserting profile for user ${userId}`);

    const profile = await upsertUserProfile(userId, profileData);

    if (!profile) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error upserting user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/profile/:userId
 * Update user profile (alias for POST for RESTful consistency)
 *
 * Body: UpdateProfileDTO (partial fields allowed)
 * Response: { profile: UserProfile }
 */
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body as UpdateProfileDTO;

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    // Same validation as POST
    const validStages = ['perimenopause', 'menopause', 'postmenopause', 'unsure', 'learning'];
    if (profileData.menopause_stage && !validStages.includes(profileData.menopause_stage)) {
      return res.status(400).json({
        error: `menopause_stage must be one of: ${validStages.join(', ')}`,
      });
    }

    if (profileData.primary_concerns) {
      if (!Array.isArray(profileData.primary_concerns)) {
        return res.status(400).json({
          error: 'primary_concerns must be an array',
        });
      }

      if (profileData.primary_concerns.length > 2) {
        return res.status(400).json({
          error: 'primary_concerns must have maximum 2 items',
        });
      }
    }

    console.log(`✏️  Updating profile for user ${userId}`);

    const profile = await upsertUserProfile(userId, profileData);

    if (!profile) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.status(200).json({ profile });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
