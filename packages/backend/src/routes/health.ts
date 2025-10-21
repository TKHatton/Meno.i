/**
 * Health check endpoint
 * Used for monitoring and deployment health checks
 */

import { Router } from 'express';
import { healthCheckLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply health check specific rate limiter
router.use(healthCheckLimiter);

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'menoai-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
