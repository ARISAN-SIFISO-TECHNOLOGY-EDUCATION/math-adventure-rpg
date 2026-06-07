// @sprouts/exam-studio — reusable exam-prep framework (in-repo package).
//
// This is the content-FREE core that any "Sprouts" exam app can build on:
//   • types     — the Problem contract + level-generator/topic-map shapes
//   • helpers   — option builders (makeOptions), conceptual generators (fromCases),
//                 and maths primitives (randInt, shuffle, gcd, comb, perm, …)
//   • progress  — the mastery engine: ≥80% pass gating, sequential level/topic
//                 unlock, mistake log, day-streak + daily goal, mock scores
//
// Boundary rules (keep this package extractable):
//   1. NOTHING here may import app-specific CONTENT (maths generators,
//      curriculum, formulas) or app UI. Dependencies point inward only:
//          exam-studio  ←  senior (content + page shells)  ←  App
//   2. The ONE host seam is `../lib/safeStorage` (a generic localStorage util).
//      On a real workspace extraction it becomes a bundled util — see
//      docs/adr/001-exam-studio-package.md.
//
// Consumers should import from THIS barrel (the public API), e.g.
//   import { recordAttempt, makeOptions, type Problem } from '../../exam-studio';
//
// NOTE for the Node smoke test: src/senior/mathEngine.ts imports `./types` and
// `./helpers` DIRECTLY (with .ts extensions), not via this barrel, so the
// strip-types smoke run never loads the progress/localStorage code path.
export * from './types';
export * from './helpers';
export * from './progress';
