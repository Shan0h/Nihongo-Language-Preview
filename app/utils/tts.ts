/**
 * Cross-browser Japanese Text-to-Speech (TTS) utility
 * Optimized for Chrome, Edge, Safari, iOS & Android devices
 */

let jaVoiceCache: SpeechSynthesisVoice | null = null;

function getJapaneseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  if (jaVoiceCache) return jaVoiceCache;

  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(
    (voice) =>
      voice.lang.includes('ja') ||
      voice.lang.includes('JP') ||
      voice.lang.toLowerCase().includes('japanese') ||
      voice.name.toLowerCase().includes('japanese')
  );

  if (jaVoice) {
    jaVoiceCache = jaVoice;
  }

  return jaVoiceCache || null;
}

// Pre-load voices on client side
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getJapaneseVoice();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      getJapaneseVoice();
    };
  }
}

/**
 * Speaks Japanese text out loud using browser Web Speech API
 * @param text Japanese text to pronounce (e.g. "こんにちは")
 * @param rate Speed rate (default 0.85 for clear educational speech)
 */
export function speakJapanese(text: string, rate: number = 0.85) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Text-to-Speech is not supported in this browser.');
    return;
  }

  try {
    // Cancel any active speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voice = getJapaneseVoice();
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('TTS speech error:', error);
  }
}

/**
 * Stops any currently playing speech synthesis audio
 */
export function stopJapaneseSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
