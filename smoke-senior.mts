// Smoke test: validate senior generators produce clean MCQ problems.
// Run: node --experimental-strip-types smoke-senior.mts
import { generateProblems, generateMockExamProblems, generateMastersProblems, TOPIC_LEVELS } from './src/senior/mathEngine.ts';

const RUNS = 2000;
let failures = 0;
const report = (msg: string) => { console.error('  ✗ ' + msg); failures++; };

for (const topicId of Object.keys(TOPIC_LEVELS)) {
  const levels = Object.keys((TOPIC_LEVELS as any)[topicId]).map(Number);
  for (const level of levels) {
    for (let i = 0; i < RUNS; i++) {
      const [p] = generateProblems(topicId, 1, 1, level);
      if (!p) { report(`${topicId} L${level}: no problem`); break; }
      if (!p.question) report(`${topicId} L${level}: empty question`);
      if (!Array.isArray(p.options) || p.options.length !== 4)
        report(`${topicId} L${level}: options.length=${p.options?.length}`);
      if (new Set(p.options).size !== 4)
        report(`${topicId} L${level}: duplicate options [${p.options}]`);
      if (!p.options.includes(p.correctAnswer))
        report(`${topicId} L${level}: correct "${p.correctAnswer}" not in [${p.options}]`);
    }
  }
}

// Mock exams per age
for (const age of [13, 14, 15, 16, 17]) {
  const probs = generateMockExamProblems(age, 40);
  if (probs.length !== 40) report(`mock age${age}: got ${probs.length} problems`);
  for (const p of probs) {
    if (new Set(p.options).size !== 4 || !p.options.includes(p.correctAnswer))
      report(`mock age${age}: bad problem "${p.question}"`);
  }
}

// The Masters Quiz (critical thinking)
for (let i = 0; i < 500; i++) {
  for (const p of generateMastersProblems(15)) {
    if (new Set(p.options).size !== 4 || !p.options.includes(p.correctAnswer))
      report(`masters: bad problem "${p.question}"`);
  }
}

console.log(failures === 0
  ? `✓ All senior generators clean (${RUNS} runs each, ages 13–17 mock + Masters OK)`
  : `✗ ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
