import { describe, it, expect } from 'vitest';
import { generateProblem, type Problem } from './mathEngine';

// Kids' RPG phase → level count (see CLAUDE.md / Game.tsx PHASES).
const PHASE_LEVELS: Record<number, number> = { 1: 15, 2: 20, 3: 15, 4: 15 };
const ROLLS = 40;

function assertWellFormed(p: Problem, ctx: string) {
  expect(p.question, `${ctx}: empty question`).toBeTruthy();
  expect(p.options, `${ctx}: options not array`).toBeInstanceOf(Array);
  expect(p.options.length, `${ctx}: no options`).toBeGreaterThanOrEqual(2);

  // Options must be distinct (compared as strings, since they mix number|string).
  const asStr = p.options.map(String);
  expect(new Set(asStr).size, `${ctx}: duplicate options ${JSON.stringify(p.options)}`).toBe(asStr.length);

  // The correct answer must be selectable.
  expect(asStr, `${ctx}: correctAnswer not in options`).toContain(String(p.correctAnswer));
}

describe('kids RPG mathEngine — every live level emits well-formed problems', () => {
  for (const [phaseStr, count] of Object.entries(PHASE_LEVELS)) {
    const phase = Number(phaseStr);
    for (let level = 1; level <= count; level++) {
      it(`phase ${phase} level ${level}`, () => {
        for (let i = 0; i < ROLLS; i++) {
          assertWellFormed(generateProblem(phase, level), `P${phase}L${level} roll ${i}`);
        }
      });
    }
  }
});
