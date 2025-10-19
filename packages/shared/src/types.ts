/**
 * Shared types used by web and api packages.
 */

export type Role = 'user' | 'assistant' | 'system';

export type RiskLevel = 'none' | 'low' | 'medium' | 'high';

export type EmotionLabel =
  | 'calm'
  | 'anxious'
  | 'sad'
  | 'overwhelmed'
  | 'guilty'
  | 'frustrated'
  | 'angry'
  | 'lonely'
  | 'uncertain';

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  anonId?: string;
  userId?: string;
  startedAt: string;
  endedAt?: string;
  riskLevel?: RiskLevel;
}

export interface NVCPayload {
  validate: string; // Acknowledge and normalize.
  reflect: string; // Mirror feelings and needs.
  reframe: string; // Gently shift perspective.
  empower: string; // Offer small, doable next step.
}

export interface SafetyAssessment {
  level: RiskLevel;
  type?: 'self-harm' | 'despair' | 'abuse' | 'other';
  notes?: string;
}

export interface EmotionAnalysis {
  primary: EmotionLabel;
  secondary?: EmotionLabel;
  needs?: string[]; // NVC needs (e.g., connection, rest, autonomy)
}

export interface ChatResponse {
  conversationId: string;
  messageId: string;
  nvc: NVCPayload;
  emotion: EmotionAnalysis;
  safety: SafetyAssessment;
  model: string;
  latencyMs: number;
}

