/**
 * User Profile type definitions for MenoAI Free Tier
 */

/**
 * Menopause stage options
 */
export type MenopauseStage =
  | 'perimenopause'
  | 'menopause'
  | 'postmenopause'
  | 'unsure'
  | 'learning';

/**
 * Primary concern options for onboarding
 */
export type PrimaryConcern =
  | 'hot_flashes'
  | 'sleep_issues'
  | 'mood_swings'
  | 'anxiety'
  | 'brain_fog'
  | 'memory_issues'
  | 'energy'
  | 'fatigue'
  | 'relationship_challenges'
  | 'understanding_symptoms'
  | 'other';

/**
 * User profile extending Supabase Auth user
 * Stored in user_profiles table
 */
export interface UserProfile {
  id: string; // References auth.users(id)
  full_name?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  // Onboarding fields
  menopause_stage?: MenopauseStage;
  primary_concerns?: PrimaryConcern[];
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DTO for creating/updating user profile
 */
export interface UpdateProfileDTO {
  full_name?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  menopause_stage?: MenopauseStage;
  primary_concerns?: PrimaryConcern[];
  onboarding_completed?: boolean;
}

/**
 * Onboarding data collected during signup
 */
export interface OnboardingData {
  display_name: string;
  menopause_stage: MenopauseStage;
  primary_concerns: PrimaryConcern[]; // Max 2
}
