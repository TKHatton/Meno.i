/**
 * Dashboard Page
 * Main home screen with daily message, quick actions, and week summary
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import DailyMessageEnhanced from '@/components/motivation/DailyMessageEnhanced';
import Link from 'next/link';

interface Insight {
  type: 'pattern' | 'trend' | 'recommendation' | 'celebration';
  title: string;
  description: string;
  icon: string;
  actionable?: boolean;
  action?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch insights
  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  const fetchInsights = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/insights/${user!.id}`);

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get current date info
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Use user creation date as join date (or get from profile if available)
  const userJoinDate = user.created_at ? new Date(user.created_at) : new Date();

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Welcome back! ☀️
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {dayName}, {monthDay}
          </p>
        </div>

        <div className="space-y-6">
          {/* Daily Message Card */}
          <DailyMessageEnhanced userJoinDate={userJoinDate} />

          {/* AI Insights Section */}
          {!loadingInsights && insights.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  ✨ Your Insights
                </h2>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  AI-powered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      insight.type === 'celebration'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : insight.type === 'pattern'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                        : insight.type === 'trend'
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                        : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold mb-1 ${
                          insight.type === 'celebration'
                            ? 'text-green-900 dark:text-green-100'
                            : insight.type === 'pattern'
                            ? 'text-blue-900 dark:text-blue-100'
                            : insight.type === 'trend'
                            ? 'text-purple-900 dark:text-purple-100'
                            : 'text-primary-900 dark:text-primary-100'
                        }`}>
                          {insight.title}
                        </h3>
                        <p className={`text-sm ${
                          insight.type === 'celebration'
                            ? 'text-green-700 dark:text-green-300'
                            : insight.type === 'pattern'
                            ? 'text-blue-700 dark:text-blue-300'
                            : insight.type === 'trend'
                            ? 'text-purple-700 dark:text-purple-300'
                            : 'text-primary-700 dark:text-primary-300'
                        }`}>
                          {insight.description}
                        </p>
                        {insight.actionable && insight.action && (
                          <button className={`mt-2 text-sm font-medium underline ${
                            insight.type === 'celebration'
                              ? 'text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100'
                              : insight.type === 'pattern'
                              ? 'text-blue-800 dark:text-blue-200 hover:text-blue-900 dark:hover:text-blue-100'
                              : insight.type === 'trend'
                              ? 'text-purple-800 dark:text-purple-200 hover:text-purple-900 dark:hover:text-purple-100'
                              : 'text-primary-800 dark:text-primary-200 hover:text-primary-900 dark:hover:text-primary-100'
                          }`}>
                            {insight.action} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Log Symptoms */}
              <Link
                href="/track"
                className="flex items-center gap-4 p-4 border-2 border-neutral-200 dark:border-neutral-700
                         rounded-lg hover:border-primary-500 dark:hover:border-primary-500
                         hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full
                              flex items-center justify-center group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Log Today's Symptoms
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Track how you're feeling today
                  </p>
                </div>
              </Link>

              {/* Write Journal Entry */}
              <Link
                href="/journal"
                className="flex items-center gap-4 p-4 border-2 border-neutral-200 dark:border-neutral-700
                         rounded-lg hover:border-primary-500 dark:hover:border-primary-500
                         hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full
                              flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Write Journal Entry
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Process your thoughts and feelings
                  </p>
                </div>
              </Link>

              {/* Chat with MenoAI */}
              <Link
                href="/chat"
                className="flex items-center gap-4 p-4 border-2 border-neutral-200 dark:border-neutral-700
                         rounded-lg hover:border-primary-500 dark:hover:border-primary-500
                         hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full
                              flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Chat with MenoAI
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Get support and answers
                  </p>
                </div>
              </Link>

              {/* View Stats */}
              <Link
                href="/journal?tab=stats"
                className="flex items-center gap-4 p-4 border-2 border-neutral-200 dark:border-neutral-700
                         rounded-lg hover:border-primary-500 dark:hover:border-primary-500
                         hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full
                              flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    View Your Stats
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    See your progress and patterns
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Tips & Encouragement */}
          <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-primary-200 dark:border-primary-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-2xl">💡</div>
              <div>
                <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                  Your Journey Matters
                </h3>
                <p className="text-sm text-primary-800 dark:text-primary-200">
                  Remember: Every entry you log, every journal you write, and every day you show up
                  is helping you understand your body better. You're doing amazing work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
