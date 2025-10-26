/**
 * User Context Service
 * Fetches and builds personalized context for AI conversations
 * Includes profile data, recent symptoms, and journal entries
 */

import { supabaseAdmin } from '../lib/supabase';
import type { UserProfile, MenopauseStage, PrimaryConcern } from '@menoai/shared';
import type { SymptomLog, SymptomType } from '@menoai/shared';
import type { JournalEntry } from '@menoai/shared';
import { analyzeUserData, type IntelligentInsights } from './intelligentInsights';

interface UserContext {
  profile: UserProfile | null;
  recentSymptoms: SymptomLog[];
  recentJournalEntries: JournalEntry[];
  insights: IntelligentInsights | null;
}

/**
 * Fetch comprehensive user context for personalized AI responses
 * @param userId - The user's ID
 * @returns User context including profile, symptoms, and journal entries
 */
export async function getUserContext(userId: string): Promise<UserContext> {
  try {
    // Fetch user profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Fetch recent symptom logs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: symptoms } = await supabaseAdmin
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false })
      .limit(7);

    // Fetch recent journal entries (last 5 entries)
    const { data: journals } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(5);

    // Analyze user data for intelligent insights
    console.log('📊 Analyzing user data for intelligent insights...');
    const insights = await analyzeUserData(userId, 30);

    return {
      profile: profile || null,
      recentSymptoms: symptoms || [],
      recentJournalEntries: journals || [],
      insights
    };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return {
      profile: null,
      recentSymptoms: [],
      recentJournalEntries: [],
      insights: null
    };
  }
}

/**
 * Build a personalized context string for the AI system prompt
 * This gives the AI awareness of the user's personal journey
 * @param context - User context data
 * @returns Formatted context string for AI
 */
export function buildPersonalizedContext(context: UserContext): string {
  if (!context.profile) {
    return '';
  }

  const sections: string[] = [];

  // Profile information
  const profileSection = buildProfileSection(context.profile);
  if (profileSection) {
    sections.push(profileSection);
  }

  // Recent symptoms
  const symptomsSection = buildSymptomsSection(context.recentSymptoms);
  if (symptomsSection) {
    sections.push(symptomsSection);
  }

  // Recent journal entries
  const journalSection = buildJournalSection(context.recentJournalEntries);
  if (journalSection) {
    sections.push(journalSection);
  }

  // Intelligent insights - THIS IS CRITICAL
  const insightsSection = buildInsightsSection(context.insights);
  if (insightsSection) {
    sections.push(insightsSection);
  }

  if (sections.length === 0) {
    return '';
  }

  return `
===== USER CONTEXT =====
This user has shared personal information with you. Use this context to personalize your responses, reference their specific experiences, and show that you understand their unique journey.

${sections.join('\n\n')}

===== END USER CONTEXT =====

CRITICAL INSTRUCTIONS:
1. Reference specific patterns, correlations, and trends from the DATA-DRIVEN INSIGHTS section
2. Use their name naturally in conversation
3. Connect their current message to detected patterns (e.g., "I notice from your data that...")
4. Provide recommendations based on the evidence in the insights
5. This data-driven personalization is what makes this platform revolutionary
6. Don't just offer empathy - offer INFORMED, DATA-DRIVEN support
`;
}

/**
 * Build profile section of user context
 */
