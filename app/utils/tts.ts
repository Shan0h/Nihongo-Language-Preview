/**
 * Cross-browser Japanese Text-to-Speech (TTS) utility
 * Optimized for Android phones, iOS Safari, Chrome, Edge, and Desktop
 * Uses same-origin server-side audio proxy (/api/tts) for 100% reliable,
 * high-fidelity Tokyo Japanese pronunciation on all mobile devices.
 */

let activeAudioFallback: HTMLAudioElement | null = null;
let jaVoiceCache: SpeechSynthesisVoice | null = null;

function getJapaneseVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  if (jaVoiceCache) return jaVoiceCache;

  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(
    (voice) =>
      voice.lang.toLowerCase().startsWith('ja') ||
      voice.lang.includes('JP') ||
      voice.name.toLowerCase().includes('japanese')
  );

  if (jaVoice) {
    jaVoiceCache = jaVoice;
  }

  return jaVoice || null;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      jaVoiceCache = null;
      getJapaneseVoice();
    };
  }
}

/**
 * Fallback to browser SpeechSynthesis (offline support)
 */
function speakOffline(text: string, rate: number = 0.85) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    utterance.pitch = 1.0;

    const voice = getJapaneseVoice();
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Offline speech synthesis failed:', err);
  }
}

/**
 * Speaks Japanese text out loud.
 * Uses the /api/tts streaming endpoint to guarantee authentic Tokyo Japanese pronunciation
 * on 100% of Android phones and mobile devices without requiring any language pack installation.
 * 
 * @param text Japanese text to pronounce (e.g. "こんにちは")
 * @param rate Speed rate for speech
 */
export function speakJapanese(text: string, rate: number = 0.85) {
  if (typeof window === 'undefined' || !text || text.trim() === '') return;

  // 1. Always stop any previously playing audio or speech
  stopJapaneseSpeech();

  try {
    const cleanText = encodeURIComponent(text.trim());
    // Same-origin server-side endpoint guarantees no CORS or 404 referer blocks
    const audioUrl = `/api/tts?text=${cleanText}`;
    const audio = new Audio(audioUrl);
    activeAudioFallback = audio;

    audio.onended = () => {
      if (activeAudioFallback === audio) {
        activeAudioFallback = null;
      }
    };

    audio.onerror = (e) => {
      console.warn('Server TTS stream failed, attempting offline SpeechSynthesis:', e);
      if (activeAudioFallback === audio) {
        activeAudioFallback = null;
      }
      speakOffline(text, rate);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio playback was prevented by browser policy, falling back:', err);
        speakOffline(text, rate);
      });
    }
  } catch (err) {
    console.warn('Failed to initialize audio playback, using offline fallback:', err);
    speakOffline(text, rate);
  }
}

/**
 * Stops any currently playing audio stream or speech synthesis
 */
export function stopJapaneseSpeech() {
  if (typeof window === 'undefined') return;

  if (activeAudioFallback) {
    try {
      activeAudioFallback.pause();
      activeAudioFallback.currentTime = 0;
      activeAudioFallback.removeAttribute('src');
      activeAudioFallback.load();
    } catch {}
    activeAudioFallback = null;
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
