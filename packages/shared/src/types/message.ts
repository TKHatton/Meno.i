/**
 * Message type definitions for MenoAI
 * These types are shared between frontend and backend
 */

export type MessageRole = 'user' | 'ai';

export type EmotionTag =
  | 'sadness'
  | 'anxiety'
  | 'anger'
  | 'shame'
  | 'guilt'
  | 'frustration'
  | 'confusion'
  | 'joy'
  | 'relief'
  | 'neutral';

export type IntentTag =
  | 'seeking_validation'
  | 'seeking_advice'
  | 'venting'
  | 'sharing_experience'
  | 'asking_question'
  | 'expressing_gratitude';

export type NeedTag =
  | 'connection'
  | 'understanding'
  | 'peace'
  | 'safety'
  | 'autonomy'
  | 'competence'
  | 'rest';

export type SafetyLevel = 'low' | 'medium' | 'high';

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  emotion_tag?: EmotionTag;
  intent_tag?: IntentTag;
  need_tag?: NeedTag;
  safety_level: SafetyLevel;
  created_at: string;
}

export interface CreateMessageDTO {
  conversation_id: string;
  role: MessageRole;
  content: string;
  emotion_tag?: EmotionTag;
  intent_tag?: IntentTag;
  need_tag?: NeedTag;
  safety_level?: SafetyLevel;
}

/**
 * Structured AI response following the 4-step framework:
 * Validate → Reflect → Reframe → Empower
 */
export interface AIResponse {
  validate: string;  // Emotional validation using NVC
  reflect: string;   // Mirror back what was heard
  reframe: string;   // Cognitive reframing using NLP
  empower: string;   // Action-oriented empowerment
  full_response: string;  // Combined natural response
  safety_triggered: boolean;
  emotion_detected?: EmotionTag;
  need_identified?: NeedTag;
}
