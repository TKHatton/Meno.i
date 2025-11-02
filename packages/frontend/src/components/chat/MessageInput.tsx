/**
 * Message input component
 * Text input with send button
 */

'use client';

import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-4">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Share what's on your mind..."
          disabled={disabled}
          rows={1}
          className="w-full resize-none rounded-2xl border-2 border-secondary-100 dark:border-neutral-600 px-5 py-4
                   focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                   disabled:bg-neutral-100 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed
                   max-h-32 overflow-y-auto bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                   shadow-soft transition-all hover:border-primary-200 dark:hover:border-neutral-500"
          style={{ minHeight: '56px' }}
        />
        <div className="absolute right-4 bottom-4 text-xs text-neutral-400 dark:text-neutral-500 pointer-events-none">
          {message.length > 0 && <span>Press Enter to send</span>}
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="px-8 py-4 bg-primary-400 text-white font-semibold rounded-2xl
                 hover:bg-primary-600 transition-all shadow-soft hover:shadow-soft-lg
                 disabled:bg-neutral-200 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50
                 whitespace-nowrap flex items-center gap-2 group"
        style={{ minHeight: '56px' }}
      >
        <span>Send</span>
        <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
