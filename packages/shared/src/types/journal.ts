/**
 * Journal Entry type definitions for MenoAI Free Tier
 */

/**
 * Mood rating scale: 1-4
 * 1 = Struggling (having a very hard time, feeling overwhelmed)
 * 2 = Okay (getting by, some challenges)
 * 3 = Good (feeling mostly positive, managing well)
 * 4 = Great (feeling strong, having a good day)
 */
export type MoodRating = 1 | 2 | 3 | 4;

/**
 * Journal entry (database record)
 */
export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string; // ISO date string (YYYY-MM-DD)
  content: string;
  mood_rating?: MoodRating;
  created_at: string;
  updated_at: string;
}

/**
 * DTO for creating journal entry
 */
export interface CreateJournalEntryDTO {
  user_id: string;
  entry_date: string; // ISO date string (YYYY-MM-DD)
  content: string;
  mood_rating?: MoodRating;
}

/**
 * DTO for updating journal entry
 */
export interface UpdateJournalEntryDTO {
  content?: string;
  mood_rating?: MoodRating;
}

/**
 * Journal entry preview for list view
 */
export interface JournalEntryPreview {
  id: string;
  entry_date: string;
  preview: string; // First 100 characters
  mood_rating?: MoodRating;
  created_at: string;
}

/**
 * Journal statistics
 */
export interface JournalStats {
  user_id: string;
  total_entries: number;
  entries_last_7_days: number;
  entries_last_30_days: number;
  avg_mood_rating?: number;
  last_entry_date?: string;
}

/**
 * Journal search result
 */
export interface JournalSearchResult {
  entry: JournalEntry;
  matches: string[]; // Matching excerpts with context
  relevance_score?: number;
}

/**
 * Journal prompts for inspiration
 */
export interface JournalPrompt {
  id: number;
  text: string;
  category: 'reflection' | 'gratitude' | 'processing' | 'self_care';
}

/**
 * Default journal prompts
 */
export const JOURNAL_PROMPTS: JournalPrompt[] = [
  { id: 1, text: "What's been on your mind today?", category: 'reflection' },
  { id: 2, text: 'What triggered your symptoms?', category: 'processing' },
  { id: 3, text: 'What helped you feel better?', category: 'self_care' },
  { id: 4, text: 'What are you grateful for today?', category: 'gratitude' },
  { id: 5, text: 'How did you take care of yourself?', category: 'self_care' },
  { id: 6, text: 'What did you learn about your body today?', category: 'reflection' },
  { id: 7, text: 'What do you need right now?', category: 'reflection' },
  { id: 8, text: 'What made you smile today?', category: 'gratitude' },
  { id: 9, text: 'What was challenging about today?', category: 'processing' },
  { id: 10, text: 'What do you want to remember about this moment?', category: 'reflection' },
  { id: 11, text: 'How are you feeling emotionally right now?', category: 'reflection' },
  { id: 12, text: 'What would make tomorrow easier?', category: 'self_care' },
  { id: 13, text: 'What boundaries do you need to set?', category: 'self_care' },
  { id: 14, text: 'What are you proud of yourself for today?', category: 'gratitude' },
  { id: 15, text: 'What do you wish others understood about what you\'re going through?', category: 'processing' },
  { id: 16, text: 'What gave you energy today?', category: 'reflection' },
  { id: 17, text: 'What drained your energy today?', category: 'processing' },
  { id: 18, text: 'How did you show yourself compassion today?', category: 'self_care' },
  { id: 19, text: 'What would you tell a friend experiencing what you\'re going through?', category: 'reflection' },
  { id: 20, text: 'What small victory did you have today?', category: 'gratitude' },
];

/**
 * Mood metadata for UI display
 */
export interface MoodMetadata {
  rating: MoodRating;
  label: string;
  emoji: string;
  color: string; // Tailwind color class
}

/**
 * Mood scale metadata
 */
export const MOOD_SCALE: MoodMetadata[] = [
  { rating: 1, label: 'Struggling', emoji: '😔', color: 'text-red-500' },
  { rating: 2, label: 'Okay', emoji: '😐', color: 'text-yellow-500' },
  { rating: 3, label: 'Good', emoji: '🙂', color: 'text-green-500' },
  { rating: 4, label: 'Great', emoji: '😊', color: 'text-emerald-500' },
];
