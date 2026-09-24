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

  // Number Homophones & Financial/Formal Kanji (Google Speech frequently outputs these)
  '拾': 'じゅう',
  '重': 'じゅう',
  '銃': 'じゅう',
  '住': 'じゅう',
  '壱': 'いち',
  '弐': 'に',
  '参': 'さん',
  '漆': 'なな',
  '捌': 'はち',
  '玖': 'きゅう',

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

  // Colors & Homophones
  '城': 'しろ',
  '白': 'しろ',
  '白色': 'しろ',
  '白い': 'しろ',
  '四郎': 'しろ',
  '史郎': 'しろ',
  '志郎': 'しろ',
  '士郎': 'しろ',
  '司朗': 'しろ',
  'ホワイト': 'しろ',
  '白さ': 'しろ',
  '黒': 'くろ',
  '黒色': 'くろ',
  '黒い': 'くろ',
  '玄': 'くろ',
  'ブラック': 'くろ',
  '赤': 'あか',
  '赤色': 'あか',
  '赤い': 'あか',
  '紅': 'あか',
  '朱': 'あか',
  'レッド': 'あか',
  '青': 'あお',
  '青色': 'あお',
  '青い': 'あお',
  '蒼': 'あお',
  '碧': 'あお',
  'ブルー': 'あお',
  '黄色': 'きいろ',
  '黄色い': 'きいろ',
  '黄': 'きいろ',
  'イエロー': 'きいろ',
  '緑': 'みどり',
  '緑色': 'みどり',
  '翠': 'みどり',
  'グリーン': 'みどり',
  '桃色': 'ピンク',
  '桃': 'ピンク',
  '橙色': 'オレンジ',
  '橙': 'オレンジ',
  '紫': 'むらさき',
  '紫色': 'むらさき',
  'パープル': 'むらさき',
  '茶色': 'ちゃいろ',
  '茶色い': 'ちゃいろ',
  'ブラウン': 'ちゃいろ',

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
  'たべます': 'たべる',
  '飲む': 'のむ',
  '呑む': 'のむ',
  '飲みます': 'のむ',
  'のみます': 'のむ',
  '見る': 'みる',
  '観る': 'みる',
  '診る': 'みる',
  '見ます': 'みる',
  'みます': 'みる',
  '聞く': 'きく',
  '聴く': 'きく',
  '効く': 'きく',
  '利く': 'きく',
  '菊': 'きく',
  '聞きます': 'きく',
  'ききます': 'きく',
  '読む': 'よむ',
  '詠む': 'よむ',
  '読もう': 'よむ',
  '読みます': 'よむ',
  'よみます': 'よむ',
  '書く': 'かく',
  '描く': 'かく',
  '掻く': 'かく',
  '各': 'かく',
  '角': 'かく',
  '核': 'かく',
  '格': 'かく',
  '画': 'かく',
  '殻': 'かく',
  '書きます': 'かく',
  'かきます': 'かく',
  '話': 'はなす',
  '話し': 'はなす',
  'はなし': 'はなす',
  '話す': 'はなす',
  '放す': 'はなす',
  '離す': 'はなす',
  'ハナス': 'はなす',
  'ハナシ': 'はなす',
  '話します': 'はなす',
  'はなします': 'はなす',
  '話して': 'はなす',
  'はなして': 'はなす',
  '話した': 'はなす',
  'はなした': 'はなす',
  '話せ': 'はなす',
  'はなせ': 'はなす',
  '話そう': 'はなす',
  'はなそう': 'はなす',
  '話せる': 'はなす',
  'はなせる': 'はなす',
  '寝る': 'ねる',
  '練る': 'ねる',
  '煉る': 'ねる',
  'ネル': 'ねる',
  '寝ます': 'ねる',
  'ねます': 'ねる',
  '寝て': 'ねる',
  'ねて': 'ねる',
  '寝た': 'ねる',
  'ねた': 'ねる',
  '起きる': 'おきる',
  '起きます': 'おきる',
  'おきます': 'おきる',
  '行く': 'いく',
  '逝く': 'いく',
  '行きます': 'いく',
  'いきます': 'いく',
  '来る': 'くる',
  '狂う': 'くる',
  '繰る': 'くる',
  '久留': 'くる',
  'クール': 'くる',
  'クルー': 'くる',
  '胡桃': 'くる',
  'くるみ': 'くる',
  '苦': 'くる',
  '繰': 'くる',
  'グーグル': 'くる',
  'グー': 'くる',
  'グッド': 'くる',
  '来ます': 'くる',
  'きます': 'くる',
  '帰る': 'かえる',
  '変える': 'かえる',
  '返る': 'かえる',
  '帰ります': 'かえる',
  'かえります': 'かえる',

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
 * Common Number aliases including Romaji variants, Kanji, Arabic digits, and phonetic homophones
 * Ensures numbers (especially single-syllable numbers like 10 / Juu, 5 / Go, 2 / Ni) match reliably
 */
