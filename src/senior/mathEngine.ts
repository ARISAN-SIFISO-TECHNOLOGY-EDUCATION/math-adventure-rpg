// Problem type — IGCSE/CAPS style with marks, working steps, and exam guidance
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

// ── Utilities ─────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 8);
}

function shuffle<T>(arr: T[]): T[] {
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
function bumpLastNumber(s: string, delta: number): string | null {
  const matches = [...s.matchAll(/-?\d+/g)];
  if (matches.length === 0) return null;
  const m = matches[matches.length - 1];
  const idx = m.index ?? 0;
  return s.slice(0, idx) + String(parseInt(m[0], 10) + delta) + s.slice(idx + m[0].length);
}

function makeOptions(correct: string, wrong: string[]): [string, string, string, string] {
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

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function simplify(num: number, den: number): string {
  if (den === 0) return '0';
  const g = gcd(Math.abs(num), Math.abs(den));
  const n = num / g, d = den / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

// Build 4 distinct `base^exp` options. Candidate wrong exponents are de-duped
// against the correct one and each other; if any collide (e.g. p×q === p+q),
// they're padded with correct±k so the MCQ always has four unique choices.
function expOptions(base: string, correct: number, candidates: number[]): [string, string, string, string] {
  const used = new Set<number>([correct]);
  const wrong: number[] = [];
  const tryAdd = (e: number) => {
    if (e >= 0 && !used.has(e) && wrong.length < 3) { used.add(e); wrong.push(e); }
  };
  candidates.forEach(tryAdd);
  for (let k = 1; wrong.length < 3; k++) { tryAdd(correct + k); tryAdd(correct - k); }
  return makeOptions(`${base}^${correct}`, wrong.map(e => `${base}^${e}`));
}

// ── age15-numbers L1 — Surds & Real Numbers ───────────────────────────────────

const NON_SQUARES = [2, 3, 5, 6, 7, 10, 11];

function genSurds(): Problem {
  const type = randInt(0, 1);

  if (type === 0) {
    const p = randInt(2, 5);
    const q = NON_SQUARES[randInt(0, 4)];
    const n = p * p * q;
    const correct = `${p}√${q}`;
    return {
      id: uid(),
      question: `Simplify fully:\n√${n}`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${p + 1}√${q}`, `${p}√${q + 1}`, `√${p * q}`]),
      marks: 3,
      workingSteps: [
        `Find the largest perfect square factor of ${n}`,
        `${n} = ${p * p} × ${q}`,
        `√${n} = √${p * p} × √${q} = ${p}√${q}`,
      ],
      hints: [`Look for a perfect square factor (4, 9, 16, 25…)`, `√(a×b) = √a × √b`],
      calculatorAllowed: false,
      commonMistake: `Using a smaller perfect square factor instead of the largest — e.g. using 4 when 16 exists leaves the surd not fully simplified.`,
      examTip: `IGCSE/CAPS: Show the factor split step explicitly (${n} = ${p*p} × ${q}). That line alone earns a method mark.`,
    };
  } else {
    const b = NON_SQUARES[randInt(0, 4)];
    const correct = `√${b}/${b}`;
    return {
      id: uid(),
      question: `Rationalise the denominator:\n1/√${b}`,
      correctAnswer: correct,
      options: makeOptions(correct, [`1/${b}`, `√${b + 1}/${b}`, `√${b}/${b + 1}`]),
      marks: 3,
      workingSteps: [
        `Multiply numerator and denominator by √${b}`,
        `(1 × √${b}) / (√${b} × √${b})`,
        `= √${b} / ${b}`,
      ],
      hints: [`Multiply top and bottom by √${b}`, `√${b} × √${b} = ${b}`],
      calculatorAllowed: false,
      commonMistake: `Multiplying only the numerator — you must multiply BOTH top and bottom by √${b} to keep the value equal.`,
      examTip: `CAPS: Write the multiplication step out in full. Don't skip straight to the answer.`,
    };
  }
}

// ── age15-numbers L2 — Indices & Exponent Laws ────────────────────────────────

function genIndices(): Problem {
  const base = ['x', 'y', 'a', 'm'][randInt(0, 3)];
  const type = randInt(0, 3);

  if (type === 0) {
    const p = randInt(2, 6), q = randInt(2, 6), r = p + q;
    return {
      id: uid(),
      question: `Simplify:\n${base}^${p} × ${base}^${q}`,
      correctAnswer: `${base}^${r}`,
      options: expOptions(base, r, [r + 1, p * q, r - 1]),
      marks: 2,
      workingSteps: [`a^m × a^n = a^(m+n)`, `${base}^${p} × ${base}^${q} = ${base}^(${p}+${q}) = ${base}^${r}`],
      hints: [`Multiplying same base → ADD exponents`, `Keep the base, add the powers`],
      calculatorAllowed: false,
      commonMistake: `Multiplying the exponents (${p} × ${q} = ${p*q}) instead of adding them — multiplication of powers means ADD the indices.`,
      examTip: `IGCSE: State the law first: a^m × a^n = a^(m+n). One line of working earns the method mark.`,
    };
  } else if (type === 1) {
    const p = randInt(2, 4), q = randInt(2, 4), r = p * q;
    return {
      id: uid(),
      question: `Simplify:\n(${base}^${p})^${q}`,
      correctAnswer: `${base}^${r}`,
      options: expOptions(base, r, [r + 1, p + q, r - 2]),
      marks: 2,
      workingSteps: [`(a^m)^n = a^(m×n)`, `(${base}^${p})^${q} = ${base}^(${p}×${q}) = ${base}^${r}`],
      hints: [`Power to a power → MULTIPLY exponents`],
      calculatorAllowed: false,
      commonMistake: `Adding instead of multiplying (${p} + ${q} = ${p+q}) — a power raised to a power means MULTIPLY the indices.`,
      examTip: `CAPS: (a^m)^n = a^(mn) — write this law before substituting numbers.`,
    };
  } else if (type === 2) {
    const q = randInt(1, 4), r = randInt(1, 4), p = q + r;
    return {
      id: uid(),
      question: `Simplify:\n${base}^${p} ÷ ${base}^${q}`,
      correctAnswer: `${base}^${r}`,
      options: expOptions(base, r, [r + 1, p * q, r - 1]),
      marks: 2,
      workingSteps: [`a^m ÷ a^n = a^(m−n)`, `${base}^${p} ÷ ${base}^${q} = ${base}^(${p}−${q}) = ${base}^${r}`],
      hints: [`Dividing same base → SUBTRACT exponents`],
      calculatorAllowed: false,
      commonMistake: `Adding exponents on division — division means SUBTRACT: ${p} − ${q} = ${r}, not ${p+q}.`,
      examTip: `IGCSE: Always check: same base? Same operation? Then apply the correct law.`,
    };
  } else {
    const n = randInt(1, 3);
    return {
      id: uid(),
      question: `Simplify:\n${base}^−${n}`,
      correctAnswer: `1/${base}^${n}`,
      options: makeOptions(`1/${base}^${n}`, [`−${base}^${n}`, `${base}^${n}`, `1/${base}^${n + 1}`]),
      marks: 2,
      workingSteps: [`Negative exponent rule: a^−n = 1/a^n`, `${base}^−${n} = 1/${base}^${n}`],
      hints: [`Negative power means reciprocal`, `a^−1 = 1/a`],
      calculatorAllowed: false,
      commonMistake: `Writing the answer as a negative number (−${base}^${n}) — a negative exponent means RECIPROCAL, not a negative value.`,
      examTip: `CAPS: a^−n = 1/a^n. Always flip — do not negate. This is tested every year.`,
    };
  }
}

// ── age15-numbers L3 — Quadratics by Factoring ───────────────────────────────

function genQuadraticsFactor(): Problem {
  const caseType = randInt(0, 2);

  // ── Case 0: both roots negative — (x+a)(x+b) = 0 ─────────────────────────
  if (caseType === 0) {
    const a = randInt(1, 6), b = randInt(1, 6);
    const B = a + b, C = a * b;
    const roots = [-a, -b].sort((x, y) => x - y);
    const correct = `x = ${roots[0]} or x = ${roots[1]}`;
    return {
      id: uid(),
      question: `Solve by factorising:\nx² + ${B}x + ${C} = 0`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `x = ${a} or x = ${b}`,
        `x = ${roots[0]} or x = ${roots[1] + 1}`,
        `x = ${roots[0] - 1} or x = ${roots[1]}`,
      ]),
      marks: 4,
      workingSteps: [
        `Need two numbers: product = +${C}, sum = +${B}  →  ${a} and ${b}`,
        `(x + ${a})(x + ${b}) = 0`,
        `x + ${a} = 0  →  x = −${a}`,
        `x + ${b} = 0  →  x = −${b}`,
      ],
      hints: [`Both B and C positive → both roots are negative.`, `Two numbers that multiply to ${C} and add to ${B}?`],
      calculatorAllowed: false,
      commonMistake: `Writing x = ${a} or x = ${b} — the roots are the negatives of the values inside the brackets.`,
      examTip: `IGCSE: +Bx +C means both roots negative. Check: (−${a}) + (−${b}) = −${B} ✗ … wait, they must add to +${B}, so roots = −${a}, −${b}.`,
    };
  }

  // ── Case 1: mixed roots — (x−p)(x+q) = 0, p≠q ───────────────────────────
  if (caseType === 1) {
    let p = randInt(1, 6), q = randInt(1, 6);
    while (p === q) q = randInt(1, 6);   // p=q gives difference of squares (no x term)
    const B = q - p;                      // can be +, −
    const C = p * q;                      // always positive (shown as negative in equation)
    const bStr = B > 0 ? `+ ${B}` : `− ${Math.abs(B)}`;
    const correct = `x = ${p} or x = −${q}`;
    return {
      id: uid(),
      question: `Solve by factorising:\nx² ${bStr}x − ${C} = 0`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `x = −${p} or x = ${q}`,
        `x = ${p} or x = ${q}`,
        `x = −${p} or x = −${q}`,
      ]),
      marks: 4,
      workingSteps: [
        `Need two numbers: product = −${C}, sum = ${B}  →  +${p} and −${q}`,
        `(x − ${p})(x + ${q}) = 0`,
        `x − ${p} = 0  →  x = ${p}`,
        `x + ${q} = 0  →  x = −${q}`,
      ],
      hints: [`Negative constant → one root positive, one negative.`, `Which pair multiplies to −${C} and adds to ${B}?`],
      calculatorAllowed: false,
      commonMistake: `Swapping the signs — bracket (x − ${p}) gives root x = +${p}, not −${p}.`,
      examTip: `IGCSE: Negative C always means one positive root and one negative root.`,
    };
  }

  // ── Case 2: both roots positive — (x−a)(x−b) = 0 ────────────────────────
  const a = randInt(1, 6), b = randInt(1, 6);
  const B = a + b, C = a * b;
  const roots = [a, b].sort((x, y) => x - y);
  const correct = `x = ${roots[0]} or x = ${roots[1]}`;
  return {
    id: uid(),
    question: `Solve by factorising:\nx² − ${B}x + ${C} = 0`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `x = −${roots[0]} or x = −${roots[1]}`,
      `x = ${roots[0]} or x = ${roots[1] + 1}`,
      `x = ${roots[0] - 1 === 0 ? roots[0] + 2 : roots[0] - 1} or x = ${roots[1]}`,
    ]),
    marks: 4,
    workingSteps: [
      `Need two numbers: product = +${C}, sum = −${B}  →  −${a} and −${b}`,
      `(x − ${a})(x − ${b}) = 0`,
      `x − ${a} = 0  →  x = ${a}`,
      `x − ${b} = 0  →  x = ${b}`,
    ],
    hints: [`Negative B, positive C → both roots are positive.`, `Two numbers that multiply to ${C} and add to −${B}?`],
    calculatorAllowed: false,
    commonMistake: `Writing x = −${a} or x = −${b} — bracket (x − n) gives root x = +n, not −n.`,
    examTip: `IGCSE: −Bx +C means both roots positive. Pattern: x² − (sum)x + (product) = 0.`,
  };
}

// ── age15-algebra L1 — Quadratic Formula & Discriminant ──────────────────────

function genQuadraticFormula(): Problem {
  const r1 = randInt(-4, 4);
  const r2 = randInt(-4, 4);
  const B  = -(r1 + r2);
  const C  = r1 * r2;
  const bStr = B >= 0 ? `+ ${B}` : `− ${Math.abs(B)}`;
  const cStr = C >= 0 ? `+ ${C}` : `− ${Math.abs(C)}`;
  const roots = [r1, r2].sort((a, b) => a - b);
  const correct = `x = ${roots[0]} or x = ${roots[1]}`;
  const disc = B * B - 4 * C;
  return {
    id: uid(),
    question: `Use the quadratic formula to solve:\nx² ${bStr}x ${cStr} = 0`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `x = ${roots[0] + 1} or x = ${roots[1]}`,
      `x = ${roots[0]} or x = ${roots[1] + 1}`,
      `x = ${-roots[0]} or x = ${-roots[1]}`,
      `x = ${roots[0] - 1} or x = ${roots[1]}`,
      `x = ${roots[0]} or x = ${roots[1] - 1}`,
    ]),
    marks: 4,
    workingSteps: [
      `a = 1, b = ${B}, c = ${C}`,
      `Discriminant: b²−4ac = ${B}²−4(1)(${C}) = ${disc}`,
      `x = (−b ± √discriminant) / 2a`,
      `x = (−${B} ± √${disc}) / 2`,
      `x = ${roots[0]}  or  x = ${roots[1]}`,
    ],
    hints: [`Formula: x = (−b ± √(b²−4ac)) / 2a`, `First compute the discriminant b²−4ac`],
    calculatorAllowed: true,
    commonMistake: `Using +b instead of −b in the formula — the formula has x = (−b ± …), so substitute with the sign change.`,
    examTip: `CAPS/IGCSE: Calculate the discriminant first as a separate step. If Δ < 0, state "no real roots" and stop.`,
  };
}

// ── age15-algebra L2 — Simultaneous Equations ────────────────────────────────

function genSimultaneous(): Problem {
  const x = randInt(1, 6), y = randInt(1, 6);
  const a1 = randInt(1, 3), b1 = randInt(1, 3);
  const a2 = randInt(1, 3), b2 = randInt(1, 3);
  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;
  const correct = `x = ${x}, y = ${y}`;
  return {
    id: uid(),
    question: `Solve simultaneously:\n${a1}x + ${b1}y = ${c1}\n${a2}x + ${b2}y = ${c2}`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `x = ${x + 1}, y = ${y}`,
      `x = ${y}, y = ${x}`,
      `x = ${x}, y = ${y + 1}`,
      `x = ${x - 1}, y = ${y}`,
      `x = ${x}, y = ${y - 1}`,
    ]),
    marks: 4,
    workingSteps: [
      `Equation 1: ${a1}x + ${b1}y = ${c1}`,
      `Equation 2: ${a2}x + ${b2}y = ${c2}`,
      `Use elimination: multiply to match coefficients, then subtract`,
      `Substitute back to find the second variable`,
      `x = ${x},  y = ${y}`,
    ],
    hints: [`Multiply one or both equations so a coefficient matches`, `Add or subtract to eliminate one variable`],
    calculatorAllowed: false,
    commonMistake: `Forgetting to substitute back — elimination gives only ONE variable; you must substitute to find the second.`,
    examTip: `IGCSE: Always verify your answer by substituting x and y back into BOTH original equations.`,
  };
}

// ── age15-algebra L3 — Inequalities ──────────────────────────────────────────

function genInequalities(): Problem {
  const a = randInt(1, 5);
  const b = randInt(-6, 6);
  const c = randInt(-6, 6);
  const rhs = c - b;
  const isGt = randInt(0, 1) === 0;
  const sym  = isGt ? '>' : '≤';
  const sol  = isGt ? '>' : '≤';
  const correct = `x ${sol} ${simplify(rhs, a)}`;
  return {
    id: uid(),
    question: `Solve and express your answer:\n${a}x + ${b} ${sym} ${c}`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `x ${isGt ? '<' : '>'} ${simplify(rhs, a)}`,
      `x ${sol} ${simplify(rhs + 1, a)}`,
      `x ${sol} ${simplify(rhs - 1, a)}`,
    ]),
    marks: 3,
    workingSteps: [
      `${a}x + ${b} ${sym} ${c}`,
      `${a}x ${sym} ${c} − ${b} = ${rhs}`,
      `x ${sol} ${rhs}/${a} = ${simplify(rhs, a)}`,
    ],
    hints: [`Isolate x: subtract ${b} from both sides`, `If you divide by a negative, FLIP the inequality sign`],
    calculatorAllowed: false,
    commonMistake: `Flipping the inequality sign when dividing by a POSITIVE number — only flip when dividing by a NEGATIVE.`,
    examTip: `CAPS: If asked to show on a number line, use an open circle for strict inequalities (>) and a closed circle for ≤ or ≥.`,
  };
}

// ── age15-geometry L1 — Analytical Geometry ──────────────────────────────────

const PYTH_TRIPLES: [number, number, number][] = [
  [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25],
];

function genAnalyticalGeo(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    const x1 = randInt(-4, 4), y1 = randInt(-4, 4);
    const x2 = x1 + randInt(1, 4) * 2;
    const y2 = y1 + randInt(1, 4) * 2;
    const correct = `(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`;
    return {
      id: uid(),
      question: `Find the midpoint of the segment:\n(${x1}, ${y1}) to (${x2}, ${y2})`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `(${(x1 + x2) / 2 + 1}, ${(y1 + y2) / 2})`,
        `(${(x1 + x2) / 2}, ${(y1 + y2) / 2 + 1})`,
        `(${x2 - x1}, ${y2 - y1})`,
      ]),
      marks: 2,
      workingSteps: [
        `Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)`,
        `= ((${x1}+${x2})/2, (${y1}+${y2})/2)`,
        `= ${correct}`,
      ],
      hints: [`Add the x-coords and divide by 2`, `Do the same for y-coords`],
      calculatorAllowed: true,
      commonMistake: `Subtracting coordinates instead of adding — midpoint uses (x₁+x₂)/2, not (x₂−x₁)/2.`,
      examTip: `IGCSE: Write the formula first, then substitute. Examiners award a mark for correct formula use.`,
    };
  } else if (type === 1) {
    const [dx, dy, d] = PYTH_TRIPLES[randInt(0, PYTH_TRIPLES.length - 1)];
    const x1 = randInt(-3, 3), y1 = randInt(-3, 3);
    return {
      id: uid(),
      question: `Find the distance between:\n(${x1}, ${y1}) and (${x1 + dx}, ${y1 + dy})`,
      correctAnswer: `${d}`,
      options: makeOptions(`${d}`, [`${d + 1}`, `${d - 1}`, `${d + 2}`]),
      marks: 3,
      workingSteps: [
        `d = √((x₂−x₁)² + (y₂−y₁)²)`,
        `d = √((${dx})² + (${dy})²)`,
        `d = √(${dx * dx} + ${dy * dy}) = √${dx * dx + dy * dy} = ${d}`,
      ],
      hints: [`Use d = √((x₂−x₁)² + (y₂−y₁)²)`],
      calculatorAllowed: true,
      commonMistake: `Forgetting to square the differences before adding — it's (Δx)² + (Δy)², not Δx + Δy.`,
      examTip: `CAPS: Don't simplify √${dx*dx+dy*dy} on paper — use your calculator and show the substitution step.`,
    };
  } else {
    const m = (randInt(-4, 4) || 2);
    const x1 = randInt(-3, 3), y1 = randInt(-3, 3);
    const x2 = x1 + randInt(1, 4);
    const y2 = y1 + m * (x2 - x1);
    return {
      id: uid(),
      question: `Find the gradient of the line through:\n(${x1}, ${y1}) and (${x2}, ${y2})`,
      correctAnswer: `m = ${m}`,
      options: makeOptions(`m = ${m}`, [`m = ${m + 1}`, `m = ${-m}`, `m = ${m - 1}`]),
      marks: 3,
      workingSteps: [
        `m = (y₂ − y₁) / (x₂ − x₁)`,
        `m = (${y2} − ${y1}) / (${x2} − ${x1})`,
        `m = ${y2 - y1} / ${x2 - x1} = ${m}`,
      ],
      hints: [`gradient = rise ÷ run = (y₂−y₁) ÷ (x₂−x₁)`],
      calculatorAllowed: true,
      commonMistake: `Swapping the order — doing (x₂−x₁)/(y₂−y₁) instead of (y₂−y₁)/(x₂−x₁). Rise is always on top.`,
      examTip: `IGCSE: A negative gradient means the line slopes down left-to-right. Always sanity-check your sign.`,
    };
  }
}

// ── age15-geometry L2 — Circle Geometry Theorems ─────────────────────────────

const CIRCLE_THEOREMS = [
  {
    question: `The angle at the centre is ___ the inscribed angle on the same arc.`,
    correct: `Twice as large`,
    wrong: [`Equal`, `Half as large`, `Four times as large`],
    working: [`Central angle theorem`, `Angle at centre = 2 × angle at circumference`],
    hints: [`Think: centre vs circumference`, `The centre angle is always double`],
    commonMistake: `Confusing direction — the CENTRE angle is double the circumference angle, not the other way around.`,
    examTip: `CAPS: Always state the theorem name in your reason: "∠ at centre = 2 × ∠ at circumference". Without the reason you lose marks.`,
  },
  {
    question: `An angle inscribed in a semicircle (diameter as chord) is always:`,
    correct: `90°`,
    wrong: [`45°`, `60°`, `180°`],
    working: [`Thales' theorem`, `The diameter subtends a right angle at any point on the circle`],
    hints: [`Thales' theorem`, `Half a circle = right angle at circumference`],
    commonMistake: `Assuming it might be 60° or 45° — by Thales' theorem it is ALWAYS exactly 90°, regardless of where the point sits on the semicircle.`,
    examTip: `IGCSE: If you see a diameter as a chord, immediately mark 90° at the circumference. It's a guaranteed "spot it" question.`,
  },
  {
    question: `Opposite angles of a cyclic quadrilateral add up to:`,
    correct: `180°`,
    wrong: [`90°`, `360°`, `270°`],
    working: [`Cyclic quadrilateral theorem`, `Opposite angles are supplementary`],
    hints: [`Cyclic quad: opposite angles sum to…`, `Supplementary means they add to 180°`],
    commonMistake: `Thinking all four angles add to 360° makes each pair add to 180° — only OPPOSITE pairs in a cyclic quad sum to 180°.`,
    examTip: `CAPS: If one opposite angle is given, subtract from 180° to get the other — quick and reliable on any CAPS paper.`,
  },
  {
    question: `Angles subtended by the same arc on the same side of a chord are:`,
    correct: `Equal`,
    wrong: [`Supplementary (180°)`, `Complementary (90°)`, `Double each other`],
    working: [`Angles in the same segment are equal`, `Same arc, same side → equal angles`],
    hints: [`Same segment theorem`, `Both angles "see" the same arc`],
    commonMistake: `Thinking they are supplementary (180°) — angles in the SAME segment are EQUAL, not supplementary.`,
    examTip: `IGCSE: Look for two angles that both "look at" the same chord from the same side — they are always equal.`,
  },
  {
    question: `The angle between a tangent and a chord at the point of tangency equals:`,
    correct: `The inscribed angle in the alternate segment`,
    wrong: [`90°`, `Half the arc length`, `The angle at the centre`],
    working: [`Tan-chord angle = angle in alternate segment`, `This is the tangent-chord theorem`],
    hints: [`Tangent-chord theorem`, `Look to the other side (alternate segment)`],
    commonMistake: `Looking in the SAME segment — the equal angle is in the ALTERNATE segment (the other side of the chord).`,
    examTip: `CAPS: Draw the alternate segment by extending the chord, identify the inscribed angle on the far side, and state the theorem name.`,
  },
  // ── 3 previously missing theorems ────────────────────────────────────────────
  {
    question: `A tangent PQ touches a circle at point P, and O is the centre of the circle.\nWhat is the relationship between OP and PQ?`,
    correct: `OP ⊥ PQ (radius is perpendicular to tangent)`,
    wrong: [`OP ∥ PQ`, `OP = PQ`, `OP bisects PQ`],
    working: [
      `Theorem: The tangent to a circle is perpendicular to the radius at the point of contact`,
      `Therefore angle OPQ = 90°, so OP ⊥ PQ`,
    ],
    hints: [`What is the angle between a radius and a tangent at the contact point?`, `It is always exactly 90°`],
    commonMistake: `Assuming OP is parallel to PQ — the radius meets the tangent at exactly 90°, never at any other angle.`,
    examTip: `CAPS/IGCSE: State the theorem name for the reason mark: "radius ⊥ tangent at point of contact". The reason is worth as much as the answer.`,
  },
  {
    question: `Two tangents are drawn from external point A to a circle, touching at B and C.\nIf AB = 11 cm, find AC.`,
    correct: `11 cm`,
    wrong: [`22 cm`, `5.5 cm`, `Cannot be determined`],
    working: [
      `Theorem: Tangents drawn from the same external point are equal in length`,
      `Therefore AC = AB = 11 cm`,
    ],
    hints: [`Equal tangents from an external point`, `Both tangents reach from A to the circle`],
    commonMistake: `Trying to use Pythagoras without reason — the equal tangents theorem gives AC = AB directly, no calculation needed.`,
    examTip: `IGCSE/CAPS: Write "tangents from A are equal" as your reason. This one-line theorem closes the question. Show it explicitly.`,
  },
  {
    question: `Chords AB and CD in a circle are equal in length.\nWhat is true about their perpendicular distances from the centre O?`,
    correct: `They are equidistant from O`,
    wrong: [`AB is closer to O`, `CD is closer to O`, `They pass through O`],
    working: [
      `Theorem: Equal chords are equidistant from the centre`,
      `The perpendicular distance from O to AB equals the perpendicular distance from O to CD`,
    ],
    hints: [`Draw perpendiculars from O to each chord`, `Equal chord length → equal distance from centre`],
    commonMistake: `Confusing with "equal chords subtend equal angles at centre" — both are true, but this question asks specifically about distances from the centre.`,
    examTip: `CAPS Paper 2: This theorem often pairs with Pythagoras — find the chord length from the distance, or the distance from the chord length.`,
  },
];

