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
  explanation?: string;
  meta?: { isSubitizing?: boolean; bondTotal?: number; bondKnown?: number };
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Like rand() but skips one excluded value — useful to avoid accidentally
// picking the correct answer as a distractor.
function randInt(min: number, max: number, exclude: number | null = null): number {
  let n: number;
  do { n = Math.floor(Math.random() * (max - min + 1)) + min; }
  while (exclude !== null && n === exclude && max - min > 0);
  return n;
}

// Generates `count` unique shuffled options including `correct`.
// Uses a relative delta so distractors stay plausible regardless of answer magnitude.
// Guarantees fill via sequential fallback — no duplicates possible.
function generateDistractors(correct: number, delta = 5, count = 4): string[] {
  const isFloat = !Number.isInteger(correct) || !Number.isInteger(delta);
  const step = !Number.isInteger(delta) ? delta : (isFloat ? 0.5 : 1);
  const range = Math.max(4, Math.ceil(delta / step));
  const dist = new Set<string>();
  dist.add(isFloat ? correct.toFixed(2) : String(correct));
  let attempts = 0;
  while (dist.size < count && attempts < 100) {
    attempts++;
    const offset = randInt(-range, range, 0);
    const wrong = correct + offset * step;
    dist.add(isFloat ? wrong.toFixed(2) : String(wrong));
  }
  let fallback = 1;
  while (dist.size < count) {
    dist.add(isFloat ? (correct + fallback * step).toFixed(2) : String(correct + fallback * step));
    fallback++;
  }
  return shuffle(Array.from(dist));
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
    explanation: `Count each ${emoji} one by one: 1, 2${n > 2 ? `, … ${n}` : ''}. There are ${n}.`,
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
    explanation: `Point to each ${emoji} and count: 1, 2, 3${n > 3 ? `, … ${n}` : ''}. Total = ${n}.`,
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
    explanation: `${Math.max(a,b)} is further along the number line than ${Math.min(a,b)}, so ${bigger} is bigger.`,
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
    explanation: `Hold up ${a} fingers, then add ${b} more: ${Array.from({length:sum},(_,i)=>i+1).join(', ')}. Answer = ${sum}.`,
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
    explanation: `Start at ${a}, count back ${b}: ${Array.from({length:b},(_,i)=>a-i-1).join(', ')}. Answer = ${ans}.`,
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
    explanation: `Quick-look counting! The group had ${n} ${emoji}. Train your brain to see the amount without counting one-by-one.`,
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
    explanation: `? + ${b} = ${total}. To find ?, subtract: ${total} − ${b} = ${missing}.`,
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
    explanation: `Count in groups of 10 first (${Math.floor(n/10)*10}), then add the leftovers (${n%10===0?'none':n%10}). Total = ${n}.`,
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
    explanation: `That is a ${shape.name}! Look at its sides and curves to recognise it next time.`,
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
    explanation: `The pattern repeats every 2: ${p.seq[0]}, ${p.seq[1]}, ${p.seq[0]}, ${p.seq[1]}, … so next is ${p.answer}.`,
  };
}

function p1l11(): Problem {
  // Category sort — three items in one group, one odd one out
  const groups = [
    { items: ['🐶', '🐱', '🐸', '🍎'], odd: '🍎', tip: '🍎 is a fruit, not an animal' },
    { items: ['🍎', '🍊', '🍌', '🚗'], odd: '🚗', tip: '🚗 is a vehicle, not a fruit' },
    { items: ['🚗', '🚌', '✈️', '🌸'], odd: '🌸', tip: '🌸 is a flower, not a vehicle' },
    { items: ['🌸', '🌺', '🌻', '🐶'], odd: '🐶', tip: '🐶 is an animal, not a flower' },
    { items: ['⚽', '🏀', '🎾', '🍕'], odd: '🍕', tip: '🍕 is food, not a ball' },
    { items: ['🍕', '🍔', '🍦', '🐱'], odd: '🐱', tip: '🐱 is an animal, not food' },
    { items: ['🐘', '🦁', '🐯', '🚂'], odd: '🚂', tip: '🚂 is a vehicle, not an animal' },
    { items: ['🚂', '🚀', '🚁', '🍌'], odd: '🍌', tip: '🍌 is a fruit, not a vehicle' },
  ];
  const g = groups[rand(0, groups.length - 1)];
  const shuffled = shuffle([...g.items]);
  return {
    question: `Which one does NOT belong?\n${shuffled.join('  ')}`,
    options: shuffled,
    correctAnswer: g.odd,
    explanation: `${g.tip}! Look for the one that is different from the others.`,
  };
}

function p1l12(): Problem {
  // Visual size comparison — bigger, longer, taller (no heavier/lighter — kids can't lift on screen)
  const pairs = [
    { a: '🐘', b: '🐭', q: 'Which is BIGGER?', answer: '🐘', exp: 'An elephant is much bigger than a mouse!' },
    { a: '🦁', b: '🐜', q: 'Which is BIGGER?', answer: '🦁', exp: 'A lion is much bigger than an ant!' },
    { a: '🚂', b: '🚗', q: 'Which is BIGGER?', answer: '🚂', exp: 'A train is bigger than a car!' },
    { a: '🌳', b: '🌱', q: 'Which is TALLER?', answer: '🌳', exp: 'A tree is much taller than a seedling!' },
    { a: '📏', b: '✏️', q: 'Which is LONGER?', answer: '📏', exp: 'A ruler is longer than a pencil!' },
    { a: '🐋', b: '🐟', q: 'Which is BIGGER?', answer: '🐋', exp: 'A whale is much bigger than a fish!' },
    { a: '🏔️', b: '⛺', q: 'Which is TALLER?', answer: '🏔️', exp: 'A mountain is much taller than a tent!' },
    { a: '🚌', b: '🛵', q: 'Which is BIGGER?', answer: '🚌', exp: 'A bus is much bigger than a scooter!' },
  ];
  const p = pairs[rand(0, pairs.length - 1)];
  return {
    question: `${p.q}\n${p.a}  or  ${p.b}`,
    options: shuffle([p.a, p.b]),
    correctAnswer: p.answer,
    explanation: p.exp,
  };
}

function p1l13(): Problem {
  // 3D shape identification — sphere, cube, cylinder, cone
  const shapes = [
    { emoji: '⚽', name: 'Sphere',   hint: 'A sphere is round like a ball — no flat sides!' },
    { emoji: '🎲', name: 'Cube',     hint: 'A cube has 6 flat square sides — like a dice!' },
    { emoji: '🥫', name: 'Cylinder', hint: 'A cylinder has 2 flat circles and a curved side — like a tin!' },
    { emoji: '🍦', name: 'Cone',     hint: 'A cone has a flat circle base and a pointy top — like an ice cream!' },
  ] as const;
  const shape = shapes[rand(0, shapes.length - 1)];
  const wrong = shapes.filter(s => s.name !== shape.name).map(s => s.name);
  return {
    question: `What 3D shape is this?\n${shape.emoji}`,
    options: shuffle([shape.name, ...wrong]),
    correctAnswer: shape.name,
    explanation: shape.hint,
  };
}

function p1l14(): Problem {
  // Counting backwards — find the missing number in a descending sequence of 5
  const start = rand(5, 10);
  const seq = [start, start - 1, start - 2, start - 3, start - 4];
  const missingIdx = rand(1, 3); // never first or last
  const missing = seq[missingIdx];
  const displayed = seq.map((n, i) => (i === missingIdx ? '?' : String(n)));
  return {
    question: `Count backwards — what is missing?\n${displayed.join(', ')}`,
    options: numericOptions(missing, 4, 0, 2),
    correctAnswer: missing,
    explanation: `Counting back: ${seq.join(', ')}. The missing number is ${missing}.`,
  };
}

function p1l15(): Problem {
  // Ordinal positions — 1st through 4th in a line of animals
  // Question names the animal in words so the narrator can read it aloud for non-readers
  const lines = [
    { animals: ['🐶', '🐱', '🐸', '🐰'], names: ['dog', 'cat', 'frog', 'rabbit'] },
    { animals: ['🐻', '🐨', '🦊', '🐼'], names: ['bear', 'koala', 'fox', 'panda'] },
    { animals: ['🦁', '🐯', '🐮', '🐷'], names: ['lion', 'tiger', 'cow', 'pig'] },
    { animals: ['🐵', '🐔', '🐧', '🦆'], names: ['monkey', 'chicken', 'penguin', 'duck'] },
  ];
  const ordinals = ['1st', '2nd', '3rd', '4th'];
  const line = lines[rand(0, lines.length - 1)];
  const pos = rand(0, 3);
  const correctOrdinal = ordinals[pos];
  const wrong = ordinals.filter(o => o !== correctOrdinal);
  return {
    question: `${line.animals.join('  ')}\nWhat position is the ${line.names[pos]}? ${line.animals[pos]}`,
    options: shuffle([correctOrdinal, ...wrong]),
    correctAnswer: correctOrdinal,
    explanation: `Count from the left: ${line.animals.map((a, i) => `${ordinals[i]} is ${a}`).join(', ')}. The ${line.names[pos]} is ${correctOrdinal}!`,
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
    explanation: `Start at ${a}, count on ${b} more → ${ans}. (${a} + ${b} = ${ans})`,
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
    explanation: `${a} minus ${b}: count back ${b} from ${a} → ${ans}.`,
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
      explanation: `Add the tens first: ${Math.floor(a/10)*10} + ${Math.floor(b/10)*10} = ${Math.floor(a/10)*10+Math.floor(b/10)*10}, then add the units: + ${a%10} + ${b%10} = ${ans}.`,
    };
  } else {
    const a = rand(20, 100);
    const b = rand(10, a - 1);
    const ans = a - b;
    return {
      question: `${a} − ${b} = ?`,
      options: numericOptions(ans, 4, 0, 10),
      correctAnswer: ans,
      explanation: `${a} − ${b}: subtract tens (${a} − ${Math.floor(b/10)*10} = ${a-Math.floor(b/10)*10}), then units (− ${b%10} = ${ans}).`,
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
    explanation: `Count by ${t}s, ${n} times: ${Array.from({length:n},(_,i)=>t*(i+1)).join(', ')}. Answer = ${ans}.`,
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
      explanation: `? + ${known} = ${total} → ? = ${total} − ${known} = ${missing}.`,
    };
  } else {
    const a = rand(6, 20);
    const missing = rand(1, a - 1);
    const result = a - missing;
    return {
      question: `${a} − ? = ${result}`,
      options: numericOptions(missing, 4, 1, 4),
      correctAnswer: missing,
      explanation: `${a} − ? = ${result} → ? = ${a} − ${result} = ${missing}.`,
    };
  }
}

// PHASE 2 — Lower Primary continued: World 2 & 3

function p2l6(): Problem {
  // Place value — identify tens or units digit
  const n = rand(11, 99);
  const askTens = Math.random() < 0.5;
  const ans = askTens ? Math.floor(n / 10) : n % 10;
  return {
    question: askTens
      ? `What is the TENS digit of ${n}?`
      : `What is the UNITS digit of ${n}?`,
    options: numericOptions(ans, 4, 0, 3),
    correctAnswer: ans,
    explanation: `${n} = ${Math.floor(n/10)} tens and ${n%10} units. The ${askTens?'tens':'units'} digit is ${ans}.`,
  };
}

function p2l7(): Problem {
  // Money — how much altogether or how much change
  const coins = [1, 2, 5, 10, 20, 50];
  const useChange = Math.random() < 0.5;
  if (useChange) {
    // Change from purchase
    const price = rand(1, 8) * 10 + rand(0, 1) * 5; // e.g. 35, 40, 65
    const paid = price + (rand(1, 4) * 10);           // pays more in round 10s
    const change = paid - price;
    return {
      question: `Something costs R${price}.\nYou pay R${paid}.\nWhat is your change?`,
      options: numericOptions(change, 4, 0, 10),
      correctAnswer: change,
      explanation: `Change = paid − cost = R${paid} − R${price} = R${change}.`,
    };
  } else {
    // Count two coin amounts together
    const a = coins[rand(0, coins.length - 1)];
    const b = coins[rand(0, coins.length - 1)];
    return {
      question: `You have a ${a}c coin and a ${b}c coin.\nHow many cents altogether?`,
      options: numericOptions(a + b, 4, 0, 15),
      correctAnswer: a + b,
      explanation: `${a}c + ${b}c = ${a+b}c altogether.`,
    };
  }
}

function p2l8(): Problem {
  // Time — reading hours or simple minutes
  const hour = rand(1, 12);
  const minuteOpts = [0, 15, 30, 45];
  const minute = minuteOpts[rand(0, minuteOpts.length - 1)];
  const minuteStr = minute === 0 ? "o'clock" : `${minute} minutes past ${hour}`;
  const ans = minute === 0 ? hour * 100 : hour * 100 + minute; // encode as hhmm integer
  const distractors = [
    (hour === 12 ? 1 : hour + 1) * 100 + minute,
    (hour === 1 ? 12 : hour - 1) * 100 + minute,
    hour * 100 + (minute === 45 ? 30 : minute + 15),
  ].filter(v => v !== ans);

  // Simpler variant: just ask what time it is
  const addHours = rand(1, 4);
  const newHour = ((hour - 1 + addHours) % 12) + 1;
  return {
    question: `It is ${hour}:${minute === 0 ? '00' : minute} now.\nWhat time will it be in ${addHours} hour${addHours > 1 ? 's' : ''}?`,
    options: numericOptions(newHour, 4, 1, 3).map(v => {
      const h = ((v - 1 + 12) % 12) + 1;
      return `${h}:${minute === 0 ? '00' : minute}` as string | number;
    }),
    correctAnswer: `${newHour}:${minute === 0 ? '00' : minute}`,
    explanation: `${hour}:${minute===0?'00':minute} + ${addHours} hour${addHours>1?'s':''} = ${newHour}:${minute===0?'00':minute}.`,
  };
}

function p2l9(): Problem {
  // Word problems with addition/subtraction up to 100
  const variant = rand(0, 3);
  if (variant === 0) {
    const a = rand(10, 60);
    const b = rand(10, 40);
    return {
      question: `Lebo has ${a} stickers.\nShe gets ${b} more.\nHow many stickers now?`,
      options: numericOptions(a + b, 4, 0, 10),
      correctAnswer: a + b,
      explanation: `${a} + ${b} = ${a+b} stickers in total.`,
    };
  } else if (variant === 1) {
    const total = rand(30, 90);
    const eaten = rand(5, total - 5);
    return {
      question: `There are ${total} sweets in a jar.\n${eaten} are eaten.\nHow many sweets are left?`,
      options: numericOptions(total - eaten, 4, 0, 10),
      correctAnswer: total - eaten,
      explanation: `${total} − ${eaten} = ${total-eaten} sweets remain.`,
    };
  } else if (variant === 2) {
    const red = rand(10, 50);
    const blue = rand(10, 50);
    return {
      question: `${red} red apples and ${blue} green apples\nare in the basket.\nHow many apples altogether?`,
      options: numericOptions(red + blue, 4, 0, 10),
      correctAnswer: red + blue,
      explanation: `${red} + ${blue} = ${red+blue} apples altogether.`,
    };
  } else {
    const start = rand(50, 90);
    const spend = rand(5, start - 5);
    return {
      question: `Thabo had R${start}.\nHe spent R${spend} on a book.\nHow much does he have left?`,
      options: numericOptions(start - spend, 4, 0, 10),
      correctAnswer: start - spend,
      explanation: `R${start} − R${spend} = R${start-spend} left.`,
    };
  }
}

