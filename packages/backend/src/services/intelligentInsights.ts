/**
 * Intelligent Insights Service
 * Advanced pattern detection, correlation analysis, and data-driven recommendations
 * This service analyzes user data to provide actionable, personalized insights
 */

import { supabaseAdmin } from '../lib/supabase';
import type { SymptomLog, JournalEntry, SymptomType } from '@menoai/shared';

/**
 * Pattern types detected by the system
 */
export interface DetectedPattern {
  type: 'day_of_week' | 'severity_trend' | 'frequency_trend' | 'correlation';
  symptom?: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  data: any;
}

/**
 * Correlation between two variables
 */
export interface Correlation {
  variable1: string;
  variable2: string;
  strength: number; // -1 to 1
  description: string;
  sampleSize: number;
}

/**
 * Actionable recommendation based on data
 */
export interface DataDrivenRecommendation {
  category: 'lifestyle' | 'tracking' | 'awareness' | 'medical';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  evidence: string; // What data supports this
  action: string; // What user should do
}

/**
 * Comprehensive insights package
 */
export interface IntelligentInsights {
  patterns: DetectedPattern[];
  correlations: Correlation[];
  recommendations: DataDrivenRecommendation[];
  summary: {
    totalDaysTracked: number;
    mostFrequentSymptom: string | null;
    averageSeverity: number;
    trendDirection: 'improving' | 'stable' | 'worsening' | 'insufficient_data';
  };
}

/**
 * Analyze user data and generate intelligent insights
 * @param userId - User's ID
 * @param days - Number of days to analyze (default 30)
 * @returns Comprehensive insights
 */
export async function analyzeUserData(userId: string, days: number = 30): Promise<IntelligentInsights> {
  try {
    // Fetch user data
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    const { data: symptoms } = await supabaseAdmin
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('log_date', daysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: true });

    const { data: journals } = await supabaseAdmin
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', daysAgo.toISOString().split('T')[0])
      .order('entry_date', { ascending: true });

    const symptomLogs = symptoms || [];
    const journalEntries = journals || [];

    // Insufficient data
    if (symptomLogs.length < 5) {
      return {
        patterns: [],
        correlations: [],
        recommendations: [{
          category: 'tracking',
          priority: 'high',
          title: 'Start tracking consistently',
          description: 'Track your symptoms for at least 7 days to unlock personalized insights.',
          evidence: `You've tracked ${symptomLogs.length} days so far.`,
          action: 'Log your symptoms daily to help us identify patterns.'
        }],
        summary: {
          totalDaysTracked: symptomLogs.length,
          mostFrequentSymptom: null,
          averageSeverity: 0,
          trendDirection: 'insufficient_data'
        }
      };
    }

    // Analyze patterns
    const patterns = detectPatterns(symptomLogs);
    const correlations = findCorrelations(symptomLogs, journalEntries);
    const recommendations = generateRecommendations(symptomLogs, journalEntries, patterns, correlations);
    const summary = generateSummary(symptomLogs);

    return {
      patterns,
      correlations,
      recommendations,
      summary
    };

  } catch (error) {
    console.error('Error analyzing user data:', error);
    return {
      patterns: [],
      correlations: [],
      recommendations: [],
      summary: {
        totalDaysTracked: 0,
        mostFrequentSymptom: null,
        averageSeverity: 0,
        trendDirection: 'insufficient_data'
      }
    };
  }
}

/**
 * Detect patterns in symptom data
 */
