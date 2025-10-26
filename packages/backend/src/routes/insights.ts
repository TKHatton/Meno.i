/**
 * Insights routes for MenoAI Free Tier
 * Generates AI-powered insights from user symptom and journal data
 */

import { Router } from 'express';
import { generateInsights } from '../services/insights';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting
router.use(generalLimiter);

/**
 * GET /api/insights/:userId
 * Get AI-generated insights for user
 *
 * Response: { insights: Insight[] }
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`📊 Generating insights for user ${userId}`);

    const insights = await generateInsights(userId);

    res.status(200).json({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;
