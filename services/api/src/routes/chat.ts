/**
 * Chat route: validates input and returns a mock structured response.
 * In Phase 3, this will call OpenAI and store results in Supabase.
 */
import { Router } from 'express';
import { z } from 'zod';
import { ChatResponse, EmotionAnalysis, NVCPayload, SafetyAssessment } from '@meno/shared/src/types';
import { randomUUID } from 'crypto';

export const router = Router();

const ChatSchema = z.object({
  message: z.string().min(1),
  anonId: z.string().optional(),
  conversationId: z.string().optional()
});

router.post('/', async (req, res) => {
  const parse = ChatSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parse.error.flatten() });
  }

  const start = Date.now();
  const { message } = parse.data;

  // Very naive mock safety: keyword check for demonstration only
  const lowered = message.toLowerCase();
  const safety: SafetyAssessment = lowered.includes('end my life') || lowered.includes('kill myself')
    ? { level: 'high', type: 'self-harm', notes: 'Keyword matched' }
    : { level: 'none' };

  // Mock NVC payload; emulates the 4-step structure
  const nvc: NVCPayload = safety.level === 'high'
    ? {
        validate: "I'm really glad you told me. That sounds incredibly heavy.",
        reflect: "It seems you might be feeling overwhelmed and alone right now.",
        reframe: "You deserve immediate care and someone to be with you in this moment.",
        empower: "If you're in the UK, you can call Samaritans at 116 123, or in Portugal SNS 24 at 808 24 24 24. If you're in immediate danger, please call your local emergency number."
      }
    : {
        validate: "That sounds like a lot to carry—thank you for trusting me with it.",
        reflect: "Perhaps you're feeling a mix of frustration and guilt because connection really matters to you.",
        reframe: "What if this is your body asking for a gentler pace while you find your footing?",
        empower: "Would it help to try one small step—like a 5‑minute breather or sharing one sentence with someone you trust?"
      };

  const emotion: EmotionAnalysis = safety.level === 'high'
    ? { primary: 'overwhelmed', secondary: 'sad', needs: ['support', 'safety'] }
    : { primary: 'frustrated', secondary: 'guilty', needs: ['connection', 'rest'] };

  const payload: ChatResponse = {
    conversationId: parse.data.conversationId || randomUUID(),
    messageId: randomUUID(),
    nvc,
    emotion,
    safety,
    model: 'mock-menoai-structured-v1',
    latencyMs: Date.now() - start
  };

  return res.json(payload);
});

