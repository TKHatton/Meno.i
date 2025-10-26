/**
 * Daily Motivation Message Types
 */

export type MessageCategory = 'affirmation' | 'education' | 'tip' | 'encouragement';

export interface DailyMessage {
  id: number;
  category: MessageCategory;
  text: string;
}

export interface DailyMotivation {
  todaysMessage: DailyMessage;
  messageIndex: number;
  totalMessages: number;
}
