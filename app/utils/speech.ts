/**
 * Cross-browser Web Speech API Speech Recognition utility for Japanese
 * Supports Chrome, Edge, and Android Chrome using webkitSpeechRecognition
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export class JapaneseSpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'ja-JP'; // Listen for Japanese speech
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3;
      }
    }
  }

  /**
   * Start listening for Japanese speech
   */
  start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('Microphone speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.isListening = true;

    this.recognition.onresult = (event: any) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript.trim();
        const confidence = event.results[0][0].confidence;
        onResult({ transcript, confidence });
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      if (event.error === 'not-allowed') {
        onError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        onError('No speech detected. Please speak louder into the microphone.');
      } else {
        onError(`Speech recognition error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      onError('Could not start microphone. Please try again.');
    }
  }

  /**
   * Stop listening
   */
  stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop errors
      }
      this.isListening = false;
    }
  }
}
