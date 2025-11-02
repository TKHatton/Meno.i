/**
 * Symptom History Component
 * Displays past symptom logs with a 7-day summary
 */

'use client';

import { useState, useEffect } from 'react';

interface SymptomHistoryProps {
  userId: string;
  refreshTrigger: number;
}

interface SymptomLog {
  id: string;
  user_id: string;
  log_date: string;
  symptoms: Record<string, number>;
  energy_level?: number;
  notes?: string;
  created_at: string;
}

export default function SymptomHistory({ userId, refreshTrigger }: SymptomHistoryProps) {
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      setError('');

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(
          `${API_URL}/api/symptoms/history/${userId}?days=${days}`
        );

        if (!response.ok) {
          throw new Error('Failed to load history');
        }

        const data = await response.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error('Error loading symptom history:', err);
        setError('Failed to load history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, [userId, days, refreshTrigger]);

  // Calculate most frequent symptoms
  const getMostFrequent = () => {
    const symptomCounts: Record<string, number> = {};

    logs.forEach((log) => {
      Object.keys(log.symptoms).forEach((symptom) => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    return Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symptom, count]) => ({
        symptom: symptom.replace(/_/g, ' '),
        count,
      }));
  };

  const mostFrequent = logs.length > 0 ? getMostFrequent() : [];

  if (isLoading) {
    return (
      <div className="card-elegant p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Most Frequent Symptoms Card */}
      {mostFrequent.length > 0 && (
        <div className="card-elegant p-8">
          <h3 className="text-2xl font-serif text-neutral-900 dark:text-neutral-100 mb-6">
            Most Frequent Symptoms (Last {days} Days)
          </h3>
          <div className="space-y-3">
            {mostFrequent.map((item, index) => (
              <div key={item.symptom} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {index === 0 ? '🔥' : index === 1 ? '😰' : '😴'}
                  </span>
                  <span className="text-neutral-900 dark:text-neutral-100 capitalize">
                    {item.symptom}
                  </span>
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {item.count} {item.count === 1 ? 'day' : 'days'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Days Filter */}
      <div className="card-elegant p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h3 className="text-xl sm:text-2xl font-serif text-neutral-900 dark:text-neutral-100">
            Your Symptom Logs
          </h3>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 text-sm border-2 border-secondary-100 dark:border-neutral-700 rounded-xl
                     bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100
                     focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg mb-4">
            {error}
          </div>
        )}

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              No symptom logs yet for the selected period
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Start tracking your symptoms to see your history here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Individual log card
interface LogCardProps {
  log: SymptomLog;
}

function LogCard({ log }: LogCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(log.log_date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const symptomCount = Object.keys(log.symptoms).length;

  return (
    <div className="border border-secondary-100 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-soft hover:shadow-soft-lg transition-all">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-secondary-50 dark:hover:bg-neutral-700/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-left">
            <div className="font-medium text-neutral-900 dark:text-neutral-100">
              {formattedDate}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {symptomCount} {symptomCount === 1 ? 'symptom' : 'symptoms'} logged
              {log.energy_level && ` • Energy: ${log.energy_level}/5`}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-neutral-400 transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-700/30 border-t border-neutral-200 dark:border-neutral-700">
          <div className="space-y-3">
            {Object.entries(log.symptoms).map(([symptom, severity]) => (
              <div key={symptom} className="flex items-center justify-between">
                <span className="text-sm text-neutral-900 dark:text-neutral-100 capitalize">
                  {symptom.replace(/_/g, ' ')}
                </span>
                <div className="flex gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${
                        level <= severity
                          ? 'bg-primary-400'
                          : 'bg-neutral-200 dark:bg-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}

            {log.notes && (
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-600">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">
                  "{log.notes}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
