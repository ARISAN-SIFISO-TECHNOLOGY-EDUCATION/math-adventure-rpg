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

// ─── Public API ───────────────────────────────────────────────────────────────

const GENERATORS: Record<string, () => Problem> = {
  '1-1': p1l1, '1-2': p1l2, '1-3': p1l3, '1-4': p1l4, '1-5': p1l5,
  '1-6': p1l6, '1-7': p1l7, '1-8': p1l8, '1-9': p1l9, '1-10': p1l10,
  '2-1': p2l1, '2-2': p2l2, '2-3': p2l3, '2-4': p2l4, '2-5': p2l5,
  '2-6': p2l6, '2-7': p2l7, '2-8': p2l8, '2-9': p2l9, '2-10': p2l10,
  '2-11': p2l11, '2-12': p2l12, '2-13': p2l13, '2-14': p2l14, '2-15': p2l15,
  '3-1': p3l1, '3-2': p3l2, '3-3': p3l3, '3-4': p3l4, '3-5': p3l5,
  '3-6': p3l6, '3-7': p3l7, '3-8': p3l8, '3-9': p3l9, '3-10': p3l10,
  '3-11': p3l11, '3-12': p3l12, '3-13': p3l13, '3-14': p3l14, '3-15': p3l15,
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
