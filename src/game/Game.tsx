/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ChevronRight, Coins, Sparkles, Volume2, VolumeX, Lock, Home } from 'lucide-react';
import { generateProblem, type Problem } from '../mathEngine';
import confetti from 'canvas-confetti';
import { Companion, type CompanionEmotion } from './Companion';
import { useNarration } from './useNarration';

// --- Types ---
type GameState = 'START' | 'TUTORIAL' | 'LEVEL_INTRO' | 'PLAYING' | 'VICTORY';

// --- Pre-School Tutorial Data ---
const TUTORIAL_SLIDES = [
  {
    emoji: '👾',
    title: 'Meet Your Monster!',
    body: 'This hungry monster needs YOUR help to grow strong!',
    bg: 'bg-[#FEF9C3]',
  },
  {
    emoji: '🎮',
    title: 'How to Play',
    body: 'A question will appear. Look at the answers and TAP the right one!',
    bg: 'bg-[#DCFCE7]',
  },
  {
    emoji: '⭐',
    title: 'Count Carefully',
    body: 'Count each object one by one. Take your time — there is no rush!',
    bg: 'bg-[#DBEAFE]',
  },
  {
    emoji: '🏆',
    title: 'Earn Coins!',
    body: 'Every correct answer earns a coin. Get 5 right to level up!',
    bg: 'bg-[#F3E8FF]',
  },
  {
    emoji: '🚀',
    title: "Let's Go!",
    body: "You're ready! Feed your monster and become a Math Hero!",
    bg: 'bg-[#FFE4E6]',
  },
];

const LEVEL_INTROS: Record<number, { emoji: string; title: string; body: string; tip: string }> = {
  1:  { emoji: '🔢', title: 'Counting 1 to 5',    body: 'Count the objects and tap the right number.', tip: 'Point at each one as you count!' },
  2:  { emoji: '🌟', title: 'Counting up to 10',  body: 'Now we count even more objects!', tip: 'Take it slow — count every single one.' },
  3:  { emoji: '⚖️', title: 'More or Less',        body: 'Look at two numbers and pick the BIGGER one.', tip: 'Think: which number would be more sweets?' },
  4:  { emoji: '➕', title: 'Adding Together',     body: 'Put two groups together and count them all.', tip: 'Count the first group, then keep counting!' },
  5:  { emoji: '➖', title: 'Taking Away',          body: 'Start with a number and take some away.', tip: 'Count what is left after taking away.' },
  6:  { emoji: '⚡', title: 'Quick Count!',         body: 'Objects flash on screen — see how many without counting one by one!', tip: 'Trust your eyes — how many at once?' },
  7:  { emoji: '🧩', title: 'Missing Part',         body: 'One part of the sum is missing. Blocks will help you find it!', tip: 'Count all blocks, then count the known ones.' },
  8:  { emoji: '🔟', title: 'Counting to 20!',     body: 'Now we count all the way to 20 — you can do it!', tip: 'Try counting in groups of 5 to keep track.' },
  9:  { emoji: '🔷', title: 'Shape Explorer',      body: 'Look at the shape and tap its name!', tip: 'Think about how many sides or corners it has.' },
  10: { emoji: '🎨', title: 'Pattern Detective',   body: 'Spot what repeats and choose what comes next!', tip: 'Say the pattern out loud to hear the rhythm.' },
};

const PHASE1_HINTS: Record<number, string> = {
  1:  '👆 Count each object carefully!',
  2:  '👆 Count every one — up to 10!',
  3:  '👆 Tap the BIGGER number!',
  4:  '👆 Add them together!',
  5:  '👆 How many are left?',
  6:  '⚡ Trust your eyes — don\'t count one by one!',
  7:  '🧩 Count the blocks to find the missing part!',
  8:  '👆 Count carefully all the way to 20!',
  9:  '🔷 How many sides does it have?',
  10: '🎨 What is the repeating pattern?',
};

const P2_LEVEL_INTROS: Record<number, { emoji: string; title: string; body: string; tip: string }> = {
  // World 1 — Academy of Numbers
  1:  { emoji: '🏫', title: 'Welcome to the Academy!',   body: 'Add numbers up to 20 to defeat the gate guardians.',   tip: 'Count on from the bigger number!' },
  2:  { emoji: '➖', title: 'Subtraction Siege',          body: 'Take away to weaken the enemies!',                      tip: 'Count backwards from the bigger number.' },
  3:  { emoji: '💯', title: 'The Hundred Challenge',      body: 'Add and subtract numbers all the way to 100!',          tip: 'Break big numbers into tens to make it easier.' },
  4:  { emoji: '✖️', title: 'Times Table Training',       body: 'Master the ×2, ×5, and ×10 tables to unlock power-ups!', tip: 'Skip-count: 5, 10, 15, 20…' },
  5:  { emoji: '❓', title: 'The Missing Number',         body: 'Find the hidden number to solve the puzzle!',           tip: 'Think: what do I add to get the total?' },
  // World 2 — Merchant's Guild
  6:  { emoji: '🏪', title: 'Enter the Merchant\'s Guild!', body: 'Understand place value — tens and units are your coins and gems!', tip: 'The first digit tells you HOW MANY tens.' },
  7:  { emoji: '💰', title: 'Money Mastery',              body: 'Count coins, make change — the guild rewards sharp traders!', tip: 'Work out the total, then find the difference.' },
  8:  { emoji: '⏰', title: 'Time Keeper',                body: 'Tell the time and calculate hours ahead!',              tip: 'Count forward on a clock: 8 → 9 → 10…' },
  9:  { emoji: '📖', title: 'Story Problems',             body: 'Real-world word problems — read carefully and choose the right operation!', tip: 'Find the KEY words: "more", "left", "altogether".' },
  10: { emoji: '🪞', title: 'Doubles & Halves',           body: 'Double and halve numbers — these are your secret weapons!', tip: 'Half means split equally into TWO groups.' },
  // World 3 — Dragon's Tower
  11: { emoji: '🐉', title: 'Dragon\'s Tower Awaits!',   body: 'Multiply with ×3, ×4, and ×6 to storm the tower!',     tip: 'Use what you know: 4×6 = double 2×6!' },
  12: { emoji: '⚔️', title: 'Division Dragon',           body: 'Share numbers equally to defeat the dragon\'s riddles!', tip: 'Division is just multiplication in reverse.' },
  13: { emoji: '🍕', title: 'Fraction Fortress',         body: 'Find halves and quarters of numbers — split the treasure!', tip: 'Half = divide by 2. Quarter = divide by 4.' },
  14: { emoji: '📐', title: 'Perimeter Puzzle',          body: 'Calculate the perimeter — add up ALL the sides of the shape!', tip: 'Perimeter = all sides added together.' },
  15: { emoji: '🏆', title: 'FINAL BOSS: Word Problems', body: 'Two-step word problems — read, plan, then calculate!',  tip: 'Do one calculation at a time — no rushing!' },
};

const P2_HINTS: Record<number, string> = {
  1:  '➕ Start from the bigger number and count up!',
  2:  '➖ Start from the bigger number and count down!',
  3:  '💯 Break into tens and units to make it easier!',
  4:  '✖️ Skip-count to find the answer!',
  5:  '❓ Think: what makes the total correct?',
  6:  '🔢 Which digit is in the tens place?',
  7:  '💰 Total cost first, then find the change!',
  8:  '⏰ Count the hours forward on the clock!',
  9:  '📖 Look for keywords: "altogether", "left", "more".',
  10: '🪞 Double means ×2. Half means ÷2.',
  11: '✖️ Use a known fact to help!',
  12: '➗ How many groups fit into the total?',
  13: '🍕 Half = ÷2. Quarter = ÷4.',
  14: '📐 Add ALL four sides of the shape!',
  15: '🏆 Solve one step at a time!',
};

