/**
 * Symptom Tracker Page
 * Allows users to log daily symptoms and view their history
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useUserMode } from '@/hooks/useUserMode';
import { getColorScheme } from '@/utils/colorScheme';
import DailyCheckIn from '@/components/symptoms/DailyCheckIn';
import SymptomHistory from '@/components/symptoms/SymptomHistory';
import SymptomStats from '@/components/symptoms/SymptomStats';

export default function TrackPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const { mode: userMode } = useUserMode();
  const colorScheme = getColorScheme(userMode);
  const [activeView, setActiveView] = useState<'checkin' | 'history' | 'stats'>('checkin');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!onboardingLoading && user && !onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user, onboardingCompleted, onboardingLoading, router]);

  const handleCheckInSaved = () => {
    // Refresh history and stats after saving a check-in
    setRefreshTrigger(prev => prev + 1);
    setActiveView('history');
  };

  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${userMode === 'man' ? 'border-primary-700' : 'border-primary-600'} mx-auto`}></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border-b border-secondary-100 dark:border-neutral-700 px-6 py-6 shadow-elegant">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-neutral-900 dark:text-neutral-100">
              Symptom Tracker
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 font-light">
              Track your daily symptoms and spot patterns
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-neutral-800 border-b border-secondary-100 dark:border-neutral-700">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveView('checkin')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                activeView === 'checkin'
                  ? 'border-primary-400 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              Today's Check-In
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                activeView === 'history'
                  ? 'border-primary-400 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                activeView === 'stats'
                  ? 'border-primary-400 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400'
              }`}
            >
              Stats
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-6 py-10 pb-24 md:pb-10">
        {activeView === 'checkin' && (
          <DailyCheckIn userId={user.id} onSaved={handleCheckInSaved} />
        )}
        {activeView === 'history' && (
          <SymptomHistory userId={user.id} refreshTrigger={refreshTrigger} />
        )}
        {activeView === 'stats' && (
          <SymptomStats userId={user.id} refreshTrigger={refreshTrigger} />
        )}
      </div>
    </main>
  );
}
