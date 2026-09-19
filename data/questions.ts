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

/**
 * Normalizes category names or slugs for ultra-resilient matching.
 * Handles URL decoding, case-insensitivity, whitespace, hyphens/underscores,
 * and singular/plural trailing 's' (e.g., 'body parts' == 'body part', 'animals' == 'animal').
 */
export function normalizeCategoryKey(input?: string | null): string {
  if (!input) return '';
  let cleaned = input;
  try {
    cleaned = decodeURIComponent(input);
  } catch {
    // ignore decode error if malformed URL sequence
  }
  return cleaned
    .toLowerCase()
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/s$/, '');
}

/**
 * Finds a category object by slug, name, or normalized equivalent.
 * Supports singular ("Body Part"), plural ("Body Parts"), kebab-case ("body-part"),
 * URL-encoded strings ("Body%20Parts"), and short prefixes ("body").
 */
export function findCategoryBySlug(slugOrName?: string | null): Category | undefined {
  if (!slugOrName) return undefined;
  let decoded = slugOrName;
  try {
    decoded = decodeURIComponent(slugOrName);
  } catch {
    // ignore
  }

  const normInput = normalizeCategoryKey(decoded);

  // 1. Exact or case-insensitive match on slug or name
  let found = categories.find(
    (c) =>
      c.slug.toLowerCase() === decoded.toLowerCase() ||
      c.name.toLowerCase() === decoded.toLowerCase()
  );
  if (found) return found;

  // 2. Normalized match (handles kebab-case, spaces, singular/plural)
  found = categories.find((c) => {
    const normSlug = normalizeCategoryKey(c.slug);
    const normName = normalizeCategoryKey(c.name);
    return normInput === normSlug || normInput === normName;
  });
  if (found) return found;

  // 3. Prefix inclusion match (e.g., 'body' matching 'Body Parts')
  if (normInput.length >= 3) {
    found = categories.find((c) => {
      const normName = normalizeCategoryKey(c.name);
      return normName.startsWith(normInput) || normInput.startsWith(normName);
    });
  }

  return found;
}

export function getQuestionsByCategory(categoryOrSlug: string): Question[] {
  if (!categoryOrSlug) return [];

  // Try finding matching category first
  const cat = findCategoryBySlug(categoryOrSlug);
  const targetName = cat ? cat.name : categoryOrSlug;
  const normTarget = normalizeCategoryKey(targetName);

  return questions.filter((q) => {
    return (
      q.category.toLowerCase() === targetName.toLowerCase() ||
      normalizeCategoryKey(q.category) === normTarget
    );
  });
}
