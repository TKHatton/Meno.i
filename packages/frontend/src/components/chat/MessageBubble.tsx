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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div className="relative group">
          <div
            className={`rounded-2xl px-5 py-3 ${
              isUser
                ? 'bg-primary-600 text-white'
                : 'bg-white text-neutral-900 border border-neutral-200'
            }`}
          >
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>

          {/* Voice Playback Button (only for AI messages) - Only render on client */}
          {isMounted && !isUser && textToSpeech.supported && (
            <button
              onClick={handlePlayVoice}
              className={`absolute -left-10 top-1/2 -translate-y-1/2 p-2 rounded-full
                       transition-all opacity-0 group-hover:opacity-100
                       ${isSpeaking
                         ? 'bg-primary-600 text-white'
                         : 'bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-600'
                       }`}
              aria-label={isSpeaking ? 'Stop speaking' : 'Read message aloud'}
              title={isSpeaking ? 'Stop speaking' : 'Read message aloud'}
            >
              {isSpeaking ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828 2.828a9 9 0 0012.728-12.728" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <p className={`text-xs text-neutral-500 mt-1 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
            {formattedTime}
          </p>
        )}
      </div>
    </div>
  );
}
