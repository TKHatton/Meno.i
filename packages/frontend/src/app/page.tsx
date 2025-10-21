/**
 * Landing page for MenoAI
 * Simple welcome screen with call-to-action to start chatting
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import SignInModal from '@/components/auth/SignInModal';
import UserAvatar from '@/components/profile/UserAvatar';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  // Load custom avatar from profile
  useEffect(() => {
    if (!user) return;

    const loadCustomAvatar = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (data?.avatar_url) {
        setCustomAvatarUrl(data.avatar_url);
      }
    };

    loadCustomAvatar();
  }, [user]);

  // Get user data from metadata
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || null;
  const userEmail = user?.email || null;
  const googleAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  // Prioritize custom avatar over Google avatar
  const avatarUrl = customAvatarUrl || googleAvatarUrl;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img
            src="/images/logo.jpeg"
            alt="Meno.i Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        <p className="text-2xl text-neutral-700 mb-4">
          Your compassionate space for navigating menopause
        </p>

        <p className="text-lg text-neutral-600 mb-8 max-w-xl mx-auto">
          Whether you're dealing with hot flashes, brain fog, mood swings, or just feeling
          like a stranger in your own body, I'm here to listen without judgment.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/chat"
            className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg
                     hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Chatting
          </Link>

          {!user ? (
            <button
              onClick={() => setShowSignIn(true)}
              className="px-8 py-4 bg-white text-neutral-700 font-semibold rounded-lg
                       border-2 border-neutral-300 hover:border-neutral-400 transition-colors"
            >
              Sign In
            </button>
          ) : (
            <div className="flex flex-col gap-3 items-center">
              <div className="flex items-center gap-3">
                <UserAvatar
                  avatarUrl={avatarUrl}
                  name={userName}
                  email={userEmail}
                  size="md"
                />
                <div className="flex flex-col items-start">
                  <p className="text-neutral-900 font-medium">
                    Welcome back, {userName || userEmail?.split('@')[0]}!
                  </p>
                  {userName && (
                    <p className="text-sm text-neutral-500">{userEmail}</p>
                  )}
                </div>
              </div>
              <button
                onClick={signOut}
                className="text-sm text-neutral-500 hover:text-neutral-700 underline"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-neutral-500 mt-8">
          Free to use. Private and confidential. No judgment, just support.
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-neutral-900 mb-2">
              Emotionally Intelligent
            </h3>
            <p className="text-sm text-neutral-600">
              Using NVC and NLP principles to validate your feelings and help you reframe challenges
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-neutral-900 mb-2">
              Safe & Private
            </h3>
            <p className="text-sm text-neutral-600">
              GDPR compliant. Your conversations are private and deleted after 30 days
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-neutral-900 mb-2">
              Always Available
            </h3>
            <p className="text-sm text-neutral-600">
              24/7 support when you need someone to talk to, without appointments or waiting
            </p>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      {showSignIn && (
        <SignInModal onClose={() => setShowSignIn(false)} />
      )}
    </main>
  );
}
