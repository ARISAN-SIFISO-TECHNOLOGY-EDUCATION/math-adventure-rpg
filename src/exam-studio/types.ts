// Shared types for the Academy (ages 13–17) maths engine.
// Extracted from mathEngine.ts so the type contract + helper foundation live in
// a small, navigable module separate from the ~8k lines of generators.

// IGCSE/CAPS-style problem with marks, working steps, and exam guidance.
export type Problem = {
  id: string;
  question: string;
  correctAnswer: string;
  options: [string, string, string, string];
  marks: number;
  workingSteps: string[];
  hints: string[];
  calculatorAllowed: boolean;
  commonMistake: string;
  examTip: string;
};

// A single hand-verified conceptual case; fromCases() picks one at random.
export interface CaseDef {
  q: string; c: string; w: string[]; s: string[]; h: string[];
  mistake: string; tip: string; m?: number; calc?: boolean;
}

export type LevelGenerator = () => Problem;
export type TopicLevels = Record<number, LevelGenerator>;
