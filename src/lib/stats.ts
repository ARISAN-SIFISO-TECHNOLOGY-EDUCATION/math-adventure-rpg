// On-device learning analytics. STRICTLY local: these counters live only in
// this browser/app's localStorage and are NEVER sent anywhere — they exist so a
// parent can see activity in the Grown-up Corner without breaking the app's
// 100%-offline, no-accounts, no-data-collection promise.
import { safeGet, safeSave } from './safeStorage';

const STATS_KEY = 'mathadv-stats';

export interface Stats {
  answered: number;          // total questions attempted (both experiences)
  correct: number;           // total answered correctly
  levelsCompleted: number;   // levels/activities finished
  lastPlayed: string;        // ISO timestamp of the most recent answer
}

const empty = (): Stats => ({ answered: 0, correct: 0, levelsCompleted: 0, lastPlayed: '' });

function load(): Stats {
  return { ...empty(), ...safeGet<Partial<Stats>>(STATS_KEY, {}) };
}

export function recordAnswer(correct: boolean): void {
  const s = load();
  s.answered += 1;
  if (correct) s.correct += 1;
  s.lastPlayed = new Date().toISOString();
  safeSave(STATS_KEY, s);
}

export function recordLevelComplete(): void {
  const s = load();
  s.levelsCompleted += 1;
  safeSave(STATS_KEY, s);
}

export function getStats(): Stats {
  return load();
}

export function resetStats(): void {
  try { localStorage.removeItem(STATS_KEY); } catch { /* ignore */ }
}
