/**
 * Landing page for MenoAI
 * Simple welcome screen with call-to-action to start chatting
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import SignInModal from '@/components/auth/SignInModal';

export default function Home() {
  const [showSignIn, setShowSignIn] = useState(false);
  const { user } = useAuth();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-neutral-50">
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">
          MenoAI
        </h1>

        <p className="text-2xl text-neutral-700 mb-4">
          Your compassionate space for navigating menopause
        </p>

        <p className="text-lg text-neutral-600 mb-8 max-w-xl mx-auto">
          Whether you're dealing with hot flashes, brain fog, mood swings, or just feeling
          like a stranger in your own body—I'm here to listen without judgment.
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
            <p className="text-neutral-600">
              Welcome back, {user.email}!
            </p>
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
