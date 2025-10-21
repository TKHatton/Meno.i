/**
 * Conversation type definitions for MenoAI
 */

export interface Conversation {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  retention_expires_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Array<{
    id: string;
    role: 'user' | 'ai';
    content: string;
    created_at: string;
  }>;
}

export interface CreateConversationDTO {
  user_id: string;
}
