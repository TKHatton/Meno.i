/**
 * API client for communicating with backend
 */

import type { AIResponse } from '@menoai/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SendMessageResponse {
  response: AIResponse;
  conversationId: string;
  safetyTriggered: boolean;
}

/**
 * Send a message to the backend and receive AI response
 */
export async function sendMessage(
  message: string,
  conversationId: string | null,
  userId?: string
): Promise<SendMessageResponse> {
  const response = await fetch(`${API_URL}/api/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationId,
      userId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Retrieve conversation history
 */
export async function getConversationHistory(conversationId: string) {
  const response = await fetch(`${API_URL}/api/chat/history/${conversationId}`);

  if (!response.ok) {
    throw new Error(`Failed to get history: ${response.statusText}`);
  }

  return response.json();
}