// Sub-world boundaries for Phase 2 (levelInPhase → world name + color)
const P2_WORLDS = [
  { levels: [1, 2, 3, 4, 5],      name: 'Academy of Numbers', emoji: '🏫', color: '#2563EB', bgHex: '#EFF6FF', bg: 'bg-[#EFF6FF]', badge: 'bg-[#93C5FD]' },
  { levels: [6, 7, 8, 9, 10],     name: "Merchant's Guild",   emoji: '🏪', color: '#D97706', bgHex: '#FFFBEB', bg: 'bg-[#FFFBEB]', badge: 'bg-[#FCD34D]' },
  { levels: [11, 12, 13, 14, 15], name: "Dragon's Tower",     emoji: '🐉', color: '#DC2626', bgHex: '#FEF2F2', bg: 'bg-[#FEF2F2]', badge: 'bg-[#FCA5A5]' },
];

// ─── Phase 3 constants ────────────────────────────────────────────────────────

const P3_LEVEL_INTROS: Record<number, { emoji: string; title: string; body: string; tip: string }> = {
  // World 1 — Merchant Republic
  1:  { emoji: '🏦', title: 'Welcome to the Merchant Republic!', body: 'Master big multiplication to dominate the marketplace.', tip: 'Try 23×14 = 23×10 + 23×4 — split it up!' },
  2:  { emoji: '➗', title: 'Division with Remainders',          body: 'Not every number divides perfectly — find what is left over!', tip: 'Quotient × divisor + remainder = the original.' },
  3:  { emoji: '🔢', title: 'Decimal Duels',                    body: 'Add and subtract decimal numbers — every decimal place counts!', tip: 'Line up the decimal point before calculating.' },
  4:  { emoji: '%',  title: 'Percentage Power',                 body: 'Find 10% first — then scale up or down. The merchant method!', tip: '10% = divide by 10. 20% = double of 10%.' },
  5:  { emoji: '👑', title: 'BOSS: The Guild Master!',          body: 'Multi-step money challenges. Change, discounts, split bills — all at once!', tip: 'One step at a time. Total first, then adjust.' },
  // World 2 — Engineers' Citadel
  6:  { emoji: '🏗️', title: "Enter the Engineers' Citadel!",  body: 'Area — how many square metres fill the space? Not the same as perimeter!', tip: 'Area = length × width. Perimeter = 2×(l+w).' },
  7:  { emoji: '➗', title: 'Fraction Files',                   body: 'Simplify fractions — find the smallest equivalent form.', tip: 'Divide both top and bottom by the same number.' },
  8:  { emoji: '🧮', title: 'Fraction Fusion',                  body: 'Add and subtract fractions with DIFFERENT denominators.', tip: 'Convert to a common denominator first!' },
  9:  { emoji: '⚖️', title: 'Ratio & Proportion',              body: 'Scale ratios up or down — the citadel needs exact measurements!', tip: 'If ratio is 2:3 and you multiply one part, multiply the other.' },
  10: { emoji: '👷', title: 'BOSS: Chief Architect!',          body: 'Combined challenge — area, fractions, and ratios together!', tip: 'Solve each part separately, then combine the results.' },
  // World 3 — Storm Observatory
  11: { emoji: '🌩️', title: 'Welcome to the Storm Observatory!', body: 'Negative numbers — below zero exists in science, finance, and nature.', tip: 'Use a number line. Going left means getting smaller.' },
  12: { emoji: '📊', title: 'Data Storm',                       body: 'Find the mean, median, and mode of data sets.', tip: 'Mean = total ÷ count. Median = middle. Mode = most common.' },
  13: { emoji: '🔣', title: 'Algebra Alert',                    body: 'Solve equations — find the hidden value of n!', tip: 'Do the OPPOSITE operation to isolate n on one side.' },
  14: { emoji: '⚙️', title: 'BODMAS Battle',                   body: 'Brackets first, then × and ÷, then + and −. Order matters!', tip: 'B → O → D → M → A → S. Never skip steps.' },
  15: { emoji: '🌩️', title: 'FINAL BOSS: Storm Warden!',      body: 'The ultimate synthesis — everything from all three worlds!', tip: 'Read carefully, plan your steps, then calculate.' },
};

const P3_HINTS: Record<number, string> = {
  1:  '✖️ Split: 23×14 = 23×10 + 23×4.',
  2:  '➗ Quotient × divisor + remainder = original.',
  3:  '🔢 Line up the decimal point before calculating.',
  4:  '% Find 10% first, then scale up or down.',
  5:  '💰 Total first — then find change or apply discount.',
  6:  '📐 Area = l × w. Don\'t confuse with perimeter!',
  7:  '➗ Divide top AND bottom by the same number.',
  8:  '🧮 Common denominator first!',
  9:  '⚖️ Multiply BOTH parts of the ratio by the same factor.',
  10: '🏗️ Solve each part separately.',
  11: '🌡️ Number line: left = smaller, right = bigger.',
  12: '📊 Sort the values first to find the median.',
  13: '🔣 Use the opposite operation to find n.',
  14: '⚙️ Brackets first, then × ÷, then + −.',
  15: '🌩️ Break it into steps — check each one.',
};

const P3_WORLDS = [
  { levels: [1, 2, 3, 4, 5],     name: 'Merchant Republic',  emoji: '🏦', color: '#0EA5E9', bgHex: '#F0F9FF', bg: 'bg-[#F0F9FF]', badge: 'bg-[#7DD3FC]' },
  { levels: [6, 7, 8, 9, 10],    name: "Engineers' Citadel", emoji: '🏗️', color: '#16A34A', bgHex: '#F0FDF4', bg: 'bg-[#F0FDF4]', badge: 'bg-[#86EFAC]' },
  { levels: [11, 12, 13, 14, 15], name: 'Storm Observatory', emoji: '🌩️', color: '#7C3AED', bgHex: '#F5F3FF', bg: 'bg-[#F5F3FF]', badge: 'bg-[#C4B5FD]' },
];

// ─── Phase 4 constants ────────────────────────────────────────────────────────

const P4_LEVEL_INTROS: Record<number, { emoji: string; title: string; body: string; tip: string }> = {
  1: { emoji: '🏔️', title: 'Welcome to The Pinnacle!',          body: 'Master complex fraction operations — the hardest math yet!',          tip: 'Find a common denominator before adding or subtracting.' },
  2: { emoji: '🔢', title: 'Decimal Mastery',                    body: 'Two decimal places and multiplication — precision is everything!',    tip: 'Count the total decimal places in your answer.' },
  3: { emoji: '📈', title: 'Percentage Challenges',               body: 'Percentage change and reverse percentages — the language of finance!', tip: 'Change ÷ original × 100 gives you % change.' },
  4: { emoji: '🧮', title: 'BODMAS + Exponents',                 body: 'Squares and cubes inside complex expressions — secondary school ready!', tip: 'Exponents come BEFORE multiply and divide.' },
  5: { emoji: '👑', title: 'FINAL BOSS: The Pinnacle Guardian!', body: 'Multi-step synthesis — every Pinnacle skill in one challenge.',        tip: 'Plan your steps on paper before calculating.' },
};

const P4_HINTS: Record<number, string> = {
  1: '🔢 Find a common denominator first!',
  2: '💰 Count decimal places in your final answer.',
  3: '📈 % change = (change ÷ original) × 100.',
  4: '🧮 Exponents first, then × ÷, then + −.',
  5: '👑 Take it one step at a time!',
};

const P4_WORLDS = [
  { levels: [1, 2, 3, 4, 5], name: 'The Pinnacle', emoji: '🏔️', color: '#9F1239', bgHex: '#FFF1F2', bg: 'bg-[#FFF1F2]', badge: 'bg-[#FECDD3]' },
];

