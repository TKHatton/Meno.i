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
    <main id="main-content" className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/images/logo.jpeg"
            alt="Meno.i Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="text-sm text-neutral-500 dark:text-neutral-400 hidden sm:inline">Your compassionate companion</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Chat Mode Selector */}
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
            <button
              onClick={() => setChatMode('women')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                chatMode === 'women'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
              aria-label="Chat mode for women"
            >
              For Women
            </button>
            <button
              onClick={() => setChatMode('partners')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                chatMode === 'partners'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              }`}
              aria-label="Chat mode for partners"
            >
              For Partners
            </button>
          </div>

          <AccessibilityMenu />
          {user ? (
            <ProfileDropdown onOpenProfile={() => setShowProfileModal(true)} />
          ) : (
            <a
              href="/"
              className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
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
