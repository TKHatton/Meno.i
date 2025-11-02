/**
 * Main chat interface page
 * This is where users interact with MenoAI
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import SafetyModal from '@/components/safety/SafetyModal';

import { useAuth } from '@/components/auth/AuthProvider';
import { useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useUserMode } from '@/hooks/useUserMode';
import { getSelectedClasses } from '@/utils/colorScheme';
import type { ChatMode } from '@menoai/shared';

export default function ChatPage() {
  const router = useRouter();
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('woman');
  const { user } = useAuth();
  const { completed: onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const { mode: userMode } = useUserMode();

  // Redirect to onboarding if user hasn't completed it
  useEffect(() => {
    if (!onboardingLoading && user && !onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user, onboardingCompleted, onboardingLoading, router]);

  // Show loading state while checking onboarding status
  if (onboardingLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen mobile-full-height flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Chat Mode Selector */}
      <div className="hidden md:flex items-center justify-center gap-3 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border-b border-secondary-100 dark:border-neutral-700 px-6 py-4 shadow-elegant">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mr-2">I am a:</span>
        <button
          onClick={() => setChatMode('woman')}
          className={`px-6 py-2 text-sm font-medium rounded-pill transition-all ${
            chatMode === 'woman'
              ? 'bg-primary-400 text-white shadow-soft'
              : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-neutral-700'
          }`}
          aria-label="Chat mode for women"
        >
          Woman
        </button>
        <button
          onClick={() => setChatMode('man')}
          className={`px-6 py-2 text-sm font-medium rounded-pill transition-all ${
            chatMode === 'man'
              ? 'bg-primary-600 text-white shadow-soft'
              : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-neutral-700'
          }`}
          aria-label="Chat mode for men supporting their partners"
        >
          Man
        </button>
      </div>

      {/* Chat Interface */}
      <ChatInterface onSafetyTrigger={() => setShowSafetyModal(true)} chatMode={chatMode} />

      {/* Safety Modal */}
      {showSafetyModal && (
        <SafetyModal onClose={() => setShowSafetyModal(false)} />
      )}
    </div>
  );
}
