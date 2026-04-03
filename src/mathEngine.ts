/**
 * Procedural math problem generator.
 * ADR-001: No runtime LLM calls. All problems generated on-device, instantly.
 *
 * generateProblem(phase, level) → Problem
 *   phase : 1–4  (Pre-School → Advanced Primary)
 *   level : 1–5  (within each phase)
 */

export type Problem = {
  question: string;
  options: (number | string)[];
  correctAnswer: number | string;
  meta?: { isSubitizing?: boolean; bondTotal?: number; bondKnown?: number };
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate `count` unique numeric options including `correct`.
 * Distractors stay ≥ minVal and are within `spread` of the correct answer.
 */
function numericOptions(
  correct: number,
  count = 4,
  minVal = 0,
  spread = 5,
): number[] {
  const opts = new Set<number>([correct]);
  let attempts = 0;
  while (opts.size < count && attempts < 300) {
    const delta = rand(1, spread) * (Math.random() < 0.5 ? 1 : -1);
    const candidate = correct + delta;
    if (candidate >= minVal) opts.add(candidate);
    attempts++;
  }
  // Guarantee fill if spread was too tight
  let fill = 1;
  while (opts.size < count) {
    const candidate = correct + fill;
    if (candidate >= minVal) opts.add(candidate);
    fill++;
  }
  return shuffle([...opts]);
}

/** Nearest clean multiples of `step` around `correct` (for rounding questions). */
function multipleOptions(correct: number, step: number, count = 4): number[] {
  const opts = new Set<number>([correct]);
  const directions = [-3, -2, -1, 1, 2, 3];
  for (const d of directions) {
    if (opts.size >= count) break;
    const candidate = correct + d * step;
    if (candidate >= 0) opts.add(candidate);
  }
  return shuffle([...opts].slice(0, count));
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function fractionStr(num: number, den: number): string {
  if (num === 0) return '0';
  const g = gcd(Math.abs(num), den);
  const sNum = num / g;
  const sDen = den / g;
  return sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`;
}

// ─── Phase generators ─────────────────────────────────────────────────────────

// PHASE 1 — Pre-School (Ages 3–5)

function p1l1(): Problem {
  // Counting objects from 1 to 5
  const emojis = ['⭐', '🍎', '🐶', '🌸', '🐸'];
  const emoji = emojis[rand(0, emojis.length - 1)];
  const n = rand(1, 5);
  const visual = Array(n).fill(emoji).join(' ');
  return {
    question: `How many ${emoji}?\n${visual}`,
    options: numericOptions(n, 4, 1, 2),
    correctAnswer: n,
  };
}

function p1l2(): Problem {
  // Counting objects from 1 to 10
  const emojis = ['🌟', '🍊', '🐱', '🌺', '🎉', '🦋', '🍭', '🐠'];
  const emoji = emojis[rand(0, emojis.length - 1)];
  const n = rand(1, 10);
  const visual = Array(n).fill(emoji).join(' ');
  return {
    question: `Count the ${emoji}:\n${visual}`,
    options: numericOptions(n, 4, 1, 3),
    correctAnswer: n,
  };
}

function p1l3(): Problem {
  // Comparing two numbers — which is more?
  const a = rand(1, 9);
  let b = rand(1, 9);
  while (b === a) b = rand(1, 9);
  const bigger = Math.max(a, b);
  return {
    question: `Which number is BIGGER?\n${a}  or  ${b}`,
    options: shuffle([a, b]),
    correctAnswer: bigger,
  };
}

function p1l4(): Problem {
  // Simple addition, answer ≤ 5
  const sum = rand(2, 5);
  const a = rand(1, sum - 1);
  const b = sum - a;
  return {
    question: `${a} + ${b} = ?`,
    options: numericOptions(sum, 4, 1, 2),
    correctAnswer: sum,
  };
}

function p1l5(): Problem {
  // Simple subtraction, both numbers ≤ 5
  const a = rand(2, 5);
  const b = rand(1, a - 1);
  const ans = a - b;
  return {
    question: `${a} − ${b} = ?`,
    options: numericOptions(ans, 4, 0, 2),
    correctAnswer: ans,
  };
}

function p1l6(): Problem {
  // Subitizing — quick visual count 1–5 (UI handles the flash/hide timing)
  const emojis = ['⭐', '🍎', '🐶', '🌸', '🐸', '🎉', '🍭'];
  const emoji = emojis[rand(0, emojis.length - 1)];
  const n = rand(1, 5);
  const visual = Array(n).fill(emoji).join('  ');
  return {
    question: `${visual}`,
    options: numericOptions(n, 4, 1, 2),
    correctAnswer: n,
    meta: { isSubitizing: true },
  };
}

function p1l7(): Problem {
  // Number bonds — missing addend: ? + b = total
  const total = rand(3, 5);
  const b = rand(1, total - 1);
  const missing = total - b;
  return {
    question: `? + ${b} = ${total}`,
    options: numericOptions(missing, 4, 0, 2),
    correctAnswer: missing,
    meta: { bondTotal: total, bondKnown: b },
  };
}

function p1l8(): Problem {
  // Counting objects from 11 to 20
  const emojis = ['🌟', '🍊', '🦋', '🎈', '🐠', '🍭', '🌺'];
  const emoji = emojis[rand(0, emojis.length - 1)];
  const n = rand(11, 20);
  const visual = Array(n).fill(emoji).join(' ');
  return {
    question: `Count the ${emoji}:\n${visual}`,
    options: numericOptions(n, 4, 10, 3),
    correctAnswer: n,
  };
}

function p1l9(): Problem {
  // Shapes — identify the shape from its emoji
  const shapes = [
    { emoji: '🔴', name: 'Circle' },
    { emoji: '🟦', name: 'Square' },
    { emoji: '🔺', name: 'Triangle' },
    { emoji: '⭐', name: 'Star' },
  ] as const;
  const shape = shapes[rand(0, shapes.length - 1)];
  const wrong = shapes.filter(s => s.name !== shape.name).map(s => s.name);
  return {
    question: `What shape is this?\n${shape.emoji}`,
    options: shuffle([shape.name, ...wrong]),
    correctAnswer: shape.name,
  };
}

function p1l10(): Problem {
  // Patterns — what comes next?
  const patterns = [
    { seq: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', wrong: ['🟡', '🟢', '🟣'] },
    { seq: ['⭐', '🌙', '⭐', '🌙'], answer: '⭐', wrong: ['☀️', '🌸', '💧'] },
    { seq: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', wrong: ['🐸', '🐼', '🐰'] },
    { seq: ['🟩', '🟨', '🟩', '🟨'], answer: '🟩', wrong: ['🟥', '🟦', '🟫'] },
    { seq: ['🌸', '🌺', '🌸', '🌺'], answer: '🌸', wrong: ['🌻', '🌼', '🌷'] },
  ];
  const p = patterns[rand(0, patterns.length - 1)];
  return {
    question: `What comes next?\n${p.seq.join('  ')}  ❓`,
    options: shuffle([p.answer, ...p.wrong.slice(0, 3)]),
    correctAnswer: p.answer,
  };
}

// PHASE 2 — Lower Primary (Ages 6–8)

function p2l1(): Problem {
  // Addition with answers up to 20
  const ans = rand(6, 20);
  const a = rand(1, ans - 1);
  const b = ans - a;
  return {
    question: `${a} + ${b} = ?`,
    options: numericOptions(ans, 4, 1, 4),
    correctAnswer: ans,
  };
}

function p2l2(): Problem {
  // Subtraction within 20
  const a = rand(5, 20);
  const b = rand(1, a - 1);
  const ans = a - b;
  return {
    question: `${a} − ${b} = ?`,
    options: numericOptions(ans, 4, 0, 4),
    correctAnswer: ans,
  };
}

function p2l3(): Problem {
  // Addition and subtraction up to 100
  const useAdd = Math.random() < 0.5;
  if (useAdd) {
    const a = rand(10, 89);
    const b = rand(10, 100 - a);
    const ans = a + b;
    return {
      question: `${a} + ${b} = ?`,
      options: numericOptions(ans, 4, 0, 10),
      correctAnswer: ans,
    };
  } else {
    const a = rand(20, 100);
    const b = rand(10, a - 1);
    const ans = a - b;
    return {
      question: `${a} − ${b} = ?`,
      options: numericOptions(ans, 4, 0, 10),
      correctAnswer: ans,
    };
  }
}

function p2l4(): Problem {
  // Times tables for 2, 5, and 10
  const tables = [2, 5, 10];
  const t = tables[rand(0, tables.length - 1)];
  const n = rand(1, 12);
  const ans = t * n;
  return {
    question: `${t} × ${n} = ?`,
    options: numericOptions(ans, 4, 0, t * 2),
    correctAnswer: ans,
  };
}

function p2l5(): Problem {
  // Missing number: ? + b = total  OR  a − ? = result
  if (Math.random() < 0.5) {
    const total = rand(5, 20);
    const known = rand(1, total - 1);
    const missing = total - known;
    return {
      question: `? + ${known} = ${total}`,
      options: numericOptions(missing, 4, 1, 4),
      correctAnswer: missing,
    };
  } else {
    const a = rand(6, 20);
    const missing = rand(1, a - 1);
    const result = a - missing;
    return {
      question: `${a} − ? = ${result}`,
      options: numericOptions(missing, 4, 1, 4),
      correctAnswer: missing,
    };
  }
}

// PHASE 3 — Higher Primary (Ages 9–10)

function p3l1(): Problem {
  // All times tables 1–12
  const a = rand(2, 12);
  const b = rand(2, 12);
  const ans = a * b;
  return {
    question: `${a} × ${b} = ?`,
    options: numericOptions(ans, 4, 0, Math.max(12, Math.round(ans * 0.2))),
    correctAnswer: ans,
  };
}

function p3l2(): Problem {
  // Division with no remainder
  const divisor = rand(2, 12);
  const quotient = rand(2, 12);
  const dividend = divisor * quotient;
  return {
    question: `${dividend} ÷ ${divisor} = ?`,
    options: numericOptions(quotient, 4, 1, 5),
    correctAnswer: quotient,
  };
}

function p3l3(): Problem {
  // Simple fractions of a number (½, ¼, ¾, ⅓)
  type Fraction = [number, number, string];
  const fracs: Fraction[] = [
    [1, 2, '1/2'], [1, 4, '1/4'], [3, 4, '3/4'], [1, 3, '1/3'],
  ];
  const [num, den, sym] = fracs[rand(0, fracs.length - 1)];
  const base = rand(2, 12) * den; // guarantees clean integer answer
  const ans = Math.round((base * num) / den);
  return {
    question: `${sym} of ${base} = ?`,
    options: numericOptions(ans, 4, 0, 6),
    correctAnswer: ans,
  };
}

function p3l4(): Problem {
  // Word problems — addition and subtraction
  const variant = rand(0, 2);
  if (variant === 0) {
    const start = rand(20, 80);
    const more = rand(5, 30);
    return {
      question: `Sam has ${start} stickers and gets ${more} more.\nHow many does he have now?`,
      options: numericOptions(start + more, 4, 0, 10),
      correctAnswer: start + more,
    };
  } else if (variant === 1) {
    const total = rand(30, 90);
    const flyAway = rand(5, total - 5);
    return {
      question: `${total} birds sit on a tree. ${flyAway} fly away.\nHow many remain?`,
      options: numericOptions(total - flyAway, 4, 0, 10),
      correctAnswer: total - flyAway,
    };
  } else {
    const red = rand(10, 50);
    const blue = rand(10, 50);
    return {
      question: `A box has ${red} red balls and ${blue} blue balls.\nHow many balls in total?`,
      options: numericOptions(red + blue, 4, 0, 10),
      correctAnswer: red + blue,
    };
  }
}

function p3l5(): Problem {
  // Rounding to nearest 10 or 100
  const roundTo = Math.random() < 0.5 ? 10 : 100;
  const n = roundTo === 10 ? rand(11, 99) : rand(101, 999);
  const ans = Math.round(n / roundTo) * roundTo;
  return {
    question: `Round ${n} to the nearest ${roundTo}`,
    options: multipleOptions(ans, roundTo),
    correctAnswer: ans,
  };
}

// PHASE 4 — Advanced Primary (Ages 11–12)

function p4l1(): Problem {
  // Adding and subtracting simple fractions (same denominator)
  const den = [2, 3, 4, 5, 6][rand(0, 4)];
  const a = rand(1, den - 1);
  const b = rand(1, den - 1);
  const useAdd = Math.random() < 0.5;
  const bigger = Math.max(a, b);
  const smaller = Math.min(a, b);
  const resultNum = useAdd ? a + b : bigger - smaller;
  const opA = useAdd ? a : bigger;
  const opB = useAdd ? b : smaller;
  const opSym = useAdd ? '+' : '−';
  const ansStr = fractionStr(resultNum, den);

  // Build three plausible distractors as fraction strings
  const distSet = new Set<string>([ansStr]);
  const candidates = [
    fractionStr(resultNum + 1, den),
    fractionStr(Math.max(0, resultNum - 1), den),
    fractionStr(resultNum, den + 1),
    fractionStr(opA + opB, den),        // common mistake: add numerators AND denominators
    fractionStr(resultNum + 2, den),
  ];
  for (const c of candidates) {
    if (distSet.size >= 4) break;
    if (c !== ansStr) distSet.add(c);
  }
  return {
    question: `${opA}/${den} ${opSym} ${opB}/${den} = ?`,
    options: shuffle([...distSet]),
    correctAnswer: ansStr,
  };
}

function p4l2(): Problem {
  // Adding and subtracting decimals (1 decimal place)
  const useAdd = Math.random() < 0.5;
  // Work in integers to avoid floating-point drift
  const aInt = rand(10, 95);
  const bInt = rand(10, 95);
  const a = aInt / 10;
  const b = bInt / 10;

  if (useAdd) {
    const ansInt = aInt + bInt;
    const ans = ansInt / 10;
    return {
      question: `${a} + ${b} = ?`,
      options: numericOptions(ansInt, 4, 0, 5).map(v => v / 10),
      correctAnswer: ans,
    };
  } else {
    const bigger = Math.max(aInt, bInt);
    const smaller = Math.min(aInt, bInt);
    const ansInt = bigger - smaller;
    const ans = ansInt / 10;
    return {
      question: `${bigger / 10} − ${smaller / 10} = ?`,
      options: numericOptions(ansInt, 4, 0, 5).map(v => v / 10),
      correctAnswer: ans,
    };
  }
}

function p4l3(): Problem {
  // Finding a percentage of a number
  const percents = [10, 20, 25, 50, 75];
  const p = percents[rand(0, percents.length - 1)];
  // Choose base so result is always a whole number
  const multiplier = rand(2, 20);
  const base = multiplier * (100 / p);
  const ans = (base * p) / 100;
  return {
    question: `${p}% of ${base} = ?`,
    options: numericOptions(ans, 4, 0, 10),
    correctAnswer: ans,
  };
}

function p4l4(): Problem {
  // Order of operations (BODMAS / PEMDAS)
  const variant = rand(0, 3);
  if (variant === 0) {
    const a = rand(2, 6), b = rand(2, 6), c = rand(1, 10);
    return {
      question: `${a} × ${b} + ${c} = ?`,
      options: numericOptions(a * b + c, 4, 0, 8),
      correctAnswer: a * b + c,
    };
  } else if (variant === 1) {
    const a = rand(2, 6), b = rand(2, 6), c = rand(1, 10);
    return {
      question: `${c} + ${a} × ${b} = ?`,
      options: numericOptions(c + a * b, 4, 0, 8),
      correctAnswer: c + a * b,
    };
  } else if (variant === 2) {
    const a = rand(2, 6), b = rand(1, 6), c = rand(2, 5);
    return {
      question: `(${a} + ${b}) × ${c} = ?`,
      options: numericOptions((a + b) * c, 4, 0, 10),
      correctAnswer: (a + b) * c,
    };
  } else {
    // Division then addition — ensure clean divide
    const divisor = rand(2, 5);
    const quotient = rand(2, 8);
    const dividend = divisor * quotient;
    const c = rand(1, 10);
    return {
      question: `${dividend} ÷ ${divisor} + ${c} = ?`,
      options: numericOptions(quotient + c, 4, 0, 8),
      correctAnswer: quotient + c,
    };
  }
}

function p4l5(): Problem {
  // Multi-step word problems
  const variant = rand(0, 2);
  if (variant === 0) {
    // Change from a purchase
    const priceEach = rand(2, 9) * 5;
    const qty = rand(2, 4);
    const total = priceEach * qty;
    const paid = total + rand(1, 4) * 10;
    const change = paid - total;
    return {
      question: `Each book costs $${priceEach}. Buy ${qty} books, pay $${paid}.\nWhat is the change?`,
      options: numericOptions(change, 4, 0, 10),
      correctAnswer: change,
    };
  } else if (variant === 1) {
    // Share remainder equally
    const shared = rand(2, 4);
    const each = rand(3, 10);
    const eaten = rand(5, 20);
    const total = shared * each + eaten;
    return {
      question: `${total} apples — ${eaten} are eaten, the rest shared equally among ${shared}.\nHow many each?`,
      options: numericOptions(each, 4, 1, 5),
      correctAnswer: each,
    };
  } else {
    // Distance = speed × time (two legs)
    const speed = rand(2, 8) * 5;
    const t1 = rand(1, 4);
    const t2 = rand(1, 4);
    const dist = speed * (t1 + t2);
    return {
      question: `A car travels at ${speed} km/h for ${t1} hour${t1 > 1 ? 's' : ''}, then ${t2} more hour${t2 > 1 ? 's' : ''}.\nTotal distance?`,
      options: numericOptions(dist, 4, 0, speed),
      correctAnswer: dist,
    };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

const GENERATORS: Record<string, () => Problem> = {
  '1-1': p1l1, '1-2': p1l2, '1-3': p1l3, '1-4': p1l4, '1-5': p1l5,
  '1-6': p1l6, '1-7': p1l7, '1-8': p1l8, '1-9': p1l9, '1-10': p1l10,
  '2-1': p2l1, '2-2': p2l2, '2-3': p2l3, '2-4': p2l4, '2-5': p2l5,
  '3-1': p3l1, '3-2': p3l2, '3-3': p3l3, '3-4': p3l4, '3-5': p3l5,
  '4-1': p4l1, '4-2': p4l2, '4-3': p4l3, '4-4': p4l4, '4-5': p4l5,
};

export function generateProblem(phase: number, level: number): Problem {
  const key = `${phase}-${level}`;
  const generator = GENERATORS[key];
  if (!generator) {
    // Safe fallback
    const a = rand(1, 20);
    const b = rand(1, 20);
    return {
      question: `${a} + ${b} = ?`,
      options: numericOptions(a + b, 4, 0, 5),
      correctAnswer: a + b,
    };
  }
  return generator();
}
