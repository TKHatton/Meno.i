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
  const lastProcessedIndexRef = useRef(0);

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

      // Configure recognition - use continuous mode but DON'T auto-restart (hold-to-speak)
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = lang;
      recognitionRef.current.maxAlternatives = 1;

      // Handle results - use result index to prevent duplication
      recognitionRef.current.onresult = (event: any) => {
        console.log('📝 Speech result event:', {
          resultIndex: event.resultIndex,
          resultsLength: event.results.length,
          lastProcessedIndex: lastProcessedIndexRef.current
        });

        let interim = '';
        let hasNewFinalResult = false; // Track if we added any new final text

        // Process ALL final results we haven't processed yet
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;

          if (result.isFinal) {
            // Only process if we haven't seen this index before
            if (i >= lastProcessedIndexRef.current) {
              console.log(`✅ Processing final result [${i}]:`, transcriptText);

              // Add space before new text if needed
              if (finalTranscriptRef.current && !finalTranscriptRef.current.endsWith(' ')) {
                finalTranscriptRef.current += ' ';
              }
              finalTranscriptRef.current += transcriptText.trim();
              lastProcessedIndexRef.current = i + 1;
              hasNewFinalResult = true; // Mark that we added new final text
            } else {
              console.log(`⏭️ Skipping already processed result [${i}]:`, transcriptText);
            }
          } else {
            // Interim results - just show them, don't save
            interim += transcriptText;
          }
        }

        // Update interim
        if (interim) {
          console.log('💬 Interim:', interim);
          setInterimTranscript(interim);
          onTranscript?.(finalTranscriptRef.current + interim);
        } else {
          setInterimTranscript('');
        }

        // Update final transcript ONLY if we added new final text
        if (hasNewFinalResult) {
          console.log('✅ Calling onFinalTranscript with:', finalTranscriptRef.current);
          setTranscript(finalTranscriptRef.current);
          onFinalTranscript?.(finalTranscriptRef.current);
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

      // Handle end - NO AUTO-RESTART for hold-to-speak mode
      recognitionRef.current.onend = () => {
        console.log('🛑 Recognition ended');
        console.log('Should still be listening?', shouldBeListeningRef.current);
        isStartingRef.current = false;
        isStoppingRef.current = false;

        // ALWAYS stop when recognition ends (hold-to-speak mode)
        // User must hold button to keep listening
        shouldBeListeningRef.current = false;
        setIsListening(false);
        console.log('✅ Recognition stopped (hold-to-speak mode)');
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
    lastProcessedIndexRef.current = 0; // Reset index for new session

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
    lastProcessedIndexRef.current = 0;
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
