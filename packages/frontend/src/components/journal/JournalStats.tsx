/**
 * Journal Stats Component
 * Displays journaling statistics and insights
 */

'use client';

import { useState, useEffect } from 'react';

interface JournalStatsProps {
  userId: string;
  refreshTrigger: number;
}

interface Stats {
  user_id: string;
  total_entries: number;
  entries_last_7_days: number;
  entries_last_30_days: number;
  avg_mood_rating?: number;
  last_entry_date?: string;
}

const MOOD_LABELS: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😔', label: 'Struggling', color: 'text-red-600 dark:text-red-400' },
  2: { emoji: '😐', label: 'Okay', color: 'text-yellow-600 dark:text-yellow-400' },
  3: { emoji: '🙂', label: 'Good', color: 'text-blue-600 dark:text-blue-400' },
  4: { emoji: '😊', label: 'Great', color: 'text-green-600 dark:text-green-400' },
};

export default function JournalStats({ userId, refreshTrigger }: JournalStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, [userId, refreshTrigger]);

  const loadStats = async () => {
    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/journal/stats/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Error loading journal stats:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMoodLabel = (avgMood: number) => {
    const rounded = Math.round(avgMood);
    return MOOD_LABELS[rounded] || { emoji: '🙂', label: 'Good', color: 'text-neutral-600' };
  };

  const getEncouragementMessage = () => {
    if (!stats || stats.total_entries === 0) {
      return "Start your journaling journey today! Regular journaling can help you process emotions and track your progress.";
    }
    if (stats.entries_last_7_days >= 5) {
      return "Incredible dedication! You're building a powerful habit that supports your wellbeing.";
    }
    if (stats.entries_last_7_days >= 3) {
      return "Great consistency! Keep it up - your future self will thank you for these reflections.";
    }
    if (stats.total_entries >= 10) {
      return "You've built a wonderful collection of reflections. Try to journal more regularly to maximize the benefits.";
    }
    return "Every entry is a step forward. Try to journal a few times this week to build momentum.";
  };

  const formatLastEntryDate = (dateString?: string) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return `${daysAgo} days ago`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

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

  return (
    <div className="space-y-6">
      {/* Main Stats Card */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
          Your Journaling Journey
        </h3>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg mb-4">
            {error}
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Entries */}
              <div className="p-4 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
                <div className="text-sm text-primary-700 dark:text-primary-300 mb-1">
                  Total Entries
                </div>
                <div className="text-3xl font-bold text-primary-900 dark:text-primary-100">
                  {stats.total_entries}
                </div>
                <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  All time
                </div>
              </div>

              {/* Last 7 Days */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                  This Week
                </div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {stats.entries_last_7_days}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Last 7 days
                </div>
              </div>

              {/* Last 30 Days */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">
                  This Month
                </div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.entries_last_30_days}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Last 30 days
                </div>
              </div>

              {/* Average Mood */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                  Average Mood
                </div>
                {stats.avg_mood_rating != null && typeof stats.avg_mood_rating === 'number' ? (
                  <>
                    <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                      {getMoodLabel(stats.avg_mood_rating).emoji} {stats.avg_mood_rating.toFixed(1)}/4
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {getMoodLabel(stats.avg_mood_rating).label}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      N/A
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      No mood data yet
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Last Entry */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Last Entry
                </div>
                <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatLastEntryDate(stats.last_entry_date)}
                </div>
              </div>
            </div>

            {/* Journaling Streak Visualization */}
            {stats.entries_last_7_days > 0 && (
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                  This Week's Activity
                </div>
                <div className="flex items-center gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-12 rounded ${
                        i < stats.entries_last_7_days
                          ? 'bg-primary-500'
                          : 'bg-neutral-200 dark:bg-neutral-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Mon</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Sun</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Encouragement Card */}
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4">
        <p className="text-sm text-primary-900 dark:text-primary-100">
          💡 {getEncouragementMessage()}
        </p>
      </div>

      {/* Benefits Card */}
      {stats && stats.total_entries > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Benefits of Regular Journaling
          </h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🧠</div>
              <div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  Emotional Processing
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Writing helps you understand and process complex emotions
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">📊</div>
              <div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  Pattern Recognition
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Track how different factors affect your wellbeing over time
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">💪</div>
              <div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  Stress Relief
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Expressing thoughts on paper can reduce anxiety and stress
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  Self-Awareness
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Gain deeper insights into your thoughts, triggers, and growth
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