function p2l10(): Problem {
  // Doubles, halves, and near-doubles
  const useDouble = Math.random() < 0.5;
  if (useDouble) {
    const n = rand(5, 25);
    return {
      question: `Double ${n} = ?`,
      options: numericOptions(n * 2, 4, 0, 6),
      correctAnswer: n * 2,
      explanation: `Double means × 2: ${n} + ${n} = ${n*2}.`,
    };
  } else {
    const n = rand(2, 25) * 2; // even number so half is whole
    return {
      question: `Half of ${n} = ?`,
      options: numericOptions(n / 2, 4, 1, 4),
      correctAnswer: n / 2,
      explanation: `Half means ÷ 2: ${n} ÷ 2 = ${n/2}.`,
    };
  }
}

function p2l11(): Problem {
  // Times tables ×3, ×4, ×6
  const tables = [3, 4, 6];
  const t = tables[rand(0, tables.length - 1)];
  const n = rand(1, 10);
  const ans = t * n;
  return {
    question: `${t} × ${n} = ?`,
    options: numericOptions(ans, 4, 0, t * 2),
    correctAnswer: ans,
    explanation: `${t} × ${n}: count by ${t}s → ${Array.from({length:n},(_,i)=>t*(i+1)).join(', ')}. Answer = ${ans}.`,
  };
}

function p2l12(): Problem {
  // Division sharing equally (÷2, ÷3, ÷4, ÷5)
  const divisors = [2, 3, 4, 5];
  const d = divisors[rand(0, divisors.length - 1)];
  const quotient = rand(2, 10);
  const dividend = d * quotient;
  return {
    question: `${dividend} shared equally among ${d}.\nHow many each?`,
    options: numericOptions(quotient, 4, 1, 4),
    correctAnswer: quotient,
    explanation: `${dividend} ÷ ${d} = ${quotient}. (Check: ${d} × ${quotient} = ${dividend} ✓)`,
  };
}

function p2l13(): Problem {
  // Simple fractions of a number — ½, ¼, ¾ (age-appropriate)
  type Fraction = [number, number, string];
  const fracs: Fraction[] = [
    [1, 2, 'half of'],
    [1, 4, 'a quarter of'],
    [3, 4, 'three quarters of'],
  ];
  const [num, den, label] = fracs[rand(0, fracs.length - 1)];
  const base = rand(2, 12) * den;
  const ans = (base * num) / den;
  return {
    question: `What is ${label} ${base}?`,
    options: numericOptions(ans, 4, 0, 5),
    correctAnswer: ans,
    explanation: `${num}/${den} of ${base} = ${base} ÷ ${den} × ${num} = ${base/den} × ${num} = ${ans}.`,
  };
}

function p2l14(): Problem {
  // Perimeter of a rectangle / square
  const useSquare = Math.random() < 0.4;
  if (useSquare) {
    const side = rand(2, 12);
    return {
      question: `A square has sides of ${side} cm.\nWhat is the perimeter?`,
      options: numericOptions(side * 4, 4, 0, 8),
      correctAnswer: side * 4,
      explanation: `Square perimeter = 4 × side = 4 × ${side} = ${side*4} cm.`,
    };
  } else {
    const w = rand(2, 10);
    const h = rand(2, 10);
    return {
      question: `A rectangle is ${w} cm wide and ${h} cm tall.\nWhat is the perimeter?`,
      options: numericOptions((w + h) * 2, 4, 0, 10),
      correctAnswer: (w + h) * 2,
      explanation: `Perimeter = 2 × (width + height) = 2 × (${w} + ${h}) = 2 × ${w+h} = ${(w+h)*2} cm.`,
    };
  }
}

function p2l15(): Problem {
  // Multi-step word problems (two calculations)
  const variant = rand(0, 2);
  if (variant === 0) {
    const priceEach = rand(2, 8) * 5;
    const qty = rand(2, 4);
    const total = priceEach * qty;
    const paid = total + rand(1, 3) * 10;
    const change = paid - total;
    return {
      question: `Pens cost R${priceEach} each.\nBuy ${qty} pens and pay R${paid}.\nWhat is the change?`,
      options: numericOptions(change, 4, 0, 10),
      correctAnswer: change,
      explanation: `Step 1: ${qty} × R${priceEach} = R${total}. Step 2: R${paid} − R${total} = R${change} change.`,
    };
  } else if (variant === 1) {
    const bags = rand(2, 5);
    const perBag = rand(3, 8);
    const eaten = rand(2, bags * perBag - 2);
    return {
      question: `${bags} bags each have ${perBag} oranges.\n${eaten} oranges are eaten.\nHow many are left?`,
      options: numericOptions(bags * perBag - eaten, 4, 0, 8),
      correctAnswer: bags * perBag - eaten,
      explanation: `Step 1: ${bags} × ${perBag} = ${bags*perBag} total. Step 2: ${bags*perBag} − ${eaten} = ${bags*perBag-eaten} left.`,
    };
  } else {
    const rows = rand(2, 5);
    const cols = rand(2, 6);
    const extra = rand(1, 5);
    return {
      question: `A classroom has ${rows} rows of ${cols} desks.\n${extra} extra desks are added.\nHow many desks altogether?`,
      options: numericOptions(rows * cols + extra, 4, 0, 8),
      correctAnswer: rows * cols + extra,
      explanation: `Step 1: ${rows} × ${cols} = ${rows*cols} desks. Step 2: ${rows*cols} + ${extra} = ${rows*cols+extra} total.`,
    };
  }
}

// ── World 4: Star Observatory ─────────────────────────────────────────────────

function p2l16(): Problem {
  const stepChoices = [2, 3, 4, 5, 10];
  const step = stepChoices[rand(0, stepChoices.length - 1)];
  const start = rand(0, 5) * step;
  const seq = [0, 1, 2, 3, 4].map(i => start + i * step);
  const missingIdx = rand(1, 3);
  const missing = seq[missingIdx];
  const display = seq.map((v, i) => (i === missingIdx ? '?' : String(v))).join(', ');
  return {
    question: `Complete the pattern:\n${display}`,
    options: numericOptions(missing, 4, 0, step * 2),
    correctAnswer: missing,
    explanation: `Count in ${step}s: ${seq.join(', ')}. The missing number is ${missing}.`,
  };
}

function p2l17(): Problem {
  const variant = rand(0, 2);
  if (variant === 0) {
    const shorter = rand(5, 20) * 2;
    const longer  = shorter + rand(2, 10) * 2;
    const diff    = longer - shorter;
    return {
      question: `A pencil is ${shorter} cm long.\nA ruler is ${longer} cm long.\nHow much longer is the ruler?`,
      options: numericOptions(diff, 4, 0, 6),
      correctAnswer: diff,
      explanation: `${longer} − ${shorter} = ${diff} cm longer.`,
    };
  } else if (variant === 1) {
    const a = rand(2, 8);
    const b = rand(2, 8);
    const total = a + b;
    return {
      question: `One rope is ${a} m long.\nAnother rope is ${b} m long.\nWhat is the total length?`,
      options: numericOptions(total, 4, 0, 5),
      correctAnswer: total,
      explanation: `${a} + ${b} = ${total} m total.`,
    };
  } else {
    const lighter = rand(1, 7);
    const heavier = lighter + rand(1, 5);
    const diff    = heavier - lighter;
    return {
      question: `A bag weighs ${lighter} kg.\nAnother bag weighs ${heavier} kg.\nHow much heavier is the second bag?`,
      options: numericOptions(diff, 4, 0, 3),
      correctAnswer: diff,
      explanation: `${heavier} − ${lighter} = ${diff} kg heavier.`,
    };
  }
}

function p2l18(): Problem {
  const categories = [
    { name: 'Reading', emoji: '📚' },
    { name: 'Drawing', emoji: '🎨' },
    { name: 'Sport',   emoji: '⚽' },
  ];
  const each = rand(1, 3);
  const symbols = categories.map(() => rand(1, 5));
  const values  = symbols.map(s => s * each);

  const makeChart = () =>
    categories.map((c, i) => `${c.emoji} ${c.name}: ${'☺'.repeat(symbols[i])}`).join('\n');

  const variant = rand(0, 2);

  if (variant === 0) {
    const idx = rand(0, 2);
    const ans = values[idx];
    return {
      question: `Each ☺ = ${each} child${each > 1 ? 'ren' : ''}.\n\n${makeChart()}\n\nHow many children chose ${categories[idx].name}?`,
      options: numericOptions(ans, 4, 0, each * 2),
      correctAnswer: ans,
      explanation: `${categories[idx].name}: ${symbols[idx]} × ${each} = ${ans} children.`,
    };
  } else if (variant === 1) {
    let syms = symbols.slice();
    let vals = values.slice();
    let attempts = 0;
    while (attempts < 20) {
      const max = Math.max(...vals);
      if (vals.filter(v => v === max).length === 1) break;
      syms = categories.map(() => rand(1, 5));
      vals = syms.map(s => s * each);
      attempts++;
    }
    const max = Math.max(...vals);
    const winnerIdx = vals.indexOf(max);
    const winner = categories[winnerIdx].name;
    const chart = categories.map((c, i) => `${c.emoji} ${c.name}: ${'☺'.repeat(syms[i])}`).join('\n');
    return {
      question: `Each ☺ = ${each} child${each > 1 ? 'ren' : ''}.\n\n${chart}\n\nWhich activity is MOST popular?`,
      options: shuffle(categories.map(c => c.name)),
      correctAnswer: winner,
      explanation: `${winner} has the most ☺ symbols (${syms[winnerIdx]}), meaning ${max} children.`,
    };
  } else {
    let idxA = rand(0, 2);
    let idxB = rand(0, 2);
    let attempts = 0;
    while ((idxB === idxA || values[idxA] === values[idxB]) && attempts < 20) {
      idxA = rand(0, 2); idxB = rand(0, 2); attempts++;
    }
    const bigger  = values[idxA] >= values[idxB] ? idxA : idxB;
    const smaller = values[idxA] >= values[idxB] ? idxB : idxA;
    const diff = values[bigger] - values[smaller];
    return {
      question: `Each ☺ = ${each} child${each > 1 ? 'ren' : ''}.\n\n${makeChart()}\n\nHow many more children chose ${categories[bigger].name} than ${categories[smaller].name}?`,
      options: numericOptions(diff, 4, 0, each * 2),
      correctAnswer: diff,
      explanation: `${values[bigger]} − ${values[smaller]} = ${diff} more children chose ${categories[bigger].name}.`,
    };
  }
}

function p2l19(): Problem {
  const shapes = [
    { name: 'cube',              emoji: '🎲', faces: 6, edges: 12, vertices: 8 },
    { name: 'sphere',            emoji: '⚽', faces: 0, edges: 0,  vertices: 0 },
    { name: 'cylinder',          emoji: '🥫', faces: 2, edges: 2,  vertices: 0 },
    { name: 'cone',              emoji: '🍦', faces: 1, edges: 1,  vertices: 1 },
    { name: 'rectangular prism', emoji: '📦', faces: 6, edges: 12, vertices: 8 },
  ];
  const shape = shapes[rand(0, shapes.length - 1)];
  const props = [
    { label: 'flat faces',         value: shape.faces    },
    { label: 'edges',              value: shape.edges    },
    { label: 'vertices (corners)', value: shape.vertices },
  ];
  const prop = props[rand(0, props.length - 1)];
  return {
    question: `How many ${prop.label} does a ${shape.name} ${shape.emoji} have?`,
    options: numericOptions(prop.value, 4, 0, 3),
    correctAnswer: prop.value,
    explanation: `A ${shape.name} has ${shape.faces} flat face(s), ${shape.edges} edge(s), and ${shape.vertices} corner(s).`,
  };
}

function p2l20(): Problem {
  const hundreds = rand(1, 9);
  const tens     = rand(0, 9);
  const units    = rand(0, 9);
  const num      = hundreds * 100 + tens * 10 + units;

  const variant = rand(0, 2);

  if (variant === 0) {
    const places = [
      { name: 'hundreds', value: hundreds * 100 },
      { name: 'tens',     value: tens * 10 },
      { name: 'units',    value: units },
    ].filter(p => p.value > 0);
    const place = places[rand(0, places.length - 1)];
    const spread = place.value >= 100 ? 100 : place.value >= 10 ? 10 : 3;
    return {
      question: `What is the value of the digit in the ${place.name} place of ${num}?`,
      options: numericOptions(place.value, 4, 0, spread),
      correctAnswer: place.value,
      explanation: `${num} = ${hundreds * 100} + ${tens * 10} + ${units}. The ${place.name} digit is worth ${place.value}.`,
    };
  } else if (variant === 1) {
    const parts = [hundreds * 100, tens * 10, units].filter(p => p > 0);
    if (parts.length < 2) {
      const ans = hundreds * 100;
      return {
        question: `What is the value of the hundreds digit in ${num}?`,
        options: numericOptions(ans, 4, 0, 100),
        correctAnswer: ans,
        explanation: `The hundreds digit ${hundreds} is worth ${ans}.`,
      };
    }
    const missingIdx = rand(0, parts.length - 1);
    const missing = parts[missingIdx];
    const shown = parts.map((p, i) => (i === missingIdx ? '?' : String(p))).join(' + ');
    const spread = missing >= 100 ? 100 : missing >= 10 ? 10 : 3;
    return {
      question: `${num} = ${shown}\nWhat is the missing part?`,
      options: numericOptions(missing, 4, 0, spread),
      correctAnswer: missing,
      explanation: `${num} = ${parts.join(' + ')}. The missing part is ${missing}.`,
    };
  } else {
    const placeOptions = [
      { name: 'hundreds', digit: hundreds },
      { name: 'tens',     digit: tens },
      { name: 'units',    digit: units },
    ];
    const place = placeOptions[rand(0, 2)];
    return {
      question: `What digit is in the ${place.name} place of ${num}?`,
      options: numericOptions(place.digit, 4, 0, 4),
      correctAnswer: place.digit,
      explanation: `${num} = ${hundreds * 100} + ${tens * 10} + ${units}. The ${place.name} digit is ${place.digit}.`,
    };
  }
}

// PHASE 3 — Higher Primary (Ages 9–12)
// 3 sub-worlds × 5 levels = 15 levels
//   World 1: Merchant Republic  (commerce)      — levels  1–5
//   World 2: Engineers' Citadel (construction)  — levels  6–10
//   World 3: Storm Observatory  (science/data)  — levels 11–15

// ── World 1: Merchant Republic ────────────────────────────────────────────────

function p3l1(): Problem {
  // Long multiplication: 2-digit × 2-digit
  const a = rand(11, 35);
  const b = rand(11, 25);
  const ans = a * b;
  return {
    question: `${a} × ${b} = ?`,
    options: numericOptions(ans, 4, 0, Math.max(20, Math.round(ans * 0.12))),
    correctAnswer: ans,
    explanation: `${a} × ${b}: split → ${a} × ${Math.floor(b/10)*10} = ${a*Math.floor(b/10)*10}, then + ${a} × ${b%10} = ${a*(b%10)}. Total = ${ans}.`,
  };
}