function buildProfileSection(profile: UserProfile): string {
  const parts: string[] = [];

  // Name
  if (profile.display_name) {
    parts.push(`User's Name: ${profile.display_name}`);
  }

  // Menopause stage
  if (profile.menopause_stage) {
    const stageLabels: Record<MenopauseStage, string> = {
      'perimenopause': 'Perimenopause (transitioning into menopause)',
      'menopause': 'Menopause (no period for 12+ months)',
      'postmenopause': 'Postmenopause (years after menopause)',
      'unsure': 'Unsure of their stage',
      'learning': 'Learning about menopause (may be supporting someone)'
    };
    parts.push(`Menopause Stage: ${stageLabels[profile.menopause_stage as MenopauseStage]}`);
  }

  // Primary concerns
  if (profile.primary_concerns && profile.primary_concerns.length > 0) {
    const concernLabels: Record<string, string> = {
      'hot_flashes': 'Hot flashes',
      'sleep_issues': 'Sleep issues',
      'mood_swings': 'Mood swings',
      'anxiety': 'Anxiety',
      'brain_fog': 'Brain fog',
      'memory_issues': 'Memory issues',
      'energy': 'Low energy',
      'fatigue': 'Fatigue',
      'relationship_challenges': 'Relationship challenges',
      'understanding_symptoms': 'Understanding symptoms',
      'other': 'Other concerns'
    };
    const concerns = profile.primary_concerns
      .map((c: string) => concernLabels[c] || c)
      .join(', ');
    parts.push(`Primary Concerns: ${concerns}`);
  }

  if (parts.length === 0) {
    return '';
  }

  return `PROFILE:\n${parts.join('\n')}`;
}

/**
 * Build symptoms section of user context
 */
function buildSymptomsSection(symptoms: SymptomLog[]): string {
  if (!symptoms || symptoms.length === 0) {
    return '';
  }

  const parts: string[] = [];
  parts.push(`RECENT SYMPTOM TRACKING (Last 7 Days):`);
  parts.push(`The user has logged ${symptoms.length} day(s) of symptoms recently.`);

  // Analyze symptoms across all logs
  const symptomCounts: Record<string, { count: number; totalSeverity: number; maxSeverity: number }> = {};
  const energyLevels: number[] = [];
  const notes: string[] = [];

  symptoms.forEach(log => {
    // Track symptoms
    if (log.symptoms && typeof log.symptoms === 'object') {
      Object.entries(log.symptoms).forEach(([symptom, severity]) => {
        if (!symptomCounts[symptom]) {
          symptomCounts[symptom] = { count: 0, totalSeverity: 0, maxSeverity: 0 };
        }
        symptomCounts[symptom].count++;
        symptomCounts[symptom].totalSeverity += Number(severity);
        symptomCounts[symptom].maxSeverity = Math.max(symptomCounts[symptom].maxSeverity, Number(severity));
      });
    }

    // Track energy
    if (log.energy_level) {
      energyLevels.push(log.energy_level);
    }

    // Collect notes
    if (log.notes) {
      notes.push(log.notes);
    }
  });

  // Most frequent symptoms
  const frequentSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([symptom, data]) => {
      const avgSeverity = (data.totalSeverity / data.count).toFixed(1);
      return `  - ${formatSymptomName(symptom)}: ${data.count} day(s), avg severity ${avgSeverity}/5`;
    });

  if (frequentSymptoms.length > 0) {
    parts.push(`Most Frequent Symptoms:\n${frequentSymptoms.join('\n')}`);
  }

  // Average energy level
  if (energyLevels.length > 0) {
    const avgEnergy = (energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length).toFixed(1);
    parts.push(`Average Energy Level: ${avgEnergy}/5`);
  }

  // Recent notes (last 3)
  if (notes.length > 0) {
    const recentNotes = notes.slice(0, 3).map(note => `  - "${note}"`);
    parts.push(`Recent Symptom Notes:\n${recentNotes.join('\n')}`);
  }

  return parts.join('\n');
}

/**
 * Build journal section of user context
 */