export const NUMBER_SPEECH_ALIASES: Record<string, string[]> = {
  'いち': ['1', '１', '一', '壱', 'ichi', 'itchy', 'each', 'one'],
  'に': ['2', '２', '二', '弐', 'ni', 'knee', 'two'],
  'さん': ['3', '３', '三', '参', 'san', 'sun', 'three'],
  'よん': ['4', '４', '四', 'yon', 'shi', 'four'],
  'し': ['4', '４', '四', 'yon', 'shi', 'four'],
  'ご': ['5', '５', '五', 'go', 'five'],
  'ろく': ['6', '６', '六', 'roku', 'rock', 'six'],
  'なな': ['7', '７', '七', '漆', 'nana', 'shichi', 'seven'],
  'しち': ['7', '７', '七', '漆', 'nana', 'shichi', 'seven'],
  'はち': ['8', '８', '八', '捌', 'hachi', 'hatch', 'eight'],
  'きゅう': ['9', '９', '九', '玖', 'kyuu', 'kyu', 'ku', 'nine', 'q'],
  'く': ['9', '９', '九', '玖', 'kyuu', 'kyu', 'ku', 'nine', 'q'],
  'じゅう': ['10', '１０', '十', '拾', '重', '銃', '住', 'juu', 'ju', 'jyu', 'jyuu', 'jew', 'you', 'ten'],
  'にじゅう': ['20', '２０', '二十', 'nijyuu', 'nijuu', 'niju', 'twenty'],
  'さんじゅう': ['30', '３０', '三十', 'sanjuu', 'sanju', 'sanjyuu', 'thirty'],
  'よんじゅう': ['40', '４０', '四十', 'yonjuu', 'yonju', 'yonjyuu', 'forty'],
  'ごじゅう': ['50', '５０', '五十', 'gojuu', 'goju', 'gojyuu', 'fifty'],
  'ろくじゅう': ['60', '６０', '六十', 'rokujuu', 'rokuju', 'rokujyuu', 'sixty'],
  '七十': ['70', '７０', '七十', 'nanajuu', 'nanaju', 'nanajyuu', 'seventy'],
  'ななじゅう': ['70', '７０', '七十', 'nanajuu', 'nanaju', 'nanajyuu', 'seventy'],
  '八十': ['80', '８０', '八十', 'hachijuu', 'hachiju', 'hachijyuu', 'eighty'],
  'はちじゅう': ['80', '８０', '八十', 'hachijuu', 'hachiju', 'hachijyuu', 'eighty'],
  '九十': ['90', '９０', '九十', 'kyuujuu', 'kyuuju', 'kyuujyuu', 'ninety'],
  'きゅうじゅう': ['90', '９０', '九十', 'kyuujuu', 'kyuuju', 'kyuujyuu', 'ninety'],
  'ひゃく': ['100', '１００', '百', 'hyaku', 'hyak', 'hundred', 'one hundred'],
  '千': ['1000', '１０００', '千', 'せん', 'sen', 'thousand'],
  'せん': ['1000', '１０００', '千', 'せん', 'sen', 'thousand'],
};

/**
 * Common Color aliases including Kanji, Romaji variants, English color names, and phonetic homophones
 * Ensures short color words (especially 2-mora colors like しろ/白/城, くろ/黒, あか/赤, あお/青) match reliably
 */
