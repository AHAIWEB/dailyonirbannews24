const GENERIC_ARTICLE_TITLES = new Set([
  "বিনোদন",
  "রাজনীতি",
  "গ্যালারি",
  "ফটো গ্যালারি",
  "ফটো",
  "ছবি",
  "স্বাস্থ্য",
  "স্বাস্থ্যসেবা",
  "ভ্রমণ",
  "লাইফস্টাইল",
  "শিক্ষা",
  "অর্থনীতি",
  "আন্তর্জাতিক",
  "জাতীয়",
  "জাতীয়",
  "ভিডিও",
  "খেলা",
  "খেলাধুলা",
]);

const GENERIC_SOURCE_PATH = /^\/(?:gallery(?:\/(?:health|entertainment|international|sports|education|economy))?|photos?|health|travel|education|economy|entertainment|sports|politics|lifestyle|video|international|national|bangladesh)\/?$/i;

export function stripArticleMarkup(value: string | null | undefined) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value: string | null | undefined) {
  return stripArticleMarkup(value)
    .replace(/[|–—:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function isUuid(value: string | null | undefined) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "");
}

export function normalizeArticleImageUrl(imageUrl: string | null | undefined, sourceUrl?: string | null) {
  const candidate = (imageUrl || "").trim();
  if (!candidate) return null;
  if (candidate.startsWith("data:") || candidate.startsWith("blob:")) return candidate;
  if (/^https?:\/\//i.test(candidate)) return candidate;
  if (candidate.startsWith("//")) return `https:${candidate}`;

  try {
    return new URL(candidate, sourceUrl || window.location.origin).toString();
  } catch {
    return null;
  }
}

export function isLikelyGenericArticle(article: {
  title?: string | null;
  category?: string | null;
  source_url?: string | null;
}) {
  const title = stripArticleMarkup(article.title);
  const category = stripArticleMarkup(article.category);
  const normalizedTitle = normalizeText(title);
  const normalizedCategory = normalizeText(category);

  if (!normalizedTitle || normalizedTitle.length < 4) return true;
  if (normalizedTitle === normalizedCategory) return true;
  if (GENERIC_ARTICLE_TITLES.has(title) && normalizedTitle.length <= 18) return true;

  try {
    const path = new URL(article.source_url || "", window.location.origin).pathname.toLowerCase().replace(/\/+$/, "");
    if (GENERIC_SOURCE_PATH.test(path) && normalizedTitle.length <= 24) return true;
  } catch {}

  return false;
}

function cleanupArticleText(content: string) {
  return stripArticleMarkup(content)
    .replace(/\[বিস্তারিত পড়তে মূল সূত্রে যান\]/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[০-৯0-9]{1,2}\s+[A-Za-z\u0980-\u09FF]+\s+[০-৯0-9]{4}/g, " ")
    .replace(/[০-৯0-9]{1,2}[:.][০-৯0-9]{2}(?:\s*(?:AM|PM|am|pm))?/g, " ")
    .replace(/(?:প্রকাশিত|আপডেট|Published|Updated)\s*:?[^।!?\n]*/gi, " ")
    .replace(/(?:রিপোর্টার|নিজস্ব প্রতিবেদক|স্টাফ রিপোর্টার|ডেস্ক রিপোর্ট)\s*:?[^।!?\n]*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreSentence(sentence: string, title: string) {
  const digitCount = (sentence.match(/[0-9০-৯]/g) || []).length;
  const banglaCount = (sentence.match(/[\u0980-\u09FF]/g) || []).length;
  const ratio = sentence.length ? digitCount / sentence.length : 1;
  let score = 0;

  if (/[""❝❞]/.test(sentence)) score += 6;
  if (sentence.length >= 45 && sentence.length <= 150) score += 4;
  if (banglaCount >= 18) score += 3;
  if (sentence.includes(":") || sentence.includes("—")) score += 1;
  if (sentence.includes(title)) score -= 2;
  if (ratio > 0.15) score -= 5;
  if (/(?:জানু|ফেব্রু|মার্চ|এপ্রিল|মে|জুন|জুলাই|আগস্ট|সেপ্টে|অক্টো|নভে|ডিসে)/i.test(sentence)) score -= 2;

  return score;
}

export function buildArticleQuote(article: { title?: string | null; content?: string | null }) {
  const title = stripArticleMarkup(article.title);
  const cleanContent = cleanupArticleText(article.content || "");

  if (!cleanContent) return title;

  const candidates = cleanContent
    .split(/(?<=[।!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 28)
    .filter((sentence) => !GENERIC_ARTICLE_TITLES.has(sentence))
    .filter((sentence) => sentence !== title);

  const bestSentence = candidates
    .map((sentence) => ({ sentence, score: scoreSentence(sentence, title) }))
    .sort((a, b) => b.score - a.score)[0]?.sentence;

  const fallback = candidates[0] || cleanContent.slice(0, 180) || title;

  return (bestSentence || fallback)
    .replace(/^[-–—:]+\s*/, "")
    .replace(/\s+/g, " ")
    .slice(0, 220)
    .trim();
}

/**
 * Generate multiple smart quote suggestions from article content.
 * Returns up to `count` unique ranked quotes.
 */
export function buildArticleQuoteSuggestions(
  article: { title?: string | null; content?: string | null },
  count = 3
): string[] {
  const title = stripArticleMarkup(article.title);
  const cleanContent = cleanupArticleText(article.content || "");

  if (!cleanContent) return title ? [title] : [];

  const candidates = cleanContent
    .split(/(?<=[।!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 28)
    .filter((s) => !GENERIC_ARTICLE_TITLES.has(s))
    .filter((s) => s !== title);

  if (candidates.length === 0) {
    const fallback = cleanContent.slice(0, 220).trim();
    return fallback ? [fallback] : title ? [title] : [];
  }

  const scored = candidates
    .map((sentence) => ({ sentence, score: scoreSentence(sentence, title) }))
    .sort((a, b) => b.score - a.score);

  const results: string[] = [];
  const seen = new Set<string>();

  for (const { sentence } of scored) {
    const clean = sentence
      .replace(/^[-–—:]+\s*/, "")
      .replace(/\s+/g, " ")
      .slice(0, 220)
      .trim();

    if (clean.length < 20) continue;

    const key = clean.slice(0, 40).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    results.push(clean);
    if (results.length >= count) break;
  }

  return results;
}
