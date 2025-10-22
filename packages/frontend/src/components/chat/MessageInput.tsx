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
  const [showVoiceHint, setShowVoiceHint] = useState(true);

  // Detect mobile device
  const isMobile = typeof window !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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

  // Hold to speak - start on press, stop on release
  const handleMicPress = () => {
    console.log('🎤 Microphone button pressed - starting listening');
    setShowVoiceHint(false); // Hide hint once they use it
    startListening();
  };

  const handleMicRelease = () => {
    console.log('🎤 Microphone button released - stopping listening');
    if (isListening) {
      stopListening();
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
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
          <div className="font-semibold mb-1">Voice Input Error</div>
          <div>{voiceError}</div>
          {voiceError.includes('denied') && (
            <div className="mt-2 text-xs">
              To enable voice input: Click the microphone icon in your browser's address bar and allow microphone access.
            </div>
          )}
        </div>
      )}

      {/* Listening Indicator */}
      {isListening && (
        <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-6 bg-amber-600 rounded-full animate-wave" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-6 bg-amber-600 rounded-full animate-wave" style={{ animationDelay: '100ms' }}></div>
                <div className="w-2 h-6 bg-amber-600 rounded-full animate-wave" style={{ animationDelay: '200ms' }}></div>
              </div>
              <div>
                <div className="font-bold text-lg text-amber-900 dark:text-amber-100">
                  🎤 Recording...
                </div>
                <div className="text-sm text-amber-800 dark:text-amber-200 mt-0.5 font-medium">
                  Keep holding the button while you speak
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice How-To Hint */}
      {isMounted && isVoiceSupported && showVoiceHint && !isListening && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1">
              <div className="text-blue-600 dark:text-blue-400 text-lg">💡</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-semibold mb-1">Voice Input: Hold to Speak</div>
                <div className="text-blue-700 dark:text-blue-300">
                  Press and <strong>hold</strong> the microphone button while speaking, then release when done.
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowVoiceHint(false)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-xl leading-none"
              aria-label="Dismiss hint"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Voice Not Supported Warning */}
      {isMounted && !isVoiceSupported && (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 text-sm text-yellow-700 dark:text-yellow-300">
          Voice input is not supported in your browser. Please use Chrome, Edge, or Safari for voice features.
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              isListening
                ? "🎤 Recording... keep holding the button"
                : "Share what's on your mind... (or hold 🎤 to speak)"
            }
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

          {/* Voice Input Button - HOLD TO SPEAK */}
          {isMounted && isVoiceSupported && (
            <button
              onMouseDown={handleMicPress}
              onMouseUp={handleMicRelease}
              onMouseLeave={handleMicRelease}
              onTouchStart={(e) => {
                e.preventDefault();
                handleMicPress();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleMicRelease();
              }}
              disabled={disabled}
              type="button"
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full border-2
                       transition-all duration-200 select-none ${
                         isListening
                           ? 'bg-amber-600 text-white border-amber-600 shadow-2xl scale-110'
                           : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:text-primary-600 hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 shadow-lg hover:scale-105'
                       } disabled:opacity-50 disabled:cursor-not-allowed active:scale-95`}
              aria-label="Hold to speak"
              title="HOLD this button while speaking, then release when done"
            >
              <svg className="w-6 h-6" fill={isListening ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
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
