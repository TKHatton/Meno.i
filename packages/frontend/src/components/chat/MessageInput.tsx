/**
 * Message input component
 * Text input with send button and voice input
 */

'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const {
    isListening,
    transcript,
    interimTranscript,
    error: voiceError,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    onFinalTranscript: (finalText) => {
      // When speech is finalized, update the message
      setMessage(finalText);
    }
  });

  // Check if component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update message as user speaks (show interim results)
  useEffect(() => {
    if (isListening && (transcript || interimTranscript)) {
      setMessage(transcript + interimTranscript);
    }
  }, [transcript, interimTranscript, isListening]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      resetTranscript();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-2">
      {/* Voice Error Message */}
      {voiceError && (
        <div className="text-sm text-red-600 px-2">
          {voiceError}
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 px-2 text-sm text-primary-600 animate-pulse">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-primary-600 rounded-full animate-wave" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-4 bg-primary-600 rounded-full animate-wave" style={{ animationDelay: '100ms' }}></div>
            <div className="w-1 h-4 bg-primary-600 rounded-full animate-wave" style={{ animationDelay: '200ms' }}></div>
          </div>
          <span>Listening...</span>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isListening ? "Listening... start speaking" : "Share what's on your mind..."}
            disabled={disabled || isListening}
            rows={1}
            className={`w-full resize-none rounded-xl border border-neutral-300 dark:border-neutral-600 px-4 py-3 ${
              isMounted && isVoiceSupported ? 'pr-14' : 'pr-4'
            }
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     disabled:bg-neutral-100 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed
                     max-h-32 overflow-y-auto bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100`}
            style={{ minHeight: '48px' }}
          />

          {/* Voice Input Button - Only render on client side to avoid hydration errors */}
          {isMounted && isVoiceSupported && (
            <button
              onClick={toggleVoiceInput}
              disabled={disabled}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg border-2
                       transition-all ${
                         isListening
                           ? 'bg-primary-600 text-white border-primary-600 shadow-lg'
                           : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:text-primary-600 hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 shadow-sm'
                       } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              title={isListening ? 'Click to stop listening' : 'Click to use voice input'}
            >
              {isListening ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl
                   hover:bg-primary-700 transition-colors
                   disabled:bg-neutral-300 disabled:cursor-not-allowed
                   whitespace-nowrap"
        >
          Send
        </button>
      </div>
    </div>
  );
}
