export type PartyId = 'blue' | 'red' | 'orange' | 'green' | 'purple' | 'yellow';

export interface Party {
  id: PartyId;
  name: string;
  emoji: string;
  power: string;
  powerDescription: string;
  colorClass: string;
}

export const PARTIES: Party[] = [
  { id: 'blue', name: 'הישנוניים', emoji: '😴', power: 'חסימה', powerDescription: 'נמנע מתשלום עונש פעם אחת', colorClass: 'party-blue' },
  { id: 'red', name: 'המיוזעים', emoji: '💦', power: 'גניבה', powerDescription: 'גונב 2 מנדטים מיריב', colorClass: 'party-red' },
  { id: 'orange', name: 'הזחוחים', emoji: '😏', power: 'הכפלה', powerDescription: 'מכפיל את ההימור בקרב הבא', colorClass: 'party-orange' },
  { id: 'green', name: 'המצחיקולים', emoji: '📵', power: 'ריפוי', powerDescription: 'מחזיר 3 מנדטים שאבדו', colorClass: 'party-green' },
  { id: 'purple', name: 'המבוהלים', emoji: '😱', power: 'חיזוי', powerDescription: 'רואה את השאלה לפני כולם (5 שניות)', colorClass: 'party-purple' },
  { id: 'yellow', name: 'המיוסרים', emoji: '😩', power: 'ברית', powerDescription: 'כופה ברית עם שחקן אחר לתור אחד', colorClass: 'party-yellow' },
];

export type DistrictId =
  | 'golan' | 'north' | 'haifa' | 'sharon' | 'tel-aviv'
  | 'gush-dan' | 'jerusalem' | 'judea-samaria' | 'negev' | 'arava';

export interface District {
  id: DistrictId;
  name: string;
  emoji: string;
  maxMandates: number;
}

export const DISTRICTS: District[] = [
  { id: 'golan',          name: 'הגולן',            emoji: '🗻', maxMandates: 5 },
  { id: 'north',          name: 'הצפון',            emoji: '🌿', maxMandates: 8 },
  { id: 'haifa',          name: 'חיפה והקריות',     emoji: '⚓', maxMandates: 10 },
  { id: 'sharon',         name: 'השרון',            emoji: '🌊', maxMandates: 8 },
  { id: 'tel-aviv',       name: 'תל אביב',         emoji: '🏙️', maxMandates: 12 },
  { id: 'gush-dan',       name: 'גוש דן',           emoji: '🏘️', maxMandates: 12 },
  { id: 'jerusalem',      name: 'ירושלים',          emoji: '🕌', maxMandates: 15 },
  { id: 'judea-samaria',  name: 'יהודה ושומרון',    emoji: '⛰️', maxMandates: 7 },
  { id: 'negev',          name: 'הנגב',             emoji: '🏜️', maxMandates: 8 },
  { id: 'arava',          name: 'הערבה',            emoji: '🌵', maxMandates: 5 },
];

export type ChallengeCategory = 'knowledge' | 'mission' | 'debate' | 'quote' | 'map' | 'music';

export const CATEGORIES: { id: ChallengeCategory; name: string; emoji: string; timer: number }[] = [
  { id: 'knowledge', name: 'ידע', emoji: '🧠', timer: 30 },
  { id: 'mission', name: 'משימה', emoji: '💪', timer: 60 },
  { id: 'debate', name: 'דיבייט', emoji: '🗣️', timer: 60 },
  { id: 'quote', name: 'מי אמר?', emoji: '💬', timer: 20 },
  { id: 'map', name: 'זיהוי מקומות', emoji: '🗺️', timer: 30 },
  { id: 'music', name: 'זהה את השיר', emoji: '🎵', timer: 30 },
];

export type Interest = 'politics' | 'music' | 'tv-cinema' | 'sports' | 'science' | 'history' | 'geography' | 'general';

export const INTERESTS: { id: Interest; name: string; emoji: string }[] = [
  { id: 'politics', name: 'פוליטיקה', emoji: '🏛️' },
  { id: 'music', name: 'מוזיקה', emoji: '🎵' },
  { id: 'tv-cinema', name: 'טלוויזיה/קולנוע', emoji: '🎬' },
  { id: 'sports', name: 'ספורט', emoji: '⚽' },
  { id: 'science', name: 'מדע', emoji: '🔬' },
  { id: 'history', name: 'היסטוריה', emoji: '📜' },
  { id: 'geography', name: 'גאוגרפיה', emoji: '🌍' },
  { id: 'general', name: 'כללי', emoji: '📚' },
];