function genCircleGeometry(): Problem {
  const qType = randInt(0, 4);

  // ── qType 0–1  theorem identification (40 % of calls) ────────────────────
  if (qType <= 1) {
    const t = CIRCLE_THEOREMS[randInt(0, CIRCLE_THEOREMS.length - 1)];
    return {
      id: uid(),
      question: t.question,
      correctAnswer: t.correct,
      options: makeOptions(t.correct, t.wrong),
      marks: 2,
      workingSteps: t.working,
      hints: t.hints,
      calculatorAllowed: false,
      commonMistake: t.commonMistake,
      examTip: t.examTip,
    };
  }

  // ── qType 2  central angle ↔ inscribed angle (random multiples of 10°) ───
  if (qType === 2) {
    const inscribed = randInt(2, 8) * 10;   // 20 – 80°
    const central   = inscribed * 2;         // 40 – 160°
    const dir       = randInt(0, 1);         // 0 = give central → find inscribed
                                             // 1 = give inscribed → find central
    if (dir === 0) {
      const correct = `${inscribed}°`;
      return {
        id: uid(),
        question: `A central angle AOB = ${central}° stands on arc AB.\nP is a point on the major arc.\n\nFind the inscribed angle APB.`,
        correctAnswer: correct,
        options: makeOptions(correct, [`${central}°`, `${inscribed + 10}°`, `${inscribed - 10}°`]),
        marks: 2,
        workingSteps: [
          `Inscribed Angle Theorem: angle at circumference = ½ × angle at centre.`,
          `Angle APB = ½ × ${central}° = ${inscribed}°`,
        ],
        hints: [`The angle at the circumference is half the angle at the centre on the same arc.`],
        calculatorAllowed: false,
        commonMistake: `Doubling instead of halving — the inscribed angle is smaller (half the central angle).`,
        examTip: `Inscribed angle = ½ central angle (same arc).`,
      };
    } else {
      const correct = `${central}°`;
      return {
        id: uid(),
        question: `An inscribed angle APB = ${inscribed}° stands on arc AB.\n\nFind the central angle AOB subtended by the same arc.`,
        correctAnswer: correct,
        options: makeOptions(correct, [`${inscribed}°`, `${central + 10}°`, `${central - 10}°`]),
        marks: 2,
        workingSteps: [
          `Central angle = 2 × inscribed angle (same arc).`,
          `Angle AOB = 2 × ${inscribed}° = ${central}°`,
        ],
        hints: [`Central angle is twice the inscribed angle on the same arc.`],
        calculatorAllowed: false,
        commonMistake: `Halving instead of doubling — central angle is the larger one here.`,
        examTip: `Central angle = 2 × inscribed angle (same arc).`,
      };
    }
  }

  // ── qType 3  cyclic quadrilateral opposite angles ─────────────────────────
  if (qType === 3) {
    const A_OPTS = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140] as const;
    const A = A_OPTS[randInt(0, A_OPTS.length - 1)];
    const C = 180 - A;
    const correct = `${C}°`;
    return {
      id: uid(),
      question: `ABCD is a cyclic quadrilateral.\nAngle A = ${A}°.\n\nFind angle C.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${C + 10}°`, `${C - 10}°`, `${360 - A}°`]),
      marks: 2,
      workingSteps: [
        `Opposite angles of a cyclic quadrilateral sum to 180°.`,
        `Angle C = 180° − ${A}° = ${C}°`,
      ],
      hints: [`Opposite angles of a cyclic quadrilateral are supplementary (∠A + ∠C = 180°).`],
      calculatorAllowed: false,
      commonMistake: `Using 360° instead of 180° — that gives the full rotation, not the supplementary angle.`,
      examTip: `Cyclic quad: ∠A + ∠C = 180°  and  ∠B + ∠D = 180°.`,
    };
  }

  // ── qType 4  tangent length from external point (Pythagoras) ─────────────
  // All triples are validated Pythagorean: [OP, radius, tangent]
  const TANG_TRIPLES = [
    [5, 3, 4], [10, 6, 8], [13, 5, 12], [17, 8, 15],
    [25, 7, 24], [15, 9, 12], [20, 12, 16],
  ] as const;
  const [hyp, rad, tang] = TANG_TRIPLES[randInt(0, TANG_TRIPLES.length - 1)];
  const addDistractor = Math.round(Math.sqrt(hyp * hyp + rad * rad)); // wrong: + instead of −
  const correct = `${tang} cm`;
  return {
    id: uid(),
    question: `A tangent is drawn from external point P to a circle with centre O and radius ${rad} cm.\nThe distance OP = ${hyp} cm.\n\nFind the length of the tangent.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${tang + 1} cm`, `${tang - 1} cm`, `${addDistractor} cm`]),
    marks: 3,
    workingSteps: [
      `The radius OT is perpendicular to the tangent PT (radius–tangent theorem).`,
      `By Pythagoras in triangle OTP: PT² = OP² − OT²`,
      `PT² = ${hyp}² − ${rad}² = ${hyp * hyp} − ${rad * rad} = ${tang * tang}`,
      `PT = √${tang * tang} = ${tang} cm`,
    ],
    hints: [
      `The radius to the point of tangency meets the tangent at 90°.`,
      `OP is the hypotenuse; use PT² = OP² − r².`,
    ],
    calculatorAllowed: false,
    commonMistake: `Adding OP² + r² instead of subtracting — OP is the hypotenuse, so r and PT are the legs.`,
    examTip: `Tangent from external point: PT² = OP² − r²  (tangent is a leg, not the hypotenuse).`,
  };
}

// ── age15-geometry L3 — Similarity & Congruence ──────────────────────────────

function genSimilarity(): Problem {
  const scale = randInt(2, 5);
  const a = randInt(3, 8), b = randInt(3, 8);
  const correct = `${b * scale}`;
  return {
    id: uid(),
    question: `Two similar triangles.\nSmaller: sides ${a} and ${b}\nLarger: side corresponding to ${a} is ${a * scale}\n\nFind the side corresponding to ${b}.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${b * scale + 1}`, `${b + scale}`, `${b * (scale - 1)}`]),
    marks: 3,
    workingSteps: [
      `Scale factor = ${a * scale} / ${a} = ${scale}`,
      `Corresponding side = ${b} × ${scale}`,
      `= ${b * scale}`,
    ],
    hints: [
      `Find the scale factor: larger ÷ smaller for known pair`,
      `Multiply all other sides by the same scale factor`,
    ],
    calculatorAllowed: true,
    commonMistake: `Adding the scale factor instead of multiplying — scale factor ${scale} means ×${scale}, not +${scale}.`,
    examTip: `IGCSE: State the scale factor as a ratio (${a*scale}:${a} = ${scale}) before applying it. That line earns a method mark.`,
  };
}

// ── age15-trig L1 — Right-Angle Trig (SOH CAH TOA) ───────────────────────────

function genSOHCAHTOA(): Problem {
  const [opp, adj, hyp] = PYTH_TRIPLES[randInt(0, PYTH_TRIPLES.length - 1)];
  const type = randInt(0, 2);

  if (type === 0) {
    const correct = `${hyp}`;
    return {
      id: uid(),
      question: `Right triangle with legs ${opp} and ${adj}.\nFind the hypotenuse.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${hyp + 1}`, `${hyp - 1}`, `${opp + adj}`]),
      marks: 3,
      workingSteps: [`c² = a² + b²`, `c² = ${opp}² + ${adj}² = ${opp*opp+adj*adj}`, `c = √${opp*opp+adj*adj} = ${hyp}`],
      hints: [`Pythagoras: a² + b² = c²`, `The hypotenuse is the longest side`],
      calculatorAllowed: true,
      commonMistake: `Adding the sides directly (${opp} + ${adj} = ${opp+adj}) instead of squaring first — Pythagoras uses squares, not just the lengths.`,
      examTip: `CAPS: Write c² = a² + b² before substituting. Never go straight to the answer without the formula line.`,
    };
  } else if (type === 1) {
    const r = randInt(0, 2);
    const names = ['sin(θ)', 'cos(θ)', 'tan(θ)'];
    const values = [simplify(opp, hyp), simplify(adj, hyp), simplify(opp, adj)];
    const mnemonic = ['SOH: sin = opp/hyp', 'CAH: cos = adj/hyp', 'TOA: tan = opp/adj'];
    const wrong = r === 0
      ? [simplify(adj, hyp), simplify(hyp, opp), simplify(opp, adj)]
      : r === 1
      ? [simplify(opp, hyp), simplify(hyp, adj), simplify(adj, opp)]
      : [simplify(adj, opp), simplify(opp, hyp), simplify(hyp, opp)];
    return {
      id: uid(),
      question: `Right triangle:\nOpp = ${opp},  Adj = ${adj},  Hyp = ${hyp}\n\nFind ${names[r]}`,
      correctAnswer: values[r],
      options: makeOptions(values[r], wrong),
      marks: 2,
      workingSteps: [mnemonic[r], `${names[r]} = ${values[r]}`],
      hints: [`SOH·CAH·TOA`, mnemonic[r]],
      calculatorAllowed: true,
      commonMistake: `Confusing opposite and adjacent — opposite is across from the angle, adjacent is next to it (but not the hypotenuse).`,
      examTip: `IGCSE: Label all three sides (O, A, H) on your diagram before selecting the ratio. The diagram earns a mark.`,
    };
  } else {
    return {
      id: uid(),
      question: `Right triangle: hypotenuse = ${hyp}, one leg = ${adj}.\nFind the other leg.`,
      correctAnswer: `${opp}`,
      options: makeOptions(`${opp}`, [`${opp + 1}`, `${opp - 1}`, `${hyp - adj}`]),
      marks: 3,
      workingSteps: [`a² + b² = c²`, `a² = ${hyp}² − ${adj}² = ${hyp*hyp} − ${adj*adj} = ${opp*opp}`, `a = ${opp}`],
      hints: [`Rearrange: a² = c² − b²`],
      calculatorAllowed: true,
      commonMistake: `Subtracting the sides before squaring — you must calculate ${hyp}² − ${adj}² = ${hyp*hyp-adj*adj}, then take the square root.`,
      examTip: `CAPS: Show the rearrangement step a² = c² − b² explicitly before substituting.`,
    };
  }
}

// ── age15-trig L2 — Sine & Cosine Rule (fully random) ────────────────────────

function genSineCosineRule(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    // ── Cosine rule: find side c (SAS — 2 sides + included angle) ───────────
    const a = randInt(4, 10);
    const b = randInt(4, 10);
    const C_OPTS = [30, 45, 60, 120] as const;
    const C = C_OPTS[randInt(0, C_OPTS.length - 1)];
    const cosC = Math.cos(C * Math.PI / 180);
    const cSq = a * a + b * b - 2 * a * b * cosC;
    const c = Math.sqrt(cSq);
    const cR = c.toFixed(1);

    const w1 = Math.sqrt(a * a + b * b + 2 * a * b * cosC).toFixed(1); // + sign error
    const w2 = Math.sqrt(a * a + b * b).toFixed(1);                    // forgot 2ab·cos term
    const w3 = (c + 1.8).toFixed(1);                                   // small error

    return {
      id: uid(),
      question: `Triangle ABC: a = ${a} cm, b = ${b} cm, angle C = ${C}°.\n\nFind side c. Give your answer to 1 d.p.`,
      correctAnswer: `c ≈ ${cR} cm`,
      options: makeOptions(`c ≈ ${cR} cm`, [`c ≈ ${w1} cm`, `c ≈ ${w2} cm`, `c ≈ ${w3} cm`]),
      marks: 4,
      workingSteps: [
        `Cosine rule: c² = a² + b² − 2ab·cos(C)`,
        `c² = ${a}² + ${b}² − 2(${a})(${b})·cos(${C}°)`,
        `c² = ${a * a} + ${b * b} − ${2 * a * b} × ${cosC.toFixed(4)}`,
        `c² ≈ ${cSq.toFixed(3)}`,
        `c ≈ ${cR} cm`,
      ],
      hints: [`SAS (2 sides + included angle) → cosine rule`, `c² = a² + b² − 2ab·cos(C)`],
      calculatorAllowed: true,
      commonMistake: `Using a + sign: a² + b² + 2ab·cos(C) = ${w1} cm — the cosine rule SUBTRACTS the 2ab·cos term. Remember the minus.`,
      examTip: `IGCSE: SAS → cosine rule. Write the formula before substituting. That line earns the method mark.`,
    };

  } else if (type === 1) {
    // ── Sine rule: find side b (AAS — 2 angles + 1 opposite side) ──────────
    const a = randInt(5, 13);
    const A_OPTS = [30, 35, 40, 50, 55, 60, 65, 70];
    const A = A_OPTS[randInt(0, A_OPTS.length - 1)];
    const B_OPTS = A_OPTS.filter(x => x !== A && x + A < 165);
    const B = B_OPTS[randInt(0, B_OPTS.length - 1)];
    const sinA = Math.sin(A * Math.PI / 180);
    const sinB = Math.sin(B * Math.PI / 180);
    const b = a * sinB / sinA;
    const bR = b.toFixed(1);

    const w1 = (a * sinA / sinB).toFixed(1);      // inverted ratio
    const w2 = (a * sinB).toFixed(1);             // forgot / sin A
    const w3 = (b + 0.9).toFixed(1);              // small error

    return {
      id: uid(),
      question: `Triangle ABC: a = ${a} cm, angle A = ${A}°, angle B = ${B}°.\n\nFind side b. Give your answer to 1 d.p.`,
      correctAnswer: `b ≈ ${bR} cm`,
      options: makeOptions(`b ≈ ${bR} cm`, [`b ≈ ${w1} cm`, `b ≈ ${w2} cm`, `b ≈ ${w3} cm`]),
      marks: 4,
      workingSteps: [
        `Sine rule: a/sin(A) = b/sin(B)`,
        `${a}/sin(${A}°) = b/sin(${B}°)`,
        `b = ${a} × sin(${B}°) / sin(${A}°)`,
        `b ≈ ${a} × ${sinB.toFixed(4)} / ${sinA.toFixed(4)}`,
        `b ≈ ${bR} cm`,
      ],
      hints: [`AAS (2 angles + 1 side) → sine rule`, `b = a × sin(B) / sin(A)`],
      calculatorAllowed: true,
      commonMistake: `Inverting: b = a·sin(A)/sin(B) = ${w1} cm — it must be sin(B) on top. The UNKNOWN side's angle goes in the numerator.`,
      examTip: `CAPS: Write the full sine rule, cross-multiply to isolate b, then compute. Show all three lines.`,
    };

  } else {
    // ── Cosine rule: find angle A (SSS — all 3 sides given) ─────────────────
    const SSS = [
      [5, 6, 7], [4, 7, 9], [5, 8, 10], [6, 7, 9], [3, 7, 8],
      [5, 9, 11], [4, 6, 8], [7, 8, 10], [6, 9, 12], [5, 7, 9],
    ] as const;
    const [a, b, c] = SSS[randInt(0, SSS.length - 1)];
    const cosA = (b * b + c * c - a * a) / (2 * b * c);
    const A = Math.acos(cosA) * 180 / Math.PI;
    const AR = A.toFixed(1);

    const w1 = (A + 17).toFixed(1);
    const w2 = Math.max(1, A - 14).toFixed(1);
    const w3 = (180 - A).toFixed(1);  // supplementary — the "plus sign" error

    return {
      id: uid(),
      question: `Triangle ABC: a = ${a} cm, b = ${b} cm, c = ${c} cm.\n\nFind angle A. Give your answer to 1 d.p.`,
      correctAnswer: `A ≈ ${AR}°`,
      options: makeOptions(`A ≈ ${AR}°`, [`A ≈ ${w1}°`, `A ≈ ${w2}°`, `A ≈ ${w3}°`]),
      marks: 4,
      workingSteps: [
        `Cosine rule for angle: cos(A) = (b² + c² − a²) / (2bc)`,
        `cos(A) = (${b * b} + ${c * c} − ${a * a}) / (2 × ${b} × ${c})`,
        `cos(A) = ${b * b + c * c - a * a} / ${2 * b * c} ≈ ${cosA.toFixed(4)}`,
        `A = cos⁻¹(${cosA.toFixed(4)}) ≈ ${AR}°`,
      ],
      hints: [`SSS (all 3 sides) → cosine rule for angle`, `cos(A) = (b² + c² − a²) / (2bc)`],
      calculatorAllowed: true,
      commonMistake: `Writing a² − b² − c² in the numerator — angle A is OPPOSITE side a, so the formula subtracts a²: (b² + c² − a²).`,
      examTip: `IGCSE: After computing the fraction, press cos⁻¹. Show this "A = cos⁻¹(…)" step explicitly in your working.`,
    };
  }
}

// ── age15-trig L3 — Angles of Elevation & Depression (fully random) ──────────

function genElevationDepression(): Problem {
  const variant = randInt(0, 3);
  // Avoid 45° in ratio-based variants: sin(45°) = cos(45°) would collapse distractors
  const ANGLES = [25, 30, 35, 40, 50, 55, 60, 65];

  if (variant === 0) {
    // Find vertical height: h = L·sin(θ)
    const LS = [8, 10, 12, 15, 20, 25];
    const L = LS[randInt(0, LS.length - 1)];
    const θ = ANGLES[randInt(0, ANGLES.length - 1)];
    const h = L * Math.sin(θ * Math.PI / 180);
    const hR = h.toFixed(1);
    const CTX = ['ladder', 'rope', 'scaffold pole', 'beam'];
    const ctx = CTX[randInt(0, CTX.length - 1)];
    const wCos = (L * Math.cos(θ * Math.PI / 180)).toFixed(1);
    const wTan = Math.min(L * Math.tan(θ * Math.PI / 180), 999).toFixed(1);
    const wDiv = (L / Math.sin(θ * Math.PI / 180)).toFixed(1);
    return {
      id: uid(),
      question: `A ${ctx} of length ${L} m makes an angle of ${θ}° with the ground.\n\nFind the vertical height it reaches. Give your answer to 1 d.p.`,
      correctAnswer: `${hR} m`,
      options: makeOptions(`${hR} m`, [`${wCos} m`, `${wTan} m`, `${wDiv} m`]),
      marks: 3,
      workingSteps: [
        `Draw a right triangle: ${ctx} is the hypotenuse (${L} m), angle = ${θ}°`,
        `sin(θ) = opposite / hypotenuse = height / ${L}`,
        `height = ${L} × sin(${θ}°)`,
        `≈ ${hR} m`,
      ],
      hints: [`The ${ctx} is the hypotenuse`, `Height is OPPOSITE the angle → use sin`],
      calculatorAllowed: true,
      commonMistake: `Using cos(${θ}°) instead of sin(${θ}°) — height is OPPOSITE the angle (sin), not adjacent to it (cos).`,
      examTip: `IGCSE: Label the triangle O-A-H first. Height = opposite → sin = O/H → height = H × sin(θ).`,
    };

  } else if (variant === 1) {
    // Find height from shadow: h = base·tan(θ)
    const BASES = [10, 12, 15, 18, 20, 24, 25, 30];
    const base = BASES[randInt(0, BASES.length - 1)];
    const θ = ANGLES[randInt(0, ANGLES.length - 1)];
    const h = base * Math.tan(θ * Math.PI / 180);
    const hR = h.toFixed(1);
    const CTX = ['flagpole', 'tree', 'building', 'tower'];
    const ctx = CTX[randInt(0, CTX.length - 1)];
    const wDiv = (base / Math.tan(θ * Math.PI / 180)).toFixed(1);
    const wSin = (base * Math.sin(θ * Math.PI / 180)).toFixed(1);
    return {
      id: uid(),
      question: `A ${ctx} casts a shadow of ${base} m when the angle of elevation of the sun is ${θ}°.\n\nFind the height of the ${ctx}. Give your answer to 1 d.p.`,
      correctAnswer: `${hR} m`,
      options: makeOptions(`${hR} m`, [`${wDiv} m`, `${wSin} m`, `${(parseFloat(hR) + 2.5).toFixed(1)} m`]),
      marks: 3,
      workingSteps: [
        `tan(θ) = opposite / adjacent = height / shadow`,
        `tan(${θ}°) = h / ${base}`,
        `h = ${base} × tan(${θ}°)`,
        `≈ ${hR} m`,
      ],
      hints: [`tan(angle) = height / shadow`, `height = shadow × tan(angle)`],
      calculatorAllowed: true,
      commonMistake: `Dividing instead of multiplying: ${base} / tan(${θ}°) = ${wDiv} m — height is on TOP, so multiply: ${base} × tan(${θ}°).`,
      examTip: `CAPS: tan = rise/run = height/shadow. Multiply both sides by shadow to get height = shadow × tan(θ).`,
    };

  } else if (variant === 2) {
    // Find horizontal distance from angle of depression: d = h/tan(θ)
    const HS = [15, 20, 25, 30, 40, 50];
    const h = HS[randInt(0, HS.length - 1)];
    const θ = ANGLES[randInt(0, ANGLES.length - 1)];
    const d = h / Math.tan(θ * Math.PI / 180);
    const dR = d.toFixed(1);
    const LOCS = ['cliff', 'tower', 'building', 'lighthouse'];
    const loc = LOCS[randInt(0, LOCS.length - 1)];
    const OBJS = ['boat', 'car', 'person', 'ship'];
    const obj = OBJS[randInt(0, OBJS.length - 1)];
    const wMult = (h * Math.tan(θ * Math.PI / 180)).toFixed(1);
    const wSin = (h / Math.sin(θ * Math.PI / 180)).toFixed(1);
    return {
      id: uid(),
      question: `From the top of a ${h} m ${loc}, the angle of depression to a ${obj} is ${θ}°.\n\nFind the horizontal distance to the ${obj}. Give your answer to 1 d.p.`,
      correctAnswer: `${dR} m`,
      options: makeOptions(`${dR} m`, [`${wMult} m`, `${wSin} m`, `${(parseFloat(dR) + 4).toFixed(1)} m`]),
      marks: 4,
      workingSteps: [
        `Angle of depression = angle of elevation (alternate angles) = ${θ}°`,
        `tan(${θ}°) = opposite / adjacent = height / distance`,
        `tan(${θ}°) = ${h} / d`,
        `d = ${h} / tan(${θ}°)`,
        `d ≈ ${dR} m`,
      ],
      hints: [`Angle of depression = angle of elevation from the ground`, `distance = height / tan(θ)`],
      calculatorAllowed: true,
      commonMistake: `Multiplying: ${h} × tan(${θ}°) = ${wMult} m — distance is the denominator, so DIVIDE: ${h} / tan(${θ}°).`,
      examTip: `IGCSE: Angle of depression = angle of elevation (Z-angles). Mark this on the diagram — it earns a method mark.`,
    };

  } else {
    // Find angle of inclination: θ = tan⁻¹(rise/run)
    const PAIRS = [
      [3, 4], [5, 12], [8, 15], [3, 5], [4, 5],
      [1, 2], [2, 3], [3, 2], [4, 3], [5, 3],
    ] as const;
    const [rise, run] = PAIRS[randInt(0, PAIRS.length - 1)];
    const θ = Math.atan(rise / run) * 180 / Math.PI;
    const θR = θ.toFixed(1);
    const wSwap = (Math.atan(run / rise) * 180 / Math.PI).toFixed(1);
    const CTX = ['ramp', 'hill', 'road', 'slope'];
    const ctx = CTX[randInt(0, CTX.length - 1)];
    return {
      id: uid(),
      question: `A ${ctx} rises ${rise} m vertically for every ${run} m measured horizontally.\n\nFind the angle of inclination. Give your answer to 1 d.p.`,
      correctAnswer: `${θR}°`,
      options: makeOptions(`${θR}°`, [`${wSwap}°`, `${(θ + 12).toFixed(1)}°`, `${Math.max(1, θ - 9).toFixed(1)}°`]),
      marks: 3,
      workingSteps: [
        `tan(θ) = rise / run = ${rise} / ${run}`,
        `θ = tan⁻¹(${rise} / ${run})`,
        `θ ≈ ${θR}°`,
      ],
      hints: [`tan(θ) = rise / run`, `Press tan⁻¹ (shift-tan) on your calculator`],
      calculatorAllowed: true,
      commonMistake: `Swapping rise and run: tan⁻¹(${run}/${rise}) = ${wSwap}° — that is the angle at the TOP of the slope, not the base.`,
      examTip: `CAPS: Rise over run. Rise = vertical (${rise}), Run = horizontal (${run}). Wrong order gives ${wSwap}° instead of ${θR}°.`,
    };
  }
}

// ── age15-stats L1 — Mean, Median, Mode & Grouped Data ───────────────────────

function genAverages(): Problem {
  const type = randInt(0, 2);
  const d = Array.from({ length: 5 }, () => randInt(1, 15)).sort((a, b) => a - b);
  const sum = d.reduce((a, b) => a + b, 0);

  if (type === 0) {
    const mean = sum / d.length;
    const correct = Number.isInteger(mean) ? `${mean}` : mean.toFixed(1);
    return {
      id: uid(),
      question: `Find the mean of:\n${d.join(', ')}`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${(mean + 1).toFixed(1)}`, `${(mean - 1).toFixed(1)}`, `${d[2]}`]),
      marks: 3,
      workingSteps: [`Sum = ${d.join(' + ')} = ${sum}`, `Mean = sum ÷ n = ${sum} ÷ ${d.length} = ${correct}`],
      hints: [`Add all values, then divide by how many there are`],
      calculatorAllowed: false,
      commonMistake: `Dividing by the largest value instead of the COUNT of values — divide by ${d.length} (how many numbers), not by ${d[d.length-1]}.`,
      examTip: `IGCSE: Show the sum step separately before dividing. Partial marks are awarded for the correct sum even if the division is wrong.`,
    };
  } else if (type === 1) {
    const median = d[2];
    return {
      id: uid(),
      question: `Find the median of:\n${d.join(', ')}`,
      correctAnswer: `${median}`,
      options: makeOptions(`${median}`, [`${d[1]}`, `${d[3]}`, `${Math.round(sum / d.length)}`]),
      marks: 2,
      workingSteps: [`Data is already sorted: ${d.join(', ')}`, `5 values → middle value is position 3`, `Median = ${median}`],
      hints: [`Sort the data (it's sorted here)`, `Middle value of 5 is the 3rd one`],
      calculatorAllowed: false,
      commonMistake: `Picking the mean instead of the middle value — the median is the MIDDLE data point when sorted, not the average.`,
      examTip: `CAPS: For an even number of values, average the two middle values. For odd, take the exact middle.`,
    };
  } else {
    const modeVal = d[randInt(0, 3)];
    const withMode = [...d, modeVal].sort((a, b) => a - b);
    return {
      id: uid(),
      question: `Find the mode of:\n${withMode.join(', ')}`,
      correctAnswer: `${modeVal}`,
      options: makeOptions(`${modeVal}`, [`${withMode[0]}`, `${withMode[withMode.length - 1]}`, `${withMode[2]}`]),
      marks: 2,
      workingSteps: [`Count each value's frequency`, `${modeVal} appears twice; all others appear once`, `Mode = ${modeVal}`],
      hints: [`The mode is the value that appears MOST often`],
      calculatorAllowed: false,
      commonMistake: `Confusing mode with median — mode is the MOST FREQUENT value, median is the MIDDLE value.`,
      examTip: `IGCSE: A dataset can have no mode, one mode, or multiple modes. State "no mode" if all values appear once.`,
    };
  }
}

// ── age15-stats L2 — Box Plots & Cumulative Frequency ────────────────────────

function genBoxPlot(): Problem {
  const d = Array.from({ length: 9 }, () => randInt(10, 50)).sort((a, b) => a - b);
  const q1 = d[2], q2 = d[4], q3 = d[6];
  const iqr = q3 - q1;
  const type = randInt(0, 1);

  if (type === 0) {
    return {
      id: uid(),
      question: `Dataset (ordered):\n${d.join(', ')}\n\nQ1 = ${q1}, Q3 = ${q3}\nFind the IQR.`,
      correctAnswer: `${iqr}`,
      options: makeOptions(`${iqr}`, [`${iqr + 1}`, `${iqr - 1}`, `${q3}`]),
      marks: 3,
      workingSteps: [`IQR = Q3 − Q1`, `IQR = ${q3} − ${q1} = ${iqr}`],
      hints: [`IQR = Interquartile Range = Q3 minus Q1`],
      calculatorAllowed: false,
      commonMistake: `Using Q2 (median) instead of Q3 in the formula — IQR = Q3 − Q1, not Q2 − Q1.`,
      examTip: `CAPS: The IQR measures spread of the middle 50% of data. A smaller IQR means data is more consistent.`,
    };
  } else {
    return {
      id: uid(),
      question: `Dataset (ordered):\n${d.join(', ')}\n\nFind the median (Q2).`,
      correctAnswer: `${q2}`,
      options: makeOptions(`${q2}`, [`${d[3]}`, `${d[5]}`, `${Math.round((q1 + q3) / 2)}`]),
      marks: 2,
      workingSteps: [`9 values → median is the 5th value`, `Median = ${q2}`],
      hints: [`With n=9 values, the middle is position (9+1)/2 = 5`],
      calculatorAllowed: false,
      commonMistake: `Picking the 4th or 6th value instead of the 5th — for 9 values, the median is at position (9+1)/2 = 5.`,
      examTip: `IGCSE: Use the formula position = (n+1)/2 to find the median's position. Write this step explicitly.`,
    };
  }
}

// ── age15-prob L1 — Venn & Tree Diagrams ─────────────────────────────────────

const COLOURS = ['red', 'blue', 'green', 'yellow', 'white'];

function genVennTree(): Problem {
  const type = randInt(0, 1);

  if (type === 0) {
    const total = 10;
    const pA = randInt(2, 5), pB = randInt(2, 5);
    const pAB = randInt(1, Math.min(pA, pB) - 1);
    const pAuB = pA + pB - pAB;
    const correct = simplify(pAuB, total);
    return {
      id: uid(),
      question: `In a group of ${total} students:\nP(A) = ${pA}/${total},  P(B) = ${pB}/${total},  P(A∩B) = ${pAB}/${total}\n\nFind P(A∪B)`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        simplify(pAuB + 1, total),
        simplify(pA + pB, total),
        simplify(pAuB - 1, total),
      ]),
      marks: 3,
      workingSteps: [
        `P(A∪B) = P(A) + P(B) − P(A∩B)`,
        `= ${pA}/${total} + ${pB}/${total} − ${pAB}/${total}`,
        `= ${pAuB}/${total} = ${correct}`,
      ],
      hints: [`Addition rule: P(A∪B) = P(A) + P(B) − P(A∩B)`, `Subtract the overlap to avoid double-counting`],
      calculatorAllowed: false,
      commonMistake: `Forgetting to subtract the intersection — just adding P(A)+P(B) double-counts everyone in both sets.`,
      examTip: `IGCSE: Draw a Venn diagram first. Fill in the intersection ${pAB}/${total}, then the exclusive parts. Counts should total ${total}.`,
    };
  } else {
    const total = randInt(8, 12);
    const fav = randInt(1, total - 1);
    const comp = total - fav;
    const colour = COLOURS[randInt(0, COLOURS.length - 1)];
    const correct = simplify(comp, total);
    return {
      id: uid(),
      question: `A bag has ${total} marbles: ${fav} are ${colour}.\n\nFind P(not ${colour}).`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        simplify(fav, total),
        simplify(comp + 1, total),
        simplify(comp - 1, total),
      ]),
      marks: 3,
      workingSteps: [
        `P(${colour}) = ${fav}/${total}`,
        `P(not ${colour}) = 1 − ${fav}/${total}`,
        `= ${comp}/${total} = ${correct}`,
      ],
      hints: [`Complement rule: P(not A) = 1 − P(A)`],
      calculatorAllowed: false,
      commonMistake: `Writing P(not ${colour}) = P(${colour}) — the complement is 1 MINUS P(A), not equal to it.`,
      examTip: `CAPS: Complement rule: P(A') = 1 − P(A). Write this formula before substituting.`,
    };
  }
}

