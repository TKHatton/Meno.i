/**
 * Health check endpoint
 * Used for monitoring and deployment health checks
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'menoai-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
