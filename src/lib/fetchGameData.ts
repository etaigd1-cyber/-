import Papa from 'papaparse';
import type { Challenge, Interest, ChallengeCategory, AgeGroup, DifficultyLevel } from '@/types/game';

const SHEET_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRO4ynv_JcP11smXer5IOeIlhXJ9BCB8zRfNd-aXjzVQWG8awFY-u2VCvqHbElqTQ4XnjCY6AaWMCPZ/pub';

/** GIDs for each sheet tab */
const SHEET_GIDS = {
  trivia: '962320107',    // שאלות טריוויה
  cards: '984041122',     // קלפים
  missions: '600327577',  // משימות
  debates: '410013963',   // דיבייטים
};

const CSV_URL = `${SHEET_BASE}?gid=${SHEET_GIDS.trivia}&single=true&output=csv`;
const CARDS_CSV_URL = `${SHEET_BASE}?gid=${SHEET_GIDS.cards}&single=true&output=csv`;
const MISSIONS_CSV_URL = `${SHEET_BASE}?gid=${SHEET_GIDS.missions}&single=true&output=csv`;

/** A card definition fetched from the קלפים sheet */
export interface GameCard {
  action: string;        // פעולה — Hebrew label
  url: string;           // URL containing the card= param
  description: string;   // מה הפקודה עושה
  cardKey: string;       // extracted card= value (e.g. "jail", "bonus_2")
}

let _cachedCards: GameCard[] | null = null;

/** Fetch card definitions from the קלפים sheet */
export async function fetchCardData(): Promise<GameCard[]> {
  if (_cachedCards) return _cachedCards;
  try {
    const response = await fetch(CARDS_CSV_URL);
    const text = await response.text();
    const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
    const rows = parsed.data as string[][];

    const cards: GameCard[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const action = (row[0] ?? '').trim();
      const url = (row[1] ?? '').trim();
      const description = (row[2] ?? '').trim();
      if (!action || !url) continue;

      // Extract card key from URL
      const match = url.match(/[?&]card=([^&#\s]+)/i);
      const cardKey = match ? decodeURIComponent(match[1]).toLowerCase() : '';
      if (!cardKey) continue;

      cards.push({ action, url, description, cardKey });
    }
    _cachedCards = cards;
    return cards;
  } catch (err) {
    console.error('[fetchCardData] Failed to fetch cards sheet:', err);
    return [];
  }
}

/** Placeholder: fetch missions from the משימות sheet (to be fully implemented later) */
export async function fetchMissionData(): Promise<unknown[]> {
  console.log('[fetchMissionData] Placeholder — missions sheet ready at:', MISSIONS_CSV_URL);
  return [];
}

/** Strip leading Hebrew letter + parenthesis/dash prefix, then trim */
export function cleanAnswerText(raw: string): string {
  return raw
    .replace(/^[אבגד]\s*[\)—\-]\s*/, '')
    .trim();
}

const INTEREST_MAP: Record<string, Interest> = {
  'פוליטיקה': 'politics',
  'מוזיקה': 'music',
  'טלוויזיה וקולנוע': 'tv-cinema',
  'טלוויזיה/קולנוע': 'tv-cinema',
  'טלוויזיה': 'tv-cinema',
  'קולנוע': 'tv-cinema',
  'ספורט': 'sports',
  'מדע': 'science',
  'כללי': 'general',
  'היסטוריה': 'history',
  'גאוגרפיה': 'geography',
};

function detectInterest(tag: string): Interest | null {
  const trimmed = tag.trim();
  return INTEREST_MAP[trimmed] || null;
}

const CATEGORY_MAP: Record<string, ChallengeCategory> = {
  'ידע': 'knowledge',
  'משימה': 'mission',
  'דיבייט': 'debate',
};

const AGE_MAP: Record<string, AgeGroup> = {
  'ילד': 'ילד',
  'ילדים': 'ילד',
  'נוער': 'נוער',
  'מבוגר': 'מבוגר',
  'מבוגרים': 'מבוגר',
};

const VALID_DIFFICULTIES: DifficultyLevel[] = ['בסיסי', 'קלה', 'בינונית', 'בינונית מתקדמת', 'מתקדמת', 'מאתגרת', 'קשה'];

function detectAgeGroup(raw: string): AgeGroup {
  const t = raw.trim();
  if (AGE_MAP[t]) return AGE_MAP[t];
  if (t.includes('ילד') || t.includes('10-14') || t.includes('10–14')) return 'ילד';
  if (t.includes('נוער') || t.includes('14-18') || t.includes('14–18')) return 'נוער';
  return 'מבוגר';
}

/**
 * Column Mapping (Knowledge):
 *   A=ID(0), B=Age(1), C=Question(2), D-G=Options(3-6), H=Answer(7), I=Topic(8), J=Category(9), K=Difficulty1-10(10), L=DifficultyLevel(11)
 */
export async function fetchGameData(): Promise<Challenge[]> {
  const response = await fetch(CSV_URL);
  const text = await response.text();

  const parsed = Papa.parse(text, { header: false, skipEmptyLines: true });
  const rows = parsed.data as string[][];

  const challenges: Challenge[] = [];
  let id = 0;

  for (const row of rows) {
    const categoryRaw = (row[9] ?? '').trim();
    const challengeType = CATEGORY_MAP[categoryRaw];
    if (!challengeType) continue;

    if (challengeType === 'knowledge') {
      const questionText = (row[2] ?? '').trim();
      if (!questionText || questionText === 'שאלה') continue;

      const options = [row[3], row[4], row[5], row[6]].filter(Boolean).map(o => o.trim());
      if (options.length < 2) continue;

      const ageGroupRaw = (row[1] ?? '').trim();
      const correctRaw = (row[7] ?? '').trim();
      const interestRaw = (row[8] ?? '').trim();
      const difficultyRaw = (row[10] ?? '').trim();
      const difficulty = parseDifficulty(difficultyRaw);
      const difficultyLevelRaw = (row[11] ?? '').trim();
      const difficultyLevel = VALID_DIFFICULTIES.includes(difficultyLevelRaw as DifficultyLevel)
        ? (difficultyLevelRaw as DifficultyLevel)
        : undefined;

      challenges.push({
        id: id++,
        challengeType: 'knowledge',
        category: categoryRaw,
        question: questionText,
        options,
        correctAnswer: correctRaw,
        ageGroup: detectAgeGroup(ageGroupRaw),
        interestTag: detectInterest(interestRaw),
        difficulty,
        difficultyLevel,
      });

    } else if (challengeType === 'debate') {
      const title = (row[1] ?? '').trim();
      const conflictText = (row[2] ?? '').trim();
      if (!conflictText) continue;

      challenges.push({
        id: id++,
        challengeType: 'debate',
        category: categoryRaw,
        title: title || undefined,
        question: conflictText,
        options: [],
        correctAnswer: '',
        ageGroup: 'מבוגר',
        interestTag: null,
      });

    } else if (challengeType === 'mission') {
      const difficultyLabel = (row[1] ?? '').trim();
      const title = (row[2] ?? '').trim();
      const challengeText = (row[3] ?? '').trim();
      const displayText = challengeText || title;
      if (!displayText) continue;

      challenges.push({
        id: id++,
        challengeType: 'mission',
        category: categoryRaw,
        difficultyLabel: difficultyLabel || undefined,
        title: challengeText ? title : undefined,
        question: displayText,
        options: [],
        correctAnswer: '',
        ageGroup: 'מבוגר',
        interestTag: null,
      });
    }
  }

  return challenges;
}

function parseDifficulty(raw: string): number | undefined {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1 || n > 10) return undefined;
  return n;
}
