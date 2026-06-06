import { describe, it, expect } from 'vitest';
import {
  TOPIC_LEVELS,
  generateProblems,
  generateMockExamProblems,
  generateMastersProblems,
  generateTopicTestProblems,
  type Problem,
} from './mathEngine';

// How many times to re-roll each randomised generator. Generators use rand(),
// so a single call can't prove the invariants hold across the value space —
// re-rolling surfaces edge cases (collisions, off-by-one option padding).
const ROLLS = 40;

/**
 * Every Problem a generator emits must satisfy these invariants, or the UI can
 * render a broken/teaching-wrong question. This is the structural half of the
 * content QA the plan calls for (C3): it can't prove the maths is *right*, but
 * it guarantees a well-formed, answerable, non-ambiguous question every time.
 */
function assertWellFormed(p: Problem, ctx: string) {
  // Question text present.
  expect(p.question, `${ctx}: empty question`).toBeTruthy();
  expect(typeof p.question, `${ctx}: question not a string`).toBe('string');

  // Exactly 4 options, all distinct.
  expect(p.options, `${ctx}: options not array`).toBeInstanceOf(Array);
  expect(p.options.length, `${ctx}: expected 4 options`).toBe(4);
  expect(new Set(p.options).size, `${ctx}: duplicate options ${JSON.stringify(p.options)}`).toBe(4);

  // The correct answer is actually selectable.
  expect(p.options, `${ctx}: correctAnswer not in options`).toContain(p.correctAnswer);
  expect(p.correctAnswer, `${ctx}: empty correctAnswer`).toBeTruthy();

  // Marks are sane.
  expect(p.marks, `${ctx}: marks must be >= 1`).toBeGreaterThanOrEqual(1);

  // Hints/working are arrays (may be empty) — UI maps over them.
  expect(Array.isArray(p.hints), `${ctx}: hints not array`).toBe(true);
  expect(Array.isArray(p.workingSteps), `${ctx}: workingSteps not array`).toBe(true);

  // Unique id present.
  expect(p.id, `${ctx}: missing id`).toBeTruthy();
}

describe('senior mathEngine — every generator emits well-formed problems', () => {
  for (const [topicId, levels] of Object.entries(TOPIC_LEVELS)) {
    for (const levelNum of Object.keys(levels)) {
      const level = Number(levelNum);
      it(`${topicId} L${level}`, () => {
        const gen = levels[level];
        for (let i = 0; i < ROLLS; i++) {
          assertWellFormed(gen(), `${topicId} L${level} roll ${i}`);
        }
      });
    }
  }
});

describe('senior mathEngine — aggregate generators', () => {
  it('generateProblems returns the requested count, all well-formed', () => {
    const topicId = Object.keys(TOPIC_LEVELS)[0];
    for (let i = 0; i < 10; i++) {
      const probs = generateProblems(topicId, 1, 5, 1);
      expect(probs.length).toBe(5);
      probs.forEach((p, j) => assertWellFormed(p, `generateProblems #${j}`));
    }
  });

  it('generateTopicTestProblems returns well-formed problems', () => {
    const topicId = Object.keys(TOPIC_LEVELS)[0];
    const probs = generateTopicTestProblems(topicId, 10);
    expect(probs.length).toBeGreaterThan(0);
    probs.forEach((p, j) => assertWellFormed(p, `topicTest #${j}`));
  });

  it('generateMastersProblems returns 15 well-formed problems', () => {
    for (let i = 0; i < 5; i++) {
      const probs = generateMastersProblems(15);
      expect(probs.length).toBe(15);
      probs.forEach((p, j) => assertWellFormed(p, `masters #${j}`));
    }
  });

  it('generateMockExamProblems builds a full paper for each age', () => {
    for (const age of [13, 14, 15, 16, 17]) {
      const probs = generateMockExamProblems(age, 40);
      expect(probs.length, `age ${age} mock empty`).toBeGreaterThan(0);
      probs.forEach((p, j) => assertWellFormed(p, `mock age${age} #${j}`));
    }
  });
});

describe('senior mathEngine — answer oracle (no duplicate ids within a set)', () => {
  it('a generated set has unique problem ids', () => {
    const topicId = Object.keys(TOPIC_LEVELS)[0];
    const probs = generateProblems(topicId, 1, 5, 1);
    expect(new Set(probs.map(p => p.id)).size).toBe(probs.length);
  });
});
