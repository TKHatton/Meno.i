/**
 * Supabase client for backend (admin access)
 * Uses service role key for privileged operations
 */

import { createClient } from '@supabase/supabase-js';
import type { CreateMessageDTO, CreateConversationDTO, Message, Conversation } from '@menoai/shared';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not configured. Database operations will fail.');
  console.warn('   Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

// Check if Supabase is properly configured
const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseServiceKey &&
  supabaseUrl !== 'https://bxtsqrkcqgsdydiriqks.supabase.co' &&
  supabaseServiceKey !== 'placeholder-key';

/**
 * Supabase admin client
 * Use this for backend operations that need to bypass RLS
 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://bxtsqrkcqgsdydiriqks.supabase.co',
  supabaseServiceKey || 'placeholder-key'
);

/**
 * Create a new conversation
 * @param userId - User's ID
 * @returns Created conversation object
 */
export async function createConversation(userId: string): Promise<Conversation | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot create conversation.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }

    return data as Conversation;
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return null;
  }
}

/**
 * Save a message to the database
 * @param messageData - Message data to save
 * @returns Saved message object
 */
export async function saveMessage(messageData: CreateMessageDTO): Promise<Message | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot save message.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }

    return data as Message;
  } catch (error) {
    console.error('Failed to save message:', error);
    return null;
  }
}

/**
 * Retrieve conversation history
 * @param conversationId - Conversation ID
 * @returns Array of messages in conversation
 */
export async function getConversationHistory(conversationId: string): Promise<Message[]> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve history.');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error retrieving conversation history:', error);
      throw error;
    }

    return (data as Message[]) || [];
  } catch (error) {
    console.error('Failed to retrieve conversation history:', error);
    return [];
  }
}

/**
 * Get all conversations for a user
 * @param userId - User's ID
 * @returns Array of conversations
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve conversations.');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error retrieving user conversations:', error);
      throw error;
    }

    return (data as Conversation[]) || [];
  } catch (error) {
    console.error('Failed to retrieve user conversations:', error);
    return [];
  }
}

/**
 * Delete a conversation and all its messages
 * @param conversationId - Conversation ID
 * @param userId - User ID (for verification)
 * @returns Success boolean
 */
export async function deleteConversation(conversationId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot delete conversation.');
    return false;
  }

  try {
    // Verify the conversation belongs to the user
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (!conversation || conversation.user_id !== userId) {
      console.error('Unauthorized: Conversation does not belong to user');
      return false;
    }

    // Delete the conversation (cascade will delete messages)
    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return false;
  }
}

/**
 * Log a safety escalation event
 * @param userId - User ID
 * @param messageId - Message ID that triggered safety
 * @param triggerPhrase - The phrase that triggered the safety check
 */
export async function logSafetyEvent(
  userId: string,
  messageId: string,
  triggerPhrase: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot log safety event.');
    return;
  }

  try {
    await supabaseAdmin
      .from('safety_logs')
      .insert({
        user_id: userId,
        message_id: messageId,
        trigger_phrase: triggerPhrase,
        escalation_action: 'resources_shown'
      });
  } catch (error) {
    console.error('Failed to log safety event:', error);
  }
}

/**
 * Check if Supabase is configured
 */
export { isSupabaseConfigured };
