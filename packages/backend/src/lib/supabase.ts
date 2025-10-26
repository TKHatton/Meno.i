/**
 * Supabase client for backend (admin access)
 * Uses service role key for privileged operations
 */

import { createClient } from '@supabase/supabase-js';
import type {
  CreateMessageDTO,
  CreateConversationDTO,
  Message,
  Conversation,
  UserProfile,
  UpdateProfileDTO,
  SymptomLog,
  CreateSymptomLogDTO,
  UpdateSymptomLogDTO,
  SymptomStats,
  JournalEntry,
  CreateJournalEntryDTO,
  UpdateJournalEntryDTO,
  JournalStats,
  ContactSubmission,
  CreateContactSubmissionDTO,
} from '@menoai/shared';

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
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseServiceKey !== 'placeholder-key' &&
  !supabaseServiceKey.startsWith('eyJhbGci...');

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
 * Get recent safety logs with message previews
 * @param days - Number of days to look back (default: 7)
 * @returns Array of safety logs with message data
 */
export async function getSafetyLogs(days: number = 7): Promise<any[]> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve safety logs.');
    return [];
  }

  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from('safety_logs')
      .select(`
        id,
        user_id,
        message_id,
        trigger_phrase,
        escalation_action,
        created_at,
        messages (
          id,
          content,
          conversation_id,
          created_at
        )
      `)
      .gte('created_at', sinceDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error retrieving safety logs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to retrieve safety logs:', error);
    return [];
  }
}

// =====================================================
// FREE TIER: USER PROFILE FUNCTIONS
// =====================================================

/**
 * Get user profile by user ID
 * @param userId - User's ID
 * @returns User profile object or null
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot get user profile.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If profile doesn't exist yet, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error getting user profile:', error);
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

/**
 * Create or update user profile
 * @param userId - User's ID
 * @param profileData - Profile data to update
 * @returns Updated profile object
 */
export async function upsertUserProfile(
  userId: string,
  profileData: UpdateProfileDTO
): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot update profile.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Failed to upsert user profile:', error);
    return null;
  }
}

// =====================================================
// FREE TIER: SYMPTOM TRACKING FUNCTIONS
// =====================================================

/**
 * Create or update symptom log (one per user per day)
 * @param logData - Symptom log data
 * @returns Created/updated symptom log
 */
export async function upsertSymptomLog(
  logData: CreateSymptomLogDTO
): Promise<SymptomLog | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot save symptom log.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('symptom_logs')
      .upsert(
        {
          ...logData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,log_date' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting symptom log:', error);
      throw error;
    }

    return data as SymptomLog;
  } catch (error) {
    console.error('Failed to upsert symptom log:', error);
    return null;
  }
}

/**
 * Get symptom logs for a user
 * @param userId - User's ID
 * @param days - Number of days to retrieve (default: 7)
 * @returns Array of symptom logs
 */
export async function getSymptomLogs(userId: string, days: number = 7): Promise<SymptomLog[]> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve symptom logs.');
    return [];
  }

  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', sinceDate.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (error) {
      console.error('Error retrieving symptom logs:', error);
      throw error;
    }

    return (data as SymptomLog[]) || [];
  } catch (error) {
    console.error('Failed to retrieve symptom logs:', error);
    return [];
  }
}

/**
 * Get symptom log for a specific date
 * @param userId - User's ID
 * @param date - Date (YYYY-MM-DD format)
 * @returns Symptom log or null
 */
export async function getSymptomLogByDate(
  userId: string,
  date: string
): Promise<SymptomLog | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve symptom log.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No log for this date
      }
      console.error('Error retrieving symptom log:', error);
      throw error;
    }

    return data as SymptomLog;
  } catch (error) {
    console.error('Failed to retrieve symptom log:', error);
    return null;
  }
}

/**
 * Delete a symptom log
 * @param logId - Log ID
 * @param userId - User ID (for verification)
 * @returns Success boolean
 */
export async function deleteSymptomLog(logId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot delete symptom log.');
    return false;
  }

  try {
    const { error } = await supabaseAdmin
      .from('symptom_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting symptom log:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete symptom log:', error);
    return false;
  }
}

/**
 * Get symptom tracking statistics
 * @param userId - User's ID
 * @param period - 'week' or 'month'
 * @returns Symptom statistics
 */
export async function getSymptomStats(
  userId: string,
  period: 'week' | 'month' = 'month'
): Promise<SymptomStats | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve stats.');
    return null;
  }

  try {
    const days = period === 'week' ? 7 : 30;
    const logs = await getSymptomLogs(userId, days);

    // Calculate most frequent symptoms
    const symptomCounts: Record<string, { count: number; totalSeverity: number }> = {};

    logs.forEach((log) => {
      Object.entries(log.symptoms).forEach(([symptom, severity]) => {
        if (!symptomCounts[symptom]) {
          symptomCounts[symptom] = { count: 0, totalSeverity: 0 };
        }
        symptomCounts[symptom].count += 1;
        symptomCounts[symptom].totalSeverity += severity;
      });
    });

    const mostFrequent = Object.entries(symptomCounts)
      .map(([symptom, data]) => ({
        symptom: symptom as any,
        count: data.count,
        avg_severity: data.totalSeverity / data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate average energy level
    const energyLevels = logs.filter((log) => log.energy_level).map((log) => log.energy_level!);
    const avgEnergy = energyLevels.length > 0
      ? energyLevels.reduce((sum, level) => sum + level, 0) / energyLevels.length
      : 0;

    return {
      user_id: userId,
      period,
      total_days_logged: logs.length,
      most_frequent_symptoms: mostFrequent,
      avg_energy_level: Number(avgEnergy.toFixed(2)),
      logs_in_period: logs.length,
    };
  } catch (error) {
    console.error('Failed to calculate symptom stats:', error);
    return null;
  }
}

// =====================================================
// FREE TIER: JOURNAL FUNCTIONS
// =====================================================

/**
 * Create a new journal entry
 * @param entryData - Journal entry data
 * @returns Created journal entry
 */
export async function createJournalEntry(
  entryData: CreateJournalEntryDTO
): Promise<JournalEntry | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot create journal entry.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .insert(entryData)
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }

    return data as JournalEntry;
  } catch (error) {
    console.error('Failed to create journal entry:', error);
    return null;
  }
}

