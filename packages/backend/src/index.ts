/**
 * MenoAI Backend Server
 * Express API with TypeScript
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import chatRouter from './routes/chat';
import adminRouter from './routes/admin';
import symptomsRouter from './routes/symptoms';
import journalRouter from './routes/journal';
import profileRouter from './routes/profile';
import insightsRouter from './routes/insights';
import { initSentry } from './lib/sentry';
import { generalLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

// Initialize Sentry for error tracking
initSentry();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000', // Allow 127.0.0.1 (same as localhost)
  'https://studious-orbit-9vvxjj6wqwphpprj-3000.app.github.dev',
  'https://menoi.netlify.app',
  'https://www.menoi.netlify.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Apply general rate limiting to all routes
// Specific routes may have additional, stricter limits
app.use(generalLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);
// Free Tier routes
app.use('/api/symptoms', symptomsRouter);
app.use('/api/journal', journalRouter);
app.use('/api/profile', profileRouter);
app.use('/api/insights', insightsRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`✅ MenoAI Backend running on http://${HOST}:${PORT}`);
});