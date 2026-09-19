/* eslint-disable @typescript-eslint/no-explicit-any */
import { stopJapaneseSpeech } from './tts';
import { bgm } from './bgm';
/**
 * Cross-browser Web Speech API Speech Recognition utility for Japanese
 * Supports Chrome, Edge, and Android Chrome using webkitSpeechRecognition
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives?: string[];
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Common Japanese Kanji/Vocabulary to Hiragana mapping
 * Enables speech recognition (which outputs Kanji like 友達) to match quiz options in Hiragana (ともだち)
 */
export const KANJI_TO_HIRAGANA: Record<string, string> = {
  // Family & People
  '友達': 'ともだち',
  '友だち': 'ともだち',
  '家族': 'かぞく',
  '子供': 'こども',
  '子ども': 'こども',
  '大人': 'おとな',
  '兄': 'あに',
  'お兄さん': 'おにいさん',
  '姉': 'あね',
  'お姉さん': 'おねえさん',
  '父': 'ちち',
  'お父さん': 'おとうさん',
  '母': 'はは',
  'お母さん': 'おかあさん',
  '弟': 'おとうと',
  '妹': 'いもうと',
  '祖父': 'そふ',
  '祖母': 'そぼ',
  'おじいさん': 'おじいさん',
  'おばあさん': 'おばあさん',
  '学生': 'がくせい',
  '先生': 'せんせい',
  '人': 'ひと',

  // Animals
  '犬': 'いぬ',
  '猫': 'ねこ',
  '鳥': 'とり',
  '猿': 'さる',
  '馬': 'うま',
  '豚': 'ぶた',
  '熊': 'くま',
  '兎': 'うさぎ',
  '蛇': 'へび',
  '虫': 'むし',
  '魚': 'さかな',
  '蛙': 'かえる',

  // Body parts
  '頭': 'あたま',
  '顔': 'かお',
  '目': 'め',
  '耳': 'みみ',
  '鼻': 'はな',
  '口': 'くち',
  '手': 'て',
  '足': 'あし',
  '脚': 'あし',
  '指': 'ゆび',
  '腕': 'うで',
  '髪': 'かみ',
  '紙': 'かみ',

  // Numbers (Kanji and Digits)
  '一': 'いち',
  '二': 'に',
  '三': 'さん',
  '四': 'よん',
  '五': 'ご',
  '六': 'ろく',
  '七': 'なな',
  '八': 'はち',
  '九': 'きゅう',
  '十': 'じゅう',
  '二十': 'にじゅう',
  '三十': 'さんじゅう',
  '四十': 'よんじゅう',
  '五十': 'ごじゅう',
  '六十': 'ろくじゅう',
  '七十': 'ななじゅう',
  '八十': 'はちじゅう',
  '九十': 'きゅうじゅう',
  '百': 'ひゃく',
  '千': 'せん',
  '1': 'いち',
  '2': 'に',
  '3': 'さん',
  '4': 'よん',
  '5': 'ご',
  '6': 'ろく',
  '7': 'なな',
  '8': 'はち',
  '9': 'きゅう',
  '10': 'じゅう',
  '20': 'にじゅう',
  '30': 'さんじゅう',
  '40': 'よんじゅう',
  '50': 'ごじゅう',
  '60': 'ろくじゅう',
  '70': 'ななじゅう',
  '80': 'はちじゅう',
  '90': 'きゅうじゅう',
  '100': 'ひゃく',
  '1000': 'せん',

  // Extra Animals
  '牛': 'うし',
  '鹿': 'しか',
  '象': 'ぞう',
  '羊': 'ひつじ',
  '麒麟': 'きりん',

  // Extra Body parts
  '肩': 'かた',
  '首': 'くび',
  '爪': 'つめ',

  // Colors
  '赤': 'あか',
  '青': 'あお',
  '黄色': 'きいろ',
  '緑': 'みどり',
  '黒': 'くろ',
  '白': 'しろ',
  '紫': 'むらさき',
  '茶色': 'ちゃいろ',

  // Food & Drinks
  '林檎': 'りんご',
  '蜜柑': 'みかん',
  '葡萄': 'ぶどう',
  '苺': 'いちご',
  'ご飯': 'ごはん',
  '御飯': 'ごはん',
  '寿司': 'すし',
  '鮨': 'すし',
  '天ぷら': 'てんぷら',
  '天婦羅': 'てんぷら',
  '蕎麦': 'そば',
  '饂飩': 'うどん',
  '水': 'みず',
  'お茶': 'おちゃ',
  '肉': 'にく',
  '卵': 'たまご',
  '野菜': 'やさい',

  // Verbs & Actions
  '食べる': 'たべる',
  '食べます': 'たべる',
  '飲む': 'のむ',
  '飲みます': 'のむ',
  '見る': 'みる',
  '見ます': 'みる',
  '聞く': 'きく',
  '聞きます': 'きく',
  '読む': 'よむ',
  '読みます': 'よむ',
  '書く': 'かく',
  '書きます': 'かく',
  '話す': 'はなす',
  '話します': 'はなす',
  '寝る': 'ねる',
  '寝ます': 'ねる',
  '起きる': 'おきる',
  '起きます': 'おきる',
  '行く': 'いく',
  '行きます': 'いく',
  '来る': 'くる',
  '来ます': 'くる',

  // Adjectives
  '大きい': 'おおきい',
  '小さい': 'ちいさい',
  '新しい': 'あたらしい',
  '古い': 'ふるい',
  '高い': 'たかい',
  '安い': 'やすい',
  '暑い': 'あつい',
  '熱い': 'あつい',
  '寒い': 'さむい',
  '冷たい': 'つめたい',
  '美味しい': 'おいしい',
  '不味い': 'まずい',
  '楽しい': 'たのしい',
  '難しい': 'むずかしい',
  '怖い': 'こわい',
  '可愛い': 'かわいい',
  '涼しい': 'すずしい',
  '優しい': 'やさしい',
  '面白い': 'おもしろい',

  // Greetings & Expressions
  '有難う': 'ありがとう',
  '有難うございます': 'ありがとうございます',
  'お願いします': 'おねがいします',
  '頂きます': 'いただきます',
  'ご馳走様': 'ごちそうさま',
  '御馳走様': 'ごちそうさま',
  'ごちそう様': 'ごちそうさま',
  '御免なさい': 'ごめんなさい',
  'お休み': 'おやすみ',
  'お休みなさい': 'おやすみなさい',
  'お早う': 'おはよう',
  'お早うございます': 'お早うございます',
  '今日は': 'こんにちは',
  '今晩は': 'こんばんは',
  '左様なら': 'さようなら',
  '初めまして': 'はじめまして',
  'また明日': 'またあした',
  '宜しくお願いします': 'よろしくおねがいします',
  'お久しぶりです': 'おひさしぶりです',
  '大丈夫': 'だいじょうぶ',
  '大丈夫です': 'だいじょうぶです',
  '分かりました': 'わかりました',
  '知りません': 'しりません',
  '違います': 'ちがいます',
};

