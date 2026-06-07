// Shared helper foundation for the Academy maths engine. Every generator in
// mathEngine.ts builds on these — option assembly (with guaranteed-distinct
// padding), fraction simplification, combinatorics, and the CASES dispatcher.
import type { CaseDef, Problem } from './types.ts';

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Nudge the last integer found in a string by `delta` — used to synthesise a
// fresh, plausible distractor ("(7, 3)" → "(7, 4)", "log2(4)" → "log2(5)",
// "x = 3 or x = 5" → "x = 3 or x = 6").
export function bumpLastNumber(s: string, delta: number): string | null {
  const matches = [...s.matchAll(/-?\d+/g)];
  if (matches.length === 0) return null;
  const m = matches[matches.length - 1];
  const idx = m.index ?? 0;
  return s.slice(0, idx) + String(parseInt(m[0], 10) + delta) + s.slice(idx + m[0].length);
}

export function makeOptions(correct: string, wrong: string[]): [string, string, string, string] {
  // Guarantee four DISTINCT choices. Distractor formulae can coincide with the
  // correct answer or with each other at edge values (e.g. p×q === p+q, a
  // repeated root, x === y). We de-duplicate, then — if fewer than three
  // distinct distractors survive — pad with numeric-neighbour distractors so
  // the MCQ never renders duplicate or missing options.
  const seen = new Set<string>([correct]);
  const distinct: string[] = [];
  for (const w of wrong) {
    if (!seen.has(w)) { seen.add(w); distinct.push(w); }
  }
  if (distinct.length < 3) {
    const deltas = [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8];
    for (const d of deltas) {
      if (distinct.length >= 3) break;
      for (const base of [...distinct, correct]) {
        const cand = bumpLastNumber(base, d);
        if (cand && !seen.has(cand)) { seen.add(cand); distinct.push(cand); break; }
      }
    }
  }
  return shuffle([correct, ...distinct.slice(0, 3)]) as [string, string, string, string];
}

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

export function simplify(num: number, den: number): string {
  if (den === 0) return '0';
  const g = gcd(Math.abs(num), Math.abs(den));
  const n = num / g, d = den / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

// Build 4 distinct `base^exp` options. Candidate wrong exponents are de-duped
// against the correct one and each other; if any collide (e.g. p×q === p+q),
// they're padded with correct±k so the MCQ always has four unique choices.
export function expOptions(base: string, correct: number, candidates: number[]): [string, string, string, string] {
  const used = new Set<number>([correct]);
  const wrong: number[] = [];
  const tryAdd = (e: number) => {
    if (e >= 0 && !used.has(e) && wrong.length < 3) { used.add(e); wrong.push(e); }
  };
  candidates.forEach(tryAdd);
  for (let k = 1; wrong.length < 3; k++) { tryAdd(correct + k); tryAdd(correct - k); }
  return makeOptions(`${base}^${correct}`, wrong.map(e => `${base}^${e}`));
}

// Pick one hand-verified conceptual case at random and build a Problem from it.
export function fromCases(cases: CaseDef[]): Problem {
  const c = cases[randInt(0, cases.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.c,
    options: makeOptions(c.c, c.w), marks: c.m ?? 3,
    workingSteps: c.s, hints: c.h, calculatorAllowed: c.calc ?? false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

export function factorial(n: number): number { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
export function comb(n: number, r: number): number { return factorial(n) / (factorial(r) * factorial(n - r)); }
export function perm(n: number, r: number): number { return factorial(n) / factorial(n - r); }
