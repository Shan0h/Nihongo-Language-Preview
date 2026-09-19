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
    const cleanTrans = trans.trim();
    const normTrans = normalizeJapaneseSpeech(cleanTrans);

    for (const opt of options) {
      const normOpt = normalizeJapaneseSpeech(opt);
      if (opt === cleanTrans || normOpt === normTrans) {
        return opt;
      }
    }

    // Check correct answer direct/normalized match
    const normCorrect = normalizeJapaneseSpeech(correctAnswer);
    if (correctAnswer === cleanTrans || normCorrect === normTrans) {
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

export class JapaneseSpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;
  private userStopped: boolean = false;
  private wasBgmPlaying: boolean = false;

  private restoreBgm() {
    if (this.wasBgmPlaying) {
      try {
        bgm.start();
      } catch {}
      this.wasBgmPlaying = false;
    }
  }

  /**
   * Start listening for Japanese speech
   */
  start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    onStart?: () => void
  ) {
    if (typeof window === 'undefined') return;

    // 1. Immediately release Android audio focus: stop active TTS audio playback and unload src
    stopJapaneseSpeech();

    // 2. Pause background music so device audio output does not collide with microphone capture
    try {
      if (bgm.getIsPlaying()) {
        this.wasBgmPlaying = true;
        bgm.stop();
      }
    } catch {}

    // 3. Mobile Secure Context check: Android Chrome strictly requires HTTPS for microphone access
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      this.restoreBgm();
      onError('Microphone requires HTTPS on mobile devices. Please access via your secure Vercel deployment URL (https://...).');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.restoreBgm();
      onError('Microphone speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // 4. Clean up any existing session cleanly by detaching handlers first
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    this.userStopped = false;

    try {
      // 5. Always instantiate a fresh SpeechRecognition object
      const rec = new SpeechRecognition();
      rec.lang = 'ja-JP';
      rec.continuous = false; // Single-utterance mode is mandatory for mobile Android
      rec.interimResults = false;
      this.recognition = rec;

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
          onResult({ transcript, confidence, alternatives });
        }
      };

      rec.onerror = (event: any) => {
        this.isListening = false;
        this.restoreBgm();

        if (this.userStopped) {
          onEnd();
          return;
        }

        const err = event.error || 'unknown';

        if (err === 'not-allowed' || err === 'service-not-allowed') {
          onError('Microphone permission was denied. Tap the lock icon near the URL in Chrome to allow microphone access.');
        } else if (err === 'no-speech') {
          onError('No speech detected. Please speak closer to your microphone and try again.');
        } else if (err === 'network') {
          onError('Speech service network error. Please check your internet connection.');
        } else if (err === 'aborted') {
          onError('Speech recognition could not capture voice on this device. You can tap Continue to choose an answer or tap the mic to try again.');
        } else {
          onError(`Could not capture speech (${err}). Please tap to try again.`);
        }
      };

      rec.onend = () => {
        this.isListening = false;
        this.restoreBgm();
        onEnd();
      };

      rec.start();
    } catch (err: any) {
      this.isListening = false;
      this.restoreBgm();
      if (!this.userStopped) {
        console.warn('Speech recognition start failed:', err);
        onError('Could not start microphone. Please tap again.');
      }
    }
  }

  /**
   * Stop listening cleanly
   */
  stop() {
    this.userStopped = true;
    this.restoreBgm();
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
      } catch {
        try {
          this.recognition.abort();
        } catch {}
      }
      this.recognition = null;
      this.isListening = false;
    }
  }
}
