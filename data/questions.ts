export interface Question {
  id: string;
  category: string;
  japanese_text: string;
  romaji: string;
  english_translation: string;
  options: string[];
  correct_answer: string;
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
    romaji: "Konnichiwa",
    english_translation: "Hello / Good afternoon",
    options: ["こんにちは", "こんばんは", "おはよう", "さようなら"],
    correct_answer: "こんにちは",
  },
  {
    id: "greet-2",
    category: "Greetings",
    japanese_text: "おはようございます",
    romaji: "Ohayou gozaimasu",
    english_translation: "Good morning (polite)",
    options: ["おはようございます", "こんばんは", "ありがとう", "すみません"],
    correct_answer: "おはようございます",
  },
  {
    id: "greet-3",
    category: "Greetings",
    japanese_text: "さようなら",
    romaji: "Sayounara",
    english_translation: "Goodbye",
    options: ["おやすみ", "さようなら", "こんにちは", "おはよう"],
    correct_answer: "さようなら",
  },
  {
    id: "greet-4",
    category: "Greetings",
    japanese_text: "こんばんは",
    romaji: "Konbanwa",
    english_translation: "Good evening",
    options: ["おはよう", "こんにちは", "こんばんは", "おやすみなさい"],
    correct_answer: "こんばんは",
  },
  {
    id: "greet-5",
    category: "Greetings",
    japanese_text: "おやすみなさい",
    romaji: "Oyasuminasai",
    english_translation: "Good night",
    options: ["さようなら", "こんばんは", "おやすみなさい", "おはよう"],
    correct_answer: "おやすみなさい",
  },
  // Numbers
  {
    id: "num-1",
    category: "Numbers",
    japanese_text: "いち",
    romaji: "Ichi",
    english_translation: "One (1)",
    options: ["いち", "に", "さん", "し"],
    correct_answer: "いち",
  },
  {
    id: "num-2",
    category: "Numbers",
    japanese_text: "さん",
    romaji: "San",
    english_translation: "Three (3)",
    options: ["に", "さん", "よん", "ご"],
    correct_answer: "さん",
  },
  {
    id: "num-3",
    category: "Numbers",
    japanese_text: "ご",
    romaji: "Go",
    english_translation: "Five (5)",
    options: ["し", "ろく", "ご", "なな"],
    correct_answer: "ご",
  },
  {
    id: "num-4",
    category: "Numbers",
    japanese_text: "じゅう",
    romaji: "Juu",
    english_translation: "Ten (10)",
    options: ["はち", "きゅう", "じゅう", "なな"],
    correct_answer: "じゅう",
  },
  // Food
  {
    id: "food-1",
    category: "Food",
    japanese_text: "これはなんですか？ — ごはん",
    romaji: "Kore wa nan desu ka? — Gohan",
    english_translation: "What is this? — Rice",
    options: ["りんご", "ごはん", "パン", "さかな"],
    correct_answer: "ごはん",
  },
  {
    id: "food-2",
    category: "Food",
    japanese_text: "これはなんですか？ — すし",
    romaji: "Kore wa nan desu ka? — Sushi",
    english_translation: "What is this? — Sushi",
    options: ["ラーメン", "すし", "うどん", "てんぷら"],
    correct_answer: "すし",
  },
  {
    id: "food-3",
    category: "Food",
    japanese_text: "これはなんですか？ — りんご",
    romaji: "Kore wa nan desu ka? — Ringo",
    english_translation: "What is this? — Apple",
    options: ["みかん", "ぶどう", "りんご", "いちご"],
    correct_answer: "りんご",
  },
  {
    id: "food-4",
    category: "Food",
    japanese_text: "これはなんですか？ — ラーメン",
    romaji: "Kore wa nan desu ka? — Raamen",
    english_translation: "What is this? — Ramen",
    options: ["うどん", "そば", "ラーメン", "カレー"],
    correct_answer: "ラーメン",
  },
  // Colors
  {
    id: "color-1",
    category: "Colors",
    japanese_text: "あか",
    romaji: "Aka",
    english_translation: "Red",
    options: ["あお", "あか", "きいろ", "みどり"],
    correct_answer: "あか",
  },
  {
    id: "color-2",
    category: "Colors",
    japanese_text: "あお",
    romaji: "Ao",
    english_translation: "Blue",
    options: ["しろ", "くろ", "あお", "むらさき"],
    correct_answer: "あお",
  },
  {
    id: "color-3",
    category: "Colors",
    japanese_text: "きいろ",
    romaji: "Kiiro",
    english_translation: "Yellow",
    options: ["きいろ", "みどり", "あか", "しろ"],
    correct_answer: "きいろ",
  },
  {
    id: "color-4",
    category: "Colors",
    japanese_text: "みどり",
    romaji: "Midori",
    english_translation: "Green",
    options: ["あお", "きいろ", "くろ", "みどり"],
    correct_answer: "みどり",
  },
  // Daily Phrases
  {
    id: "phrase-1",
    category: "Daily Phrases",
    japanese_text: "ありがとうございます",
    romaji: "Arigatou gozaimasu",
    english_translation: "Thank you very much",
    options: ["すみません", "ありがとうございます", "ごめんなさい", "おねがいします"],
    correct_answer: "ありがとうございます",
  },
  {
    id: "phrase-2",
    category: "Daily Phrases",
    japanese_text: "すみません",
    romaji: "Sumimasen",
    english_translation: "Excuse me / I'm sorry",
    options: ["ありがとう", "おはよう", "すみません", "いただきます"],
    correct_answer: "すみません",
  },
  {
    id: "phrase-3",
    category: "Daily Phrases",
    japanese_text: "おねがいします",
    romaji: "Onegaishimasu",
    english_translation: "Please",
    options: ["おねがいします", "ごめんなさい", "ありがとう", "すみません"],
    correct_answer: "おねがいします",
  },
  {
    id: "phrase-4",
    category: "Daily Phrases",
    japanese_text: "いただきます",
    romaji: "Itadakimasu",
    english_translation: "Let's eat! (before a meal)",
    options: ["ごちそうさま", "いただきます", "おはよう", "ありがとう"],
    correct_answer: "いただきます",
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
