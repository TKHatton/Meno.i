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

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      // Configure recognition
      recognitionRef.current.continuous = continuous;
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
        } else if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        } else if (event.error === 'network') {
          setError('Network error. Please check your connection.');
        } else {
          setError(`Recognition error: ${event.error}`);
        }

        setIsListening(false);
      };

      // Handle end
      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        isStartingRef.current = false;
        isStoppingRef.current = false;

        // Only set listening to false if we're not trying to start again
        if (!isStartingRef.current) {
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
      } else {
        setError('Failed to start listening. Please check microphone permissions.');
        setIsListening(false);
      }
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
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
