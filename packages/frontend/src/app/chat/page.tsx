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

import { useAuth } from '@/components/auth/AuthProvider';

export default function ChatPage() {
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user } = useAuth();

  return (
    <main className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/images/logo.jpeg"
            alt="Meno.i Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="text-sm text-neutral-500 hidden sm:inline">Your compassionate companion</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <ProfileDropdown onOpenProfile={() => setShowProfileModal(true)} />
          ) : (
            <a
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Sign In
            </a>
          )}
        </div>
      </header>

      {/* Chat Interface */}
      <ChatInterface onSafetyTrigger={() => setShowSafetyModal(true)} />

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