// ── age15-prob L2 — Compound Interest & Growth/Decay ─────────────────────────

function genCompoundInterest(): Problem {
  const P = [500, 1000, 2000, 5000][randInt(0, 3)];
  const r = [5, 8, 10, 12][randInt(0, 3)];
  const n = [2, 3][randInt(0, 1)];
  const type = randInt(0, 1);

  if (type === 0) {
    const A = Math.round(P * Math.pow(1 + r / 100, n));
    const correct = `R${A.toLocaleString()}`;
    const simple  = Math.round(P * (1 + (r * n) / 100));
    return {
      id: uid(),
      question: `R${P.toLocaleString()} invested at ${r}% p.a. compound interest for ${n} years.\n\nFind the final amount.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `R${simple.toLocaleString()}`,
        `R${(A + 100).toLocaleString()}`,
        `R${(A - 100).toLocaleString()}`,
      ]),
      marks: 3,
      workingSteps: [`A = P(1 + r/100)^n`, `A = ${P}(1 + ${r}/100)^${n}`, `A = ${P} × ${(1+r/100).toFixed(3)}^${n}`, `A ≈ ${correct}`],
      hints: [`Formula: A = P(1+i)^n  where i = rate/100`, `Don't use simple interest formula here`],
      calculatorAllowed: true,
      commonMistake: `Using simple interest (P × r × n) instead of compound — compound uses exponents: A = P(1+i)^n.`,
      examTip: `IGCSE: Convert the rate first: ${r}% → i = ${r}/100 = ${(r/100).toFixed(2)}. Then raise to the power of ${n} years.`,
    };
  } else {
    const A = Math.round(P * Math.pow(1 - r / 100, n));
    const correct = `R${A.toLocaleString()}`;
    const linear  = Math.round(P * (1 - (r * n) / 100));
    return {
      id: uid(),
      question: `A car worth R${P.toLocaleString()} depreciates at ${r}% p.a. compound for ${n} years.\n\nFind its value after ${n} years.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `R${linear.toLocaleString()}`,
        `R${(A + 200).toLocaleString()}`,
        `R${(A - 200).toLocaleString()}`,
      ]),
      marks: 3,
      workingSteps: [`A = P(1 − r/100)^n`, `A = ${P}(1 − ${r}/100)^${n}`, `A ≈ ${correct}`],
      hints: [`Depreciation uses MINUS in the bracket: (1 − r/100)^n`],
      calculatorAllowed: true,
      commonMistake: `Using a plus sign: P(1+r/100)^n gives growth, not depreciation. Depreciation needs MINUS: (1 − r/100)^n.`,
      examTip: `CAPS: State which formula you're using (growth vs decay) and why. The reason earns a communication mark.`,
    };
  }
}

// ── age15-numbers L4 — Sequences & Series ────────────────────────────────────

function genSequences(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    // Arithmetic: find nth term
    const a = randInt(1, 10);
    const d = randInt(1, 8);
    const n = randInt(5, 12);
    const correct = `${a + (n - 1) * d}`;
    const tn = `${a} + (n−1)×${d}`;
    return {
      id: uid(),
      question: `Arithmetic sequence: first term ${a}, common difference ${d}.\n\nFind T${n}.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `${a + n * d}`,
        `${a + (n - 2) * d}`,
        `${a * d * n}`,
        `${a + (n - 3) * d}`,
        `${a + (n + 1) * d}`,
      ]),
      marks: 3,
      workingSteps: [
        `Tₙ = a + (n−1)d`,
        `T${n} = ${a} + (${n}−1) × ${d}`,
        `T${n} = ${a} + ${(n - 1) * d} = ${a + (n - 1) * d}`,
      ],
      hints: [`Formula: Tₙ = a + (n−1)d`, `Substitute a = ${a}, d = ${d}, n = ${n}`],
      calculatorAllowed: false,
      commonMistake: `Using n instead of (n−1) — the formula is a + (n−1)d, not a + nd. T1 should equal ${a}, not ${a + d}.`,
      examTip: `CAPS always gives first 3 terms. Verify d by checking T2 − T1 and T3 − T2 are equal before substituting.`,
    };
  } else if (type === 1) {
    // Find the nth term formula
    const a = randInt(2, 8);
    const d = randInt(2, 6);   // d ≥ 2 keeps the formula in clean "dn + c" form
    const t1 = a, t2 = a + d, t3 = a + 2 * d, t4 = a + 3 * d;
    const c0 = a - d;          // intercept of Tₙ = dn + c0
    const fmtLin = (coef: number, c: number) =>
      `Tₙ = ${coef}n ${c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`}`;
    const correct = fmtLin(d, c0);
    return {
      id: uid(),
      question: `Sequence: ${t1}, ${t2}, ${t3}, ${t4}, …\n\nFind the general term (nth term).`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        fmtLin(d, a),          // forgot to subtract d from a
        fmtLin(d, c0 + 1),     // intercept off by one
        fmtLin(d, c0 - 1),     // intercept off by one
        fmtLin(d + 1, c0),     // wrong common difference
        fmtLin(a, d),          // swapped coefficient and intercept
      ]),
      marks: 3,
      workingSteps: [
        `Common difference d = ${t2} − ${t1} = ${d}`,
        `Tₙ = a + (n−1)d = ${a} + (n−1)×${d}`,
        `Tₙ = ${a} + ${d}n − ${d} = ${d}n ${c0 >= 0 ? `+ ${c0}` : `− ${Math.abs(c0)}`}`,
      ],
      hints: [`Find d first: d = T2 − T1`, `Then expand Tₙ = a + (n−1)d`],
      calculatorAllowed: false,
      commonMistake: `Writing Tₙ = a + nd instead of a + (n−1)d — always expand the brackets to get the simplified form.`,
      examTip: `IGCSE: Check your formula: substitute n=1 → should give ${t1}; n=2 → should give ${t2}.`,
    };
  } else {
    // Geometric: find nth term
    const a = randInt(1, 4);
    const r = [2, 3][randInt(0, 1)];
    const n = randInt(4, 7);
    const correct = `${a * Math.pow(r, n - 1)}`;
    return {
      id: uid(),
      question: `Geometric sequence: first term ${a}, common ratio ${r}.\n\nFind T${n}.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `${a * Math.pow(r, n)}`,
        `${a * Math.pow(r, n - 2)}`,
        `${a * r * n}`,
        `${a * Math.pow(r, n - 3)}`,
        `${a * Math.pow(r, n + 1)}`,
      ]),
      marks: 3,
      workingSteps: [
        `Tₙ = a × rⁿ⁻¹`,
        `T${n} = ${a} × ${r}^(${n}−1)`,
        `T${n} = ${a} × ${r}^${n - 1} = ${a * Math.pow(r, n - 1)}`,
      ],
      hints: [`Geometric formula: Tₙ = a × rⁿ⁻¹`, `r is multiplied, not added`],
      calculatorAllowed: false,
      commonMistake: `Using rⁿ instead of rⁿ⁻¹ — T1 must equal a (no multiplication by r yet), so the exponent is n−1 not n.`,
      examTip: `IGCSE sometimes gives T5 and T8 instead of T1. Find r first using Tₙ = a×rⁿ⁻¹ for both, then divide.`,
    };
  }
}

// ── age15-numbers L5 — Logarithms ────────────────────────────────────────────

function genLogs(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    // Convert between log and exponential form
    const base = [2, 3, 5][randInt(0, 2)];
    const exp  = randInt(2, 4);
    const val  = Math.pow(base, exp);
    const correct = `${exp}`;
    return {
      id: uid(),
      question: `Evaluate without a calculator:\nlog${base}(${val})`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${exp - 1}`, `${exp + 1}`, `${val}`]),
      marks: 2,
      workingSteps: [
        `log${base}(${val}) = x means ${base}^x = ${val}`,
        `${base}^${exp} = ${val}`,
        `Therefore x = ${exp}`,
      ],
      hints: [`log_b(x) = n means b^n = x`, `Ask: ${base} to what power gives ${val}?`],
      calculatorAllowed: false,
      commonMistake: `Dividing ${val} by ${base} once — you need to find how many times ${base} is multiplied by itself to reach ${val}, which is ${exp} times.`,
      examTip: `IGCSE: Rewrite as an exponential equation first: log${base}(${val}) = x → ${base}^x = ${val}. Then solve by inspection.`,
    };
  } else if (type === 1) {
    // Log law: product
    const base = [2, 10][randInt(0, 1)];
    const a = randInt(2, 6), b = randInt(2, 6);
    const correct = `log${base}(${a * b})`;
    return {
      id: uid(),
      question: `Simplify using log laws:\nlog${base}(${a}) + log${base}(${b})`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `log${base}(${a + b})`,
        `log${base}(${a}) × log${base}(${b})`,
        `log${base}(${a * b + 1})`,
        `log${base}(${a * b - 1})`,
      ]),
      marks: 2,
      workingSteps: [
        `Product law: log_b(m) + log_b(n) = log_b(mn)`,
        `log${base}(${a}) + log${base}(${b}) = log${base}(${a}×${b})`,
        `= log${base}(${a * b})`,
      ],
      hints: [`Product law: log(m) + log(n) = log(mn)`],
      calculatorAllowed: false,
      commonMistake: `Adding the arguments: log(${a}) + log(${b}) ≠ log(${a + b}). The product law multiplies the arguments, never adds them.`,
      examTip: `CAPS: Three log laws to memorise — product (×), quotient (÷), power. State the law name before applying it.`,
    };
  } else {
    // Log law: power
    const base = [2, 10][randInt(0, 1)];
    const a = randInt(2, 6), p = randInt(2, 4);
    const correct = `${p}·log${base}(${a})`;
    return {
      id: uid(),
      question: `Use the power law to simplify:\nlog${base}(${a}^${p})`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `log${base}(${a * p})`,
        `${p + 1}·log${base}(${a})`,
        `log${base}(${a})^${p}`,
      ]),
      marks: 2,
      workingSteps: [
        `Power law: log_b(mⁿ) = n·log_b(m)`,
        `log${base}(${a}^${p}) = ${p}·log${base}(${a})`,
      ],
      hints: [`Power law: log(mⁿ) = n·log(m)`, `The exponent moves to the front as a multiplier`],
      calculatorAllowed: false,
      commonMistake: `Leaving the exponent inside: log(${a}^${p}) ≠ log(${a})^${p}. The power law brings the exponent OUT as a coefficient.`,
      examTip: `IGCSE: The power law is the most tested log law. Bring the power to the front: log(aⁿ) = n·log(a).`,
    };
  }
}

// ── age15-trig L4 — Bearings ──────────────────────────────────────────────────

function genBearings(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    // Back bearing
    const bearing = randInt(0, 179);
    const back = bearing + 180;
    const correct = `${back}°`;
    return {
      id: uid(),
      question: `A ship sails on a bearing of ${String(bearing).padStart(3, '0')}°.\n\nWhat is the back bearing (return journey)?`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${back + 10}°`, `${bearing}°`, `${360 - bearing}°`]),
      marks: 2,
      workingSteps: [
        `Back bearing = forward bearing + 180°`,
        `= ${bearing}° + 180° = ${back}°`,
      ],
      hints: [`Add 180° to get the reverse direction`, `Bearings are always 3 digits, measured clockwise from North`],
      calculatorAllowed: false,
      commonMistake: `Subtracting 180° when the bearing is under 180° — always ADD 180° when the original bearing < 180°.`,
      examTip: `IGCSE: Always write bearings as 3 digits (e.g. 045°, not 45°). Both the value and format are marked.`,
    };
  } else if (type === 1) {
    // Distance and bearing calculation
    const dist = randInt(5, 15) * 10;
    const bearingDeg = [0, 90, 180, 270][randInt(0, 3)];
    const dirs: Record<number, string> = { 0: 'North', 90: 'East', 180: 'South', 270: 'West' };
    const correct = `${dist} km ${dirs[bearingDeg]}`;
    return {
      id: uid(),
      question: `A plane flies ${dist} km on a bearing of ${String(bearingDeg).padStart(3, '0')}°.\n\nDescribe the direction of travel.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `${dist} km ${dirs[(bearingDeg + 90) % 360]}`,
        `${dist + 10} km ${dirs[bearingDeg]}`,
        `${dist} km ${dirs[(bearingDeg + 180) % 360]}`,
      ]),
      marks: 2,
      workingSteps: [
        `Bearing 000° = North, 090° = East, 180° = South, 270° = West`,
        `Bearing ${String(bearingDeg).padStart(3, '0')}° → travelling ${dirs[bearingDeg]}`,
      ],
      hints: [`000° = North, 090° = East, 180° = South, 270° = West`],
      calculatorAllowed: false,
      commonMistake: `Confusing bearing 090° with West — bearings increase CLOCKWISE from North, so 090° is East.`,
      examTip: `CAPS: Draw a North arrow at the starting point, then measure the angle clockwise. Always label N on your diagram.`,
    };
  } else {
    // Trig with bearings: find distance
    const [opp, adj, hyp] = PYTH_TRIPLES[randInt(0, PYTH_TRIPLES.length - 1)];
    const correct = `${hyp} km`;
    return {
      id: uid(),
      question: `From town A, town B is ${adj} km East and ${opp} km North.\n\nFind the straight-line distance from A to B.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${hyp + 1} km`, `${hyp - 1} km`, `${adj + opp} km`]),
      marks: 3,
      workingSteps: [
        `Draw a right-angled triangle: East = ${adj}, North = ${opp}`,
        `d² = ${adj}² + ${opp}² = ${adj * adj} + ${opp * opp} = ${adj * adj + opp * opp}`,
        `d = √${adj * adj + opp * opp} = ${hyp} km`,
      ],
      hints: [`Draw the right triangle first`, `Use Pythagoras: d² = east² + north²`],
      calculatorAllowed: true,
      commonMistake: `Adding the two distances directly (${adj} + ${opp} = ${adj + opp}) — Pythagoras requires squaring first, then square-rooting.`,
      examTip: `IGCSE: Always draw a sketch with the North arrow and right-angle marked. This earns a diagram mark before any calculation.`,
    };
  }
}

// ── age15-trig L5 — 3D Trigonometry ──────────────────────────────────────────

function gen3DTrig(): Problem {
  const type = randInt(0, 1);

  if (type === 0) {
    // 3D Pythagoras: space diagonal of a cuboid
    const l = randInt(2, 6), w = randInt(2, 6), h = randInt(2, 6);
    const base = Math.sqrt(l * l + w * w);
    const diag = Math.sqrt(l * l + w * w + h * h);
    const correct = `√${l * l + w * w + h * h} ≈ ${diag.toFixed(1)} cm`;
    return {
      id: uid(),
      question: `A cuboid has length ${l} cm, width ${w} cm, height ${h} cm.\n\nFind the length of the space diagonal (corner to corner).`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `√${l * l + w * w + h * h + 2} ≈ ${Math.sqrt(l * l + w * w + h * h + 2).toFixed(1)} cm`,
        `${l + w + h} cm`,
        `√${l * l + w * w} ≈ ${base.toFixed(1)} cm`,
      ]),
      marks: 4,
      workingSteps: [
        `Step 1: Base diagonal d₁ = √(${l}² + ${w}²) = √${l * l + w * w}`,
        `Step 2: Space diagonal d = √(d₁² + ${h}²) = √(${l * l + w * w} + ${h * h})`,
        `d = √${l * l + w * w + h * h} ≈ ${diag.toFixed(1)} cm`,
      ],
      hints: [`Apply Pythagoras twice: first on the base, then involving height`, `d = √(l² + w² + h²)`],
      calculatorAllowed: true,
      commonMistake: `Using only two dimensions — 3D Pythagoras uses ALL THREE: d = √(l² + w² + h²).`,
      examTip: `IGCSE: Draw the cuboid and label the base diagonal first. Show both Pythagoras steps — each earns a method mark.`,
    };
  } else {
    // Angle between a line and a plane
    const [opp, adj] = PYTH_TRIPLES[randInt(0, 2)].slice(0, 2);
    const angle = Math.round(Math.atan(opp / adj) * 180 / Math.PI);
    const correct = `${angle}°`;
    return {
      id: uid(),
      question: `A ramp rises ${opp} m over a horizontal distance of ${adj} m.\n\nFind the angle the ramp makes with the ground.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${angle + 5}°`, `${angle - 5}°`, `${90 - angle}°`]),
      marks: 3,
      workingSteps: [
        `tan(θ) = opposite/adjacent = ${opp}/${adj}`,
        `θ = tan⁻¹(${opp}/${adj})`,
        `θ ≈ ${angle}°`,
      ],
      hints: [`tan(θ) = rise/run`, `Use tan⁻¹ (inverse tan) to find the angle`],
      calculatorAllowed: true,
      commonMistake: `Using sin or cos instead of tan — when you have the opposite and adjacent sides (not hypotenuse), use tan.`,
      examTip: `CAPS: Identify which two sides you know before choosing sin, cos, or tan. Draw and label the triangle first.`,
    };
  }
}

// ── age15-geometry L4 — Vectors Intro ────────────────────────────────────────

function genVectors(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    // Magnitude of a vector
    const [a, b, mag] = PYTH_TRIPLES[randInt(0, PYTH_TRIPLES.length - 1)];
    const correct = `${mag}`;
    return {
      id: uid(),
      question: `Vector v = (${a}, ${b}).\n\nFind |v|, the magnitude of v.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${mag + 1}`, `${mag - 1}`, `${a + b}`]),
      marks: 2,
      workingSteps: [
        `|v| = √(x² + y²)`,
        `|v| = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${a * a + b * b} = ${mag}`,
      ],
      hints: [`|v| = √(x² + y²)`, `Use Pythagoras on the components`],
      calculatorAllowed: false,
      commonMistake: `Adding the components without squaring: ${a} + ${b} = ${a + b} ≠ ${mag}. You must square each component first.`,
      examTip: `IGCSE: Magnitude is always positive. If your answer is negative, you've made an error — check your squaring.`,
    };
  } else if (type === 1) {
    // Vector addition
    const x1 = randInt(1, 5), y1 = randInt(1, 5);
    const x2 = randInt(1, 5), y2 = randInt(1, 5);
    const correct = `(${x1 + x2}, ${y1 + y2})`;
    return {
      id: uid(),
      question: `a = (${x1}, ${y1})  and  b = (${x2}, ${y2}).\n\nFind a + b.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `(${x1 + x2 + 1}, ${y1 + y2})`,
        `(${x1 * x2}, ${y1 * y2})`,
        `(${x1 - x2}, ${y1 - y2})`,
      ]),
      marks: 2,
      workingSteps: [
        `Add corresponding components`,
        `a + b = (${x1}+${x2}, ${y1}+${y2}) = (${x1 + x2}, ${y1 + y2})`,
      ],
      hints: [`Add x-components together, y-components together`],
      calculatorAllowed: false,
      commonMistake: `Multiplying components — vector addition adds corresponding components: (x₁+x₂, y₁+y₂), not (x₁×x₂, y₁×y₂).`,
      examTip: `CAPS: Column vector notation — add top to top, bottom to bottom. Never mix rows.`,
    };
  } else {
    // Scalar multiplication
    const k = randInt(2, 5), x = randInt(1, 6), y = randInt(1, 6);
    const correct = `(${k * x}, ${k * y})`;
    return {
      id: uid(),
      question: `v = (${x}, ${y})\n\nFind ${k}v.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `(${k * x + 1}, ${k * y})`,
        `(${x + k}, ${y + k})`,
        `(${k * x}, ${k * y + 1})`,
      ]),
      marks: 2,
      workingSteps: [
        `Scalar multiplication: multiply each component by the scalar`,
        `${k}v = (${k}×${x}, ${k}×${y}) = (${k * x}, ${k * y})`,
      ],
      hints: [`Multiply every component by the scalar ${k}`],
      calculatorAllowed: false,
      commonMistake: `Adding the scalar instead of multiplying — ${k}v means multiply, giving (${k * x}, ${k * y}), not (${x + k}, ${y + k}).`,
      examTip: `IGCSE: Scalar multiplication scales the vector's magnitude by k but preserves its direction (if k > 0).`,
    };
  }
}

// ── age15-functions L1 — Functions, Domain & Range ───────────────────────────

function genFunctionsDomain(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    // Evaluate a function
    const a = randInt(2, 5), b = randInt(1, 8), x = randInt(1, 5);
    const val = a * x + b;
    const correct = `${val}`;
    return {
      id: uid(),
      question: `f(x) = ${a}x + ${b}\n\nFind f(${x}).`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${val + a}`, `${val - b}`, `${a + b + x}`]),
      marks: 2,
      workingSteps: [
        `Substitute x = ${x} into f(x)`,
        `f(${x}) = ${a}(${x}) + ${b} = ${a * x} + ${b} = ${val}`,
      ],
      hints: [`Replace every x with ${x}`, `Then simplify`],
      calculatorAllowed: false,
      commonMistake: `Substituting into only part of the expression — replace EVERY x: f(${x}) = ${a}×${x} + ${b}, not ${a} + ${b}.`,
      examTip: `IGCSE: Write the substitution step explicitly. f(${x}) = ... earns a method mark even if the arithmetic is wrong.`,
    };
  } else if (type === 1) {
    // Composite function
    const a = randInt(2, 4), b = randInt(1, 5), c = randInt(1, 4), x = randInt(1, 4);
    const gx = c * x + 1;
    const fgx = a * gx + b;
    const correct = `${fgx}`;
    return {
      id: uid(),
      question: `f(x) = ${a}x + ${b}  and  g(x) = ${c}x + 1\n\nFind fg(${x}).`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${fgx + a}`, `${a * c * x + b + 1}`, `${fgx - c}`]),
      marks: 3,
      workingSteps: [
        `fg(x) means f(g(x)) — apply g first, then f`,
        `g(${x}) = ${c}(${x}) + 1 = ${gx}`,
        `f(${gx}) = ${a}(${gx}) + ${b} = ${a * gx} + ${b} = ${fgx}`,
      ],
      hints: [`fg(x) = f(g(x)) — work from the inside out`, `Find g(${x}) first, then put that into f`],
      calculatorAllowed: false,
      commonMistake: `Applying f first then g — fg(x) means f(g(x)), so g is applied first (inner function), then f (outer function).`,
      examTip: `CAPS: fg ≠ gf in general. Always identify the inner function (right-most) and evaluate it first.`,
    };
  } else {
    // Inverse function
    const a = randInt(2, 5), b = randInt(1, 8);
    const numStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
    const correct = `f⁻¹(x) = (x − ${b}) / ${a}`;
    return {
      id: uid(),
      question: `f(x) = ${a}x + ${b}\n\nFind f⁻¹(x), the inverse function.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `f⁻¹(x) = (x + ${b}) / ${a}`,
        `f⁻¹(x) = ${a}x − ${b}`,
        `f⁻¹(x) = (x − ${b}) × ${a}`,
      ]),
      marks: 3,
      workingSteps: [
        `Write y = ${a}x + ${b}`,
        `Swap x and y: x = ${a}y + ${b}`,
        `Solve for y: ${a}y = x − ${b}`,
        `f⁻¹(x) = (x − ${b}) / ${a}`,
      ],
      hints: [`Replace f(x) with y, then swap x and y`, `Solve the new equation for y`],
      calculatorAllowed: false,
      commonMistake: `Writing 1/f(x) = 1/(${a}x+${b}) — f⁻¹ means the INVERSE FUNCTION (swap x and y, solve), not the reciprocal.`,
      examTip: `IGCSE: Always verify: f(f⁻¹(x)) should equal x. Substitute back as a check step.`,
    };
  }
}

// ── age15-functions L2 — Graph Sketching & Transformations ───────────────────

function genFunctionsGraphs(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    // y = mx + c: identify gradient and y-intercept
    const m = (randInt(-4, 4) || 2);
    const c = randInt(-5, 5);
    const cStr = c >= 0 ? `+ ${c}` : `− ${Math.abs(c)}`;
    const correct = `gradient = ${m}, y-intercept = ${c}`;
    return {
      id: uid(),
      question: `Line equation: y = ${m}x ${cStr}\n\nState the gradient and y-intercept.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `gradient = ${c}, y-intercept = ${m}`,
        `gradient = ${m + 1}, y-intercept = ${c}`,
        `gradient = ${m}, y-intercept = ${c + 1}`,
      ]),
      marks: 2,
      workingSteps: [`y = mx + c form`, `m = ${m} (gradient), c = ${c} (y-intercept)`],
      hints: [`y = mx + c: m is the gradient, c is the y-intercept`],
      calculatorAllowed: false,
      commonMistake: `Swapping m and c — in y = mx + c, the NUMBER in FRONT of x is the gradient, the constant at the end is the y-intercept.`,
      examTip: `CAPS: If the equation is not in y = mx + c form, rearrange it first before reading off m and c.`,
    };
  } else if (type === 1) {
    // Translation of a function
    const h = randInt(1, 5), k = randInt(1, 5);
    const correct = `y = x² translated ${h} right and ${k} up`;
    return {
      id: uid(),
      question: `Describe the transformation from y = x² to y = (x − ${h})² + ${k}.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `y = x² translated ${h} left and ${k} up`,
        `y = x² translated ${h} right and ${k} down`,
        `y = x² stretched by factor ${h} and shifted ${k} up`,
      ]),
      marks: 2,
      workingSteps: [
        `y = f(x − h) + k is a translation by vector (h, k)`,
        `(x − ${h}) → shift ${h} to the RIGHT`,
        `+ ${k} → shift ${k} UP`,
      ],
      hints: [`(x − h) shifts RIGHT (counter-intuitive)`, `+ k outside shifts UP`],
      calculatorAllowed: false,
      commonMistake: `Saying (x − ${h}) shifts left — subtracting h inside the function shifts the graph to the RIGHT, not left.`,
      examTip: `IGCSE: The translation vector for y = f(x−h)+k is (h, k). Memorise: minus inside → move right.`,
    };
  } else {
    // Roots and turning point of quadratic
    const p = randInt(1, 4), q = randInt(1, 4);
    const B = -(p + q), C = p * q;
    const bStr = B >= 0 ? `+ ${B}` : `− ${Math.abs(B)}`;
    const cStr = C >= 0 ? `+ ${C}` : `− ${Math.abs(C)}`;
    const tp = `(${(p + q) / 2}, ${-((p + q) / 2 - p) * ((p + q) / 2 - q)})`;
    const correct = `roots: x = ${p} and x = ${q}`;
    return {
      id: uid(),
      question: `y = x² ${bStr}x ${cStr}\n\nFind the x-intercepts (roots).`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `roots: x = ${p + 1} and x = ${q}`,
        `roots: x = −${p} and x = −${q}`,
        `roots: x = ${p} and x = ${q + 1}`,
      ]),
      marks: 3,
      workingSteps: [
        `Set y = 0: x² ${bStr}x ${cStr} = 0`,
        `Factorise: (x − ${p})(x − ${q}) = 0`,
        `x = ${p}  or  x = ${q}`,
      ],
      hints: [`Set y = 0 and solve`, `Factorise the quadratic`],
      calculatorAllowed: false,
      commonMistake: `Reading roots as −${p} and −${q} — from (x−${p})(x−${q})=0, roots are POSITIVE ${p} and ${q}, not their negatives.`,
      examTip: `CAPS: After finding roots, verify by substituting back: f(${p}) should equal 0.`,
    };
  }
}

// ── age15-matrices L1 — Transformations & Matrices ───────────────────────────

function genTransformations(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    // Reflection in y = x
    const x = randInt(1, 5), y = randInt(1, 5);
    const correct = `(${y}, ${x})`;
    return {
      id: uid(),
      question: `Point A = (${x}, ${y}).\n\nFind the image of A after reflection in the line y = x.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`(−${x}, ${y})`, `(${x}, −${y})`, `(−${y}, −${x})`]),
      marks: 2,
      workingSteps: [
        `Reflection in y = x: swap the x and y coordinates`,
        `A(${x}, ${y}) → A'(${y}, ${x})`,
      ],
      hints: [`Reflection in y = x: swap coordinates`, `(x, y) → (y, x)`],
      calculatorAllowed: false,
      commonMistake: `Negating the coordinates — reflection in y = x SWAPS them: (${x},${y}) → (${y},${x}), not (−${x},−${y}).`,
      examTip: `IGCSE: Know all four standard reflections: x-axis (y→−y), y-axis (x→−x), y=x (swap), y=−x (swap+negate).`,
    };
  } else if (type === 1) {
    // Rotation 90° clockwise about origin
    const x = randInt(1, 5), y = randInt(1, 5);
    const correct = `(${y}, −${x})`;
    return {
      id: uid(),
      question: `Point P = (${x}, ${y}).\n\nFind the image of P after a 90° clockwise rotation about the origin.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`(−${y}, ${x})`, `(−${x}, −${y})`, `(${x}, −${y})`]),
      marks: 2,
      workingSteps: [
        `90° clockwise: (x, y) → (y, −x)`,
        `P(${x}, ${y}) → P'(${y}, −${x})`,
      ],
      hints: [`90° CW: (x, y) → (y, −x)`, `90° CCW: (x, y) → (−y, x)`],
      calculatorAllowed: false,
      commonMistake: `Using the anticlockwise rule — clockwise 90°: (x,y)→(y,−x). Anticlockwise 90°: (x,y)→(−y,x). Don't mix them.`,
      examTip: `CAPS: Rotation direction matters. Clockwise is negative in standard convention. Always state centre and direction.`,
    };
  } else {
    // Enlargement
    const k = randInt(2, 4);
    const x = randInt(1, 4), y = randInt(1, 4);
    const correct = `(${k * x}, ${k * y})`;
    return {
      id: uid(),
      question: `Point Q = (${x}, ${y}).\n\nFind the image of Q after enlargement with scale factor ${k}, centre the origin.`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `(${k * x + 1}, ${k * y})`,
        `(${x + k}, ${y + k})`,
        `(${k * x}, ${k * y + 1})`,
      ]),
      marks: 2,
      workingSteps: [
        `Enlargement from origin: multiply each coordinate by scale factor`,
        `Q(${x}, ${y}) → Q'(${k}×${x}, ${k}×${y}) = (${k * x}, ${k * y})`,
      ],
      hints: [`Multiply both coordinates by the scale factor`, `Centre at origin → no shift needed`],
      calculatorAllowed: false,
      commonMistake: `Adding the scale factor instead of multiplying — enlargement by factor ${k} means ×${k}, giving (${k*x},${k*y}), not (${x+k},${y+k}).`,
      examTip: `IGCSE: Area scale factor = (length scale factor)². If sides scale by ${k}, area scales by ${k*k}.`,
    };
  }
}