function buildJournalSection(journals: JournalEntry[]): string {
  if (!journals || journals.length === 0) {
    return '';
  }

  const parts: string[] = [];
  parts.push(`RECENT JOURNAL ENTRIES (Last ${journals.length}):`);

  // Calculate average mood
  const moodRatings = journals.filter(j => j.mood_rating).map(j => j.mood_rating as number);
  if (moodRatings.length > 0) {
    const avgMood = (moodRatings.reduce((a, b) => a + b, 0) / moodRatings.length).toFixed(1);
    const moodLabels = ['', 'Struggling', 'Okay', 'Good', 'Great'];
    parts.push(`Average Recent Mood: ${avgMood}/4 (${moodLabels[Math.round(Number(avgMood))]})`);
  }

  // Include excerpts from most recent entries (first 200 chars each)
  const recentExcerpts = journals.slice(0, 3).map(journal => {
    const date = new Date(journal.entry_date).toLocaleDateString();
    const excerpt = journal.content.length > 200
      ? journal.content.substring(0, 200) + '...'
      : journal.content;
    const mood = journal.mood_rating ? ` [Mood: ${journal.mood_rating}/4]` : '';
    return `  - ${date}${mood}: "${excerpt}"`;
  });

  parts.push(`Recent Entries:\n${recentExcerpts.join('\n')}`);

  return parts.join('\n');
}

/**
 * Build insights section - THIS IS THE GAME CHANGER
 */
function buildInsightsSection(insights: IntelligentInsights | null): string {
  if (!insights || insights.summary.totalDaysTracked < 5) {
    return '';
  }

  const parts: string[] = [];
  parts.push('DATA-DRIVEN INSIGHTS (Use these to provide informed recommendations!):');

  // Summary
  parts.push(`\nSummary:`);
  parts.push(`  - Total days tracked: ${insights.summary.totalDaysTracked}`);
  if (insights.summary.mostFrequentSymptom) {
    parts.push(`  - Most frequent symptom: ${insights.summary.mostFrequentSymptom}`);
  }
  parts.push(`  - Average symptom severity: ${insights.summary.averageSeverity.toFixed(1)}/5`);
  parts.push(`  - Overall trend: ${insights.summary.trendDirection}`);

  // Detected Patterns
  if (insights.patterns.length > 0) {
    parts.push(`\nDetected Patterns (${insights.patterns.length}):`);
    insights.patterns.forEach((pattern, i) => {
      parts.push(`  ${i + 1}. [${pattern.confidence.toUpperCase()}] ${pattern.description}`);
      if (pattern.data) {
        parts.push(`     Evidence: ${JSON.stringify(pattern.data)}`);
      }
    });
  }

  // Correlations
  if (insights.correlations.length > 0) {
    parts.push(`\nCorrelations Found (${insights.correlations.length}):`);
    insights.correlations.forEach((corr, i) => {
      parts.push(`  ${i + 1}. ${corr.description}`);
      parts.push(`     Strength: ${corr.strength.toFixed(2)} | Sample: ${corr.sampleSize} days`);
    });
  }

  // Recommendations
  if (insights.recommendations.length > 0) {
    parts.push(`\nData-Driven Recommendations (${insights.recommendations.length}):`);
    insights.recommendations.forEach((rec, i) => {
      parts.push(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      parts.push(`     Evidence: ${rec.evidence}`);
      parts.push(`     Suggested action: ${rec.action}`);
    });
  }

  if (parts.length <= 1) {
    return '';
  }

  return parts.join('\n');
}

/**
 * Format symptom name for display
 */
function formatSymptomName(symptom: string): string {
  const labels: Record<string, string> = {
    'hot_flashes': 'Hot flashes',
    'night_sweats': 'Night sweats',
    'sleep_issues': 'Sleep issues',
    'headaches': 'Headaches',
    'joint_pain': 'Joint pain',
    'fatigue': 'Fatigue',
    'heart_palpitations': 'Heart palpitations',
    'mood_swings': 'Mood swings',
    'anxiety': 'Anxiety',
    'irritability': 'Irritability',
    'depression': 'Depression/Low mood',
    'brain_fog': 'Brain fog',
    'memory_issues': 'Memory issues',
    'crying_spells': 'Crying spells',
    'feeling_overwhelmed': 'Feeling overwhelmed',
    'other': 'Other'
  };
  return labels[symptom] || symptom;
}
