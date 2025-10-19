/**
 * History routes: minimal placeholders returning empty arrays.
 * Phase 2 focuses on the chat pipeline; real persistence arrives later.
 */
import { Router } from 'express';

export const router = Router();

router.get('/', async (_req, res) => {
  return res.json({ conversations: [] });
});

router.delete('/:id', async (_req, res) => {
  return res.json({ ok: true });
});