// ─── Badge System ─────────────────────────────────────────────────────────────
const BADGES: { id: string; emoji: string; label: string; desc: string }[] = [
  { id: 'phase1_complete', emoji: '🌱', label: 'Sprout',           desc: 'Complete Pre-School'       },
  { id: 'phase2_complete', emoji: '📚', label: 'Scholar',          desc: 'Complete Lower Primary'    },
  { id: 'phase3_complete', emoji: '🗺️', label: 'Navigator',        desc: 'Complete Higher Primary'   },
  { id: 'phase4_complete', emoji: '🏆', label: 'Legend',           desc: 'Master all 4 phases'       },
  { id: 'boss_slayer',     emoji: '💀', label: 'Boss Slayer',      desc: 'Defeat your first boss'    },
  { id: 'streak_3',        emoji: '🔥', label: 'Hot Streak',       desc: 'Play 3 days in a row'      },
  { id: 'streak_7',        emoji: '🔥🔥','label': 'On Fire!',      desc: 'Play 7 days in a row'      },
  { id: 'coins_100',       emoji: '🪙', label: 'Century',          desc: 'Earn 100 lifetime coins'   },
  { id: 'coins_500',       emoji: '💰', label: 'Treasure Hoarder', desc: 'Earn 500 lifetime coins'   },
  { id: 'consolation_5',   emoji: '💪', label: 'Resilient',        desc: 'Collect 5 consolation coins'},
];

function getHint(phase: number, levelInPhase: number): string {
  if (phase === 1) return PHASE1_HINTS[levelInPhase] ?? '';
  if (phase === 2) return P2_HINTS[levelInPhase] ?? '';
  if (phase === 3) return P3_HINTS[levelInPhase] ?? '';
  if (phase === 4) return P4_HINTS[levelInPhase] ?? '';
  return '';
}

const isBossLevel = (p: number, lip: number): boolean => p >= 2 && [5, 10, 15].includes(lip);

type PhaseConfig = {
  id: number;
  name: string;
  ageRange: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  levels: { n: number; topic: string }[];
};

// --- Phase Curriculum Config ---
const PHASES: PhaseConfig[] = [
  {
    id: 1,
    name: 'Pre-School',
    ageRange: 'Ages 3–5',
    emoji: '🌱',
    bgColor: 'bg-[#FEF9C3]',
    borderColor: 'border-[#EAB308]',
    badgeBg: 'bg-[#FDE047]',
    levels: [
      { n: 1, topic: 'counting objects from 1 to 5' },
      { n: 2, topic: 'counting objects from 1 to 10' },
      { n: 3, topic: 'comparing two numbers — which is more or which is less' },
      { n: 4, topic: 'simple addition where the answer is 5 or less' },
      { n: 5, topic: 'simple subtraction where both numbers are 5 or less' },
      { n: 6, topic: 'subitizing — recognise a quantity at a glance' },
      { n: 7, topic: 'number bonds — find the missing part' },
      { n: 8, topic: 'counting objects from 11 to 20' },
      { n: 9, topic: 'identify shapes — circle, square, triangle, star' },
      { n: 10, topic: 'spot the pattern — what comes next?' },
    ],
  },
  {
    id: 2,
    name: 'Lower Primary',
    ageRange: 'Ages 6–8',
    emoji: '📚',
    bgColor: 'bg-[#DCFCE7]',
    borderColor: 'border-[#22C55E]',
    badgeBg: 'bg-[#4ADE80]',
    levels: [
      // World 1 — Academy of Numbers
      { n: 6,  topic: 'addition with answers up to 20' },
      { n: 7,  topic: 'subtraction within 20' },
      { n: 8,  topic: 'addition and subtraction with numbers up to 100' },
      { n: 9,  topic: 'times tables for 2, 5, and 10' },
      { n: 10, topic: 'missing number problems such as ? + 4 = 11 or 7 − ? = 3' },
      // World 2 — Merchant's Guild
      { n: 11, topic: 'place value — identifying tens and units digits' },
      { n: 12, topic: 'money — counting coins and making change' },
      { n: 13, topic: 'time — reading clocks and calculating hours ahead' },
      { n: 14, topic: 'word problems involving addition and subtraction' },
      { n: 15, topic: 'doubles and halves of numbers' },
      // World 3 — Dragon's Tower
      { n: 16, topic: 'times tables for 3, 4, and 6' },
      { n: 17, topic: 'division by sharing equally' },
      { n: 18, topic: 'simple fractions — half, quarter, and three quarters' },
      { n: 19, topic: 'perimeter of rectangles and squares' },
      { n: 20, topic: 'multi-step word problems requiring two calculations' },
    ],
  },
  {
    id: 3,
    name: 'Higher Primary',
    ageRange: 'Ages 9–12',
    emoji: '🔢',
    bgColor: 'bg-[#DBEAFE]',
    borderColor: 'border-[#3B82F6]',
    badgeBg: 'bg-[#60A5FA]',
    levels: [
      // World 1 — Merchant Republic
      { n: 1,  topic: 'long multiplication — 2-digit × 2-digit' },
      { n: 2,  topic: 'division with remainders — quotient and remainder' },
      { n: 3,  topic: 'decimal addition and subtraction (1 decimal place)' },
      { n: 4,  topic: 'percentages using the 10% anchor method' },
      { n: 5,  topic: 'multi-step money: change, discounts, and splitting bills' },
      // World 2 — Engineers' Citadel
      { n: 6,  topic: 'area of rectangles and squares in square metres' },
      { n: 7,  topic: 'simplifying fractions to lowest terms' },
      { n: 8,  topic: 'adding and subtracting fractions with unlike denominators' },
      { n: 9,  topic: 'ratio and proportion — scaling and map distances' },
      { n: 10, topic: 'combined area, fraction, and ratio problems' },
      // World 3 — Storm Observatory
      { n: 11, topic: 'negative integers — temperature changes and number lines' },
      { n: 12, topic: 'mean, median, and mode of data sets' },
      { n: 13, topic: 'algebraic equations — solve for the unknown n' },
      { n: 14, topic: 'advanced order of operations with brackets (BODMAS)' },
      { n: 15, topic: 'multi-step synthesis — algebra, data, and negative numbers' },
    ],
  },
  {
    id: 4,
    name: 'Advanced Primary',
    ageRange: 'Ages 11–12',
    emoji: '🧮',
    bgColor: 'bg-[#F3E8FF]',
    borderColor: 'border-[#A855F7]',
    badgeBg: 'bg-[#C084FC]',
    levels: [
      { n: 16, topic: 'adding and subtracting simple fractions' },
      { n: 17, topic: 'adding and subtracting decimal numbers' },
      { n: 18, topic: 'finding a percentage of a number such as 20% of 60' },
      { n: 19, topic: 'order of operations using BODMAS or PEMDAS' },
      { n: 20, topic: 'multi-step word problems requiring two or more calculations' },
    ],
  },
];

const PARENTAL_GATE_PROBLEMS = [
  { question: '(14 + 22) ÷ 4 = ?', answer: 9 },
  { question: '7 × 8 − 16 = ?', answer: 40 },
  { question: '144 ÷ 12 = ?', answer: 12 },
  { question: '(25 − 7) × 3 = ?', answer: 54 },
  { question: '3² + 4² = ?', answer: 25 },
];