function p3l2(): Problem {
  // Division with remainders — ask for quotient OR remainder
  const divisor = rand(3, 9);
  const quotient = rand(3, 12);
  const remainder = rand(1, divisor - 1);
  const dividend = divisor * quotient + remainder;
  if (Math.random() < 0.5) {
    return {
      question: `${dividend} ÷ ${divisor} = ${quotient} remainder ?\n(What is the remainder?)`,
      options: numericOptions(remainder, 4, 0, 3),
      correctAnswer: remainder,
      explanation: `${quotient} × ${divisor} = ${quotient*divisor}. Then ${dividend} − ${quotient*divisor} = ${remainder} remainder.`,
    };
  }
  return {
    question: `${dividend} ÷ ${divisor} = ? remainder ${remainder}\n(What is the quotient?)`,
    options: numericOptions(quotient, 4, 1, 3),
    correctAnswer: quotient,
    explanation: `${dividend} − ${remainder} = ${dividend-remainder}. Then ${dividend-remainder} ÷ ${divisor} = ${quotient}.`,
  };
}

function p3l3(): Problem {
  // Decimal operations — add or subtract (1 decimal place)
  const aInt = rand(11, 95);
  const bInt = rand(11, 95);
  const useAdd = Math.random() < 0.5;
  if (useAdd) {
    const ansInt = aInt + bInt;
    return {
      question: `${(aInt / 10).toFixed(1)} + ${(bInt / 10).toFixed(1)} = ?`,
      options: numericOptions(ansInt, 4, 0, 5).map(v => parseFloat((v / 10).toFixed(1))),
      correctAnswer: parseFloat((ansInt / 10).toFixed(1)),
      explanation: `Line up the decimal points: ${(aInt/10).toFixed(1)} + ${(bInt/10).toFixed(1)} = ${(ansInt/10).toFixed(1)}.`,
    };
  }
  const big = Math.max(aInt, bInt);
  const small = Math.min(aInt, bInt);
  const ansInt = big - small;
  return {
    question: `${(big / 10).toFixed(1)} − ${(small / 10).toFixed(1)} = ?`,
    options: numericOptions(ansInt, 4, 0, 5).map(v => parseFloat((v / 10).toFixed(1))),
    correctAnswer: parseFloat((ansInt / 10).toFixed(1)),
    explanation: `Line up the decimal points: ${(big/10).toFixed(1)} − ${(small/10).toFixed(1)} = ${(ansInt/10).toFixed(1)}.`,
  };
}

function p3l4(): Problem {
  // Percentages using the 10% anchor method
  const percents = [10, 20, 25, 50, 75];
  const p = percents[rand(0, percents.length - 1)];
  const den = 100 / p;
  const base = rand(2, 20) * den; // guarantees clean integer answer
  const ans = (base * p) / 100;
  return {
    question: `${p}% of ${base} = ?`,
    options: numericOptions(ans, 4, 0, Math.max(8, Math.round(ans * 0.3))),
    correctAnswer: ans,
    explanation: `10% of ${base} = ${base/10}. So ${p}% = ${p/10} × ${base/10} = ${ans}.`,
  };
}

function p3l5(): Problem {
  // Multi-step money (World 1 boss)
  const variant = rand(0, 2);
  if (variant === 0) {
    const price = rand(2, 8) * 10 + rand(0, 1) * 5;
    const qty = rand(2, 4);
    const total = price * qty;
    const paid = total + rand(1, 3) * 20;
    return {
      question: `${qty} items at R${price} each.\nYou pay R${paid}.\nWhat is your change?`,
      options: numericOptions(paid - total, 4, 0, 10),
      correctAnswer: paid - total,
      explanation: `Step 1: ${qty} × R${price} = R${total}. Step 2: R${paid} − R${total} = R${paid-total} change.`,
    };
  }
  if (variant === 1) {
    const origPrice = rand(4, 20) * 10;
    const discountPct = [10, 20, 25][rand(0, 2)];
    const saving = (origPrice * discountPct) / 100;
    const finalPrice = origPrice - saving;
    return {
      question: `Original price: R${origPrice}.\n${discountPct}% discount applied.\nFinal price?`,
      options: numericOptions(finalPrice, 4, 0, Math.max(10, saving)),
      correctAnswer: finalPrice,
      explanation: `${discountPct}% of R${origPrice} = R${saving}. Final = R${origPrice} − R${saving} = R${finalPrice}.`,
    };
  }
  const people = [2, 3, 4, 5][rand(0, 3)];
  const perPerson = rand(5, 20) * 5;
  const totalBill = perPerson * people;
  return {
    question: `A bill of R${totalBill} is split equally among ${people}.\nHow much does each person pay?`,
    options: numericOptions(perPerson, 4, 0, Math.max(5, Math.round(perPerson * 0.2))),
    correctAnswer: perPerson,
    explanation: `R${totalBill} ÷ ${people} = R${perPerson} per person.`,
  };
}

// ── World 2: Engineers' Citadel ───────────────────────────────────────────────

function p3l6(): Problem {
  // Area of rectangles/squares — perimeter included as a distractor
  const length = rand(3, 15);
  const width = rand(2, 10);
  const area = length * width;
  const perimeter = 2 * (length + width);
  const opts = new Set<number>([area, perimeter]);
  while (opts.size < 4) {
    const d = area + rand(1, 3) * length * (Math.random() < 0.5 ? 1 : -1);
    if (d > 0 && d !== area) opts.add(d);
  }
  return {
    question: `A rectangle is ${length} m × ${width} m.\nWhat is the AREA in m²?`,
    options: shuffle([...opts]).slice(0, 4),
    correctAnswer: area,
    explanation: `Area = length × width = ${length} × ${width} = ${area} m². (Perimeter would be ${perimeter} m — don't confuse them!)`,
  };
}

function p3l7(): Problem {
  // Simplify fractions
  const pairs = [
    { frac: '2/4', ans: '1/2', wrong: ['1/4', '2/3', '3/4'] },
    { frac: '3/6', ans: '1/2', wrong: ['2/3', '1/3', '3/4'] },
    { frac: '6/8', ans: '3/4', wrong: ['2/3', '1/2', '4/6'] },
    { frac: '4/6', ans: '2/3', wrong: ['1/3', '3/4', '1/2'] },
    { frac: '4/8', ans: '1/2', wrong: ['3/4', '2/4', '1/4'] },
    { frac: '9/12', ans: '3/4', wrong: ['2/3', '1/2', '4/5'] },
    { frac: '8/12', ans: '2/3', wrong: ['3/4', '1/2', '4/6'] },
    { frac: '6/10', ans: '3/5', wrong: ['2/5', '1/2', '4/5'] },
    { frac: '10/15', ans: '2/3', wrong: ['1/3', '3/5', '3/4'] },
  ];
  const p = pairs[rand(0, pairs.length - 1)];
  return {
    question: `Simplify ${p.frac}`,
    options: shuffle([p.ans, ...p.wrong.slice(0, 3)]),
    correctAnswer: p.ans,
    explanation: `Divide top and bottom by their GCD. ${p.frac} → ${p.ans}.`,
  };
}

function p3l8(): Problem {
  // Fraction addition/subtraction with unlike denominators (curated safe pairs)
  type FP = { n1: number; d1: number; n2: number; d2: number; op: '+' | '-'; ans: string };
  const problems: FP[] = [
    { n1: 1, d1: 2, n2: 1, d2: 4, op: '+', ans: '3/4' },
    { n1: 2, d1: 3, n2: 1, d2: 6, op: '+', ans: '5/6' },
    { n1: 3, d1: 4, n2: 1, d2: 2, op: '-', ans: '1/4' },
    { n1: 5, d1: 6, n2: 1, d2: 3, op: '-', ans: '1/2' },
    { n1: 1, d1: 3, n2: 1, d2: 6, op: '+', ans: '1/2' },
    { n1: 1, d1: 2, n2: 1, d2: 3, op: '+', ans: '5/6' },
    { n1: 3, d1: 4, n2: 1, d2: 8, op: '+', ans: '7/8' },
    { n1: 2, d1: 3, n2: 1, d2: 4, op: '-', ans: '5/12' },
  ];
  const pr = problems[rand(0, problems.length - 1)];
  // Build 3 plausible wrong answers
  const wrongSet = new Set<string>([
    fractionStr(pr.n1 + pr.n2, pr.d1 + pr.d2), // common mistake: add tops and bottoms
    fractionStr(pr.n1 + pr.n2, pr.d1),
    fractionStr(pr.n1, pr.d1 + pr.d2),
  ].filter(w => w !== pr.ans));
  while (wrongSet.size < 3) wrongSet.add(fractionStr(rand(1, 5), rand(2, 8)));
  return {
    question: `${pr.n1}/${pr.d1} ${pr.op} ${pr.n2}/${pr.d2} = ?`,
    options: shuffle([pr.ans, ...[...wrongSet].slice(0, 3)]),
    correctAnswer: pr.ans,
    explanation: `Find a common denominator, then ${pr.op === '+' ? 'add' : 'subtract'} the numerators: ${pr.n1}/${pr.d1} ${pr.op} ${pr.n2}/${pr.d2} = ${pr.ans}.`,
  };
}

function p3l9(): Problem {
  // Ratio & proportion
  const variant = rand(0, 2);
  if (variant === 0) {
    const rA = rand(1, 4);
    const rB = rand(2, 5);
    const mult = rand(2, 6);
    const givenA = rA * mult;
    const givenB = rB * mult;
    return {
      question: `Ratio of red to blue tiles is ${rA}:${rB}.\nWith ${givenA} red tiles, how many blue?`,
      options: numericOptions(givenB, 4, 1, Math.max(4, rB)),
      correctAnswer: givenB,
      explanation: `Scale factor = ${givenA} ÷ ${rA} = ${mult}. Blue = ${rB} × ${mult} = ${givenB}.`,
    };
  }
  if (variant === 1) {
    const scale = [5, 10, 20][rand(0, 2)];
    const mapDist = rand(3, 12);
    const realDist = mapDist * scale;
    return {
      question: `Map scale: 1 cm = ${scale} km.\nMap distance: ${mapDist} cm.\nReal distance?`,
      options: numericOptions(realDist, 4, 0, scale * 2),
      correctAnswer: realDist,
      explanation: `${mapDist} cm × ${scale} km/cm = ${realDist} km.`,
    };
  }
  const rA = rand(2, 4);
  const rB = rand(3, 6);
  const mult = rand(2, 4);
  const givenA = rA * mult;
  const givenB = rB * mult;
  return {
    question: `A recipe uses ${rA} cups flour and ${rB} cups milk.\nFor ${givenA} cups of flour, how much milk?`,
    options: numericOptions(givenB, 4, 1, Math.max(4, rB)),
    correctAnswer: givenB,
    explanation: `Scale factor = ${givenA} ÷ ${rA} = ${mult}. Milk = ${rB} × ${mult} = ${givenB} cups.`,
  };
}

function p3l10(): Problem {
  // World 2 boss — area + percentage, ratio split, or fraction of area
  const variant = rand(0, 2);
  if (variant === 0) {
    const length = rand(4, 12);
    const width = rand(3, 8);
    const area = length * width;
    const pricePerM2 = rand(3, 8) * 10;
    const totalCost = area * pricePerM2;
    return {
      question: `Room: ${length} m × ${width} m.\nFlooring costs R${pricePerM2}/m².\nTotal cost?`,
      options: numericOptions(totalCost, 4, 0, Math.max(pricePerM2 * 2, Math.round(totalCost * 0.15))),
      correctAnswer: totalCost,
      explanation: `Area = ${length} × ${width} = ${area} m². Cost = ${area} × R${pricePerM2} = R${totalCost}.`,
    };
  }
  if (variant === 1) {
    const people = [2, 3, 4][rand(0, 2)];
    const perPerson = rand(5, 15) * people; // total divisible
    const total = perPerson * people;
    const rA = rand(1, people - 1);
    const rB = people - rA;
    const largeShare = (total / people) * Math.max(rA, rB);
    return {
      question: `R${total} shared in ratio ${rA}:${rB}.\nLarger share = R?`,
      options: numericOptions(largeShare, 4, 0, Math.round(total * 0.15)),
      correctAnswer: largeShare,
      explanation: `1 part = R${total} ÷ ${rA+rB} = R${total/(rA+rB)}. Larger share (${Math.max(rA,rB)} parts) = R${largeShare}.`,
    };
  }
  let length = 4, width = 4, num = 1, den = 2, area = 16;
  let attempts = 0;
  while (attempts++ < 20) {
    length = rand(4, 10);
    width = rand(3, 8);
    area = length * width;
    const fracs: [number, number][] = [[1, 2], [1, 4], [3, 4]];
    [num, den] = fracs[rand(0, fracs.length - 1)];
    if (area % den === 0) break;
  }
  const part = (area * num) / den;
  return {
    question: `A garden is ${length} m × ${width} m.\n${num}/${den} is planted.\nHow many m² is planted?`,
    options: numericOptions(part, 4, 0, Math.max(5, Math.round(part * 0.2))),
    correctAnswer: part,
    explanation: `Area = ${length} × ${width} = ${area} m². ${num}/${den} of ${area} = ${area} ÷ ${den} × ${num} = ${part} m².`,
  };
}

// ── World 3: Storm Observatory ────────────────────────────────────────────────

function p3l11(): Problem {
  // Negative integers — temperature or number line
  const variant = rand(0, 2);
  if (variant === 0) {
    const start = rand(-8, 4);
    const change = rand(2, 8);
    const goDown = Math.random() < 0.5;
    const ans = goDown ? start - change : start + change;
    return {
      question: `Temperature: ${start}°C.\nIt ${goDown ? 'drops' : 'rises'} by ${change}°.\nNew temperature?`,
      options: numericOptions(ans, 4, -20, 4),
      correctAnswer: ans,
      explanation: `${start} ${goDown ? '−' : '+'} ${change} = ${ans}°C. Moving ${goDown?'left (colder)':'right (warmer)'} on the number line.`,
    };
  }
  if (variant === 1) {
    const a = rand(-9, -1);
    const b = rand(2, 12);
    return {
      question: `${a} + ${b} = ?`,
      options: numericOptions(a + b, 4, -12, 4),
      correctAnswer: a + b,
      explanation: `${a} + ${b}: start at ${a}, move ${b} steps right → ${a+b}.`,
    };
  }
  const nums = shuffle([rand(-8, -4), rand(-3, -1), rand(1, 4), rand(5, 10)]);
  const smallest = Math.min(...nums);
  return {
    question: `Which is the SMALLEST?\n${nums.join('   ')}`,
    options: shuffle([...nums]),
    correctAnswer: smallest,
    explanation: `On the number line, more negative = smaller. The smallest is ${smallest}.`,
  };
}

