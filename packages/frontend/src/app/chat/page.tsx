/**
 * Main chat interface page
 * This is where users interact with MenoAI
 */

'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import SafetyModal from '@/components/safety/SafetyModal';

export default function ChatPage() {
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  return (
    <main className="h-screen flex flex-col bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">MenoAI</h1>
          <span className="text-sm text-neutral-500">Your compassionate companion</span>
        </div>

        <button className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
          History
        </button>
      </header>

      {/* Chat Interface */}
      <ChatInterface onSafetyTrigger={() => setShowSafetyModal(true)} />

      {/* Safety Modal */}
      {showSafetyModal && (
        <SafetyModal onClose={() => setShowSafetyModal(false)} />
      )}
    </main>
  );
}
