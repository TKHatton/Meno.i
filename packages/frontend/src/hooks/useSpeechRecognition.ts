/**
 * Speech recognition hook
 * Uses Web Speech API for speech-to-text
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  onTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  continuous?: boolean;
  lang?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition({
  onTranscript,
  onFinalTranscript,
  continuous = false,
  lang = 'en-US'
}: UseSpeechRecognitionProps = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const isStartingRef = useRef(false);
  const isStoppingRef = useRef(false);
  const shouldBeListeningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect if we're on mobile
  const isMobile = typeof window !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      // Configure recognition - use continuous mode for better mobile experience
      recognitionRef.current.continuous = true; // Changed to true for mobile compatibility
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = lang;
      recognitionRef.current.maxAlternatives = 1;

      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            final += transcriptText;
          } else {
            interim += transcriptText;
          }
        }

        if (interim) {
          console.log('Interim transcript:', interim);
          setInterimTranscript(interim);
          onTranscript?.(finalTranscriptRef.current + interim);
        }

        if (final) {
          console.log('Final transcript:', final);
          const trimmedFinal = final.trim();

          // Prevent duplication: if new final text already contains our current transcript,
          // it's a replacement (browser re-sent full transcript), not new text to append
          if (trimmedFinal.includes(finalTranscriptRef.current.trim()) && trimmedFinal !== finalTranscriptRef.current.trim()) {
            console.log('🔄 Replacing with fuller transcript:', trimmedFinal);
            finalTranscriptRef.current = trimmedFinal;
            setTranscript(finalTranscriptRef.current);
            setInterimTranscript('');
            onFinalTranscript?.(finalTranscriptRef.current);
          } else if (trimmedFinal === finalTranscriptRef.current.trim()) {
            // Exact duplicate, skip
            console.log('⚠️ Skipping exact duplicate:', trimmedFinal);
          } else {
            // New text to append
            console.log('➕ Appending new text:', trimmedFinal);
            if (finalTranscriptRef.current && !finalTranscriptRef.current.endsWith(' ')) {
              finalTranscriptRef.current += ' ';
            }
            finalTranscriptRef.current += trimmedFinal;
            setTranscript(finalTranscriptRef.current);
            setInterimTranscript('');
            onFinalTranscript?.(finalTranscriptRef.current);
          }
        }
      };

      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        console.log('Error details:', {
          error: event.error,
          message: event.message,
          timeStamp: event.timeStamp,
          isMobile: isMobile
        });

        // Only stop on critical errors - everything else should keep trying
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
          shouldBeListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // Common on mobile - ignore completely and let auto-restart handle it
          console.log('⏸️ No speech detected - will auto-restart');
          // Do NOT set error or stop - let onend handle restart
        } else if (event.error === 'network') {
          setError('Network error. Please check your connection.');
          shouldBeListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'aborted') {
          // Normal when user stops - don't log as error
          console.log('⏹️ Recognition aborted by user');
        } else if (event.error === 'service-not-allowed') {
          setError('Speech recognition service not allowed. Please check browser permissions.');
          shouldBeListeningRef.current = false;
          setIsListening(false);
        } else {
          // For any other error, just log and continue - don't show error to user
          console.error(`⚠️ Error: ${event.error} - will continue listening`);
          // DO NOT set error or stop listening - let auto-restart work
        }
      };

      // Handle end
      recognitionRef.current.onend = () => {
        console.log('🛑 Recognition ended');
        console.log('Should still be listening?', shouldBeListeningRef.current);
        console.log('Is mobile?', isMobile);
        isStartingRef.current = false;
        isStoppingRef.current = false;

        // Auto-restart IMMEDIATELY if user wants to keep listening
        if (shouldBeListeningRef.current && recognitionRef.current) {
          console.log('🔄 IMMEDIATE Auto-restart...');

          // Try to restart with NO delay for fastest recovery
          try {
            recognitionRef.current.start();
            console.log('✅ Immediate restart successful');
          } catch (err: any) {
            console.error('❌ Immediate restart failed:', err);

            // If immediate fails, try with tiny delay
            if (restartTimeoutRef.current) {
              clearTimeout(restartTimeoutRef.current);
            }

            restartTimeoutRef.current = setTimeout(() => {
              if (shouldBeListeningRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                  console.log('✅ Delayed restart successful');
                } catch (retryErr: any) {
                  console.error('❌ Delayed restart failed:', retryErr);

                  // Last attempt with longer delay
                  setTimeout(() => {
                    if (shouldBeListeningRef.current && recognitionRef.current) {
                      try {
                        recognitionRef.current.start();
                        console.log('✅ Final restart attempt successful');
                      } catch (finalErr) {
                        console.error('❌ All restart attempts failed');
                        shouldBeListeningRef.current = false;
                        setIsListening(false);
                        setError('Voice session ended. Click the microphone to continue.');
                      }
                    }
                  }, 500);
                }
              }
            }, 50);
          }
        } else {
          // User manually stopped, so update UI
          console.log('👤 User manually stopped');
          setIsListening(false);
        }
      };

      // Handle start
      recognitionRef.current.onstart = () => {
        console.log('✅ Recognition started successfully');
        isStartingRef.current = false;
        isStoppingRef.current = false;
        setIsListening(true);
        setError(null);
      };

      // Handle audio start (when microphone actually starts capturing)
      recognitionRef.current.onaudiostart = () => {
        console.log('🎤 Microphone audio capture started');
      };

      // Handle audio end
      recognitionRef.current.onaudioend = () => {
        console.log('🎤 Microphone audio capture ended');
      };

      // Handle speech start
      recognitionRef.current.onspeechstart = () => {
        console.log('🗣️ Speech detected');
      };

      // Handle speech end
      recognitionRef.current.onspeechend = () => {
        console.log('🗣️ Speech ended');
      };
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }

    // Cleanup
    return () => {
      shouldBeListeningRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [continuous, lang, onTranscript, onFinalTranscript]);

  const startListening = useCallback(() => {
    console.log('🎯 startListening() called');
    console.log('Browser info:', {
      isMobile: isMobile,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
      isSupported: isSupported,
      currentlyListening: isListening
    });

    if (!recognitionRef.current || !isSupported) {
      const errorMsg = 'Speech recognition not available in this browser';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    // Prevent multiple simultaneous start attempts
    if (isStartingRef.current || isStoppingRef.current) {
      console.log('⏸️ Recognition is already starting or stopping, please wait');
      return;
    }

    // If already listening, don't start again
    if (recognitionRef.current && isListening) {
      console.log('⏸️ Already listening');
      return;
    }

    isStartingRef.current = true;
    shouldBeListeningRef.current = true; // Mark that we want to keep listening
    console.log('🚀 Attempting to start speech recognition...');
    console.log('Recognition config:', {
      continuous: recognitionRef.current.continuous,
      interimResults: recognitionRef.current.interimResults,
      lang: recognitionRef.current.lang
    });
    setError(null);
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');

    try {
      recognitionRef.current.start();
      console.log('✅ recognition.start() called successfully');
      // Note: setIsListening(true) will be called in onstart handler
    } catch (err: any) {
      console.error('❌ Error calling recognition.start():', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      isStartingRef.current = false;

      if (err.message && err.message.includes('already started')) {
        // If already started, just update our state to match
        console.log('⚠️ Recognition already running, syncing state');
        setIsListening(true);
        shouldBeListeningRef.current = true;
      } else {
        setError('Failed to start listening. Please check microphone permissions.');
        setIsListening(false);
        shouldBeListeningRef.current = false;
      }
    }
  }, [isSupported, isListening, isMobile]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    // Mark that we no longer want to keep listening (prevents auto-restart)
    shouldBeListeningRef.current = false;

    // Clear any pending restart
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Prevent multiple simultaneous stop attempts
    if (isStoppingRef.current || isStartingRef.current) {
      console.log('Recognition is already stopping or starting, please wait');
      return;
    }

    // If not listening, nothing to stop
    if (!isListening) {
      console.log('Not currently listening');
      return;
    }

    isStoppingRef.current = true;
    console.log('Stopping speech recognition...');

    try {
      recognitionRef.current.stop();
      // Note: setIsListening(false) will be called in onend handler
    } catch (err) {
      console.error('Error stopping recognition:', err);
      isStoppingRef.current = false;
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}