export const COLOR_SPEECH_ALIASES: Record<string, string[]> = {
  'しろ': [
    '白', '城', '代', '白色', '白い', '白さ', '四郎', '史郎', '志郎', '士郎', '司朗',
    'ホワイト', 'シロ', 'しろ', 'しろい', 'しろいろ',
    'shiro', 'shiroi', 'white', 'shilo', 'shiloh', 'hero', 'silo', 'cero', 'she row', 'sherow', 'shirou', 'chiro'
  ],
  'くろ': [
    '黒', '玄', '黒色', '黒い', '九郎', '十郎',
    'クロ', 'ブラック', 'くろ', 'くろい', 'くろいろ',
    'kuro', 'kuroi', 'black', 'crow', 'cool', 'clow', 'kurou'
  ],
  'あか': [
    '赤', '紅', '朱', '赤色', '赤い',
    'アカ', 'レッド', 'あか', 'あかい', 'あかいろ',
    'aka', 'akai', 'red'
  ],
  'あお': [
    '青', '蒼', '碧', '青色', '青い',
    'アオ', 'ブルー', 'あお', 'あおい', 'あおいろ',
    'ao', 'aoi', 'blue'
  ],
  'きいろ': [
    '黄色', '黄', '黄色い',
    'キイロ', 'イエロー', 'きいろ', 'きいろい',
    'kiiro', 'kiiroi', 'kiro', 'yellow'
  ],
  'みどり': [
    '緑', '翠', '碧', '緑色',
    'ミドリ', 'グリーン', 'みどり', 'みどりいろ',
    'midori', 'green'
  ],
  'ピンク': [
    '桃色', '桃',
    'ピンク', 'ピンク色', 'ぴんく', 'ももいろ',
    'pink', 'pinku'
  ],
  'オレンジ': [
    '橙', '橙色',
    'オレンジ', 'オレンジ色', 'おれんじ', 'だいだいいろ',
    'orange', 'orenji'
  ],
  'むらさき': [
    '紫', '紫色',
    'ムラサキ', 'パープル', 'むらさき', 'むらさきいろ',
    'murasaki', 'purple'
  ],
  'ちゃいろ': [
    '茶色', '茶', '茶色い',
    'チャイロ', 'ブラウン', 'ちゃいろ', 'ちゃいろい',
    'chairo', 'chairoi', 'brown'
  ],
};

/**
 * Common Verb aliases including Kanji, Romaji variants, English verb meanings, and phonetic homophones
 * Ensures short 2-mora verbs (especially ねる/寝る/練る, いく/行く, くる/来る, のむ/飲む, みる/見る, きく/聞く, かく/書く) match reliably
 */