function p3l12(): Problem {
  // Mean, median, or mode
  const type = rand(0, 2);
  if (type === 0) {
    // Mean — pick values that sum cleanly
    const count = rand(4, 5);
    const mean = rand(4, 12);
    const total = mean * count;
    // Build count values summing to total
    const vals: number[] = [];
    let remaining = total;
    for (let i = 0; i < count - 1; i++) {
      const v = rand(Math.max(1, mean - 4), mean + 4);
      vals.push(v);
      remaining -= v;
    }
    vals.push(remaining);
    if (remaining < 1 || remaining > 20) {
      // Fallback: use a clean set of values
      return {
        question: `Find the MEAN of:\n4, 6, 8, 10, 12`,
        options: numericOptions(8, 4, 1, 3),
        correctAnswer: 8,
        explanation: `Mean = sum ÷ count = (4+6+8+10+12) ÷ 5 = 40 ÷ 5 = 8.`,
      };
    }
    const displayVals = shuffle(vals);
    return {
      question: `Find the MEAN of:\n${displayVals.join(', ')}`,
      options: numericOptions(mean, 4, 1, 3),
      correctAnswer: mean,
      explanation: `Mean = sum ÷ count = ${vals.reduce((s,v)=>s+v,0)} ÷ ${count} = ${mean}.`,
    };
  }
  if (type === 1) {
    // Mode — one value appears twice, rest appear once
    const mode = rand(3, 10);
    const others = [rand(11, 15), rand(16, 20), rand(21, 25)];
    const vals = shuffle([mode, mode, ...others]);
    return {
      question: `Find the MODE of:\n${vals.join(', ')}`,
      options: numericOptions(mode, 4, 1, 5),
      correctAnswer: mode,
      explanation: `Mode = most frequent value. ${mode} appears twice, so the mode is ${mode}.`,
    };
  }
  // Median — 5 values, sorted middle value
  const vals = Array.from({ length: 5 }, () => rand(4, 20));
  const sorted = [...vals].sort((a, b) => a - b);
  const median = sorted[2];
  return {
    question: `Find the MEDIAN of:\n${vals.join(', ')}`,
    options: numericOptions(median, 4, 1, 4),
    correctAnswer: median,
    explanation: `Sort the values: ${sorted.join(', ')}. The middle (3rd) value is ${median}.`,
  };
}

function p3l13(): Problem {
  // Algebraic equations — solve for n
  const type = rand(0, 3);
  if (type === 0) {
    const n = rand(4, 18);
    const b = rand(2, n - 1);
    return {
      question: `n + ${b} = ${n + b}\nWhat is n?`,
      options: numericOptions(n, 4, 1, 4),
      correctAnswer: n,
      explanation: `n + ${b} = ${n+b} → n = ${n+b} − ${b} = ${n}.`,
    };
  }
  if (type === 1) {
    const b = rand(3, 10);
    const n = rand(3, 15);
    return {
      question: `n − ${b} = ${n - b}\nWhat is n?`,
      options: numericOptions(n, 4, 1, 4),
      correctAnswer: n,
      explanation: `n − ${b} = ${n-b} → n = ${n-b} + ${b} = ${n}.`,
    };
  }
  if (type === 2) {
    const b = rand(2, 8);
    const n = rand(2, 10);
    return {
      question: `n × ${b} = ${n * b}\nWhat is n?`,
      options: numericOptions(n, 4, 1, 3),
      correctAnswer: n,
      explanation: `n × ${b} = ${n*b} → n = ${n*b} ÷ ${b} = ${n}.`,
    };
  }
  const b = rand(1, 8);
  const n = rand(2, 9);
  return {
    question: `2n + ${b} = ${2 * n + b}\nWhat is n?`,
    options: numericOptions(n, 4, 1, 3),
    correctAnswer: n,
    explanation: `2n + ${b} = ${2*n+b} → 2n = ${2*n+b} − ${b} = ${2*n} → n = ${2*n} ÷ 2 = ${n}.`,
  };
}

function p3l14(): Problem {
  // Advanced BODMAS — brackets, mixed operations
  const variant = rand(0, 5);
  if (variant === 0) {
    const a = rand(2, 6), b = rand(2, 6), c = rand(1, 8);
    return {
      question: `${a} + ${b} × ${c} = ?`,
      options: numericOptions(a + b * c, 4, 0, 8),
      correctAnswer: a + b * c,
      explanation: `BODMAS: multiply first → ${b} × ${c} = ${b*c}, then add ${a} → ${a+b*c}.`,
    };
  }
  if (variant === 1) {
    const a = rand(2, 8), b = rand(2, 4), c = rand(2, 6);
    return {
      question: `(${a} + ${b}) × ${c} = ?`,
      options: numericOptions((a + b) * c, 4, 0, 10),
      correctAnswer: (a + b) * c,
      explanation: `Brackets first: (${a} + ${b}) = ${a+b}, then × ${c} = ${(a+b)*c}.`,
    };
  }
  if (variant === 2) {
    const a = rand(2, 6), b = rand(2, 5), c = rand(1, 8);
    return {
      question: `${a} × ${b} − ${c} = ?`,
      options: numericOptions(a * b - c, 4, 0, 8),
      correctAnswer: a * b - c,
      explanation: `Multiply first: ${a} × ${b} = ${a*b}, then subtract ${c} → ${a*b-c}.`,
    };
  }
  if (variant === 3) {
    const d = rand(2, 5);
    const q = rand(2, 8);
    const c = rand(2, 6);
    return {
      question: `${d * q} ÷ ${d} + ${c} = ?`,
      options: numericOptions(q + c, 4, 0, 6),
      correctAnswer: q + c,
      explanation: `Division first: ${d*q} ÷ ${d} = ${q}, then + ${c} = ${q+c}.`,
    };
  }
  if (variant === 4) {
    const a = rand(2, 5), b = rand(2, 4), c = rand(3, 6), d = rand(1, c - 1);
    return {
      question: `(${a} + ${b}) × (${c} − ${d}) = ?`,
      options: numericOptions((a + b) * (c - d), 4, 0, 8),
      correctAnswer: (a + b) * (c - d),
      explanation: `Both brackets first: (${a}+${b}) = ${a+b}, (${c}−${d}) = ${c-d}. Then ${a+b} × ${c-d} = ${(a+b)*(c-d)}.`,
    };
  }
  const a = rand(1, 5), b = rand(2, 5), d2 = rand(2, 4), q2 = rand(2, 6);
  return {
    question: `${a} × ${b} + ${d2 * q2} ÷ ${d2} = ?`,
    options: numericOptions(a * b + q2, 4, 0, 8),
    correctAnswer: a * b + q2,
    explanation: `Do × and ÷ first: ${a}×${b}=${a*b} and ${d2*q2}÷${d2}=${q2}. Then add: ${a*b}+${q2}=${a*b+q2}.`,
  };
}

function p3l15(): Problem {
  // Final boss — multi-step synthesis of all three worlds
  const variant = rand(0, 2);
  if (variant === 0) {
    // Negative numbers + multi-step
    const start = rand(-10, -2);
    const rise1 = rand(3, 8);
    const rise2 = rand(2, 6);
    return {
      question: `A submarine is at ${start} m.\nIt rises ${rise1} m, then ${rise2} m more.\nFinal depth?`,
      options: numericOptions(start + rise1 + rise2, 4, -15, 4),
      correctAnswer: start + rise1 + rise2,
      explanation: `${start} + ${rise1} = ${start+rise1}, then + ${rise2} = ${start+rise1+rise2} m.`,
    };
  }
  if (variant === 1) {
    // Algebra — solve bn + c = total
    const b = rand(3, 7);
    const c = rand(2, 8);
    const n = rand(2, 8);
    return {
      question: `${b}n + ${c} = ${b * n + c}\nWhat is n?`,
      options: numericOptions(n, 4, 1, 3),
      correctAnswer: n,
      explanation: `${b}n + ${c} = ${b*n+c} → ${b}n = ${b*n+c} − ${c} = ${b*n} → n = ${b*n} ÷ ${b} = ${n}.`,
    };
  }
  // Mean reverse — find missing value that gives a target mean
  let known: number[] = [10, 14, 16, 18];
  let targetMean = 14;
  let fifth = 12;
  let attempts = 0;
  while (attempts++ < 20) {
    known = Array.from({ length: 4 }, () => rand(10, 20));
    targetMean = rand(12, 18);
    fifth = targetMean * 5 - known.reduce((a, b) => a + b, 0);
    if (fifth >= 5 && fifth <= 25) break;
  }
  if (fifth < 5 || fifth > 25) { known = [10, 14, 16, 18]; targetMean = 14; fifth = 12; }
  return {
    question: `4 scores: ${known.join(', ')}.\nWhat 5th score gives a mean of ${targetMean}?`,
    options: numericOptions(fifth, 4, 5, 4),
    correctAnswer: fifth,
    explanation: `Target total = ${targetMean} × 5 = ${targetMean*5}. Sum of 4 scores = ${known.reduce((a,b)=>a+b,0)}. 5th score = ${targetMean*5} − ${known.reduce((a,b)=>a+b,0)} = ${fifth}.`,
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
    explanation: `Same denominator: ${opSym === '+' ? `${opA} + ${opB}` : `${opA} − ${opB}`} = ${resultNum}, keep /${den} → ${ansStr}.`,
  };
}

function p4l2(): Problem {
  // Decimals to 2 d.p. — add, subtract, or multiply
  const variant = rand(0, 2);
  if (variant === 2) {
    // Multiplication: x.xx × single digit
    const aInt = rand(100, 999);
    const b = rand(2, 9);
    const a = aInt / 100;
    const ansInt = aInt * b;
    const ans = ansInt / 100;
    // Format to 2 d.p.
    const fmt = (v: number) => v.toFixed(2);
    const spread = Math.max(50, Math.round(ansInt * 0.1));
    const opts = numericOptions(ansInt, 4, 0, spread).map(v => parseFloat((v / 100).toFixed(2)));
    return {
      question: `${fmt(a)} × ${b} = ?`,
      options: opts,
      correctAnswer: parseFloat(fmt(ans)),
      explanation: `${fmt(a)} × ${b}: multiply as whole numbers (${aInt} × ${b} = ${ansInt}), then ÷ 100 = ${fmt(ans)}.`,
    };
  }
  // Add or subtract to 2 d.p.
  const useAdd = variant === 0;
  const aInt = rand(100, 950);
  const bInt = rand(100, 950);
  const fmt = (v: number) => (v / 100).toFixed(2);
  if (useAdd) {
    const ansInt = aInt + bInt;
    return {
      question: `${fmt(aInt)} + ${fmt(bInt)} = ?`,
      options: numericOptions(ansInt, 4, 0, 25).map(v => parseFloat((v / 100).toFixed(2))),
      correctAnswer: parseFloat((ansInt / 100).toFixed(2)),
      explanation: `Line up decimal points: ${fmt(aInt)} + ${fmt(bInt)} = ${(ansInt/100).toFixed(2)}.`,
    };
  } else {
    const bigger = Math.max(aInt, bInt);
    const smaller = Math.min(aInt, bInt);
    const ansInt = bigger - smaller;
    return {
      question: `${fmt(bigger)} − ${fmt(smaller)} = ?`,
      options: numericOptions(ansInt, 4, 0, 25).map(v => parseFloat((v / 100).toFixed(2))),
      correctAnswer: parseFloat((ansInt / 100).toFixed(2)),
      explanation: `Line up decimal points: ${fmt(bigger)} − ${fmt(smaller)} = ${(ansInt/100).toFixed(2)}.`,
    };
  }
}

function p4l3(): Problem {
  // Percentage change or reverse percentage
  const variant = rand(0, 1);
  if (variant === 0) {
    // Percentage change: old → new, find % change
    const oldVal = rand(4, 20) * 5;              // 20–100, multiples of 5
    const changePct = [10, 20, 25, 50][rand(0, 3)];
    const increase = Math.random() < 0.5;
    const newVal = increase ? oldVal + (oldVal * changePct) / 100 : oldVal - (oldVal * changePct) / 100;
    return {
      question: `A price changes from R${oldVal} to R${newVal}.\nWhat % ${increase ? 'increase' : 'decrease'} is this?`,
      options: numericOptions(changePct, 4, 5, 10),
      correctAnswer: changePct,
      explanation: `Change = R${newVal} − R${oldVal} = R${Math.abs(newVal-oldVal)}. % change = ${Math.abs(newVal-oldVal)} ÷ ${oldVal} × 100 = ${changePct}%.`,
    };
  }
  // Reverse percentage: after-discount price → original
  const discountPct = [10, 20, 25][rand(0, 2)];
  const remaining = 100 - discountPct;
  // original × remaining/100 = salePrice
  const multiplier = rand(2, 10);
  const original = multiplier * (100 / (100 - discountPct)) * (100 - discountPct) / 100 * (100 / remaining) * remaining;
  // Simpler: pick original cleanly divisible
  const origClean = rand(3, 15) * (100 / gcd(remaining, 100)) * (remaining / 100);
  const salePrice = Math.round(origClean * remaining / 100);
  const origRound = Math.round(origClean);
  return {
    question: `After a ${discountPct}% discount the price is R${salePrice}.\nWhat was the original price?`,
    options: numericOptions(origRound, 4, 5, Math.max(5, Math.round(origRound * 0.1))),
    correctAnswer: origRound,
    explanation: `Sale price = ${100-discountPct}% of original. Original = R${salePrice} ÷ ${(100-discountPct)/100} = R${origRound}.`,
  };
}

function p4l4(): Problem {
  // BODMAS with exponents and deeper nested brackets
  const variant = rand(0, 4);
  if (variant === 0) {
    // Simple square: a² + b × c
    const a = rand(2, 6), b = rand(2, 5), c = rand(1, 8);
    const ans = a * a + b * c;
    return {
      question: `${a}² + ${b} × ${c} = ?`,
      options: numericOptions(ans, 4, 0, 8),
      correctAnswer: ans,
      explanation: `Powers first: ${a}² = ${a*a}. Then × before +: ${b}×${c}=${b*c}. Finally: ${a*a}+${b*c}=${ans}.`,
    };
  } else if (variant === 1) {
    // Cube: a³ − b
    const a = rand(2, 4), b = rand(1, 10);
    const ans = a * a * a - b;
    return {
      question: `${a}³ − ${b} = ?`,
      options: numericOptions(ans, 4, 0, 6),
      correctAnswer: ans,
      explanation: `${a}³ = ${a}×${a}×${a} = ${a*a*a}. Then − ${b} = ${ans}.`,
    };
  } else if (variant === 2) {
    // Nested brackets: (a + b) × (c − d)
    const a = rand(2, 6), b = rand(1, 4), c = rand(5, 10), d = rand(1, 4);
    const ans = (a + b) * (c - d);
    return {
      question: `(${a} + ${b}) × (${c} − ${d}) = ?`,
      options: numericOptions(ans, 4, 0, 10),
      correctAnswer: ans,
      explanation: `Brackets first: (${a}+${b})=${a+b}, (${c}−${d})=${c-d}. Then ${a+b}×${c-d}=${ans}.`,
    };
  } else if (variant === 3) {
    // Exponent inside brackets: (a² + b) ÷ c — ensure divisible
    const c = rand(2, 5);
    const a = rand(2, 5);
    const extra = rand(0, 3) * c;
    const b = extra;
    const ans = (a * a + b) / c;
    return {
      question: `(${a}² + ${b}) ÷ ${c} = ?`,
      options: numericOptions(ans, 4, 0, 5),
      correctAnswer: ans,
      explanation: `Bracket first: ${a}²=${a*a}, ${a*a}+${b}=${a*a+b}. Then ÷${c} = ${ans}.`,
    };
  } else {
    // Full BODMAS: a + b × c² − d
    const a = rand(2, 8), b = rand(2, 4), c = rand(2, 4), d = rand(1, 6);
    const ans = a + b * c * c - d;
    return {
      question: `${a} + ${b} × ${c}² − ${d} = ?`,
      options: numericOptions(ans, 4, 0, 8),
      correctAnswer: ans,
      explanation: `Order: ${c}²=${c*c}, then ${b}×${c*c}=${b*c*c}, then ${a}+${b*c*c}−${d}=${ans}.`,
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
      explanation: `Step 1: ${qty} × $${priceEach} = $${total}. Step 2: $${paid} − $${total} = $${change} change.`,
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
      explanation: `Step 1: ${total} − ${eaten} = ${total-eaten} left. Step 2: ${total-eaten} ÷ ${shared} = ${each} each.`,
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
      explanation: `Total time = ${t1} + ${t2} = ${t1+t2} hours. Distance = ${speed} × ${t1+t2} = ${dist} km.`,
    };
  }
}

