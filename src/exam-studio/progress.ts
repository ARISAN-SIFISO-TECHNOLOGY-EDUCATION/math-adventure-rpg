// localStorage-based progress store for the senior Exam Studio (ages 15–17).
// Namespaced keys keep this fully separate from the kids' RPG progress
// (mathProgress / earnedBadges / companionSetup / streakData).

import { safeLoad, safeSave } from '../lib/safeStorage';

const PROGRESS_KEY = 'mathadv-senior-progress';
const SETTINGS_KEY = 'mathadv-senior-settings';

// Bump when the persisted shape changes incompatibly; add a migration below.
const SCHEMA_VERSION = 1;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LevelProgress {
  bestScore: number;   // 0–100
  passed: boolean;     // bestScore >= 80
  attempts: number;
}

export interface MistakeEntry {
  questionId: string;
  topicId: string;
  level: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  timestamp: number;
}

export interface StreakData {
  lastActiveDate: string;  // YYYY-MM-DD of the most recent active day
  count: number;           // current consecutive-day streak
  longest: number;         // best streak ever
}

export interface DailyData {
  date: string;            // YYYY-MM-DD this count applies to
  passed: number;          // levels newly passed today
}

export interface ProgressData {
  levels: Record<string, LevelProgress>;   // key: `${topicId}-l${level}` or `${topicId}-test`
  mistakes: MistakeEntry[];
  mockExamScores: { age: number; score: number; date: string }[];
  devUnlockAll: boolean;
  streak: StreakData;
  daily: DailyData;
}

// Levels to pass in a day to hit the daily goal.
export const DAILY_GOAL = 3;

export interface SettingsData {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  darkMode: boolean;
}

// ─── Loaders ─────────────────────────────────────────────────────────────────

const emptyProgress = (): ProgressData => ({
  levels: {}, mistakes: [], mockExamScores: [], devUnlockAll: false,
  streak: { lastActiveDate: '', count: 0, longest: 0 },
  daily: { date: '', passed: 0 },
});

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// Mark today as an active day and roll the consecutive-day streak forward.
function touchStreak(data: ProgressData): void {
  const today = todayStr();
  if (data.streak.lastActiveDate === today) return; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  data.streak.count = data.streak.lastActiveDate === yesterday ? data.streak.count + 1 : 1;
  data.streak.longest = Math.max(data.streak.longest, data.streak.count);
  data.streak.lastActiveDate = today;
}

// Count a newly-passed level toward today's goal.
function bumpDailyPass(data: ProgressData): void {
  const today = todayStr();
  if (data.daily.date !== today) data.daily = { date: today, passed: 0 };
  data.daily.passed += 1;
}

// Accept only well-formed progress objects; anything else degrades to defaults
// (rather than throwing later on `data.levels[...]`). Tolerant of an extra
// `_v` schema tag and of older payloads missing newer fields.
function isProgressData(v: unknown): v is ProgressData {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.levels === 'object' && o.levels !== null &&
    Array.isArray(o.mistakes) &&
    Array.isArray(o.mockExamScores)
  );
}

function loadProgress(): ProgressData {
  const data = safeLoad<ProgressData>(PROGRESS_KEY, isProgressData, emptyProgress());
  // Fill any fields a forward-compatible older payload might lack.
  return { ...emptyProgress(), ...data };
}

function saveProgress(data: ProgressData): void {
  safeSave(PROGRESS_KEY, { ...data, _v: SCHEMA_VERSION });
}

const defaultSettings = (): SettingsData => ({
  soundEnabled: true, hapticsEnabled: true, darkMode: true,
});

function isSettingsData(v: unknown): v is SettingsData {
  return typeof v === 'object' && v !== null;
}

export function loadSettings(): SettingsData {
  const data = safeLoad<SettingsData>(SETTINGS_KEY, isSettingsData, defaultSettings());
  return { ...defaultSettings(), ...data };
}

export function saveSettings(settings: SettingsData): void {
  safeSave(SETTINGS_KEY, settings);
}

// ─── Level key helpers ───────────────────────────────────────────────────────

function levelKey(topicId: string, level: number): string {
  return `${topicId}-l${level}`;
}

function testKey(topicId: string): string {
  return `${topicId}-test`;
}

// ─── Read helpers ────────────────────────────────────────────────────────────

export function getLevelProgress(topicId: string, level: number): LevelProgress {
  const data = loadProgress();
  return data.levels[levelKey(topicId, level)] ?? { bestScore: 0, passed: false, attempts: 0 };
}

export function isLevelPassed(topicId: string, level: number): boolean {
  return getLevelProgress(topicId, level).passed;
}

