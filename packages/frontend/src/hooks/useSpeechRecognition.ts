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
          finalTranscriptRef.current += final;
          setTranscript(finalTranscriptRef.current);
          setInterimTranscript('');
          onFinalTranscript?.(finalTranscriptRef.current);
        }
      };

      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'not-allowed') {
          setError('Microphone access denied. Please allow microphone access.');
          shouldBeListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'no-speech') {
          // On mobile, "no-speech" happens frequently - don't show error, just restart
          console.log('No speech detected, will auto-restart if still listening');
          // Don't set error or stop listening - let onend handle restart
        } else if (event.error === 'network') {
          setError('Network error. Please check your connection.');
          shouldBeListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'aborted') {
          // Aborted errors are normal when user stops - ignore them
          console.log('Recognition aborted');
        } else {
          console.error(`Recognition error: ${event.error}`);
          // Don't stop on other errors, let it try to continue
        }
      };

      // Handle end
      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        isStartingRef.current = false;
        isStoppingRef.current = false;

        // Auto-restart if we should still be listening (user hasn't clicked stop)
        if (shouldBeListeningRef.current && recognitionRef.current) {
          console.log('Auto-restarting recognition...');
          // Small delay before restart to avoid rapid cycling
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldBeListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.error('Error auto-restarting:', err);
                shouldBeListeningRef.current = false;
                setIsListening(false);
              }
            }
          }, 100);
        } else {
          // User manually stopped, so update UI
          setIsListening(false);
        }
      };

      // Handle start
      recognitionRef.current.onstart = () => {
        console.log('Recognition started');
        isStartingRef.current = false;
        isStoppingRef.current = false;
        setIsListening(true);
        setError(null);
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
    if (!recognitionRef.current || !isSupported) {
      const errorMsg = 'Speech recognition not available in this browser';
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // Prevent multiple simultaneous start attempts
    if (isStartingRef.current || isStoppingRef.current) {
      console.log('Recognition is already starting or stopping, please wait');
      return;
    }

    // If already listening, don't start again
    if (recognitionRef.current && isListening) {
      console.log('Already listening');
      return;
    }

    isStartingRef.current = true;
    shouldBeListeningRef.current = true; // Mark that we want to keep listening
    console.log('Starting speech recognition...');
    setError(null);
    finalTranscriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');

    try {
      recognitionRef.current.start();
      // Note: setIsListening(true) will be called in onstart handler
    } catch (err: any) {
      console.error('Error starting recognition:', err);
      isStartingRef.current = false;

      if (err.message && err.message.includes('already started')) {
        // If already started, just update our state to match
        console.log('Recognition already running, syncing state');
        setIsListening(true);
        shouldBeListeningRef.current = true;
      } else {
        setError('Failed to start listening. Please check microphone permissions.');
        setIsListening(false);
        shouldBeListeningRef.current = false;
      }
    }
  }, [isSupported, isListening]);

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
