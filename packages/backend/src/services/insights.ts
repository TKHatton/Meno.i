/**
 * AI Insights Service
 * Generates personalized insights from user symptom data using OpenAI
 */

import OpenAI from 'openai';
import { getSymptomLogs, getJournalEntries } from '../lib/supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const isOpenAIConfigured = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your-openai-key-here';

export interface Insight {
  type: 'pattern' | 'trend' | 'recommendation' | 'celebration';
  title: string;
  description: string;
  icon: string; // emoji or icon name
  actionable?: boolean;
  action?: string;
}


/**
 * Generate AI-powered insights from user data
 *
 * @param userId - User's ID
 * @returns Array of personalized insights
 */
export async function generateInsights(userId: string): Promise<Insight[]> {
  try {
    // Fetch user data (last 30 days)
    const [symptoms, journals] = await Promise.all([
      getSymptomLogs(userId, 30),
      getJournalEntries(userId, 30, 0)
    ]);

    // If user has less than 7 days of data, return empty array
    if (symptoms.length < 7 && journals.length < 3) {
      console.log(`📊 User ${userId} has insufficient data. No insights available yet.`);
      return [];
    }

    // If OpenAI is not configured, return empty array
    if (!isOpenAIConfigured) {
      console.warn('⚠️  OpenAI not configured. No insights available.');
      return [];
    }

    // Prepare data summary for AI analysis
    const dataSummary = {
      symptomCount: symptoms.length,
      symptomTypes: summarizeSymptoms(symptoms),
      journalCount: journals.length,
      recentJournalThemes: extractJournalThemes(journals),
      timeRange: '30 days'
    };

    // Call OpenAI to analyze patterns and generate insights
    const systemPrompt = `You are a compassionate menopause health analyst. Analyze the user's symptom data and journal entries to provide 3-4 actionable, empowering insights.

Focus on:
1. Patterns (e.g., "Hot flashes peak on weekday evenings")
2. Trends (e.g., "Sleep quality improving over last 2 weeks")
3. Recommendations (e.g., "Consider tracking meal times - might correlate with energy dips")
4. Celebrations (e.g., "You've logged symptoms 15 days this month - that's excellent self-awareness!")

Return insights as a JSON array with this structure:
[
  {
    "type": "pattern" | "trend" | "recommendation" | "celebration",
    "title": "Short, clear title (max 50 chars)",
    "description": "Supportive, actionable description (max 150 chars)",
    "icon": "relevant emoji",
    "actionable": true/false,
    "action": "optional action text"
  }
]

Be warm, encouraging, and focus on patterns that empower the user.`;

    const userMessage = `Analyze this menopause journey data:

Symptoms logged: ${dataSummary.symptomCount} entries over ${dataSummary.timeRange}
Symptom breakdown: ${JSON.stringify(dataSummary.symptomTypes, null, 2)}

Journal entries: ${dataSummary.journalCount} entries
Recent themes: ${dataSummary.recentJournalThemes.join(', ')}

Generate 3-4 personalized insights.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse AI response
    const parsed = JSON.parse(aiResponse);
    const insights: Insight[] = Array.isArray(parsed) ? parsed : parsed.insights || [];

    // Validate and limit to 4 insights
    const validInsights = insights
      .filter(insight => insight.title && insight.description && insight.type)
      .slice(0, 4);

    if (validInsights.length === 0) {
      throw new Error('No valid insights in AI response');
    }

    console.log(`✨ Generated ${validInsights.length} AI insights for user ${userId}`);
    return validInsights;

  } catch (error) {
    console.error('Error generating AI insights:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Summarize symptom frequency and severity
 */
function summarizeSymptoms(symptoms: any[]): Record<string, { count: number; avgSeverity: number }> {
  const summary: Record<string, { total: number; severitySum: number }> = {};

  symptoms.forEach(log => {
    Object.entries(log.symptoms || {}).forEach(([symptom, severity]) => {
      if (!summary[symptom]) {
        summary[symptom] = { total: 0, severitySum: 0 };
      }
      summary[symptom].total += 1;
      summary[symptom].severitySum += Number(severity);
    });
  });

  // Convert to averages
  const result: Record<string, { count: number; avgSeverity: number }> = {};
  Object.entries(summary).forEach(([symptom, data]) => {
    result[symptom] = {
      count: data.total,
      avgSeverity: Math.round((data.severitySum / data.total) * 10) / 10
    };
  });

  return result;
}

/**
 * Extract themes from journal entries using simple keyword analysis
 */
function extractJournalThemes(journals: any[]): string[] {
  const themes = new Set<string>();
  const keywords = {
    sleep: ['sleep', 'tired', 'exhausted', 'insomnia', 'rest'],
    mood: ['mood', 'emotional', 'anxious', 'sad', 'happy', 'frustrated'],
    energy: ['energy', 'fatigue', 'drained', 'exhausted'],
    relationships: ['partner', 'family', 'husband', 'kids', 'relationship'],
    work: ['work', 'job', 'career', 'office'],
    physical: ['pain', 'ache', 'hot flash', 'sweat', 'headache']
  };

  journals.forEach(journal => {
    const content = journal.content?.toLowerCase() || '';
    Object.entries(keywords).forEach(([theme, words]) => {
      if (words.some(word => content.includes(word))) {
        themes.add(theme);
      }
    });
  });

  return themes.size > 0 ? Array.from(themes) : ['general wellness'];
}