export interface SecretMemo {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface PowerCode {
  id: string;
  value: number;
  used: boolean;
}

export interface CrowdReaction {
  claps: number;
  boos: number;
  voters: string[];
}

/** Per-player mandates conquered in a district */
export interface DistrictConquest {
  playerId: string;
  partyId: PartyId;
  mandates: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  interests: Interest[];
  party: PartyId;
  mandates: number;
  battlesWon: number;
  battlesLost: number;
  categoryStats: Record<ChallengeCategory, { won: number; lost: number }>;
  powerUsed: boolean;
  reputation: number;
  alliances: string[];
  powerBank: PowerCode[];
  memos: SecretMemo[];
  unreadMemos: number;
  freezeTurns: number;
}

export type AgeGroup = 'ילד' | 'נוער' | 'מבוגר';

export type DifficultyLevel = 'בסיסי' | 'קלה' | 'בינונית' | 'בינונית מתקדמת' | 'מתקדמת' | 'מאתגרת' | 'קשה';

export const BET_TO_DIFFICULTY: { min: number; max: number; level: DifficultyLevel }[] = [
  { min: 1, max: 2, level: 'בסיסי' },
  { min: 3, max: 5, level: 'קלה' },
  { min: 6, max: 8, level: 'בינונית' },
  { min: 9, max: 11, level: 'בינונית מתקדמת' },
  { min: 12, max: 14, level: 'מתקדמת' },
  { min: 15, max: 17, level: 'מאתגרת' },
  { min: 18, max: 20, level: 'קשה' },
];

export const DIFFICULTY_ORDER: DifficultyLevel[] = ['בסיסי', 'קלה', 'בינונית', 'בינונית מתקדמת', 'מתקדמת', 'מאתגרת', 'קשה'];

export function betToDifficulty(bet: number): DifficultyLevel {
  const match = BET_TO_DIFFICULTY.find(d => bet >= d.min && bet <= d.max);
  return match?.level ?? 'בינונית';
}

/** Victory threshold — reach this many mandates to win */
export const VICTORY_MANDATES = 61;

/**
 * Dynamic starting mandates based on player count ("Party Base").
 * External to the 120 mandates available on the physical board.
 *  2 players → 10
 *  3 players → 20
 *  4 players → 30
 *  5+ players → 35
 */
export function getInitialMandates(playerCount: number): number {
  if (playerCount <= 2) return 10;
  if (playerCount === 3) return 20;
  if (playerCount === 4) return 30;
  return 35;
}

export interface Challenge {
  id: number;
  challengeType: ChallengeCategory;
  question: string;
  title?: string;
  difficultyLabel?: string;
  /** Difficulty level from Column K (1-10) — legacy */
  difficulty?: number;
  /** New 7-level difficulty from Column L */
  difficultyLevel?: DifficultyLevel;
  options: string[];
  correctAnswer: string;
  ageGroup: AgeGroup;
  interestTag: Interest | null;
  category: string;
  /** Place photo (map mode) or portrait, served from /public */
  imageUrl?: string;
  /** Song clip (music mode), served from /public */
  audioUrl?: string;
  /** Target pin position for map mode, as % of the map image dimensions */
  mapTarget?: { xPct: number; yPct: number };
  /** Extra context revealed as a hint (quote mode) */
  contextHint?: string;
}

export type GamePhase = 'landing' | 'lobby' | 'district-select' | 'betting' | 'challenge-join' | 'qr-select' | 'battle' | 'voting' | 'results' | 'wow-event' | 'dashboard' | 'national-crisis' | 'victory';

export type WowEvent = 'screen-lock-debate' | 'election-flash' | 'forced-team';

export interface NewsHeadline {
  id: string;
  text: string;
  type: 'breaking' | 'poll' | 'update' | 'alert';
  timestamp: number;
}

export type ChallengeDifficulty = 'safe' | 'normal' | 'high-stakes';

export interface GameState {
  phase: GamePhase;
  roomCode: string;
  roomId: string | null;
  players: Player[];
  currentPlayerIndex: number;
  diceValues: [number, number];
  currentBet: number;
  battleParticipants: string[];
  selectedCategory: ChallengeCategory | null;
  selectedDistrict: DistrictId | null;
  currentChallenge: Challenge | null;
  timerSeconds: number;
  votes: Record<string, boolean>;
  wowEvent: WowEvent | null;
  challenges: Challenge[];
  newsHeadlines: NewsHeadline[];
  crowdReaction: CrowdReaction;
  challengeDifficulty: ChallengeDifficulty;
  activeCodeValue: number | null;
  crisisActive: boolean;
  /** Track per-district conquests by multiple players */
  districtMandates: Record<string, DistrictConquest[]>;
}

export const QUICK_MESSAGES = [
  'אל תתקוף אותי בתור הבא',
  'בוא נתאחד נגד האדומים',
  'בוא נתאחד נגד הכחולים',
  'יש לי הצעה בשבילך...',
  'אני מתכנן בגידה – תיזהר',
  'ברית? 🤝',
  'אתה המטרה הבאה שלי 🎯',
  'בוא נחלק מנדטים',
];