// --- Sound System ---
function useSoundSystem() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const bgmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgmPlayingRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.gain.value = 1;
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return { ctx: ctxRef.current, master: masterGainRef.current! };
  }, []);

  const playNote = useCallback((
    ctx: AudioContext, master: GainNode,
    freq: number, startTime: number, duration: number,
    type: OscillatorType = 'sine', gainVal = 0.3
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(master);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }, []);

  const BGM_NOTES: [number, number][] = [
    [523.25, 0.25], [659.25, 0.25], [783.99, 0.25], [880.00, 0.25],
    [783.99, 0.50], [659.25, 0.25], [523.25, 0.25], [587.33, 0.50],
    [659.25, 0.25], [523.25, 0.25], [440.00, 0.25], [523.25, 0.75],
    [392.00, 0.25], [440.00, 0.25], [523.25, 0.25], [659.25, 0.25],
    [523.25, 0.50], [440.00, 0.25], [392.00, 0.25], [523.25, 1.00],
  ];

  const scheduleBGMLoop = useCallback((ctx: AudioContext, master: GainNode, startTime: number) => {
    if (!bgmPlayingRef.current) return;
    let t = startTime;
    const totalDur = BGM_NOTES.reduce((sum, [, dur]) => sum + dur, 0);
    BGM_NOTES.forEach(([freq, dur]) => {
      playNote(ctx, master, freq, t, dur - 0.04, 'triangle', 0.07);
      t += dur;
    });
    bgmTimerRef.current = setTimeout(() => {
      if (bgmPlayingRef.current) scheduleBGMLoop(ctx, master, ctx.currentTime + 0.05);
    }, (totalDur - 0.3) * 1000);
  }, [playNote]);

  const startBGM = useCallback(() => {
    if (bgmPlayingRef.current) return;
    bgmPlayingRef.current = true;
    const { ctx, master } = getCtx();
    scheduleBGMLoop(ctx, master, ctx.currentTime + 0.1);
  }, [getCtx, scheduleBGMLoop]);

  const stopBGM = useCallback(() => {
    bgmPlayingRef.current = false;
    if (bgmTimerRef.current) clearTimeout(bgmTimerRef.current);
  }, []);

  const playClick = useCallback(() => {
    const { ctx, master } = getCtx();
    playNote(ctx, master, 1046.5, ctx.currentTime, 0.08, 'sine', 0.35);
  }, [getCtx, playNote]);

  const playCorrect = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      playNote(ctx, master, freq, t + i * 0.12, 0.25, 'sine', 0.35)
    );
  }, [getCtx, playNote]);

  const playWrong = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    playNote(ctx, master, 349.23, t, 0.15, 'sawtooth', 0.18);
    playNote(ctx, master, 261.63, t + 0.18, 0.35, 'sawtooth', 0.18);
  }, [getCtx, playNote]);

  const playVictory = useCallback(() => {
    const { ctx, master } = getCtx();
    const t = ctx.currentTime;
    const fanfare: [number, number, number][] = [
      [523.25, 0.00, 0.15], [659.25, 0.15, 0.15], [783.99, 0.30, 0.15],
      [523.25, 0.50, 0.10], [659.25, 0.60, 0.10], [783.99, 0.70, 0.10],
      [1046.50, 0.85, 0.65],
    ];
    fanfare.forEach(([freq, offset, dur]) =>
      playNote(ctx, master, freq, t + offset, dur, 'sine', 0.4)
    );
  }, [getCtx, playNote]);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const newMuted = !prev;
      if (masterGainRef.current) masterGainRef.current.gain.value = newMuted ? 0 : 1;
      if (!newMuted) {
        const { ctx, master } = getCtx();
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(master);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.05);
        g.gain.setValueAtTime(0.35, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime + 0.05);
        osc.stop(ctx.currentTime + 0.2);
      }
      return newMuted;
    });
  }, [getCtx]);

  useEffect(() => {
    return () => {
      bgmPlayingRef.current = false;
      if (bgmTimerRef.current) clearTimeout(bgmTimerRef.current);
      ctxRef.current?.close();
    };
  }, []);

  return { muted, toggleMute, startBGM, stopBGM, playClick, playCorrect, playWrong, playVictory };
}

// --- Components ---

const ProgressBar = ({ current, max, color }: { current: number; max: number; color: string }) => (
  <div className="w-full bg-white rounded-full h-6 overflow-hidden border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${(current / max) * 100}%` }}
      className={`h-full ${color} border-r-4 border-black`}
    />
  </div>
);