function detectPatterns(logs: SymptomLog[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // 1. Day-of-week patterns
  const dayOfWeekPatterns = analyzeDayOfWeekPatterns(logs);
  patterns.push(...dayOfWeekPatterns);

  // 2. Severity trends
  const severityTrends = analyzeSeverityTrends(logs);
  patterns.push(...severityTrends);

  // 3. Frequency trends
  const frequencyTrends = analyzeFrequencyTrends(logs);
  patterns.push(...frequencyTrends);

  return patterns.filter(p => p.confidence !== 'low');
}

/**
 * Analyze which days of the week symptoms are worse
 */
function analyzeDayOfWeekPatterns(logs: SymptomLog[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const symptomsByDay: Record<string, Record<number, number[]>> = {}; // symptom -> day -> severities

  logs.forEach(log => {
    const date = new Date(log.log_date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    Object.entries(log.symptoms).forEach(([symptom, severity]) => {
      if (!symptomsByDay[symptom]) {
        symptomsByDay[symptom] = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
      }
      symptomsByDay[symptom][dayOfWeek].push(severity as number);
    });
  });

  // Find significant day-of-week patterns
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  Object.entries(symptomsByDay).forEach(([symptom, dayData]) => {
    const avgByDay = Object.entries(dayData).map(([day, severities]) => ({
      day: parseInt(day),
      avg: severities.length > 0 ? severities.reduce((a, b) => a + b, 0) / severities.length : 0,
      count: severities.length
    }));

    // Find peak day (only if we have data for multiple days)
    const daysWithData = avgByDay.filter(d => d.count > 0);
    if (daysWithData.length >= 3) {
      const peakDay = daysWithData.reduce((prev, curr) => curr.avg > prev.avg ? curr : prev);
      const lowestDay = daysWithData.reduce((prev, curr) => curr.avg < prev.avg ? curr : prev);
      const difference = peakDay.avg - lowestDay.avg;

      // Significant difference (at least 1 point)
      if (difference >= 1) {
        patterns.push({
          type: 'day_of_week',
          symptom,
          description: `${formatSymptomName(symptom)} tends to be worse on ${dayNames[peakDay.day]}s`,
          confidence: difference >= 1.5 ? 'high' : 'medium',
          data: { peakDay: dayNames[peakDay.day], lowestDay: dayNames[lowestDay.day], difference }
        });
      }
    }
  });

  return patterns;
}

/**
 * Analyze if symptoms are getting better or worse over time
 */
function analyzeSeverityTrends(logs: SymptomLog[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (logs.length < 10) return patterns; // Need at least 10 days for trend

  // Group symptoms
  const symptomData: Record<string, Array<{ date: Date; severity: number }>> = {};

  logs.forEach(log => {
    const date = new Date(log.log_date);
    Object.entries(log.symptoms).forEach(([symptom, severity]) => {
      if (!symptomData[symptom]) {
        symptomData[symptom] = [];
      }
      symptomData[symptom].push({ date, severity: severity as number });
    });
  });

  // Analyze trends for each symptom
  Object.entries(symptomData).forEach(([symptom, data]) => {
    if (data.length < 10) return;

    // Simple linear regression to detect trend
    const trend = calculateTrend(data);

    if (Math.abs(trend.slope) > 0.05) { // Significant trend
      const direction = trend.slope < 0 ? 'improving' : 'worsening';
      const changePercent = Math.abs(trend.slope * data.length / data[0].severity * 100);

      patterns.push({
        type: 'severity_trend',
        symptom,
        description: `${formatSymptomName(symptom)} severity is ${direction} over time`,
        confidence: Math.abs(trend.slope) > 0.1 ? 'high' : 'medium',
        data: { direction, slope: trend.slope, changePercent: changePercent.toFixed(0) }
      });
    }
  });

  return patterns;
}

/**
 * Analyze if symptoms are becoming more or less frequent
 */
function analyzeFrequencyTrends(logs: SymptomLog[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  if (logs.length < 14) return patterns; // Need at least 2 weeks

  // Split into first half and second half
  const midpoint = Math.floor(logs.length / 2);
  const firstHalf = logs.slice(0, midpoint);
  const secondHalf = logs.slice(midpoint);

  // Count symptom frequency in each half
  const firstHalfFreq: Record<string, number> = {};
  const secondHalfFreq: Record<string, number> = {};

  firstHalf.forEach(log => {
    Object.keys(log.symptoms).forEach(symptom => {
      firstHalfFreq[symptom] = (firstHalfFreq[symptom] || 0) + 1;
    });
  });

  secondHalf.forEach(log => {
    Object.keys(log.symptoms).forEach(symptom => {
      secondHalfFreq[symptom] = (secondHalfFreq[symptom] || 0) + 1;
    });
  });

  // Find significant changes in frequency
  const allSymptoms = new Set([...Object.keys(firstHalfFreq), ...Object.keys(secondHalfFreq)]);

  allSymptoms.forEach(symptom => {
    const freq1 = firstHalfFreq[symptom] || 0;
    const freq2 = secondHalfFreq[symptom] || 0;
    const change = freq2 - freq1;
    const percentChange = freq1 > 0 ? (change / freq1 * 100) : 0;

    if (Math.abs(change) >= 3 || Math.abs(percentChange) >= 50) {
      const direction = change > 0 ? 'increasing' : 'decreasing';
      patterns.push({
        type: 'frequency_trend',
        symptom,
        description: `${formatSymptomName(symptom)} frequency is ${direction}`,
        confidence: Math.abs(change) >= 5 ? 'high' : 'medium',
        data: { change, direction, percentChange: percentChange.toFixed(0) }
      });
    }
  });

  return patterns;
}

/**
 * Find correlations between symptoms, energy, mood, etc.
 */
function findCorrelations(logs: SymptomLog[], journals: JournalEntry[]): Correlation[] {
  const correlations: Correlation[] = [];

  // 1. Symptom-Energy correlations
  const symptomEnergyCorr = analyzeSymptomEnergyCorrelation(logs);
  correlations.push(...symptomEnergyCorr);

  // 2. Symptom-Mood correlations (from journals)
  const symptomMoodCorr = analyzeSymptomMoodCorrelation(logs, journals);
  correlations.push(...symptomMoodCorr);

  // 3. Symptom-Symptom correlations
  const symptomSymptomCorr = analyzeSymptomSymptomCorrelation(logs);
  correlations.push(...symptomSymptomCorr);

  return correlations.filter(c => Math.abs(c.strength) >= 0.5 && c.sampleSize >= 5);
}

/**
 * Analyze correlation between symptoms and energy levels
 */
function analyzeSymptomEnergyCorrelation(logs: SymptomLog[]): Correlation[] {
  const correlations: Correlation[] = [];
  const logsWithEnergy = logs.filter(l => l.energy_level !== null && l.energy_level !== undefined);

  if (logsWithEnergy.length < 5) return correlations;

  // For each symptom, calculate correlation with energy
  const symptomData: Record<string, Array<{ symptom: number; energy: number }>> = {};

  logsWithEnergy.forEach(log => {
    Object.entries(log.symptoms).forEach(([symptom, severity]) => {
      if (!symptomData[symptom]) {
        symptomData[symptom] = [];
      }
      symptomData[symptom].push({
        symptom: severity as number,
        energy: log.energy_level as number
      });
    });
  });

  Object.entries(symptomData).forEach(([symptom, data]) => {
    if (data.length < 5) return;

    const correlation = calculateCorrelation(
      data.map(d => d.symptom),
      data.map(d => d.energy)
    );

    if (Math.abs(correlation) >= 0.5) {
      const direction = correlation < 0 ? 'lower' : 'higher';
      correlations.push({
        variable1: formatSymptomName(symptom),
        variable2: 'Energy Level',
        strength: correlation,
        description: `Higher ${formatSymptomName(symptom)} correlates with ${direction} energy`,
        sampleSize: data.length
      });
    }
  });

  return correlations;
}

/**
 * Analyze correlation between symptoms and mood (from journals)
 */
function analyzeSymptomMoodCorrelation(logs: SymptomLog[], journals: JournalEntry[]): Correlation[] {
  const correlations: Correlation[] = [];

  // Match symptom logs with journal entries by date
  const matchedData: Array<{ symptom: string; severity: number; mood: number }> = [];

  logs.forEach(log => {
    const journal = journals.find(j => j.entry_date === log.log_date);
    if (journal && journal.mood_rating) {
      Object.entries(log.symptoms).forEach(([symptom, severity]) => {
        matchedData.push({
          symptom,
          severity: severity as number,
          mood: journal.mood_rating as number
        });
      });
    }
  });

  if (matchedData.length < 5) return correlations;

  // Group by symptom
  const symptomData: Record<string, Array<{ severity: number; mood: number }>> = {};
  matchedData.forEach(d => {
    if (!symptomData[d.symptom]) {
      symptomData[d.symptom] = [];
    }
    symptomData[d.symptom].push({ severity: d.severity, mood: d.mood });
  });

  Object.entries(symptomData).forEach(([symptom, data]) => {
    if (data.length < 5) return;

    const correlation = calculateCorrelation(
      data.map(d => d.severity),
      data.map(d => d.mood)
    );

    if (Math.abs(correlation) >= 0.5) {
      const direction = correlation < 0 ? 'lower' : 'better';
      correlations.push({
        variable1: formatSymptomName(symptom),
        variable2: 'Mood',
        strength: correlation,
        description: `Higher ${formatSymptomName(symptom)} correlates with ${direction} mood`,
        sampleSize: data.length
      });
    }
  });

  return correlations;
}

/**
 * Analyze correlations between different symptoms
 */
function analyzeSymptomSymptomCorrelation(logs: SymptomLog[]): Correlation[] {
  const correlations: Correlation[] = [];

  // Get all unique symptoms
  const allSymptoms = new Set<string>();
  logs.forEach(log => {
    Object.keys(log.symptoms).forEach(s => allSymptoms.add(s));
  });

  const symptomArray = Array.from(allSymptoms);

  // Compare each pair of symptoms
  for (let i = 0; i < symptomArray.length; i++) {
    for (let j = i + 1; j < symptomArray.length; j++) {
      const symptom1 = symptomArray[i];
      const symptom2 = symptomArray[j];

      const pairedData: Array<{ s1: number; s2: number }> = [];

      logs.forEach(log => {
        const sev1 = log.symptoms[symptom1 as SymptomType];
        const sev2 = log.symptoms[symptom2 as SymptomType];
        if (sev1 !== undefined && sev2 !== undefined) {
          pairedData.push({ s1: sev1 as number, s2: sev2 as number });
        }
      });

      if (pairedData.length >= 5) {
        const correlation = calculateCorrelation(
          pairedData.map(d => d.s1),
          pairedData.map(d => d.s2)
        );

        if (Math.abs(correlation) >= 0.6) { // Higher threshold for symptom-symptom
          correlations.push({
            variable1: formatSymptomName(symptom1),
            variable2: formatSymptomName(symptom2),
            strength: correlation,
            description: `${formatSymptomName(symptom1)} and ${formatSymptomName(symptom2)} tend to occur together`,
            sampleSize: pairedData.length
          });
        }
      }
    }
  }

  return correlations;
}

/**
 * Generate data-driven recommendations
 */
function generateRecommendations(
  logs: SymptomLog[],
  journals: JournalEntry[],
  patterns: DetectedPattern[],
  correlations: Correlation[]
): DataDrivenRecommendation[] {
  const recommendations: DataDrivenRecommendation[] = [];

  // 1. Recommendations based on patterns
  patterns.forEach(pattern => {
    if (pattern.type === 'day_of_week' && pattern.confidence === 'high') {
      recommendations.push({
        category: 'awareness',
        priority: 'medium',
        title: `Prepare for ${pattern.data.peakDay}s`,
        description: `Your ${pattern.symptom} symptoms spike on ${pattern.data.peakDay}s. Plan self-care accordingly.`,
        evidence: `Data shows ${pattern.symptom} is worse on ${pattern.data.peakDay}s by an average of ${pattern.data.difference.toFixed(1)} points.`,
        action: `Schedule lighter activities on ${pattern.data.peakDay}s and prioritize rest.`
      });
    }

    if (pattern.type === 'severity_trend' && pattern.data.direction === 'worsening') {
      recommendations.push({
        category: 'medical',
        priority: 'high',
        title: `${formatSymptomName(pattern.symptom!)} is worsening`,
        description: `Your ${pattern.symptom} has increased ${pattern.data.changePercent}% recently.`,
        evidence: pattern.description,
        action: 'Consider discussing this trend with your healthcare provider.'
      });
    }

    if (pattern.type === 'severity_trend' && pattern.data.direction === 'improving') {
      recommendations.push({
        category: 'awareness',
        priority: 'low',
        title: `${formatSymptomName(pattern.symptom!)} is improving!`,
        description: `Your ${pattern.symptom} has decreased ${pattern.data.changePercent}%. Keep doing what you're doing!`,
        evidence: pattern.description,
        action: 'Reflect on what changes you\'ve made that might be helping.'
      });
    }
  });

  // 2. Recommendations based on correlations
  correlations.forEach(corr => {
    if (corr.variable2 === 'Energy Level' && corr.strength < -0.6) {
      recommendations.push({
        category: 'lifestyle',
        priority: 'high',
        title: `${corr.variable1} drains your energy`,
        description: `When ${corr.variable1} is high, your energy drops significantly.`,
        evidence: `Strong negative correlation detected (${corr.strength.toFixed(2)}) across ${corr.sampleSize} days.`,
        action: 'Prioritize rest and energy-conserving activities when experiencing this symptom.'
      });
    }

    if (corr.variable2 === 'Mood' && corr.strength < -0.6) {
      recommendations.push({
        category: 'awareness',
        priority: 'medium',
        title: `${corr.variable1} impacts your mood`,
        description: `Higher ${corr.variable1} strongly correlates with lower mood.`,
        evidence: `Correlation strength: ${corr.strength.toFixed(2)} across ${corr.sampleSize} entries.`,
        action: 'Practice extra self-compassion when this symptom flares.'
      });
    }
  });

  // 3. General tracking recommendations
  if (logs.length >= 21 && logs.length < 30) {
    recommendations.push({
      category: 'tracking',
      priority: 'low',
      title: 'Great tracking streak!',
      description: `You've tracked ${logs.length} days. A full 30 days will unlock even deeper insights.`,
      evidence: 'Consistent tracking enables better pattern detection.',
      action: 'Keep logging symptoms daily to maximize insights.'
    });
  }

  // 4. Journal integration recommendation
  const logsWithJournals = logs.filter(log =>
    journals.some(j => j.entry_date === log.log_date)
  );

  if (logs.length > 10 && logsWithJournals.length < logs.length * 0.5) {
    recommendations.push({
      category: 'tracking',
      priority: 'medium',
      title: 'Add journal entries for richer insights',
      description: 'Pairing symptom tracking with journaling helps identify emotional triggers.',
      evidence: `Only ${logsWithJournals.length} of ${logs.length} symptom logs have matching journal entries.`,
      action: 'Write a brief journal entry when you log symptoms.'
    });
  }

  // Sort by priority and limit
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return recommendations
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);
}

/**
 * Generate summary statistics
 */
function generateSummary(logs: SymptomLog[]): IntelligentInsights['summary'] {
  const symptomCounts: Record<string, number> = {};
  let totalSeverity = 0;
  let severityCount = 0;

  logs.forEach(log => {
    Object.entries(log.symptoms).forEach(([symptom, severity]) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      totalSeverity += severity as number;
      severityCount++;
    });
  });

  const mostFrequent = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)[0];

  // Determine overall trend
  let trendDirection: 'improving' | 'stable' | 'worsening' | 'insufficient_data' = 'insufficient_data';
  if (logs.length >= 14) {
    const midpoint = Math.floor(logs.length / 2);
    const firstHalf = logs.slice(0, midpoint);
    const secondHalf = logs.slice(midpoint);

    const avg1 = calculateAverageSeverity(firstHalf);
    const avg2 = calculateAverageSeverity(secondHalf);

    const difference = avg2 - avg1;
    if (Math.abs(difference) < 0.3) {
      trendDirection = 'stable';
    } else if (difference < 0) {
      trendDirection = 'improving';
    } else {
      trendDirection = 'worsening';
    }
  }

  return {
    totalDaysTracked: logs.length,
    mostFrequentSymptom: mostFrequent ? formatSymptomName(mostFrequent[0]) : null,
    averageSeverity: severityCount > 0 ? totalSeverity / severityCount : 0,
    trendDirection
  };
}

/**
 * Calculate average severity for a set of logs
 */
function calculateAverageSeverity(logs: SymptomLog[]): number {
  let total = 0;
  let count = 0;

  logs.forEach(log => {
    Object.values(log.symptoms).forEach(severity => {
      total += severity as number;
      count++;
    });
  });

  return count > 0 ? total / count : 0;
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n < 2) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate simple linear regression trend
 */
function calculateTrend(data: Array<{ date: Date; severity: number }>): { slope: number; intercept: number } {
  const n = data.length;
  const x = data.map((_, i) => i); // Use index as x (time)
  const y = data.map(d => d.severity);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
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
    'depression': 'Depression',
    'brain_fog': 'Brain fog',
    'memory_issues': 'Memory issues',
    'crying_spells': 'Crying spells',
    'feeling_overwhelmed': 'Feeling overwhelmed',
    'other': 'Other symptoms'
  };
  return labels[symptom] || symptom;
}
