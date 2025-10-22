/**
 * Main chat interface page
 * This is where users interact with MenoAI
 */

'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import SafetyModal from '@/components/safety/SafetyModal';
import ProfileDropdown from '@/components/profile/ProfileDropdown';
import ProfileModal from '@/components/profile/ProfileModal';
import AccessibilityMenu from '@/components/accessibility/AccessibilityMenu';

import { useAuth } from '@/components/auth/AuthProvider';
import type { ChatMode } from '@menoai/shared';

export default function ChatPage() {
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('women');
  const { user } = useAuth();

  return (
    <main id="main-content" className="h-screen mobile-full-height flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-neutral-800 md:border-b border-neutral-200 dark:border-neutral-700 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between safe-area-top shadow-sm md:shadow-none">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo-square.jpg"
            alt="Meno.i Logo"
            className="h-10 w-10 md:h-8 md:w-auto object-contain rounded"
          />
          <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden sm:inline">Your compassionate companion</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Chat Mode Selector */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-0.5 md:p-1">
            <button
              onClick={() => setChatMode('women')}
              className={`px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${
                chatMode === 'women'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
              aria-label="Chat mode for women"
            >
              Women
            </button>
            <button
              onClick={() => setChatMode('partners')}
              className={`px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all ${
                chatMode === 'partners'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
              aria-label="Chat mode for partners"
            >
              Partners
            </button>
          </div>

          <AccessibilityMenu />
          {user ? (
            <ProfileDropdown onOpenProfile={() => setShowProfileModal(true)} />
          ) : (
            <a
              href="/"
              className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </a>
          )}
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface onSafetyTrigger={() => setShowSafetyModal(true)} chatMode={chatMode} />

      {/* Safety Modal */}
      {showSafetyModal && (
        <SafetyModal onClose={() => setShowSafetyModal(false)} />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </main>
  );
}
