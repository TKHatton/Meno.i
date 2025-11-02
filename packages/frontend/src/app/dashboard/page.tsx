/**
 * Dashboard Page
 * Main home screen with daily message, quick actions, and week summary
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useUserMode } from '@/hooks/useUserMode';
import { getColorScheme } from '@/utils/colorScheme';
import DailyMessageEnhanced from '@/components/motivation/DailyMessageEnhanced';
import { getUserProfile } from '@/lib/api';
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
  const { mode: userMode } = useUserMode();
  const colorScheme = getColorScheme(userMode);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [displayName, setDisplayName] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch user profile and insights
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchInsights();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile(user!.id);
      if (response.profile?.display_name) {
        setDisplayName(response.profile.display_name);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

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
      <div className={`min-h-screen flex items-center justify-center ${colorScheme.backgroundGradient}`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${userMode === 'man' ? 'border-primary-700' : 'border-primary-600'} mx-auto`}></div>
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
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-6 py-10 max-w-5xl pb-24 md:pb-10">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-serif text-neutral-900 dark:text-neutral-100 mb-3">
            Welcome back{displayName ? `, ${displayName}` : ''}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light">
            {dayName}, {monthDay}
          </p>
        </div>

        <div className="space-y-6">
          {/* Daily Message Card */}
          <DailyMessageEnhanced userJoinDate={userJoinDate} />

          {/* AI Insights Section */}
          {!loadingInsights && insights.length > 0 && (
            <div className="card-elegant p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-serif text-neutral-900 dark:text-neutral-100">
                  Your Insights
                </h2>
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400 px-4 py-2 bg-secondary-100 dark:bg-neutral-700 rounded-pill">
                  AI-powered
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-white dark:bg-neutral-800 border border-secondary-100 dark:border-neutral-700 shadow-soft hover:shadow-soft-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{insight.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg text-neutral-900 dark:text-neutral-100 mb-2">
                          {insight.title}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {insight.description}
                        </p>
                        {insight.actionable && insight.action && (
                          <button className="mt-3 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1">
                            {insight.action}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
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
          <div className="card-elegant p-10">
            <h2 className="text-3xl font-serif text-neutral-900 dark:text-neutral-100 mb-8">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Log Symptoms */}
              <Link
                href="/track"
                className="group relative overflow-hidden bg-white dark:bg-neutral-800 border border-secondary-100 dark:border-neutral-700
                         rounded-2xl p-6 transition-all hover:shadow-soft-lg hover:border-primary-400"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary-400 rounded-2xl flex items-center justify-center shadow-soft
                                group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-2">
                      Log Symptoms
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Track how you're feeling today
                    </p>
                  </div>
                </div>
              </Link>

              {/* Write Journal Entry */}
              <Link
                href="/journal"
                className="group relative overflow-hidden bg-white dark:bg-neutral-800 border border-secondary-100 dark:border-neutral-700
                         rounded-2xl p-6 transition-all hover:shadow-soft-lg hover:border-primary-400"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-16 h-16 bg-secondary-400 rounded-2xl flex items-center justify-center shadow-soft
                                group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-2">
                      Write Journal
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Process your thoughts and feelings
                    </p>
                  </div>
                </div>
              </Link>

              {/* Chat with MenoAI */}
              <Link
                href="/chat"
                className="group relative overflow-hidden bg-white dark:bg-neutral-800 border border-secondary-100 dark:border-neutral-700
                         rounded-2xl p-6 transition-all hover:shadow-soft-lg hover:border-primary-400"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-soft
                                group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-2">
                      Chat with AI
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Get personalized support anytime
                    </p>
                  </div>
                </div>
              </Link>

              {/* View Stats */}
              <Link
                href="/track?tab=stats"
                className="group relative overflow-hidden bg-white dark:bg-neutral-800 border border-secondary-100 dark:border-neutral-700
                         rounded-2xl p-6 transition-all hover:shadow-soft-lg hover:border-primary-400"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-16 h-16 bg-secondary-600 rounded-2xl flex items-center justify-center shadow-soft
                                group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-2">
                      View Stats
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Track your progress and patterns
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Encouragement Card */}
          <div className="card-elegant p-8 bg-secondary-100 dark:bg-neutral-800 border-2 border-primary-200 dark:border-primary-800">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-14 h-14 bg-primary-400 rounded-2xl flex items-center justify-center shadow-soft">
                <span className="text-3xl">✨</span>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-2xl text-neutral-900 dark:text-neutral-100 mb-3">
                  Your Journey Matters
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Every entry you log, every journal you write, and every day you show up
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