export function isTopicTestPassed(topicId: string): boolean {
  const data = loadProgress();
  return data.levels[testKey(topicId)]?.passed ?? false;
}

/**
 * Level 1 is always unlocked for any topic that itself is unlocked.
 * Level N requires level N-1 to be passed.
 */
export function isLevelUnlocked(topicId: string, level: number): boolean {
  const data = loadProgress();
  if (data.devUnlockAll) return true;
  if (level <= 1) return true;
  return data.levels[levelKey(topicId, level - 1)]?.passed ?? false;
}

/**
 * Topic at index 0 is always unlocked.
 * Topic at index N requires the previous topic's test to be passed.
 * allTopicIds: ordered list of topic IDs for the age group.
 */
export function isTopicUnlocked(topicIndex: number, allTopicIds: string[]): boolean {
  const data = loadProgress();
  if (data.devUnlockAll) return true;
  if (topicIndex <= 0) return true;
  const prevTopicId = allTopicIds[topicIndex - 1];
  return data.levels[testKey(prevTopicId)]?.passed ?? false;
}

export function getMistakes(): MistakeEntry[] {
  return loadProgress().mistakes;
}

export function getMockExamScores(): ProgressData['mockExamScores'] {
  return loadProgress().mockExamScores;
}

export function isDevUnlockAll(): boolean {
  return loadProgress().devUnlockAll;
}

// ─── Dev button reveal (production gesture) ──────────────────────────────────
// The Dev Mode toggle is always shown on the Vite dev server, but in a release
// (Play Store) build it stays hidden until the developer reveals it with a
// secret gesture. Once revealed on a device it stays revealed.
const DEV_REVEAL_KEY = 'mathadv-senior-devreveal';

export function isDevButtonRevealed(): boolean {
  try {
    return localStorage.getItem(DEV_REVEAL_KEY) === '1';
  } catch {
    return false;
  }
}

export function revealDevButton(): void {
  try {
    localStorage.setItem(DEV_REVEAL_KEY, '1');
  } catch { /* ignore */ }
}

// ─── First-run Academy onboarding ────────────────────────────────────────────
// Teens land on a dark topic list with mastery gates and no explanation; show a
// short intro once per device.
const ONBOARDED_KEY = 'mathadv-senior-onboarded';

export function isAcademyOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAcademyOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDED_KEY, '1');
  } catch { /* ignore */ }
}

// ─── Write helpers ───────────────────────────────────────────────────────────

/**
 * Record a level or test attempt.
 * key: use levelKey() or testKey() — or pass 'test' as the 3rd arg.
 */
export function recordAttempt(topicId: string, level: number, score: number, isTest = false): void {
  const data = loadProgress();
  const key = isTest ? testKey(topicId) : levelKey(topicId, level);
  const prev = data.levels[key] ?? { bestScore: 0, passed: false, attempts: 0 };
  const bestScore = Math.max(prev.bestScore, score);
  const passed = bestScore >= 80;
  data.levels[key] = {
    bestScore,
    passed,
    attempts: prev.attempts + 1,
  };
  touchStreak(data);
  if (passed && !prev.passed) bumpDailyPass(data); // count first-time passes only
  saveProgress(data);
}

export function addMistake(entry: MistakeEntry): void {
  const data = loadProgress();
  // Prepend, cap at 50
  data.mistakes = [entry, ...data.mistakes].slice(0, 50);
  saveProgress(data);
}

export function removeMistake(questionId: string): void {
  const data = loadProgress();
  data.mistakes = data.mistakes.filter(m => m.questionId !== questionId);
  saveProgress(data);
}

export function recordMockExam(age: number, score: number): void {
  const data = loadProgress();
  data.mockExamScores.push({ age, score, date: new Date().toISOString() });
  touchStreak(data);
  saveProgress(data);
}

// ─── Retention reads ─────────────────────────────────────────────────────────

/** Current/longest day streak, with the count reset to 0 if a day was missed. */
export function getStreak(): StreakData {
  const s = loadProgress().streak;
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  // A streak only "counts" if the last active day was today or yesterday.
  const live = s.lastActiveDate === today || s.lastActiveDate === yesterday;
  return { ...s, count: live ? s.count : 0 };
}

/** Levels passed today vs the daily goal. */
export function getDailyProgress(): { passed: number; goal: number } {
  const d = loadProgress().daily;
  const passed = d.date === todayStr() ? d.passed : 0;
  return { passed, goal: DAILY_GOAL };
}

export function setDevUnlockAll(value: boolean): void {
  const data = loadProgress();
  data.devUnlockAll = value;
  saveProgress(data);
}

export function clearAllProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
}