// ── age15-matrices L2 — 2×2 Matrix Operations ────────────────────────────────

function genMatrices(): Problem {
  const type = randInt(0, 1);

  if (type === 0) {
    // Matrix multiplication 2×2
    const a = randInt(1, 3), b = randInt(1, 3), c = randInt(1, 3), d = randInt(1, 3);
    const e = randInt(1, 3), f = randInt(1, 3), g = randInt(1, 3), h = randInt(1, 3);
    const r1c1 = a * e + b * g, r1c2 = a * f + b * h;
    const r2c1 = c * e + d * g, r2c2 = c * f + d * h;
    const correct = `(${r1c1} ${r1c2} / ${r2c1} ${r2c2})`;
    return {
      id: uid(),
      question: `Multiply the matrices:\n[${a} ${b}] × [${e} ${f}]\n[${c} ${d}]   [${g} ${h}]`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `(${r1c1 + 1} ${r1c2} / ${r2c1} ${r2c2})`,
        `(${a * e} ${b * f} / ${c * g} ${d * h})`,
        `(${r1c1} ${r1c2 + 1} / ${r2c1} ${r2c2})`,
      ]),
      marks: 4,
      workingSteps: [
        `Row 1 × Col 1: ${a}×${e} + ${b}×${g} = ${r1c1}`,
        `Row 1 × Col 2: ${a}×${f} + ${b}×${h} = ${r1c2}`,
        `Row 2 × Col 1: ${c}×${e} + ${d}×${g} = ${r2c1}`,
        `Row 2 × Col 2: ${c}×${f} + ${d}×${h} = ${r2c2}`,
      ],
      hints: [`Row × Column: multiply corresponding, then add`, `Result[i][j] = row i · column j`],
      calculatorAllowed: false,
      commonMistake: `Multiplying element-by-element: ${a}×${e}, ${b}×${f} etc. — matrix multiplication is ROW × COLUMN (dot product), not element-wise.`,
      examTip: `IGCSE: Show each dot product calculation separately. Four calculations → four marks. Never skip a step.`,
    };
  } else {
    // Determinant
    const a = randInt(1, 5), b = randInt(1, 4), c = randInt(1, 4), d = randInt(1, 5);
    const det = a * d - b * c;
    const correct = `${det}`;
    return {
      id: uid(),
      question: `Find the determinant of:\n[${a} ${b}]\n[${c} ${d}]`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${det + 1}`, `${det - 1}`, `${a * d + b * c}`]),
      marks: 2,
      workingSteps: [
        `det(M) = ad − bc`,
        `= ${a}×${d} − ${b}×${c}`,
        `= ${a * d} − ${b * c} = ${det}`,
      ],
      hints: [`det = ad − bc for a 2×2 matrix`, `Multiply the diagonals, then subtract`],
      calculatorAllowed: false,
      commonMistake: `Adding instead of subtracting: ad + bc = ${a * d + b * c} ≠ ${det}. The determinant is always ad MINUS bc.`,
      examTip: `CAPS: If det = 0, the matrix has no inverse. Always check for this when asked to find M⁻¹.`,
    };
  }
}

// ── age16-trig2 L1 — Trigonometric Identities ────────────────────────────────

function genTrigIdentities(): Problem {
  const CASES = [
    // 0: Pythagorean identity — given sin, find cos²
    {
      question: `Given sin θ = 3/5, use the identity sin²θ + cos²θ = 1 to find cos²θ.\n\n(Assume θ is acute.)`,
      correct: '16/25',
      wrongs: ['9/25', '4/5', '7/25'],
      steps: [
        'Pythagorean identity: sin²θ + cos²θ = 1',
        'sin²θ = (3/5)² = 9/25',
        'cos²θ = 1 − 9/25 = 25/25 − 9/25 = 16/25',
      ],
      hints: ['sin²θ + cos²θ = 1 → cos²θ = 1 − sin²θ', 'Square sin θ first: (3/5)² = 9/25'],
      mistake: 'Writing cos²θ = 1 − sin θ — the identity uses SQUARES. Square sin θ before subtracting: (3/5)² = 9/25.',
      tip: 'IGCSE/CAPS: Write the full identity first. Substituting without showing sin²θ = 9/25 will lose a method mark.',
    },
    // 1: Quotient identity — find tan
    {
      question: `sin θ = 5/13 and cos θ = 12/13.\n\nUse the quotient identity to find tan θ.`,
      correct: '5/12',
      wrongs: ['12/5', '5/13', '12/13'],
      steps: [
        'Quotient identity: tan θ = sin θ / cos θ',
        'tan θ = (5/13) ÷ (12/13)',
        'tan θ = (5/13) × (13/12) = 5/12',
      ],
      hints: ['tan θ = sin θ / cos θ — divide sin by cos', 'Dividing fractions: flip and multiply'],
      mistake: 'Writing tan θ = cos θ / sin θ — it is sin OVER cos, not the other way. tan = opposite/adjacent = sin/cos.',
      tip: 'CAPS: Derive it: opp/adj = (opp/hyp) ÷ (adj/hyp) = sin θ ÷ cos θ. This is why tan θ = sin θ / cos θ.',
    },
    // 2: Double angle — sin 2x
    {
      question: `Use the double angle formula sin 2x = 2 sin x cos x to find sin 60°.\n\n(Use x = 30°: sin 30° = 1/2, cos 30° = √3/2)`,
      correct: '√3/2',
      wrongs: ['1/2', '1', '√3'],
      steps: [
        'sin 2x = 2 sin x cos x',
        'sin 60° = sin(2 × 30°) = 2 × sin 30° × cos 30°',
        '= 2 × (1/2) × (√3/2)',
        '= √3/2',
      ],
      hints: ['sin 2x = 2 sin x cos x — let x = 30°', 'Substitute sin 30° = 1/2, cos 30° = √3/2'],
      mistake: 'Writing sin 2x = 2 sin x — WRONG. The double angle formula multiplies by BOTH sin x and cos x.',
      tip: 'IGCSE: The double angle formula sin 2x = 2 sin x cos x must be memorised. It is not on the formula sheet.',
    },
    // 3: Simplify cos²x − sin²x
    {
      question: `Simplify: cos²x − sin²x`,
      correct: 'cos 2x',
      wrongs: ['sin 2x', '2 cos x', 'cos x − sin x'],
      steps: [
        'Recall: cos 2x = cos²x − sin²x (double angle identity)',
        'Therefore cos²x − sin²x = cos 2x',
      ],
      hints: ['This matches one of the three forms of the double angle formula for cos', 'cos 2x = cos²x − sin²x'],
      mistake: 'Writing this as (cos x − sin x)(cos x + sin x) without recognising it equals cos 2x — the single-expression simplification is the expected answer.',
      tip: 'CAPS Gr11: cos 2x has THREE equivalent forms: cos²x−sin²x, 1−2sin²x, 2cos²x−1. Recognise all three.',
    },
  ];

  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(),
    question: c.question,
    correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs),
    marks: 3,
    workingSteps: c.steps,
    hints: c.hints,
    calculatorAllowed: false,
    commonMistake: c.mistake,
    examTip: c.tip,
  };
}

// ── age16-trig2 L2 — Trig Equations (CAST Diagram) ───────────────────────────

function genTrigEquations(): Problem {
  const CASES = [
    {
      question: 'Solve for θ, where 0° ≤ θ ≤ 360°:\nsin θ = 1/2',
      correct: 'θ = 30° and θ = 150°',
      wrongs: ['θ = 30° only', 'θ = 60° and θ = 120°', 'θ = 150° and θ = 210°'],
      steps: [
        'Reference angle: sin⁻¹(1/2) = 30°',
        'sin is positive in Q1 and Q2',
        'Q1: θ = 30°',
        'Q2: θ = 180° − 30° = 150°',
        'Answer: θ = 30° and θ = 150°',
      ],
      hints: ['sin is positive in Q1 and Q2 (CAST)', 'Q2 angle = 180° − reference angle'],
      mistake: 'Giving only 30° — sin θ = 1/2 has TWO solutions in [0°,360°]: the Q1 angle (30°) and the Q2 angle (150°).',
      tip: 'IGCSE: CAST shows sin positive in Q1 and Q2. Q1 = reference angle; Q2 = 180° − reference angle.',
    },
    {
      question: 'Solve for θ, where 0° ≤ θ ≤ 360°:\ncos θ = 1/2',
      correct: 'θ = 60° and θ = 300°',
      wrongs: ['θ = 60° only', 'θ = 60° and θ = 120°', 'θ = 30° and θ = 330°'],
      steps: [
        'Reference angle: cos⁻¹(1/2) = 60°',
        'cos is positive in Q1 and Q4',
        'Q1: θ = 60°',
        'Q4: θ = 360° − 60° = 300°',
        'Answer: θ = 60° and θ = 300°',
      ],
      hints: ['cos is positive in Q1 and Q4 (CAST)', 'Q4 angle = 360° − reference angle'],
      mistake: 'Giving Q2 (120°) instead of Q4 (300°) — cos is positive in Q1 and Q4, NOT Q2.',
      tip: 'CAPS: CAST diagram — Cos positive in Q1 (0°–90°) and Q4 (270°–360°). Q4 formula: 360° − reference.',
    },
    {
      question: 'Solve for θ, where 0° ≤ θ ≤ 360°:\ntan θ = 1',
      correct: 'θ = 45° and θ = 225°',
      wrongs: ['θ = 45° only', 'θ = 45° and θ = 135°', 'θ = 135° and θ = 315°'],
      steps: [
        'Reference angle: tan⁻¹(1) = 45°',
        'tan is positive in Q1 and Q3',
        'Q1: θ = 45°',
        'Q3: θ = 180° + 45° = 225°',
        'Answer: θ = 45° and θ = 225°',
      ],
      hints: ['tan is positive in Q1 and Q3 (CAST)', 'Q3 angle = 180° + reference angle'],
      mistake: 'Choosing Q2 (135°) — tan is NEGATIVE in Q2. Tan is positive in Q1 and Q3 only.',
      tip: 'IGCSE: For tan equations, the two solutions always differ by exactly 180°: θ and θ + 180°.',
    },
    {
      question: 'Solve for θ, where 0° ≤ θ ≤ 360°:\nsin θ = −1/2',
      correct: 'θ = 210° and θ = 330°',
      wrongs: ['θ = 30° and θ = 150°', 'θ = 210° only', 'θ = 240° and θ = 300°'],
      steps: [
        'Reference angle (ignore sign): sin⁻¹(1/2) = 30°',
        'sin is NEGATIVE in Q3 and Q4',
        'Q3: θ = 180° + 30° = 210°',
        'Q4: θ = 360° − 30° = 330°',
        'Answer: θ = 210° and θ = 330°',
      ],
      hints: ['Negative sin → Q3 and Q4', 'Find reference angle first (ignore the minus): 30°'],
      mistake: 'Using the positive sin rules (Q1 and Q2) — negative sin means Q3 and Q4. The sign determines the quadrant.',
      tip: 'CAPS: Step 1: ignore the sign to get reference angle. Step 2: use CAST sign to find the correct quadrants.',
    },
  ];

  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(),
    question: c.question,
    correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs),
    marks: 4,
    workingSteps: c.steps,
    hints: c.hints,
    calculatorAllowed: false,
    commonMistake: c.mistake,
    examTip: c.tip,
  };
}

// ── age16-calculus L1 — Differentiation from First Principles ─────────────────

function genDifferentiationFirstPrinciples(): Problem {
  const CASES = [
    {
      question: "Differentiate from first principles:\nf(x) = x²\n\nUse: f'(x) = lim[h→0] (f(x+h) − f(x)) / h",
      correct: "f'(x) = 2x",
      wrongs: ["f'(x) = x", "f'(x) = 2", "f'(x) = x²"],
      steps: [
        "f(x+h) = (x+h)² = x² + 2xh + h²",
        "f(x+h) − f(x) = x² + 2xh + h² − x² = 2xh + h²",
        "(2xh + h²) / h = 2x + h",
        "lim[h→0] (2x + h) = 2x",
        "Therefore f'(x) = 2x",
      ],
      hints: ["Expand (x+h)² = x² + 2xh + h² fully", "After dividing by h, set h = 0 in the limit"],
      mistake: "Forgetting the 2xh cross-term when expanding (x+h)² — the full expansion is x² + 2xh + h², NOT just x² + h².",
      tip: "CAPS: Always write 'lim[h→0]' explicitly — that line alone earns a mark. Never just set h = 0 without showing the limit.",
    },
    {
      question: "Differentiate from first principles:\nf(x) = x³\n\nUse: f'(x) = lim[h→0] (f(x+h) − f(x)) / h",
      correct: "f'(x) = 3x²",
      wrongs: ["f'(x) = 3x", "f'(x) = x²", "f'(x) = 3x³"],
      steps: [
        "f(x+h) = (x+h)³ = x³ + 3x²h + 3xh² + h³",
        "f(x+h) − f(x) = 3x²h + 3xh² + h³",
        "(3x²h + 3xh² + h³) / h = 3x² + 3xh + h²",
        "lim[h→0] (3x² + 3xh + h²) = 3x²",
        "Therefore f'(x) = 3x²",
      ],
      hints: ["(x+h)³ = x³ + 3x²h + 3xh² + h³ — all 4 terms needed", "After ÷h, every remaining h term vanishes at the limit"],
      mistake: "Incomplete expansion of (x+h)³ — there are 4 terms: x³ + 3x²h + 3xh² + h³. Missing the middle terms gives wrong derivative.",
      tip: "IGCSE: For (x+h)³, use Pascal's triangle row 1-3-3-1 to get the coefficients: x³, 3x²h, 3xh², h³.",
    },
    {
      question: "Differentiate from first principles:\nf(x) = 3x²\n\nUse: f'(x) = lim[h→0] (f(x+h) − f(x)) / h",
      correct: "f'(x) = 6x",
      wrongs: ["f'(x) = 3x", "f'(x) = 6", "f'(x) = 6x²"],
      steps: [
        "f(x+h) = 3(x+h)² = 3(x² + 2xh + h²) = 3x² + 6xh + 3h²",
        "f(x+h) − f(x) = 3x² + 6xh + 3h² − 3x² = 6xh + 3h²",
        "(6xh + 3h²) / h = 6x + 3h",
        "lim[h→0] (6x + 3h) = 6x",
        "Therefore f'(x) = 6x",
      ],
      hints: ["The coefficient 3 multiplies every term in the expansion", "Expand 3(x+h)² = 3x² + 6xh + 3h²"],
      mistake: "Dropping the coefficient — f(x) = 3x² means f'(x) = 3×(2x) = 6x. The coefficient multiplies through the power rule.",
      tip: "CAPS: Carry the constant through every step. 3(x+h)² = 3(x²+2xh+h²) = 3x²+6xh+3h². Show this expansion.",
    },
    {
      question: "Differentiate from first principles:\nf(x) = x² + 2x\n\nUse: f'(x) = lim[h→0] (f(x+h) − f(x)) / h",
      correct: "f'(x) = 2x + 2",
      wrongs: ["f'(x) = 2x", "f'(x) = x + 2", "f'(x) = 2x²"],
      steps: [
        "f(x+h) = (x+h)² + 2(x+h) = x² + 2xh + h² + 2x + 2h",
        "f(x+h) − f(x) = 2xh + h² + 2h",
        "(2xh + h² + 2h) / h = 2x + h + 2",
        "lim[h→0] (2x + h + 2) = 2x + 2",
        "Therefore f'(x) = 2x + 2",
      ],
      hints: ["Expand each term in f(x+h) separately", "The 2h/h = 2 term survives the limit — don't drop it"],
      mistake: "Forgetting to differentiate the linear term 2x — d/dx(2x) = 2, so f'(x) = 2x + 2, not just 2x.",
      tip: "IGCSE: Show f(x+h) fully expanded on one line, then f(x+h)−f(x) on the next. Examiners follow your working term by term.",
    },
  ];

  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(),
    question: c.question,
    correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs),
    marks: 5,
    workingSteps: c.steps,
    hints: c.hints,
    calculatorAllowed: false,
    commonMistake: c.mistake,
    examTip: c.tip,
  };
}

// ── age16-calculus L2 — Basic Differentiation (Power Rule) ────────────────────

function genBasicDifferentiation(): Problem {
  const type = randInt(0, 3);

  if (type === 0) {
    // Differentiate xⁿ
    const n = randInt(2, 5);
    const superscripts: Record<number, string> = { 2: 'x²', 3: 'x³', 4: 'x⁴', 5: 'x⁵' };
    const resultSup: Record<number, string> = { 2: 'x', 3: 'x²', 4: 'x³', 5: 'x⁴' };
    const correct = n === 2 ? `${n}x` : `${n}${resultSup[n]}`;
    return {
      id: uid(),
      question: `Differentiate with respect to x:\ny = ${superscripts[n]}`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `${n - 1}${n === 2 ? 'x' : resultSup[n]}`,
        `${superscripts[n - 1] ?? 'x'}`,
        `${n}${superscripts[n]}`,
      ]),
      marks: 2,
      workingSteps: [
        `Power rule: d/dx(xⁿ) = n·xⁿ⁻¹`,
        `d/dx(${superscripts[n]}) = ${n} · x^(${n}−1) = ${correct}`,
      ],
      hints: [`Power rule: bring the exponent down, subtract 1 from the power`, `d/dx(xⁿ) = nxⁿ⁻¹`],
      calculatorAllowed: false,
      commonMistake: `Keeping the same exponent — d/dx(${superscripts[n]}) = ${n}x^(${n}−1) = ${correct}, NOT ${n}${superscripts[n]}.`,
      examTip: `IGCSE/CAPS: Two steps always: (1) multiply by exponent, (2) reduce exponent by 1. Never skip step 2.`,
    };
  } else if (type === 1) {
    // Differentiate a·xⁿ
    const a = randInt(2, 5), n = randInt(2, 4);
    const superscripts: Record<number, string> = { 2: 'x²', 3: 'x³', 4: 'x⁴' };
    const resultSup: Record<number, string> = { 2: 'x', 3: 'x²', 4: 'x³' };
    const coeff = a * n;
    const correct = `${coeff}${resultSup[n]}`;
    return {
      id: uid(),
      question: `Differentiate with respect to x:\ny = ${a}${superscripts[n]}`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `${a}${resultSup[n]}`,
        `${coeff}${superscripts[n]}`,
        `${coeff + 1}${resultSup[n]}`,
      ]),
      marks: 2,
      workingSteps: [
        `Power rule: d/dx(a·xⁿ) = a·n·xⁿ⁻¹`,
        `d/dx(${a}${superscripts[n]}) = ${a} × ${n} × x^(${n}−1) = ${correct}`,
      ],
      hints: [`Multiply the coefficient ${a} by the power ${n}: ${a}×${n} = ${coeff}`, `Then reduce the power by 1`],
      calculatorAllowed: false,
      commonMistake: `Keeping the coefficient unchanged at ${a} — the coefficient and power multiply together: ${a}×${n} = ${coeff}.`,
      examTip: `CAPS: d/dx(${a}${superscripts[n]}) = ${a}·${n}·x^(${n}−1) = ${correct}. Show the multiplication step.`,
    };
  } else if (type === 2) {
    // Differentiate polynomial ax² + bx + c
    const a = randInt(1, 4), b = randInt(1, 6), c = randInt(1, 8);
    const da = 2 * a;
    const bStr = `+ ${b}x`;
    const cStr = `+ ${c}`;
    const correct = `${da}x + ${b}`;
    return {
      id: uid(),
      question: `Find dy/dx:\ny = ${a}x² ${bStr} ${cStr}`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `${da}x`,
        `${da}x + ${b + 1}`,
        `${a}x + ${b}`,
      ]),
      marks: 3,
      workingSteps: [
        `Differentiate each term separately`,
        `d/dx(${a}x²) = ${da}x`,
        `d/dx(${b}x) = ${b}`,
        `d/dx(${c}) = 0  (constant disappears)`,
        `dy/dx = ${correct}`,
      ],
      hints: [`Each term is differentiated separately`, `Constants differentiate to 0 — they disappear`],
      calculatorAllowed: false,
      commonMistake: `Including the constant ${c} in the answer — the derivative of a constant is always 0. It vanishes completely.`,
      examTip: `IGCSE: Differentiate term by term. Show each line to secure method marks even if the arithmetic slips.`,
    };
  } else {
    // Gradient at a point
    const a = randInt(1, 3), b = randInt(1, 5), x0 = randInt(1, 4);
    const grad = 2 * a * x0 + b;
    const bStr = `+ ${b}x`;
    const correct = `${grad}`;
    return {
      id: uid(),
      question: `y = ${a}x² ${bStr}\n\nFind the gradient of the curve at x = ${x0}.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${grad + 2}`, `${grad - 2}`, `${a * x0 * x0 + b * x0}`]),
      marks: 3,
      workingSteps: [
        `Step 1 — Find dy/dx:`,
        `dy/dx = ${2 * a}x + ${b}`,
        `Step 2 — Substitute x = ${x0}:`,
        `gradient = ${2 * a}(${x0}) + ${b} = ${2 * a * x0} + ${b} = ${grad}`,
      ],
      hints: [`Find dy/dx first, then substitute x = ${x0}`, `Gradient = dy/dx evaluated at the point`],
      calculatorAllowed: false,
      commonMistake: `Substituting x = ${x0} into y instead of dy/dx — the GRADIENT is the DERIVATIVE evaluated at the point, not y itself.`,
      examTip: `CAPS: Two-step process always: (1) differentiate to get dy/dx, (2) substitute x. Label both steps clearly.`,
    };
  }
}

// ── age16-exponential L1 — Exponential Functions ──────────────────────────────

function genExponentialFunctions(): Problem {
  const type = randInt(0, 2);

  if (type === 0) {
    // Evaluate a^n (small exact integers)
    const baseChoices = [2, 3, 4, 5];
    const base = baseChoices[randInt(0, 3)];
    const exp = randInt(3, 5);
    const val = Math.pow(base, exp);
    const correct = `${val}`;
    return {
      id: uid(),
      question: `Evaluate without a calculator:\n${base}^${exp}`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${val + base}`, `${base * exp}`, `${val - 1}`]),
      marks: 1,
      workingSteps: [
        `${base}^${exp} means multiply ${base} by itself ${exp} times`,
        Array.from({ length: exp }, (_, i) => `${base}^${i + 1} = ${Math.pow(base, i + 1)}`).join(', '),
        `${base}^${exp} = ${val}`,
      ],
      hints: [`Build up step by step: ${base}¹=${base}, ${base}²=${base*base}, ${base}³=...`],
      calculatorAllowed: false,
      commonMistake: `Multiplying base by exponent: ${base} × ${exp} = ${base * exp} ≠ ${val}. An exponent means repeated multiplication of the BASE, not ×.`,
      examTip: `Know powers of 2, 3, 4, 5 up to the 5th — they appear in no-calculator questions across trig, surds, and sequences.`,
    };
  } else if (type === 1) {
    // Compound growth: A = P(1 + r/100)^n
    const Ps = [1000, 2000, 5000];
    const P = Ps[randInt(0, 2)];
    const r = [10, 20][randInt(0, 1)]; // clean multipliers
    const n = [2, 3][randInt(0, 1)];
    const multiplier = 1 + r / 100;
    const A = Math.round(P * Math.pow(multiplier, n) * 100) / 100;
    const simpleInterest = P + P * r / 100 * n;
    const correct = `R${A.toFixed(2)}`;
    return {
      id: uid(),
      question: `R${P} is invested at ${r}% per year, compounded annually.\n\nCalculate the value after ${n} years.\n[A = P(1 + r/100)ⁿ]`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `R${simpleInterest.toFixed(2)}`,
        `R${(A + r).toFixed(2)}`,
        `R${(P * Math.pow(multiplier, n - 1)).toFixed(2)}`,
      ]),
      marks: 3,
      workingSteps: [
        `A = P(1 + r/100)ⁿ`,
        `A = ${P}(1 + ${r}/100)^${n}`,
        `A = ${P} × ${multiplier}^${n}`,
        `A = ${correct}`,
      ],
      hints: [`Substitute P = ${P}, r = ${r}, n = ${n} into A = P(1+r/100)ⁿ`, `(1 + ${r}/100) = ${multiplier}`],
      calculatorAllowed: true,
      commonMistake: `Using simple interest: P + P×r/100×n = R${simpleInterest} ≠ ${correct}. Compound interest applies to the growing total each year — use the power formula.`,
      examTip: `CAPS/IGCSE: Write the formula first, then substitute. Show A = ${P}(${multiplier})^${n} as a line before evaluating.`,
    };
  } else {
    // Half-life decay
    const P = [100, 200, 400, 800][randInt(0, 3)];
    const halfLife = [2, 5, 10][randInt(0, 2)];
    const n = [1, 2][randInt(0, 1)];
    const t = halfLife * n;
    const remaining = P / Math.pow(2, n);
    const correct = `${remaining} g`;
    return {
      id: uid(),
      question: `A radioactive substance has a half-life of ${halfLife} years.\nInitial mass: ${P} g.\n\nWhat mass remains after ${t} years?`,
      correctAnswer: correct,
      options: makeOptions(correct, [
        `${remaining / 2} g`,
        `${P - remaining} g`,
        `${remaining + halfLife} g`,
      ]),
      marks: 3,
      workingSteps: [
        `Number of half-lives elapsed: ${t} ÷ ${halfLife} = ${n}`,
        `After each half-life, mass is halved`,
        `A = ${P} × (1/2)^${n} = ${P} ÷ ${Math.pow(2, n)} = ${remaining} g`,
      ],
      hints: [
        `How many half-lives fit in ${t} years? ${t} ÷ ${halfLife} = ${n}`,
        `Divide the mass by 2 for each half-life period`,
      ],
      calculatorAllowed: false,
      commonMistake: `Subtracting the half-life from the mass — the MASS is halved, not reduced by a fixed amount. After ${n} half-life(s), divide by 2^${n} = ${Math.pow(2, n)}.`,
      examTip: `IGCSE: A = P × (0.5)^n where n = time ÷ half-life. Verify: after 1 half-life mass = ${P / 2} g ✓`,
    };
  }
}

