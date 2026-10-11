export type DetectedLanguage = 'en' | 'hi' | 'hinglish';

export interface LanguageDetectionResult {
  language: DetectedLanguage;
  confidence: number;
}

export function detectLanguage(text: string): LanguageDetectionResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { language: 'en', confidence: 1.0 };
  }

  // 1. Check for Devanagari script (Hindi Unicode range \u0900-\u097F)
  const devanagariMatches = trimmed.match(/[\u0900-\u097F]/g);
  if (devanagariMatches) {
    const devRatio = devanagariMatches.length / trimmed.length;
    if (devRatio > 0.2) {
      return { language: 'hi', confidence: 0.95 };
    }
  }

  // 2. Hinglish Romanized Keyword Detection
  const lower = trimmed.toLowerCase();
  const hinglishKeywords = [
    'kya', 'hai', 'hain', 'mein', 'ko', 'kar', 'karo', 'do', 'batao', 'rahi', 'raha',
    'kitna', 'kitni', 'problem', 'aaj', 'kal', 'ka', 'ki', 'ke', 'kaafi', 'bilkul',
    'hoon', 'dikhao', 'chalao', 'isko', 'usko', 'kyun', 'kaha', 'par', 'aaye'
  ];

  const words = lower.split(/\s+/).map(w => w.replace(/[^\w]/g, ''));
  let matchCount = 0;
  for (const word of words) {
    if (hinglishKeywords.includes(word)) {
      matchCount++;
    }
  }

  if (matchCount > 0) {
    const ratio = matchCount / words.length;
    return { language: 'hinglish', confidence: Math.min(0.99, 0.6 + ratio * 0.4) };
  }

  // 3. Pure Hindi Romanized check
  if (lower.startsWith('zone b ka') || lower.includes('batao') || lower.includes('kar do')) {
    return { language: 'hinglish', confidence: 0.9 };
  }

  // Default to English
  return { language: 'en', confidence: 0.9 };
}
