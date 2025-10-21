/**
 * Text-to-Speech service
 * Uses Web Speech API for voice output
 */

class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.isSupported = !!this.synthesis;
    }
  }

  /**
   * Check if text-to-speech is supported
   */
  get supported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if currently speaking
   */
  get speaking(): boolean {
    return this.synthesis?.speaking || false;
  }

  /**
   * Speak text with specified options
   */
  speak(
    text: string,
    options: {
      voice?: string; // Voice name (e.g., "Google US English")
      rate?: number; // Speech rate (0.1 to 10, default 1)
      pitch?: number; // Speech pitch (0 to 2, default 1)
      volume?: number; // Volume (0 to 1, default 1)
      lang?: string; // Language (e.g., "en-US")
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: Error) => void;
    } = {}
  ): void {
    if (!this.isSupported || !this.synthesis) {
      console.warn('Text-to-speech not supported');
      options.onError?.(new Error('Text-to-speech not supported'));
      return;
    }

    // Cancel any ongoing speech
    this.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set options
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;
    utterance.lang = options.lang ?? 'en-US';

    // Set voice if specified
    if (options.voice) {
      const voices = this.synthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === options.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      // Use default female voice if available
      const voices = this.synthesis.getVoices();
      const femaleVoice = voices.find(v =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('victoria') ||
        v.name.toLowerCase().includes('karen')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    }

    // Set event handlers
    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.currentUtterance = null;
      options.onError?.(new Error(event.error));
    };

    // Save current utterance
    this.currentUtterance = utterance;

    // Speak
    this.synthesis.speak(utterance);
  }

  /**
   * Pause speech
   */
  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume speech
   */
  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  /**
   * Cancel speech
   */
  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  /**
   * Get recommended voice for compassionate companion
   */
  getCompassionateVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices();

    // Prefer these voices for a warm, compassionate tone
    const preferredNames = [
      'Samantha', // macOS - warm, friendly
      'Victoria', // macOS - professional, kind
      'Karen', // macOS - gentle
      'Google US English Female', // Chrome
      'Microsoft Zira', // Windows
      'Google UK English Female' // Chrome
    ];

    for (const name of preferredNames) {
      const voice = voices.find(v => v.name === name);
      if (voice) return voice;
    }

    // Fallback to any female en-US voice
    const femaleEnVoice = voices.find(v =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
       v.name.toLowerCase().includes('woman'))
    );

    return femaleEnVoice || voices[0] || null;
  }
}

// Export singleton instance
export const textToSpeech = new TextToSpeechService();

// Export class for testing
export { TextToSpeechService };
