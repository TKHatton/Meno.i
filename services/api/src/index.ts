/**
 * Express API entrypoint. Wires middleware, CORS, health, and chat routes.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { router as chatRouter } from './routes/chat';
import { router as historyRouter } from './routes/history';

const app = express();

// Basic JSON parsing
app.use(express.json());

// CORS configuration allowing local web app by default
const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'api' });
});

// Feature routes
app.use('/api/chat', chatRouter);
app.use('/api/history', historyRouter);

// Start server
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
});

