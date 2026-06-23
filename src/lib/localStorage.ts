import type { PartyId, Interest } from '@/types/game';

const STORAGE_KEY = 'mr-pm-legacy';

export interface LegacyProfile {
  name: string;
  age: number;
  interests: Interest[];
  party: PartyId;
  avatarIndex: number;
  totalGames: number;
  totalWins: number;
  totalMandates: number;
  bestMandates: number;
  lastPlayed: number;
}

export function loadLegacy(): LegacyProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLegacy(profile: LegacyProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch { /* storage full */ }
}

export function updateLegacyAfterGame(mandates: number, won: boolean): void {
  const legacy = loadLegacy();
  if (!legacy) return;
  legacy.totalGames += 1;
  legacy.totalMandates += mandates;
  if (won) legacy.totalWins += 1;
  if (mandates > legacy.bestMandates) legacy.bestMandates = mandates;
  legacy.lastPlayed = Date.now();
  saveLegacy(legacy);
}

export function getLegacyBonus(): number {
  const legacy = loadLegacy();
  if (!legacy) return 0;
  // 1 bonus mandate per 3 games played, max 3
  return Math.min(3, Math.floor(legacy.totalGames / 3));
}
