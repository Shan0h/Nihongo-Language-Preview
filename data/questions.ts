export interface Question {
  id: string;
  category: string;
  japanese_text: string;
  hiragana: string;
  romaji: string;
  english_translation: string;
  options: string[];
  correct_answer: string;
  image: string;
  option_hiragana?: Record<string, string>;
}

export interface Category {
  name: string;
  japanese: string;
  emoji: string;
  description: string;
  slug: string;
  difficulty: string;
  questionCount: number;
}

export const questions: Question[] = [
  // Greetings
  {
    id: "greet-1",
    category: "Greetings",
    japanese_text: "こんにちは",
    hiragana: "こんにちは",
    romaji: "Konnichiwa",
    english_translation: "Hello / Good afternoon",
    image: "👋",
    options: ["こんにちは", "こんばんは", "おはよう", "さようなら"],
    correct_answer: "こんにちは",
    option_hiragana: {
      "こんにちは": "こんにちは (konnichiwa)",
      "こんばんは": "こんばんは (konbanwa)",
      "おはよう": "おはよう (ohayou)",
      "さようなら": "さようなら (sayounara)"
    }
  },
  {
    id: "greet-2",
    category: "Greetings",
    japanese_text: "おはようございます",
    hiragana: "おはようございます",
    romaji: "Ohayou gozaimasu",
    english_translation: "Good morning (polite)",
    image: "🌅",
    options: ["おはようございます", "こんばんは", "ありがとう", "すみません"],
    correct_answer: "おはようございます",
    option_hiragana: {
      "おはようございます": "おはようございます (ohayou gozaimasu)",
      "こんばんは": "こんばんは (konbanwa)",
      "ありがとう": "ありがとう (arigatou)",
      "すみません": "すみません (sumimasen)"
    }
  },
  {
    id: "greet-3",
    category: "Greetings",
    japanese_text: "さようなら",
    hiragana: "さようなら",
    romaji: "Sayounara",
    english_translation: "Goodbye",
    image: "👋",
    options: ["おやすみ", "さようなら", "こんにちは", "おはよう"],
    correct_answer: "さようなら",
    option_hiragana: {
      "おやすみ": "おやすみ (oyasumi)",
      "さようなら": "さようなら (sayounara)",
      "こんにちは": "こんにちは (konnichiwa)",
      "おはよう": "おはよう (ohayou)"
    }
  },
  {
    id: "greet-4",
    category: "Greetings",
    japanese_text: "こんばんは",
    hiragana: "こんばんは",
    romaji: "Konbanwa",
    english_translation: "Good evening",
    image: "🌙",
    options: ["おはよう", "こんにちは", "こんばんは", "おやすみなさい"],
    correct_answer: "こんばんは",
    option_hiragana: {
      "おはよう": "おはよう (ohayou)",
      "こんにちは": "こんにちは (konnichiwa)",
      "こんばんは": "こんばんは (konbanwa)",
      "おやすみなさい": "おやすみなさい (oyasuminasai)"
    }
  },
  {
    id: "greet-5",
    category: "Greetings",
    japanese_text: "おやすみなさい",
    hiragana: "おやすみなさい",
    romaji: "Oyasuminasai",
    english_translation: "Good night",
    image: "🛏️",
    options: ["さようなら", "こんばんは", "おやすみなさい", "おはよう"],
    correct_answer: "おやすみなさい",
    option_hiragana: {
      "さようなら": "さようなら (sayounara)",
      "こんばんは": "こんばんは (konbanwa)",
      "おやすみなさい": "おやすみなさい (oyasuminasai)",
      "おはよう": "おはよう (ohayou)"
    }
  },
  // Numbers
  {
    id: "num-1",
    category: "Numbers",
    japanese_text: "いち",
    hiragana: "いち",
    romaji: "Ichi",
    english_translation: "One (1)",
    image: "1️⃣",
    options: ["いち", "に", "さん", "し"],
    correct_answer: "いち",
    option_hiragana: {
      "いち": "いち (ichi)",
      "に": "に (ni)",
      "さん": "さん (san)",
      "し": "し (shi)"
    }
  },
  {
    id: "num-2",
    category: "Numbers",
    japanese_text: "さん",
    hiragana: "さん",
    romaji: "San",
    english_translation: "Three (3)",
    image: "3️⃣",
    options: ["に", "さん", "よん", "ご"],
    correct_answer: "さん",
    option_hiragana: {
      "に": "に (ni)",
      "さん": "さん (san)",
      "よん": "よん (yon)",
      "ご": "ご (go)"
    }
  },
  {
    id: "num-3",
    category: "Numbers",
    japanese_text: "ご",
    hiragana: "ご",
    romaji: "Go",
    english_translation: "Five (5)",
    image: "5️⃣",
    options: ["し", "ろく", "ご", "なな"],
    correct_answer: "ご",
    option_hiragana: {
      "し": "し (shi)",
      "ろく": "ろく (roku)",
      "ご": "ご (go)",
      "なな": "なな (nana)"
    }
  },
  {
    id: "num-4",
    category: "Numbers",
    japanese_text: "じゅう",
    hiragana: "じゅう",
    romaji: "Juu",
    english_translation: "Ten (10)",
    image: "🔟",
    options: ["はち", "きゅう", "じゅう", "なな"],
    correct_answer: "じゅう",
    option_hiragana: {
      "はち": "はち (hachi)",
      "きゅう": "きゅう (kyuu)",
      "じゅう": "じゅう (juu)",
      "なな": "なな (nana)"
    }
  },
  // Food
  {
    id: "food-1",
    category: "Food",
    japanese_text: "ごはん",
    hiragana: "ごはん",
    romaji: "Gohan",
    english_translation: "Rice / Meal",
    image: "🍚",
    options: ["りんご", "ごはん", "パン", "さかな"],
    correct_answer: "ごはん",
    option_hiragana: {
      "りんご": "りんご (ringo)",
      "ごはん": "ごはん (gohan)",
      "パン": "ぱん (pan)",
      "さかな": "さかな (sakana)"
    }
  },
  {
    id: "food-2",
    category: "Food",
    japanese_text: "すし",
    hiragana: "すし",
    romaji: "Sushi",
    english_translation: "Sushi",
    image: "🍣",
    options: ["ラーメン", "すし", "うどん", "てんぷら"],
    correct_answer: "すし",
    option_hiragana: {
      "ラーメン": "らーめん (raamen)",
      "すし": "すし (sushi)",
      "うどん": "うどん (udon)",
      "てんぷら": "てんぷら (tempura)"
    }
  },
  {
    id: "food-3",
    category: "Food",
    japanese_text: "りんご",
    hiragana: "りんご",
    romaji: "Ringo",
    english_translation: "Apple",
    image: "🍎",
    options: ["みかん", "ぶどう", "りんご", "いちご"],
    correct_answer: "りんご",
    option_hiragana: {
      "みかん": "みかん (mikan)",
      "ぶどう": "ぶどう (budou)",
      "りんご": "りんご (ringo)",
      "いちご": "いちご (ichigo)"
    }
  },
  {
    id: "food-4",
    category: "Food",
    japanese_text: "ラーメン",
    hiragana: "らーめん",
    romaji: "Raamen",
    english_translation: "Ramen Noodles",
    image: "🍜",
    options: ["うどん", "そば", "ラーメン", "カレー"],
    correct_answer: "ラーメン",
    option_hiragana: {
      "うどん": "うどん (udon)",
      "そば": "そば (soba)",
      "ラーメン": "らーめん (raamen)",
      "カレー": "かれー (karee)"
    }
  },
  // Colors
  {
    id: "color-1",
    category: "Colors",
    japanese_text: "あか",
    hiragana: "あか",
    romaji: "Aka",
    english_translation: "Red",
    image: "🔴",
    options: ["あお", "あか", "きいろ", "みどり"],
    correct_answer: "あか",
    option_hiragana: {
      "あお": "あお (ao)",
      "あか": "あか (aka)",
      "きいろ": "きいろ (kiiro)",
      "みどり": "みどり (midori)"
    }
  },
  {
    id: "color-2",
    category: "Colors",
    japanese_text: "あお",
    hiragana: "あお",
    romaji: "Ao",
    english_translation: "Blue",
    image: "🔵",
    options: ["しろ", "くろ", "あお", "むらさき"],
    correct_answer: "あお",
    option_hiragana: {
      "しろ": "しろ (shiro)",
      "くろ": "くろ (kuro)",
      "あお": "あお (ao)",
      "むらさき": "むらさき (murasaki)"
    }
  },
  {
    id: "color-3",
    category: "Colors",
    japanese_text: "きいろ",
    hiragana: "きいろ",
    romaji: "Kiiro",
    english_translation: "Yellow",
    image: "🟡",
    options: ["きいろ", "みどり", "あか", "しろ"],
    correct_answer: "きいろ",
    option_hiragana: {
      "きいろ": "きいろ (kiiro)",
      "みどり": "みどり (midori)",
      "あか": "あか (aka)",
      "しろ": "しろ (shiro)"
    }
  },
  {
    id: "color-4",
    category: "Colors",
    japanese_text: "みどり",
    hiragana: "みどり",
    romaji: "Midori",
    english_translation: "Green",
    image: "🟢",
    options: ["あお", "きいろ", "くろ", "みどり"],
    correct_answer: "みどり",
    option_hiragana: {
      "あお": "あお (ao)",
      "きいろ": "きいろ (kiiro)",
      "くろ": "くろ (kuro)",
      "みどり": "みどり (midori)"
    }
  },
  // Daily Phrases
  {
    id: "phrase-1",
    category: "Daily Phrases",
    japanese_text: "ありがとうございます",
    hiragana: "ありがとうございます",
    romaji: "Arigatou gozaimasu",
    english_translation: "Thank you very much",
    image: "🙏",
    options: ["すみません", "ありがとうございます", "ごめんなさい", "おねがいします"],
    correct_answer: "ありがとうございます",
    option_hiragana: {
      "すみません": "すみません (sumimasen)",
      "ありがとうございます": "ありがとうございます (arigatou gozaimasu)",
      "ごめんなさい": "ごめんなさい (gomen nasai)",
      "おねがいします": "おねがいします (onegaishimasu)"
    }
  },
  {
    id: "phrase-2",
    category: "Daily Phrases",
    japanese_text: "すみません",
    hiragana: "すみません",
    romaji: "Sumimasen",
    english_translation: "Excuse me / I'm sorry",
    image: "🙇",
    options: ["ありがとう", "おはよう", "すみません", "いただきます"],
    correct_answer: "すみません",
    option_hiragana: {
      "ありがとう": "ありがとう (arigatou)",
      "おはよう": "おはよう (ohayou)",
      "すみません": "すみません (sumimasen)",
      "いただきます": "いただきます (itadakimasu)"
    }
  },
  {
    id: "phrase-3",
    category: "Daily Phrases",
    japanese_text: "おねがいします",
    hiragana: "おねがいします",
    romaji: "Onegaishimasu",
    english_translation: "Please",
    image: "🤝",
    options: ["おねがいします", "ごめんなさい", "ありがとう", "すみません"],
    correct_answer: "おねがいします",
    option_hiragana: {
      "おねがいします": "おねがいします (onegaishimasu)",
      "ごめんなさい": "ごめんなさい (gomen nasai)",
      "ありがとう": "ありがとう (arigatou)",
      "すみません": "すみません (sumimasen)"
    }
  },
  {
    id: "phrase-4",
    category: "Daily Phrases",
    japanese_text: "いただきます",
    hiragana: "いただきます",
    romaji: "Itadakimasu",
    english_translation: "Let's eat! (before a meal)",
    image: "🥢",
    options: ["ごちそうさま", "いただきます", "おはよう", "ありがとう"],
    correct_answer: "いただきます",
    option_hiragana: {
      "ごちそうさま": "ごちそうさま (gochisousama)",
      "いただきます": "いただきます (itadakimasu)",
      "おはよう": "おはよう (ohayou)",
      "ありがとう": "ありがとう (arigatou)"
    }
  },
];

