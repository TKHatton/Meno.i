/**
 * User type definitions for MenoAI
 *
 * NOTE: User authentication is handled by Supabase Auth (auth.users table).
 * We don't maintain a custom users table - instead we reference auth.users
 * via user_id in conversations and safety_logs.
 */

export type AuthProvider = 'email' | 'google';

/**
 * User object from Supabase Auth
 * This comes from the auth.users table managed by Supabase
 */
export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at?: string;
  // Additional fields from Supabase Auth
  aud?: string;
  role?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
}

/**
 * Safety log entry for monitoring and compliance
 */
export interface SafetyLog {
  id: string;
  user_id: string | null;
  message_id: string | null;
  trigger_phrase: string;
  escalation_action: string;
  created_at: string;
}
