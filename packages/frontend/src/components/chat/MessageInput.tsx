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
    <div className="flex items-end gap-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Share what's on your mind..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-neutral-300 dark:border-neutral-600 px-4 py-3
                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                 disabled:bg-neutral-100 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed
                 max-h-32 overflow-y-auto bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
        style={{ minHeight: '48px' }}
      />

      <button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl
                 hover:bg-primary-700 transition-colors
                 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed
                 whitespace-nowrap"
      >
        Send
      </button>
    </div>
  );
}
