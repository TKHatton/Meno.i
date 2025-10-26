/**
 * Symptom Tracking type definitions for MenoAI Free Tier
 */

/**
 * Symptom types - 15 total (7 physical + 8 emotional/cognitive)
 */
export type SymptomType =
  // Physical symptoms (7)
  | 'hot_flashes'
  | 'night_sweats'
  | 'sleep_issues'
  | 'headaches'
  | 'joint_pain'
  | 'fatigue'
  | 'heart_palpitations'
  // Emotional/Cognitive symptoms (8)
  | 'mood_swings'
  | 'anxiety'
  | 'irritability'
  | 'depression'
  | 'brain_fog'
  | 'memory_issues'
  | 'crying_spells'
  | 'feeling_overwhelmed'
  // Other
  | 'other';

/**
 * Symptom severity scale: 1-5
 * 1 = Very mild (barely noticeable)
 * 2 = Mild (noticeable but manageable)
 * 3 = Moderate (clearly present, some impact)
 * 4 = Severe (hard to ignore, significant impact)
 * 5 = Very severe (overwhelming, prevents activities)
 */
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Energy level scale: 1-5
 * 1 = Very low
 * 2 = Low
 * 3 = Moderate
 * 4 = High
 * 5 = Very high
 */
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Symptoms object - maps symptom type to severity
 * Example: { "hot_flashes": 4, "anxiety": 3 }
 */
export type SymptomsData = Partial<Record<SymptomType, SeverityLevel>>;

/**
 * Symptom log entry (database record)
 */
export interface SymptomLog {
  id: string;
  user_id: string;
  log_date: string; // ISO date string (YYYY-MM-DD)
  symptoms: SymptomsData;
  energy_level?: EnergyLevel;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * DTO for creating/updating symptom log
 */
export interface CreateSymptomLogDTO {
  user_id: string;
  log_date: string; // ISO date string (YYYY-MM-DD)
  symptoms: SymptomsData;
  energy_level?: EnergyLevel;
  notes?: string;
}

/**
 * DTO for updating symptom log (all fields optional except which log)
 */
export interface UpdateSymptomLogDTO {
  symptoms?: SymptomsData;
  energy_level?: EnergyLevel;
  notes?: string;
}

/**
 * Symptom frequency data for analytics
 */
export interface SymptomFrequency {
  symptom: SymptomType;
  count: number; // Number of days logged
  avg_severity: number; // Average severity (1-5)
}

/**
 * Symptom statistics for a time period
 */
export interface SymptomStats {
  user_id: string;
  period: 'week' | 'month';
  total_days_logged: number;
  most_frequent_symptoms: SymptomFrequency[];
  avg_energy_level: number;
  logs_in_period: number;
}

/**
 * 7-day symptom summary for grid view
 */
export interface SymptomWeeklySummary {
  user_id: string;
  week_start: string; // ISO date string
  week_end: string; // ISO date string
  daily_data: {
    date: string; // ISO date string
    symptoms: SymptomsData;
    energy_level?: EnergyLevel;
  }[];
}

/**
 * Symptom metadata for UI display
 */
export interface SymptomMetadata {
  type: SymptomType;
  label: string; // Display name
  category: 'physical' | 'emotional_cognitive' | 'other';
  description?: string;
}

/**
 * Complete symptom list with metadata
 */
export const SYMPTOM_LIST: SymptomMetadata[] = [
  // Physical symptoms
  { type: 'hot_flashes', label: 'Hot flashes', category: 'physical' },
  { type: 'night_sweats', label: 'Night sweats', category: 'physical' },
  { type: 'sleep_issues', label: 'Sleep issues', category: 'physical' },
  { type: 'headaches', label: 'Headaches', category: 'physical' },
  { type: 'joint_pain', label: 'Joint pain', category: 'physical' },
  { type: 'fatigue', label: 'Fatigue', category: 'physical' },
  { type: 'heart_palpitations', label: 'Heart palpitations', category: 'physical' },
  // Emotional/Cognitive symptoms
  { type: 'mood_swings', label: 'Mood swings', category: 'emotional_cognitive' },
  { type: 'anxiety', label: 'Anxiety', category: 'emotional_cognitive' },
  { type: 'irritability', label: 'Irritability', category: 'emotional_cognitive' },
  { type: 'depression', label: 'Depression/Low mood', category: 'emotional_cognitive' },
  { type: 'brain_fog', label: 'Brain fog', category: 'emotional_cognitive' },
  { type: 'memory_issues', label: 'Memory issues', category: 'emotional_cognitive' },
  { type: 'crying_spells', label: 'Crying spells', category: 'emotional_cognitive' },
  { type: 'feeling_overwhelmed', label: 'Feeling overwhelmed', category: 'emotional_cognitive' },
  // Other
  { type: 'other', label: 'Other', category: 'other' },
];