/**
 * Get journal entries for a user
 * @param userId - User's ID
 * @param limit - Number of entries to retrieve
 * @param offset - Pagination offset
 * @returns Array of journal entries
 */
export async function getJournalEntries(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<JournalEntry[]> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve journal entries.');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error retrieving journal entries:', error);
      throw error;
    }

    return (data as JournalEntry[]) || [];
  } catch (error) {
    console.error('Failed to retrieve journal entries:', error);
    return [];
  }
}

/**
 * Get a single journal entry by ID
 * @param entryId - Entry ID
 * @param userId - User ID (for verification)
 * @returns Journal entry or null
 */
export async function getJournalEntry(
  entryId: string,
  userId: string
): Promise<JournalEntry | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve journal entry.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error retrieving journal entry:', error);
      throw error;
    }

    return data as JournalEntry;
  } catch (error) {
    console.error('Failed to retrieve journal entry:', error);
    return null;
  }
}

/**
 * Update a journal entry
 * @param entryId - Entry ID
 * @param userId - User ID (for verification)
 * @param updateData - Data to update
 * @returns Updated journal entry
 */
export async function updateJournalEntry(
  entryId: string,
  userId: string,
  updateData: UpdateJournalEntryDTO
): Promise<JournalEntry | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot update journal entry.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }

    return data as JournalEntry;
  } catch (error) {
    console.error('Failed to update journal entry:', error);
    return null;
  }
}

/**
 * Delete a journal entry
 * @param entryId - Entry ID
 * @param userId - User ID (for verification)
 * @returns Success boolean
 */
export async function deleteJournalEntry(entryId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot delete journal entry.');
    return false;
  }

  try {
    const { error } = await supabaseAdmin
      .from('journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete journal entry:', error);
    return false;
  }
}

/**
 * Search journal entries by keyword
 * @param userId - User's ID
 * @param query - Search query
 * @param limit - Number of results
 * @returns Array of matching journal entries
 */
export async function searchJournalEntries(
  userId: string,
  query: string,
  limit: number = 20
): Promise<JournalEntry[]> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot search journal entries.');
    return [];
  }

  try {
    // Use PostgreSQL full-text search
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .textSearch('content', query, { type: 'websearch' })
      .order('entry_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error searching journal entries:', error);
      throw error;
    }

    return (data as JournalEntry[]) || [];
  } catch (error) {
    console.error('Failed to search journal entries:', error);
    return [];
  }
}

/**
 * Get journal statistics for a user
 * @param userId - User's ID
 * @returns Journal statistics
 */
export async function getJournalStats(userId: string): Promise<JournalStats | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve journal stats.');
    return null;
  }

  try {
    const allEntries = await getJournalEntries(userId, 1000, 0);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const entriesLast7Days = allEntries.filter(
      (entry) => new Date(entry.entry_date) >= sevenDaysAgo
    );
    const entriesLast30Days = allEntries.filter(
      (entry) => new Date(entry.entry_date) >= thirtyDaysAgo
    );

    const moodRatings = allEntries
      .filter((entry) => entry.mood_rating)
      .map((entry) => entry.mood_rating!);
    const avgMood = moodRatings.length > 0
      ? moodRatings.reduce((sum, rating) => sum + rating, 0) / moodRatings.length
      : undefined;

    const lastEntry = allEntries.length > 0 ? allEntries[0] : null;

    return {
      user_id: userId,
      total_entries: allEntries.length,
      entries_last_7_days: entriesLast7Days.length,
      entries_last_30_days: entriesLast30Days.length,
      avg_mood_rating: avgMood ? Number(avgMood.toFixed(2)) : undefined,
      last_entry_date: lastEntry?.entry_date,
    };
  } catch (error) {
    console.error('Failed to calculate journal stats:', error);
    return null;
  }
}

// =====================================================
// FREE TIER: CONTACT FORM FUNCTIONS
// =====================================================

/**
 * Create a contact form submission
 * @param submissionData - Contact submission data
 * @returns Created submission
 */
export async function createContactSubmission(
  submissionData: CreateContactSubmissionDTO
): Promise<ContactSubmission | null> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot create contact submission.');
    return null;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .insert(submissionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating contact submission:', error);
      throw error;
    }

    return data as ContactSubmission;
  } catch (error) {
    console.error('Failed to create contact submission:', error);
    return null;
  }
}

/**
 * Get contact submissions (admin only)
 * @param limit - Number of submissions to retrieve
 * @param offset - Pagination offset
 * @returns Array of contact submissions
 */
export async function getContactSubmissions(
  limit: number = 50,
  offset: number = 0
): Promise<ContactSubmission[]> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️  Supabase not configured. Cannot retrieve contact submissions.');
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error retrieving contact submissions:', error);
      throw error;
    }

    return (data as ContactSubmission[]) || [];
  } catch (error) {
    console.error('Failed to retrieve contact submissions:', error);
    return [];
  }
}

/**
 * Check if Supabase is configured
 */
export { isSupabaseConfigured };
