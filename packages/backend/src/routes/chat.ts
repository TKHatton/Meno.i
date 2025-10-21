/**
 * Chat routes for MenoAI
 * Handles message sending and conversation management
 */

import { Router } from 'express';
import { generateMockResponse, generateAIResponse } from '../services/ai';
import { detectSafety } from '../services/safety';
import {
  createConversation,
  saveMessage,
  getConversationHistory,
  getUserConversations,
  deleteConversation,
  logSafetyEvent,
  isSupabaseConfigured
} from '../lib/supabase';
import type { AIResponse } from '@menoai/shared';

const router = Router();

/**
 * POST /api/chat/send
 * Send a message and receive AI response
 *
 * Body: { message: string, conversationId?: string }
 * Response: { response: AIResponse, conversationId: string }
 */
router.post('/send', async (req, res) => {
  try {
    const { message, conversationId, userId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`📩 Received message: "${message.substring(0, 50)}..."`);

    // Check for safety triggers first
    const safetyCheck = detectSafety(message);

    if (safetyCheck.isHighRisk) {
      console.log('⚠️  Safety trigger detected');
      console.log(`Safety trigger: ${safetyCheck.triggerPhrase}`);
    }

    // Determine conversation ID
    let activeConversationId = conversationId;

    // If Supabase is configured and we have a userId, manage conversation in database
    if (isSupabaseConfigured && userId) {
      // Create new conversation if needed
      if (!activeConversationId) {
        const newConversation = await createConversation(userId);
        if (newConversation) {
          activeConversationId = newConversation.id;
          console.log(`📝 Created new conversation: ${activeConversationId}`);
        }
      }

      // Save user message to database
      if (activeConversationId) {
        await saveMessage({
          conversation_id: activeConversationId,
          role: 'user',
          content: message,
          emotion_tag: undefined,
          intent_tag: undefined,
          need_tag: undefined,
          safety_level: safetyCheck.riskLevel
        });
      }
    } else {
      // Fall back to temporary ID if no database
      activeConversationId = conversationId || `conv_${Date.now()}`;
    }

    // Retrieve conversation history from database (if configured)
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    if (isSupabaseConfigured && activeConversationId) {
      const messages = await getConversationHistory(activeConversationId);
      conversationHistory = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
    }

    // Generate AI response using OpenAI (falls back to mock if not configured)
    const aiResponse: AIResponse = await generateAIResponse(
      message,
      conversationHistory,
      safetyCheck.isHighRisk
    );

    // Save AI response to database
    if (isSupabaseConfigured && activeConversationId) {
      const savedMessage = await saveMessage({
        conversation_id: activeConversationId,
        role: 'ai',
        content: aiResponse.full_response,
        emotion_tag: aiResponse.emotion_detected,
        intent_tag: undefined,
        need_tag: aiResponse.need_identified,
        safety_level: aiResponse.safety_triggered ? 'high' : 'low'
      });

      // Log safety event if triggered
      if (safetyCheck.isHighRisk && userId && savedMessage) {
        await logSafetyEvent(userId, savedMessage.id, safetyCheck.triggerPhrase || 'unknown');
      }
    }

    console.log(`✅ Generated response (safety: ${aiResponse.safety_triggered})`);

    res.json({
      response: aiResponse,
      conversationId: activeConversationId,
      safetyTriggered: aiResponse.safety_triggered
    });

  } catch (error) {
    console.error('Error in /chat/send:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * GET /api/chat/history/:conversationId
 * Retrieve conversation history
 */
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!isSupabaseConfigured) {
      // Return mock welcome message if Supabase not configured
      return res.json({
        conversationId,
        messages: [
          {
            id: 'msg_welcome',
            role: 'ai',
            content: 'Hi, I\'m MenoAI—your compassionate space to talk about everything menopause brings. What\'s on your mind right now?',
            created_at: new Date().toISOString()
          }
        ]
      });
    }

    // Retrieve from database
    const messages = await getConversationHistory(conversationId);

    res.json({
      conversationId,
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        created_at: msg.created_at
      }))
    });

  } catch (error) {
    console.error('Error in /chat/history:', error);
    res.status(500).json({ error: 'Failed to retrieve history' });
  }
});

/**
 * GET /api/chat/conversations/:userId
 * Get all conversations for a user
 */
router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isSupabaseConfigured) {
      return res.json({ conversations: [] });
    }

    const conversations = await getUserConversations(userId);

    res.json({ conversations });

  } catch (error) {
    console.error('Error in /chat/conversations:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

/**
 * DELETE /api/chat/conversation/:conversationId
 * Delete a conversation
 */
router.delete('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!isSupabaseConfigured) {
      return res.status(503).json({ error: 'Database not configured' });
    }

    const success = await deleteConversation(conversationId, userId);

    if (!success) {
      return res.status(403).json({ error: 'Unauthorized or not found' });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Error in /chat/conversation DELETE:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
