/**
 * Enhanced Profile Page
 * User profile, settings, and account management with full functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import DeleteAccountModal from '@/components/profile/DeleteAccountModal';
import UpdateJourneyModal from '@/components/profile/UpdateJourneyModal';

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  menopause_stage: string | null;
  primary_concerns: string[] | null;
}

interface UserPreferences {
  email_daily_reminders: boolean;
  email_weekly_summary: boolean;
  share_data_research: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_daily_reminders: false,
    email_weekly_summary: false,
    share_data_research: false,
  });

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showUpdateJourney, setShowUpdateJourney] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Load profile and preferences
  useEffect(() => {
    if (user) {
      loadProfile();
      loadPreferences();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/profile/${user.id}`);

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/profile/${user.id}/preferences`);

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences || preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/profile/${user.id}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        alert('Preferences saved successfully!');
      } else {
        throw new Error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    if (!confirm('This will download all your data in JSON format. Continue?')) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/profile/${user.id}/export`);

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meno-ai-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.display_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'Recently';

  const getStageLabel = (stage: string | null | undefined) => {
    if (!stage) return 'Not specified';
    return stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ');
  };

  const getConcernsLabel = (concerns: string[] | null | undefined) => {
    if (!concerns || concerns.length === 0) return 'None specified';
    return concerns.map(c => c.replace('_', ' ')).join(', ');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-20 h-20">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {displayName}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Member since {memberSince}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowEditProfile(true)}
              className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Edit Profile
            </button>
          </div>

          {/* Your Journey */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Your Journey
            </h3>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Menopause Stage</p>
                <p className="text-neutral-900 dark:text-neutral-100">{getStageLabel(profile?.menopause_stage)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Primary Concerns</p>
                <p className="text-neutral-900 dark:text-neutral-100">{getConcernsLabel(profile?.primary_concerns)}</p>
              </div>
            </div>

            <button
              onClick={() => setShowUpdateJourney(true)}
              className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              Update Journey Info
            </button>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Account
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Email</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.email}</p>
                </div>
                <span className="text-green-600 dark:text-green-400 text-sm">✓ Verified</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Password</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">••••••••</p>
                </div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="py-3">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Sign-in methods
                </p>
                <div className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {user.app_metadata?.provider === 'google' && <span>• Google ✓</span>}
                  {user.app_metadata?.provider === 'email' && <span>• Email ✓</span>}
                  {user.app_metadata?.provider === 'apple' && <span>• Apple ✓</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Preferences
            </h3>

            <div className="space-y-3 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_daily_reminders}
                  onChange={(e) => setPreferences({ ...preferences, email_daily_reminders: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Email me daily reminders to log symptoms
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_weekly_summary}
                  onChange={(e) => setPreferences({ ...preferences, email_weekly_summary: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Email me weekly summary
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.share_data_research}
                  onChange={(e) => setPreferences({ ...preferences, share_data_research: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Share my data for research (anonymous)
                </span>
              </label>
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Save Preferences
            </button>
          </div>

          {/* Data & Privacy */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Data & Privacy
            </h3>

            <div className="space-y-3 mb-4">
              <button
                onClick={handleExportData}
                className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export My Data
              </button>

              <button
                onClick={() => setShowDeleteAccount(true)}
                className="w-full px-4 py-2 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete My Account
              </button>
            </div>

            <div className="flex gap-4 text-sm">
              <a href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                Privacy Policy
              </a>
              <a href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                Terms of Service
              </a>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Modals */}
      {showEditProfile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditProfile(false)}
          onSave={loadProfile}
        />
      )}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
        />
      )}
      {showDeleteAccount && (
        <DeleteAccountModal
          onClose={() => setShowDeleteAccount(false)}
        />
      )}
      {showUpdateJourney && (
        <UpdateJourneyModal
          profile={profile}
          onClose={() => setShowUpdateJourney(false)}
          onSave={loadProfile}
        />
      )}
    </main>
  );
}
