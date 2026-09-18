import questionsData from './questions.json';

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
  imageUrl?: string;
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

export const questions: Question[] = questionsData as Question[];

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
  {
    name: "Verbs",
    japanese: "どうし",
    emoji: "🏃",
    description: "Learn basic Japanese action verbs",
    slug: "Verbs",
    difficulty: "Medium",
    questionCount: questions.filter(q => q.category === "Verbs").length,
  },
  {
    name: "Adjectives",
    japanese: "けいようし",
    emoji: "✨",
    description: "Describe things in Japanese",
    slug: "Adjectives",
    difficulty: "Medium",
    questionCount: questions.filter(q => q.category === "Adjectives").length,
  },
  {
    name: "Body Parts",
    japanese: "からだ",
    emoji: "👤",
    description: "Learn parts of the body",
    slug: "Body Parts",
    difficulty: "Easy",
    questionCount: questions.filter(q => q.category === "Body Parts").length,
  },
  {
    name: "Animals",
    japanese: "どうぶつ",
    emoji: "🐕",
    description: "Discover animal names in Japanese",
    slug: "Animals",
    difficulty: "Easy",
    questionCount: questions.filter(q => q.category === "Animals").length,
  },
  {
    name: "Family",
    japanese: "かぞく",
    emoji: "👨‍👩‍👧‍👦",
    description: "Talk about family members",
    slug: "Family",
    difficulty: "Easy",
    questionCount: questions.filter(q => q.category === "Family").length,
  }
];

export function getQuestionsByCategory(category: string): Question[] {
  return questions.filter(
    (q) => q.category.toLowerCase() === category.toLowerCase()
  );
}