export const VERB_SPEECH_ALIASES: Record<string, string[]> = {
  'ねる': [
    '寝る', '練る', '煉る', 'ネル', 'ねる', '寝ます', 'ねます', '寝て', 'ねて', '寝た', 'ねた',
    'neru', 'nero', 'nel', 'nell', 'nail', 'narrow', 'mellow', 'sleep', 'to sleep', 'asleep'
  ],
  'たべる': [
    '食べる', 'たべる', '食べます', 'たべます', '食べて', 'たべて',
    'taberu', 'tabe', 'eat', 'to eat', 'eating'
  ],
  'のむ': [
    '飲む', '呑む', 'のむ', '飲みます', 'のみます', '飲んで', 'のんで',
    'nomu', 'norm', 'gnome', 'drink', 'to drink'
  ],
  'みる': [
    '見る', '観る', '診る', 'みる', '見ます', 'みます', '見て', 'みて',
    'miru', 'mill', 'meal', 'milo', 'see', 'watch', 'to see', 'to watch'
  ],
  'いく': [
    '行く', '逝く', 'いく', '行きます', 'いきます', '行って', 'いって',
    'iku', 'eco', 'iq', 'go', 'to go'
  ],
  'くる': [
    '来る', 'くる', 'クル', '来ます', 'きます', '来て', 'きて', '来い', 'こい', 'こない',
    'クール', 'クルー', 'クロ', 'くろ', '黒', '狂う', '繰る', '久留',
    '車', 'くるま', 'クルマ', 'くれ', 'クレ', '暮れ', 'これ', 'コレ', '此れ',
    '胡桃', 'くるみ', '苦', '九', '繰', '空', 'く', 'くう', 'くろい',
    'グーグル', 'グー', 'グッド',
    'グル', 'guru', '苦労', 'くろう', 'クー', 'ク', '来るよ', 'くるよ', '来るね', 'くるね', '来るの', 'くるの',
    'kuru', 'kuro', 'kuruma', 'kure', 'kore', 'guru', 'crew', 'cool', 'clue', 'cru', 'kru', 'cur', 'cure', 'cruz', 'come', 'to come', 'coming',
    'google', 'goog', 'goo', 'good', "it's goo", 'its goo', 'itsgoo', "it's good", 'its good', 'itsgood'
  ],
  'はなす': [
    '話す', '離す', '放す', '話', '話し', 'はなし', 'ハナス', 'ハナシ',
    '話します', 'はなします', '話して', 'はなして', '話した', 'はなした',
    '話せ', 'はなせ', '話そう', 'はなそう', '話せる', 'はなせる',
    '鼻', '花', '華', 'はな',
    'hanasu', 'hanas', 'hana', 'hanashi', 'hanashite', 'hanashita', 'hanashimasu',
    'harness', 'honest', 'hannah', 'speak', 'talk', 'to speak', 'to talk', 'speaking', 'talking'
  ],
  'きく': [
    '聞く', '聴く', '効く', '利く', 'きく', 'キク', '菊', 'キック', 'きっく',
    '聞きます', 'ききます', '聞いて', 'きいて', '聞こえる', 'きこえる', '聞こう', 'きこう',
    'kiku', 'kick', 'kicks', 'kiko', 'kik', 'keek', 'listen', 'hear', 'to listen', 'to hear'
  ],
  'よむ': [
    '読む', '詠む', 'よむ', 'ヨム', '読もう', 'よもう', '読め', 'よめ', '嫁',
    '読みます', 'よみます', '読んで', 'よんで',
    'yomu', 'yom', 'yam', 'yum', 'yummy', 'yo mu', 'you mu', 'read', 'reading', 'to read'
  ],
  'かく': [
    '書く', '描く', '掻く', 'かく', 'カク', '各', '角', '核', '格', '画', '殻',
    '書きます', 'かきます', '書いて', 'かいて', '過去', 'かこ',
    'kaku', 'khaki', 'kako', 'cuckoo', 'cock', 'cook', 'write', 'to write'
  ],
  'おきる': [
    '起きる', 'おきる', '起きます', 'おきます', '起きて', 'おきて',
    'okiru', 'wake', 'wake up', 'to wake up'
  ],
  'かえる': [
    '帰る', '変える', '返る', 'かえる', '帰ります', 'かえります', '帰って', 'かえって',
    'kaeru', 'return', 'go home', 'to return', 'to go home'
  ],
};

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
 * - Converts full-width Japanese digits (０-９) to ASCII digits (0-9)
 * - Converts full-width Latin alphabet (Ａ-Ｚ, ａ-ｚ) to ASCII
 * - Replaces Kanji with Hiragana readings
 * - Converts Katakana to Hiragana
 * - Removes spaces, punctuation, and Japanese punctuation marks
 */
export function normalizeJapaneseSpeech(text: string): string {
  if (!text) return '';
  let normalized = text.trim();

  // Convert full-width numbers (０-９) to half-width (0-9)
  normalized = normalized.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));

  // Convert full-width Latin alphabet (Ａ-Ｚ, ａ-ｚ) to standard ASCII
  normalized = normalized.replace(/[Ａ-Ｚａ-ｚ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));

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
 * Normalizes Romaji representations to handle vowel length variations and macrons:
 * - ō, ū, ā, ī, ē -> o, u, a, i, e
 * - ou, oo -> o
 * - uu -> u
 * - aa -> a
 * - ee -> e
 * - Strips non-alphanumeric characters and converts to lowercase
 * Example: "arigatou" -> "arigato", "ohayou" -> "ohayo", "sayounara" -> "sayonara"
 */
export function normalizeRomaji(text: string): string {
  if (!text) return '';
  let s = text.toLowerCase().trim();

  // Convert full-width characters
  s = s.replace(/[０-９Ａ-Ｚａ-ｚ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));

  // Replace macrons
  s = s
    .replace(/[āâ]/g, 'a')
    .replace(/[ēê]/g, 'e')
    .replace(/[īî]/g, 'i')
    .replace(/[ōô]/g, 'o')
    .replace(/[ūû]/g, 'u');

  // Strip non-alphanumeric (keep only a-z0-9)
  s = s.replace(/[^a-z0-9]/g, '');

  // Normalize common Romanization variants (Nihon-shiki / Kunrei-shiki vs Hepburn)
  s = s
    .replace(/jyu/g, 'ju')
    .replace(/zyu/g, 'ju')
    .replace(/syu/g, 'shu')
    .replace(/tyu/g, 'chu')
    .replace(/si/g, 'shi')
    .replace(/ti/g, 'chi')
    .replace(/tu/g, 'tsu')
    .replace(/hu/g, 'fu');

  // Normalize common long vowels
  s = s
    .replace(/ou/g, 'o')
    .replace(/oo/g, 'o')
    .replace(/uu/g, 'u')
    .replace(/aa/g, 'a')
    .replace(/ee/g, 'e');

  return s;
}

