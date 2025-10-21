/**
 * User type definitions for MenoAI
 */

export type AuthProvider = 'email' | 'google';

export interface User {
  id: string;
  email?: string;
  auth_provider: AuthProvider;
  created_at: string;
  last_active: string;
  anonymized: boolean;
}

export interface SafetyLog {
  id: string;
  user_id: string;
  message_id: string;
  trigger_phrase: string;
  escalation_action: string;
  created_at: string;
}