// ── World 2: The Geometry Forge ───────────────────────────────────────────────

function p4l6(): Problem {
  // Volume of rectangular prisms
  const l = rand(2, 10), w = rand(2, 8), h = rand(2, 6);
  const vol = l * w * h;
  return {
    question: `A box is ${l} cm long, ${w} cm wide and ${h} cm tall.\nVolume in cm³?`,
    options: numericOptions(vol, 4, 0, Math.max(20, Math.round(vol * 0.2))),
    correctAnswer: vol,
    explanation: `Volume = l × w × h = ${l} × ${w} × ${h} = ${vol} cm³.`,
  };
}

function p4l7(): Problem {
  // Surface area of rectangular prisms
  const l = rand(2, 8), w = rand(2, 6), h = rand(2, 5);
  const sa = 2 * (l * w + l * h + w * h);
  return {
    question: `A box: ${l} cm × ${w} cm × ${h} cm.\nSurface area in cm²?`,
    options: numericOptions(sa, 4, 0, Math.max(15, Math.round(sa * 0.15))),
    correctAnswer: sa,
    explanation: `SA = 2(lw + lh + wh) = 2(${l*w} + ${l*h} + ${w*h}) = ${sa} cm².`,
  };
}

function p4l8(): Problem {
  // Angles: supplementary, complementary, vertically opposite
  const type = rand(0, 2);
  if (type === 0) {
    const a = rand(35, 145);
    return {
      question: `Two angles are supplementary.\nOne angle is ${a}°.\nWhat is the other?`,
      options: numericOptions(180 - a, 4, 10, 15),
      correctAnswer: 180 - a,
      explanation: `Supplementary angles add to 180°. 180 − ${a} = ${180 - a}°.`,
    };
  }
  if (type === 1) {
    const a = rand(15, 75);
    return {
      question: `Two angles are complementary.\nOne angle is ${a}°.\nWhat is the other?`,
      options: numericOptions(90 - a, 4, 5, 10),
      correctAnswer: 90 - a,
      explanation: `Complementary angles add to 90°. 90 − ${a} = ${90 - a}°.`,
    };
  }
  const a = rand(25, 155);
  return {
    question: `Two lines intersect.\nOne angle is ${a}°.\nWhat is the vertically opposite angle?`,
    options: numericOptions(a, 4, 10, 15),
    correctAnswer: a,
    explanation: `Vertically opposite angles are equal. Both = ${a}°.`,
  };
}

function p4l9(): Problem {
  // Triangle angle properties
  const variant = rand(0, 2);
  if (variant === 0) {
    let a = rand(35, 75), b = rand(35, 75);
    let c = 180 - a - b;
    if (c < 15) { a = 55; b = 65; c = 60; }
    return {
      question: `A triangle has angles ${a}° and ${b}°.\nWhat is the third angle?`,
      options: numericOptions(c, 4, 10, 15),
      correctAnswer: c,
      explanation: `Angles in a triangle sum to 180°. 180 − ${a} − ${b} = ${c}°.`,
    };
  }
  if (variant === 1) {
    const apex = rand(2, 10) * 10; // 20–100, multiples of 10 → integer base
    const base = (180 - apex) / 2;
    return {
      question: `An isosceles triangle has apex angle ${apex}°.\nWhat is each base angle?`,
      options: numericOptions(base, 4, 10, 10),
      correctAnswer: base,
      explanation: `Base angles are equal: (180 − ${apex}) ÷ 2 = ${base}°.`,
    };
  }
  const a = rand(30, 70), b = rand(30, 70);
  return {
    question: `A triangle has two angles: ${a}° and ${b}°.\nWhat is the exterior angle at the third vertex?`,
    options: numericOptions(a + b, 4, 30, 15),
    correctAnswer: a + b,
    explanation: `Exterior angle = sum of the two non-adjacent angles = ${a} + ${b} = ${a + b}°.`,
  };
}

function p4l10(): Problem {
  // BOSS: Combined geometry
  const variant = rand(0, 2);
  if (variant === 0) {
    const l = rand(3, 8), w = rand(2, 6), h = rand(2, 5);
    const vol = l * w * h;
    const price = rand(2, 8) * 5;
    return {
      question: `A room: ${l}m × ${w}m × ${h}m.\nSoil costs R${price}/m³.\nCost to fill it?`,
      options: numericOptions(vol * price, 4, 0, Math.max(price * 2, Math.round(vol * price * 0.15))),
      correctAnswer: vol * price,
      explanation: `Volume = ${l}×${w}×${h} = ${vol} m³. Cost = ${vol} × R${price} = R${vol * price}.`,
    };
  }
  if (variant === 1) {
    let a = rand(40, 70), b = rand(30, 60);
    let c = 180 - a - b;
    if (c < 15) { a = 60; b = 55; c = 65; }
    return {
      question: `A triangle has angles ${a}° and ${b}°.\nWhat is the supplement of the third angle?`,
      options: numericOptions(180 - c, 4, 20, 15),
      correctAnswer: 180 - c,
      explanation: `Third angle = 180−${a}−${b} = ${c}°. Supplement = 180−${c} = ${180 - c}°.`,
    };
  }
  const l = rand(3, 7), w = rand(2, 5), h = rand(2, 4);
  const sa = 2 * (l * w + l * h + w * h);
  return {
    question: `Wrap a gift: ${l}cm × ${w}cm × ${h}cm.\nSurface area of paper needed (cm²)?`,
    options: numericOptions(sa, 4, 0, Math.max(15, Math.round(sa * 0.15))),
    correctAnswer: sa,
    explanation: `SA = 2(${l*w} + ${l*h} + ${w*h}) = ${sa} cm².`,
  };
}

// ── World 3: The Summit Academy ───────────────────────────────────────────────

function p4l11(): Problem {
  // Simple probability
  const variant = rand(0, 2);
  if (variant === 0) {
    const red = rand(2, 5), blue = rand(2, 5), total = red + blue;
    const ans = fractionStr(red, total);
    const wrongs = [fractionStr(blue, total), fractionStr(red, total + 1), fractionStr(red + 1, total)].filter(w => w !== ans);
    while (wrongs.length < 3) wrongs.push(fractionStr(rand(1, total - 1), total + 1));
    return {
      question: `A bag has ${red} red and ${blue} blue balls.\nP(picking red) = ?`,
      options: shuffle([ans, ...wrongs.slice(0, 3)]),
      correctAnswer: ans,
      explanation: `P = favourable ÷ total = ${red} ÷ ${total} = ${ans}.`,
    };
  }
  if (variant === 1) {
    const favorable = rand(1, 3);
    const label = favorable === 1 ? 'a 1' : favorable === 2 ? 'a 1 or 2' : 'a 1, 2 or 3';
    const ans = fractionStr(favorable, 6);
    const wrongs = [fractionStr(6 - favorable, 6), fractionStr(favorable, 7), fractionStr(favorable + 1, 6)].filter(w => w !== ans);
    return {
      question: `A die is rolled.\nP(getting ${label}) = ?`,
      options: shuffle([ans, ...wrongs.slice(0, 3)]),
      correctAnswer: ans,
      explanation: `P = ${favorable} out of 6 = ${ans}.`,
    };
  }
  const red = rand(2, 5), total = rand(red + 2, red + 5);
  const ans = fractionStr(total - red, total);
  const wrongs = [fractionStr(red, total), fractionStr(total - red, total + 1), fractionStr(total - red - 1, total)].filter(w => w !== ans);
  while (wrongs.length < 3) wrongs.push(fractionStr(rand(1, total - 1), total));
  return {
    question: `A bag has ${red} red balls out of ${total} total.\nP(NOT picking red) = ?`,
    options: shuffle([ans, ...wrongs.slice(0, 3)]),
    correctAnswer: ans,
    explanation: `P(not red) = ${total - red} ÷ ${total} = ${ans}.`,
  };
}

function p4l12(): Problem {
  // Algebraic expressions: expand and simplify
  const variant = rand(0, 2);
  if (variant === 0) {
    const a = rand(2, 6), b = rand(2, 8), c = rand(2, 8);
    const ans = `${a * b} + ${a * c}`;
    return {
      question: `Expand: ${a}(${b} + ${c})`,
      options: shuffle([ans, `${a + b} + ${a + c}`, `${a * b} + ${c}`, `${a * (b + c)}`]),
      correctAnswer: ans,
      explanation: `${a}×${b} + ${a}×${c} = ${a*b} + ${a*c}.`,
    };
  }
  if (variant === 1) {
    const a = rand(2, 6), b = rand(5, 12), c = rand(2, b - 2);
    const ans = `${a * b} − ${a * c}`;
    return {
      question: `Expand: ${a}(${b} − ${c})`,
      options: shuffle([ans, `${a + b} − ${a + c}`, `${a * b} − ${c}`, `${a * (b - c)}`]),
      correctAnswer: ans,
      explanation: `${a}×${b} − ${a}×${c} = ${a*b} − ${a*c}.`,
    };
  }
  const a = rand(2, 7), b = rand(2, 7);
  const ans = `${a + b}x`;
  return {
    question: `Simplify: ${a}x + ${b}x`,
    options: shuffle([ans, `${a * b}x`, `${Math.abs(a - b)}x`, `${a + b + 1}x`]),
    correctAnswer: ans,
    explanation: `Collect like terms: (${a} + ${b})x = ${a + b}x.`,
  };
}

function p4l13(): Problem {
  // Linear equations with variables on both sides
  const variant = rand(0, 2);
  if (variant === 0) {
    const x = rand(2, 8), a = rand(3, 7), c = rand(1, a - 1), b = rand(2, 10);
    const d = (a - c) * x + b;
    return {
      question: `${a}x + ${b} = ${c}x + ${d}\nWhat is x?`,
      options: numericOptions(x, 4, 1, 3),
      correctAnswer: x,
      explanation: `${a}x − ${c}x = ${d} − ${b}. ${a - c}x = ${d - b}. x = ${x}.`,
    };
  }
  if (variant === 1) {
    const x = rand(3, 10), a = rand(3, 7), c = rand(1, a - 1), b = rand(2, 8);
    const d = (a - c) * x - b;
    if (d < 1) return p4l13();
    return {
      question: `${a}x − ${b} = ${c}x + ${d}\nWhat is x?`,
      options: numericOptions(x, 4, 1, 3),
      correctAnswer: x,
      explanation: `${a}x − ${c}x = ${d} + ${b}. ${a - c}x = ${d + b}. x = ${x}.`,
    };
  }
  const a = rand(2, 5), x = rand(2, 9) * a, b = rand(2, 8);
  const c = x / a + b;
  return {
    question: `x ÷ ${a} + ${b} = ${c}\nWhat is x?`,
    options: numericOptions(x, 4, 1, a * 2),
    correctAnswer: x,
    explanation: `x ÷ ${a} = ${c} − ${b} = ${c - b}. x = ${c - b} × ${a} = ${x}.`,
  };
}

function p4l14(): Problem {
  // Arithmetic sequences
  const variant = rand(0, 2);
  if (variant === 0) {
    const a = rand(2, 10), d = rand(2, 8);
    const seq = [a, a + d, a + 2 * d, a + 3 * d];
    const next = a + 4 * d;
    return {
      question: `What comes next?\n${seq.join(', ')}, ?`,
      options: numericOptions(next, 4, a, d * 2),
      correctAnswer: next,
      explanation: `Common difference = ${d}. Next = ${seq[3]} + ${d} = ${next}.`,
    };
  }
  if (variant === 1) {
    const a = rand(1, 8), d = rand(2, 7), n = rand(5, 10);
    const ans = a + (n - 1) * d;
    return {
      question: `Sequence starts at ${a}, increases by ${d} each time.\nWhat is term number ${n}?`,
      options: numericOptions(ans, 4, 0, d * 2),
      correctAnswer: ans,
      explanation: `Term n = ${a} + (n−1) × ${d}. Term ${n} = ${a} + ${(n - 1) * d} = ${ans}.`,
    };
  }
  const a = rand(3, 8), d = rand(3, 9);
  const seq5 = [a, a + d, a + 2 * d, a + 3 * d, a + 4 * d];
  const missingIdx = rand(1, 3);
  const missing = seq5[missingIdx];
  const display = seq5.map((v, i) => (i === missingIdx ? '?' : String(v)));
  return {
    question: `Find the missing term:\n${display.join(', ')}`,
    options: numericOptions(missing, 4, 0, d * 2),
    correctAnswer: missing,
    explanation: `Common difference = ${d}. Missing = ${seq5[missingIdx - 1]} + ${d} = ${missing}.`,
  };
}

function p4l15(): Problem {
  // FINAL BOSS — synthesis of all three worlds
  const variant = rand(0, 2);
  if (variant === 0) {
    const l = rand(3, 7), w = rand(2, 5), h = rand(2, 4);
    const vol = l * w * h;
    const price = rand(2, 8) * 5;
    return {
      question: `A pool: ${l}m × ${w}m × ${h}m.\nWater costs R${price}/m³.\nTotal fill cost?`,
      options: numericOptions(vol * price, 4, 0, Math.max(price * 2, Math.round(vol * price * 0.15))),
      correctAnswer: vol * price,
      explanation: `Volume = ${vol} m³. Cost = ${vol} × R${price} = R${vol * price}.`,
    };
  }
  if (variant === 1) {
    const red = rand(3, 6), total = rand(red + 2, red + 6);
    const pct = Math.round((red / total) * 100);
    return {
      question: `Bag: ${red} red balls out of ${total} total.\nApprox % chance of picking red?`,
      options: numericOptions(pct, 4, 5, 15),
      correctAnswer: pct,
      explanation: `P(red) = ${red} ÷ ${total} ≈ ${pct}%.`,
    };
  }
  const a = rand(2, 5), d = rand(3, 7), n = rand(6, 10);
  const target = a + (n - 1) * d;
  return {
    question: `Sequence: ${a}, ${a + d}, ${a + 2 * d}, …\nWhich term number equals ${target}?`,
    options: numericOptions(n, 4, 1, 3),
    correctAnswer: n,
    explanation: `nth term = ${a} + (n−1)×${d} = ${target}. n−1 = ${n - 1}. n = ${n}.`,
  };
}

// PHASE 5 — Secondary (Ages 13–14) — CAPS Grade 8–9
// World 1: The Iron Citadel   (algebra)           — levels  1–5
// World 2: The Storm Fortress (geometry)           — levels  6–10
// World 3: The Oracle's Nexus (data & science)    — levels 11–15

// ── World 1: The Iron Citadel ─────────────────────────────────────────────────

