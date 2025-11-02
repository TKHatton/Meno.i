/**
 * Individual message bubble component
 * Styled differently for user vs AI messages
 */

'use client';

import { useState, useEffect } from 'react';
import { textToSpeech } from '@/lib/textToSpeech';

interface MessageBubbleProps {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check if mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format timestamp only on client-side to avoid hydration mismatch
  useEffect(() => {
    setFormattedTime(timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [timestamp]);

  const handlePlayVoice = () => {
    if (isSpeaking) {
      textToSpeech.cancel();
      setIsSpeaking(false);
    } else {
      const voice = textToSpeech.getCompassionateVoice();

      textToSpeech.speak(content, {
        voice: voice?.name,
        rate: 0.95, // Slightly slower for compassionate tone
        pitch: 1.0,
        volume: 1.0,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} fade-in`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div className="relative">
          <div
            className={`rounded-2xl px-6 py-4 shadow-soft ${
              isUser
                ? 'bg-primary-400 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border border-secondary-100 dark:border-neutral-700'
            }`}
          >
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>

          {/* Voice Playback Button (only for AI messages) - Only render on client */}
          {isMounted && !isUser && textToSpeech.supported && (
            <button
              onClick={handlePlayVoice}
              className={`mt-3 p-2.5 rounded-xl shadow-soft
                       transition-all hover:scale-105
                       ${isSpeaking
                         ? 'bg-primary-400 text-white shadow-soft-lg'
                         : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-secondary-100 dark:border-neutral-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 hover:border-primary-400'
                       }`}
              aria-label={isSpeaking ? 'Stop speaking' : 'Read message aloud'}
              title={isSpeaking ? 'Stop speaking' : 'Read message aloud'}
            >
              {isSpeaking ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <p className={`text-xs text-neutral-500 dark:text-neutral-400 mt-2 px-3 ${isUser ? 'text-right' : 'text-left'}`}>
            {formattedTime}
          </p>
        )}
      </div>
    </div>
  );
}