const SORTED_KANJI_KEYS = Object.keys(KANJI_TO_HIRAGANA).sort((a, b) => b.length - a.length);

/**
 * Convert Katakana characters to Hiragana
 */
export function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30a1-\u30f6]/g, (match) => {
    const code = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(code);
  });
}

/**
 * Normalizes speech text into a standard Hiragana representation:
 * - Replaces Kanji with Hiragana readings
 * - Converts Katakana to Hiragana
 * - Removes spaces, punctuation, and Japanese punctuation marks
 */
export function normalizeJapaneseSpeech(text: string): string {
  if (!text) return '';
  let normalized = text.trim();

  // Replace Kanji with Hiragana
  for (const kanji of SORTED_KANJI_KEYS) {
    if (normalized.includes(kanji)) {
      normalized = normalized.split(kanji).join(KANJI_TO_HIRAGANA[kanji]);
    }
  }

  // Convert Katakana to Hiragana
  normalized = katakanaToHiragana(normalized);

  // Remove common punctuation and whitespace
  normalized = normalized.replace(/[\s\u3000\u3001\u3002,.!?'"・〜~ー-]/g, '').toLowerCase();

  return normalized;
}

/**
 * Match user spoken transcript against options and correct answer
 */
export function matchOptionFromSpeech(
  spoken: string,
  options: string[],
  correctAnswer: string,
  optionHiragana?: Record<string, string>,
  alternatives: string[] = []
): string | null {
  const allTranscripts = [spoken, ...alternatives].filter(Boolean);

  // 1. Direct and normalized exact match check
  for (const trans of allTranscripts) {
    const cleanTrans = trans.replace(/[\s\u3000\u3001\u3002,.!?'"・〜~ー-]/g, '').trim();
    const normTrans = normalizeJapaneseSpeech(cleanTrans);

    for (const opt of options) {
      const cleanOpt = opt.replace(/[\s\u3000\u3001\u3002,.!?'"・〜~ー-]/g, '').trim();
      const normOpt = normalizeJapaneseSpeech(opt);
      if (cleanOpt === cleanTrans || normOpt === normTrans || opt === trans.trim()) {
        return opt;
      }
    }

    // Check correct answer direct/normalized match
    const cleanCorrect = correctAnswer.replace(/[\s\u3000\u3001\u3002,.!?'"・〜~ー-]/g, '').trim();
    const normCorrect = normalizeJapaneseSpeech(correctAnswer);
    if (cleanCorrect === cleanTrans || normCorrect === normTrans || correctAnswer === trans.trim()) {
      return correctAnswer;
    }
  }

  // 2. Substring / inclusion match (e.g. "友達です" matching "ともだち")
  for (const trans of allTranscripts) {
    const normTrans = normalizeJapaneseSpeech(trans);
    if (!normTrans) continue;

    for (const opt of options) {
      const normOpt = normalizeJapaneseSpeech(opt);
      if (normOpt && (normTrans.includes(normOpt) || normOpt.includes(normTrans))) {
        return opt;
      }
    }

    const normCorrect = normalizeJapaneseSpeech(correctAnswer);
    if (normCorrect && (normTrans.includes(normCorrect) || normCorrect.includes(normTrans))) {
      return correctAnswer;
    }
  }

  // 3. Romaji fallback matching from option_hiragana if available
  if (optionHiragana) {
    for (const trans of allTranscripts) {
      const lowerTrans = trans.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!lowerTrans) continue;

      for (const opt of options) {
        const hiraganaInfo = optionHiragana[opt];
        if (hiraganaInfo) {
          // Extract romaji from "ともだち (tomodachi)"
          const romajiMatch = hiraganaInfo.match(/\(([^)]+)\)/);
          if (romajiMatch) {
            const romaji = romajiMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '');
            if (romaji && (lowerTrans.includes(romaji) || romaji.includes(lowerTrans))) {
              return opt;
            }
          }
        }
      }
    }
  }

  return null;
}

export type SpeechEnginePreference = 'google' | 'whisper';

export class JapaneseSpeechRecognizer {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private autoStopTimer: NodeJS.Timeout | number | null = null;
  private browserRecognition: any = null;
  private isListening: boolean = false;
  private wasBgmPlaying: boolean = false;
  private chunks: Blob[] = [];
  private currentMimeType: string = '';
  private discardNextStop: boolean = false;
  private engine: SpeechEnginePreference = 'google';

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nihongo_speech_engine') as SpeechEnginePreference | null;
      if (saved === 'whisper' || saved === 'google') {
        this.engine = saved;
      }
    }
  }

  public getEngine(): SpeechEnginePreference {
    return this.engine;
  }

  public setEngine(engine: SpeechEnginePreference) {
    this.engine = engine;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('nihongo_speech_engine', engine);
      } catch {}
    }
  }

  private restoreBgm() {
    if (this.wasBgmPlaying) {
      try {
        bgm.start();
      } catch {}
      this.wasBgmPlaying = false;
    }
  }

  /**
   * Start listening for Japanese speech.
   * - Uses Google Speech (webkitSpeechRecognition) by default for fast, accurate recognition on supported devices (Samsung, Pixel, Edge, Chrome PC).
   * - Automatically falls back to Groq Whisper STT on devices where Google Speech fails or aborts (OnePlus 12 / ColorOS).
   * - Passes question vocabulary context to Groq Whisper to prevent silence/noise hallucinations.
   */
  async start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    onStart?: () => void,
    vocabPrompt?: string,
    onEngineSwitch?: (newEngine: SpeechEnginePreference) => void,
    enginePreference?: SpeechEnginePreference
  ) {
    if (typeof window === 'undefined') return;

    // 1. Immediately release audio focus: stop active TTS audio playback
    stopJapaneseSpeech();

    // 2. Pause background music so device audio output does not collide with microphone capture
    try {
      if (bgm.getIsPlaying()) {
        this.wasBgmPlaying = true;
        bgm.stop();
      }
    } catch {}

    // 3. Mobile Secure Context check
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      this.restoreBgm();
      onError('Microphone requires HTTPS on mobile devices. Please access via your secure Vercel deployment URL (https://...).');
      return;
    }

    // 4. Cancel any running session cleanly
    this.cancel();

    const selectedEngine = enginePreference || this.engine;

    // If preferred engine is Whisper, directly start Whisper
    if (selectedEngine === 'whisper') {
      this.startWhisper(onResult, onError, onEnd, onStart, vocabPrompt);
      return;
    }

    // Otherwise, attempt Google Web Speech API (primary for high accuracy)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Browser doesn't have Web Speech API; fall back to Whisper
      this.startWhisper(onResult, onError, onEnd, onStart, vocabPrompt);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP';
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 5;
      this.browserRecognition = rec;

      let hasReceivedResult = false;
      let hasReceivedError = false;

      rec.onstart = () => {
        this.isListening = true;
        if (onStart) onStart();
      };

      rec.onresult = (event: any) => {
        if (event.results && event.results[0]) {
          const alternatives: string[] = [];
          for (let i = 0; i < event.results[0].length; i++) {
            const t = event.results[0][i]?.transcript?.trim();
            if (t && !alternatives.includes(t)) {
              alternatives.push(t);
            }
          }
          const transcript = alternatives[0] || '';
          const confidence = event.results[0][0]?.confidence || 0;
          this.restoreBgm();

          if (transcript) {
            hasReceivedResult = true;
            onResult({ transcript, confidence, alternatives });
          } else {
            hasReceivedError = true;
            onError('Could not understand speech. Please speak louder and clearer.');
          }
        }
      };

      rec.onerror = (event: any) => {
        hasReceivedError = true;
        const errType = event.error || 'error';

        // Check if OnePlus 12 / ColorOS or device restricted Google Speech Services ('aborted')
        if (errType === 'aborted' || errType === 'service-not-allowed' || errType === 'audio-capture') {
          console.warn(`Native Google Speech failed (${errType}). Switching to Cloud Whisper.`);
          this.setEngine('whisper');
          if (onEngineSwitch) onEngineSwitch('whisper');
          // Seamlessly start Whisper STT for this speech attempt
          this.startWhisper(onResult, onError, onEnd, onStart, vocabPrompt);
          return;
        }

        this.isListening = false;
        this.restoreBgm();

        if (this.discardNextStop) {
          onEnd();
          return;
        }

        if (errType === 'no-speech') {
          onError('No speech was detected. Please speak closer to your microphone and try again.');
        } else if (errType === 'not-allowed') {
          onError('Microphone permission was denied. Please allow microphone access in Chrome settings.');
        } else if (errType === 'network') {
          onError('Google Speech network error. Please tap to try again or switch to Cloud Whisper.');
        } else {
          onError(`Could not capture speech (${errType}). Please tap to try again.`);
        }
        onEnd();
      };

      rec.onend = () => {
        this.isListening = false;
        this.restoreBgm();

        // If Google Speech ended without delivering any result or error, notify the user!
        if (!hasReceivedResult && !hasReceivedError && !this.discardNextStop) {
          onError('No speech was detected. Please tap the mic, speak clearly, and try again.');
        }

        onEnd();
      };

      rec.start();
    } catch (err: any) {
      console.warn('Native speech recognition start failed. Falling back to Whisper:', err);
      this.setEngine('whisper');
      if (onEngineSwitch) onEngineSwitch('whisper');
      this.startWhisper(onResult, onError, onEnd, onStart, vocabPrompt);
    }
  }

  /**
   * Whisper Cloud STT fallback using MediaRecorder + Groq Whisper (/api/stt)
   * Passing question vocabulary prompt anchors Whisper to prevent hallucinations.
   */
  private async startWhisper(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    onStart?: () => void,
    vocabPrompt?: string
  ) {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      this.restoreBgm();
      this.isListening = false;
      onError('Audio recording is not supported on this browser.');
      onEnd();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.mediaStream = stream;

      // Choose best supported MIME type
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
      this.currentMimeType = mimeType;

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      this.mediaRecorder = recorder;
      this.chunks = [];
      this.discardNextStop = false;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      recorder.onstart = () => {
        this.isListening = true;
        if (onStart) onStart();
      };

      recorder.onstop = async () => {
        this.isListening = false;
        const capturedChunks = [...this.chunks];
        this.chunks = [];
        this.cleanupStream();

        if (this.discardNextStop) {
          this.restoreBgm();
          onEnd();
          return;
        }

        if (capturedChunks.length === 0) {
          this.restoreBgm();
          onError('No audio was captured. Please speak closer to your phone microphone and try again.');
          onEnd();
          return;
        }

        try {
          const audioBlob = new Blob(capturedChunks, { type: this.currentMimeType || 'audio/webm' });
          const formData = new FormData();
          formData.append(
            'file',
            audioBlob,
            `speech.${this.currentMimeType.includes('mp4') ? 'mp4' : 'webm'}`
          );

          if (vocabPrompt && vocabPrompt.trim()) {
            formData.append('prompt', vocabPrompt.trim());
          }

          const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData,
          });

          this.restoreBgm();

          if (!response.ok) {
            onError('Could not process speech. Please tap to try again or tap Continue.');
            onEnd();
            return;
          }

          const data = await response.json();
          const rawText = (data.text || '').trim();
          // Strip punctuation from Japanese Whisper transcript
          const transcript = rawText.replace(/[\u3002\u3001.,!?！？]/g, '').trim();

          if (!transcript) {
            onError('No speech detected. Please speak closer to your microphone and try again.');
            onEnd();
            return;
          }

          onResult({
            transcript,
            confidence: 0.99,
            alternatives: [transcript, rawText],
          });
          onEnd();
        } catch (err) {
          console.error('STT fetch failed:', err);
          this.restoreBgm();
          onError('Speech recognition connection error. Please tap to try again.');
          onEnd();
        }
      };

      recorder.onerror = () => {
        this.isListening = false;
        this.cleanupStream();
        this.restoreBgm();
        if (!this.discardNextStop) {
          onError('Microphone recording error. Please tap to try again.');
          onEnd();
        }
      };

      recorder.start(100);

      // Auto-stop after 2.2s (optimal single-word / short phrase duration to prevent silence hallucinations)
      this.autoStopTimer = setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, 2200);
    } catch (err: any) {
      this.restoreBgm();
      this.isListening = false;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        onError('Microphone permission was denied. Please allow microphone access in Chrome settings.');
      } else {
        onError('Could not start microphone recording. Please tap to try again.');
      }
      onEnd();
    }
  }

  private cleanupStream() {
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.mediaStream = null;
    }
  }

  /**
   * Stop listening and transcribe speech captured so far (when user taps mic to say they finished)
   */
  stop() {
    this.discardNextStop = false;
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }

    if (this.browserRecognition) {
      try {
        this.browserRecognition.stop();
      } catch {}
    }
  }

  /**
   * Cancel listening and discard any recorded audio (when user navigates away or answers directly)
   */
  cancel() {
    this.discardNextStop = true;
    this.cleanupStream();
    this.restoreBgm();

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder = null;
    }

    if (this.browserRecognition) {
      try {
        this.browserRecognition.onstart = null;
        this.browserRecognition.onresult = null;
        this.browserRecognition.onerror = null;
        this.browserRecognition.onend = null;
        this.browserRecognition.stop();
      } catch {
        try {
          this.browserRecognition.abort();
        } catch {}
      }
      this.browserRecognition = null;
    }

    this.isListening = false;
  }
}