function p5l1(): Problem {
  // Algebraic substitution — evaluate expression for given x
  const variant = rand(0, 2);
  if (variant === 0) {
    const a = rand(2, 8), b = rand(1, 12), x = rand(2, 7);
    const ans = a * x + b;
    return {
      question: `If x = ${x}, find ${a}x + ${b}.`,
      options: numericOptions(ans, 4, 0, Math.max(8, Math.round(ans * 0.15))),
      correctAnswer: ans,
      explanation: `Substitute x = ${x}: ${a}(${x}) + ${b} = ${a * x} + ${b} = ${ans}.`,
    };
  }
  if (variant === 1) {
    const a = rand(2, 5), b = rand(1, 8), x = rand(2, 5);
    const ans = a * x * x + b;
    return {
      question: `If x = ${x}, find ${a}x² + ${b}.`,
      options: numericOptions(ans, 4, 0, Math.max(10, Math.round(ans * 0.15))),
      correctAnswer: ans,
      explanation: `${a}(${x})² + ${b} = ${a * x * x} + ${b} = ${ans}.`,
    };
  }
  const a = rand(2, 6), b = rand(2, 5), x = rand(2, 5);
  const ans = a * x * x - b * x;
  if (ans <= 0) return p5l1();
  return {
    question: `If x = ${x}, find ${a}x² − ${b}x.`,
    options: numericOptions(ans, 4, 0, Math.max(10, Math.round(ans * 0.15))),
    correctAnswer: ans,
    explanation: `${a}(${x})² − ${b}(${x}) = ${a * x * x} − ${b * x} = ${ans}.`,
  };
}

function p5l2(): Problem {
  // Expand double brackets (x + a)(x + b) = x² + (a+b)x + ab
  const a = rand(1, 7), b = rand(1, 7);
  const s = a + b, p = a * b;
  const ans = `x² + ${s}x + ${p}`;
  return {
    question: `Expand: (x + ${a})(x + ${b})`,
    options: shuffle([ans, `x² + ${p}x + ${s}`, `x² + ${s}x + ${p + 1}`, `x² + ${s + 1}x + ${p}`]),
    correctAnswer: ans,
    explanation: `FOIL: x² + ${b}x + ${a}x + ${p} = x² + ${s}x + ${p}.`,
  };
}

function p5l3(): Problem {
  // Factorising: common factor or difference of two squares
  const variant = rand(0, 2);
  if (variant === 0) {
    // ax + ac = a(x + c)
    const a = rand(2, 6), c = rand(2, 8);
    const ac = a * c;
    const ans = `${a}(x + ${c})`;
    return {
      question: `Factorise: ${a}x + ${ac}`,
      options: shuffle([ans, `${a}(x + ${c + 1})`, `${a - 1}(x + ${c})`, `${a}(x + ${ac})`]),
      correctAnswer: ans,
      explanation: `HCF is ${a}. ${a}x + ${ac} = ${a}(x + ${c}).`,
    };
  }
  if (variant === 1) {
    // abx + ac = a(bx + c)
    const a = rand(2, 5), b = rand(2, 5), c = rand(2, 6);
    const ab = a * b, ac = a * c;
    const ans = `${a}(${b}x + ${c})`;
    return {
      question: `Factorise: ${ab}x + ${ac}`,
      options: shuffle([ans, `${a}(${b + 1}x + ${c})`, `${a - 1}(${b}x + ${c})`, `${a}(${b}x + ${c + 1})`]),
      correctAnswer: ans,
      explanation: `HCF is ${a}. ${ab}x + ${ac} = ${a}(${b}x + ${c}).`,
    };
  }
  // Difference of two squares: x² − n² = (x+n)(x−n)
  const squares = [
    { expr: 'x² − 4',  ans: '(x + 2)(x − 2)', wrongs: ['(x + 2)²', '(x − 2)²', '(x + 4)(x − 1)'] },
    { expr: 'x² − 9',  ans: '(x + 3)(x − 3)', wrongs: ['(x + 3)²', '(x − 3)²', '(x + 9)(x − 1)'] },
    { expr: 'x² − 16', ans: '(x + 4)(x − 4)', wrongs: ['(x + 4)²', '(x − 4)²', '(x + 8)(x − 2)'] },
    { expr: 'x² − 25', ans: '(x + 5)(x − 5)', wrongs: ['(x + 5)²', '(x − 5)²', '(x + 25)(x − 1)'] },
  ];
  const sq = squares[rand(0, squares.length - 1)];
  return {
    question: `Factorise: ${sq.expr}`,
    options: shuffle([sq.ans, ...sq.wrongs]),
    correctAnswer: sq.ans,
    explanation: `Difference of squares: a² − b² = (a+b)(a−b). ${sq.expr} = ${sq.ans}.`,
  };
}

function p5l4(): Problem {
  // Equations with brackets or fractions
  const variant = rand(0, 2);
  if (variant === 0) {
    // (ax + b) / c = d  →  ax = cd − b  →  x = (cd−b)/a
    const a = rand(2, 4), c = rand(2, 5), d = rand(3, 9), b = rand(1, 8);
    const num = c * d - b;
    if (num <= 0 || num % a !== 0) return p5l4();
    const x = num / a;
    return {
      question: `(${a}x + ${b}) ÷ ${c} = ${d}\nWhat is x?`,
      options: numericOptions(x, 4, 1, 4),
      correctAnswer: x,
      explanation: `${a}x + ${b} = ${c * d}. ${a}x = ${num}. x = ${x}.`,
    };
  }
  if (variant === 1) {
    // a(x + b) = c  →  x = c/a − b
    const a = rand(2, 5), b = rand(2, 8), x = rand(2, 10);
    const c = a * (x + b);
    return {
      question: `${a}(x + ${b}) = ${c}\nWhat is x?`,
      options: numericOptions(x, 4, 1, 4),
      correctAnswer: x,
      explanation: `x + ${b} = ${c} ÷ ${a} = ${c / a}. x = ${c / a} − ${b} = ${x}.`,
    };
  }
  // ax + b = cx + d with larger numbers
  const x = rand(3, 12), a = rand(4, 9), c = rand(1, a - 2), b = rand(2, 10);
  const d = (a - c) * x + b;
  return {
    question: `${a}x + ${b} = ${c}x + ${d}\nWhat is x?`,
    options: numericOptions(x, 4, 1, 4),
    correctAnswer: x,
    explanation: `${a - c}x = ${d - b}. x = ${d - b} ÷ ${a - c} = ${x}.`,
  };
}

function p5l5(): Problem {
  // BOSS: Combined algebra — substitution into expanded/factorised form
  const variant = rand(0, 2);
  if (variant === 0) {
    const a = rand(2, 5), b = rand(1, 8), c = rand(2, 6), x = rand(2, 5);
    const ans = a * x * x + b * x + c;
    return {
      question: `If x = ${x}, find ${a}x² + ${b}x + ${c}.`,
      options: numericOptions(ans, 4, 0, Math.max(12, Math.round(ans * 0.15))),
      correctAnswer: ans,
      explanation: `${a}(${x})² + ${b}(${x}) + ${c} = ${a * x * x} + ${b * x} + ${c} = ${ans}.`,
    };
  }
  if (variant === 1) {
    // Solve then substitute
    const a = rand(3, 7), b = rand(2, 10), x = rand(2, 8);
    const c = a * x + b;
    const ansExpr = 2 * x + 1;
    return {
      question: `${a}x + ${b} = ${c}. Find 2x + 1.`,
      options: numericOptions(ansExpr, 4, 1, 4),
      correctAnswer: ansExpr,
      explanation: `x = (${c} − ${b}) ÷ ${a} = ${x}. Then 2(${x}) + 1 = ${ansExpr}.`,
    };
  }
  const a = rand(2, 6), b = rand(2, 8), c = a + b, p = a * b;
  const x = rand(2, 5);
  const ans = x * x + c * x + p;
  return {
    question: `(x + ${a})(x + ${b}) for x = ${x}.\nWhat is the value?`,
    options: numericOptions(ans, 4, 0, Math.max(10, Math.round(ans * 0.15))),
    correctAnswer: ans,
    explanation: `Expand: x² + ${c}x + ${p}. At x = ${x}: ${x * x} + ${c * x} + ${p} = ${ans}.`,
  };
}

// ── World 2: The Storm Fortress ───────────────────────────────────────────────

function p5l6(): Problem {
  // Pythagoras — find the hypotenuse
  const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15],[7,24,25]];
  const [a, b, c] = triples[rand(0, triples.length - 1)];
  return {
    question: `A right triangle has legs ${a} cm and ${b} cm.\nFind the hypotenuse.`,
    options: numericOptions(c, 4, c - 4, 4),
    correctAnswer: c,
    explanation: `Pythagoras: c² = ${a}² + ${b}² = ${a*a} + ${b*b} = ${c*c}. c = √${c*c} = ${c} cm.`,
  };
}

function p5l7(): Problem {
  // Pythagoras — find the shorter side
  const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15],[7,24,25]];
  const [a, b, c] = triples[rand(0, triples.length - 1)];
  const findA = Math.random() < 0.5;
  const known = findA ? b : a;
  const ans   = findA ? a : b;
  return {
    question: `A right triangle has hypotenuse ${c} cm and one leg ${known} cm.\nFind the other leg.`,
    options: numericOptions(ans, 4, ans - 4, 4),
    correctAnswer: ans,
    explanation: `a² = c² − b² = ${c*c} − ${known*known} = ${ans*ans}. a = √${ans*ans} = ${ans} cm.`,
  };
}

function p5l8(): Problem {
  // Parallel line angle relationships
  const variant = rand(0, 2);
  const angle = rand(35, 145);
  if (variant === 0) {
    return {
      question: `Two parallel lines are cut by a transversal.\nOne angle is ${angle}°.\nWhat is the corresponding angle?`,
      options: numericOptions(angle, 4, 10, 15),
      correctAnswer: angle,
      explanation: `Corresponding angles are equal when lines are parallel. Both = ${angle}°.`,
    };
  }
  if (variant === 1) {
    return {
      question: `Two parallel lines are cut by a transversal.\nOne angle is ${angle}°.\nWhat is the alternate interior angle?`,
      options: numericOptions(angle, 4, 10, 15),
      correctAnswer: angle,
      explanation: `Alternate interior angles are equal. Both = ${angle}°.`,
    };
  }
  const coInt = 180 - angle;
  return {
    question: `Two parallel lines are cut by a transversal.\nOne angle is ${angle}°.\nWhat is the co-interior angle?`,
    options: numericOptions(coInt, 4, 10, 15),
    correctAnswer: coInt,
    explanation: `Co-interior angles add to 180°. ${angle}° + ? = 180°. ? = ${coInt}°.`,
  };
}

function p5l9(): Problem {
  // Gradient of a straight line through two points
  const variant = rand(0, 1);
  if (variant === 0) {
    // Two points, find gradient m = (y2-y1)/(x2-x1)
    const x1 = 0, x2 = rand(2, 6);
    const m  = rand(1, 5);
    const y1 = rand(0, 5), y2 = y1 + m * x2;
    return {
      question: `A line passes through (${x1}, ${y1}) and (${x2}, ${y2}).\nWhat is the gradient?`,
      options: numericOptions(m, 4, 1, 3),
      correctAnswer: m,
      explanation: `m = (y₂ − y₁) ÷ (x₂ − x₁) = (${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${y2-y1} ÷ ${x2} = ${m}.`,
    };
  }
  // y = mx + c — find y for given x
  const m = rand(2, 5), c = rand(1, 8), x = rand(1, 6);
  const y = m * x + c;
  return {
    question: `Line: y = ${m}x + ${c}.\nWhat is y when x = ${x}?`,
    options: numericOptions(y, 4, 0, Math.max(6, Math.round(y * 0.15))),
    correctAnswer: y,
    explanation: `y = ${m}(${x}) + ${c} = ${m * x} + ${c} = ${y}.`,
  };
}

function p5l10(): Problem {
  // BOSS: Combined geometry — Pythagoras + angles
  const variant = rand(0, 2);
  if (variant === 0) {
    const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17]];
    const [a, b, c] = triples[rand(0, triples.length - 1)];
    const pricePerCm = rand(2, 5) * 10;
    return {
      question: `A right triangle: legs ${a} m and ${b} m.\nFencing costs R${pricePerCm}/m.\nCost to fence the hypotenuse?`,
      options: numericOptions(c * pricePerCm, 4, 0, pricePerCm * 2),
      correctAnswer: c * pricePerCm,
      explanation: `Hypotenuse = ${c} m. Cost = ${c} × R${pricePerCm} = R${c * pricePerCm}.`,
    };
  }
  if (variant === 1) {
    const angle = rand(35, 80);
    const alt   = angle;
    const coInt = 180 - angle;
    const useAlt = Math.random() < 0.5;
    return {
      question: `Parallel lines, transversal crosses at ${angle}°.\nFind the co-interior angle.`,
      options: numericOptions(coInt, 4, 10, 15),
      correctAnswer: coInt,
      explanation: `Co-interior angles sum to 180°. 180 − ${angle} = ${coInt}°.`,
    };
  }
  const m = rand(2, 5), c = rand(1, 8);
  const x1 = rand(1, 4), x2 = x1 + rand(2, 4);
  const y1 = m * x1 + c, y2 = m * x2 + c;
  return {
    question: `Line y = ${m}x + ${c}.\nWhat is the gradient between\n(${x1}, ${y1}) and (${x2}, ${y2})?`,
    options: numericOptions(m, 4, 1, 3),
    correctAnswer: m,
    explanation: `m = (${y2}−${y1}) ÷ (${x2}−${x1}) = ${y2-y1} ÷ ${x2-x1} = ${m}.`,
  };
}

// ── World 3: The Oracle's Nexus ───────────────────────────────────────────────

function p5l11(): Problem {
  // Scientific notation — large numbers only (Grade 8)
  const mantissas = [1.2, 1.5, 2.0, 2.4, 3.0, 3.5, 4.0, 5.0, 6.0, 7.5, 8.0, 9.0];
  const m = mantissas[rand(0, mantissas.length - 1)];
  const exp = rand(3, 8);
  const formatted = m % 1 === 0 ? String(m) : m.toFixed(1);
  const ans = `${formatted} × 10^${exp}`;
  const w1  = `${formatted} × 10^${exp + 1}`;
  const w2  = `${formatted} × 10^${exp - 1}`;
  const m2  = mantissas.filter(v => v !== m)[rand(0, mantissas.length - 2)];
  const m2f = m2 % 1 === 0 ? String(m2) : m2.toFixed(1);
  const w3  = `${m2f} × 10^${exp}`;
  // Build the display number
  const fullNum = (m * Math.pow(10, exp)).toLocaleString('en-ZA');
  return {
    question: `Write ${fullNum} in scientific notation.`,
    options: shuffle([ans, w1, w2, w3]),
    correctAnswer: ans,
    explanation: `Move decimal to get ${formatted}. Count ${exp} places → ${formatted} × 10^${exp}.`,
  };
}

function p5l12(): Problem {
  // Integer operations with negatives
  const variant = rand(0, 3);
  if (variant === 0) {
    const a = rand(2, 9), b = rand(2, 9);
    return {
      question: `(−${a}) × (−${b}) = ?`,
      options: numericOptions(a * b, 4, 0, Math.max(8, Math.round(a * b * 0.2))),
      correctAnswer: a * b,
      explanation: `Negative × negative = positive. (−${a}) × (−${b}) = +${a * b}.`,
    };
  }
  if (variant === 1) {
    const a = rand(2, 9), b = rand(2, 9);
    return {
      question: `(−${a}) × ${b} = ?`,
      options: shuffle([-(a * b), a * b, a - b, a + b]),
      correctAnswer: -(a * b),
      explanation: `Negative × positive = negative. (−${a}) × ${b} = −${a * b}.`,
    };
  }
  if (variant === 2) {
    const a = rand(3, 12), b = rand(2, 6);
    return {
      question: `${a} − (−${b}) = ?`,
      options: numericOptions(a + b, 4, 0, 5),
      correctAnswer: a + b,
      explanation: `Subtracting a negative = adding. ${a} − (−${b}) = ${a} + ${b} = ${a + b}.`,
    };
  }
  const a = rand(2, 7), b = rand(2, 7);
  const ans = -(a + b);
  return {
    question: `−${a} + (−${b}) = ?`,
    options: shuffle([ans, a + b, a - b, -(a - b)]),
    correctAnswer: ans,
    explanation: `Both negative: −${a} + (−${b}) = −(${a} + ${b}) = −${a + b}.`,
  };
}

