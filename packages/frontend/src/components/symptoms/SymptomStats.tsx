/**
 * Symptom Stats Component
 * Displays tracking statistics and insights
 */

'use client';

import { useState, useEffect } from 'react';

interface SymptomStatsProps {
  userId: string;
  refreshTrigger: number;
}

interface Stats {
  user_id: string;
  period: 'week' | 'month';
  total_days_logged: number;
  most_frequent_symptoms: Array<{
    symptom: string;
    count: number;
    avg_severity: number;
  }>;
  avg_energy_level: number;
  logs_in_period: number;
}

export default function SymptomStats({ userId, refreshTrigger }: SymptomStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'week' | 'month'>('month');

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      setError('');

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(
          `${API_URL}/api/symptoms/stats/${userId}?period=${period}`
        );

        if (!response.ok) {
          throw new Error('Failed to load stats');
        }

        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        console.error('Error loading symptom stats:', err);
        setError('Failed to load statistics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [userId, period, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading stats...</p>
        </div>
      </div>
    );
  }

  const totalDays = period === 'week' ? 7 : 30;
  const percentageLogged = stats
    ? Math.round((stats.total_days_logged / totalDays) * 100)
    : 0;

  const getEncouragementMessage = () => {
    if (!stats || stats.total_days_logged === 0) {
      return "Start tracking your symptoms to spot patterns and understand your journey better.";
    }
    if (percentageLogged >= 80) {
      return "Amazing consistency! Your detailed tracking will help you identify patterns.";
    }
    if (percentageLogged >= 50) {
      return "Great job! Keep tracking to build a clearer picture of your symptoms.";
    }
    return "Every log helps! Try to track more days to identify meaningful patterns.";
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Your Tracking Stats
          </h3>
          <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                period === 'week'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                period === 'month'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg mb-4">
            {error}
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            {/* Days Logged */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Days Logged This {period === 'week' ? 'Week' : 'Month'}
                </span>
                <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.total_days_logged}/{totalDays}
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-600 to-primary-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${percentageLogged}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {percentageLogged}% completion
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Most Common Symptom */}
              {stats.most_frequent_symptoms.length > 0 && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                    Most Common
                  </div>
                  <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
                    🔥 {stats.most_frequent_symptoms[0].symptom.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {stats.most_frequent_symptoms[0].count}{' '}
                    {stats.most_frequent_symptoms[0].count === 1 ? 'day' : 'days'}
                  </div>
                </div>
              )}

              {/* Average Energy */}
              <div className="p-4 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg">
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  Avg Energy Level
                </div>
                <div className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  😊 {stats.avg_energy_level > 0 ? stats.avg_energy_level.toFixed(1) : 'N/A'}/5
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {stats.avg_energy_level >= 4
                    ? 'High energy'
                    : stats.avg_energy_level >= 3
                    ? 'Moderate energy'
                    : stats.avg_energy_level > 0
                    ? 'Low energy'
                    : 'No data'}
                </div>
              </div>
            </div>

            {/* Top Symptoms List */}
            {stats.most_frequent_symptoms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Top Symptoms This {period === 'week' ? 'Week' : 'Month'}
                </h4>
                <div className="space-y-2">
                  {stats.most_frequent_symptoms.slice(0, 5).map((symptom, index) => (
                    <div
                      key={symptom.symptom}
                      className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                          #{index + 1}
                        </span>
                        <span className="text-neutral-900 dark:text-neutral-100 capitalize">
                          {symptom.symptom.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {symptom.count} {symptom.count === 1 ? 'day' : 'days'}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Avg severity: {symptom.avg_severity.toFixed(1)}/5
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Encouragement Message */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <p className="text-sm text-primary-900 dark:text-primary-100">
                💡 {getEncouragementMessage()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
