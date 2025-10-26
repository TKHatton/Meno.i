/**
 * Journal Page
 * Allows users to write journal entries and view their history
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useUserMode } from '@/hooks/useUserMode';
import { getColorScheme } from '@/utils/colorScheme';
import JournalEntryForm from '@/components/journal/JournalEntryForm';
import JournalList from '@/components/journal/JournalList';
import JournalStats from '@/components/journal/JournalStats';

export default function JournalPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const { mode: userMode } = useUserMode();
  const colorScheme = getColorScheme(userMode);
  const [activeView, setActiveView] = useState<'new' | 'entries' | 'stats'>('entries');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

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

  const handleEntrySaved = () => {
    // Refresh list and stats after saving an entry
    setRefreshTrigger(prev => prev + 1);
    setActiveView('entries');
    setEditingEntryId(null);
  };

  const handleEditEntry = (entryId: string) => {
    setEditingEntryId(entryId);
    setActiveView('new');
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setActiveView('entries');
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
    <main className={`min-h-screen ${colorScheme.backgroundGradient}`}>
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Journal
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Your private space to reflect and process
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveView('new');
                setEditingEntryId(null);
              }}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeView === 'new'
                  ? `${userMode === 'man' ? 'border-primary-700 text-primary-700' : 'border-primary-600 text-primary-600'}`
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              ✍️ New Entry
            </button>
            <button
              onClick={() => setActiveView('entries')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeView === 'entries'
                  ? `${userMode === 'man' ? 'border-primary-700 text-primary-700' : 'border-primary-600 text-primary-600'}`
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              📖 My Entries
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeView === 'stats'
                  ? `${userMode === 'man' ? 'border-primary-700 text-primary-700' : 'border-primary-600 text-primary-600'}`
                  : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              📊 Stats
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {activeView === 'new' && (
          <JournalEntryForm
            userId={user.id}
            editingEntryId={editingEntryId}
            onSaved={handleEntrySaved}
            onCancel={handleCancelEdit}
          />
        )}
        {activeView === 'entries' && (
          <JournalList
            userId={user.id}
            refreshTrigger={refreshTrigger}
            onEdit={handleEditEntry}
            onDelete={() => setRefreshTrigger(prev => prev + 1)}
          />
        )}
        {activeView === 'stats' && (
          <JournalStats userId={user.id} refreshTrigger={refreshTrigger} />
        )}
      </div>
    </main>
  );
}