function p5l13(): Problem {
  // Probability: complementary, simple combined
  const variant = rand(0, 2);
  if (variant === 0) {
    // Complementary: P(not A) = 1 − P(A)
    const num = rand(1, 4), den = rand(num + 1, 8);
    const compStr = fractionStr(den - num, den);
    const origStr = fractionStr(num, den);
    return {
      question: `P(event A) = ${origStr}.\nWhat is P(not A)?`,
      options: shuffle([compStr, origStr, fractionStr(num + 1, den), fractionStr(den - num - 1, den)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)),
      correctAnswer: compStr,
      explanation: `P(not A) = 1 − P(A) = 1 − ${origStr} = ${compStr}.`,
    };
  }
  if (variant === 1) {
    // P(A and B) for independent events
    const pA = [1, 1, 1, 2, 3].map((n, _, arr) => fractionStr(n, arr.length));
    const num1 = rand(1, 3), den1 = rand(num1 + 1, 6);
    const num2 = rand(1, 3), den2 = rand(num2 + 1, 6);
    const numAns = num1 * num2, denAns = den1 * den2;
    const ansStr = fractionStr(numAns, denAns);
    const w1 = fractionStr(num1 + num2, den1 + den2);
    const w2 = fractionStr(numAns + 1, denAns);
    const w3 = fractionStr(numAns, denAns + den1);
    return {
      question: `P(A) = ${fractionStr(num1, den1)}, P(B) = ${fractionStr(num2, den2)}.\nA and B are independent.\nP(A and B) = ?`,
      options: shuffle([ansStr, w1, w2, w3].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)),
      correctAnswer: ansStr,
      explanation: `P(A and B) = P(A) × P(B) = ${fractionStr(num1, den1)} × ${fractionStr(num2, den2)} = ${ansStr}.`,
    };
  }
  // Expected frequency: P × trials
  const num = rand(1, 4), den = rand(num + 2, 8);
  const trials = rand(2, 8) * den;
  const expected = (num / den) * trials;
  return {
    question: `P(event) = ${fractionStr(num, den)}.\nIn ${trials} trials, expected frequency?`,
    options: numericOptions(expected, 4, 0, Math.max(4, Math.round(expected * 0.2))),
    correctAnswer: expected,
    explanation: `Expected = P × trials = ${fractionStr(num, den)} × ${trials} = ${expected}.`,
  };
}

function p5l14(): Problem {
  // Data: quartiles, range, interquartile range
  const variant = rand(0, 2);
  if (variant === 0) {
    // Median of 7 values
    const base = rand(3, 8), d = rand(2, 5);
    const vals = [base, base+d, base+2*d, base+3*d, base+4*d, base+5*d, base+6*d];
    const median = vals[3];
    const display = shuffle([...vals]).join(', ');
    return {
      question: `Find the MEDIAN of:\n${display}`,
      options: numericOptions(median, 4, base, d * 2),
      correctAnswer: median,
      explanation: `Sort: ${vals.join(', ')}. Middle value (4th of 7) = ${median}.`,
    };
  }
  if (variant === 1) {
    // IQR = Q3 − Q1
    const base = rand(2, 6), d = rand(3, 7);
    const vals = [base, base+d, base+2*d, base+3*d, base+4*d, base+5*d, base+6*d, base+7*d];
    const q1 = vals[1], q3 = vals[5], iqr = q3 - q1;
    return {
      question: `Data (sorted): ${vals.join(', ')}.\nFind the interquartile range (Q3 − Q1).`,
      options: numericOptions(iqr, 4, 0, d * 2),
      correctAnswer: iqr,
      explanation: `Q1 = ${q1} (2nd value), Q3 = ${q3} (6th value). IQR = ${q3} − ${q1} = ${iqr}.`,
    };
  }
  // Range of a dataset
  const n = rand(5, 8);
  const vals = Array.from({length: n}, () => rand(5, 40));
  const range = Math.max(...vals) - Math.min(...vals);
  return {
    question: `Find the RANGE of:\n${vals.join(', ')}`,
    options: numericOptions(range, 4, 0, Math.max(6, Math.round(range * 0.2))),
    correctAnswer: range,
    explanation: `Range = max − min = ${Math.max(...vals)} − ${Math.min(...vals)} = ${range}.`,
  };
}

function p5l15(): Problem {
  // FINAL BOSS — synthesis: algebra + geometry + data
  const variant = rand(0, 2);
  if (variant === 0) {
    // Pythagoras + cost
    const triples = [[3,4,5],[5,12,13],[6,8,10]];
    const [a, b, c] = triples[rand(0, triples.length - 1)];
    const price = rand(3, 8) * 10;
    return {
      question: `Right triangle: legs ${a} m, ${b} m.\nRope along hypotenuse costs R${price}/m.\nTotal cost?`,
      options: numericOptions(c * price, 4, 0, price * 2),
      correctAnswer: c * price,
      explanation: `Hypotenuse = ${c} m. Cost = ${c} × R${price} = R${c * price}.`,
    };
  }
  if (variant === 1) {
    // Substitution into expanded expression
    const a = rand(2, 4), b = rand(2, 5), x = rand(3, 6);
    const ans = (x + a) * (x + b);
    return {
      question: `Evaluate (x + ${a})(x + ${b}) for x = ${x}.`,
      options: numericOptions(ans, 4, 0, Math.max(10, Math.round(ans * 0.15))),
      correctAnswer: ans,
      explanation: `(${x} + ${a})(${x} + ${b}) = ${x + a} × ${x + b} = ${ans}.`,
    };
  }
  // Probability × expected frequency
  const num = rand(1, 3), den = rand(num + 2, 6);
  const trials = rand(3, 8) * den;
  const expected = (num / den) * trials;
  return {
    question: `P(win) = ${fractionStr(num, den)}.\nIn ${trials} games, how many expected wins?`,
    options: numericOptions(expected, 4, 0, Math.max(4, Math.round(expected * 0.2))),
    correctAnswer: expected,
    explanation: `Expected wins = ${fractionStr(num, den)} × ${trials} = ${expected}.`,
  };
}

// PHASE 6 — Age 14
// World 1: The Algebra Lab     (advanced algebra)     — levels  1–5
// World 2: The Proof Chamber   (transformations)      — levels  6–10
// World 3: The Data Observatory (data & finance)      — levels 11–15

// ── World 1: The Algebra Lab ──────────────────────────────────────────────────

function p6l1(): Problem {
  // Exponent laws: product, quotient, power
  const variant = rand(0, 2);
  if (variant === 0) {
    const base = rand(2, 5), m = rand(2, 5), n = rand(2, 5);
    return {
      question: `Simplify: ${base}^${m} × ${base}^${n} = ${base}^?`,
      options: numericOptions(m + n, 4, 2, 3),
      correctAnswer: m + n,
      explanation: `Product law: a^m × a^n = a^(m+n). ${base}^${m} × ${base}^${n} = ${base}^${m + n}.`,
    };
  }
  if (variant === 1) {
    const base = rand(2, 5), n = rand(1, 3), ans = rand(n + 1, n + 4);
    return {
      question: `Simplify: ${base}^${ans + n} ÷ ${base}^${n} = ${base}^?`,
      options: numericOptions(ans, 4, 1, 3),
      correctAnswer: ans,
      explanation: `Quotient law: a^m ÷ a^n = a^(m−n). ${base}^${ans + n} ÷ ${base}^${n} = ${base}^${ans}.`,
    };
  }
  const base = rand(2, 4), m = rand(2, 4), n = rand(2, 3);
  return {
    question: `Simplify: (${base}^${m})^${n} = ${base}^?`,
    options: numericOptions(m * n, 4, 2, 3),
    correctAnswer: m * n,
    explanation: `Power law: (a^m)^n = a^(m×n). (${base}^${m})^${n} = ${base}^${m * n}.`,
  };
}

function p6l2(): Problem {
  // Negative and zero exponents
  const variant = rand(0, 2);
  if (variant === 0) {
    const base = rand(2, 12);
    return {
      question: `What is ${base}^0?`,
      options: shuffle([1, 0, base, base * base]),
      correctAnswer: 1,
      explanation: `Any non-zero number to the power 0 equals 1. ${base}^0 = 1.`,
    };
  }
  if (variant === 1) {
    const base = rand(2, 6);
    const ans = fractionStr(1, base);
    const wrongs = [fractionStr(1, base + 1), String(base), fractionStr(1, base - 1)].filter(w => w !== ans);
    return {
      question: `What is ${base}^(−1)?`,
      options: shuffle([ans, ...wrongs.slice(0, 3)]),
      correctAnswer: ans,
      explanation: `a^(−1) = 1/a. ${base}^(−1) = 1/${base} = ${ans}.`,
    };
  }
  const base = rand(2, 5);
  const ans = fractionStr(1, base * base);
  const wrongs = [fractionStr(1, base), String(base * base), fractionStr(1, base * base + 1)].filter(w => w !== ans);
  return {
    question: `What is ${base}^(−2)?`,
    options: shuffle([ans, ...wrongs.slice(0, 3)]),
    correctAnswer: ans,
    explanation: `a^(−2) = 1/a². ${base}^(−2) = 1/${base * base} = ${ans}.`,
  };
}

function p6l3(): Problem {
  // Trinomial factorising: x² + (a+b)x + ab = (x+a)(x+b)
  const pairs: [number, number][] = [
    [1,2],[1,3],[1,4],[1,5],[1,6],
    [2,3],[2,4],[2,5],[2,6],
    [3,4],[3,5],[3,6],[4,5],[4,6],
  ];
  const [a, b] = pairs[rand(0, pairs.length - 1)];
  const s = a + b, p = a * b;
  const ans = `(x + ${a})(x + ${b})`;
  return {
    question: `Factorise: x² + ${s}x + ${p}`,
    options: shuffle([ans, `(x + ${s})(x + ${p})`, `(x + ${a})(x + ${b + 1})`, `(x + ${a + 1})(x + ${b})`]),
    correctAnswer: ans,
    explanation: `Find two numbers that add to ${s} and multiply to ${p}: ${a} and ${b}. x² + ${s}x + ${p} = (x + ${a})(x + ${b}).`,
  };
}

function p6l4(): Problem {
  // Financial maths: VAT, hire purchase, discount
  const variant = rand(0, 2);
  if (variant === 0) {
    const excl = rand(4, 20) * 10;
    const vat = excl * 0.15;
    const incl = excl + vat;
    return {
      question: `Price excluding VAT: R${excl}.\nVAT is 15%.\nPrice including VAT?`,
      options: numericOptions(incl, 4, excl, Math.max(10, Math.round(incl * 0.1))),
      correctAnswer: incl,
      explanation: `VAT = 15% × R${excl} = R${vat}. Total = R${excl} + R${vat} = R${incl}.`,
    };
  }
  if (variant === 1) {
    const excl = rand(4, 20) * 10;
    const incl = excl * 1.15;
    return {
      question: `Price including 15% VAT: R${incl}.\nPrice EXCLUDING VAT?`,
      options: numericOptions(excl, 4, 0, Math.max(10, Math.round(excl * 0.1))),
      correctAnswer: excl,
      explanation: `Excl VAT = R${incl} ÷ 1.15 = R${excl}.`,
    };
  }
  const price = rand(5, 20) * 100;
  const pct = [10, 20, 25][rand(0, 2)];
  const deposit = (price * pct) / 100;
  return {
    question: `Item costs R${price}.\nPay ${pct}% deposit.\nWhat is the balance owing?`,
    options: numericOptions(price - deposit, 4, 0, Math.max(50, Math.round((price - deposit) * 0.1))),
    correctAnswer: price - deposit,
    explanation: `Deposit = ${pct}% × R${price} = R${deposit}. Balance = R${price} − R${deposit} = R${price - deposit}.`,
  };
}

function p6l5(): Problem {
  // BOSS: Combined algebra — exponents + trinomials + financial
  const variant = rand(0, 2);
  if (variant === 0) {
    const base = rand(2, 4), m = rand(2, 4), n = rand(2, 4);
    return {
      question: `${base}^${m} × ${base}^${n} = ${base}^?\nWhat is the missing exponent?`,
      options: numericOptions(m + n, 4, 2, 3),
      correctAnswer: m + n,
      explanation: `Product law: ${base}^${m} × ${base}^${n} = ${base}^${m + n}.`,
    };
  }
  if (variant === 1) {
    const pairs: [number, number][] = [[1,4],[2,3],[1,5],[2,5],[3,4]];
    const [a, b] = pairs[rand(0, pairs.length - 1)];
    const s = a + b, p = a * b;
    const ans = `(x + ${a})(x + ${b})`;
    return {
      question: `Factorise completely:\nx² + ${s}x + ${p}`,
      options: shuffle([ans, `(x + ${s})(x + ${p})`, `(x + ${a})(x + ${b + 1})`, `(x + ${a + 1})(x + ${b})`]),
      correctAnswer: ans,
      explanation: `${a} + ${b} = ${s} ✓ and ${a} × ${b} = ${p} ✓ → (x + ${a})(x + ${b}).`,
    };
  }
  const excl = rand(6, 16) * 10;
  const incl = excl * 1.15;
  return {
    question: `A jersey costs R${excl} excl VAT.\n15% VAT is added.\nWhat is the final price?`,
    options: numericOptions(incl, 4, excl, Math.max(10, Math.round(incl * 0.1))),
    correctAnswer: incl,
    explanation: `R${excl} × 1.15 = R${incl}.`,
  };
}

// ── World 2: The Proof Chamber ────────────────────────────────────────────────

function p6l6(): Problem {
  // Transformations: translation
  const x = rand(-4, 5), y = rand(-4, 5);
  const dx = rand(-4, 4), dy = rand(-4, 4);
  const nx = x + dx, ny = y + dy;
  const ans = `(${nx}, ${ny})`;
  const dxStr = dx >= 0 ? `+${dx}` : String(dx);
  const dyStr = dy >= 0 ? `+${dy}` : String(dy);
  return {
    question: `Point (${x}, ${y}) is translated by vector (${dxStr}, ${dyStr}).\nNew position?`,
    options: shuffle([ans, `(${x - dx}, ${ny})`, `(${nx}, ${y - dy})`, `(${x - dx}, ${y - dy})`]),
    correctAnswer: ans,
    explanation: `Add vector: (${x} ${dxStr}, ${y} ${dyStr}) = (${nx}, ${ny}).`,
  };
}