function ParentalGate({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [problem] = useState(
    () => PARENTAL_GATE_PROBLEMS[Math.floor(Math.random() * PARENTAL_GATE_PROBLEMS.length)]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer.trim(), 10) === problem.answer) {
      onSuccess();
    } else {
      setError(true);
      setAnswer('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔒</div>
          <h2 className="text-2xl font-black">Parent Check</h2>
          <p className="text-sm font-bold text-gray-500 mt-1">Solve this to change difficulty</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 text-center mb-5 border-2 border-black">
          <p className="text-3xl font-black">{problem.question}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="number"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Your answer..."
            autoFocus
            className={`text-center text-2xl font-black p-4 rounded-2xl border-4 outline-none transition-colors ${
              error ? 'border-[#F87171] bg-[#FEF2F2]' : 'border-black'
            }`}
          />
          {error && <p className="text-[#EF4444] font-black text-center text-sm">Wrong! Try again.</p>}
          <div className="flex gap-3 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 border-4 border-black py-3 rounded-2xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-[#3B82F6] text-white border-4 border-black py-3 rounded-2xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all">
              Submit
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function PhaseSelect({ currentPhase, onSelect, onClose }: {
  currentPhase: number;
  onSelect: (phaseId: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md my-4"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-black">Choose Difficulty</h2>
          <button onClick={onClose}
            className="w-10 h-10 bg-gray-100 border-2 border-black rounded-xl font-black text-lg flex items-center justify-center">
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {PHASES.map(ph => (
            <button
              key={ph.id}
              onClick={() => onSelect(ph.id)}
              className={`${ph.bgColor} ${ph.borderColor} border-4 p-4 rounded-2xl text-left transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 ${
                currentPhase === ph.id ? 'ring-4 ring-black ring-offset-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ph.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-base leading-tight">{ph.name}</p>
                    {currentPhase === ph.id && (
                      <span className="bg-black text-white text-xs font-black px-2 py-0.5 rounded-lg">NOW</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-500">{ph.ageRange}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// --- Pre-School Tutorial ---
function TutorialScreen({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const current = TUTORIAL_SLIDES[slide];
  const isLast = slide === TUTORIAL_SLIDES.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Back to home — always accessible from tutorial */}
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-700 text-sm font-black px-3 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] no-underline transition-all z-10">
        ← Home
      </Link>
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className={`${current.bg} w-full max-w-sm rounded-[36px] border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center text-center`}
        >
          {/* Slide counter dots */}
          <div className="flex gap-2 mb-6">
            {TUTORIAL_SLIDES.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full border-2 border-black transition-all ${i === slide ? 'bg-black scale-125' : 'bg-white'}`} />
            ))}
          </div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="text-8xl mb-5 drop-shadow-[0_6px_6px_rgba(0,0,0,0.15)]"
          >
            {current.emoji}
          </motion.div>

          <h2 className="text-2xl font-black mb-3 leading-tight">{current.title}</h2>
          <p className="text-base font-bold text-gray-600 mb-8 leading-relaxed">{current.body}</p>

          <button
            onClick={() => isLast ? onDone() : setSlide(s => s + 1)}
            className="w-full bg-black text-white py-4 rounded-2xl text-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            {isLast ? '🚀 Start Playing!' : 'Next →'}
          </button>

          {slide > 0 && (
            <button onClick={() => setSlide(s => s - 1)} className="mt-3 text-sm font-black text-gray-400 hover:text-gray-600">
              ← Back
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Level Intro Card (Phase 1, 2, and 3 world entries) ---
function LevelIntroCard({ phase, levelInPhase, totalLevels, onStart }: { phase: number; levelInPhase: number; totalLevels: number; onStart: () => void }) {
  const isPhase2 = phase === 2;
  const isPhase3 = phase === 3;
  const isPhase4 = phase === 4;

  const intro = isPhase4
    ? (P4_LEVEL_INTROS[levelInPhase] ?? P4_LEVEL_INTROS[1])
    : isPhase3
      ? (P3_LEVEL_INTROS[levelInPhase] ?? P3_LEVEL_INTROS[1])
      : isPhase2
        ? (P2_LEVEL_INTROS[levelInPhase] ?? P2_LEVEL_INTROS[1])
        : (LEVEL_INTROS[levelInPhase] ?? LEVEL_INTROS[1]);

  const world = isPhase4
    ? P4_WORLDS.find(w => w.levels.includes(levelInPhase))
    : isPhase3
      ? P3_WORLDS.find(w => w.levels.includes(levelInPhase))
      : isPhase2
        ? P2_WORLDS.find(w => w.levels.includes(levelInPhase))
        : null;
  const isWorldEntry = (isPhase2 || isPhase3 || isPhase4) && world?.levels[0] === levelInPhase;

  const badgeBg  = world ? world.badge : 'bg-[#FEF9C3]';
  const tipBg    = world ? world.bg    : 'bg-[#DCFCE7]';
  const tipBorder = world ? '' : 'border-[#22C55E]';
  const tipColor  = world ? '' : 'text-[#15803D]';
  const btnColor  = world ? world.color : '#3B82F6';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Back to home — always accessible from level intro */}
      <Link to="/" className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 hover:bg-white text-gray-700 text-sm font-black px-3 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] no-underline transition-all z-10">
        ← Home
      </Link>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="bg-white w-full max-w-sm rounded-[32px] border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col items-center text-center"
      >
        {isWorldEntry && world && (
          <div className="w-full mb-4 rounded-2xl py-2 px-4 font-black text-sm uppercase tracking-widest text-white text-center" style={{ background: world.color }}>
            {world.emoji} {world.name}
          </div>
        )}
        <div className={`${badgeBg} w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-4xl mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
          {intro.emoji}
        </div>
        <div className="bg-black text-white text-xs font-black px-4 py-1 rounded-full mb-3 uppercase tracking-widest">
          Level {levelInPhase} of {totalLevels}
        </div>
        <h2 className="text-2xl font-black mb-2">{intro.title}</h2>
        <p className="text-gray-500 font-bold mb-3">{intro.body}</p>
        <div
          className={`${tipBg} border-2 rounded-2xl px-4 py-3 mb-6 w-full`}
          style={world ? { borderColor: world.color } : undefined}
        >
          <p className={`text-sm font-black ${tipColor}`}>💡 Tip: {intro.tip}</p>
        </div>
        <button
          onClick={onStart}
          className="w-full text-white py-4 rounded-2xl text-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
          style={{ background: btnColor }}
        >
          I'm Ready! ✊
        </button>
      </motion.div>
    </div>
  );
}

// --- Companion Setup Modal (B5) ---
const COMPANION_CHOICES = [
  { emoji: '🐉', label: 'Dragon' },
  { emoji: '🤖', label: 'Robot' },
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐼', label: 'Panda' },
];

function CompanionSetup({ onDone }: { onDone: (name: string, emoji: string) => void }) {
  const [name, setName] = useState('Sparky');
  const [emoji, setEmoji] = useState('🐉');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm"
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{emoji}</div>
          <h2 className="text-2xl font-black">Name Your Companion!</h2>
          <p className="text-sm font-bold text-gray-500 mt-1">They'll cheer you on through every level</p>
        </div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value.slice(0, 12))}
          placeholder="Sparky"
          maxLength={12}
          className="w-full text-center text-2xl font-black p-4 rounded-2xl border-4 border-black outline-none mb-4"
        />
        <div className="grid grid-cols-4 gap-3 mb-6">
          {COMPANION_CHOICES.map(c => (
            <button
              key={c.emoji}
              onClick={() => setEmoji(c.emoji)}
              className={`text-4xl p-3 rounded-2xl border-4 transition-all ${emoji === c.emoji ? 'border-black bg-yellow-100 scale-110' : 'border-gray-200 bg-gray-50'}`}
              title={c.label}
            >
              {c.emoji}
            </button>
          ))}
        </div>
        <button
          onClick={() => onDone(name.trim() || 'Sparky', emoji)}
          className="w-full bg-[#3B82F6] text-white py-4 rounded-2xl text-xl font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
        >
          Start Adventure! 🚀
        </button>
      </motion.div>
    </div>
  );
}

// --- App ---
export default function Game() {
  const [searchParams] = useSearchParams();
  const urlPhaseParam = searchParams.get('phase');

  const [gameState, setGameState] = useState<GameState>('START');
  const [phase, setPhase] = useState(() => {
    if (urlPhaseParam) return Math.min(4, Math.max(1, parseInt(urlPhaseParam, 10) || 1));
    const saved = JSON.parse(localStorage.getItem('mathProgress') || 'null');
    return saved?.phase ?? 1;
  });
  const [levelInPhase, setLevelInPhase] = useState(() => {
    if (urlPhaseParam) return 1;
    const saved = JSON.parse(localStorage.getItem('mathProgress') || 'null');
    return saved?.levelInPhase ?? 1;
  });
  const [hasSavedProgress] = useState(() => {
    if (urlPhaseParam) return false;
    return !!JSON.parse(localStorage.getItem('mathProgress') || 'null');
  });
  const [progress, setProgress] = useState(0);
  const [coins, setCoins] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'CORRECT' | 'WRONG'; value: string } | null>(null);
  const [shake, setShake] = useState(false);
  const [isPhaseTransition, setIsPhaseTransition] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showParentalGate, setShowParentalGate] = useState(false);
  const [showPhaseSelect, setShowPhaseSelect] = useState(false);
  const [tutorialDone, setTutorialDone] = useState(() => localStorage.getItem('tutorialDone') === '1');
  const [flashVisible, setFlashVisible] = useState(true);
  const [companionEmotion, setCompanionEmotion] = useState<CompanionEmotion>('idle');
  const [companionMessage, setCompanionMessage] = useState<string | null>(null);
  // B2 — explanatory feedback
  const [wrongAttempts, setWrongAttempts] = useState(0);
  // B3 — boss level tracking
  const [bossDefeated, setBossDefeated] = useState(false);
  // B4 — streak
  const [streakCount, setStreakCount] = useState(0);
  const [streakUpdatedToday, setStreakUpdatedToday] = useState(false);
  // Badge system
  const [earnedBadges, setEarnedBadges] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem('earnedBadges') || '[]')
  );
  // B5 — companion personalisation
  const [companionName, setCompanionName] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('companionSetup') || 'null');
    return saved?.name ?? 'Sparky';
  });
  const [companionEmoji, setCompanionEmoji] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('companionSetup') || 'null');
    return saved?.emoji ?? '🐉';
  });
  const [showCompanionSetup, setShowCompanionSetup] = useState(() => !localStorage.getItem('companionSetup'));

  const { muted, toggleMute, startBGM, stopBGM, playClick, playCorrect, playWrong, playVictory } = useSoundSystem();
  const { speakQuestion, speakCorrect, speakWrong, speakLevelUp, speakVictory, speakWelcome } = useNarration(muted);

  const currentPhaseConfig = PHASES[phase - 1];

  const loadQuestion = useCallback((p: number, l: number) => {
    setProblem(generateProblem(p, l));
  }, []);

  const awardBadge = useCallback((id: string) => {
    setEarnedBadges(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('earnedBadges', JSON.stringify(next));
      return next;
    });
  }, []);

  // B4 — initialise streak from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('streakData') || 'null');
    if (!saved) return;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (saved.lastPlayDate === today) {
      setStreakCount(saved.streakCount);
      setStreakUpdatedToday(true);
    } else if (saved.lastPlayDate === yesterday) {
      setStreakCount(saved.streakCount);
    } else {
      setStreakCount(0);
    }
  }, []);

  // B2 — reset wrongAttempts whenever a new problem loads
  useEffect(() => {
    setWrongAttempts(0);
  }, [problem]);

  // Subitizing flash: show objects for 1.5 s, then hide and reveal answer buttons
  useEffect(() => {
    if (gameState === 'PLAYING' && problem?.meta?.isSubitizing) {
      setFlashVisible(true);
      const timer = setTimeout(() => setFlashVisible(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setFlashVisible(true);
    }
  }, [problem, gameState]);

  // Companion thinks + narration speaks whenever a new question appears
  useEffect(() => {
    if (gameState === 'PLAYING' && problem) {
      setCompanionEmotion('thinking');
      setCompanionMessage(null);
      speakQuestion(problem.question, problem.meta?.isSubitizing);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem]);

  // Auto-reset companion to idle after 3 s of non-idle emotion
  useEffect(() => {
    if (companionEmotion === 'idle') return;
    const t = setTimeout(() => {
      setCompanionEmotion('idle');
      setCompanionMessage(null);
    }, 3000);
    return () => clearTimeout(t);
  }, [companionEmotion]);

  const startGame = useCallback(() => {
    playClick();
    let startPhase = phase;
    let startLevel = levelInPhase;

    if (isGameComplete) {
      startPhase = 1;
      startLevel = 1;
      setPhase(1);
      setLevelInPhase(1);
      setCoins(0);
      setIsGameComplete(false);
      setIsPhaseTransition(false);
    }

    setProgress(0);
    setFeedback(null);
    setBossDefeated(false);
    setCompanionEmotion('excited');
    setCompanionMessage(null);
    startBGM();
    speakWelcome();

    // Show tutorial first time in Phase 1; show world intros at sub-world entries
    const isP2WorldEntry = startPhase === 2 && [1, 6, 11].includes(startLevel);
    const isP3WorldEntry = startPhase === 3 && [1, 6, 11].includes(startLevel);
    const isP4WorldEntry = startPhase === 4 && startLevel === 1;
    if (startPhase === 1 && !tutorialDone) {
      setGameState('TUTORIAL');
    } else if (startPhase === 1 || isP2WorldEntry || isP3WorldEntry || isP4WorldEntry) {
      setGameState('LEVEL_INTRO');
      loadQuestion(startPhase, startLevel);
    } else {
      setGameState('PLAYING');
      loadQuestion(startPhase, startLevel);
    }
  }, [phase, levelInPhase, isGameComplete, tutorialDone, playClick, startBGM, loadQuestion]);

  const handleTutorialDone = useCallback(() => {
    localStorage.setItem('tutorialDone', '1');
    setTutorialDone(true);
    setGameState('LEVEL_INTRO');
    loadQuestion(phase, levelInPhase);
  }, [phase, levelInPhase, loadQuestion]);

  const handleLevelIntroStart = useCallback(() => {
    setGameState('PLAYING');
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd', '#f9bec7'],
    });
  };

  const handleAnswer = useCallback((choice: number | string) => {
    if (!problem) return;

    if (choice === problem.correctAnswer) {
      playCorrect();
      speakCorrect();
      const requiredToWin = isBossLevel(phase, levelInPhase) ? 7 : 5;
      setCompanionEmotion(progress + 1 >= requiredToWin ? 'celebrating' : 'excited');
      setCompanionMessage(null);
      triggerConfetti();
      setCoins(prev => prev + 10);
      setFeedback({ type: 'CORRECT', value: 'Awesome!' });
      const newProgress = progress + 1;
      setProgress(newProgress);

      // B4 — streak: award bonus coins on first correct answer of a new streak day
      if (!streakUpdatedToday) {
        const today = new Date().toISOString().slice(0, 10);
        const saved = JSON.parse(localStorage.getItem('streakData') || 'null');
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const newStreak = saved?.lastPlayDate === yesterday ? (saved.streakCount + 1) : 1;
        const bonus = Math.min(newStreak * 5, 50);
        setStreakCount(newStreak);
        setCoins(prev => prev + bonus);
        localStorage.setItem('streakData', JSON.stringify({ streakCount: newStreak, lastPlayDate: today }));
        setStreakUpdatedToday(true);
        if (newStreak >= 3)  awardBadge('streak_3');
        if (newStreak >= 7)  awardBadge('streak_7');
      }
      // Lifetime coins tracking + badges
      const prevLifetime = parseInt(localStorage.getItem('lifetimeCoins') || '0', 10);
      const newLifetime = prevLifetime + 10;
      localStorage.setItem('lifetimeCoins', String(newLifetime));
      if (newLifetime >= 100)  awardBadge('coins_100');
      if (newLifetime >= 500)  awardBadge('coins_500');

      if (newProgress >= requiredToWin) {
        const wasLastLevel = levelInPhase === currentPhaseConfig.levels.length;
        const wasLastPhase = phase === 4;
        const wasBonus = isBossLevel(phase, levelInPhase);

        setTimeout(() => {
          setFeedback(null);
          stopBGM();
          playVictory();
          speakVictory();
          setCompanionEmotion('celebrating');
          setProgress(0);
          setBossDefeated(wasBonus);

          // B1 — persist progress
          if (wasLastLevel && wasLastPhase) {
            localStorage.removeItem('mathProgress');
          } else if (wasLastLevel) {
            localStorage.setItem('mathProgress', JSON.stringify({ phase: phase + 1, levelInPhase: 1 }));
          } else {
            localStorage.setItem('mathProgress', JSON.stringify({ phase, levelInPhase: levelInPhase + 1 }));
          }

          // Award phase-complete badges
          if (wasLastLevel) {
            if (phase === 1) awardBadge('phase1_complete');
            if (phase === 2) awardBadge('phase2_complete');
            if (phase === 3) awardBadge('phase3_complete');
            if (phase === 4) awardBadge('phase4_complete');
          }
          // Award boss-slayer badge
          if (wasBonus) awardBadge('boss_slayer');

          const nextLevelInPhase = levelInPhase + 1;
          const isP2WorldEntry = !wasLastLevel && phase === 2 && [6, 11].includes(nextLevelInPhase);
          const isP3WorldEntry = !wasLastLevel && phase === 3 && [6, 11].includes(nextLevelInPhase);

          if (wasLastLevel) {
            setIsPhaseTransition(true);
            setIsGameComplete(wasLastPhase);
            if (!wasLastPhase) {
              setPhase(prev => prev + 1);
              setLevelInPhase(1);
            }
          } else {
            setIsPhaseTransition(false);
            setIsGameComplete(false);
            setLevelInPhase(prev => prev + 1);
          }

          setGameState('VICTORY');
          // B3 — boss confetti
          if (wasBonus) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#F97316', '#EF4444', '#DC2626'] });
          }
          // Pre-load next question so level intro card is ready
          if (!wasLastLevel && (phase === 1 || isP2WorldEntry || isP3WorldEntry)) {
            loadQuestion(phase, nextLevelInPhase);
          }
        }, 1500);
      } else {
        setTimeout(() => {
          setFeedback(null);
          loadQuestion(phase, levelInPhase);
        }, 1500);
      }
    } else {
      playWrong();
      speakWrong();
      setCompanionEmotion('encouraging');
      setCompanionMessage(null);
      const newWrong = wrongAttempts + 1;
      setWrongAttempts(newWrong);
      if (newWrong >= 2) {
        // B2 — reveal correct answer after 2 wrong attempts
        setFeedback({ type: 'WRONG', value: '__REVEAL__' });
      } else {
        // Consolation coins: +2 on first wrong attempt
        setCoins(prev => prev + 2);
        const prevLC = parseInt(localStorage.getItem('lifetimeCoins') || '0', 10);
        const newLC = prevLC + 2;
        localStorage.setItem('lifetimeCoins', String(newLC));
        if (newLC >= 100) awardBadge('coins_100');
        if (newLC >= 500) awardBadge('coins_500');
        const consolationTotal = parseInt(localStorage.getItem('consolationCoins') || '0', 10) + 2;
        localStorage.setItem('consolationCoins', String(consolationTotal));
        if (consolationTotal >= 5) awardBadge('consolation_5');
        setFeedback({ type: 'WRONG', value: '+2 🪙 Keep going!' });
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setTimeout(() => setFeedback(null), 1200);
      }
    }
  }, [problem, progress, phase, levelInPhase, wrongAttempts, streakUpdatedToday, awardBadge, playCorrect, playWrong, playVictory, stopBGM, loadQuestion]);

  const handlePhaseSelect = (newPhase: number) => {
    setPhase(newPhase);
    setLevelInPhase(1);
    setProgress(0);
    setShowPhaseSelect(false);
  };

  // After state updates in handleAnswer, phase/levelInPhase already reflect the NEW values
  const victoryPhaseConfig = PHASES[phase - 1];

  return (
    <div className="min-h-screen bg-[#FFE5F1] font-sans text-black flex flex-col items-center p-4 md:p-8 overflow-x-hidden">

      {/* Overlays */}
      {showCompanionSetup && (
        <CompanionSetup onDone={(name, emoji) => {
          setCompanionName(name);
          setCompanionEmoji(emoji);
          localStorage.setItem('companionSetup', JSON.stringify({ name, emoji }));
          setShowCompanionSetup(false);
        }} />
      )}
      {showParentalGate && (
        <ParentalGate
          onSuccess={() => { setShowParentalGate(false); setShowPhaseSelect(true); }}
          onClose={() => setShowParentalGate(false)}
        />
      )}
      {showPhaseSelect && (
        <PhaseSelect
          currentPhase={phase}
          onSelect={handlePhaseSelect}
          onClose={() => setShowPhaseSelect(false)}
        />
      )}
      {gameState === 'TUTORIAL' && (
        <TutorialScreen onDone={handleTutorialDone} />
      )}
      {gameState === 'LEVEL_INTRO' && (
        <LevelIntroCard phase={phase} levelInPhase={levelInPhase} totalLevels={currentPhaseConfig.levels.length} onStart={handleLevelIntroStart} />
      )}

      {/* HUD */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 md:mb-8 bg-white p-2 md:p-4 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Phase + Level */}
        <div className="flex items-center gap-1 md:gap-3">
          <div className={`${currentPhaseConfig.badgeBg} p-2 md:p-3 rounded-2xl border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-base md:text-xl leading-none`}>
            {currentPhaseConfig.emoji}
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-wider leading-tight text-gray-500">{currentPhaseConfig.name}</p>
            <p className="text-xl md:text-3xl font-black leading-none">
              {levelInPhase}<span className="text-sm md:text-base font-black text-gray-400">/{currentPhaseConfig.levels.length}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 mx-6 hidden md:block">
          <div className="flex justify-between text-sm font-black uppercase mb-2">
            <span>{isBossLevel(phase, levelInPhase) ? '💀 BOSS HP' : 'Progress'}</span>
            <span>{progress} / {isBossLevel(phase, levelInPhase) ? 7 : 5}</span>
          </div>
          <ProgressBar
            current={isBossLevel(phase, levelInPhase) ? Math.max(0, 7 - progress) : progress}
            max={isBossLevel(phase, levelInPhase) ? 7 : 5}
            color={isBossLevel(phase, levelInPhase) ? 'bg-[#EF4444]' : 'bg-[#4ADE80]'}
          />
        </div>

        {/* Coins + Streak + Mute */}
        <div className="flex items-center gap-1 md:gap-3">
          {streakCount > 0 && (
            <div className="flex items-center gap-1 bg-orange-100 border-2 border-orange-400 px-1 md:px-2 py-1 rounded-xl">
              <span className="text-sm leading-none">🔥</span>
              <span className="font-black text-orange-700 text-xs md:text-sm">{streakCount}</span>
            </div>
          )}
          <div className="text-right">
            <p className="text-[10px] md:text-sm font-black uppercase tracking-wider hidden md:block">Coins</p>
            <p className="text-xl md:text-3xl font-black leading-none text-[#F59E0B]">{coins}</p>
          </div>
          <div className="bg-[#FEF3C7] p-2 md:p-3 rounded-2xl border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Coins className="text-[#F59E0B] fill-[#F59E0B] w-4 h-4 md:w-6 md:h-6" />
          </div>
          <button
            onClick={toggleMute}
            className={`p-2 md:p-3 rounded-2xl border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all ${muted ? 'bg-gray-100' : 'bg-[#E0F2FE]'}`}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="text-gray-400 w-4 h-4 md:w-6 md:h-6" /> : <Volume2 className="text-[#3B82F6] w-4 h-4 md:w-6 md:h-6" />}
          </button>
          <Link
            to="/"
            className="p-2 md:p-3 rounded-2xl border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 active:shadow-none active:translate-y-1 active:translate-x-1 transition-all"
            title="Back to Home"
          >
            <Home className="text-gray-600 w-4 h-4 md:w-6 md:h-6" />
          </Link>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 w-full max-w-2xl flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">

          {/* START */}
          {gameState === 'START' && (
            <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center w-full">
              <div className="mb-12 relative flex justify-center">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-[150px] drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]"
                >👾</motion.div>
                <div className="absolute -bottom-6 bg-white px-8 py-3 rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
                  <h1 className="text-3xl md:text-4xl font-black whitespace-nowrap">MATH MONSTERS</h1>
                </div>
              </div>
              <p className="text-xl font-bold mb-6 max-w-sm mx-auto">Feed your monster by solving fun math puzzles!</p>

              {/* Phase card */}
              <div className={`${currentPhaseConfig.bgColor} ${currentPhaseConfig.borderColor} border-4 rounded-2xl p-4 mb-6 flex items-center justify-between max-w-sm mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentPhaseConfig.emoji}</span>
                  <div className="text-left">
                    <p className="font-black leading-tight">{currentPhaseConfig.name}</p>
                    <p className="text-sm font-bold text-gray-500">{currentPhaseConfig.ageRange}</p>
                  </div>
                </div>
                <button
                  onClick={() => { playClick(); setShowParentalGate(true); }}
                  className="bg-white border-4 border-black px-3 py-2 rounded-xl font-black text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 transition-all flex items-center gap-1"
                >
                  <Lock size={14} />
                  Change
                </button>
              </div>

              {hasSavedProgress && (
                <div className="inline-flex items-center gap-2 bg-green-100 border-2 border-green-500 text-green-800 text-sm font-black px-4 py-2 rounded-full mb-4">
                  ▶ Continue: {PHASES[phase - 1].name} · Level {levelInPhase}
                </div>
              )}
              <button
                onClick={startGame}
                className="group relative bg-[#3B82F6] hover:bg-[#2563EB] text-white px-12 py-6 rounded-full border-4 border-black text-3xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto"
              >
                {hasSavedProgress ? 'CONTINUE' : 'PLAY NOW'}
                <ChevronRight size={32} className="group-hover:translate-x-2 transition-transform" />
              </button>

              {/* Companion card */}
              <div className="mt-6 w-full max-w-sm mx-auto flex items-center justify-between bg-white border-4 border-black rounded-2xl px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{companionEmoji}</span>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400 leading-none">Your companion</p>
                    <p className="font-black text-lg leading-tight">{companionName}</p>
                  </div>
                </div>
                <button
                  onClick={() => { playClick(); setShowCompanionSetup(true); }}
                  className="bg-gray-100 border-2 border-black px-3 py-1.5 rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 active:translate-x-0.5 transition-all"
                >
                  ✏️ Edit
                </button>
              </div>

              {/* Badge Gallery */}
              <div className="mt-4 w-full max-w-sm mx-auto">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 text-center">Badges ({earnedBadges.length}/{BADGES.length})</p>
                <div className="grid grid-cols-5 gap-2">
                  {BADGES.map(b => {
                    const earned = earnedBadges.includes(b.id);
                    return (
                      <div key={b.id} title={earned ? `${b.label}: ${b.desc}` : `Locked: ${b.desc}`}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${earned ? 'border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-200 bg-gray-100 opacity-40'}`}>
                        <span className={`text-2xl ${earned ? '' : 'grayscale'}`}>{b.emoji}</span>
                        <span className="text-[9px] font-black text-center leading-tight mt-1 text-gray-600">{b.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Link to="/" className="mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 no-underline flex items-center gap-1 mx-auto transition-colors">
                ← Back to Home
              </Link>
            </motion.div>
          )}

          {/* PLAYING */}
          {gameState === 'PLAYING' && (
            <motion.div key="playing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center">
              {/* Monster + Companion row */}
              <div className="w-full flex items-end justify-center gap-6 mb-3">
                {/* Companion (player's ally) */}
                <div className="mb-1">
                  <Companion emotion={companionEmotion} customMessage={companionMessage} name={companionName} emoji={companionEmoji} />
                </div>
                {/* Monster (enemy) */}
                <motion.div
                  animate={shake ? { x: [-10, 10, -10, 10, 0] } : { y: [0, -8, 0] }}
                  transition={shake ? { duration: 0.4 } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-[72px] drop-shadow-[0_6px_6px_rgba(0,0,0,0.2)]"
                >
                  {feedback?.type === 'CORRECT' ? '🥰' : feedback?.type === 'WRONG' ? '😵' : '👾'}
                </motion.div>
                {/* Spacer to keep monster centred */}
                <div className="w-12" />
              </div>

              <div className="w-full bg-white rounded-[32px] p-6 md:p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                {feedback && feedback.value !== '__REVEAL__' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute inset-0 z-10 flex items-center justify-center text-5xl font-black border-4 border-black rounded-[28px] ${
                      feedback.type === 'CORRECT' ? 'bg-[#4ADE80]' : 'bg-[#F87171]'
                    }`}
                  >
                    {feedback.value}
                  </motion.div>
                )}
                {feedback?.value === '__REVEAL__' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white border-4 border-black rounded-[28px] p-6 text-center"
                  >
                    <div className="text-lg font-black text-gray-500 mb-1">Correct Answer:</div>
                    <div className="text-5xl font-black text-[#22C55E] mb-3">{problem?.correctAnswer}</div>
                    <div className="bg-[#FEF9C3] border-2 border-[#EAB308] rounded-2xl px-4 py-3 mb-5 w-full">
                      <p className="text-sm font-black text-[#92400E]">{problem?.explanation ?? getHint(phase, levelInPhase)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setFeedback(null);
                        setWrongAttempts(0);
                        loadQuestion(phase, levelInPhase);
                      }}
                      className="bg-[#3B82F6] text-white px-8 py-3 rounded-2xl text-lg font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
                    >
                      Got it! Next →
                    </button>
                  </motion.div>
                )}

                <>
                  {/* Subitizing: show flash or "what did you see?" */}
                  {problem?.meta?.isSubitizing ? (
                    flashVisible ? (
                      <div className="text-center mb-5">
                        <p className="text-sm font-black uppercase tracking-wider text-gray-400 mb-3">
                          ⚡ Quick Count! ⚡
                        </p>
                        <div className="bg-[#FEF9C3] border-4 border-[#EAB308] rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-4xl md:text-5xl leading-loose tracking-widest">{problem?.question}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center mb-5">
                        <p className="text-5xl mb-3">🤔</p>
                        <h2 className="text-2xl md:text-4xl font-black">How many did you see?</h2>
                      </div>
                    )
                  ) : (
                    <div className="text-center mb-5">
                      <p className="text-sm font-black uppercase tracking-wider text-gray-400 mb-2">
                        {currentPhaseConfig.emoji} {currentPhaseConfig.name} · Level {levelInPhase}/{currentPhaseConfig.levels.length}
                      </p>
                      <h2 className="text-2xl md:text-4xl font-black leading-tight whitespace-pre-line">{problem?.question}</h2>
                    </div>
                  )}

                  {/* Number bond visual (level 7) */}
                  {problem?.meta?.bondTotal !== undefined && (
                    <div className="flex flex-col items-center mb-4">
                      <div className="flex gap-1 flex-wrap justify-center mb-1">
                        {Array.from({ length: problem.meta.bondTotal }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-9 h-9 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                              i < (problem.meta!.bondTotal! - problem.meta!.bondKnown!)
                                ? 'bg-[#4ADE80]'
                                : 'bg-[#FDE047]'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                        <span className="text-[#15803D]">■ hidden</span> + <span className="text-[#A16207]">■ {problem.meta.bondKnown}</span> = {problem.meta.bondTotal}
                      </p>
                    </div>
                  )}

                  {/* Hint strip */}
                  {phase === 1 && PHASE1_HINTS[levelInPhase] && (
                    <div className="bg-[#FEF9C3] border-2 border-[#EAB308] rounded-2xl px-4 py-2 mb-4 text-center">
                      <p className="text-sm font-black text-[#92400E]">{PHASE1_HINTS[levelInPhase]}</p>
                    </div>
                  )}
                  {phase === 2 && P2_HINTS[levelInPhase] && (
                    <div className="bg-[#EFF6FF] border-2 border-[#93C5FD] rounded-2xl px-4 py-2 mb-4 text-center">
                      <p className="text-sm font-black text-[#1D4ED8]">{P2_HINTS[levelInPhase]}</p>
                    </div>
                  )}
                  {phase === 3 && P3_HINTS[levelInPhase] && (() => {
                    const w3 = P3_WORLDS.find(w => w.levels.includes(levelInPhase));
                    return (
                      <div className="border-2 rounded-2xl px-4 py-2 mb-4 text-center" style={{ background: w3?.bgHex ?? '#F0F9FF', borderColor: w3?.color ?? '#0EA5E9' }}>
                        <p className="text-sm font-black" style={{ color: w3?.color ?? '#0EA5E9' }}>{P3_HINTS[levelInPhase]}</p>
                      </div>
                    );
                  })()}
                  {phase === 4 && P4_HINTS[levelInPhase] && (() => {
                    const w4 = P4_WORLDS.find(w => w.levels.includes(levelInPhase));
                    return (
                      <div className="border-2 rounded-2xl px-4 py-2 mb-4 text-center" style={{ background: w4?.bgHex ?? '#FFF1F2', borderColor: w4?.color ?? '#9F1239' }}>
                        <p className="text-sm font-black" style={{ color: w4?.color ?? '#9F1239' }}>{P4_HINTS[levelInPhase]}</p>
                      </div>
                    );
                  })()}

                  {/* Answer buttons — hidden during subitizing flash */}
                  {(!problem?.meta?.isSubitizing || !flashVisible) && (
                    <div className="grid grid-cols-2 gap-4">
                      {problem?.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt)}
                          disabled={!!feedback}
                          className="bg-[#E0F2FE] hover:bg-[#BAE6FD] border-4 border-black py-4 rounded-2xl text-2xl md:text-3xl font-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 disabled:opacity-50"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              </div>
            </motion.div>
          )}

          {/* VICTORY */}
          {gameState === 'VICTORY' && (
            <motion.div key="victory" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full bg-white p-12 rounded-[40px] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              {isGameComplete ? (
                <>
                  <div className="text-7xl mb-4">🏆</div>
                  <h2 className="text-5xl font-black mb-4">CHAMPION!</h2>
                  <p className="text-2xl font-bold mb-3">You've mastered all 4 phases!</p>
                  <p className="text-base font-bold text-gray-400 mb-10">From Pre-School to Advanced Primary. Incredible!</p>
                  <button onClick={startGame}
                    className="bg-[#FFD700] hover:bg-[#F59E0B] text-black px-12 py-6 rounded-full border-4 border-black text-2xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto">
                    PLAY AGAIN <Sparkles size={28} />
                  </button>
                </>
              ) : isPhaseTransition ? (
                <>
                  <div className="text-7xl mb-4">{victoryPhaseConfig.emoji}</div>
                  <div className={`inline-block ${victoryPhaseConfig.bgColor} ${victoryPhaseConfig.borderColor} border-4 px-6 py-2 rounded-full mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    <p className="font-black text-lg">Phase {victoryPhaseConfig.id} Unlocked!</p>
                  </div>
                  <h2 className="text-4xl font-black mb-2">{victoryPhaseConfig.name}</h2>
                  <p className="text-xl font-bold text-gray-400 mb-10">{victoryPhaseConfig.ageRange}</p>
                  <button onClick={startGame}
                    className={`${victoryPhaseConfig.badgeBg} text-black px-12 py-6 rounded-full border-4 border-black text-2xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto`}>
                    START PHASE {victoryPhaseConfig.id} <ChevronRight size={28} />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-40 h-40 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <Trophy className="text-black" size={80} />
                  </div>
                  <h2 className="text-5xl font-black mb-4">{bossDefeated ? 'BOSS DEFEATED! 💀' : 'LEVEL UP!'}</h2>
                  {(phase === 2 || phase === 3 || phase === 4) && (() => {
                    const worlds = phase === 4 ? P4_WORLDS : phase === 3 ? P3_WORLDS : P2_WORLDS;
                    const w = worlds.find(ww => ww.levels.includes(levelInPhase));
                    if (!w) return null;
                    return (
                      <div className="inline-block mb-3 px-4 py-1.5 rounded-full font-black text-sm text-white" style={{ background: w.color }}>
                        {w.emoji} {w.name}
                      </div>
                    );
                  })()}
                  <p className="text-xl font-bold text-gray-500 mb-10">
                    {currentPhaseConfig.emoji} {currentPhaseConfig.name} · Level {levelInPhase} of {currentPhaseConfig.levels.length}
                  </p>
                  <button onClick={startGame}
                    className="bg-[#4ADE80] hover:bg-[#22C55E] text-black px-12 py-6 rounded-full border-4 border-black text-3xl font-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 transition-all flex items-center gap-4 mx-auto">
                    NEXT LEVEL <Sparkles size={32} />
                  </button>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