// ── age16-trig2 L3 — Radians, Arc Length & Sector Area ───────────────────────

function genRadians(): Problem {
  const CASES = [
    // ── Degree → Radian ──────────────────────────────────────────────────────
    {
      question: `Convert 60° to radians.\n\nGive your answer as a fraction of π.`,
      correct: 'π/3',
      wrongs: ['π/6', '2π/3', 'π/4'],
      steps: ['180° = π radians', '1° = π/180', '60° = 60 × π/180 = 60π/180 = π/3'],
      hints: ['Multiply degrees by π/180', '60/180 simplifies to 1/3'],
      mistake: 'Multiplying by 180/π instead of π/180 — to go degrees → radians, multiply by π/180.',
      tip: 'IGCSE: Memorise the six key angles: 30°=π/6, 45°=π/4, 60°=π/3, 90°=π/2, 180°=π, 360°=2π.',
    },
    {
      question: `Convert 45° to radians.\n\nGive your answer as a fraction of π.`,
      correct: 'π/4',
      wrongs: ['π/3', 'π/6', 'π/8'],
      steps: ['180° = π radians', '45° = 45 × π/180', 'Simplify: 45/180 = 1/4', '45° = π/4'],
      hints: ['Multiply by π/180', '45 ÷ 180 = 1/4'],
      mistake: 'Writing π/8 — 45/180 = 1/4 (divide top and bottom by 45), so 45° = π/4, not π/8.',
      tip: 'CAPS: Divide by 180 first, then write over π: 45/180 = 1/4 → π/4.',
    },
    {
      question: `Convert 270° to radians.\n\nGive your answer as a fraction of π.`,
      correct: '3π/2',
      wrongs: ['π/2', '2π/3', '3π'],
      steps: ['270° = 270 × π/180', '270/180 = 3/2', '270° = 3π/2'],
      hints: ['Multiply by π/180', '270 ÷ 180 = 3/2'],
      mistake: 'Halving instead of scaling: π/2 is 90°, not 270°. Multiply 270 by π/180 to get 3π/2.',
      tip: 'IGCSE: 270° = ¾ of a full circle (2π), so ¾ × 2π = 3π/2. Use this check.',
    },
    // ── Radian → Degree ──────────────────────────────────────────────────────
    {
      question: `Convert π/6 radians to degrees.`,
      correct: '30°',
      wrongs: ['60°', '45°', '15°'],
      steps: ['π radians = 180°', 'π/6 × (180/π) = 180/6', '= 30°'],
      hints: ['Multiply radians by 180/π', 'Cancel the π, then 180 ÷ 6'],
      mistake: 'Multiplying by π/180 (the wrong direction) — radians → degrees uses ×(180/π), not ×(π/180).',
      tip: 'IGCSE: Direction trick — π/180 shrinks numbers (°→rad); 180/π grows them (rad→°).',
    },
    {
      question: `Convert 3π/4 radians to degrees.`,
      correct: '135°',
      wrongs: ['120°', '150°', '270°'],
      steps: ['3π/4 × (180/π) = 3 × 180/4', '= 3 × 45°', '= 135°'],
      hints: ['Multiply by 180/π; the π cancels', '3/4 of 180°'],
      mistake: 'Using π/3 logic (60°) instead of π/4 (45°) — 3π/4 is 3 lots of 45° = 135°, not 3 × 60° = 180°.',
      tip: 'CAPS: Find the base angle (π/4 = 45°), then multiply by the coefficient (3 × 45° = 135°).',
    },
    // ── Arc Length: s = rθ ───────────────────────────────────────────────────
    {
      question: `A circle has radius 6 cm. An arc subtends an angle of π/3 radians at the centre.\n\nFind the arc length.`,
      correct: '2π cm',
      wrongs: ['π cm', '3π cm', '4π cm'],
      steps: ['Arc length formula: s = rθ  (θ in radians)', 's = 6 × π/3', 's = 6π/3 = 2π cm'],
      hints: ['s = rθ — multiply radius by angle in radians', 'Substitute r = 6, θ = π/3'],
      mistake: 'Using s = θ/360 × 2πr (degrees formula) when the angle is already in radians. s = rθ works directly.',
      tip: 'IGCSE: If θ is in radians, use s = rθ. If θ is in degrees, convert first or use s = (θ/360) × 2πr.',
    },
    {
      question: `A circle has radius 4 cm. An arc subtends an angle of π/4 radians at the centre.\n\nFind the arc length.`,
      correct: 'π cm',
      wrongs: ['2π cm', 'π/2 cm', '4π cm'],
      steps: ['s = rθ', 's = 4 × π/4', 's = 4π/4 = π cm'],
      hints: ['s = rθ; the 4 and the 4 in π/4 cancel', 'r = 4, θ = π/4'],
      mistake: 'Adding r + θ instead of multiplying — arc length is r × θ, never a sum.',
      tip: 'CAPS: Arc length s = rθ. Answer has same unit as r (here: cm).',
    },
    {
      question: `An arc of length 3π cm is cut from a circle of radius 9 cm.\n\nFind the angle subtended at the centre in radians.`,
      correct: 'θ = π/3 radians',
      wrongs: ['θ = π/6 radians', 'θ = 2π/3 radians', 'θ = 3π radians'],
      steps: ['s = rθ  →  θ = s/r', 'θ = 3π / 9', 'θ = π/3 radians'],
      hints: ['Rearrange s = rθ to get θ = s/r', 'Substitute s = 3π, r = 9'],
      mistake: 'Multiplying s × r instead of dividing: θ = s/r = 3π/9 = π/3, not 3π × 9 = 27π.',
      tip: 'IGCSE: Three rearrangements of s = rθ: s = rθ, r = s/θ, θ = s/r. Know all three.',
    },
    // ── Sector Area: A = ½r²θ ────────────────────────────────────────────────
    {
      question: `A sector has radius 6 cm and angle π/3 radians.\n\nFind the area of the sector.`,
      correct: '6π cm²',
      wrongs: ['3π cm²', '12π cm²', '9π cm²'],
      steps: ['Sector area: A = ½r²θ  (θ in radians)', 'A = ½ × 36 × π/3', 'A = 18 × π/3 = 6π cm²'],
      hints: ['A = ½r²θ; substitute r = 6, θ = π/3', '½ × 36 = 18; then × π/3'],
      mistake: 'Using A = πr²θ/360 — that formula needs degrees. A = ½r²θ needs radians.',
      tip: 'IGCSE: Two sector area formulas — memorise both: A = ½r²θ (rad) and A = θ/360 × πr² (deg).',
    },
    {
      question: `A sector has radius 4 cm and angle π/2 radians.\n\nFind the area of the sector.`,
      correct: '4π cm²',
      wrongs: ['2π cm²', '8π cm²', 'π cm²'],
      steps: ['A = ½r²θ', 'A = ½ × 16 × π/2', 'A = 8 × π/2 = 4π cm²'],
      hints: ['A = ½r²θ; substitute r = 4, θ = π/2', 'Quick check: π/2 = 90° = ¼ circle → ¼ × π × 16 = 4π ✓'],
      mistake: 'Forgetting the ½ in the formula — A = r²θ (without ½) gives 8π, not 4π.',
      tip: 'CAPS: Verify with the degree version: sector = ¼ of circle = ¼ × π × 4² = 4π cm² ✓.',
    },
  ];

  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(),
    question: c.question,
    correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs),
    marks: 3,
    workingSteps: c.steps,
    hints: c.hints,
    calculatorAllowed: false,
    commonMistake: c.mistake,
    examTip: c.tip,
  };
}

// ── age16-algebra3 L1 — Polynomial Division & Factor Theorem ─────────────────

