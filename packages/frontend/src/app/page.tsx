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
import Footer from '@/components/common/Footer';
import AccessibilityMenu from '@/components/accessibility/AccessibilityMenu';
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
    <main id="main-content" className="min-h-screen flex flex-col bg-gradient-to-br from-secondary-100 via-neutral-50 to-primary-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Header with Accessibility Menu */}
      <div className="absolute top-4 right-4 z-50">
        <AccessibilityMenu />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center fade-in">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/images/logo.png"
            alt="Meno.i Logo"
            className="h-24 w-auto object-contain"
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 dark:text-neutral-50 mb-6 leading-tight">
          Your Compassionate <br className="hidden md:block" />
          Menopause Companion
        </h1>

        <p className="text-lg md:text-xl text-neutral-700 dark:text-neutral-200 mb-4 font-light">
          First AI-powered perimenopause & menopause care with brains & balance
        </p>

        <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-300 mb-10 max-w-xl mx-auto font-light">
          Tracks your symptoms, not your patience. NLP & NVC coaching to keep the peace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          {!user ? (
            <button
              onClick={() => setShowSignIn(true)}
              className="px-10 py-4 bg-primary-400 text-neutral-800 font-semibold rounded-pill
                       hover:bg-primary-600 hover:text-white transition-all shadow-soft hover:shadow-soft-lg
                       transform hover:scale-105"
            >
              Sign In to Get Started
            </button>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="px-10 py-4 bg-primary-400 text-neutral-800 font-semibold rounded-pill
                         hover:bg-primary-600 hover:text-white transition-all shadow-soft hover:shadow-soft-lg
                         transform hover:scale-105 inline-block"
              >
                Go to Dashboard
              </Link>
              <div className="flex flex-col gap-3 items-center mt-4">
                <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 px-6 py-3 rounded-2xl shadow-soft">
                  <UserAvatar
                    avatarUrl={avatarUrl}
                    name={userName}
                    email={userEmail}
                    size="md"
                  />
                  <div className="flex flex-col items-start">
                    <p className="text-neutral-900 dark:text-neutral-100 font-medium">
                      Welcome back, {userName || userEmail?.split('@')[0]}!
                    </p>
                    {userName && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{userEmail}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>

        <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm rounded-pill">
          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
            Free to use • Private & confidential • No judgment, just support
          </p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="card-elegant p-8 slide-up">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-3">
              Emotionally Intelligent
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Using NVC and NLP principles to validate your feelings and help you reframe challenges
            </p>
          </div>

          <div className="card-elegant p-8 slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-3">
              Safe & Private
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              GDPR compliant. Your conversations are private and deleted after 30 days
            </p>
          </div>

          <div className="card-elegant p-8 slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-serif text-xl text-neutral-900 dark:text-neutral-100 mb-3">
              Always Available
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              24/7 support when you need someone to talk to, without appointments or waiting
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Sign In Modal */}
      {showSignIn && (
        <SignInModal onClose={() => setShowSignIn(false)} />
      )}

      {/* Footer */}
      <Footer />
    </main>
  );
}
