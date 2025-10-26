/**
 * Profile Page
 * User profile, settings, and account management
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
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

  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'Recently';

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
              <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {displayName.charAt(0).toUpperCase()}
                </span>
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

            <button className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
              Edit Profile
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
                <button className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
                  Change
                </button>
              </div>

              <div className="py-3">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Sign-in methods
                </p>
                <div className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {user.app_metadata?.provider === 'google' && <span>• Google ✓</span>}
                  {user.app_metadata?.provider === 'email' && <span>• Email ✓</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Preferences
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Email me daily reminders to log symptoms
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Email me weekly summary
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Share my data for research (anonymous)
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-primary-600 focus:ring-primary-500"
                />
              </label>
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
              Save Preferences
            </button>
          </div>

          {/* Data & Privacy */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Data & Privacy
            </h3>

            <div className="space-y-3">
              <button className="w-full px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left">
                Export My Data
              </button>

              <button className="w-full px-4 py-2 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                Delete My Account
              </button>
            </div>

            <div className="flex gap-4 mt-4 text-sm">
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
    </main>
  );
}