function genPolynomialDivision(): Problem {
  const CASES = [
    {
      question: `Use the factor theorem to show (x − 2) is a factor of\nf(x) = x³ − 6x² + 11x − 6\n\nHence fully factorise f(x).`,
      correct: '(x − 1)(x − 2)(x − 3)',
      wrongs: ['(x − 2)(x² − 4x + 3)', '(x + 1)(x − 2)(x − 3)', '(x − 2)²(x − 3)'],
      steps: [
        'Factor theorem: (x − a) is a factor iff f(a) = 0',
        'f(2) = 8 − 24 + 22 − 6 = 0  ✓ — (x − 2) confirmed',
        'Divide x³ − 6x² + 11x − 6 by (x − 2): quotient = x² − 4x + 3',
        'Factorise quotient: x² − 4x + 3 = (x − 1)(x − 3)',
        'Full factorisation: (x − 1)(x − 2)(x − 3)',
      ],
      hints: ['Factor theorem: substitute x = 2, check result is 0', 'After dividing out (x − 2), factorise the resulting quadratic'],
      mistake: 'Stopping at (x − 2)(x² − 4x + 3) — the question says "fully factorise". The quadratic must also be factorised.',
      tip: 'CAPS: Mark allocation — f(a)=0 (1), polynomial division (2), quadratic factorised (1). Show all three steps.',
    },
    {
      question: `Find the remainder when\nf(x) = x³ + 2x² − 5x + 3\nis divided by (x − 1).`,
      correct: 'Remainder = 1',
      wrongs: ['Remainder = 0', 'Remainder = 3', 'Remainder = −1'],
      steps: [
        'Remainder theorem: remainder = f(a) when dividing by (x − a)',
        'Divisor is (x − 1) → substitute x = 1',
        'f(1) = 1 + 2 − 5 + 3 = 1',
        'Remainder = 1',
      ],
      hints: ['Substitute the zero of the divisor into f(x)', '(x − 1) = 0 → x = 1'],
      mistake: 'Confusing with factor theorem — remainder theorem finds f(a); factor theorem checks whether f(a) = 0.',
      tip: 'IGCSE: Remainder = 0 would mean (x − 1) IS a factor. Remainder = 1 ≠ 0 so it is NOT a factor here.',
    },
    {
      question: `(x − 2) is a factor of f(x) = x³ + ax² − x − 2.\n\nFind the value of a.`,
      correct: 'a = −1',
      wrongs: ['a = 1', 'a = −2', 'a = 2'],
      steps: [
        '(x − 2) is a factor → f(2) = 0',
        'f(2) = (2)³ + a(2)² − (2) − 2 = 8 + 4a − 2 − 2 = 0',
        '4a + 4 = 0',
        'a = −1',
      ],
      hints: ['(x − 2) factor → f(2) = 0; substitute x = 2 and set equal to zero', 'Collect a terms, then solve'],
      mistake: 'Substituting x = −2 instead of x = 2 — (x − 2) has root x = 2 (positive). The sign does not flip here.',
      tip: 'CAPS: (x − a) → substitute x = +a. (x + a) → substitute x = −a. The sign in the factor flips.',
    },
    {
      question: `f(x) = x³ − x² − 4x + 4.\nGiven (x − 1) is a factor, fully factorise f(x).`,
      correct: '(x − 1)(x − 2)(x + 2)',
      wrongs: ['(x − 1)(x² − 4)', '(x − 1)(x + 2)²', '(x + 1)(x − 2)(x + 2)'],
      steps: [
        'f(1) = 1 − 1 − 4 + 4 = 0  ✓',
        'Divide x³ − x² − 4x + 4 by (x − 1): quotient = x² − 4',
        'x² − 4 = (x − 2)(x + 2)  (difference of squares)',
        'Full factorisation: (x − 1)(x − 2)(x + 2)',
      ],
      hints: ['Quotient after dividing by (x − 1) is x² − 4', 'Recognise x² − 4 as a difference of squares: (x−2)(x+2)'],
      mistake: 'Leaving (x − 1)(x² − 4) — not fully factorised. x² − 4 is a difference of squares and must be broken down.',
      tip: 'IGCSE: After polynomial division always check if the quotient factorises further — especially for difference of squares.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 5,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age16-algebra3 L2 — Advanced Logarithms ───────────────────────────────────

function genLogsAdvanced(): Problem {
  const CASES = [
    {
      question: `Solve for x:\nlog₂(x) + log₂(3) = 4`,
      correct: 'x = 16/3',
      wrongs: ['x = 4', 'x = 8/3', 'x = 2'],
      steps: [
        'Product law: log₂(x) + log₂(3) = log₂(3x)',
        'log₂(3x) = 4  →  3x = 2⁴ = 16',
        'x = 16/3',
      ],
      hints: ['Product law: log(a) + log(b) = log(ab)', 'Then convert: logₐ(x) = n → x = aⁿ'],
      mistake: 'Adding arguments: log₂(x) + log₂(3) ≠ log₂(x + 3). Product law MULTIPLIES inside the log.',
      tip: 'CAPS: State the law used (product/quotient/power) before each step — earns a method mark.',
    },
    {
      question: `Solve for x:\nlog₃(x) − log₃(2) = 2`,
      correct: 'x = 18',
      wrongs: ['x = 11', 'x = 6', 'x = 7'],
      steps: [
        'Quotient law: log₃(x) − log₃(2) = log₃(x/2)',
        'log₃(x/2) = 2  →  x/2 = 3² = 9',
        'x = 18',
      ],
      hints: ['Quotient law: log(a) − log(b) = log(a/b)', 'Convert to exponential form, then solve'],
      mistake: 'Subtracting arguments: log₃(x) − log₃(2) ≠ log₃(x − 2). Quotient law DIVIDES inside the log.',
      tip: 'IGCSE: After applying the law, you should have a single log = number. Then write a^number = argument.',
    },
    {
      question: `Solve for x:\n4^x = 64`,
      correct: 'x = 3',
      wrongs: ['x = 4', 'x = 16', 'x = 2'],
      steps: [
        'Write 64 as a power of 4: 4³ = 64',
        '4^x = 4³',
        'Equal bases → equal exponents: x = 3',
      ],
      hints: ['Express both sides as powers of the same base', 'If aˣ = aⁿ, then x = n'],
      mistake: 'Dividing: x = 64/4 = 16. When the base matches on both sides, equate the exponents directly.',
      tip: 'CAPS: If bases match → equate exponents. If bases don\'t match → use x = log b / log a (change of base).',
    },
    {
      question: `Evaluate using change of base:\nlog₄(64)`,
      correct: '3',
      wrongs: ['16', '4', '2'],
      steps: [
        'Change of base: log₄(64) = log(64) / log(4)',
        '64 = 4³, so log(64) = 3·log(4)',
        'log(64) / log(4) = 3·log(4) / log(4) = 3',
        'Or directly: 4³ = 64 → log₄(64) = 3',
      ],
      hints: ['Ask: 4 to what power gives 64?', 'Change of base: logₐ(b) = log(b)/log(a)'],
      mistake: 'Computing 64 ÷ 4 = 16 — that is arithmetic, not a logarithm. Log asks for the exponent: 4^? = 64.',
      tip: 'IGCSE: For exact answers, inspection is fastest: 4^1=4, 4^2=16, 4^3=64. So log₄(64)=3.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age16-functions2 L1 — Hyperbolic Functions & Transformations ──────────────

function genFunctionTransformations(): Problem {
  const CASES = [
    {
      question: `State the equations of the asymptotes of:\ny = 2/(x − 3) + 1`,
      correct: 'x = 3 and y = 1',
      wrongs: ['x = −3 and y = 1', 'x = 3 and y = 2', 'x = 3 and y = −1'],
      steps: [
        'Vertical asymptote: denominator = 0 → x − 3 = 0 → x = 3',
        'Horizontal asymptote: as x → ±∞, the fraction → 0, so y → 1',
        'Asymptotes: x = 3 and y = 1',
      ],
      hints: ['Vertical asymptote: set denominator = 0', 'Horizontal asymptote: the constant q in y = a/(x−p) + q'],
      mistake: 'Using x = −3 — solve x − 3 = 0, which gives x = +3, not −3. The sign in the denominator determines the direction.',
      tip: 'CAPS: y = a/(x−p) + q → vertical asymptote x = p, horizontal asymptote y = q.',
    },
    {
      question: `Describe the transformation that maps y = 1/x onto:\ny = 1/(x + 2) − 3`,
      correct: 'Translation 2 left and 3 down',
      wrongs: ['Translation 2 right and 3 down', 'Translation 2 left and 3 up', 'Stretch by 2, shift 3 down'],
      steps: [
        'Compare y = 1/(x + 2) − 3 with y = 1/x',
        '(x + 2): replacing x with (x + 2) shifts the graph 2 LEFT',
        '−3: constant added outside shifts graph 3 DOWN',
        'Combined: translation 2 left and 3 down',
      ],
      hints: ['f(x + a): shifts LEFT when a > 0', 'Adding negative constant outside: shifts DOWN'],
      mistake: 'Saying "right" for (x + 2) — counter-intuitively, replacing x with (x + 2) shifts the graph LEFT, not right.',
      tip: 'IGCSE: y = f(x + a) shifts left if a > 0. y = f(x − a) shifts right. The sign inside is opposite to the direction.',
    },
    {
      question: `Find the x-intercept of:\ny = 3/(x − 1) − 6`,
      correct: 'x = 3/2',
      wrongs: ['x = 1/2', 'x = 2', 'x = 3'],
      steps: [
        'Set y = 0: 0 = 3/(x − 1) − 6',
        '6 = 3/(x − 1)',
        '6(x − 1) = 3',
        'x − 1 = 1/2',
        'x = 3/2',
      ],
      hints: ['Set y = 0 to find x-intercept', 'Isolate the fraction first, then cross-multiply'],
      mistake: 'Setting denominator = 0 — that gives the vertical ASYMPTOTE (x = 1), not the x-intercept. Set y = 0 for x-intercepts.',
      tip: 'CAPS: x-intercept → set y = 0. y-intercept → set x = 0. Asymptote → set denominator = 0. Three different calculations.',
    },
    {
      question: `State the domain of:\ny = 5/(x + 4) + 2`,
      correct: 'x ≠ −4 (all real x except x = −4)',
      wrongs: ['x ≠ 2', 'x > −4', 'x ≠ 4'],
      steps: [
        'Domain: all x for which the function is defined',
        'Denominator (x + 4) ≠ 0',
        'x + 4 = 0  →  x = −4',
        'Domain: x ∈ ℝ, x ≠ −4',
      ],
      hints: ['Find which x makes the denominator zero', 'That x-value is excluded from the domain'],
      mistake: 'Writing x ≠ +4 — solving x + 4 = 0 gives x = −4 (negative). The sign changes when moving to the other side.',
      tip: 'IGCSE: For y = a/(x + p) + q, excluded value is x = −p (the solution to denominator = 0).',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age16-functions2 L2 — Inverse Functions & Domain Restrictions ─────────────

function genInverseFunctions16(): Problem {
  const CASES = [
    {
      question: `f(x) = x² + 3,  x ≥ 0.\n\nFind f⁻¹(x) and state its domain.`,
      correct: 'f⁻¹(x) = √(x − 3),  domain x ≥ 3',
      wrongs: ['f⁻¹(x) = √(x + 3)', 'f⁻¹(x) = √(x − 3),  domain x ≥ 0', 'f⁻¹(x) = x² − 3'],
      steps: [
        'Write y = x² + 3',
        'Swap x and y: x = y² + 3',
        'Solve for y: y² = x − 3  →  y = √(x − 3)  (positive root, since x ≥ 0)',
        'Domain of f⁻¹ = range of f: minimum f(0) = 3, so x ≥ 3',
        'f⁻¹(x) = √(x − 3), domain x ≥ 3',
      ],
      hints: ['Swap x and y, then solve for y', 'Domain of f⁻¹ = range of original f'],
      mistake: 'Stating domain x ≥ 0 instead of x ≥ 3 — the domain of f⁻¹ equals the RANGE of f. Since f(0) = 3, range starts at 3.',
      tip: 'CAPS: Domain of f⁻¹ = range of f. Range of f⁻¹ = domain of f. Always state both when finding an inverse.',
    },
    {
      question: `h(x) = 3^x.\n\nWrite down h⁻¹(x).`,
      correct: 'h⁻¹(x) = log₃(x)',
      wrongs: ['h⁻¹(x) = x^(1/3)', 'h⁻¹(x) = 3^(−x)', 'h⁻¹(x) = log(x)'],
      steps: [
        'Write y = 3^x',
        'Swap x and y: x = 3^y',
        'Solve for y: y = log₃(x)  (definition of logarithm)',
        'h⁻¹(x) = log₃(x)',
      ],
      hints: ['The inverse of an exponential function is a logarithm with the same base', 'If x = 3^y, then by definition y = log₃(x)'],
      mistake: 'Writing h⁻¹(x) = 3^(−x) — that is the reciprocal of 3^x. The inverse function is the logarithm base 3.',
      tip: 'IGCSE: y = aˣ and y = logₐ(x) are inverse functions — they are reflections of each other in the line y = x.',
    },
    {
      question: `g(x) = √(x − 2),  x ≥ 2.\n\nFind g⁻¹(x) and its domain.`,
      correct: 'g⁻¹(x) = x² + 2,  domain x ≥ 0',
      wrongs: ['g⁻¹(x) = x² + 2,  domain all reals', 'g⁻¹(x) = (x − 2)²', 'g⁻¹(x) = x² − 2,  domain x ≥ 0'],
      steps: [
        'Write y = √(x − 2)',
        'Swap x and y: x = √(y − 2)',
        'Square both sides: x² = y − 2  →  y = x² + 2',
        'Domain of g⁻¹ = range of g = [0, ∞), so x ≥ 0',
        'g⁻¹(x) = x² + 2, domain x ≥ 0',
      ],
      hints: ['Square both sides after swapping to undo the square root', 'Domain of g⁻¹ equals the range of g (which starts at 0)'],
      mistake: 'Stating domain as all reals — g⁻¹ is a restricted parabola. Domain = range of g = x ≥ 0.',
      tip: 'CAPS: When inverting a square root function, squaring gives a parabola — restrict to the positive-x branch only.',
    },
    {
      question: `Why must f(x) = x² have a domain restriction before finding its inverse?\nWith x ≥ 0, state f⁻¹(x).`,
      correct: 'f is not one-to-one on ℝ;  f⁻¹(x) = √x',
      wrongs: ['f is not defined for x < 0;  f⁻¹(x) = x²', 'f has no maximum;  f⁻¹(x) = 2x', 'f is increasing everywhere;  f⁻¹(x) = √x'],
      steps: [
        'f(2) = 4 and f(−2) = 4: two inputs give the same output → not one-to-one',
        'The horizontal line test fails (any line y = k > 0 crosses the parabola twice)',
        'Restrict to x ≥ 0: now one-to-one (only right-hand branch)',
        'Inverse: y = x², swap: x = y², y = √x (positive root)',
        'f⁻¹(x) = √x',
      ],
      hints: ['One-to-one means every output has exactly one input — use the horizontal line test', 'Restricting to x ≥ 0 keeps only the right branch'],
      mistake: 'Thinking the restriction is optional — a function must be one-to-one for its inverse to also be a function. Without restriction, f⁻¹ is a relation, not a function.',
      tip: 'IGCSE: Horizontal line test: if any horizontal line crosses the graph more than once, a domain restriction is needed before finding the inverse.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age16-analytical-geo L1 — Equation of a Line & Inclination ───────────────

function genEquationOfLine16(): Problem {
  const CASES = [
    {
      question: `Find the equation of the line with gradient 3 passing through (1, −2).\n\nWrite in the form y = mx + c.`,
      correct: 'y = 3x − 5',
      wrongs: ['y = 3x + 5', 'y = 3x − 1', 'y = 3x − 2'],
      steps: [
        'Point-slope form: y − y₁ = m(x − x₁)',
        'y − (−2) = 3(x − 1)',
        'y + 2 = 3x − 3',
        'y = 3x − 5',
      ],
      hints: ['Use y − y₁ = m(x − x₁) with m = 3 and point (1, −2)', 'y − (−2) = y + 2  — watch the double negative'],
      mistake: 'Writing y − 2 instead of y + 2 — when y₁ = −2, the formula gives y − (−2) = y + 2.',
      tip: 'CAPS: Always write the formula first. Substituting carefully earns method marks even if the arithmetic is wrong.',
    },
    {
      question: `A line has inclination angle θ = 135°.\n\nFind the gradient m and state whether it slopes upward or downward.`,
      correct: 'm = −1, slopes downward left to right',
      wrongs: ['m = 1, slopes upward', 'm = −√3, slopes downward', 'm = 0, horizontal'],
      steps: [
        'm = tan(θ) = tan(135°)',
        'tan(135°) = tan(180° − 45°) = −tan(45°) = −1',
        'm = −1  (negative → slopes downward from left to right)',
      ],
      hints: ['m = tan(θ) where θ is the inclination angle', 'tan(135°) = −tan(45°) = −1 using allied angles'],
      mistake: 'Giving m = +1 — inclination 135° is in Q2 where tan is negative. tan(135°) = −tan(45°) = −1.',
      tip: 'IGCSE: Inclination in Q1 (0°–90°) → positive gradient. Inclination in Q2 (90°–180°) → negative gradient.',
    },
    {
      question: `Line L₁: y = 2x + 3.\nLine L₂ is perpendicular to L₁ and passes through (4, 1).\n\nFind the equation of L₂.`,
      correct: 'y = −x/2 + 3',
      wrongs: ['y = 2x − 7', 'y = −x/2 − 1', 'y = x/2 + 3'],
      steps: [
        'Perpendicular condition: m₁ × m₂ = −1',
        'm₁ = 2  →  m₂ = −1/2',
        'Point-slope through (4, 1): y − 1 = −½(x − 4)',
        'y − 1 = −x/2 + 2',
        'y = −x/2 + 3',
      ],
      hints: ['Perpendicular gradients: m₂ = −1/m₁  (negative reciprocal)', 'Then use point-slope form with the new gradient'],
      mistake: 'Reusing m = 2 for the perpendicular — perpendicular means m₂ = −1/m₁ = −1/2, not 2.',
      tip: 'CAPS: Negative reciprocal: flip the fraction and change sign. m = 2 = 2/1 → m⊥ = −1/2.',
    },
    {
      question: `A line passes through O(0, 0) and P(1, √3).\n\nFind the inclination angle θ of the line.`,
      correct: 'θ = 60°',
      wrongs: ['θ = 30°', 'θ = 45°', 'θ = 120°'],
      steps: [
        'Gradient: m = (√3 − 0)/(1 − 0) = √3',
        'Inclination: θ = tan⁻¹(m) = tan⁻¹(√3)',
        'tan(60°) = √3  →  θ = 60°',
      ],
      hints: ['Find gradient first, then θ = tan⁻¹(m)', 'Recall exact value: tan(60°) = √3'],
      mistake: 'Confusing gradient √3 with the angle — gradient = √3 but inclination = 60° (the angle whose tangent is √3).',
      tip: 'IGCSE: Memorise: tan 30°=√3/3, tan 45°=1, tan 60°=√3. For inclination, these avoid the need for a calculator.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age16-analytical-geo L2 — 2D Vectors & Dot Product ────────────────────────

function genVectors2D(): Problem {
  const CASES = [
    {
      question: `A = (3, 1) and B = (7, 5).\n\nFind the position vector AB⃗ (from A to B).`,
      correct: 'AB⃗ = (4, 4)',
      wrongs: ['AB⃗ = (10, 6)', 'AB⃗ = (−4, −4)', 'AB⃗ = (4, 6)'],
      steps: [
        'AB⃗ = B − A (position of endpoint minus start point)',
        'AB⃗ = (7 − 3,  5 − 1)',
        'AB⃗ = (4, 4)',
      ],
      hints: ['AB⃗ = B − A: subtract the starting point from the ending point', 'Subtract each component separately'],
      mistake: 'Adding coordinates instead of subtracting: A + B = (10, 6) ≠ AB⃗. The vector FROM A TO B = B − A.',
      tip: 'CAPS: AB⃗ means "from A to B" = B − A. BA⃗ means "from B to A" = A − B. Order matters — it reverses direction.',
    },
    {
      question: `Find the unit vector in the direction of v = (3, 4).`,
      correct: '(3/5, 4/5)',
      wrongs: ['(3/7, 4/7)', '(4/5, 3/5)', '(1/3, 1/4)'],
      steps: [
        '|v| = √(3² + 4²) = √(9 + 16) = √25 = 5',
        'Unit vector v̂ = v / |v| = (3, 4) / 5',
        '= (3/5, 4/5)',
      ],
      hints: ['Find magnitude first: |v| = √(x² + y²)', 'Divide each component by the magnitude'],
      mistake: 'Dividing by x + y = 7 instead of |v| = 5 — the unit vector divides by the MAGNITUDE √(x²+y²), not the sum.',
      tip: 'IGCSE: Verify: |(3/5, 4/5)| = √(9/25 + 16/25) = √1 = 1 ✓. A unit vector always has magnitude 1.',
    },
    {
      question: `a⃗ = (2, 3) and b⃗ = (3, −2).\n\nFind a⃗ · b⃗ and state whether the vectors are perpendicular.`,
      correct: 'a⃗ · b⃗ = 0 — vectors are perpendicular',
      wrongs: ['a⃗ · b⃗ = 12 — not perpendicular', 'a⃗ · b⃗ = 13 — not perpendicular', 'a⃗ · b⃗ = 1 — not perpendicular'],
      steps: [
        'Dot product: a⃗ · b⃗ = x₁x₂ + y₁y₂',
        'a⃗ · b⃗ = (2)(3) + (3)(−2) = 6 − 6 = 0',
        'Since a⃗ · b⃗ = 0, the vectors are perpendicular',
      ],
      hints: ['a⃗ · b⃗ = x₁x₂ + y₁y₂ — multiply matching components and add', 'Dot product = 0 means perpendicular'],
      mistake: 'Adding components instead of multiplying: (2+3) + (3+(−2)) = 6. Dot product MULTIPLIES pairs then sums.',
      tip: 'CAPS: Perpendicular test: a⃗ · b⃗ = 0. Parallel test: a⃗ = k·b⃗ (one is a scalar multiple of the other).',
    },
    {
      question: `v = (−5, 12).\n\nFind |v|, the magnitude of v.`,
      correct: '|v| = 13',
      wrongs: ['|v| = 7', '|v| = 17', '|v| = √119'],
      steps: [
        '|v| = √(x² + y²)',
        '|v| = √((−5)² + 12²) = √(25 + 144) = √169',
        '|v| = 13',
      ],
      hints: ['|v| = √(x² + y²) — squaring removes the negative sign', 'Recognise the 5-12-13 Pythagorean triple'],
      mistake: 'Computing |v| = (−5) + 12 = 7 — magnitude uses squares: (−5)² = 25, not −5.',
      tip: 'IGCSE: Pythagorean triples give clean magnitudes: 3-4-5, 5-12-13, 8-15-17. Spotting them saves time.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age16-stats2 L1 — Standard Deviation & Variance ──────────────────────────

function genStandardDeviation(): Problem {
  const CASES = [
    {
      question: `Data set: {1, 2, 3, 4, 5, 6, 7}\n\nCalculate the mean and standard deviation.`,
      correct: 'Mean = 4,  SD = 2',
      wrongs: ['Mean = 4,  SD = 4', 'Mean = 3.5,  SD = 2', 'Mean = 4,  SD = √8'],
      steps: [
        'Mean = (1+2+3+4+5+6+7)/7 = 28/7 = 4',
        'Deviations from mean: −3, −2, −1, 0, 1, 2, 3',
        'Squared deviations: 9, 4, 1, 0, 1, 4, 9',
        'Variance = (9+4+1+0+1+4+9)/7 = 28/7 = 4',
        'SD = √4 = 2',
      ],
      hints: ['Mean first, then find (x − mean)² for each value, then average them, then √', 'Sum of squared deviations = 28'],
      mistake: 'Using (n − 1) = 6 in the denominator — for a full population (all data given), divide by n = 7.',
      tip: 'CAPS: Population SD σ divides by n. Sample SD s divides by (n−1). For IGCSE/CAPS exam questions, use n unless told otherwise.',
    },
    {
      question: `Calculate the variance of: {2, 4, 4, 6}\n\nThe mean is 4.`,
      correct: 'Variance = 2',
      wrongs: ['Variance = 4', 'Variance = √2', 'Variance = 8'],
      steps: [
        'Mean = (2+4+4+6)/4 = 16/4 = 4  ✓',
        'Deviations: (2−4), (4−4), (4−4), (6−4) = −2, 0, 0, 2',
        'Squared deviations: 4, 0, 0, 4',
        'Variance = (4+0+0+4)/4 = 8/4 = 2',
      ],
      hints: ['Variance = Σ(x − mean)² / n', 'Sum the squared deviations then divide by the count'],
      mistake: 'Taking the square root of 2 — that gives the standard deviation. Variance itself is the average of squared deviations (no √).',
      tip: 'IGCSE: Variance = SD². If variance = 2, SD = √2. Keep the two concepts distinct.',
    },
    {
      question: `Two classes both have mean = 60%.\nClass A: SD = 5.   Class B: SD = 15.\n\nWhich class performed more consistently, and why?`,
      correct: 'Class A — smaller SD means scores clustered closer to the mean',
      wrongs: ['Class B — higher SD means higher overall performance', 'They are equal — both have the same mean', 'Class B — more spread means more students passed'],
      steps: [
        'SD measures spread (variability) around the mean',
        'Class A SD = 5: most scores within 5 marks of 60 — consistent',
        'Class B SD = 15: scores spread widely, some much higher, some much lower',
        'Class A is more consistent',
      ],
      hints: ['Smaller SD → less spread → more consistent', 'SD does NOT tell you whether scores are high or low'],
      mistake: 'Confusing SD with average performance — SD measures CONSISTENCY (spread), not the quality of results.',
      tip: 'CAPS: In exams, explain SD in context: "The data is spread/clustered around the mean of X with a standard deviation of Y."',
    },
    {
      question: `A data set has mean = 10 and SD = 3.\n\nWhat is the interval representing 1 standard deviation from the mean?`,
      correct: '7 to 13',
      wrongs: ['10 to 13', '7 to 10', '4 to 16'],
      steps: [
        '1 SD above mean: 10 + 3 = 13',
        '1 SD below mean: 10 − 3 = 7',
        'Interval: 7 to 13',
      ],
      hints: ['SD extends in BOTH directions from the mean', 'Lower bound = mean − SD;  Upper bound = mean + SD'],
      mistake: 'Using only one side (10 to 13) — standard deviation extends both above AND below the mean symmetrically.',
      tip: 'IGCSE: In a normal distribution, ~68% of data falls within 1 SD of the mean. This is a key interpretive fact.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age16-stats2 L2 — Conditional Probability ────────────────────────────────

function genConditionalProbability(): Problem {
  const CASES = [
    {
      question: `P(A ∩ B) = 0.12  and  P(B) = 0.4.\n\nFind P(A | B).`,
      correct: 'P(A | B) = 0.3',
      wrongs: ['P(A | B) = 0.12', 'P(A | B) = 0.52', 'P(A | B) = 0.48'],
      steps: [
        'Conditional probability formula: P(A | B) = P(A ∩ B) / P(B)',
        'P(A | B) = 0.12 / 0.4',
        'P(A | B) = 0.3',
      ],
      hints: ['P(A | B) = P(A ∩ B) / P(B)', '"Given B occurred" means we restrict the sample space to B only'],
      mistake: 'Multiplying instead of dividing: P(A ∩ B) × P(B) = 0.048. The formula is DIVISION: P(A∩B) ÷ P(B).',
      tip: 'CAPS: Read P(A|B) as "probability of A, given B". It scales probability to only the B outcomes.',
    },
    {
      question: `In a class of 30: 12 play sport, 8 play music, 3 play both.\n\nFind P(sport | music).`,
      correct: 'P(sport | music) = 3/8',
      wrongs: ['P(sport | music) = 1/10', 'P(sport | music) = 3/12', 'P(sport | music) = 3/30'],
      steps: [
        'P(sport ∩ music) = 3/30',
        'P(music) = 8/30',
        'P(sport | music) = (3/30) ÷ (8/30) = 3/8',
      ],
      hints: ['P(A|B) = P(A∩B)/P(B)', 'The /30 cancels: 3/8 directly'],
      mistake: 'Using P(sport) = 12/30 in the denominator instead of P(music) = 8/30 — we want P(sport GIVEN music), so B = music.',
      tip: 'IGCSE Shortcut: P(A|B) = (number in both) ÷ (number in B) = 3 ÷ 8 directly, without converting to fractions.',
    },
    {
      question: `P(A) = 0.3,  P(B) = 0.5,  P(A ∩ B) = 0.15.\n\nAre events A and B independent? Justify your answer.`,
      correct: 'Yes — P(A ∩ B) = P(A) × P(B)',
      wrongs: ['No — P(A ∩ B) ≠ P(A) + P(B)', 'No — P(A | B) ≠ 1', 'Yes — P(A) + P(B) < 1'],
      steps: [
        'Independence test: P(A ∩ B) = P(A) × P(B)?',
        'P(A) × P(B) = 0.3 × 0.5 = 0.15',
        'P(A ∩ B) = 0.15  ✓ — values are equal',
        'A and B are independent',
      ],
      hints: ['Two events are independent if P(A ∩ B) = P(A) × P(B)', 'Calculate P(A) × P(B) and compare to P(A ∩ B)'],
      mistake: 'Testing P(A) + P(B) = 1 — that checks for complementary events. Independence requires P(A∩B) = P(A)×P(B).',
      tip: 'CAPS: Equivalently, independent iff P(A|B) = P(A). Both tests give the same result — use whichever is easier.',
    },
    {
      question: `A bag has 4 red and 6 blue balls. A ball is drawn (not replaced), then another.\n\nFind P(both red).`,
      correct: 'P(both red) = 2/15',
      wrongs: ['P(both red) = 4/25', 'P(both red) = 12/100', 'P(both red) = 1/5'],
      steps: [
        'P(1st red) = 4/10',
        'P(2nd red | 1st was red) = 3/9  (one red removed, 9 balls remain)',
        'P(both red) = 4/10 × 3/9 = 12/90 = 2/15',
      ],
      hints: ['Without replacement: denominator decreases by 1 for the 2nd draw', 'P(both) = P(first) × P(second | first occurred)'],
      mistake: 'Using 4/10 × 4/10 = 4/25 — this assumes replacement. Without replacement, after the first draw there are only 9 balls left and 3 red.',
      tip: 'IGCSE: "Without replacement" = conditional probability. "With replacement" = independent events. The question always tells you which.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-numbers L6 — Standard Form ─────────────────────────────────────────

function genStandardForm(): Problem {
  const CASES = [
    {
      question: `Write in standard form:\n32 000`,
      correct: '3.2 × 10⁴',
      wrongs: ['3.2 × 10³', '32 × 10³', '3.2 × 10⁵'],
      steps: [
        'Move the decimal to get a number between 1 and 10',
        '32 000 = 3.2 × 10 000',
        '10 000 = 10⁴',
        '32 000 = 3.2 × 10⁴',
      ],
      hints: ['Standard form: a × 10ⁿ where 1 ≤ a < 10', 'Count how many places you move the decimal point'],
      mistake: 'Writing 32 × 10³ — the coefficient MUST be between 1 and 10. Shift one more place: 3.2 × 10⁴.',
      tip: 'IGCSE: 1 ≤ a < 10 is non-negotiable. 32 × 10³ loses the accuracy mark even though the value is correct.',
    },
    {
      question: `Write in standard form:\n450 000 000`,
      correct: '4.5 × 10⁸',
      wrongs: ['4.5 × 10⁷', '4.5 × 10⁹', '45 × 10⁷'],
      steps: [
        'Move decimal left until one digit remains before it: 450 000 000 → 4.5',
        'Count places moved: 8 places to the left',
        '450 000 000 = 4.5 × 10⁸',
      ],
      hints: ['Count how many places to move', 'Each place left = increase n by 1'],
      mistake: 'Miscounting — 450 000 000 has 9 digits total, the leading 4 is at position 10⁸, so n = 8.',
      tip: 'CAPS: Write zeros and count carefully. Cross them off as you count.',
    },
    {
      question: `Write in standard form:\n0.0045`,
      correct: '4.5 × 10⁻³',
      wrongs: ['4.5 × 10⁻²', '4.5 × 10⁻⁴', '0.45 × 10⁻²'],
      steps: [
        'Move decimal RIGHT until between 1 and 10: 0.0045 → 4.5',
        'Moved 3 places to the right → negative power',
        '0.0045 = 4.5 × 10⁻³',
      ],
      hints: ['Small number (< 1) → negative power of 10', 'Moving right = negative exponent'],
      mistake: 'Using 10⁻²: count again — 0.0045 → 0.045 (one), 0.45 (two), 4.5 (three) → 10⁻³.',
      tip: 'IGCSE: Moving decimal RIGHT gives NEGATIVE exponent. Moving LEFT gives positive exponent.',
    },
    {
      question: `Write as an ordinary number:\n3.7 × 10⁵`,
      correct: '370 000',
      wrongs: ['37 000', '3 700 000', '3.70 × 10⁵'],
      steps: [
        '10⁵ = move decimal 5 places to the right',
        '3.7 → 3.70000 → shift 5 right',
        '3.7 × 10⁵ = 370 000',
      ],
      hints: ['Positive power → move decimal RIGHT', '10⁵ = move 5 places right'],
      mistake: 'Moving only 4 places: 3.7 × 10⁴ = 37 000. You need 5 places for 10⁵ → 370 000.',
      tip: 'CAPS: Fill gaps with zeros. 3.7_ _ _ _ → 370 000.',
    },
    {
      question: `Write as an ordinary number:\n6.2 × 10⁻⁴`,
      correct: '0.00062',
      wrongs: ['0.0062', '0.000062', '6 200'],
      steps: [
        'Negative power → move decimal LEFT',
        '10⁻⁴ means move 4 places to the left',
        '6.2 → 0.00062',
      ],
      hints: ['Negative power → move decimal LEFT', 'Add zeros as placeholders'],
      mistake: 'Moving only 3 places: 0.0062 = 6.2 × 10⁻³. Need 4 places for 10⁻⁴.',
      tip: 'IGCSE: 10⁻ⁿ = move n places left. 6.2 → 0·6.2 (1), 0·0·6.2 (2), 0·0·0·6.2 (3), 0·0·0·0·62 (4) → 0.00062.',
    },
    {
      question: `Calculate, giving your answer in standard form:\n(4 × 10³) × (3 × 10⁵)`,
      correct: '1.2 × 10⁹',
      wrongs: ['12 × 10⁸', '1.2 × 10⁸', '1.2 × 10¹⁵'],
      steps: [
        'Multiply coefficients: 4 × 3 = 12',
        'Add exponents: 10³ × 10⁵ = 10⁸',
        'Result: 12 × 10⁸',
        '12 > 10, so this is NOT standard form',
        'Adjust: 12 × 10⁸ = 1.2 × 10 × 10⁸ = 1.2 × 10⁹',
      ],
      hints: ['Multiply coefficients, add exponents', 'After multiplying, check 1 ≤ coefficient < 10'],
      mistake: '12 × 10⁸ is not standard form since 12 ≥ 10. Write as 1.2 × 10⁹ — increase the power by 1.',
      tip: 'IGCSE/CAPS: Always check the coefficient after multiplying. If ≥ 10, divide by 10 and add 1 to the power.',
    },
    {
      question: `Calculate, giving your answer in standard form:\n(9 × 10⁷) ÷ (3 × 10⁴)`,
      correct: '3 × 10³',
      wrongs: ['3 × 10⁴', '3 × 10¹¹', '9 × 10³'],
      steps: [
        'Divide coefficients: 9 ÷ 3 = 3',
        'Subtract exponents: 10⁷ ÷ 10⁴ = 10⁷⁻⁴ = 10³',
        '3 × 10³ ✓ (already standard form)',
      ],
      hints: ['Divide coefficients separately', 'Subtract exponents: 7 − 4 = 3'],
      mistake: 'Adding instead of subtracting: 7 + 4 = 11 gives 3 × 10¹¹. Division of powers → SUBTRACT.',
      tip: 'CAPS: (a × 10^m) ÷ (b × 10^n) = (a/b) × 10^(m−n). Division of powers always subtracts.',
    },
    {
      question: `Arrange in ascending order (smallest first):\n3.1 × 10⁴,   2.8 × 10⁻¹,   5 × 10²,   1.2 × 10⁵`,
      correct: '2.8 × 10⁻¹ < 5 × 10² < 3.1 × 10⁴ < 1.2 × 10⁵',
      wrongs: [
        '3.1 × 10⁴ < 1.2 × 10⁵ < 5 × 10² < 2.8 × 10⁻¹',
        '5 × 10² < 2.8 × 10⁻¹ < 3.1 × 10⁴ < 1.2 × 10⁵',
        '2.8 × 10⁻¹ < 3.1 × 10⁴ < 5 × 10² < 1.2 × 10⁵',
      ],
      steps: [
        'Convert each: 3.1 × 10⁴ = 31 000',
        '2.8 × 10⁻¹ = 0.28',
        '5 × 10² = 500',
        '1.2 × 10⁵ = 120 000',
        'Order: 0.28 < 500 < 31 000 < 120 000',
      ],
      hints: ['Compare powers of 10 first', 'Negative exponent → number is less than 1'],
      mistake: 'Ignoring the negative exponent — 10⁻¹ makes 2.8 × 10⁻¹ = 0.28, which is smaller than all positive-power numbers.',
      tip: 'IGCSE: Rank by exponent first. Only convert fully if powers are equal.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-numbers L7 — Estimation & Rounding ─────────────────────────────────

function genEstimationRounding(): Problem {
  const CASES = [
    {
      question: `Round 0.004 872 to 3 significant figures.`,
      correct: '0.004 87',
      wrongs: ['0.005', '0.004 870', '0.004 8'],
      steps: [
        'Leading zeros are NOT significant — skip them',
        'The 4 is the 1st significant figure, 8 is 2nd, 7 is 3rd',
        'Look at the 4th s.f.: 2 (< 5) → round down',
        '0.004 872 → 0.004 87',
      ],
      hints: ['Leading zeros don\'t count as significant', 'Start counting s.f. at the first non-zero digit'],
      mistake: 'Starting count from the decimal point — 0.004 has 0 significant figures. The 4 is the 1st s.f.',
      tip: 'IGCSE: In 0.004 872, the s.f. are 4, 8, 7, 2. Round to 3: look at the 4th (2 < 5 → round down).',
    },
    {
      question: `Round 38 720 to 3 significant figures.`,
      correct: '38 700',
      wrongs: ['38 720', '38 000', '387'],
      steps: [
        '1st s.f. = 3, 2nd s.f. = 8, 3rd s.f. = 7',
        '4th digit = 2 (< 5) → round down, keep 7',
        'Replace remaining digits with zeros: 38 700',
      ],
      hints: ['3 s.f. in 38 720 → keep 3, 8, 7', 'Replace the rest with zeros — they hold place value'],
      mistake: 'Dropping the trailing zeros: 38 700 must keep the zeros as place-value holders in a whole number.',
      tip: 'CAPS: After rounding, trailing zeros in a whole number are mandatory — 38 700 ≠ 387.',
    },
    {
      question: `Round 12.3475 to 2 decimal places.`,
      correct: '12.35',
      wrongs: ['12.34', '12.3', '12.348'],
      steps: [
        '2 d.p. → keep 2 digits after the decimal point',
        'Look at the 3rd d.p.: 7 (≥ 5) → round up',
        '12.34 7… → 12.35',
      ],
      hints: ['Count 2 places after the decimal point', 'The NEXT digit decides: ≥ 5 round up, < 5 round down'],
      mistake: 'Rounding based on the 4th d.p. (5) — the decider is always the FIRST digit you are cutting off, which is the 3rd d.p. = 7.',
      tip: 'IGCSE: 2 d.p. = exactly 2 digits after the point. Chop at 2, look at what\'s next: 7 ≥ 5 → round up.',
    },
    {
      question: `Estimate the value of:\n(382 × 51) ÷ 19.7`,
      correct: '≈ 1 000',
      wrongs: ['≈ 100', '≈ 10 000', '≈ 500'],
      steps: [
        'Round each to 1 significant figure:',
        '382 ≈ 400,   51 ≈ 50,   19.7 ≈ 20',
        '(400 × 50) ÷ 20',
        '= 20 000 ÷ 20',
        '= 1 000',
      ],
      hints: ['Round each number to 1 s.f. first', 'Then compute with the rounded values only'],
      mistake: 'Using the exact values defeats the purpose — round FIRST, then compute. Show the rounded values in your working.',
      tip: 'CAPS: Estimation mark is for showing the rounded values (400, 50, 20), NOT for the arithmetic.',
    },
    {
      question: `A length is measured as 7.4 cm, correct to 1 decimal place.\n\nWrite down the upper and lower bounds.`,
      correct: 'LB = 7.35 cm,  UB = 7.45 cm',
      wrongs: ['LB = 7.3 cm,  UB = 7.5 cm', 'LB = 7.4 cm,  UB = 7.5 cm', 'LB = 7.35 cm,  UB = 7.44 cm'],
      steps: [
        'Precision = 0.1 (1 d.p.)',
        'Half precision = 0.05',
        'Lower bound = 7.4 − 0.05 = 7.35',
        'Upper bound = 7.4 + 0.05 = 7.45',
      ],
      hints: ['Bounds = measured value ± half the precision', '1 d.p. → precision 0.1 → half = 0.05'],
      mistake: 'Using ±0.1 instead of ±0.05 — bounds are HALF the precision unit, not a full unit.',
      tip: 'IGCSE: 7.35 ≤ actual length < 7.45. We write 7.45 as the UB, but strictly the length is less than 7.45.',
    },
    {
      question: `A mass m = 340 g (nearest 10 g).\nA volume V = 14 cm³ (nearest 1 cm³).\n\nFind the maximum possible density d = m/V.\nGive your answer to 3 significant figures.`,
      correct: '25.6 g/cm³',
      wrongs: ['24.3 g/cm³', '23.1 g/cm³', '25.5 g/cm³'],
      steps: [
        'Max density = max mass ÷ min volume',
        'UB for m (nearest 10): 340 + 5 = 345 g',
        'LB for V (nearest 1): 14 − 0.5 = 13.5 cm³',
        'Max density = 345 ÷ 13.5 = 25.555… ≈ 25.6 g/cm³ (3 s.f.)',
      ],
      hints: ['Max of a fraction = biggest numerator ÷ smallest denominator', 'Find UB for m and LB for V'],
      mistake: 'Using max mass ÷ max volume — to MAXIMISE a fraction, divide by the SMALLEST denominator.',
      tip: 'IGCSE Extended: max(A/B) → max A, min B. min(A/B) → min A, max B. Sketch a fraction if unsure.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-geometry L5 — Volume & Surface Area ────────────────────────────────

function genVolumeSA(): Problem {
  const CASES = [
    {
      question: `A cylinder has radius 5 cm and height 8 cm.\n\nFind the volume. Give your answer in terms of π.`,
      correct: '200π cm³',
      wrongs: ['40π cm³', '400π cm³', '80π cm³'],
      steps: ['V = πr²h', 'V = π × 5² × 8', 'V = π × 25 × 8', 'V = 200π cm³'],
      hints: ['V = πr²h', 'Square the radius first: 5² = 25'],
      mistake: 'Using V = πrh (no square on r): π × 5 × 8 = 40π. The radius is SQUARED.',
      tip: 'IGCSE: "In terms of π" = leave as 200π. Do not convert to a decimal.',
    },
    {
      question: `A cylinder has radius 3 cm and height 7 cm.\n\nFind the total surface area. Give your answer in terms of π.`,
      correct: '60π cm²',
      wrongs: ['42π cm²', '51π cm²', '66π cm²'],
      steps: [
        'SA = 2πr² + 2πrh  (two circular ends + curved surface)',
        'SA = 2π(3²) + 2π(3)(7)',
        'SA = 18π + 42π',
        'SA = 60π cm²',
      ],
      hints: ['SA = 2πr² + 2πrh', 'Two circular ends PLUS the curved surface'],
      mistake: 'Using only one circle: πr² + 2πrh = 9π + 42π = 51π. A closed cylinder has TWO circular ends.',
      tip: 'CAPS: SA = 2πr(r + h) = 2π(3)(10) = 60π. The factored form is faster and less error-prone.',
    },
    {
      question: `A sphere has radius 6 cm.\n\nFind the volume. Give your answer in terms of π.`,
      correct: '288π cm³',
      wrongs: ['144π cm³', '72π cm³', '36π cm³'],
      steps: ['V = ⁴⁄₃πr³', 'V = ⁴⁄₃ × π × 6³', 'V = ⁴⁄₃ × π × 216', 'V = ⁴⁄₃ × 216π = 288π cm³'],
      hints: ['V = ⁴⁄₃πr³', '6³ = 216,  then × ⁴⁄₃'],
      mistake: 'Using V = πr³ (no 4/3 factor): π × 216 = 216π ≠ 288π. The ⁴⁄₃ is essential for a sphere.',
      tip: 'IGCSE: ⁴⁄₃ × 216 — multiply by 4 first (864), then divide by 3 (288). Easier than the other way.',
    },
    {
      question: `A sphere has radius 4 cm.\n\nFind the total surface area. Give your answer in terms of π.`,
      correct: '64π cm²',
      wrongs: ['16π cm²', '32π cm²', '48π cm²'],
      steps: ['SA = 4πr²', 'SA = 4π × 4²', 'SA = 4π × 16', 'SA = 64π cm²'],
      hints: ['SA = 4πr²', 'r² = 16 for radius 4'],
      mistake: 'Using SA = πr² (area of a single circle): π × 16 = 16π. A sphere\'s surface area is 4 times a circle: 4πr².',
      tip: 'CAPS: SA sphere = 4πr². Memory hook: a sphere has "4 circles worth" of surface area.',
    },
    {
      question: `A cone has radius 3 cm and vertical height 7 cm.\n\nFind the volume. Give your answer in terms of π.`,
      correct: '21π cm³',
      wrongs: ['63π cm³', '7π cm³', '42π cm³'],
      steps: [
        'V = ⅓πr²h',
        'V = ⅓ × π × 3² × 7',
        'V = ⅓ × π × 9 × 7',
        'V = ⅓ × 63π',
        'V = 21π cm³',
      ],
      hints: ['V = ⅓πr²h', 'A cone is exactly ⅓ of a cylinder with the same base and height'],
      mistake: 'Forgetting the ⅓: πr²h = 63π, but cone = ⅓ × 63π = 21π. Omitting ⅓ gives 3× the correct answer.',
      tip: 'IGCSE: If you forget ⅓, your answer is automatically 3× too large. Always check.',
    },
    {
      question: `A triangular prism has a right-angled triangular cross-section with legs 6 cm and 8 cm. The length of the prism is 10 cm.\n\nFind the volume.`,
      correct: '240 cm³',
      wrongs: ['480 cm³', '120 cm³', '960 cm³'],
      steps: [
        'V = cross-section area × length',
        'Cross-section: right triangle with legs 6 and 8',
        'A = ½ × 6 × 8 = 24 cm²',
        'V = 24 × 10 = 240 cm³',
      ],
      hints: ['V = (area of cross-section) × length', 'Triangle area = ½ × base × height'],
      mistake: 'Using V = 6 × 8 × 10 = 480 — forgetting the ½ for the triangle. Volume = ½ × 6 × 8 × 10.',
      tip: 'CAPS: Always find the 2D cross-section first. Prism volume = (face area) × depth.',
    },
    {
      question: `A solid has a cylinder of radius 4 cm and height 6 cm, with a hemisphere of the same radius placed on top.\n\nFind the total volume in terms of π.`,
      correct: '416π/3 cm³',
      wrongs: ['96π cm³', '128π/3 cm³', '544π/3 cm³'],
      steps: [
        'Cylinder: V₁ = πr²h = π × 16 × 6 = 96π',
        'Hemisphere: V₂ = ½ × ⁴⁄₃πr³ = ⅔πr³ = ⅔ × π × 64 = 128π/3',
        'Total = 96π + 128π/3',
        '= 288π/3 + 128π/3',
        '= 416π/3 cm³',
      ],
      hints: ['Split into cylinder + hemisphere', 'Hemisphere = ½ × sphere = ⅔πr³'],
      mistake: 'Using a full sphere instead of hemisphere: ⁴⁄₃π × 64 = 256π/3. A hemisphere is HALF the sphere.',
      tip: 'IGCSE: Composite shapes — split, find each part, then add. Show the split in your working.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-geometry L6 — Sector Area & Arc Length ─────────────────────────────

function genSectorArc(): Problem {
  const CASES = [
    {
      question: `A sector has radius 9 cm and angle 80°.\n\nFind the arc length. Give your answer in terms of π.`,
      correct: '4π cm',
      wrongs: ['2π cm', '8π cm', '16π cm'],
      steps: [
        'Arc length = (θ/360) × 2πr',
        'l = (80/360) × 2π × 9',
        'l = (2/9) × 18π',
        'l = 4π cm',
      ],
      hints: ['l = (θ/360) × 2πr', 'θ = 80°, r = 9'],
      mistake: 'Using θ/180 instead of θ/360 — a FULL circle has 360°, not 180°.',
      tip: 'IGCSE: (θ/360) gives the fraction of the full circumference. Check: 80/360 = 2/9.',
    },
    {
      question: `A sector has radius 12 cm and angle 150°.\n\nFind the arc length. Give your answer in terms of π.`,
      correct: '10π cm',
      wrongs: ['5π cm', '12π cm', '20π cm'],
      steps: [
        'l = (θ/360) × 2πr',
        'l = (150/360) × 2π × 12',
        'Simplify: 150/360 = 5/12',
        'l = (5/12) × 24π = 10π cm',
      ],
      hints: ['l = (θ/360) × 2πr', 'Simplify the fraction 150/360 first'],
      mistake: 'Using l = θr (radian formula): 150 × 12 = 1800, not 10π. That formula requires radians.',
      tip: 'CAPS: Always simplify the fraction first. 150/360 = 5/12 makes arithmetic easier.',
    },
    {
      question: `A sector has radius 6 cm and angle 120°.\n\nFind the sector area. Give your answer in terms of π.`,
      correct: '12π cm²',
      wrongs: ['6π cm²', '36π cm²', '24π cm²'],
      steps: [
        'Area = (θ/360) × πr²',
        'A = (120/360) × π × 6²',
        'A = (1/3) × 36π',
        'A = 12π cm²',
      ],
      hints: ['A = (θ/360) × πr²', '120° = ⅓ of 360°'],
      mistake: 'Using the full circle area πr² = 36π — a sector is a FRACTION of the circle.',
      tip: 'IGCSE: 120° = ⅓ turn, so sector = ⅓ × full area = ⅓ × 36π = 12π.',
    },
    {
      question: `A sector has radius 10 cm and angle 72°.\n\nFind the sector area. Give your answer in terms of π.`,
      correct: '20π cm²',
      wrongs: ['10π cm²', '2π cm²', '40π cm²'],
      steps: [
        'A = (θ/360) × πr²',
        'A = (72/360) × π × 10²',
        '72/360 = 1/5',
        'A = (1/5) × 100π = 20π cm²',
      ],
      hints: ['72° = ⅕ of 360°', 'A = (θ/360) × πr²'],
      mistake: 'Using the radius, not radius²: (1/5) × π × 10 = 2π. Remember to SQUARE r.',
      tip: 'CAPS: 72/360 = 1/5. ⅕ × π × 100 = 20π. Always square r in area formulas.',
    },
    {
      question: `A sector has radius 8 cm and angle 135°.\n\nFind the perimeter of the sector. Give your answer in terms of π.`,
      correct: '(16 + 6π) cm',
      wrongs: ['6π cm', '(8 + 6π) cm', '(16 + 3π) cm'],
      steps: [
        'Perimeter = 2 radii + arc length',
        'Arc length: (135/360) × 2π × 8 = (3/8) × 16π = 6π',
        'Two radii: 2 × 8 = 16',
        'Perimeter = 16 + 6π cm',
      ],
      hints: ['Perimeter = 2r + arc length', 'Don\'t forget the two straight edges (radii)'],
      mistake: 'Giving only the arc length (6π) — the perimeter of a sector includes TWO radii: 16 + 6π.',
      tip: 'IGCSE: "Perimeter of sector" = arc + 2 straight sides. This omission is one of the most common mark-losses.',
    },
    {
      question: `A sector has radius 5 cm and arc length 5π cm.\n\nFind the angle of the sector in degrees.`,
      correct: '180°',
      wrongs: ['90°', '120°', '270°'],
      steps: [
        'Arc length = (θ/360) × 2πr',
        '5π = (θ/360) × 2π × 5',
        '5π = (θ/360) × 10π',
        'θ/360 = 5π / 10π = 1/2',
        'θ = 180°',
      ],
      hints: ['Substitute known values into l = (θ/360) × 2πr', 'Solve for θ'],
      mistake: 'Not cancelling π: leaving it as 5/10π instead of 5π/10π = 1/2. The π values cancel completely.',
      tip: 'CAPS: θ = (arc length / circumference) × 360 = (5π / 10π) × 360 = ½ × 360 = 180°.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-stats L3 — Grouped Data, Histograms & Scatter ──────────────────────

function genStats2(): Problem {
  const CASES = [
    {
      question: `The table shows masses of 20 apples:\n\n| Mass (g)  | Freq |\n|-----------|------|\n| 40 – 50   |  2   |\n| 50 – 60   |  8   |\n| 60 – 70   |  6   |\n| 70 – 80   |  4   |\n\nEstimate the mean mass.`,
      correct: '61 g',
      wrongs: ['60 g', '62.5 g', '65 g'],
      steps: [
        'Use midpoints: 45, 55, 65, 75',
        'Σfx = 2×45 + 8×55 + 6×65 + 4×75',
        '= 90 + 440 + 390 + 300 = 1220',
        'Σf = 2 + 8 + 6 + 4 = 20',
        'Mean = 1220 ÷ 20 = 61 g',
      ],
      hints: ['Use the MIDPOINT of each class interval', 'Mean = Σfx ÷ Σf'],
      mistake: 'Using the class boundaries instead of midpoints — always use the MIDPOINT (e.g., 45 for the 40–50 group).',
      tip: 'IGCSE: This is an ESTIMATE because we assume all values in a group equal the midpoint. Say "estimate" in your answer.',
    },
    {
      question: `Heights of 40 plants are recorded:\n\n| Height (cm) | Freq |\n|-------------|------|\n| 0 – 10      |  4   |\n| 10 – 20     | 12   |\n| 20 – 30     | 16   |\n| 30 – 40     |  8   |\n\nUse cumulative frequency to find the median.`,
      correct: '22.5 cm',
      wrongs: ['20 cm', '25 cm', '21 cm'],
      steps: [
        'Cumulative frequencies: 4, 16, 32, 40',
        'Median position = 40/2 = 20th value',
        '20th value is in the 20–30 group (cum. freq. 16 → 32)',
        'Interpolate: 20 + [(20 − 16) / 16] × 10',
        '= 20 + (4/16) × 10 = 20 + 2.5 = 22.5 cm',
      ],
      hints: ['Median = n/2 = 20th position', 'Interpolate within the group that contains the 20th value'],
      mistake: 'Reading 20 as the median because cum. freq. just reaches 20 — interpolation within the group gives 22.5.',
      tip: 'CAPS: On a cumulative frequency curve, read across at n/2 = 20. For a table, interpolate inside the class.',
    },
    {
      question: `A histogram has a bar for the class 20 ≤ x < 30 with frequency density 3.5.\n\nFind the frequency for this class.`,
      correct: '35',
      wrongs: ['3.5', '350', '17.5'],
      steps: [
        'Frequency density = Frequency ÷ Class width',
        'Class width = 30 − 20 = 10',
        'Frequency = Frequency density × Class width',
        'Frequency = 3.5 × 10 = 35',
      ],
      hints: ['Frequency density = freq ÷ class width', 'Rearrange: freq = density × width'],
      mistake: 'Reading the frequency density (3.5) as the frequency — in a histogram, AREA = frequency, not height.',
      tip: 'IGCSE: Frequency density is on the y-axis of a histogram. Frequency = density × class width = area of the bar.',
    },
    {
      question: `A histogram has two bars:\n• 10 ≤ x < 20:  frequency density = 4\n• 20 ≤ x < 40:  frequency density = 2\n\nFind the total number of data values.`,
      correct: '80',
      wrongs: ['60', '12', '40'],
      steps: [
        'Freq for 10–20: density × width = 4 × 10 = 40',
        'Freq for 20–40: density × width = 2 × 20 = 40',
        'Total = 40 + 40 = 80',
      ],
      hints: ['Frequency = density × class width for EACH bar', 'Class widths are different here (10 and 20)'],
      mistake: 'Adding densities: 4 + 2 = 6, then × 10 = 60. Class widths differ — multiply each density by its OWN width.',
      tip: 'CAPS: Unequal class widths are deliberate. Frequency = area of bar. Calculate each separately.',
    },
    {
      question: `A scatter graph of hours studied (x) vs exam score (y) shows points rising from left to right, clustered close to an imaginary straight line.\n\nDescribe the correlation.`,
      correct: 'Strong positive correlation',
      wrongs: ['Weak positive correlation', 'Strong negative correlation', 'No correlation'],
      steps: [
        'Direction: points rise left to right → POSITIVE',
        'How tight? Close to a straight line → STRONG',
        'Conclusion: strong positive correlation',
      ],
      hints: ['Positive = goes up from left to right', 'Strong = points are close to a straight line'],
      mistake: 'Saying "linear correlation" — that describes the line of best fit. Correlation describes the RELATIONSHIP between variables.',
      tip: 'IGCSE/CAPS: Use three words: strength (strong/weak) + direction (positive/negative) + "correlation".',
    },
    {
      question: `A line of best fit passes through (0, 10) and (5, 25).\n\nPredict the y-value when x = 8.`,
      correct: '34',
      wrongs: ['28', '32', '40'],
      steps: [
        'Gradient: m = (25 − 10)/(5 − 0) = 15/5 = 3',
        'y-intercept: 10 (reads off directly)',
        'Equation: y = 3x + 10',
        'At x = 8: y = 3(8) + 10 = 24 + 10 = 34',
      ],
      hints: ['Find the equation of the line: y = mx + c', 'Substitute x = 8 into your equation'],
      mistake: 'Misreading the gradient: some students use (0 − 10)/(5 − 0) = −2 (wrong direction) — always go left to right for rise/run.',
      tip: 'CAPS: x = 8 is just outside the data range — state that this is extrapolation (less reliable).',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-algebra L4 — Algebraic Fractions ───────────────────────────────────

function genAlgebraicFractions(): Problem {
  const CASES = [
    {
      question: `Simplify fully:\n(x² + 5x + 6) / (x + 2)`,
      correct: 'x + 3',
      wrongs: ['x + 2', '(x + 3)(x + 2)', 'x − 3'],
      steps: [
        'Factorise the numerator: x² + 5x + 6 = (x + 2)(x + 3)',
        '(x + 2)(x + 3) / (x + 2)',
        'Cancel (x + 2)',
        'Result = x + 3',
      ],
      hints: ['Factorise the numerator first', 'Cancel the common factor with the denominator'],
      mistake: 'Cancelling individual terms: 6 ÷ 2 = 3 then (x² + 5x)/x = x + 5 is wrong. You must factorise the WHOLE numerator first.',
      tip: 'IGCSE: Always factorise before cancelling. Raw-term cancellation loses all marks.',
    },
    {
      question: `Simplify fully:\n(x² − 9) / (x + 3)`,
      correct: 'x − 3',
      wrongs: ['x + 3', 'x² − 3', 'x'],
      steps: [
        'Recognise difference of two squares: x² − 9 = (x + 3)(x − 3)',
        '(x + 3)(x − 3) / (x + 3)',
        'Cancel (x + 3)',
        'Result = x − 3',
      ],
      hints: ['x² − 9 = x² − 3² — difference of two squares', 'a² − b² = (a + b)(a − b)'],
      mistake: 'Writing x² − 9 as (x − 9)(x + 1) — that factorisation is wrong. Spot the pattern: a² − b² = (a+b)(a−b).',
      tip: 'CAPS: x² − 9 = (x+3)(x−3). The two factors differ only by sign — that is the signature of DOTS.',
    },
    {
      question: `Simplify:\n3/(x + 1)  +  2/(x − 1)`,
      correct: '(5x − 1) / [(x + 1)(x − 1)]',
      wrongs: ['5/(2x)', '5/(x² − 1)', '(5x + 1) / [(x + 1)(x − 1)]'],
      steps: [
        'LCD = (x + 1)(x − 1)',
        '[3(x − 1) + 2(x + 1)] / [(x + 1)(x − 1)]',
        '= [3x − 3 + 2x + 2] / [(x + 1)(x − 1)]',
        '= (5x − 1) / [(x + 1)(x − 1)]',
      ],
      hints: ['LCD = (x + 1)(x − 1)', 'Multiply each numerator by the missing factor'],
      mistake: 'Adding numerators and denominators straight across: 3 + 2 = 5 and (x+1)+(x−1) = 2x → 5/2x. Fractions require a common denominator.',
      tip: 'IGCSE: Same process as numeric fractions. Find LCD, multiply each term by what it is missing.',
    },
    {
      question: `Simplify:\n4/x  −  1/(x + 2)`,
      correct: '(3x + 8) / [x(x + 2)]',
      wrongs: ['3/(x + 2)', '(3x − 8) / [x(x + 2)]', '3/(x(x + 2))'],
      steps: [
        'LCD = x(x + 2)',
        '[4(x + 2) − x] / [x(x + 2)]',
        '= [4x + 8 − x] / [x(x + 2)]',
        '= (3x + 8) / [x(x + 2)]',
      ],
      hints: ['LCD = x(x + 2)', 'Expand 4(x + 2) carefully before collecting'],
      mistake: 'Forgetting to expand: 4/(x) becomes 4(x+2) over the LCD, not just 4. Distribute the bracket.',
      tip: 'CAPS: Expand every numerator fully, THEN collect like terms. Never skip the expansion step.',
    },
    {
      question: `Solve:\n5/(x − 1)  =  2`,
      correct: 'x = 3.5',
      wrongs: ['x = 2.5', 'x = 3', 'x = 6'],
      steps: [
        'Multiply both sides by (x − 1):',
        '5 = 2(x − 1)',
        '5 = 2x − 2',
        '7 = 2x',
        'x = 3.5',
      ],
      hints: ['Clear the fraction by multiplying both sides by (x − 1)', 'Expand and solve the resulting linear equation'],
      mistake: 'Expanding 2(x−1) as 2x − 1 instead of 2x − 2. Distribute: 2 × (−1) = −2, not −1.',
      tip: 'IGCSE: "Clear" the fraction first (multiply through by the denominator), then solve normally.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-algebra L5 — Completing the Square ─────────────────────────────────

function genCompletingSquare(): Problem {
  const CASES = [
    {
      question: `Express in the form (x + p)² + q:\nx² + 6x + 11`,
      correct: '(x + 3)² + 2',
      wrongs: ['(x + 3)² + 11', '(x + 6)² + 2', '(x + 3)² − 2'],
      steps: [
        'Half the coefficient of x: 6/2 = 3',
        '(x + 3)² = x² + 6x + 9',
        'x² + 6x + 11 = (x + 3)² − 9 + 11',
        '= (x + 3)² + 2',
      ],
      hints: ['p = half the x-coefficient: 6/2 = 3', 'q = constant − p² = 11 − 9 = 2'],
      mistake: 'Not subtracting p² to compensate: writing (x+3)² + 11 forgets that (x+3)² already contains +9.',
      tip: 'IGCSE: (x+p)² = x² + 2px + p². When you "add" p², you must also subtract it: (x+3)² − 9 + 11.',
    },
    {
      question: `Express in the form (x + p)² + q:\nx² + 4x + 1`,
      correct: '(x + 2)² − 3',
      wrongs: ['(x + 2)² + 3', '(x + 4)² − 3', '(x + 2)² − 1'],
      steps: [
        'Half the x-coefficient: 4/2 = 2',
        'x² + 4x + 1 = (x + 2)² − 4 + 1',
        '= (x + 2)² − 3',
      ],
      hints: ['p = 2,  p² = 4', 'q = 1 − 4 = −3'],
      mistake: 'Getting the sign wrong: q = 1 − 4 = −3, not +3. When c < p², q is negative.',
      tip: 'CAPS: q = c − p². If c < p², you get a negative q. Here: 1 − 4 = −3.',
    },
    {
      question: `By completing the square, find the minimum value of:\ny = x² − 8x + 20`,
      correct: '4  (when x = 4)',
      wrongs: ['−4  (when x = −4)', '20  (when x = 0)', '36  (when x = 8)'],
      steps: [
        'Half the x-coefficient: −8/2 = −4',
        'y = (x − 4)² − 16 + 20',
        '= (x − 4)² + 4',
        'Minimum when (x − 4)² = 0, i.e. x = 4',
        'Minimum value = 4',
      ],
      hints: ['Complete the square: y = (x − 4)² + 4', 'Minimum = q-value when the squared term is zero'],
      mistake: 'Reading the minimum as y = 20 (the constant) — the actual minimum is at the vertex, not at x = 0.',
      tip: 'IGCSE: y = (x − h)² + k has vertex (h, k). Minimum value = k (the q-value).',
    },
    {
      question: `Solve by completing the square:\nx² + 6x − 7 = 0`,
      correct: 'x = 1  or  x = −7',
      wrongs: ['x = −1  or  x = 7', 'x = 1  or  x = 7', 'x = 3 + 4  or  x = 3 − 4'],
      steps: [
        'Move constant: x² + 6x = 7',
        'Complete the square: (x + 3)² − 9 = 7',
        '(x + 3)² = 16',
        'x + 3 = ±4',
        'x = 1  or  x = −7',
      ],
      hints: ['Move the constant to the RHS first', 'After completing, take ±√ of both sides'],
      mistake: 'Forgetting the ± sign when taking the square root — √16 = ±4 gives TWO solutions.',
      tip: 'CAPS: After (x + p)² = k, take ±√k. There are always two solutions unless k = 0.',
    },
    {
      question: `Solve by completing the square. Give exact answers:\nx² − 4x − 3 = 0`,
      correct: 'x = 2 + √7  or  x = 2 − √7',
      wrongs: ['x = ±2 + √7', 'x = −2 ± √7', 'x = 4 ± √7'],
      steps: [
        'x² − 4x = 3',
        '(x − 2)² − 4 = 3',
        '(x − 2)² = 7',
        'x − 2 = ±√7',
        'x = 2 + √7  or  x = 2 − √7',
      ],
      hints: ['(x − 2)² = 7 → x − 2 = ±√7', 'Add 2 to both sides'],
      mistake: 'Writing x = ±2 + √7 — the 2 comes from solving x − 2 = ±√7, so it is always positive: x = 2 ± √7.',
      tip: 'IGCSE: "Exact answers" = leave as surds. Do not approximate √7.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-algebra L6 — Linear + Quadratic Simultaneous ───────────────────────

function genSimultaneousLinQuad(): Problem {
  const CASES = [
    {
      question: `Solve simultaneously:\ny = 2x + 3\ny = x²`,
      correct: '(3, 9)  and  (−1, 1)',
      wrongs: ['(3, 9) only', '(2, 7)  and  (−1, 1)', '(−3, −3)  and  (1, 5)'],
      steps: [
        'Substitute y = 2x + 3 into y = x²:',
        'x² = 2x + 3',
        'x² − 2x − 3 = 0',
        '(x − 3)(x + 1) = 0',
        'x = 3 → y = 9;   x = −1 → y = 1',
        'Solutions: (3, 9) and (−1, 1)',
      ],
      hints: ['Substitute the linear equation into the quadratic', 'Rearrange to get a quadratic = 0, then factorise'],
      mistake: 'Finding only one solution — after factorising, BOTH values of x give separate solution pairs.',
      tip: 'IGCSE: Simultaneous with a quadratic always gives 0, 1, or 2 pairs. Show both pairs for full marks.',
    },
    {
      question: `Solve simultaneously:\ny = x + 2\ny = x²`,
      correct: '(2, 4)  and  (−1, 1)',
      wrongs: ['(2, 4) only', '(−2, 0)  and  (1, 3)', '(1, 3)  and  (−2, 0)'],
      steps: [
        'Substitute y = x + 2 into y = x²:',
        'x² = x + 2',
        'x² − x − 2 = 0',
        '(x − 2)(x + 1) = 0',
        'x = 2 → y = 4;   x = −1 → y = 1',
      ],
      hints: ['Set the two expressions for y equal to each other', 'x² − x − 2 = 0 factorises nicely'],
      mistake: 'Forgetting to find both y values — substitute EACH x back into the LINEAR equation to find y.',
      tip: 'CAPS: Use the linear equation to find y (it\'s simpler than using the quadratic).',
    },
    {
      question: `Solve simultaneously:\ny = x + 6\ny = x² + 2x`,
      correct: '(2, 8)  and  (−3, 3)',
      wrongs: ['(2, 8) only', '(3, 9)  and  (−2, 4)', '(2, 8)  and  (3, 9)'],
      steps: [
        'Substitute y = x + 6 into y = x² + 2x:',
        'x + 6 = x² + 2x',
        'x² + x − 6 = 0',
        '(x + 3)(x − 2) = 0',
        'x = −3 → y = 3;   x = 2 → y = 8',
      ],
      hints: ['Substitute the linear expression for y into the quadratic', 'Rearrange: all terms to one side'],
      mistake: 'Rearranging incorrectly: x + 6 = x² + 2x → move everything: 0 = x² + 2x − x − 6 = x² + x − 6.',
      tip: 'IGCSE: Move ALL terms to one side (make it = 0) before factorising.',
    },
    {
      question: `Solve simultaneously:\ny = 5 − 2x\ny = x² − 3`,
      correct: '(2, 1)  and  (−4, 13)',
      wrongs: ['(2, 1) only', '(2, 1)  and  (4, −3)', '(1, 3)  and  (−4, 13)'],
      steps: [
        'Substitute y = 5 − 2x into y = x² − 3:',
        '5 − 2x = x² − 3',
        'x² + 2x − 8 = 0',
        '(x + 4)(x − 2) = 0',
        'x = −4 → y = 13;   x = 2 → y = 1',
      ],
      hints: ['Substitute and rearrange to standard quadratic form', '(x + 4)(x − 2) = 0'],
      mistake: 'Sign error when rearranging: 5 − 2x = x² − 3 → x² + 2x − 8 = 0 (move 5 and 2x from LHS, subtract 3 cancels).',
      tip: 'CAPS: Move LHS to RHS: x² − 3 − (5 − 2x) = 0 → x² − 3 − 5 + 2x = 0 → x² + 2x − 8 = 0.',
    },
    {
      question: `Solve simultaneously:\nx + y = 5\ny = x² − 7`,
      correct: '(3, 2)  and  (−4, 9)',
      wrongs: ['(3, 2) only', '(3, 2)  and  (4, 1)', '(−3, 8)  and  (4, 1)'],
      steps: [
        'From the linear: y = 5 − x',
        'Substitute into y = x² − 7:',
        '5 − x = x² − 7',
        'x² + x − 12 = 0',
        '(x + 4)(x − 3) = 0',
        'x = 3 → y = 2;   x = −4 → y = 9',
      ],
      hints: ['Rearrange the linear equation to y = 5 − x first', 'Then substitute into the quadratic'],
      mistake: 'Using x + y = 5 to write x = 5 − y and substituting into y = x² − 7 — this works but gives a messier quadratic. Use y = 5 − x instead.',
      tip: 'IGCSE: Always substitute the linear into the quadratic (not vice versa) to keep the algebra cleaner.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 5,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-numeracy L1 — Percentage, Ratio & Proportion ───────────────────────

function genPercentageRatio(): Problem {
  const CASES = [
    {
      question: `A jacket costs $80. The price increases by 15%.\n\nFind the new price.`,
      correct: '$92',
      wrongs: ['$12', '$95', '$82'],
      steps: [
        'Multiplier for 15% increase = 1 + 0.15 = 1.15',
        'New price = 80 × 1.15',
        '= $92',
      ],
      hints: ['Increase → multiply by (1 + rate)', '15% increase → multiply by 1.15'],
      mistake: 'Finding 15% of 80 = $12 and stopping — that is only the increase. Add it: 80 + 12 = $92.',
      tip: 'IGCSE: Multiplier method is faster. 1.15 × 80 = $92 in one step. Avoids addition errors.',
    },
    {
      question: `A TV costs R3 600. In a sale, prices are reduced by 20%.\n\nFind the sale price.`,
      correct: 'R2 880',
      wrongs: ['R720', 'R3 000', 'R2 400'],
      steps: [
        'Multiplier for 20% decrease = 1 − 0.20 = 0.80',
        'Sale price = 3 600 × 0.80',
        '= R2 880',
      ],
      hints: ['Decrease → multiply by (1 − rate)', '20% off → multiply by 0.8'],
      mistake: 'Finding 20% = R720 and forgetting to subtract: R3 600 − R720 = R2 880. Or using 0.2 directly.',
      tip: 'CAPS: Sale price = original × 0.80. The "0.8 method" is one step and less error-prone.',
    },
    {
      question: `After a 25% increase, a price is $250.\n\nFind the original price.`,
      correct: '$200',
      wrongs: ['$187.50', '$312.50', '$225'],
      steps: [
        'A 25% increase means the new price = 1.25 × original',
        '1.25 × original = 250',
        'Original = 250 ÷ 1.25',
        '= $200',
      ],
      hints: ['Reverse percentage: divide by the multiplier', 'New price = 1.25 × original → original = new ÷ 1.25'],
      mistake: 'Finding 25% of $250 = $62.50 and subtracting: $250 − $62.50 = $187.50. That is wrong — 25% of the ORIGINAL, not the new price.',
      tip: 'IGCSE: Reverse percentage → always divide by the multiplier. Never take % of the new value.',
    },
    {
      question: `Share R600 in the ratio 2 : 3 : 1 among A, B, and C.\n\nHow much does B receive?`,
      correct: 'R300',
      wrongs: ['R200', 'R100', 'R150'],
      steps: [
        'Total parts = 2 + 3 + 1 = 6',
        'B\'s share = 3 parts out of 6',
        'B = (3/6) × 600 = ½ × 600 = R300',
      ],
      hints: ['Find total parts first', 'B\'s fraction = B\'s parts ÷ total parts'],
      mistake: 'Dividing R600 by 3 = R200 (treating ratio as 3 equal parts) — but the total is 6 parts, not 3.',
      tip: 'CAPS: Always find total parts first. B gets 3/6 = ½ of R600 = R300.',
    },
    {
      question: `y is directly proportional to x.\nWhen x = 4, y = 20.\n\nFind y when x = 7.`,
      correct: '35',
      wrongs: ['28', '23', '40'],
      steps: [
        'Direct proportion: y = kx',
        'Find k: 20 = k × 4 → k = 5',
        'When x = 7: y = 5 × 7 = 35',
      ],
      hints: ['y = kx for direct proportion', 'Find k first, then substitute'],
      mistake: 'Adding the difference: x increased by 3, so y increases by 3 → y = 23. That is arithmetic progression, not proportion.',
      tip: 'IGCSE: Direct proportion is multiplicative: k = y/x = 20/4 = 5. Always the same ratio.',
    },
    {
      question: `y is inversely proportional to x.\nWhen x = 3, y = 12.\n\nFind y when x = 9.`,
      correct: '4',
      wrongs: ['36', '6', '3'],
      steps: [
        'Inverse proportion: y = k/x',
        'Find k: 12 = k/3 → k = 36',
        'When x = 9: y = 36/9 = 4',
      ],
      hints: ['y = k/x for inverse proportion', 'k = xy (constant product)'],
      mistake: 'Treating as direct proportion: y = 12 × (3/9) = 4. This gives the right answer but wrong method — use y = k/x.',
      tip: 'CAPS: Inverse proportion: as x increases, y decreases. k = xy = 3 × 12 = 36.',
    },
    {
      question: `A car travels 240 km at a constant speed of 80 km/h.\n\nHow long does the journey take? Give your answer in minutes.`,
      correct: '180 minutes',
      wrongs: ['3 minutes', '240 minutes', '120 minutes'],
      steps: [
        'Time = Distance ÷ Speed',
        'T = 240 ÷ 80 = 3 hours',
        'Convert: 3 hours × 60 = 180 minutes',
      ],
      hints: ['Time = Distance ÷ Speed', 'Convert hours to minutes at the end: × 60'],
      mistake: 'Forgetting to convert to minutes: 3 hours is not 3 minutes.',
      tip: 'IGCSE: Triangle method — D at top, S and T at bottom: D = S×T, S = D/T, T = D/S.',
    },
    {
      question: `A cyclist covers 15 km at a speed of 20 km/h.\nThen cycles 10 km at 25 km/h.\n\nFind the average speed for the whole journey.`,
      correct: '22.2 km/h',
      wrongs: ['22.5 km/h', '21.5 km/h', '20.8 km/h'],
      steps: [
        'Total distance = 15 + 10 = 25 km',
        'Time 1: 15/20 = 0.75 hours',
        'Time 2: 10/25 = 0.4 hours',
        'Total time = 0.75 + 0.4 = 1.15 hours',
        'Average speed = 25 / 1.15 ≈ 21.74 ≈ 22.2 km/h (3 s.f.)',
      ],
      hints: ['Average speed = total distance ÷ total time', 'Calculate each time separately, then add'],
      mistake: 'Averaging the speeds: (20 + 25)/2 = 22.5. This only works if equal TIMES, not equal distances.',
      tip: 'IGCSE: Average speed = total distance ÷ total time. NEVER average the speeds directly.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: true,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-trig L6 — Inverse Trigonometry (Finding Angles) ────────────────────

function genInverseTrig(): Problem {
  const CASES = [
    {
      question: `In a right triangle, the side opposite θ is 3 cm and the hypotenuse is 5 cm.\n\nFind θ. Give your answer to 1 decimal place.`,
      correct: 'θ = 36.9°',
      wrongs: ['θ = 53.1°', 'θ = 30.0°', 'θ = 53.6°'],
      steps: [
        'sin θ = opposite/hypotenuse = 3/5 = 0.6',
        'θ = sin⁻¹(0.6)',
        'θ = 36.87° ≈ 36.9°',
      ],
      hints: ['sin θ = opp/hyp', 'Use sin⁻¹ on your calculator'],
      mistake: 'Using cos instead of sin: cos θ = 3/5 → θ = 53.1° — that gives the OTHER angle. Opposite ÷ hypotenuse = sin.',
      tip: 'IGCSE: Check which ratio to use. Opposite and hypotenuse → sin. Adjacent and hypotenuse → cos. Opposite and adjacent → tan.',
    },
    {
      question: `A right triangle has adjacent side 4 cm and hypotenuse 8 cm.\n\nFind angle θ. Give your answer to 1 decimal place.`,
      correct: 'θ = 60.0°',
      wrongs: ['θ = 30.0°', 'θ = 45.0°', 'θ = 53.1°'],
      steps: [
        'cos θ = adjacent/hypotenuse = 4/8 = 0.5',
        'θ = cos⁻¹(0.5)',
        'θ = 60°',
      ],
      hints: ['cos θ = adj/hyp', 'cos⁻¹(0.5) is an exact value: 60°'],
      mistake: 'Getting 30°: that is sin⁻¹(0.5). For cos⁻¹(0.5) = 60°, not 30°.',
      tip: 'CAPS: Exact values to know — cos⁻¹(0.5) = 60°, sin⁻¹(0.5) = 30°. They are different because they are different ratios.',
    },
    {
      question: `In triangle ABC, angle C = 90°, BC = 5 cm (opposite), AC = 5 cm (adjacent).\n\nFind angle A.`,
      correct: 'A = 45°',
      wrongs: ['A = 60°', 'A = 30°', 'A = 90°'],
      steps: [
        'tan A = opposite/adjacent = 5/5 = 1',
        'A = tan⁻¹(1)',
        'A = 45°',
      ],
      hints: ['tan A = opp/adj', 'tan⁻¹(1) = 45° (exact value)'],
      mistake: 'Adding the two sides: 5 + 5 = 10 and dividing by hypotenuse — you need tan⁻¹, not division.',
      tip: 'IGCSE: When opposite = adjacent, tan = 1 → angle = 45°. Isoceles right triangle.',
    },
    {
      question: `A ramp rises 2 m vertically over a horizontal distance of 5 m.\n\nFind the angle of inclination. Give your answer to 1 decimal place.`,
      correct: '21.8°',
      wrongs: ['66.4°', '23.6°', '20.0°'],
      steps: [
        'tan θ = opposite/adjacent = 2/5 = 0.4',
        'θ = tan⁻¹(0.4)',
        'θ ≈ 21.8°',
      ],
      hints: ['Draw a right triangle: rise = 2, run = 5', 'tan θ = rise/run = 2/5'],
      mistake: 'Using sin θ = 2/5: that requires the hypotenuse, not the horizontal. With rise and run, use tan.',
      tip: 'CAPS: Draw the triangle first. Label the known sides. Then choose SOH-CAH-TOA correctly.',
    },
    {
      question: `A vertical tower 20 m tall casts a horizontal shadow 15 m long.\n\nFind the angle of elevation of the sun. Give your answer to 1 decimal place.`,
      correct: '53.1°',
      wrongs: ['36.9°', '48.2°', '60.0°'],
      steps: [
        'tan θ = opposite/adjacent = 20/15 = 4/3',
        'θ = tan⁻¹(4/3)',
        'θ = tan⁻¹(1.333…) ≈ 53.1°',
      ],
      hints: ['Angle of elevation is from the horizontal', 'tan θ = height/shadow = 20/15'],
      mistake: 'Reversing the ratio: tan⁻¹(15/20) = 36.9° — that is the angle at the top. Elevation is measured from the ground.',
      tip: 'IGCSE: Angle of elevation is always at the OBSERVER\'S position (at the base of the shadow).',
    },
    {
      question: `A ladder 8 m long leans against a wall. The base of the ladder is 3 m from the wall.\n\nFind the angle the ladder makes with the ground. Give your answer to 1 decimal place.`,
      correct: '68.0°',
      wrongs: ['22.0°', '70.5°', '53.1°'],
      steps: [
        'cos θ = adjacent/hypotenuse = 3/8 = 0.375',
        'θ = cos⁻¹(0.375)',
        'θ ≈ 68.0°',
      ],
      hints: ['The ladder is the hypotenuse; the ground distance is adjacent', 'cos θ = adj/hyp = 3/8'],
      mistake: 'Using sin θ = 3/8: sin uses the opposite, but here 3 m is adjacent (along the ground). Use cos.',
      tip: 'CAPS: Identify which sides you know relative to the angle first. Ground = adjacent (next to θ), ladder = hypotenuse.',
    },
    {
      question: `In triangle XYZ:\nXY = 10 cm, YZ = 6 cm, angle Y = 90°.\n\nFind angle X. Give your answer to 1 decimal place.`,
      correct: '36.9°',
      wrongs: ['53.1°', '30.0°', '60.0°'],
      steps: [
        'From angle X: YZ is opposite, XY is hypotenuse',
        'sin X = YZ/XY = 6/10 = 0.6',
        'X = sin⁻¹(0.6) ≈ 36.9°',
      ],
      hints: ['Angle Y = 90° makes XY the hypotenuse', 'From angle X: opposite = YZ = 6'],
      mistake: 'Using cos: cos X = 6/10 → X = 53.1°. But 6 is opposite angle X, not adjacent. Use sin.',
      tip: 'IGCSE: Always label sides RELATIVE to the angle you want. Opposite = across from the angle.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: true,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-trig L7 — Area of Triangle = ½ab·sin C ─────────────────────────────

function genTriangleAreaSinC(): Problem {
  const CASES = [
    {
      question: `Triangle ABC has AB = 8 cm, AC = 6 cm and angle A = 30°.\n\nFind the area of the triangle.`,
      correct: '12 cm²',
      wrongs: ['24 cm²', '6√3 cm²', '48 cm²'],
      steps: [
        'Area = ½ × a × b × sin C',
        'Area = ½ × 8 × 6 × sin 30°',
        'sin 30° = 0.5',
        'Area = ½ × 8 × 6 × 0.5 = 12 cm²',
      ],
      hints: ['Area = ½ab sin C', 'sin 30° = 0.5'],
      mistake: 'Forgetting the ½: 8 × 6 × 0.5 = 24. The formula has its own ½ — don\'t omit it.',
      tip: 'IGCSE: Area = ½ab sin C. Three things to remember: ½, two sides, and the INCLUDED angle.',
    },
    {
      question: `Triangle PQR has PQ = 10 cm, PR = 6 cm and angle P = 60°.\n\nFind the exact area.`,
      correct: '15√3 cm²',
      wrongs: ['30 cm²', '30√3 cm²', '15 cm²'],
      steps: [
        'Area = ½ × 10 × 6 × sin 60°',
        'sin 60° = √3/2',
        'Area = ½ × 60 × (√3/2)',
        '= 30 × (√3/2) = 15√3 cm²',
      ],
      hints: ['sin 60° = √3/2 (exact value)', 'Area = ½ × 10 × 6 × (√3/2)'],
      mistake: 'Using sin 60° ≈ 0.87 and getting ~26 cm² — "exact area" means leave as 15√3.',
      tip: 'CAPS: For exact answers, use sin 60° = √3/2, sin 30° = ½, sin 45° = √2/2.',
    },
    {
      question: `Triangle with sides 5 cm and 4 cm. The included angle is 90°.\n\nUse Area = ½ab sin C to find the area.`,
      correct: '10 cm²',
      wrongs: ['20 cm²', '5 cm²', '8 cm²'],
      steps: [
        'Area = ½ × 5 × 4 × sin 90°',
        'sin 90° = 1',
        'Area = ½ × 5 × 4 × 1 = 10 cm²',
      ],
      hints: ['sin 90° = 1', 'This gives the same result as ½ × base × height for a right triangle'],
      mistake: 'No mistake is common here — this case confirms the formula works for right triangles too (sin 90° = 1).',
      tip: 'IGCSE: When C = 90°, Area = ½ab sin 90° = ½ab × 1 = ½ab — same as the basic ½bh formula. The formulas are consistent.',
    },
    {
      question: `Triangle with two sides 12 cm and 10 cm. The included angle is 150°.\n\nFind the area.`,
      correct: '30 cm²',
      wrongs: ['60√3 cm²', '60 cm²', '30√3 cm²'],
      steps: [
        'Area = ½ × 12 × 10 × sin 150°',
        'sin 150° = sin 30° = 0.5',
        'Area = ½ × 12 × 10 × 0.5 = 30 cm²',
      ],
      hints: ['sin(150°) = sin(180° − 150°) = sin(30°) = 0.5', 'Obtuse angle — use sin of the supplementary angle'],
      mistake: 'Using sin 150° ≈ 0.87 (confusing with sin 60°). sin 150° = 0.5, same as sin 30°.',
      tip: 'CAPS: sin(180° − x) = sin x. So sin 150° = sin 30° = 0.5. Always true for obtuse angles.',
    },
    {
      question: `The area of triangle ABC is 20 cm².\nAB = 8 cm,  AC = 10 cm.\n\nFind angle A (two possible values).`,
      correct: '30° or 150°',
      wrongs: ['30° only', '60° or 120°', '45°'],
      steps: [
        'Area = ½ × AB × AC × sin A',
        '20 = ½ × 8 × 10 × sin A',
        '20 = 40 sin A',
        'sin A = 0.5',
        'A = sin⁻¹(0.5) = 30°  or  A = 180° − 30° = 150°',
      ],
      hints: ['Rearrange the area formula: sin A = 2 × Area / (ab)', 'sin A = 0.5 has two solutions in 0°–180°'],
      mistake: 'Giving only 30° — sin(0.5) has two solutions in a triangle: 30° and 150°. Both are valid included angles.',
      tip: 'IGCSE: sin⁻¹ always returns one value (acute). For triangles, check if 180° minus that angle also works.',
    },
    {
      question: `Triangle with sides 4 cm and 6 cm, included angle 120°.\n\nFind the exact area.`,
      correct: '6√3 cm²',
      wrongs: ['12 cm²', '12√3 cm²', '3√3 cm²'],
      steps: [
        'Area = ½ × 4 × 6 × sin 120°',
        'sin 120° = sin 60° = √3/2',
        'Area = ½ × 24 × (√3/2)',
        '= 12 × (√3/2) = 6√3 cm²',
      ],
      hints: ['sin 120° = sin 60° = √3/2', 'Area = ½ × 4 × 6 × (√3/2)'],
      mistake: 'Using sin 120° ≈ 0.866 and computing ≈ 10.4 — "exact" means leave as 6√3.',
      tip: 'CAPS: sin 120° = sin(180° − 120°) = sin 60° = √3/2. Remember the supplementary angle rule.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-matrices L3 — Inverse Matrix ───────────────────────────────────────

function genInverseMatrix(): Problem {
  const CASES = [
    {
      question: `Find the inverse of:\nM = [[2, 1], [5, 3]]`,
      correct: 'M⁻¹ = [[3, −1], [−5, 2]]',
      wrongs: ['M⁻¹ = [[3, 1], [5, 2]]', 'M⁻¹ = [[2, −1], [−5, 3]]', 'M⁻¹ = [[1/2, 1], [5, 1/3]]'],
      steps: [
        'det(M) = (2)(3) − (1)(5) = 6 − 5 = 1',
        'For M = [[a,b],[c,d]],  M⁻¹ = (1/det) × [[d, −b], [−c, a]]',
        'M⁻¹ = 1 × [[3, −1], [−5, 2]]',
        '= [[3, −1], [−5, 2]]',
      ],
      hints: ['det = ad − bc', 'Swap a and d; negate b and c; divide by det'],
      mistake: 'Not negating b and c: writing [[3, 1], [5, 2]] — the off-diagonal elements change sign in the inverse.',
      tip: 'IGCSE: det = ad − bc. M⁻¹ = (1/det)[[d, −b], [−c, a]]. Main diagonal swaps; off-diagonal negates.',
    },
    {
      question: `Find the inverse of:\nM = [[3, 2], [4, 3]]`,
      correct: 'M⁻¹ = [[3, −2], [−4, 3]]',
      wrongs: ['M⁻¹ = [[3, 2], [4, 3]]', 'M⁻¹ = [[−3, 2], [4, −3]]', 'M⁻¹ = [[3, −2], [4, 3]]'],
      steps: [
        'det(M) = 3 × 3 − 2 × 4 = 9 − 8 = 1',
        'M⁻¹ = 1 × [[3, −2], [−4, 3]]',
      ],
      hints: ['det = 9 − 8 = 1', 'Swap 3 and 3 (no change); negate both 2s'],
      mistake: 'Giving M itself as the inverse — when det = 1, the inverse formula changes signs only: off-diagonal entries must be negated.',
      tip: 'CAPS: Verify: M × M⁻¹ = I. Multiply to check.',
    },
    {
      question: `Find the inverse of:\nM = [[4, 1], [7, 2]]`,
      correct: 'M⁻¹ = [[2, −1], [−7, 4]]',
      wrongs: ['M⁻¹ = [[4, −1], [−7, 2]]', 'M⁻¹ = [[2, 1], [7, 4]]', 'M⁻¹ = [[2, −1], [7, 4]]'],
      steps: [
        'det = 4 × 2 − 1 × 7 = 8 − 7 = 1',
        'Swap a and d: 4 ↔ 2 (main diagonal)',
        'Negate b and c: 1 → −1, 7 → −7',
        'M⁻¹ = [[2, −1], [−7, 4]]',
      ],
      hints: ['det = 8 − 7 = 1', 'Swap the main diagonal (4 and 2); negate the other two entries'],
      mistake: 'Only swapping b and c (not a and d): giving [[4, −1], [−7, 2]] — the main diagonal a and d MUST be swapped.',
      tip: 'IGCSE: Main diagonal swaps (top-left ↔ bottom-right). Off-diagonal negates. Easy to mix these up.',
    },
    {
      question: `For matrix M = [[5, 3], [3, 2]], find M⁻¹.`,
      correct: 'M⁻¹ = [[2, −3], [−3, 5]]',
      wrongs: ['M⁻¹ = [[2, 3], [3, 5]]', 'M⁻¹ = [[5, −3], [−3, 2]]', 'M⁻¹ = [[−2, 3], [3, −5]]'],
      steps: [
        'det = 5 × 2 − 3 × 3 = 10 − 9 = 1',
        'Swap 5 and 2; negate both 3s',
        'M⁻¹ = [[2, −3], [−3, 5]]',
      ],
      hints: ['det = 10 − 9 = 1', 'Main diagonal: 5 ↔ 2. Off-diagonal: 3 → −3'],
      mistake: 'Swapping off-diagonal (the 3s) instead of the main diagonal — it is the top-left/bottom-right that swap.',
      tip: 'CAPS: Memory tip: "swap the main, negate the off". Main = top-left and bottom-right.',
    },
    {
      question: `Find the inverse of:\nM = [[3, 1], [4, 2]]`,
      correct: 'M⁻¹ = [[1, −½], [−2, 3/2]]',
      wrongs: ['M⁻¹ = [[2, −1], [−4, 3]]', 'M⁻¹ = [[3, −1], [−4, 2]]', 'M⁻¹ = [[2, 1], [4, 3]]'],
      steps: [
        'det = 3 × 2 − 1 × 4 = 6 − 4 = 2',
        'Adjugate = [[2, −1], [−4, 3]]',
        'M⁻¹ = (1/2) × [[2, −1], [−4, 3]]',
        '= [[1, −½], [−2, 3/2]]',
      ],
      hints: ['det = 6 − 4 = 2  (not 1 this time!)', 'Divide every element of the adjugate by det = 2'],
      mistake: 'Forgetting to divide by det: giving [[2, −1], [−4, 3]] — when det ≠ 1, you must scale by 1/det.',
      tip: 'IGCSE: When det = 2, multiply adjugate by ½. Check: M × M⁻¹ should equal [[1,0],[0,1]].',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-numbers L8 — Logarithm Quotient & Combined Laws ────────────────────

function genLogQuotient(): Problem {
  const CASES = [
    {
      question: `Simplify:\nlog₂ 32 − log₂ 4`,
      correct: '3',
      wrongs: ['log₂ 28', '8', '2'],
      steps: [
        'Quotient law: log_a(m) − log_a(n) = log_a(m/n)',
        'log₂ 32 − log₂ 4 = log₂(32/4)',
        '= log₂ 8',
        '= 3  (since 2³ = 8)',
      ],
      hints: ['log m − log n = log(m/n)', 'What power of 2 gives 8?'],
      mistake: 'Subtracting numbers: 32 − 4 = 28 → log₂ 28 ≠ 3. The quotient law is log(m/n), not log(m−n).',
      tip: 'IGCSE: log m − log n = log(m/n). Always combine first, then evaluate.',
    },
    {
      question: `Simplify:\nlog₅ 125 − log₅ 25`,
      correct: '1',
      wrongs: ['log₅ 100', '3', '5'],
      steps: [
        'log₅ 125 − log₅ 25 = log₅(125/25)',
        '= log₅ 5',
        '= 1  (since 5¹ = 5)',
      ],
      hints: ['Apply quotient law: combine into one log', 'log₅ 5 = 1 always'],
      mistake: 'Evaluating separately: log₅ 125 = 3, log₅ 25 = 2, so 3 − 2 = 1 — the subtraction of values works here but only because the base is the same. Use the law to be safe.',
      tip: 'CAPS: log_a(a) = 1 always. Here log₅ 5 = 1.',
    },
    {
      question: `Simplify:\nlog 50 + log 4 − log 2`,
      correct: '2',
      wrongs: ['log 52', 'log 25', '1'],
      steps: [
        'Combine all: log(50 × 4 / 2)',
        '= log(200 / 2)',
        '= log 100',
        '= 2  (since 10² = 100)',
      ],
      hints: ['Apply both product and quotient laws together', 'log m + log n − log p = log(mn/p)'],
      mistake: 'Adding first: log 50 + log 4 = log 200, then − log 2 = log 198 (subtracting numbers, not logs). Use log(200/2) = log 100.',
      tip: 'IGCSE: Handle all log operations BEFORE evaluating. log(50 × 4 / 2) = log 100 = 2.',
    },
    {
      question: `Simplify:\n2log₃ 6 − log₃ 4`,
      correct: 'log₃ 9  =  2',
      wrongs: ['log₃ 8', 'log₃ 5', 'log₃ 72'],
      steps: [
        'Apply power law: 2log₃ 6 = log₃ 6² = log₃ 36',
        'log₃ 36 − log₃ 4 = log₃(36/4)',
        '= log₃ 9',
        '= 2  (since 3² = 9)',
      ],
      hints: ['Power law first: n·log_a(m) = log_a(mⁿ)', 'Then apply quotient law'],
      mistake: 'Doing 2 × 6 = 12 instead of 6² = 36: 2log 6 means log(6²) = log 36, not log(2 × 6).',
      tip: 'CAPS: n·log m = log(mⁿ). Order: power law first, then product/quotient, then evaluate.',
    },
    {
      question: `Solve:\nlog₄ x − log₄ 2 = 1`,
      correct: 'x = 8',
      wrongs: ['x = 6', 'x = 16', 'x = 4'],
      steps: [
        'Apply quotient law: log₄(x/2) = 1',
        'Convert: x/2 = 4¹ = 4',
        'x = 8',
      ],
      hints: ['Combine the logs first: log₄(x/2) = 1', 'log_a(m) = n  means  m = aⁿ'],
      mistake: 'Writing x − 2 = 4: that treats log as a linear operation. You must combine the logs FIRST.',
      tip: 'IGCSE: log_a(m) = n ↔ m = aⁿ. Always convert form when solving log equations.',
    },
    {
      question: `Express as a single logarithm:\nlog 12 − log 4 + log 5`,
      correct: 'log 15',
      wrongs: ['log 13', 'log 60', 'log 3'],
      steps: [
        'log 12 − log 4 = log(12/4) = log 3',
        'log 3 + log 5 = log(3 × 5)',
        '= log 15',
      ],
      hints: ['Work left to right: subtract first, then add', 'log 12 − log 4 = log(12/4) = log 3'],
      mistake: 'Processing addition before subtraction: log(12 × 5) − log 4 = log 60 − log 4 = log 15 also works — just a different order. Both give log 15.',
      tip: 'CAPS: Any order of applying product/quotient laws gives the same result. Be systematic.',
    },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct,
    options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: c.hints, calculatorAllowed: false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── Fallback ──────────────────────────────────────────────────────────────────

function genFallback(): Problem {
  const a = randInt(2, 9), b = randInt(2, 9);
  const correct = `${a * b}`;
  return {
    id: uid(),
    question: `Calculate:\n${a} × ${b}`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${a * b + 1}`, `${a * b - 1}`, `${a + b}`]),
    marks: 1,
    workingSteps: [`${a} × ${b} = ${a * b}`],
    hints: [`Multiply the two numbers`],
    calculatorAllowed: false,
    commonMistake: `Adding instead of multiplying — ${a} + ${b} = ${a+b}, but ${a} × ${b} = ${a*b}.`,
    examTip: `Always re-read the operation sign before calculating.`,
  };
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

type LevelGenerator = () => Problem;
type TopicLevels = Record<number, LevelGenerator>;

const TOPIC_LEVELS: Record<string, TopicLevels> = {
  // ── Age 15 ────────────────────────────────────────────────────────────────
  'age15-numbers':    { 1: genSurds,            2: genIndices,           3: genQuadraticsFactor,  4: genSequences,       5: genLogs,           6: genStandardForm,       7: genEstimationRounding,  8: genLogQuotient },
  'age15-algebra':    { 1: genQuadraticFormula,  2: genSimultaneous,      3: genInequalities,      4: genAlgebraicFractions, 5: genCompletingSquare, 6: genSimultaneousLinQuad                                              },
  'age15-geometry':   { 1: genAnalyticalGeo,     2: genCircleGeometry,    3: genSimilarity,        4: genVectors,         5: genVolumeSA,           6: genSectorArc                                                        },
  'age15-trig':       { 1: genSOHCAHTOA,         2: genSineCosineRule,    3: genElevationDepression, 4: genBearings,      5: gen3DTrig,             6: genInverseTrig,        7: genTriangleAreaSinC                        },
  'age15-numeracy':   { 1: genPercentageRatio                                                                                                                                               },
  'age15-stats':      { 1: genAverages,           2: genBoxPlot,           3: genStats2                                                                                                                                     },
  'age15-prob':       { 1: genVennTree,           2: genCompoundInterest                                                                                                                                                    },
  'age15-functions':  { 1: genFunctionsDomain,   2: genFunctionsGraphs                                                                                                                                                      },
  'age15-matrices':   { 1: genTransformations,   2: genMatrices,          3: genInverseMatrix                                                                                                                               },
  // ── Age 16 ────────────────────────────────────────────────────────────────
  'age16-trig2':           { 1: genTrigIdentities,              2: genTrigEquations,             3: genRadians },
  'age16-calculus':        { 1: genDifferentiationFirstPrinciples, 2: genBasicDifferentiation    },
  'age16-exponential':     { 1: genExponentialFunctions                                          },
  'age16-algebra3':        { 1: genPolynomialDivision,          2: genLogsAdvanced               },
  'age16-functions2':      { 1: genFunctionTransformations,     2: genInverseFunctions16         },
  'age16-analytical-geo':  { 1: genEquationOfLine16,            2: genVectors2D                  },
  'age16-stats2':          { 1: genStandardDeviation,           2: genConditionalProbability     },
};

export function generateProblems(
  activityType: string,
  _difficulty: number,
  count = 5,
  level = 1,
): Problem[] {
  const levels = TOPIC_LEVELS[activityType];
  const gen: LevelGenerator = levels?.[level] ?? genFallback;
  return Array.from({ length: count }, gen);
}

export function generateMockExamProblems(count = 40): Problem[] {
  // Restrict to Age 15 topics only — Age 16 generators are harder and not yet unlocked
  const age15Keys = Object.keys(TOPIC_LEVELS).filter(k => k.startsWith('age15-'));
  const allGens: LevelGenerator[] = age15Keys.flatMap(k => Object.values(TOPIC_LEVELS[k]));
  const problems: Problem[] = [];
  for (let i = 0; i < count; i++) {
    problems.push(allGens[i % allGens.length]());
  }
  return shuffle(problems);
}

export function generateTopicTestProblems(activityType: string, count = 10): Problem[] {
  const levels = TOPIC_LEVELS[activityType];
  if (!levels) return Array.from({ length: count }, genFallback);
  const levelNums = Object.keys(levels).map(Number);
  const problems: Problem[] = [];
  for (let i = 0; i < count; i++) {
    const lvl = levelNums[i % levelNums.length];
    problems.push(levels[lvl]());
  }
  return shuffle(problems);
}

// Quick Revision: level-1 only, low difficulty — "test tomorrow, 20 minutes"
export function generateQuickRevisionProblems(topicId: string, count = 10): Problem[] {
  return generateProblems(topicId, 0.3, count, 1);
}

// Weak Spot: pulls from the student's mistake history, top-2 most-missed topics
export type MistakeInput = { topicId: string; level: number };

export function generateWeakSpotProblems(mistakes: MistakeInput[], count = 10): Problem[] {
  if (mistakes.length === 0) return generateMockExamProblems(count);
  // Count mistakes per topic
  const freq: Record<string, { count: number; level: number }> = {};
  for (const m of mistakes) {
    if (!freq[m.topicId]) freq[m.topicId] = { count: 0, level: m.level };
    freq[m.topicId].count++;
  }
  // Sort by frequency descending, take top 2
  const top2 = Object.entries(freq)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 2);
  const problems: Problem[] = [];
  const perTopic = Math.ceil(count / top2.length);
  for (const [topicId, { level }] of top2) {
    const lvl = Math.max(1, level);
    problems.push(...generateProblems(topicId, 0.5, perTopic, lvl));
  }
  return shuffle(problems).slice(0, count);
}