function p6l7(): Problem {
  // Transformations: reflection over axes and y = x
  const x = rand(-5, 5), y = rand(-5, 5);
  const variant = rand(0, 2);
  if (variant === 0) {
    const ans = `(${x}, ${-y})`;
    return {
      question: `Reflect (${x}, ${y}) over the x-axis.\nNew coordinates?`,
      options: shuffle([ans, `(${-x}, ${y})`, `(${-x}, ${-y})`, `(${y}, ${x})`]),
      correctAnswer: ans,
      explanation: `Reflection over x-axis: y changes sign. (${x}, ${y}) → (${x}, ${-y}).`,
    };
  }
  if (variant === 1) {
    const ans = `(${-x}, ${y})`;
    return {
      question: `Reflect (${x}, ${y}) over the y-axis.\nNew coordinates?`,
      options: shuffle([ans, `(${x}, ${-y})`, `(${-x}, ${-y})`, `(${y}, ${x})`]),
      correctAnswer: ans,
      explanation: `Reflection over y-axis: x changes sign. (${x}, ${y}) → (${-x}, ${y}).`,
    };
  }
  const ans = `(${y}, ${x})`;
  return {
    question: `Reflect (${x}, ${y}) over the line y = x.\nNew coordinates?`,
    options: shuffle([ans, `(${x}, ${y})`, `(${-y}, ${-x})`, `(${-x}, ${-y})`]),
    correctAnswer: ans,
    explanation: `Reflection over y = x: swap coordinates. (${x}, ${y}) → (${y}, ${x}).`,
  };
}

function p6l8(): Problem {
  // Transformations: rotation about origin
  const x = rand(1, 6), y = rand(1, 6);
  const variant = rand(0, 1);
  if (variant === 0) {
    // 90° clockwise: (x, y) → (y, −x)
    const ans = `(${y}, ${-x})`;
    return {
      question: `Rotate (${x}, ${y}) 90° clockwise about the origin.\nNew coordinates?`,
      options: shuffle([ans, `(${-y}, ${x})`, `(${-x}, ${-y})`, `(${y}, ${x})`]),
      correctAnswer: ans,
      explanation: `90° clockwise: (x, y) → (y, −x). (${x}, ${y}) → (${y}, ${-x}).`,
    };
  }
  // 180°: (x, y) → (−x, −y)
  const ans = `(${-x}, ${-y})`;
  return {
    question: `Rotate (${x}, ${y}) 180° about the origin.\nNew coordinates?`,
    options: shuffle([ans, `(${y}, ${-x})`, `(${-y}, ${x})`, `(${x}, ${y})`]),
    correctAnswer: ans,
    explanation: `180° rotation: (x, y) → (−x, −y). (${x}, ${y}) → (${-x}, ${-y}).`,
  };
}

function p6l9(): Problem {
  // Congruency conditions: SAS, SSS, AAS, RHS
  const conditions = [
    { name: 'SAS', scenario: 'Two triangles: sides 4 cm and 6 cm with an INCLUDED angle of 50°.' },
    { name: 'SSS', scenario: 'Two triangles: all three sides measure 3 cm, 5 cm, and 7 cm.' },
    { name: 'AAS', scenario: 'Two triangles: angles of 40° and 70°, and the side opposite 70° is 5 cm.' },
    { name: 'RHS', scenario: 'Two right-angled triangles: hypotenuse 10 cm, one leg 6 cm.' },
  ];
  const c = conditions[rand(0, conditions.length - 1)];
  return {
    question: `${c.scenario}\nWhich congruency condition applies?`,
    options: shuffle(['SAS', 'SSS', 'AAS', 'RHS']),
    correctAnswer: c.name,
    explanation: `${c.name} (${c.name === 'SAS' ? 'Side-Angle-Side' : c.name === 'SSS' ? 'Side-Side-Side' : c.name === 'AAS' ? 'Angle-Angle-Side' : 'Right angle-Hypotenuse-Side'}) matches the given information.`,
  };
}

function p6l10(): Problem {
  // BOSS: Combined transformations
  const x = rand(1, 5), y = rand(1, 5);
  const variant = rand(0, 2);
  if (variant === 0) {
    // Translate then reflect over x-axis
    const dx = rand(1, 4), dy = rand(1, 4);
    const tx = x + dx, ty = y + dy;
    const ans = `(${tx}, ${-ty})`;
    const dxStr = `+${dx}`, dyStr = `+${dy}`;
    return {
      question: `(${x}, ${y}): translate by (${dxStr}, ${dyStr}), then reflect over x-axis.\nFinal position?`,
      options: shuffle([ans, `(${tx}, ${ty})`, `(${-tx}, ${ty})`, `(${-tx}, ${-ty})`]),
      correctAnswer: ans,
      explanation: `Step 1: (${x}+${dx}, ${y}+${dy}) = (${tx}, ${ty}). Step 2: reflect x-axis → (${tx}, ${-ty}).`,
    };
  }
  if (variant === 1) {
    // 90° clockwise then identify
    const ans = `(${y}, ${-x})`;
    return {
      question: `Rotate (${x}, ${y}) 90° clockwise, then reflect over y-axis.\nFinal position?`,
      options: shuffle([ans, `(${-y}, ${x})`, `(${-x}, ${-y})`, `(${y}, ${x})`]),
      correctAnswer: `(${-y}, ${-x})`,
      explanation: `90° clockwise: (${y}, ${-x}). Reflect y-axis: (${-y}, ${-x}).`,
    };
  }
  // Reflection over y = x
  const ans = `(${y}, ${x})`;
  return {
    question: `Reflect (${x}, ${y}) over y = x, then rotate 180°.\nFinal position?`,
    options: shuffle([`(${-y}, ${-x})`, `(${y}, ${x})`, `(${-x}, ${-y})`, `(${x}, ${y})`]),
    correctAnswer: `(${-y}, ${-x})`,
    explanation: `Step 1: y=x reflection → (${y}, ${x}). Step 2: 180° rotation → (${-y}, ${-x}).`,
  };
}

// ── World 3: The Data Observatory ─────────────────────────────────────────────

function p6l11(): Problem {
  // Five-number summary: Q1, Q3, IQR
  const base = rand(3, 8), d = rand(2, 5);
  const vals = Array.from({ length: 8 }, (_, i) => base + i * d);
  const q1 = vals[1], q3 = vals[5], iqr = q3 - q1;
  const variant = rand(0, 2);
  if (variant === 0) {
    return {
      question: `Data (sorted): ${vals.join(', ')}\nWhat is Q1 (lower quartile)?`,
      options: numericOptions(q1, 4, vals[0], d * 2),
      correctAnswer: q1,
      explanation: `Lower half: ${vals.slice(0, 4).join(', ')}. Q1 = median of lower half = ${q1}.`,
    };
  }
  if (variant === 1) {
    return {
      question: `Data (sorted): ${vals.join(', ')}\nWhat is Q3 (upper quartile)?`,
      options: numericOptions(q3, 4, vals[3], d * 2),
      correctAnswer: q3,
      explanation: `Upper half: ${vals.slice(4).join(', ')}. Q3 = median of upper half = ${q3}.`,
    };
  }
  return {
    question: `Data (sorted): ${vals.join(', ')}\nFind the IQR (Q3 − Q1).`,
    options: numericOptions(iqr, 4, 0, d * 2),
    correctAnswer: iqr,
    explanation: `Q1 = ${q1}, Q3 = ${q3}. IQR = ${q3} − ${q1} = ${iqr}.`,
  };
}

function p6l12(): Problem {
  // Compound shapes: area and perimeter
  const variant = rand(0, 1);
  if (variant === 0) {
    // Rectangle + triangle on top
    const rw = rand(4, 10), rh = rand(3, 8), th = rand(2, 5);
    const area = rw * rh + (rw * th) / 2;
    return {
      question: `A shape: rectangle ${rw}m × ${rh}m with a triangle on top (base ${rw}m, height ${th}m).\nTotal area?`,
      options: numericOptions(area, 4, 0, Math.max(10, Math.round(area * 0.15))),
      correctAnswer: area,
      explanation: `Rectangle: ${rw}×${rh} = ${rw * rh} m². Triangle: ½×${rw}×${th} = ${(rw * th) / 2} m². Total = ${area} m².`,
    };
  }
  // L-shaped area
  const lw = rand(6, 12), lh = rand(6, 10);
  const sw = rand(2, lw - 2), sh = rand(2, lh - 2);
  const area = lw * lh - sw * sh;
  return {
    question: `L-shaped room: ${lw}m × ${lh}m minus a ${sw}m × ${sh}m corner cut out.\nArea?`,
    options: numericOptions(area, 4, 0, Math.max(10, Math.round(area * 0.15))),
    correctAnswer: area,
    explanation: `Large: ${lw * lh} m². Cut-out: ${sw * sh} m². L-shape = ${lw * lh} − ${sw * sh} = ${area} m².`,
  };
}

function p6l13(): Problem {
  // Tree diagrams — compound probability
  const variant = rand(0, 1);
  if (variant === 0) {
    // P(A and B) = P(A) × P(B) — with replacement
    const red = rand(2, 4), total = rand(red + 2, red + 4);
    const blue = total - red;
    const ans = fractionStr(red * red, total * total);
    const w1 = fractionStr(red * blue, total * total);
    const w2 = fractionStr(red, total);
    const w3 = fractionStr(red * 2, total * 2);
    return {
      question: `Bag: ${red} red, ${blue} blue balls (replace after pick).\nP(red, then red) = ?`,
      options: shuffle([ans, w1, w2, w3].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)),
      correctAnswer: ans,
      explanation: `P(red) = ${red}/${total}. P(red twice) = ${fractionStr(red, total)} × ${fractionStr(red, total)} = ${ans}.`,
    };
  }
  // Coin + die
  const totalFaces = [4, 6][rand(0, 1)];
  const evenFaces = totalFaces / 2;
  const ans = fractionStr(evenFaces, 2 * totalFaces);
  return {
    question: `Flip a fair coin AND roll a ${totalFaces}-sided die.\nP(heads AND even number)?`,
    options: shuffle([ans, fractionStr(1, 2), fractionStr(evenFaces, totalFaces), fractionStr(1, totalFaces)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)),
    correctAnswer: ans,
    explanation: `P(heads) = 1/2. P(even) = ${evenFaces}/${totalFaces}. P(both) = 1/2 × ${evenFaces}/${totalFaces} = ${ans}.`,
  };
}

function p6l14(): Problem {
  // Exchange rates and ratio
  const variant = rand(0, 1);
  if (variant === 0) {
    const rate = rand(15, 20);
    const usd = rand(2, 10) * 10;
    const zar = usd * rate;
    return {
      question: `Exchange rate: R${rate} = $1.\nConvert R${zar} to dollars.`,
      options: numericOptions(usd, 4, 1, Math.max(5, Math.round(usd * 0.2))),
      correctAnswer: usd,
      explanation: `R${zar} ÷ R${rate}/$ = $${usd}.`,
    };
  }
  // Divide in ratio
  let total: number, r1: number, r2: number, share1: number;
  do {
    r1 = rand(1, 4); r2 = rand(1, 4);
    total = (r1 + r2) * rand(2, 8) * 10;
    share1 = (total / (r1 + r2)) * r1;
  } while (!Number.isInteger(share1));
  const larger = Math.max(share1, total - share1);
  return {
    question: `R${total} shared in ratio ${r1}:${r2}.\nWhat is the LARGER share?`,
    options: numericOptions(larger, 4, 0, Math.max(20, Math.round(larger * 0.15))),
    correctAnswer: larger,
    explanation: `1 part = R${total / (r1 + r2)}. Larger (${Math.max(r1, r2)} parts) = R${larger}.`,
  };
}

function p6l15(): Problem {
  // FINAL BOSS — synthesis of all three worlds
  const variant = rand(0, 2);
  if (variant === 0) {
    // Trinomial factorising
    const pairs: [number, number][] = [[1,4],[2,3],[1,5],[2,5],[3,4]];
    const [a, b] = pairs[rand(0, pairs.length - 1)];
    const s = a + b, p = a * b;
    const ans = `(x + ${a})(x + ${b})`;
    return {
      question: `Factorise completely:\nx² + ${s}x + ${p}`,
      options: shuffle([ans, `(x + ${s})(x + ${p})`, `(x + ${a + 1})(x + ${b - 1})`, `(x + ${a})(x + ${b + 1})`]),
      correctAnswer: ans,
      explanation: `${a} + ${b} = ${s} and ${a} × ${b} = ${p} → (x + ${a})(x + ${b}).`,
    };
  }
  if (variant === 1) {
    // Translation
    const x = rand(1, 5), y = rand(1, 5);
    const dx = rand(1, 4), dy = rand(1, 4);
    const ans = `(${x + dx}, ${y + dy})`;
    return {
      question: `Point (${x}, ${y}) translated by (+${dx}, +${dy}).\nNew coordinates?`,
      options: shuffle([ans, `(${x - dx}, ${y + dy})`, `(${x + dx}, ${y - dy})`, `(${x - dx}, ${y - dy})`]),
      correctAnswer: ans,
      explanation: `(${x}+${dx}, ${y}+${dy}) = (${x + dx}, ${y + dy}).`,
    };
  }
  // Exchange rate
  const rate = [16, 18, 20][rand(0, 2)];
  const usd = rand(3, 8) * 10;
  const zar = usd * rate;
  return {
    question: `Exchange rate: R${rate} = $1.\nConvert R${zar} to dollars.`,
    options: numericOptions(usd, 4, 1, Math.max(5, Math.round(usd * 0.2))),
    correctAnswer: usd,
    explanation: `R${zar} ÷ ${rate} = $${usd}.`,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

const GENERATORS: Record<string, () => Problem> = {
  '1-1': p1l1, '1-2': p1l2, '1-3': p1l3, '1-4': p1l4, '1-5': p1l5,
  '1-6': p1l6, '1-7': p1l7, '1-8': p1l8, '1-9': p1l9, '1-10': p1l10,
  '1-11': p1l11, '1-12': p1l12, '1-13': p1l13, '1-14': p1l14, '1-15': p1l15,
  '2-1': p2l1, '2-2': p2l2, '2-3': p2l3, '2-4': p2l4, '2-5': p2l5,
  '2-6': p2l6, '2-7': p2l7, '2-8': p2l8, '2-9': p2l9, '2-10': p2l10,
  '2-11': p2l11, '2-12': p2l12, '2-13': p2l13, '2-14': p2l14, '2-15': p2l15,
  '2-16': p2l16, '2-17': p2l17, '2-18': p2l18, '2-19': p2l19, '2-20': p2l20,
  '3-1': p3l1, '3-2': p3l2, '3-3': p3l3, '3-4': p3l4, '3-5': p3l5,
  '3-6': p3l6, '3-7': p3l7, '3-8': p3l8, '3-9': p3l9, '3-10': p3l10,
  '3-11': p3l11, '3-12': p3l12, '3-13': p3l13, '3-14': p3l14, '3-15': p3l15,
  '4-1': p4l1, '4-2': p4l2, '4-3': p4l3, '4-4': p4l4, '4-5': p4l5,
  '4-6': p4l6, '4-7': p4l7, '4-8': p4l8, '4-9': p4l9, '4-10': p4l10,
  '4-11': p4l11, '4-12': p4l12, '4-13': p4l13, '4-14': p4l14, '4-15': p4l15,
  '5-1': p5l1, '5-2': p5l2, '5-3': p5l3, '5-4': p5l4, '5-5': p5l5,
  '5-6': p5l6, '5-7': p5l7, '5-8': p5l8, '5-9': p5l9, '5-10': p5l10,
  '5-11': p5l11, '5-12': p5l12, '5-13': p5l13, '5-14': p5l14, '5-15': p5l15,
  '6-1': p6l1, '6-2': p6l2, '6-3': p6l3, '6-4': p6l4, '6-5': p6l5,
  '6-6': p6l6, '6-7': p6l7, '6-8': p6l8, '6-9': p6l9, '6-10': p6l10,
  '6-11': p6l11, '6-12': p6l12, '6-13': p6l13, '6-14': p6l14, '6-15': p6l15,
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