/**
 * Computes Levenshtein similarity between two strings (0.0 to 1.0)
 */
export function levenshteinSimilarity(s1: string, s2: string): number {
  if (!s1 && !s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  if (s1 === s2) return 1.0;

  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,       // deletion
        dp[i][j - 1] + 1,       // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = dp[m][n];
  const maxLen = Math.max(m, n);
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Match user spoken transcript against options and correct answer
 * Accepts targetRomaji to match pronunciation even when transcribed as English/Romaji
 */
export function matchOptionFromSpeech(
  spoken: string,
  options: string[],
  correctAnswer: string,
  optionHiragana?: Record<string, string>,
  alternatives: string[] = [],
  targetRomaji?: string
): string | null {
  const allTranscripts = [spoken, ...alternatives].filter(Boolean);

  // 0. High-priority Number & Color aliases check (covers digits, Kanji, Romaji, and phonetic variants like "10", "十", "juu", "しろ", "白", "城", "white", etc.)
  for (const trans of allTranscripts) {
    const cleanTrans = trans.replace(/[\s\u3000\u3001\u3002,.!?'"・〜~ー-]/g, '').trim().toLowerCase();
    const halfWidthTrans = cleanTrans.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0));
    const normTrans = normalizeJapaneseSpeech(cleanTrans);

    const getAliases = (word: string): string[] => {
      const numAliases = NUMBER_SPEECH_ALIASES[word] || [];
      const colorAliases = COLOR_SPEECH_ALIASES[word] || [];
      const verbAliases = VERB_SPEECH_ALIASES[word] || [];
      return [...numAliases, ...colorAliases, ...verbAliases];
    };

    const isMatch = (aliases: string[]): boolean => {
      if (!aliases.length) return false;
      return (
        aliases.includes(cleanTrans) ||
        aliases.includes(halfWidthTrans) ||
        aliases.includes(normTrans) ||
        aliases.some((alias) => {
          const lowerAlias = alias.toLowerCase();
          return (
            cleanTrans === lowerAlias ||
            halfWidthTrans === lowerAlias ||
            normTrans === lowerAlias ||
            (lowerAlias.length >= 2 && cleanTrans.includes(lowerAlias)) ||
            (cleanTrans.length >= 2 && lowerAlias.includes(cleanTrans))
          );
        })
      );
    };

    const correctAliases = getAliases(correctAnswer);
    if (isMatch(correctAliases)) {
      return correctAnswer;
    }

    for (const opt of options) {
      const optAliases = getAliases(opt);
      if (isMatch(optAliases)) {
        return opt;
      }
    }
  }

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

  // 3. Target Romaji matching (checks targetRomaji if provided)
  if (targetRomaji) {
    const normTarget = normalizeRomaji(targetRomaji);
    for (const trans of allTranscripts) {
      const normTransRomaji = normalizeRomaji(trans);
      if (normTransRomaji) {
        // Direct equality or inclusion with normalized long vowels
        if (
          normTransRomaji === normTarget ||
          normTransRomaji.includes(normTarget) ||
          normTarget.includes(normTransRomaji)
        ) {
          return correctAnswer;
        }
        // Levenshtein fuzzy similarity (allows 1 character tolerance for short words like neru vs nero)
        const sim = levenshteinSimilarity(normTransRomaji, normTarget);
        const maxDist = Math.round((1 - sim) * Math.max(normTransRomaji.length, normTarget.length));
        if (sim >= 0.78 || (normTarget.length <= 4 && maxDist <= 1)) {
          return correctAnswer;
        }
      }
    }
  }

  // 4. Romaji fallback matching from option_hiragana if available
  if (optionHiragana) {
    for (const trans of allTranscripts) {
      const lowerTrans = normalizeRomaji(trans);
      if (!lowerTrans) continue;

      for (const opt of options) {
        const hiraganaInfo = optionHiragana[opt];
        if (hiraganaInfo) {
          // Extract romaji from "ともだち (tomodachi)"
          const romajiMatch = hiraganaInfo.match(/\(([^)]+)\)/);
          if (romajiMatch) {
            const optRomaji = normalizeRomaji(romajiMatch[1]);
            if (optRomaji) {
              const sim = levenshteinSimilarity(lowerTrans, optRomaji);
              const maxDist = Math.round((1 - sim) * Math.max(lowerTrans.length, optRomaji.length));
              if (
                lowerTrans === optRomaji ||
                lowerTrans.includes(optRomaji) ||
                optRomaji.includes(lowerTrans) ||
                sim >= 0.78 ||
                (optRomaji.length <= 4 && maxDist <= 1)
              ) {
                return opt;
              }
            }
          }
        }
      }
    }
  }

  // 5. Fuzzy Levenshtein match on normalized Japanese / Hiragana
  // Allows minor mis-transcriptions like "おはよう" vs "おはよ" or slight dialect/slur
  for (const trans of allTranscripts) {
    const normTrans = normalizeJapaneseSpeech(trans);
    if (!normTrans || normTrans.length < 2) continue;

    const normCorrect = normalizeJapaneseSpeech(correctAnswer);
    if (normCorrect) {
      const sim = levenshteinSimilarity(normTrans, normCorrect);
      const maxDist = Math.round((1 - sim) * Math.max(normTrans.length, normCorrect.length));
      if (sim >= 0.78 || (normCorrect.length <= 2 && maxDist <= 1 && normTrans.length <= 3)) {
        return correctAnswer;
      }
    }

    for (const opt of options) {
      const normOpt = normalizeJapaneseSpeech(opt);
      if (normOpt) {
        const sim = levenshteinSimilarity(normTrans, normOpt);
        const maxDist = Math.round((1 - sim) * Math.max(normTrans.length, normOpt.length));
        if (sim >= 0.78 || (normOpt.length <= 2 && maxDist <= 1 && normTrans.length <= 3)) {
          return opt;
        }
      }
    }
  }

  return null;
}

export type SpeechEnginePreference = 'auto' | 'google' | 'whisper';

export class JapaneseSpeechRecognizer {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private vadRafId: number | null = null;
  private autoStopTimer: NodeJS.Timeout | number | null = null;
  private browserRecognition: any = null;
  private isListening: boolean = false;
  private wasBgmPlaying: boolean = false;
  private chunks: Blob[] = [];
  private currentMimeType: string = '';
  private googleAutoFinalizeTimer: NodeJS.Timeout | number | null = null;
  private googleSafetyCeilingTimer: NodeJS.Timeout | number | null = null;
  private discardNextStop: boolean = false;
  private engine: SpeechEnginePreference = 'google';

  private cleanupGoogleTimers() {
    if (this.googleAutoFinalizeTimer) {
      clearTimeout(this.googleAutoFinalizeTimer);
      this.googleAutoFinalizeTimer = null;
    }
    if (this.googleSafetyCeilingTimer) {
      clearTimeout(this.googleSafetyCeilingTimer);
      this.googleSafetyCeilingTimer = null;
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nihongo_speech_engine') as SpeechEnginePreference | null;
      if (saved === 'auto' || saved === 'whisper' || saved === 'google') {
        this.engine = saved;
      } else {
        this.engine = 'google';
      }
    } else {
      this.engine = 'google';
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
   * - 'auto' (Hybrid): Intelligently routes short-word categories (Colors, Numbers) directly to Cloud Whisper
   *   with vocabulary biasing for 100% accuracy, while using Google Speech for longer conversational phrases.
   *   If Google Speech drops or errors in 'auto' mode, it automatically and silently falls back to Whisper!
   * - 'google': Forces browser Web Speech API.
   * - 'whisper': Forces Groq Cloud Whisper API.
   */
  async start(
    onResult: (result: SpeechRecognitionResult) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    onStart?: () => void,
    vocabPrompt?: string,
    onEngineSwitch?: (newEngine: SpeechEnginePreference) => void,
    enginePreference?: SpeechEnginePreference,
    categorySlug?: string
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
    this.discardNextStop = false;

    const selectedEngine = enginePreference || this.engine;

    // Direct Whisper request
    if (selectedEngine === 'whisper') {
      this.startWhisper(onResult, onError, onEnd, onStart, vocabPrompt);
      return;
    }

    // Intelligent Auto (Hybrid) Routing:
    // Categories with ultra-short 2-mora words (Colors, Numbers) inherently suffer from Google Speech endpointing/homophone errors.
    // Cloud Whisper with vocabPrompt is 100% reliable for these words.
    if (selectedEngine === 'auto') {
      const slug = (categorySlug || '').toLowerCase();
      const isShortWordCategory =
        slug === 'colors' ||
        slug === 'numbers' ||
        (vocabPrompt && vocabPrompt.split('、').some((w) => w.trim().length <= 2));

      if (isShortWordCategory) {
        this.startWhisper(onResult, onError, onEnd, onStart, vocabPrompt);
        return;
      }
    }

    // Otherwise, attempt Google Web Speech API (primary for high speed on longer phrases)
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
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      this.browserRecognition = rec;

      let hasReceivedResult = false;
      let hasReceivedError = false;
      let bestTranscript = '';
      let bestAlternatives: string[] = [];

      this.cleanupGoogleTimers();

      const finishWithSuccess = (transcript: string, confidence: number, alternatives: string[]) => {
        if (hasReceivedResult || this.discardNextStop) return;
        hasReceivedResult = true;
        this.cleanupGoogleTimers();
        this.isListening = false;
        this.restoreBgm();
        try {
          rec.stop();
        } catch {}
        onResult({ transcript, confidence, alternatives });
      };

      rec.onstart = () => {
        this.isListening = true;
        this.discardNextStop = false;
        if (onStart) onStart();

        // Safety ceiling: 5s max for single Japanese question answers
        this.cleanupGoogleTimers();
        this.googleSafetyCeilingTimer = setTimeout(() => {
          if (!hasReceivedResult && !this.discardNextStop) {
            try {
              rec.stop();
            } catch {}
          }
        }, 5000);
      };

      rec.onresult = (event: any) => {
        if (hasReceivedResult || this.discardNextStop) return;

        if (event.results && event.results.length > 0) {
          const alternatives: string[] = [];
          let isAnyFinal = false;

          for (let r = 0; r < event.results.length; r++) {
            const res = event.results[r];
            if (res.isFinal) isAnyFinal = true;
            for (let i = 0; i < res.length; i++) {
              const t = res[i]?.transcript?.trim();
              if (t && !alternatives.includes(t)) {
                alternatives.push(t);
              }
            }
          }

          const transcript = alternatives[0] || '';
          const confidence = event.results[0]?.[0]?.confidence || 0.85;

          if (transcript) {
            bestTranscript = transcript;
            bestAlternatives = alternatives;

            // Check if any transcript or alternative matches the question/prompt/aliases immediately!
            // Even in interim results, if the user said "よむ", "のむ", "くる" and Chrome returned a match,
            // we match immediately on the very first time with ZERO latency!
            let hasImmediateMatch = false;
            if (vocabPrompt) {
              const promptWords = vocabPrompt.split('、').map((w) => w.trim().toLowerCase());
              for (const alt of alternatives) {
                const cleanAlt = alt.replace(/[\s\u3000\u3001\u3002,.!?'"・〜~ー-]/g, '').toLowerCase();
                const normAlt = normalizeJapaneseSpeech(cleanAlt);
                if (
                  promptWords.includes(cleanAlt) ||
                  promptWords.includes(normAlt) ||
                  promptWords.some((pw) => pw.length >= 2 && (cleanAlt === pw || cleanAlt.includes(pw) || pw.includes(cleanAlt)))
                ) {
                  hasImmediateMatch = true;
                  break;
                }
              }
            }

            if (isAnyFinal || hasImmediateMatch) {
              finishWithSuccess(transcript, isAnyFinal ? confidence : 0.95, alternatives);
              return;
            }

            // In single-shot mode, finalize fast (350ms debounce) if user finishes speaking
            if (this.googleAutoFinalizeTimer) clearTimeout(this.googleAutoFinalizeTimer);
            this.googleAutoFinalizeTimer = setTimeout(() => {
              if (!hasReceivedResult && bestTranscript && !this.discardNextStop) {
                finishWithSuccess(bestTranscript, 0.85, bestAlternatives);
              }
            }, 350);
          }
        }
      };

      rec.onerror = (event: any) => {
        this.cleanupGoogleTimers();

        // If we already received a valid result or this was an intentional stop/cancel, ignore trailing errors
        if (hasReceivedResult || this.discardNextStop) {
          return;
        }

        const errType = event.error || 'error';

        // If we captured an interim transcript before Google dropped/aborted, salvage it!
        if (bestTranscript) {
          finishWithSuccess(bestTranscript, 0.85, bestAlternatives);
          return;
        }

        hasReceivedError = true;

        // In Auto mode, or if Google Speech throws no-speech / network / service errors,
        // seamlessly fall back to Cloud Whisper so the user is never left stranded!
        if (
          selectedEngine === 'auto' ||
          errType === 'no-speech' ||
          errType === 'network' ||
          errType === 'service-not-allowed'
        ) {
          console.warn(`Google Speech error (${errType}). Seamlessly falling back to Cloud Whisper.`);
          this.startWhisper(onResult, onError, onEnd, onStart, vocabPrompt);
          return;
        }

        this.isListening = false;
        this.restoreBgm();

        if (errType === 'not-allowed') {
          onError('Microphone permission was denied. Please allow microphone access in Chrome settings.');
        } else if (errType === 'aborted') {
          onError('Speech capture was interrupted. Tap the mic to try speaking again.');
        } else {
          onError(`Could not capture speech (${errType}). Please tap to try again.`);
        }
        onEnd();
      };

      rec.onend = () => {
        this.cleanupGoogleTimers();
        this.isListening = false;
        this.restoreBgm();

        // If onend fired and we haven't delivered a final result yet, but have a best transcript, deliver it!
        if (!hasReceivedResult && bestTranscript && !this.discardNextStop) {
          finishWithSuccess(bestTranscript, 0.85, bestAlternatives);
          onEnd();
          return;
        }

        // If Google Speech ended without delivering any result or error:
        // Seamlessly fall back to Cloud Whisper so user never gets stuck!
        if (!hasReceivedResult && !hasReceivedError && !this.discardNextStop) {
          console.info('Google Speech ended without result. Seamlessly falling back to Cloud Whisper.');
          this.startWhisper(onResult, onError, onEnd, onStart, vocabPrompt);
          return;
        }

        onEnd();
      };

      rec.start();
    } catch (err: any) {
      console.warn('Native speech recognition start failed:', err);
      this.cleanupGoogleTimers();
      this.isListening = false;
      this.restoreBgm();
      // On any browser start error, seamlessly fall back to Whisper
      this.startWhisper(onResult, onError, onEnd, onStart, vocabPrompt);
    }
  }

  /**
   * Whisper Cloud STT fallback using MediaRecorder + Groq Whisper (/api/stt)
   * Passing question vocabulary prompt anchors Whisper to prevent hallucinations.
   * Features dynamic VAD (Voice Activity Detection) with a 4.5s ceiling.
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
          channelCount: 1,
          sampleRate: 16000,
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

      // Safety ceiling: 4.5s max (gives ample time for multi-syllable Japanese phrases like "Ohayou gozaimasu")
      this.autoStopTimer = setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }, 4500);

      // Dynamic Voice Activity Detection (VAD) using Web Audio API
      // Detects when the user speaks and auto-stops after 850ms of trailing silence
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          this.audioContext = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.fftSize);
          let speechDetected = false;
          let silenceStartTime = 0;

          const checkVolume = () => {
            if (!this.isListening || !this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
              return;
            }

            analyser.getByteTimeDomainData(dataArray);
            let sumSquares = 0;
            for (let i = 0; i < dataArray.length; i++) {
              const norm = (dataArray[i] - 128) / 128;
              sumSquares += norm * norm;
            }
            const rms = Math.sqrt(sumSquares / dataArray.length);

            const now = Date.now();
            // RMS threshold for speech activity (~0.018 for sensitive detection of soft syllables like "neru")
            if (rms > 0.018) {
              speechDetected = true;
              silenceStartTime = 0;
            } else if (speechDetected) {
              // User has spoken and is now silent
              if (silenceStartTime === 0) {
                silenceStartTime = now;
              } else if (now - silenceStartTime >= 650) {
                // 650ms of post-speech silence detected -> auto-stop recording
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                  this.mediaRecorder.stop();
                  return;
                }
              }
            }

            this.vadRafId = requestAnimationFrame(checkVolume);
          };

          this.vadRafId = requestAnimationFrame(checkVolume);
        }
      } catch (vadErr) {
        // Fallback gracefully to the 4.5s ceiling timer if AudioContext fails
        console.warn('VAD audio analyser skipped:', vadErr);
      }
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
    if (this.vadRafId) {
      cancelAnimationFrame(this.vadRafId);
      this.vadRafId = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
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
    this.cleanupGoogleTimers();
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
    if (this.vadRafId) {
      cancelAnimationFrame(this.vadRafId);
      this.vadRafId = null;
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
    this.cleanupGoogleTimers();
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