export const categories: Category[] = [
  {
    name: "Greetings",
    japanese: "あいさつ",
    emoji: "🎌",
    description: "Learn common Japanese greetings",
    slug: "Greetings",
    difficulty: "Easy",
    questionCount: questions.filter(q => q.category === "Greetings").length,
  },
  {
    name: "Numbers",
    japanese: "すうじ",
    emoji: "🔢",
    description: "Master Japanese numbers",
    slug: "Numbers",
    difficulty: "Easy",
    questionCount: questions.filter(q => q.category === "Numbers").length,
  },
  {
    name: "Food",
    japanese: "たべもの",
    emoji: "🍣",
    description: "Discover Japanese food vocabulary",
    slug: "Food",
    difficulty: "Medium",
    questionCount: questions.filter(q => q.category === "Food").length,
  },
  {
    name: "Colors",
    japanese: "いろ",
    emoji: "🎨",
    description: "Explore colors in Japanese",
    slug: "Colors",
    difficulty: "Easy",
    questionCount: questions.filter(q => q.category === "Colors").length,
  },
  {
    name: "Daily Phrases",
    japanese: "にちじょうのフレーズ",
    emoji: "💬",
    description: "Useful everyday expressions",
    slug: "Daily Phrases",
    difficulty: "Medium",
    questionCount: questions.filter(q => q.category === "Daily Phrases").length,
  },
];

export function getQuestionsByCategory(category: string): Question[] {
  return questions.filter(
    (q) => q.category.toLowerCase() === category.toLowerCase()
  );
}
