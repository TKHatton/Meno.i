/**
 * API client for communicating with backend
 */

import type { AIResponse, ChatMode } from '@menoai/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface SendMessageResponse {
  response: AIResponse;
  conversationId: string;
  safetyTriggered: boolean;
}

/**
 * Send a message to the backend and receive AI response
 * Uses the Next.js API route proxy to avoid exposing backend URL to client
 */
export async function sendMessage(
  message: string,
  conversationId: string | null,
  userId?: string,
  chatMode?: ChatMode
): Promise<SendMessageResponse> {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversationId,
      userId,
      chatMode: chatMode || 'woman',
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

/**
 * Send a message and receive streaming AI response
 * Uses Server-Sent Events (SSE) for real-time token streaming
 */
export async function sendMessageStream(
  message: string,
  conversationId: string | null,
  userId?: string,
  chatMode?: ChatMode,
  onDelta?: (content: string) => void,
  onDone?: (meta: any) => void,
  onError?: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch('/api/chat/send-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId,
        userId,
        chatMode: chatMode || 'woman',
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // Remove 'data: ' prefix
          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'delta' && parsed.content) {
              onDelta?.(parsed.content);
            } else if (parsed.type === 'done' && parsed.meta) {
              onDone?.(parsed.meta);
            } else if (parsed.type === 'error' && parsed.message) {
              onError?.(parsed.message);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Stream error:', error);
    onError?.(error instanceof Error ? error.message : 'Stream failed');
  }
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string) {
  const response = await fetch(`${API_URL}/api/chat/conversations/${userId}`);

  if (!response.ok) {
    throw new Error(`Failed to get conversations: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string, userId: string) {
  const response = await fetch(`${API_URL}/api/chat/conversation/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.statusText}`);
  }

  return response.json();
}
