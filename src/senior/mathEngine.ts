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

// ═══════════════════════════════════════════════════════════════════════════════
//  AGE 16 — SCHOOL OF SYSTEMS · added levels (A-Level AS / Cambridge 9709 / CAPS Gr 11)
// ═══════════════════════════════════════════════════════════════════════════════

// ── age16-trig2 L4 — Pythagorean Identity ────────────────────────────────────
function genPythagIdentity(): Problem {
  const triples: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];
  const [o, a, h] = triples[randInt(0, triples.length - 1)];
  const ask = randInt(0, 2);
  if (ask === 0) {
    const correct = `cos θ = ${a}/${h}`;
    return {
      id: uid(),
      question: `θ is acute and sin θ = ${o}/${h}.\n\nFind cos θ.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`cos θ = ${o}/${h}`, `cos θ = ${h}/${a}`, `cos θ = ${o}/${a}`]),
      marks: 3,
      workingSteps: [
        `sin²θ + cos²θ = 1`,
        `cos²θ = 1 − (${o}/${h})² = 1 − ${o * o}/${h * h} = ${a * a}/${h * h}`,
        `cos θ = ${a}/${h}  (positive, since θ is acute)`,
      ],
      hints: [`Use sin²θ + cos²θ = 1`, `${o}-${a}-${h} is a Pythagorean triple`],
      calculatorAllowed: false,
      commonMistake: `Copying sin: cos θ = ${o}/${h}. cos uses the adjacent side (${a}), giving ${a}/${h}.`,
      examTip: `Cambridge 9709: recognise ${o}-${a}-${h} triangles instantly — they avoid surd working in 'show that' questions.`,
    };
  } else if (ask === 1) {
    const correct = `tan θ = ${o}/${a}`;
    return {
      id: uid(),
      question: `θ is acute and sin θ = ${o}/${h}.\n\nFind tan θ.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`tan θ = ${o}/${h}`, `tan θ = ${a}/${o}`, `tan θ = ${h}/${a}`]),
      marks: 3,
      workingSteps: [
        `cos θ = ${a}/${h}  (from sin²θ + cos²θ = 1)`,
        `tan θ = sin θ / cos θ = (${o}/${h}) ÷ (${a}/${h})`,
        `tan θ = ${o}/${a}`,
      ],
      hints: [`tan θ = sin θ / cos θ`, `Find cos θ first using the triple ${o}-${a}-${h}`],
      calculatorAllowed: false,
      commonMistake: `Writing tan θ = ${o}/${h} — tan is opposite/adjacent = ${o}/${a}, not opposite/hypotenuse.`,
      examTip: `AS-level: with a triple you can read tan straight off as opp/adj = ${o}/${a}.`,
    };
  } else {
    const correct = `sin θ = ${o}/${h}`;
    return {
      id: uid(),
      question: `θ is acute and cos θ = ${a}/${h}.\n\nFind sin θ.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`sin θ = ${a}/${h}`, `sin θ = ${o}/${a}`, `sin θ = ${h}/${o}`]),
      marks: 3,
      workingSteps: [
        `sin²θ + cos²θ = 1`,
        `sin²θ = 1 − (${a}/${h})² = ${o * o}/${h * h}`,
        `sin θ = ${o}/${h}`,
      ],
      hints: [`sin²θ = 1 − cos²θ`, `${o}-${a}-${h} is a Pythagorean triple`],
      calculatorAllowed: false,
      commonMistake: `Copying cos: sin θ = ${a}/${h}. sin uses the opposite side (${o}).`,
      examTip: `9709: keep answers as exact fractions from the triple, not rounded decimals.`,
    };
  }
}

// ── age16-trig2 L5 — Double-Angle Identities ─────────────────────────────────
function genDoubleAngle(): Problem {
  const CASES = [
    { question: `Simplify:\n2 sin x cos x`, correct: 'sin 2x', wrongs: ['cos 2x', 'sin x', '2 sin x'],
      steps: ['Double-angle identity: sin 2x = 2 sin x cos x', 'Read it in reverse: 2 sin x cos x = sin 2x'],
      hints: ['Which double-angle formula contains 2 sin x cos x?'], mistake: 'Writing cos 2x — that comes from cos²x − sin²x, not 2 sin x cos x.',
      tip: '9709: learn the single form of sin 2x and the three forms of cos 2x.' },
    { question: `Simplify:\ncos²x − sin²x`, correct: 'cos 2x', wrongs: ['sin 2x', '1', '2 cos x'],
      steps: ['Double-angle identity: cos 2x = cos²x − sin²x'], hints: ['cos 2x has three equivalent forms — this is the first.'],
      mistake: 'Writing 1 — that would be cos²x + sin²x. The minus sign gives cos 2x.', tip: 'CAPS Gr 11: cos 2x = cos²x − sin²x = 1 − 2sin²x = 2cos²x − 1.' },
    { question: `Simplify:\n1 − 2 sin²x`, correct: 'cos 2x', wrongs: ['sin 2x', 'cos²x', '2 cos 2x'],
      steps: ['cos 2x = 1 − 2 sin²x  (Pythagorean form of the double angle)'], hints: ['One of the three forms of cos 2x.'],
      mistake: 'Leaving it as cos²x — use the identity 1 − 2sin²x = cos 2x.', tip: 'Pick the cos 2x form that matches the other terms in the equation.' },
    { question: `sin θ = 3/5 and cos θ = 4/5.\n\nFind sin 2θ.`, correct: '24/25', wrongs: ['12/25', '7/25', '6/5'],
      steps: ['sin 2θ = 2 sin θ cos θ', '= 2 × (3/5) × (4/5)', '= 24/25'], hints: ['sin 2θ = 2 sin θ cos θ'],
      mistake: 'Forgetting the factor of 2: (3/5)(4/5) = 12/25. The identity has a leading 2.', tip: '9709: substitute carefully and keep the answer as an exact fraction.' },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs),
    marks: 3, workingSteps: c.steps, hints: c.hints, calculatorAllowed: false, commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age16-calculus L3 — Equation of a Tangent ────────────────────────────────
function genTangentLine(): Problem {
  const b = randInt(1, 5), x0 = randInt(1, 4);
  const m = 2 * x0 + b;        // gradient of y = x² + bx at x = x0
  const y0 = x0 * x0 + b * x0; // point on the curve
  const correct = `y = ${m}x − ${x0 * x0}`;
  return {
    id: uid(),
    question: `Find the equation of the tangent to\ny = x² + ${b}x\nat the point where x = ${x0}.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`y = ${m}x`, `y = ${m}x + ${x0 * x0}`, `y = ${m + 1}x − ${x0 * x0}`]),
    marks: 4,
    workingSteps: [
      `dy/dx = 2x + ${b}`,
      `Gradient at x = ${x0}:  m = 2(${x0}) + ${b} = ${m}`,
      `Point on curve:  y = ${x0}² + ${b}(${x0}) = ${y0}`,
      `y − ${y0} = ${m}(x − ${x0})  →  ${correct}`,
    ],
    hints: [`Tangent gradient = dy/dx evaluated at x = ${x0}`, `Use y − y₁ = m(x − x₁) with the point of contact`],
    calculatorAllowed: false,
    commonMistake: `Stopping at y = ${m}x and forgetting the constant — substitute the point on the curve to find the intercept.`,
    examTip: `9709: a tangent needs BOTH the gradient and a point. It passes through the point of contact.`,
  };
}

// ── age16-calculus L4 — Stationary Points ────────────────────────────────────
function genStationaryPoint(): Problem {
  const a = randInt(1, 3);
  let k = randInt(-3, 3); if (k === 0) k = 2;   // chosen stationary x-coordinate
  const b = -2 * a * k;                          // so dy/dx = 2a x + b = 0 at x = k
  const cc = randInt(1, 8);
  const bStr = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
  const dStr = b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`;
  const correct = `x = ${k}`;
  return {
    id: uid(),
    question: `Find the x-coordinate of the stationary point of\ny = ${a}x² ${bStr} + ${cc}.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`x = ${-k}`, `x = ${b}`, `x = ${k + 1}`]),
    marks: 4,
    workingSteps: [
      `Stationary points occur where dy/dx = 0`,
      `dy/dx = ${2 * a}x ${dStr}`,
      `${2 * a}x ${dStr} = 0  →  x = ${-b}/${2 * a} = ${k}`,
    ],
    hints: [`Set dy/dx = 0 and solve for x`, `Differentiate first, then solve the equation`],
    calculatorAllowed: false,
    commonMistake: `Solving y = 0 instead of dy/dx = 0 — a stationary point is where the GRADIENT is zero.`,
    examTip: `9709: 'stationary' / 'turning point' always means dy/dx = 0. Differentiate, set to zero, solve.`,
  };
}

// ── age16-calculus L5 — Basic Integration ────────────────────────────────────
function genIntegration(): Problem {
  const n = randInt(1, 4);
  const m = n + 1;
  const rc = randInt(2, 4);   // result coefficient
  const a = rc * m;           // a/(n+1) = rc, an integer
  const correct = `${rc}x^${m} + c`;
  return {
    id: uid(),
    question: `Find  ∫ ${a}x^${n} dx`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${rc}x^${m}`, `${a}x^${m} + c`, `${rc}x^${n} + c`]),
    marks: 3,
    workingSteps: [
      `∫ axⁿ dx = a/(n+1) · x^(n+1) + c`,
      `= ${a}/${m} · x^${m} + c`,
      `= ${rc}x^${m} + c`,
    ],
    hints: [`Add 1 to the power, then divide by the new power`, `Never forget the constant of integration + c`],
    calculatorAllowed: false,
    commonMistake: `Dropping the "+ c", or not dividing by the new power ${m} — integration adds 1 to the power then divides by it.`,
    examTip: `9709: indefinite integrals ALWAYS need + c. Omitting it loses a mark.`,
  };
}

// ── age16-exponential L2 — Solving Exponential Equations ──────────────────────
function genSolveExponential(): Problem {
  const b = [2, 3, 5][randInt(0, 2)];
  const x = randInt(2, 4);
  const value = Math.pow(b, x);
  const correct = `x = ${x}`;
  return {
    id: uid(),
    question: `Solve for x:\n${b}^x = ${value}`,
    correctAnswer: correct,
    options: makeOptions(correct, [`x = ${x + 1}`, `x = ${x - 1}`, `x = ${value / b}`]),
    marks: 2,
    workingSteps: [
      `Write ${value} as a power of ${b}:  ${value} = ${b}^${x}`,
      `${b}^x = ${b}^${x}`,
      `Equal bases ⇒ equal exponents:  x = ${x}`,
    ],
    hints: [`Express the right-hand side as ${b} raised to a power`, `Equal bases ⇒ equate the exponents`],
    calculatorAllowed: false,
    commonMistake: `Dividing ${value} by ${b} to get x = ${value / b} — instead write ${value} as ${b}^x and compare exponents.`,
    examTip: `9709: same-base method — rewrite both sides with one base, then set the indices equal.`,
  };
}

// ── age16-exponential L3 — Exponential Models ────────────────────────────────
function genExpModel(): Problem {
  const CASES = [
    { question: `y = 5 × 2^x.\n\nState the y-intercept.`, correct: '5', wrongs: ['2', '10', '0'],
      steps: ['The y-intercept is y when x = 0', 'y = 5 × 2⁰ = 5 × 1 = 5'], hints: ['Substitute x = 0', 'Any non-zero base to the power 0 is 1'],
      mistake: 'Using the base 2 — at x = 0 the power 2⁰ = 1, so y = 5 × 1 = 5 (the coefficient).', tip: 'For y = a·bˣ the y-intercept is always a (the coefficient).' },
    { question: `y = 3 × (0.5)^x.\n\nIs this growth or decay?`, correct: 'Decay — base is between 0 and 1',
      wrongs: ['Growth — base is between 0 and 1', 'Growth — coefficient is positive', 'Decay — coefficient is positive'],
      steps: ['For y = a·bˣ:  b > 1 → growth,  0 < b < 1 → decay', 'Here b = 0.5, so 0 < b < 1 → decay'], hints: ['Look at the base b, not the coefficient a'],
      mistake: 'Judging by the coefficient 3 — growth vs decay depends on the BASE: 0.5 < 1 means decay.', tip: '9709: base > 1 grows, base < 1 decays. The coefficient only sets the starting value.' },
    { question: `A colony of 200 bacteria doubles every hour.\n\nWhich model gives the number after t hours?`, correct: 'N = 200 × 2^t',
      wrongs: ['N = 200 × t²', 'N = 200 + 2t', 'N = 200 × 0.5^t'],
      steps: ['Start value 200 → coefficient', '"Doubles" → base 2', 'N = 200 × 2^t'], hints: ['Doubling means ×2 each period → base 2'],
      mistake: 'Writing 200 × t² — exponential growth uses a constant base raised to t, not t squared.', tip: 'Constant multiple change each period ⇒ exponential model a·bᵗ.' },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs),
    marks: 2, workingSteps: c.steps, hints: c.hints, calculatorAllowed: false, commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age16-algebra3 L3 — Remainder Theorem ────────────────────────────────────
function genRemainderTheorem(): Problem {
  const a = randInt(1, 4), b = randInt(1, 6), cc = randInt(1, 6);
  const rem = a * a + b * a + cc;   // f(a) for f(x) = x² + bx + c
  const correct = `${rem}`;
  return {
    id: uid(),
    question: `Find the remainder when\nx² + ${b}x + ${cc}\nis divided by (x − ${a}).`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${a * a - b * a + cc}`, `${rem - a}`, `${rem + b}`]),
    marks: 3,
    workingSteps: [
      `Remainder theorem: remainder = f(${a})`,
      `f(${a}) = (${a})² + ${b}(${a}) + ${cc}`,
      `= ${a * a} + ${b * a} + ${cc} = ${rem}`,
    ],
    hints: [`Remainder theorem: dividing by (x − a) gives remainder f(a)`, `Substitute x = ${a}`],
    calculatorAllowed: false,
    commonMistake: `Substituting x = −${a} — for divisor (x − ${a}) the root is x = +${a}, so evaluate f(${a}).`,
    examTip: `9709: (x − a) ⇒ use +a; (x + a) ⇒ use −a. The remainder is f(that value).`,
  };
}

// ── age16-algebra3 L4 — Factor Theorem ───────────────────────────────────────
function genFactorTheorem(): Problem {
  let r = randInt(1, 5), s = randInt(1, 5);
  while (s === r) s = randInt(1, 5);
  const b = -(r + s), cc = r * s;   // f(x) = x² − (r+s)x + rs = (x−r)(x−s)
  const bStr = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
  const correct = `(x − ${r})`;
  return {
    id: uid(),
    question: `Which of these is a factor of\nx² ${bStr} + ${cc} ?`,
    correctAnswer: correct,
    options: makeOptions(correct, [`(x + ${r})`, `(x + ${s})`, `(x − ${r + s})`]),
    marks: 3,
    workingSteps: [
      `Factor theorem: (x − k) is a factor ⇔ f(k) = 0`,
      `f(${r}) = ${r}² − ${r + s}(${r}) + ${cc} = ${r * r} − ${(r + s) * r} + ${cc} = 0`,
      `So (x − ${r}) is a factor.  It factorises as (x − ${r})(x − ${s}).`,
    ],
    hints: [`Test each option: substitute its root and check f = 0`, `Both x = ${r} and x = ${s} give f = 0`],
    calculatorAllowed: false,
    commonMistake: `Choosing (x + ${r}) — that has root −${r}, and f(−${r}) ≠ 0. The factor (x − ${r}) has root +${r}.`,
    examTip: `9709: a factor (x − k) means f(k) = 0. Test the roots, not random numbers.`,
  };
}

// ── age16-algebra3 L5 — Binomial Expansion ───────────────────────────────────
function genBinomial(): Problem {
  const a = randInt(2, 4);
  const correct = `${3 * a}`;
  return {
    id: uid(),
    question: `Expand (x + ${a})³ and state the coefficient of x².`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${a}`, `${a * a * a}`, `${3 * a * a}`]),
    marks: 3,
    workingSteps: [
      `(x + a)³ = x³ + 3a·x² + 3a²·x + a³`,
      `Here a = ${a}`,
      `Coefficient of x² = 3a = 3 × ${a} = ${3 * a}`,
    ],
    hints: [`Use (x + a)³ = x³ + 3ax² + 3a²x + a³`, `The x² term has coefficient 3a`],
    calculatorAllowed: false,
    commonMistake: `Giving the x-term coefficient 3a² = ${3 * a * a} — the x² coefficient is 3a = ${3 * a}.`,
    examTip: `9709: Pascal's row for power 3 is 1, 3, 3, 1. Pair these with increasing powers of a.`,
  };
}

// ── age16-functions2 L3 — Composite Functions ────────────────────────────────
function genComposite(): Problem {
  const a = randInt(2, 4), b = randInt(1, 5), c = randInt(2, 4), d = randInt(1, 5), k = randInt(1, 4);
  const gk = c * k + d;
  const fgk = a * gk + b;
  const gfk = c * (a * k + b) + d;
  const correct = `${fgk}`;
  return {
    id: uid(),
    question: `f(x) = ${a}x + ${b},   g(x) = ${c}x + ${d}\n\nFind fg(${k}).`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${gfk}`, `${a * c * k + b + d}`, `${(a * k + b) + (c * k + d)}`]),
    marks: 3,
    workingSteps: [
      `fg(x) means apply g first, then f`,
      `g(${k}) = ${c}(${k}) + ${d} = ${gk}`,
      `f(${gk}) = ${a}(${gk}) + ${b} = ${fgk}`,
    ],
    hints: [`fg(x) = f(g(x)) — the inner function g acts first`, `Work from the inside out`],
    calculatorAllowed: false,
    commonMistake: `Doing f first then g (that gives gf(${k}) = ${gfk}). fg means g first, then f.`,
    examTip: `9709: fg(x) = f(g(x)). The function nearest x acts first.`,
  };
}

// ── age16-functions2 L4 — Solve for the Input ────────────────────────────────
function genSolveForInput(): Problem {
  const a = randInt(2, 5), b = randInt(1, 6), xv = randInt(2, 6);
  const value = a * xv + b;
  const correct = `x = ${xv}`;
  return {
    id: uid(),
    question: `f(x) = ${a}x + ${b}.\n\nGiven f(x) = ${value}, find x.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`x = ${value - b}`, `x = ${xv + 1}`, `x = ${value}`]),
    marks: 3,
    workingSteps: [
      `${a}x + ${b} = ${value}`,
      `${a}x = ${value} − ${b} = ${value - b}`,
      `x = ${value - b} ÷ ${a} = ${xv}`,
    ],
    hints: [`Set the rule equal to ${value} and solve`, `Subtract ${b}, then divide by ${a}`],
    calculatorAllowed: false,
    commonMistake: `Stopping at ${a}x = ${value - b} and forgetting to divide by ${a}.`,
    examTip: `9709: 'find x given f(x)' = solve the equation; it is the inverse process.`,
  };
}

// ── age16-analytical-geo L3 — Perpendicular Gradients ────────────────────────
function genPerpendicular(): Problem {
  const CASES = [
    { m: '2', perp: '−1/2', wrongs: ['1/2', '2', '−2'] },
    { m: '3', perp: '−1/3', wrongs: ['1/3', '3', '−3'] },
    { m: '4', perp: '−1/4', wrongs: ['1/4', '4', '−4'] },
    { m: '−1/2', perp: '2', wrongs: ['−2', '1/2', '−1/2'] },
    { m: '−1/3', perp: '3', wrongs: ['−3', '1/3', '−1/3'] },
    { m: '1/2', perp: '−2', wrongs: ['2', '1/2', '−1/2'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  const correct = `gradient = ${c.perp}`;
  return {
    id: uid(),
    question: `A line has gradient ${c.m}.\n\nFind the gradient of a line perpendicular to it.`,
    correctAnswer: correct,
    options: makeOptions(correct, c.wrongs.map(w => `gradient = ${w}`)),
    marks: 2,
    workingSteps: [
      `Perpendicular gradients multiply to −1:  m₁ × m₂ = −1`,
      `m₂ = −1 ÷ (${c.m})`,
      `gradient = ${c.perp}`,
    ],
    hints: [`Perpendicular ⇒ negative reciprocal`, `Flip the fraction AND change the sign`],
    calculatorAllowed: false,
    commonMistake: `Only flipping or only negating — you must do both: the negative reciprocal of ${c.m} is ${c.perp}.`,
    examTip: `9709: parallel ⇒ equal gradients; perpendicular ⇒ negative reciprocal (m₁m₂ = −1).`,
  };
}

// ── age16-analytical-geo L4 — Equation of a Circle ───────────────────────────
function genCircleEquation(): Problem {
  const a = randInt(-4, 4) || 1, b = randInt(-4, 4) || 1, r = randInt(2, 6);
  const ax = a >= 0 ? `− ${a}` : `+ ${-a}`;
  const by = b >= 0 ? `− ${b}` : `+ ${-b}`;
  const eqn = `(x ${ax})² + (y ${by})² = ${r * r}`;
  if (randInt(0, 1) === 0) {
    const correct = `(${a}, ${b})`;
    return {
      id: uid(),
      question: `A circle has equation\n${eqn}\n\nState the coordinates of its centre.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`(${-a}, ${-b})`, `(${b}, ${a})`, `(${-a}, ${b})`]),
      marks: 2,
      workingSteps: [`Compare with (x − h)² + (y − k)² = r²`, `Centre is (h, k) = (${a}, ${b})`],
      hints: [`Centre (h, k) comes from (x − h)² + (y − k)²`, `Signs flip: (x − ${a}) ⇒ h = ${a}`],
      calculatorAllowed: false,
      commonMistake: `Flipping to (${-a}, ${-b}) — the centre takes the opposite sign of what's inside: (x − ${a}) gives +${a}.`,
      examTip: `9709: in (x − h)² + (y − k)² = r², the centre is (h, k) and the radius is √(r²).`,
    };
  } else {
    const correct = `${r}`;
    return {
      id: uid(),
      question: `A circle has equation\n${eqn}\n\nState its radius.`,
      correctAnswer: correct,
      options: makeOptions(correct, [`${r * r}`, `${2 * r}`, `${r + 1}`]),
      marks: 2,
      workingSteps: [`Compare with (x − h)² + (y − k)² = r²`, `r² = ${r * r}`, `r = √${r * r} = ${r}`],
      hints: [`The right-hand side equals r², not r`, `Take the square root of ${r * r}`],
      calculatorAllowed: false,
      commonMistake: `Giving ${r * r} as the radius — the RHS is r², so the radius is √${r * r} = ${r}.`,
      examTip: `9709: remember to square-root the right-hand side to get the radius.`,
    };
  }
}

// ── age16-stats2 L3 — Variance ───────────────────────────────────────────────
function genVariance(): Problem {
  const CASES = [
    { data: '1, 2, 3, 4, 5', mean: 3, variance: '2', wrongs: ['3', '2.5', '4'] },
    { data: '2, 5, 8', mean: 5, variance: '6', wrongs: ['5', '3', '8'] },
    { data: '2, 4, 6, 8, 10', mean: 6, variance: '8', wrongs: ['6', '4', '10'] },
    { data: '10, 20, 30, 40, 50', mean: 30, variance: '200', wrongs: ['30', '100', '20'] },
    { data: '4, 4, 4, 4', mean: 4, variance: '0', wrongs: ['4', '1', '2'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(),
    question: `Find the variance of the data set:\n${c.data}`,
    correctAnswer: `${c.variance}`,
    options: makeOptions(`${c.variance}`, c.wrongs),
    marks: 4,
    workingSteps: [
      `Mean  x̄ = ${c.mean}`,
      `Variance = Σ(x − x̄)² / n`,
      `Average the squared deviations from the mean = ${c.variance}`,
    ],
    hints: [`Variance = mean of the squared deviations`, `Find the mean first, then average each (x − mean)²`],
    calculatorAllowed: false,
    commonMistake: `Reporting the mean (${c.mean}) instead of the variance — variance measures spread, not the average.`,
    examTip: `9709/CAPS: variance = Σ(x − x̄)²/n;  standard deviation = √variance.`,
  };
}

// ── age16-stats2 L4 — Expected Value ─────────────────────────────────────────
function genExpectedValue(): Problem {
  const CASES = [
    { question: `A discrete random variable X:\nX:    1     2     3\nP(X): 0.2   0.5   0.3\n\nFind E(X).`, correct: '2.1', wrongs: ['2', '1.8', '3'],
      steps: ['E(X) = Σ x·P(x)', '= 1(0.2) + 2(0.5) + 3(0.3)', '= 0.2 + 1.0 + 0.9 = 2.1'] },
    { question: `X:    0     1     2\nP(X): 0.5   0.3   0.2\n\nFind E(X).`, correct: '0.7', wrongs: ['1', '0.5', '1.5'],
      steps: ['E(X) = Σ x·P(x)', '= 0(0.5) + 1(0.3) + 2(0.2)', '= 0 + 0.3 + 0.4 = 0.7'] },
    { question: `A fair six-sided die is rolled.\n\nFind E(X), the expected score.`, correct: '3.5', wrongs: ['3', '4', '6'],
      steps: ['E(X) = Σ x·P(x), each P = 1/6', '= (1 + 2 + 3 + 4 + 5 + 6)/6', '= 21/6 = 3.5'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.question, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs),
    marks: 4, workingSteps: c.steps, hints: ['E(X) = Σ x · P(x)', 'Multiply each value by its probability, then add'],
    calculatorAllowed: false, commonMistake: 'Averaging the x-values without weighting — multiply each x by its P(x) first.',
    examTip: '9709: E(X) = Σ x·P(x). Check the probabilities sum to 1 before starting.',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  AGE 17 — SCHOOL OF THINKERS · A-Level Pure Mathematics (Cambridge 9709 / CAPS Gr 12)
// ═══════════════════════════════════════════════════════════════════════════════

// ── age17-diff L1 — Chain Rule ───────────────────────────────────────────────
function genChainRule(): Problem {
  const a = randInt(2, 4), b = randInt(1, 5), n = randInt(2, 4);
  const correct = `${a * n}(${a}x + ${b})^${n - 1}`;
  return {
    id: uid(),
    question: `Differentiate using the chain rule:\ny = (${a}x + ${b})^${n}`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `${a * n}(${a}x + ${b})^${n}`,
      `${n}(${a}x + ${b})^${n - 1}`,
      `${a}(${a}x + ${b})^${n - 1}`,
    ]),
    marks: 3,
    workingSteps: [
      `Chain rule: bring the power down, reduce it by 1, multiply by the derivative of the inside`,
      `d/dx(${a}x + ${b}) = ${a}`,
      `dy/dx = ${n}(${a}x + ${b})^${n - 1} × ${a} = ${a * n}(${a}x + ${b})^${n - 1}`,
    ],
    hints: [`Chain rule: (f(x))ⁿ → n(f(x))ⁿ⁻¹ · f'(x)`, `The inside is ${a}x + ${b}; its derivative is ${a}`],
    calculatorAllowed: false,
    commonMistake: `Forgetting to multiply by the inside derivative ${a} — ${n}(${a}x+${b})^${n - 1} misses the ×${a}.`,
    examTip: `9709 P1: the chain rule's final ×(inside derivative) is the most-forgotten step.`,
  };
}

// ── age17-diff L2 — Product Rule ─────────────────────────────────────────────
function genProductRule(): Problem {
  const p = randInt(2, 4), q = randInt(1, 5), r = randInt(1, 5);
  const correct = `${2 * p}x + ${p * r + q}`;
  return {
    id: uid(),
    question: `Differentiate:\ny = (${p}x + ${q})(x + ${r})`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `${p}x + ${p * r + q}`,
      `${2 * p}x + ${q}`,
      `${2 * p}x + ${p * r + q + 1}`,
    ]),
    marks: 4,
    workingSteps: [
      `Product rule: (uv)' = u'v + uv'`,
      `u = ${p}x + ${q} (u' = ${p}),   v = x + ${r} (v' = 1)`,
      `= ${p}(x + ${r}) + (${p}x + ${q})(1) = ${2 * p}x + ${p * r + q}`,
    ],
    hints: [`(uv)' = u'v + uv'`, `Differentiate each bracket, keep the other`],
    calculatorAllowed: false,
    commonMistake: `Multiplying the two derivatives together — that is not the product rule. Use u'v + uv'.`,
    examTip: `9709: you may expand first then differentiate as a check — both give ${correct}.`,
  };
}

// ── age17-diff L3 — Second Derivative ────────────────────────────────────────
function genSecondDerivative(): Problem {
  const a = randInt(1, 3), b = randInt(1, 5);
  const correct = `${6 * a}x + ${2 * b}`;
  return {
    id: uid(),
    question: `Given y = ${a}x³ + ${b}x², find d²y/dx².`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `${3 * a}x² + ${2 * b}x`,
      `${6 * a}x`,
      `${6 * a}x + ${b}`,
    ]),
    marks: 3,
    workingSteps: [
      `First derivative:  dy/dx = ${3 * a}x² + ${2 * b}x`,
      `Differentiate again:  d²y/dx² = ${6 * a}x + ${2 * b}`,
    ],
    hints: [`Differentiate twice`, `d²y/dx² is the derivative of dy/dx`],
    calculatorAllowed: false,
    commonMistake: `Stopping at the first derivative — the question asks for the SECOND derivative.`,
    examTip: `9709: d²y/dx² drives the max/min test. Differentiate dy/dx once more.`,
  };
}

// ── age17-diff L4 — Nature of Stationary Points ──────────────────────────────
function genStationaryNature(): Problem {
  const CASES = [
    { q: `y = x² − 4x + 1 has a stationary point.\n\nIs it a maximum or a minimum?`, correct: 'Minimum  (d²y/dx² = 2 > 0)',
      wrongs: ['Maximum  (d²y/dx² = 2 > 0)', 'Point of inflection', 'Maximum  (coefficient of x² is positive)'],
      steps: ['dy/dx = 2x − 4', 'd²y/dx² = 2', '2 > 0 ⇒ concave up ⇒ minimum'] },
    { q: `y = −x² + 6x.\n\nIs the stationary point a maximum or minimum?`, correct: 'Maximum  (d²y/dx² = −2 < 0)',
      wrongs: ['Minimum  (d²y/dx² = −2 < 0)', 'Minimum  (coefficient is negative)', 'Point of inflection'],
      steps: ['dy/dx = −2x + 6', 'd²y/dx² = −2', '−2 < 0 ⇒ concave down ⇒ maximum'] },
    { q: `y = 2x² + 3.\n\nMaximum or minimum stationary point?`, correct: 'Minimum  (d²y/dx² = 4 > 0)',
      wrongs: ['Maximum  (d²y/dx² = 4 > 0)', 'Maximum', 'Point of inflection'],
      steps: ['dy/dx = 4x', 'd²y/dx² = 4 > 0 ⇒ minimum'] },
    { q: `y = 5 − x².\n\nMaximum or minimum stationary point?`, correct: 'Maximum  (d²y/dx² = −2 < 0)',
      wrongs: ['Minimum  (d²y/dx² = −2 < 0)', 'Minimum', 'Point of inflection'],
      steps: ['dy/dx = −2x', 'd²y/dx² = −2 < 0 ⇒ maximum'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: ['Find d²y/dx² and check its sign', 'd²y/dx² > 0 ⇒ minimum;  < 0 ⇒ maximum'],
    calculatorAllowed: false, commonMistake: 'Reading the sign backwards — a POSITIVE second derivative means a MINIMUM (concave up).',
    examTip: '9709: second-derivative test — positive ⇒ min, negative ⇒ max.',
  };
}

// ── age17-diff L5 — Minimum Value ────────────────────────────────────────────
function genMinValue(): Problem {
  const k = randInt(1, 4);
  const b = 2 * k;              // y = x² + bx + c, stationary at x = −k
  const cc = randInt(1, 9);
  const minVal = cc - k * k;    // c − (b/2)²
  const correct = `${minVal}`;
  return {
    id: uid(),
    question: `Find the minimum value of\ny = x² + ${b}x + ${cc}.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${cc}`, `${minVal + 2}`, `${-k}`]),
    marks: 4,
    workingSteps: [
      `dy/dx = 2x + ${b} = 0  ⇒  x = ${-k}`,
      `Minimum value = y at x = ${-k}:`,
      `(${-k})² + ${b}(${-k}) + ${cc} = ${k * k} − ${b * k} + ${cc} = ${minVal}`,
    ],
    hints: [`Find the stationary x first (dy/dx = 0)`, `Substitute it back into y`],
    calculatorAllowed: false,
    commonMistake: `Giving the x-coordinate (${-k}) instead of the y-value — the minimum VALUE is y at that point.`,
    examTip: `9709: 'minimum value' = the y-coordinate of the turning point, not x.`,
  };
}

// ── age17-int L1 — Definite Integral ─────────────────────────────────────────
function genDefiniteIntegral(): Problem {
  const b = randInt(3, 5);
  const val = b * b - 1;        // ∫₁^b 2x dx = [x²]₁^b = b²−1
  const correct = `${val}`;
  return {
    id: uid(),
    question: `Evaluate:\n∫₁^${b} 2x dx`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${b * b}`, `${b * b + 1}`, `${2 * b - 2}`]),
    marks: 3,
    workingSteps: [
      `∫ 2x dx = x²`,
      `[x²]₁^${b} = ${b}² − 1²`,
      `= ${b * b} − 1 = ${val}`,
    ],
    hints: [`Integrate 2x to get x²`, `Evaluate at the top limit minus the bottom limit`],
    calculatorAllowed: false,
    commonMistake: `Forgetting the lower limit — subtract the value at x = 1 (which is 1).`,
    examTip: `9709: definite integral = F(top) − F(bottom). No "+ c".`,
  };
}

// ── age17-int L2 — Area Under a Curve ────────────────────────────────────────
function genAreaUnderCurve(): Problem {
  const CASES = [
    { q: `Find the area under y = x² between x = 0 and x = 3.`, correct: '9', wrongs: ['27', '3', '6'], steps: ['∫₀³ x² dx = [x³/3]₀³', '= 27/3 − 0 = 9'] },
    { q: `Find the area under y = x² between x = 0 and x = 6.`, correct: '72', wrongs: ['36', '216', '18'], steps: ['[x³/3]₀⁶ = 216/3 = 72'] },
    { q: `Find the area under y = 3x² between x = 0 and x = 2.`, correct: '8', wrongs: ['12', '24', '4'], steps: ['∫₀² 3x² dx = [x³]₀² = 8 − 0 = 8'] },
    { q: `Find the area under y = x³ between x = 0 and x = 2.`, correct: '4', wrongs: ['8', '2', '16'], steps: ['∫₀² x³ dx = [x⁴/4]₀² = 16/4 = 4'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: ['Area = definite integral between the limits', 'Integrate, then evaluate top − bottom'],
    calculatorAllowed: false, commonMistake: 'Forgetting to divide by the new power (∫x² = x³/3, not x³).',
    examTip: '9709: area under a curve = ∫ y dx between the x-limits.',
  };
}

// ── age17-int L3 — Integrating (ax+b)ⁿ ───────────────────────────────────────
function genIntegrateChain(): Problem {
  const a = randInt(1, 3), b = randInt(1, 5), n = randInt(2, 3);
  const denom = a * (n + 1);
  const correct = `(${a}x + ${b})^${n + 1} / ${denom} + c`;
  return {
    id: uid(),
    question: `Find  ∫ (${a}x + ${b})^${n} dx`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `(${a}x + ${b})^${n + 1} + c`,
      `(${a}x + ${b})^${n + 1} / ${n + 1} + c`,
      `${a}(${a}x + ${b})^${n + 1} + c`,
    ]),
    marks: 3,
    workingSteps: [
      `Reverse chain rule: raise the power by 1, divide by (new power × coefficient of x)`,
      `New power = ${n + 1}, coefficient of x = ${a}`,
      `= (${a}x + ${b})^${n + 1} / (${a} × ${n + 1}) + c = (${a}x + ${b})^${n + 1}/${denom} + c`,
    ],
    hints: [`Raise the power by 1`, `Divide by (new power) × (coefficient of x = ${a})`],
    calculatorAllowed: false,
    commonMistake: `Dividing only by the new power and forgetting the ÷${a} (coefficient of x).`,
    examTip: `9709: ∫(ax+b)ⁿ dx = (ax+b)ⁿ⁺¹ / (a(n+1)) + c.`,
  };
}

// ── age17-int L4 — Integrating a Polynomial ──────────────────────────────────
function genIntegratePoly(): Problem {
  const p = randInt(1, 3), q = randInt(1, 4);
  const correct = `${p}x³ + ${q}x² + c`;
  return {
    id: uid(),
    question: `Find  ∫ (${3 * p}x² + ${2 * q}x) dx`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `${p}x³ + ${q}x²`,
      `${3 * p}x³ + ${2 * q}x² + c`,
      `${6 * p}x + ${2 * q} + c`,
    ]),
    marks: 3,
    workingSteps: [
      `∫ ${3 * p}x² dx = ${p}x³`,
      `∫ ${2 * q}x dx = ${q}x²`,
      `Add the constant: ${p}x³ + ${q}x² + c`,
    ],
    hints: [`Integrate each term: add 1 to the power, divide by it`, `Add + c`],
    calculatorAllowed: false,
    commonMistake: `Forgetting + c, or not dividing by the new power (∫${3 * p}x² = ${p}x³).`,
    examTip: `9709: indefinite integral ⇒ always + c.`,
  };
}

// ── age17-int L5 — Evaluating a Definite Integral ────────────────────────────
function genDefiniteEval(): Problem {
  const CASES = [
    { q: `Evaluate:\n∫₀¹ (3x² + 2x) dx`, correct: '2', wrongs: ['1', '3', '5'], steps: ['[x³ + x²]₀¹', '= (1 + 1) − 0 = 2'] },
    { q: `Evaluate:\n∫₀² 3x² dx`, correct: '8', wrongs: ['12', '4', '6'], steps: ['∫ 3x² dx = x³', '[x³]₀² = 8 − 0 = 8'] },
    { q: `Evaluate:\n∫₁² (3x² + 2x) dx`, correct: '10', wrongs: ['12', '8', '6'], steps: ['[x³ + x²]₁²', '= (8 + 4) − (1 + 1) = 10'] },
    { q: `Evaluate:\n∫₀² (2x + 1) dx`, correct: '6', wrongs: ['4', '5', '8'], steps: ['[x² + x]₀²', '= (4 + 2) − 0 = 6'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: ['Integrate, then substitute the limits (top − bottom)', 'No + c for definite integrals'],
    calculatorAllowed: false, commonMistake: 'Forgetting to subtract the value at the lower limit.',
    examTip: '9709: definite integral = F(top) − F(bottom).',
  };
}

// ── age17-series L1 — Arithmetic Series Sum ──────────────────────────────────
function genArithSum(): Problem {
  const a = randInt(1, 6), d = randInt(1, 5), n = randInt(4, 8);
  const Sn = n * (2 * a + (n - 1) * d) / 2;
  const Tn = a + (n - 1) * d;
  const correct = `${Sn}`;
  return {
    id: uid(),
    question: `An arithmetic series has first term a = ${a} and common difference d = ${d}.\n\nFind the sum of the first ${n} terms, S${n}.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${Tn}`, `${Sn + d}`, `${Sn - a}`]),
    marks: 4,
    workingSteps: [
      `Sₙ = n/2 [2a + (n−1)d]`,
      `S${n} = ${n}/2 [2(${a}) + ${n - 1}(${d})]`,
      `= ${n}/2 × ${2 * a + (n - 1) * d} = ${Sn}`,
    ],
    hints: [`Sₙ = n/2 [2a + (n−1)d]`, `Substitute a = ${a}, d = ${d}, n = ${n}`],
    calculatorAllowed: false,
    commonMistake: `Finding the nth TERM (${Tn}) instead of the SUM — use the Sₙ formula.`,
    examTip: `9709/CAPS: don't confuse Tₙ (one term) with Sₙ (running total).`,
  };
}

// ── age17-series L2 — Geometric Series Sum ───────────────────────────────────
function genGeoSum(): Problem {
  const a = randInt(1, 3), r = [2, 3][randInt(0, 1)], n = randInt(3, 5);
  const Sn = a * (Math.pow(r, n) - 1) / (r - 1);
  const Tn = a * Math.pow(r, n - 1);
  const correct = `${Sn}`;
  return {
    id: uid(),
    question: `A geometric series has first term a = ${a} and common ratio r = ${r}.\n\nFind the sum of the first ${n} terms, S${n}.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${Tn}`, `${Sn + r}`, `${a * Math.pow(r, n)}`]),
    marks: 4,
    workingSteps: [
      `Sₙ = a(rⁿ − 1)/(r − 1)`,
      `S${n} = ${a}(${r}^${n} − 1)/(${r} − 1)`,
      `= ${a}(${Math.pow(r, n)} − 1)/${r - 1} = ${Sn}`,
    ],
    hints: [`Sₙ = a(rⁿ − 1)/(r − 1)`, `${r}^${n} = ${Math.pow(r, n)}`],
    calculatorAllowed: false,
    commonMistake: `Using the nth-term formula (${Tn}) instead of the series-sum formula.`,
    examTip: `9709: geometric sum Sₙ = a(rⁿ−1)/(r−1) for r > 1.`,
  };
}

// ── age17-series L3 — Sum to Infinity ────────────────────────────────────────
function genSumInfinity(): Problem {
  const CASES = [
    { a: 5, r: '1/2', S: '10', wrongs: ['5', '2.5', '20'] },
    { a: 2, r: '1/2', S: '4', wrongs: ['2', '1', '8'] },
    { a: 4, r: '3/4', S: '16', wrongs: ['4', '8', '12'] },
    { a: 6, r: '2/3', S: '18', wrongs: ['6', '9', '12'] },
    { a: 3, r: '1/4', S: '4', wrongs: ['3', '12', '6'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(),
    question: `A geometric series has a = ${c.a} and r = ${c.r}.\n\nFind the sum to infinity, S∞.`,
    correctAnswer: c.S,
    options: makeOptions(c.S, c.wrongs),
    marks: 3,
    workingSteps: [
      `S∞ = a / (1 − r)   (valid since |r| < 1)`,
      `= ${c.a} / (1 − ${c.r})`,
      `= ${c.S}`,
    ],
    hints: [`S∞ = a / (1 − r)`, `Only valid when |r| < 1`],
    calculatorAllowed: false,
    commonMistake: `Using a/(1+r), or applying the formula when |r| ≥ 1 (then no sum to infinity exists).`,
    examTip: `9709: sum to infinity exists only for |r| < 1, and equals a/(1−r).`,
  };
}

// ── age17-series L4 — Which Term? ────────────────────────────────────────────
function genFindTermNumber(): Problem {
  const a = randInt(1, 5), d = randInt(2, 4), n = randInt(5, 10);
  const val = a + (n - 1) * d;
  const correct = `n = ${n}`;
  return {
    id: uid(),
    question: `In the arithmetic sequence with a = ${a}, d = ${d}, which term equals ${val}?`,
    correctAnswer: correct,
    options: makeOptions(correct, [`n = ${n + 1}`, `n = ${n - 1}`, `n = ${val}`]),
    marks: 3,
    workingSteps: [
      `Tₙ = a + (n−1)d = ${val}`,
      `${a} + (n−1)(${d}) = ${val}`,
      `(n−1) = ${val - a}/${d} = ${n - 1}  ⇒  n = ${n}`,
    ],
    hints: [`Set a + (n−1)d = ${val} and solve for n`, `Subtract a, divide by d, then add 1`],
    calculatorAllowed: false,
    commonMistake: `Forgetting the "+1": (n−1) = ${n - 1}, so n = ${n}, not ${n - 1}.`,
    examTip: `9709: solving Tₙ = value gives the term NUMBER n.`,
  };
}

// ── age17-series L5 — Sigma Notation ─────────────────────────────────────────
function genSigma(): Problem {
  const CASES = [
    { q: `Evaluate:\nΣ (r = 1 to 4) 2r`, correct: '20', wrongs: ['16', '24', '10'], steps: ['= 2 + 4 + 6 + 8 = 20'] },
    { q: `Evaluate:\nΣ (r = 1 to 5) (r + 1)`, correct: '20', wrongs: ['15', '25', '21'], steps: ['= 2 + 3 + 4 + 5 + 6 = 20'] },
    { q: `Evaluate:\nΣ (r = 1 to 3) r²`, correct: '14', wrongs: ['9', '36', '6'], steps: ['= 1 + 4 + 9 = 14'] },
    { q: `Evaluate:\nΣ (r = 1 to 4) (3r − 1)`, correct: '26', wrongs: ['24', '30', '20'], steps: ['= 2 + 5 + 8 + 11 = 26'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: ['Substitute r = 1, 2, 3, … into the expression and add', 'The numbers on Σ are the limits'],
    calculatorAllowed: false, commonMistake: 'Stopping one term early, or starting at r = 0 — read the limits carefully.',
    examTip: '9709: Σ means add the expression for every integer r between the limits.',
  };
}

// ── age17-trig3 L1 — Solving Trig Equations ──────────────────────────────────
function genSolveTrig17(): Problem {
  const CASES = [
    { q: `Solve  sin x = 0.5  for  0° ≤ x ≤ 180°.`, correct: 'x = 30° or x = 150°', wrongs: ['x = 30°', 'x = 30° or x = 330°', 'x = 60° or x = 120°'], steps: ['sin 30° = 0.5 (first solution)', 'Second: 180° − 30° = 150°'] },
    { q: `Solve  cos x = 0.5  for  0° ≤ x ≤ 360°.`, correct: 'x = 60° or x = 300°', wrongs: ['x = 60° or x = 120°', 'x = 60°', 'x = 30° or x = 330°'], steps: ['cos 60° = 0.5', 'Second: 360° − 60° = 300°'] },
    { q: `Solve  tan x = 1  for  0° ≤ x ≤ 360°.`, correct: 'x = 45° or x = 225°', wrongs: ['x = 45°', 'x = 45° or x = 315°', 'x = 135° or x = 315°'], steps: ['tan 45° = 1', 'tan repeats every 180°: 45° + 180° = 225°'] },
    { q: `Solve  sin x = 1  for  0° ≤ x ≤ 360°.`, correct: 'x = 90°', wrongs: ['x = 90° or x = 270°', 'x = 0°', 'x = 180°'], steps: ['sin x = 1 only at x = 90° in this range'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 4,
    workingSteps: c.steps, hints: ['Find the first solution, then use the symmetry of the graph', 'sin: 180°−x;  cos: 360°−x;  tan: +180°'],
    calculatorAllowed: false, commonMistake: 'Giving only the first solution — check the whole range for others.',
    examTip: '9709: scan the FULL interval. Use the CAST diagram or graph for extra solutions.',
  };
}

// ── age17-trig3 L2 — Compound & Reduction ────────────────────────────────────
function genCompoundAngle(): Problem {
  const CASES = [
    { q: `Expand:  sin(A + B)`, correct: 'sin A cos B + cos A sin B', wrongs: ['sin A cos B − cos A sin B', 'sin A sin B + cos A cos B', 'cos A cos B − sin A sin B'], steps: ['sin(A+B) = sin A cos B + cos A sin B'] },
    { q: `Expand:  cos(A + B)`, correct: 'cos A cos B − sin A sin B', wrongs: ['cos A cos B + sin A sin B', 'sin A cos B + cos A sin B', 'cos A sin B − sin A cos B'], steps: ['cos(A+B) = cos A cos B − sin A sin B'] },
    { q: `Simplify:  sin(90° − x)`, correct: 'cos x', wrongs: ['sin x', '−cos x', '−sin x'], steps: ['sin(90° − x) = cos x  (co-function identity)'] },
    { q: `Simplify:  cos(180° − x)`, correct: '−cos x', wrongs: ['cos x', '−sin x', 'sin x'], steps: ['cos(180° − x) = −cos x'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: ['Recall the compound-angle and reduction formulae', 'Watch the signs carefully'],
    calculatorAllowed: false, commonMistake: 'Sign slip in cos(A+B) — it is MINUS sin A sin B.',
    examTip: '9709: the compound-angle formulae are in the formula list, but the signs trip people up.',
  };
}

// ── age17-trig3 L3 — Exact Values in Radians ─────────────────────────────────
function genExactRadian(): Problem {
  const CASES = [
    { q: `Find the exact value:  sin(π/6)`, correct: '1/2', wrongs: ['√3/2', '√2/2', '1'] },
    { q: `Find the exact value:  cos(π/3)`, correct: '1/2', wrongs: ['√3/2', '√2/2', '0'] },
    { q: `Find the exact value:  tan(π/4)`, correct: '1', wrongs: ['√3', '√3/3', '0'] },
    { q: `Find the exact value:  sin(π/2)`, correct: '1', wrongs: ['0', '1/2', '√3/2'] },
    { q: `Find the exact value:  cos(π)`, correct: '−1', wrongs: ['0', '1', '−1/2'] },
    { q: `Find the exact value:  cos(π/6)`, correct: '√3/2', wrongs: ['1/2', '√2/2', '1'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 2,
    workingSteps: ['Convert the radian angle to degrees if it helps (π = 180°)', 'Read the exact value from the 30-45-60 triangle'],
    hints: ['π/6 = 30°, π/4 = 45°, π/3 = 60°', 'Use the special triangles'],
    calculatorAllowed: false, commonMistake: 'Swapping sin and cos for 30°/60° — sin 30° = cos 60° = 1/2.',
    examTip: '9709: memorise exact values in BOTH degrees and radians.',
  };
}

// ── age17-trig3 L4 — Simplifying with Identities ─────────────────────────────
function genTrigSimplify(): Problem {
  const CASES = [
    { q: `Simplify:  1 − cos²x`, correct: 'sin²x', wrongs: ['cos²x', 'sin x', '−sin²x'], steps: ['sin²x + cos²x = 1', '⇒ 1 − cos²x = sin²x'] },
    { q: `Simplify:  sin x / cos x`, correct: 'tan x', wrongs: ['cot x', '1', 'sin x cos x'], steps: ['tan x = sin x / cos x by definition'] },
    { q: `Simplify:  tan x · cos x`, correct: 'sin x', wrongs: ['cos x', '1', 'tan x'], steps: ['tan x = sin x/cos x', '(sin x/cos x) · cos x = sin x'] },
    { q: `Simplify:  2 sin²x + 2 cos²x`, correct: '2', wrongs: ['1', '2 sin x', '0'], steps: ['sin²x + cos²x = 1', '2(sin²x + cos²x) = 2'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: ['Use sin²x + cos²x = 1', 'And tan x = sin x / cos x'],
    calculatorAllowed: false, commonMistake: 'Forgetting the Pythagorean identity sin²x + cos²x = 1.',
    examTip: '9709: the identity sin²x + cos²x = 1 underlies most simplifications.',
  };
}

// ── age17-logexp L1 — ln & e Laws ────────────────────────────────────────────
function genLnLaws(): Problem {
  const CASES = [
    { q: `Simplify:  ln(e³)`, correct: '3', wrongs: ['e³', '3e', '1'], steps: ['ln(eⁿ) = n', 'ln(e³) = 3'] },
    { q: `Simplify:  e^(ln 5)`, correct: '5', wrongs: ['ln 5', 'e⁵', '1'], steps: ['e and ln are inverse functions', 'e^(ln 5) = 5'] },
    { q: `Evaluate:  ln 1`, correct: '0', wrongs: ['1', 'e', 'undefined'], steps: ['ln 1 = 0 since e⁰ = 1'] },
    { q: `Simplify:  ln a + ln b`, correct: 'ln(ab)', wrongs: ['ln(a + b)', 'ln a · ln b', 'ln(a/b)'], steps: ['Product law: ln a + ln b = ln(ab)'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 2,
    workingSteps: c.steps, hints: ['e and ln are inverses', 'Log laws: ln a + ln b = ln(ab)'],
    calculatorAllowed: false, commonMistake: 'Writing ln a + ln b = ln(a+b) — adding logs MULTIPLIES the arguments.',
    examTip: '9709: ln(eˣ) = x and e^(ln x) = x — these inverses unlock most equations.',
  };
}

// ── age17-logexp L2 — Solving Log Equations ──────────────────────────────────
function genSolveLog(): Problem {
  const b = [2, 3, 5, 10][randInt(0, 3)], k = randInt(2, 4);
  const x = Math.pow(b, k);
  const baseLabel = b === 10 ? 'log' : `log${b}`;
  const correct = `x = ${x}`;
  return {
    id: uid(),
    question: `Solve for x:\n${baseLabel} x = ${k}`,
    correctAnswer: correct,
    options: makeOptions(correct, [`x = ${b * k}`, `x = ${b + k}`, `x = ${k}`]),
    marks: 2,
    workingSteps: [
      `${baseLabel} x = ${k}  means  ${b}^${k} = x`,
      `x = ${b}^${k} = ${x}`,
    ],
    hints: [`logₐ x = n ⇔ aⁿ = x`, `Raise the base ${b} to the power ${k}`],
    calculatorAllowed: false,
    commonMistake: `Multiplying base × power (${b}×${k} = ${b * k}) — instead raise ${b} to the power ${k}.`,
    examTip: `9709: convert the log to exponential form first: logₐ x = n ⇒ x = aⁿ.`,
  };
}

// ── age17-logexp L3 — Log Laws in Equations ──────────────────────────────────
function genLogLawSolve(): Problem {
  const CASES = [
    { q: `Solve (base 10):\nlog x + log 4 = log 20`, correct: 'x = 5', wrongs: ['x = 16', 'x = 80', 'x = 24'], steps: ['log x + log 4 = log(4x)', '4x = 20 ⇒ x = 5'] },
    { q: `Solve:\nlog₃ x − log₃ 2 = 1`, correct: 'x = 6', wrongs: ['x = 3', 'x = 2', 'x = 5'], steps: ['log₃(x/2) = 1 ⇒ x/2 = 3', 'x = 6'] },
    { q: `Solve (base 10):\n2 log x = log 9`, correct: 'x = 3', wrongs: ['x = 9', 'x = 4.5', 'x = 18'], steps: ['2 log x = log x²', 'x² = 9 ⇒ x = 3 (x > 0)'] },
    { q: `Solve (base 10):\nlog x + log 5 = 2`, correct: 'x = 20', wrongs: ['x = 5', 'x = 95', 'x = 40'], steps: ['log(5x) = 2 ⇒ 5x = 100', 'x = 20'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: ['Combine the logs using log laws first', 'Then convert to exponential form'],
    calculatorAllowed: false, commonMistake: 'Solving term-by-term instead of combining the logs into one first.',
    examTip: '9709: combine to a single log, then "undo" it. Reject non-positive solutions.',
  };
}

// ── age17-logexp L4 — Evaluating Logs ────────────────────────────────────────
function genChangeBase(): Problem {
  const CASES = [
    { q: `Evaluate:  log₂ 8`, correct: '3', wrongs: ['4', '2', '1.5'] },
    { q: `Evaluate:  log₉ 3`, correct: '1/2', wrongs: ['3', '2', '1/3'] },
    { q: `Evaluate:  log₄ 2`, correct: '1/2', wrongs: ['2', '1/4', '1'] },
    { q: `Evaluate:  log₂ (1/8)`, correct: '−3', wrongs: ['3', '1/3', '−1/3'] },
    { q: `Evaluate:  log₅ 1`, correct: '0', wrongs: ['1', '5', '1/5'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 2,
    workingSteps: ['Ask: the base to WHAT power gives the argument?', 'Write the argument as a power of the base'],
    hints: ['logₐ b = n means aⁿ = b', 'For fractions the exponent is negative'],
    calculatorAllowed: false, commonMistake: 'For log₉ 3: since 9^(1/2) = 3, the answer is 1/2, not 3.',
    examTip: '9709: rewrite the argument as a power of the base — the exponent is the log.',
  };
}

// ── age17-func3 L1 — Composite with a Quadratic ──────────────────────────────
function genCompositeQuad(): Problem {
  const a = randInt(2, 4), b = randInt(1, 5), k = randInt(2, 4);
  const fgk = a * k * k + b;   // f(x)=ax+b, g(x)=x², fg(k)=a k²+b
  const correct = `${fgk}`;
  return {
    id: uid(),
    question: `f(x) = ${a}x + ${b},   g(x) = x²\n\nFind fg(${k}).`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${(a * k + b) * (a * k + b)}`, `${a * k * k}`, `${a * k + b}`]),
    marks: 3,
    workingSteps: [
      `fg(${k}) = f(g(${k}))`,
      `g(${k}) = ${k}² = ${k * k}`,
      `f(${k * k}) = ${a}(${k * k}) + ${b} = ${fgk}`,
    ],
    hints: [`Apply g first: g(${k}) = ${k}²`, `Then apply f to the result`],
    calculatorAllowed: false,
    commonMistake: `Computing gf(${k}) = (f(${k}))² instead — fg means g first, then f.`,
    examTip: `9709: fg(x) = f(g(x)). Substitute the inner output into f.`,
  };
}

// ── age17-func3 L2 — Inverse Function ────────────────────────────────────────
function genInverseLinear17(): Problem {
  const a = randInt(2, 4), b = randInt(1, 5);
  const correct = `f⁻¹(x) = ${b}x + ${a}`;
  return {
    id: uid(),
    question: `f(x) = (x − ${a}) / ${b}\n\nFind the inverse function f⁻¹(x).`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      `f⁻¹(x) = ${b}x − ${a}`,
      `f⁻¹(x) = (x + ${a})/${b}`,
      `f⁻¹(x) = ${a}x + ${b}`,
    ]),
    marks: 3,
    workingSteps: [
      `Let y = (x − ${a})/${b}`,
      `Swap x and y:  x = (y − ${a})/${b}`,
      `${b}x = y − ${a}  ⇒  y = ${b}x + ${a}`,
    ],
    hints: [`Swap x and y, then make y the subject`, `Undo ÷${b}, then undo −${a}`],
    calculatorAllowed: false,
    commonMistake: `Sign slip: undoing −${a} gives +${a}. The inverse is ${b}x + ${a}.`,
    examTip: `9709: to invert, swap x ↔ y and solve for y, reversing each operation.`,
  };
}

// ── age17-func3 L3 — Modulus Equations ───────────────────────────────────────
function genModulusEq(): Problem {
  const CASES = [
    { q: `Solve:  |x − 3| = 5`, correct: 'x = 8 or x = −2', wrongs: ['x = 8', 'x = 2 or x = −8', 'x = −8 or x = 2'], steps: ['x − 3 = 5 ⇒ x = 8', 'or x − 3 = −5 ⇒ x = −2'] },
    { q: `Solve:  |2x| = 6`, correct: 'x = 3 or x = −3', wrongs: ['x = 3', 'x = 6 or x = −6', 'x = 12 or x = −12'], steps: ['2x = 6 ⇒ x = 3', 'or 2x = −6 ⇒ x = −3'] },
    { q: `Solve:  |x + 1| = 4`, correct: 'x = 3 or x = −5', wrongs: ['x = 3', 'x = 5 or x = −3', 'x = −3 or x = 5'], steps: ['x + 1 = 4 ⇒ x = 3', 'or x + 1 = −4 ⇒ x = −5'] },
    { q: `Solve:  |x − 2| = 7`, correct: 'x = 9 or x = −5', wrongs: ['x = 9', 'x = 5 or x = −9', 'x = 7'], steps: ['x − 2 = 7 ⇒ x = 9', 'or x − 2 = −7 ⇒ x = −5'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: ['|A| = c gives two equations: A = c and A = −c', 'Solve both branches'],
    calculatorAllowed: false, commonMistake: 'Giving only the positive case — the modulus splits into TWO equations.',
    examTip: '9709: |f(x)| = c ⇒ f(x) = ±c. Always solve both.',
  };
}

// ── age17-func3 L4 — Domain & Range ──────────────────────────────────────────
function genRangeDomain(): Problem {
  const CASES = [
    { q: `State the range of  f(x) = x²   (x ∈ ℝ).`, correct: 'f(x) ≥ 0', wrongs: ['f(x) > 0', 'f(x) ≤ 0', 'all real numbers'], steps: ['x² is never negative; it reaches 0 at x = 0', 'Range: f(x) ≥ 0'] },
    { q: `State the range of  f(x) = x² + 3   (x ∈ ℝ).`, correct: 'f(x) ≥ 3', wrongs: ['f(x) > 3', 'f(x) ≥ 0', 'f(x) ≤ 3'], steps: ['x² ≥ 0, so x² + 3 ≥ 3', 'Range: f(x) ≥ 3'] },
    { q: `State the domain of  f(x) = √x.`, correct: 'x ≥ 0', wrongs: ['x > 0', 'all real numbers', 'x ≤ 0'], steps: ['Cannot square-root a negative real number', 'Domain: x ≥ 0'] },
    { q: `State the range of  f(x) = |x|.`, correct: 'f(x) ≥ 0', wrongs: ['f(x) > 0', 'all real numbers', 'f(x) ≤ 0'], steps: ['Modulus is never negative', 'Range: f(x) ≥ 0'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 2,
    workingSteps: c.steps, hints: ['Range = output values;  domain = valid inputs', 'Squares and moduli are ≥ 0'],
    calculatorAllowed: false, commonMistake: 'Using > instead of ≥ — the minimum value 0 is actually attained.',
    examTip: '9709: include the boundary (≥) when the minimum is reached.',
  };
}

// ── age17-algebra4 L1 — Partial Fractions (cover-up) ─────────────────────────
function genPartialFraction(): Problem {
  const CASES = [
    { q: `f(x) = 5 / ((x − 1)(x + 4)) ≡ A/(x − 1) + B/(x + 4).\n\nFind A.`, correct: 'A = 1', wrongs: ['A = 5', 'A = 1/5', 'A = −1'], steps: ['Cover-up at x = 1:  A = 5 / (1 + 4) = 1'] },
    { q: `f(x) = 7 / ((x − 2)(x + 5)) ≡ A/(x − 2) + B/(x + 5).\n\nFind A.`, correct: 'A = 1', wrongs: ['A = 7', 'A = 1/7', 'A = 7/5'], steps: ['Cover-up at x = 2:  A = 7 / (2 + 5) = 1'] },
    { q: `f(x) = 12 / ((x − 1)(x + 3)) ≡ A/(x − 1) + B/(x + 3).\n\nFind A.`, correct: 'A = 3', wrongs: ['A = 12', 'A = 4', 'A = 1/3'], steps: ['Cover-up at x = 1:  A = 12 / (1 + 3) = 3'] },
    { q: `f(x) = 6 / ((x + 1)(x − 2)) ≡ A/(x + 1) + B/(x − 2).\n\nFind A.`, correct: 'A = −2', wrongs: ['A = 2', 'A = 6', 'A = −6'], steps: ['Cover-up at x = −1:  A = 6 / (−1 − 2) = −2'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: ['Cover-up rule: cover (x − a), substitute its root into the rest', 'A = the leftover expression evaluated at the root'],
    calculatorAllowed: false, commonMistake: 'Forgetting to substitute the ROOT of the covered factor into the remaining expression.',
    examTip: '9709: the cover-up rule finds each constant in one step.',
  };
}

// ── age17-algebra4 L2 — Binomial Coefficient ─────────────────────────────────
function genBinomialCoeff(): Problem {
  const CASES = [
    { q: `Find the coefficient of x² in the expansion of (1 + x)⁵.`, correct: '10', wrongs: ['5', '20', '25'], steps: ['Coefficient of xʳ in (1+x)ⁿ is ⁿCᵣ', '⁵C₂ = 10'] },
    { q: `Find the coefficient of x² in (1 + x)⁴.`, correct: '6', wrongs: ['4', '8', '12'], steps: ['⁴C₂ = 6'] },
    { q: `Find the coefficient of x² in (1 + x)⁶.`, correct: '15', wrongs: ['6', '20', '30'], steps: ['⁶C₂ = 15'] },
    { q: `Find the coefficient of x in (2 + x)³.`, correct: '12', wrongs: ['6', '8', '3'], steps: ['Term in x: ³C₁ · 2² · x = 3 × 4 × x', 'Coefficient = 12'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: ["Use ⁿCᵣ from Pascal's triangle", 'For (a+x)ⁿ include the powers of a'],
    calculatorAllowed: false, commonMistake: 'Forgetting the powers of the constant term (e.g. the 2² in (2+x)³).',
    examTip: '9709: general term of (a+b)ⁿ is ⁿCᵣ aⁿ⁻ʳ bʳ.',
  };
}

// ── age17-algebra4 L3 — Factorising Cubics ───────────────────────────────────
function genFactorCubic(): Problem {
  const CASES = [
    { q: `Factorise fully:  x³ − 4x`, correct: 'x(x − 2)(x + 2)', wrongs: ['x(x² − 4)', '(x − 2)(x + 2)', 'x(x − 4)(x + 4)'], steps: ['x³ − 4x = x(x² − 4)', 'x² − 4 = (x − 2)(x + 2)', '= x(x − 2)(x + 2)'] },
    { q: `Factorise fully:  x³ − x`, correct: 'x(x − 1)(x + 1)', wrongs: ['x(x² − 1)', '(x − 1)(x + 1)', 'x²(x − 1)'], steps: ['x³ − x = x(x² − 1) = x(x − 1)(x + 1)'] },
    { q: `Factorise fully:  x³ − 9x`, correct: 'x(x − 3)(x + 3)', wrongs: ['x(x² − 9)', '(x − 3)(x + 3)', 'x(x − 9)(x + 1)'], steps: ['x³ − 9x = x(x² − 9) = x(x − 3)(x + 3)'] },
    { q: `(x − 1) is a factor of  x³ − 7x + 6.\n\nWhich is another root?`, correct: 'x = 2', wrongs: ['x = 1', 'x = 6', 'x = 7'], steps: ['Test x = 2:  8 − 14 + 6 = 0 ✓', 'So x = 2 is a root (the third is x = −3).'] },
  ];
  const c = CASES[randInt(0, CASES.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.correct, options: makeOptions(c.correct, c.wrongs), marks: 3,
    workingSteps: c.steps, hints: ['Take out the common factor first', 'Then use the difference of two squares'],
    calculatorAllowed: false, commonMistake: 'Stopping at x(x² − 4) — that is not FULLY factorised.',
    examTip: '9709: "factorise fully" means continue until every factor is linear (or irreducible).',
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

// ═══════════════════════════════════════════════════════════════════════════
//  Age 15 (Builders) expansion — bring every topic up to 8 distinct levels.
//  Conceptual skills use hand-verified CASES; arithmetic skills compute the
//  answer procedurally so it is always correct. makeOptions guarantees 4
//  distinct options regardless.
// ═══════════════════════════════════════════════════════════════════════════

interface CaseDef {
  q: string; c: string; w: string[]; s: string[]; h: string[];
  mistake: string; tip: string; m?: number; calc?: boolean;
}

function fromCases(cases: CaseDef[]): Problem {
  const c = cases[randInt(0, cases.length - 1)];
  return {
    id: uid(), question: c.q, correctAnswer: c.c,
    options: makeOptions(c.c, c.w), marks: c.m ?? 3,
    workingSteps: c.s, hints: c.h, calculatorAllowed: c.calc ?? false,
    commonMistake: c.mistake, examTip: c.tip,
  };
}

// ── age15-numeracy L2 — Percentage Change ────────────────────────────────────
function genPercentChange(): Problem {
  const P = randInt(2, 9) * 100;
  const r = [5, 10, 20, 25, 50][randInt(0, 4)];
  const inc = Math.random() < 0.5;
  const delta = (P * r) / 100;
  const val = inc ? P + delta : P - delta;
  return {
    id: uid(),
    question: `A price of ${P} is ${inc ? 'increased' : 'decreased'} by ${r}%.\n\nFind the new price.`,
    correctAnswer: `${val}`,
    options: makeOptions(`${val}`, [`${delta}`, `${inc ? P - delta : P + delta}`, `${val + (inc ? delta : -delta)}`]),
    marks: 2,
    workingSteps: [
      `Multiplier = ${inc ? `1 + ${r}/100 = ${1 + r / 100}` : `1 − ${r}/100 = ${1 - r / 100}`}`,
      `New price = ${P} × ${inc ? 1 + r / 100 : 1 - r / 100} = ${val}`,
    ],
    hints: [`${inc ? 'Increase' : 'Decrease'} → multiply by ${inc ? '(1 + rate)' : '(1 − rate)'}`, `${r}% of ${P} = ${delta}`],
    calculatorAllowed: true,
    commonMistake: `Stopping at the change (${delta}) instead of ${inc ? 'adding it to' : 'subtracting it from'} the original.`,
    examTip: `Use the multiplier method: ${inc ? 1 + r / 100 : 1 - r / 100} × ${P} in one step — fewer errors.`,
  };
}

// ── age15-numeracy L3 — Reverse Percentages ──────────────────────────────────
function genReversePercent(): Problem {
  const O = randInt(2, 9) * 100;
  const r = [10, 20, 25, 50][randInt(0, 3)];
  const inc = Math.random() < 0.5;
  const mult = inc ? 1 + r / 100 : 1 - r / 100;
  const newVal = O * mult;
  return {
    id: uid(),
    question: `After a ${r}% ${inc ? 'increase' : 'decrease'}, a price is ${newVal}.\n\nFind the ORIGINAL price.`,
    correctAnswer: `${O}`,
    options: makeOptions(`${O}`, [`${newVal}`, `${O + 100}`, `${O - 100}`]),
    marks: 3,
    workingSteps: [
      `New price = original × ${mult}`,
      `${newVal} = original × ${mult}`,
      `Original = ${newVal} ÷ ${mult} = ${O}`,
    ],
    hints: [`Reverse percentage → divide by the multiplier`, `multiplier = ${mult}`],
    calculatorAllowed: true,
    commonMistake: `Taking ${r}% of the NEW price (${newVal}) instead of dividing by the multiplier. The % is of the original.`,
    examTip: `Reverse % ALWAYS divides by the multiplier. Never take a percentage of the new value.`,
  };
}

// ── age15-numeracy L4 — Sharing in a Ratio ───────────────────────────────────
function genRatioSharing(): Problem {
  const parts = [randInt(1, 4), randInt(1, 4), randInt(1, 4)];
  const sum = parts[0] + parts[1] + parts[2];
  const unit = randInt(2, 9) * 10;
  const total = sum * unit;
  const idx = randInt(0, 2);
  const who = ['A', 'B', 'C'][idx];
  const share = parts[idx] * unit;
  return {
    id: uid(),
    question: `Share ${total} in the ratio ${parts.join(' : ')} among A, B and C.\n\nHow much does ${who} receive?`,
    correctAnswer: `${share}`,
    options: makeOptions(`${share}`, [`${share + unit}`, `${Math.max(0, share - unit)}`, `${Math.round(total / 3)}`]),
    marks: 3,
    workingSteps: [
      `Total parts = ${parts.join(' + ')} = ${sum}`,
      `One part = ${total} ÷ ${sum} = ${unit}`,
      `${who} = ${parts[idx]} × ${unit} = ${share}`,
    ],
    hints: [`Find the total number of parts first`, `One part = total ÷ sum of parts`],
    calculatorAllowed: true,
    commonMistake: `Dividing by 3 (the number of people) instead of ${sum} (the total parts).`,
    examTip: `Always find the value of ONE part first, then multiply by each share's parts.`,
  };
}

// ── age15-numeracy L5 — Direct Proportion ────────────────────────────────────
function genDirectProportion(): Problem {
  const k = randInt(2, 9);
  const x1 = randInt(2, 6);
  const y1 = k * x1;
  const x2 = x1 + randInt(1, 4);
  const y2 = k * x2;
  return {
    id: uid(),
    question: `y is directly proportional to x.\nWhen x = ${x1}, y = ${y1}.\n\nFind y when x = ${x2}.`,
    correctAnswer: `${y2}`,
    options: makeOptions(`${y2}`, [`${y2 + k}`, `${y1 + (x2 - x1)}`, `${y2 - k}`]),
    marks: 3,
    workingSteps: [`Direct proportion: y = kx`, `k = ${y1} ÷ ${x1} = ${k}`, `y = ${k} × ${x2} = ${y2}`],
    hints: [`y = kx`, `Find k first, then substitute the new x`],
    calculatorAllowed: false,
    commonMistake: `Adding the change in x to y (giving ${y1 + (x2 - x1)}) — proportion is multiplicative, not additive.`,
    examTip: `The ratio y/x is constant (= k = ${k}). Use it to scale.`,
  };
}

// ── age15-numeracy L6 — Inverse Proportion ───────────────────────────────────
function genInverseProportion(): Problem {
  const k = [12, 24, 36, 48, 60][randInt(0, 4)];
  const divs = [1, 2, 3, 4, 6].filter(d => k % d === 0);
  const x1 = divs[randInt(0, divs.length - 1)];
  let x2 = divs[randInt(0, divs.length - 1)];
  if (x2 === x1) x2 = divs[(divs.indexOf(x1) + 1) % divs.length];
  const y1 = k / x1, y2 = k / x2;
  return {
    id: uid(),
    question: `y is inversely proportional to x.\nWhen x = ${x1}, y = ${y1}.\n\nFind y when x = ${x2}.`,
    correctAnswer: `${y2}`,
    options: makeOptions(`${y2}`, [`${k}`, `${y2 + 1}`, `${Math.max(1, y2 - 1)}`]),
    marks: 3,
    workingSteps: [`Inverse proportion: y = k/x`, `k = x·y = ${x1} × ${y1} = ${k}`, `y = ${k} ÷ ${x2} = ${y2}`],
    hints: [`y = k/x`, `k = x × y is constant`],
    calculatorAllowed: false,
    commonMistake: `Treating it as direct proportion — here as x increases, y DECREASES.`,
    examTip: `Inverse proportion: the PRODUCT x×y is constant (= ${k}).`,
  };
}

// ── age15-numeracy L7 — Speed, Distance & Time ───────────────────────────────
function genSpeedDistTime(): Problem {
  const S = [40, 50, 60, 80, 100][randInt(0, 4)];
  const T = randInt(2, 5);
  const D = S * T;
  const mode = randInt(0, 2);
  if (mode === 0) {
    return {
      id: uid(),
      question: `A car travels at ${S} km/h for ${T} hours.\n\nFind the distance travelled.`,
      correctAnswer: `${D} km`,
      options: makeOptions(`${D} km`, [`${S + T} km`, `${D + S} km`, `${Math.round(D / 2)} km`]),
      marks: 2,
      workingSteps: [`Distance = Speed × Time`, `D = ${S} × ${T} = ${D} km`],
      hints: [`D = S × T`], calculatorAllowed: true,
      commonMistake: `Adding speed and time instead of multiplying.`,
      examTip: `Use the D-S-T triangle: D on top, so D = S × T.`,
    };
  } else if (mode === 1) {
    return {
      id: uid(),
      question: `A journey of ${D} km is driven at ${S} km/h.\n\nHow long does it take?`,
      correctAnswer: `${T} hours`,
      options: makeOptions(`${T} hours`, [`${T + 1} hours`, `${D - S} hours`, `${Math.max(1, T - 1)} hours`]),
      marks: 2,
      workingSteps: [`Time = Distance ÷ Speed`, `T = ${D} ÷ ${S} = ${T} hours`],
      hints: [`T = D ÷ S`], calculatorAllowed: true,
      commonMistake: `Multiplying instead of dividing — Time = Distance ÷ Speed.`,
      examTip: `From the triangle: T = D / S.`,
    };
  } else {
    return {
      id: uid(),
      question: `A train covers ${D} km in ${T} hours.\n\nFind its average speed.`,
      correctAnswer: `${S} km/h`,
      options: makeOptions(`${S} km/h`, [`${S + 10} km/h`, `${D - T} km/h`, `${Math.max(10, S - 10)} km/h`]),
      marks: 2,
      workingSteps: [`Speed = Distance ÷ Time`, `S = ${D} ÷ ${T} = ${S} km/h`],
      hints: [`S = D ÷ T`], calculatorAllowed: true,
      commonMistake: `Dividing time by distance — Speed = Distance ÷ Time.`,
      examTip: `From the triangle: S = D / T.`,
    };
  }
}

// ── age15-numeracy L8 — Unit Conversion ──────────────────────────────────────
function genUnitConversion(): Problem {
  return fromCases([
    { q: `Convert 3.5 km to metres.`, c: '3500 m', w: ['350 m', '35000 m', '3.5 m'], s: ['1 km = 1000 m', '3.5 × 1000 = 3500 m'], h: ['1 km = 1000 m'], mistake: 'Multiplying by 100 instead of 1000.', tip: 'km → m: multiply by 1000.', calc: true },
    { q: `Convert 2500 g to kilograms.`, c: '2.5 kg', w: ['25 kg', '250 kg', '0.25 kg'], s: ['1 kg = 1000 g', '2500 ÷ 1000 = 2.5 kg'], h: ['1 kg = 1000 g'], mistake: 'Dividing by 100 instead of 1000.', tip: 'g → kg: divide by 1000.', calc: true },
    { q: `Convert 4.2 litres to millilitres.`, c: '4200 ml', w: ['420 ml', '42000 ml', '42 ml'], s: ['1 L = 1000 ml', '4.2 × 1000 = 4200 ml'], h: ['1 L = 1000 ml'], mistake: 'Wrong power of ten.', tip: 'L → ml: multiply by 1000.', calc: true },
    { q: `Convert 750 cm to metres.`, c: '7.5 m', w: ['75 m', '0.75 m', '7500 m'], s: ['1 m = 100 cm', '750 ÷ 100 = 7.5 m'], h: ['1 m = 100 cm'], mistake: 'Dividing by 1000 instead of 100.', tip: 'cm → m: divide by 100.', calc: true },
    { q: `A car uses 6 litres per 100 km. How much for a 250 km trip?`, c: '15 litres', w: ['12 litres', '24 litres', '6 litres'], s: ['Per km: 6 ÷ 100 = 0.06 L', '250 × 0.06 = 15 litres'], h: ['Find fuel per km first'], mistake: 'Forgetting to scale to 250 km.', tip: 'Compound units: find the per-unit rate first.', calc: true },
  ]);
}

// ── age15-prob L3 — Single Event Probability ─────────────────────────────────
function genSingleEventProb(): Problem {
  const r = randInt(2, 5), b = randInt(2, 5), g = randInt(2, 5);
  const total = r + b + g;
  const which = randInt(0, 2);
  const cnt = [r, b, g][which];
  const name = ['red', 'blue', 'green'][which];
  const correct = simplify(cnt, total);
  return {
    id: uid(),
    question: `A bag contains ${r} red, ${b} blue and ${g} green counters.\nOne counter is taken at random.\n\nFind P(${name}).`,
    correctAnswer: correct,
    options: makeOptions(correct, [simplify(total - cnt, total), `${cnt}/${total + 1}`, simplify(cnt + 1, total)]),
    marks: 2,
    workingSteps: [`P(event) = favourable ÷ total`, `P(${name}) = ${cnt}/${total} = ${correct}`],
    hints: [`Total counters = ${total}`, `P = favourable / total`],
    calculatorAllowed: false,
    commonMistake: `Using the wrong total — count ALL counters (${total}), not just the other colours.`,
    examTip: `Always simplify the fraction. ${cnt}/${total} = ${correct}.`,
  };
}

// ── age15-prob L4 — Tree Diagrams (without replacement) ───────────────────────
function genTreeDiagram(): Problem {
  const total = randInt(6, 9);
  const r = randInt(2, total - 2);
  const num = r * (r - 1), den = total * (total - 1);
  const correct = simplify(num, den);
  return {
    id: uid(),
    question: `A box has ${total} balls, of which ${r} are red.\nTwo balls are taken WITHOUT replacement.\n\nFind P(both red).`,
    correctAnswer: correct,
    options: makeOptions(correct, [simplify(r * r, total * total), `${r}/${total}`, simplify(r * (r - 1), total * total)]),
    marks: 3,
    workingSteps: [
      `P(1st red) = ${r}/${total}`,
      `P(2nd red | 1st red) = ${r - 1}/${total - 1}`,
      `P(both) = ${r}/${total} × ${r - 1}/${total - 1} = ${correct}`,
    ],
    hints: [`Without replacement: reduce BOTH numerator and denominator by 1 for the 2nd draw`, `Multiply along the branches`],
    calculatorAllowed: false,
    commonMistake: `Using ${r}/${total} twice (that is WITH replacement) — the second draw has one fewer ball.`,
    examTip: `Without replacement changes the second fraction. Reduce top and bottom by 1.`,
  };
}

// ── age15-prob L5 — Mutually Exclusive Events ────────────────────────────────
function genMutuallyExclusive(): Problem {
  const den = [8, 10, 12][randInt(0, 2)];
  const a = randInt(1, 3), b = randInt(1, 3);
  const correct = simplify(a + b, den);
  return {
    id: uid(),
    question: `Events A and B are mutually exclusive.\nP(A) = ${a}/${den},  P(B) = ${b}/${den}.\n\nFind P(A or B).`,
    correctAnswer: correct,
    options: makeOptions(correct, [simplify(a * b, den), `${a + b}/${den * 2}`, simplify(Math.abs(a - b) || 1, den)]),
    marks: 2,
    workingSteps: [`Mutually exclusive: P(A or B) = P(A) + P(B)`, `= ${a}/${den} + ${b}/${den} = ${a + b}/${den} = ${correct}`],
    hints: [`Mutually exclusive means they cannot both happen`, `Just add the probabilities`],
    calculatorAllowed: false,
    commonMistake: `Multiplying instead of adding — "OR" with mutually exclusive events means ADD.`,
    examTip: `Mutually exclusive → add. (There is no overlap to subtract.)`,
  };
}

// ── age15-prob L6 — Independent Events ───────────────────────────────────────
function genIndependentEvents(): Problem {
  const fr = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5]];
  const i = randInt(0, fr.length - 1);
  let j = randInt(0, fr.length - 1);
  if (j === i) j = (i + 1) % fr.length;
  const [n1, d1] = fr[i], [n2, d2] = fr[j];
  const num = n1 * n2, den = d1 * d2;
  const correct = simplify(num, den);
  return {
    id: uid(),
    question: `A and B are independent events.\nP(A) = ${n1}/${d1},  P(B) = ${n2}/${d2}.\n\nFind P(A and B).`,
    correctAnswer: correct,
    options: makeOptions(correct, [simplify(n1 * d2 + n2 * d1, den), `${num}/${den + 1}`, simplify(num + 1, den)]),
    marks: 3,
    workingSteps: [`Independent: P(A and B) = P(A) × P(B)`, `= ${n1}/${d1} × ${n2}/${d2} = ${num}/${den} = ${correct}`],
    hints: [`Independent events: MULTIPLY`, `Multiply numerators and denominators`],
    calculatorAllowed: false,
    commonMistake: `Adding instead of multiplying — "AND" with independent events means MULTIPLY.`,
    examTip: `Independent + "AND" → multiply the probabilities.`,
  };
}

// ── age15-prob L7 — Simple Interest ──────────────────────────────────────────
function genSimpleInterest(): Problem {
  const P = randInt(2, 9) * 1000;
  const r = [5, 8, 10, 12][randInt(0, 3)];
  const t = randInt(2, 5);
  const I = (P * r * t) / 100;
  const total = P + I;
  const askTotal = Math.random() < 0.5;
  const correct = askTotal ? `${total}` : `${I}`;
  return {
    id: uid(),
    question: `${P} is invested at ${r}% SIMPLE interest per year for ${t} years.\n\nFind the ${askTotal ? 'total amount' : 'interest earned'}.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${askTotal ? I : total}`, `${Math.round(P * Math.pow(1 + r / 100, t))}`, `${P * r * t}`]),
    marks: 3,
    workingSteps: [
      `Simple interest: I = P × r × t / 100`,
      `I = ${P} × ${r} × ${t} / 100 = ${I}`,
      ...(askTotal ? [`Total = P + I = ${P} + ${I} = ${total}`] : []),
    ],
    hints: [`I = P r t / 100`, ...(askTotal ? [`Total = P + I`] : [])],
    calculatorAllowed: true,
    commonMistake: `Using compound interest — simple interest is the same amount each year (linear).`,
    examTip: `Simple interest is linear: the same ${I / t} is added every year.`,
  };
}

// ── age15-prob L8 — Expected Frequency ───────────────────────────────────────
function genExpectedFrequency(): Problem {
  const opts = [[1, 5, 60], [1, 4, 80], [1, 6, 60], [2, 5, 50], [3, 10, 100]];
  const [num, den, trials] = opts[randInt(0, opts.length - 1)];
  const exp = (num / den) * trials;
  return {
    id: uid(),
    question: `The probability of an event is ${num}/${den}.\nThe experiment is repeated ${trials} times.\n\nHow many times is the event expected to occur?`,
    correctAnswer: `${exp}`,
    options: makeOptions(`${exp}`, [`${trials - exp}`, `${exp + den}`, `${Math.round(trials / den)}`]),
    marks: 2,
    workingSteps: [`Expected frequency = probability × number of trials`, `= ${num}/${den} × ${trials} = ${exp}`],
    hints: [`Expected = P(event) × trials`],
    calculatorAllowed: true,
    commonMistake: `Using just the probability or just the trials — multiply them together.`,
    examTip: `Expected frequency = P × n. It need not be a whole number in general.`,
  };
}

// ── age15-functions L3 — Domain & Range ──────────────────────────────────────
function genDomainRange15(): Problem {
  return fromCases([
    { q: `State the range of f(x) = x² + 3.`, c: 'y ≥ 3', w: ['y ≤ 3', 'y ≥ 0', 'y > 3'], s: ['x² has minimum value 0', 'Minimum of x² + 3 is 0 + 3 = 3', 'Range: y ≥ 3'], h: ['x² is always ≥ 0', 'Add the constant to the minimum'], mistake: 'Writing y > 3 — the value 3 IS reached (at x = 0), so use ≥.', tip: 'For y = x² + c the range is y ≥ c.' },
    { q: `State the domain of f(x) = √(x − 4).`, c: 'x ≥ 4', w: ['x ≤ 4', 'x > 4', 'x ≥ 0'], s: ['The inside of a square root must be ≥ 0', 'x − 4 ≥ 0', 'x ≥ 4'], h: ['Inside of √ must be ≥ 0'], mistake: 'x > 4 excludes 4, but √0 = 0 is valid, so x ≥ 4.', tip: 'Square root: set the inside ≥ 0.' },
    { q: `Which value of x is excluded from the domain of f(x) = 1/(x − 2)?`, c: 'x = 2', w: ['x = 0', 'x = −2', 'x = 1'], s: ['The denominator cannot be 0', 'x − 2 = 0 → x = 2', 'Exclude x = 2'], h: ['Denominator ≠ 0'], mistake: 'Excluding x = 0 — it is x − 2 that cannot be 0, so x ≠ 2.', tip: 'For 1/(x − a), exclude x = a.' },
    { q: `State the range of f(x) = (x − 1)² + 5.`, c: 'y ≥ 5', w: ['y ≥ 1', 'y ≥ −5', 'y ≤ 5'], s: ['(x − 1)² has minimum 0', 'Minimum of (x − 1)² + 5 is 5', 'Range: y ≥ 5'], h: ['A squared bracket is ≥ 0'], mistake: 'Reading y ≥ 1 from the bracket — the + 5 lifts the minimum to 5.', tip: 'Vertex form y = (x − p)² + q has range y ≥ q.' },
  ]);
}

// ── age15-functions L4 — Recognising Graph Types ─────────────────────────────
function genGraphTypeRecognition(): Problem {
  return fromCases([
    { q: `What type of graph is y = 2x − 3?`, c: 'Straight line', w: ['Parabola', 'Hyperbola', 'Exponential'], s: ['Highest power of x is 1', 'y = mx + c is a straight line'], h: ['Look at the highest power of x'], mistake: 'Confusing linear with quadratic.', tip: 'Power 1 → line, power 2 → parabola.' },
    { q: `What type of graph is y = x² − 4?`, c: 'Parabola', w: ['Straight line', 'Cubic', 'Hyperbola'], s: ['Highest power of x is 2', 'y = ax² + bx + c is a parabola'], h: ['Highest power is 2'], mistake: 'Calling it a straight line.', tip: 'x² → U-shaped parabola.' },
    { q: `What type of graph is y = 1/x?`, c: 'Hyperbola', w: ['Parabola', 'Straight line', 'Cubic'], s: ['Reciprocal function', 'y = 1/x is a hyperbola with asymptotes'], h: ['x is in the denominator'], mistake: 'Calling it a parabola.', tip: 'Reciprocal 1/x → hyperbola.' },
    { q: `What type of graph is y = 2ˣ?`, c: 'Exponential', w: ['Parabola', 'Straight line', 'Hyperbola'], s: ['The variable is in the exponent', 'y = aˣ is exponential'], h: ['x is the power'], mistake: 'Confusing 2ˣ with x².', tip: 'Variable in the exponent → exponential.' },
    { q: `What type of graph is y = x³?`, c: 'Cubic', w: ['Parabola', 'Straight line', 'Hyperbola'], s: ['Highest power of x is 3', 'y = x³ is a cubic curve'], h: ['Highest power is 3'], mistake: 'Calling it a parabola.', tip: 'x³ → S-shaped cubic.' },
  ]);
}

// ── age15-functions L5 — Equation of a Line from Two Points ───────────────────
function genLineFromTwoPoints(): Problem {
  const m = [2, 3, -2, -1, 1, -3][randInt(0, 5)];
  const x1 = randInt(0, 3);
  const c = randInt(-4, 4);
  const y1 = m * x1 + c;
  const x2 = x1 + randInt(1, 3);
  const y2 = m * x2 + c;
  const fmtC = (k: number) => (k === 0 ? '' : k > 0 ? ` + ${k}` : ` − ${-k}`);
  const correct = `y = ${m}x${fmtC(c)}`;
  return {
    id: uid(),
    question: `A straight line passes through (${x1}, ${y1}) and (${x2}, ${y2}).\n\nFind its equation.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`y = ${m + 1}x${fmtC(c)}`, `y = ${m}x${fmtC(c + 1)}`, `y = ${-m}x${fmtC(c)}`]),
    marks: 3,
    workingSteps: [
      `Gradient m = (y₂ − y₁)/(x₂ − x₁) = (${y2} − ${y1})/(${x2} − ${x1}) = ${m}`,
      `Use y = mx + c with (${x1}, ${y1}): ${y1} = ${m}×${x1} + c → c = ${c}`,
      `Equation: ${correct}`,
    ],
    hints: [`Find the gradient first`, `Then substitute a point to find c`],
    calculatorAllowed: false,
    commonMistake: `Computing the gradient upside down: (x₂ − x₁)/(y₂ − y₁).`,
    examTip: `m = rise/run = (y₂ − y₁)/(x₂ − x₁). Keep the order consistent.`,
  };
}

// ── age15-functions L6 — Turning Point (Vertex Form) ─────────────────────────
function genTurningPointForm(): Problem {
  const p = randInt(1, 4) * (Math.random() < 0.5 ? 1 : -1);
  const q = randInt(-4, 4);
  const pStr = p >= 0 ? `− ${p}` : `+ ${-p}`;
  const qStr = q >= 0 ? `+ ${q}` : `− ${-q}`;
  const correct = `(${p}, ${q})`;
  return {
    id: uid(),
    question: `Find the turning point (vertex) of:\n y = (x ${pStr})² ${qStr}`,
    correctAnswer: correct,
    options: makeOptions(correct, [`(${-p}, ${q})`, `(${p}, ${-q})`, `(${q}, ${p})`]),
    marks: 3,
    workingSteps: [`y = (x − p)² + q has vertex (p, q)`, `Here p = ${p}, q = ${q}`, `Turning point = (${p}, ${q})`],
    hints: [`Vertex form: y = (x − p)² + q`, `The vertex is (p, q) — watch the sign of p`],
    calculatorAllowed: false,
    commonMistake: `Reading the sign of p straight from the bracket — (x ${pStr}) gives p = ${p}.`,
    examTip: `Vertex form reveals the turning point directly: (p, q). Line of symmetry is x = ${p}.`,
  };
}

// ── age15-functions L7 — Solving f(x) = k ────────────────────────────────────
function genFunctionMapping(): Problem {
  const a = randInt(2, 5), b = randInt(1, 6), x = randInt(2, 6);
  const k = a * x + b;
  return {
    id: uid(),
    question: `f(x) = ${a}x + ${b}.\nGiven that f(x) = ${k}, find the value of x.`,
    correctAnswer: `${x}`,
    options: makeOptions(`${x}`, [`${x + 1}`, `${k - a}`, `${Math.round(k / a)}`]),
    marks: 3,
    workingSteps: [`${a}x + ${b} = ${k}`, `${a}x = ${k - b}`, `x = ${k - b} ÷ ${a} = ${x}`],
    hints: [`Set the expression equal to ${k}`, `Solve the linear equation`],
    calculatorAllowed: false,
    commonMistake: `Substituting ${k} for x instead of solving for x.`,
    examTip: `f(x) = k means "for what input do we get ${k}?" — solve the equation.`,
  };
}

// ── age15-functions L8 — Graph Transformations ───────────────────────────────
function genGraphTransform(): Problem {
  return fromCases([
    { q: `Describe the transformation from y = f(x) to y = f(x) + 3.`, c: 'Translation 3 units up', w: ['Translation 3 units down', 'Translation 3 units right', 'Translation 3 units left'], s: ['A constant ADDED outside the function moves it vertically', '+ 3 → up 3'], h: ['Outside the bracket → vertical move'], mistake: 'Confusing vertical and horizontal shifts.', tip: '+ k outside → up k.' },
    { q: `Describe the transformation from y = f(x) to y = f(x) − 2.`, c: 'Translation 2 units down', w: ['Translation 2 units up', 'Translation 2 units left', 'Translation 2 units right'], s: ['− 2 outside → move down 2'], h: ['Outside the bracket → vertical move'], mistake: 'Moving up instead of down.', tip: '− k outside → down k.' },
    { q: `Describe the transformation from y = f(x) to y = f(x − 4).`, c: 'Translation 4 units right', w: ['Translation 4 units left', 'Translation 4 units up', 'Translation 4 units down'], s: ['Inside the bracket moves horizontally, OPPOSITE to the sign', '(x − 4) → right 4'], h: ['Inside the bracket → horizontal (opposite sign)'], mistake: '(x − 4) looks like left but it moves RIGHT.', tip: 'Inside: − a → right a (counter-intuitive).' },
    { q: `Describe the transformation from y = f(x) to y = f(x + 1).`, c: 'Translation 1 unit left', w: ['Translation 1 unit right', 'Translation 1 unit up', 'Translation 1 unit down'], s: ['(x + 1) → left 1 (opposite sign)'], h: ['Inside the bracket → opposite direction'], mistake: '(x + 1) moves LEFT, not right.', tip: 'Inside: + a → left a.' },
    { q: `Describe the transformation from y = f(x) to y = −f(x).`, c: 'Reflection in the x-axis', w: ['Reflection in the y-axis', 'Translation down', 'Rotation 90°'], s: ['Negating the whole function flips it vertically', 'y = −f(x) reflects in the x-axis'], h: ['Minus outside → reflect in x-axis'], mistake: 'Confusing the two reflections.', tip: '−f(x) → reflect in x-axis; f(−x) → reflect in y-axis.' },
    { q: `Describe the transformation from y = f(x) to y = f(−x).`, c: 'Reflection in the y-axis', w: ['Reflection in the x-axis', 'Translation left', 'Rotation 180°'], s: ['Negating the input flips it horizontally', 'y = f(−x) reflects in the y-axis'], h: ['Minus inside → reflect in y-axis'], mistake: 'Confusing the two reflections.', tip: 'f(−x) → reflect in y-axis.' },
  ]);
}

// ── age15-stats L4 — Mean from a Frequency Table ─────────────────────────────
function genFreqTableMean(): Problem {
  const vals = [1, 2, 3, 4];
  const f = [randInt(1, 6), randInt(1, 6), randInt(1, 6), randInt(1, 6)];
  const sumF = f.reduce((a, b) => a + b, 0);
  const sumFX = vals.reduce((a, v, i) => a + v * f[i], 0);
  const mean = sumFX / sumF;
  const correct = Number.isInteger(mean) ? `${mean}` : mean.toFixed(2);
  const table = vals.map((v, i) => `|   ${v}   |  ${f[i]}   |`).join('\n');
  return {
    id: uid(),
    question: `The table shows test scores:\n\n| Score | Freq |\n|-------|------|\n${table}\n\nFind the mean score.`,
    correctAnswer: correct,
    options: makeOptions(correct, [(mean + 1).toFixed(2), (sumFX / 4).toFixed(2), (mean + 0.5).toFixed(2)]),
    marks: 3,
    workingSteps: [
      `Σfx = ${vals.map((v, i) => `${v}×${f[i]}`).join(' + ')} = ${sumFX}`,
      `Σf = ${f.join(' + ')} = ${sumF}`,
      `Mean = ${sumFX} ÷ ${sumF} = ${correct}`,
    ],
    hints: [`Mean = Σfx ÷ Σf`, `Multiply each score by its frequency first`],
    calculatorAllowed: true,
    commonMistake: `Dividing by the number of rows (4) instead of Σf (${sumF}).`,
    examTip: `Add an "fx" column, total it, then divide by the total frequency.`,
  };
}

// ── age15-stats L5 — Scatter Graphs & Correlation ────────────────────────────
function genScatterCorrelation(): Problem {
  return fromCases([
    { q: `As temperature rises, ice-cream sales rise.\nWhat correlation does a scatter graph show?`, c: 'Positive correlation', w: ['Negative correlation', 'No correlation', 'Zero gradient'], s: ['Both quantities increase together', 'Up-and-to-the-right → positive correlation'], h: ['Do both increase together?'], mistake: 'Confusing positive with negative.', tip: 'Both rise together → positive.' },
    { q: `As a car gets older, its value falls.\nWhat correlation does a scatter graph show?`, c: 'Negative correlation', w: ['Positive correlation', 'No correlation', 'Perfect correlation'], s: ['One increases while the other decreases', 'Down-and-to-the-right → negative correlation'], h: ['One up, one down?'], mistake: 'Calling opposite trends positive.', tip: 'One up, one down → negative.' },
    { q: `Shoe size and exam mark give a randomly scattered graph.\nWhat correlation is shown?`, c: 'No correlation', w: ['Positive correlation', 'Negative correlation', 'Strong correlation'], s: ['No clear pattern', 'Random scatter → no correlation'], h: ['Is there any clear trend?'], mistake: 'Seeing a trend where there is none.', tip: 'No pattern → no correlation.' },
    { q: `A line of best fit slopes downward from left to right.\nWhat correlation is shown?`, c: 'Negative correlation', w: ['Positive correlation', 'No correlation', 'Zero correlation'], s: ['Downward slope → as x increases, y decreases', 'Negative correlation'], h: ['Which way does the line slope?'], mistake: 'Confusing the slope direction.', tip: 'Downward line → negative correlation.' },
  ]);
}

// ── age15-stats L6 — Stem-and-Leaf Diagrams ──────────────────────────────────
function genStemLeaf(): Problem {
  return fromCases([
    { q: `Stem-and-leaf (stem = tens):\n2 | 1 3 5\n3 | 0 2 4 6\n4 | 1 5\n\nFind the median.`, c: '32', w: ['30', '34', '25'], s: ['Data: 21, 23, 25, 30, 32, 34, 36, 41, 45', '9 values → median is the 5th', 'Median = 32'], h: ['Read the values in order', 'Median position = (9+1)/2 = 5th'], mistake: 'Picking the middle of the diagram by eye instead of counting.', tip: 'List the values in order, then find the middle one.' },
    { q: `Stem-and-leaf (stem = tens):\n1 | 2 4\n2 | 1 3 5 7\n3 | 0 2\n\nFind the range.`, c: '20', w: ['18', '30', '12'], s: ['Smallest = 12, Largest = 32', 'Range = 32 − 12 = 20'], h: ['Range = largest − smallest', 'Smallest is the first leaf, largest is the last'], mistake: 'Reading only the leaves and ignoring the stems.', tip: 'Combine stem and leaf: 1 | 2 = 12.' },
    { q: `Stem-and-leaf (stem = tens):\n4 | 1 1 3\n5 | 0 2\n6 | 4\n\nFind the mode.`, c: '41', w: ['43', '11', '50'], s: ['Values: 41, 41, 43, 50, 52, 64', '41 appears twice — most often', 'Mode = 41'], h: ['Mode = most frequent value', 'Look for a repeated leaf'], mistake: 'Giving the repeated leaf (1) instead of the full value (41).', tip: 'The mode is the whole value, e.g. 41, not just the leaf.' },
  ]);
}

// ── age15-stats L7 — Range & Spread ──────────────────────────────────────────
function genRangeSpread(): Problem {
  const d = Array.from({ length: 6 }, () => randInt(5, 45));
  const mx = Math.max(...d), mn = Math.min(...d), range = mx - mn;
  return {
    id: uid(),
    question: `Find the range of:\n${d.join(', ')}`,
    correctAnswer: `${range}`,
    options: makeOptions(`${range}`, [`${mx}`, `${mn}`, `${range + 2}`]),
    marks: 2,
    workingSteps: [`Range = largest − smallest`, `= ${mx} − ${mn} = ${range}`],
    hints: [`Find the largest and smallest values`, `Range = largest − smallest`],
    calculatorAllowed: false,
    commonMistake: `Giving the largest value instead of the difference.`,
    examTip: `A smaller range means the data is less spread out (more consistent).`,
  };
}

// ── age15-stats L8 — Comparing Data Sets ─────────────────────────────────────
function genComparingData(): Problem {
  return fromCases([
    { q: `Class A: mean 60, range 8.\nClass B: mean 60, range 20.\n\nWhich class is more consistent?`, c: 'Class A (smaller range)', w: ['Class B (larger range)', 'Both equally consistent', 'Cannot be determined'], s: ['Same mean, so compare spread', 'Smaller range = more consistent', 'Class A: range 8 < 20'], h: ['Consistency is about spread, not average', 'Smaller range = more consistent'], mistake: 'Thinking a larger range is better.', tip: 'Same mean → the smaller range is more consistent.' },
    { q: `Team X: mean score 45.\nTeam Y: mean score 52.\n\nWhich team scored higher on average?`, c: 'Team Y', w: ['Team X', 'Equal', 'Cannot be determined'], s: ['Compare the means', '52 > 45', 'Team Y is higher on average'], h: ['Compare the means directly'], mistake: 'Confusing higher mean with more consistent.', tip: 'The mean measures average performance.' },
    { q: `Data set P has range 5.\nData set Q has range 15.\n\nWhich is more spread out?`, c: 'Set Q', w: ['Set P', 'Equal spread', 'Cannot be determined'], s: ['Larger range = more spread', '15 > 5', 'Set Q is more spread out'], h: ['Range measures spread'], mistake: 'Thinking a smaller range is more spread.', tip: 'Larger range = more spread out.' },
  ]);
}

// ── age15-matrices L4 — Adding & Subtracting Matrices ────────────────────────
function genMatrixAddSub(): Problem {
  const A = [randInt(1, 6), randInt(1, 6), randInt(1, 6), randInt(1, 6)];
  const B = [randInt(1, 6), randInt(1, 6), randInt(1, 6), randInt(1, 6)];
  const add = Math.random() < 0.5;
  const R = A.map((v, i) => (add ? v + B[i] : v - B[i]));
  const fmt = (m: number[]) => `(${m[0]} ${m[1]} / ${m[2]} ${m[3]})`;
  const correct = fmt(R);
  return {
    id: uid(),
    question: `Work out:\n[${A[0]} ${A[1]}] ${add ? '+' : '−'} [${B[0]} ${B[1]}]\n[${A[2]} ${A[3]}]   [${B[2]} ${B[3]}]`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      fmt(A.map((v, i) => (add ? v - B[i] : v + B[i]))),
      fmt(R.map((v, i) => (i === 0 ? v + 1 : v))),
      fmt(A.map((v, i) => v * B[i])),
    ]),
    marks: 2,
    workingSteps: [`Add or subtract corresponding elements`, `Result = ${correct}`],
    hints: [`Matrices add/subtract element by element`, `Same position with same position`],
    calculatorAllowed: false,
    commonMistake: `Trying to use row × column (that is multiplication, not addition).`,
    examTip: `Only same-size matrices can be added or subtracted, position by position.`,
  };
}

// ── age15-matrices L5 — Scalar Multiplication ────────────────────────────────
function genScalarMatrix(): Problem {
  const k = randInt(2, 5);
  const A = [randInt(1, 6), randInt(1, 6), randInt(1, 6), randInt(1, 6)];
  const R = A.map(v => v * k);
  const fmt = (m: number[]) => `(${m[0]} ${m[1]} / ${m[2]} ${m[3]})`;
  const correct = fmt(R);
  return {
    id: uid(),
    question: `Work out ${k} × the matrix:\n[${A[0]} ${A[1]}]\n[${A[2]} ${A[3]}]`,
    correctAnswer: correct,
    options: makeOptions(correct, [
      fmt(A.map((v, i) => (i === 0 ? v * k : v))),
      fmt(A.map(v => v + k)),
      fmt(A.map((v, i) => v * k + (i === 3 ? 1 : 0))),
    ]),
    marks: 2,
    workingSteps: [`Multiply EVERY element by ${k}`, `Result = ${correct}`],
    hints: [`Scalar multiplication: every element × ${k}`],
    calculatorAllowed: false,
    commonMistake: `Multiplying only the first element — the scalar multiplies ALL four.`,
    examTip: `A scalar multiplies every entry of the matrix.`,
  };
}

// ── age15-matrices L6 — The Identity Matrix ──────────────────────────────────
function genMatrixIdentity(): Problem {
  return fromCases([
    { q: `What is the 2×2 identity matrix?`, c: '(1 0 / 0 1)', w: ['(0 0 / 0 0)', '(1 1 / 1 1)', '(0 1 / 1 0)'], s: ['The identity has 1s on the leading diagonal and 0s elsewhere'], h: ['I leaves any matrix unchanged: AI = A'], mistake: 'Putting 1s everywhere.', tip: 'Identity = 1s on the diagonal, 0s off it.' },
    { q: `For any 2×2 matrix A, what is A × I  (I = identity)?`, c: 'A', w: ['I', 'The zero matrix', 'A²'], s: ['Multiplying by the identity changes nothing', 'AI = IA = A'], h: ['Think of I like multiplying a number by 1'], mistake: 'Thinking AI = I.', tip: 'The identity is the matrix version of the number 1.' },
    { q: `Which matrix maps every vector to itself?`, c: 'The identity matrix', w: ['The zero matrix', 'A rotation matrix', 'The inverse matrix'], s: ['Iv = v for every vector v', 'That is the identity matrix'], h: ['Which matrix leaves things unchanged?'], mistake: 'Choosing the zero matrix.', tip: 'Identity matrix: Iv = v.' },
  ]);
}

// ── age15-matrices L7 — Matrix Equations (Determinant) ───────────────────────
function genMatrixEquation(): Problem {
  const x = randInt(2, 6), b = randInt(1, 4), c = randInt(1, 4), d = randInt(2, 6);
  const det = x * d - b * c;
  return {
    id: uid(),
    question: `The determinant of [x  ${b}]\n                  [${c}  ${d}]  is ${det}.\n\nFind the value of x.`,
    correctAnswer: `x = ${x}`,
    options: makeOptions(`x = ${x}`, [`x = ${x + 1}`, `x = ${Math.max(0, x - 1)}`, `x = ${det}`]),
    marks: 3,
    workingSteps: [
      `det = (top-left × bottom-right) − (top-right × bottom-left)`,
      `${det} = x×${d} − ${b}×${c} = ${d}x − ${b * c}`,
      `${d}x = ${det + b * c}`,
      `x = ${x}`,
    ],
    hints: [`det = ad − bc`, `Set it equal to ${det} and solve`],
    calculatorAllowed: false,
    commonMistake: `Adding bc instead of subtracting when forming the determinant.`,
    examTip: `Write det = ad − bc first, then solve the resulting linear equation.`,
  };
}

// ── age15-matrices L8 — Transformation Matrices ──────────────────────────────
function genTransformMatrix(): Problem {
  return fromCases([
    { q: `Apply the matrix (0 1 / 1 0) to the point (2, 5).`, c: '(5, 2)', w: ['(2, 5)', '(−2, 5)', '(5, −2)'], s: ['(0 1 / 1 0) × (2, 5): (0×2 + 1×5, 1×2 + 0×5)', '= (5, 2)'], h: ['Multiply the matrix by the column vector'], mistake: 'Leaving the point unchanged.', tip: '(0 1 / 1 0) swaps the coordinates.' },
    { q: `Which matrix represents a reflection in the x-axis?`, c: '(1 0 / 0 −1)', w: ['(−1 0 / 0 1)', '(0 1 / 1 0)', '(1 0 / 0 1)'], s: ['x-axis reflection: (x, y) → (x, −y)', 'Matrix (1 0 / 0 −1)'], h: ['x stays, y is negated'], mistake: 'Negating x instead of y.', tip: 'x-axis reflection keeps x, flips y.' },
    { q: `Which matrix represents a 90° anticlockwise rotation about the origin?`, c: '(0 −1 / 1 0)', w: ['(0 1 / −1 0)', '(−1 0 / 0 −1)', '(1 0 / 0 1)'], s: ['90° anticlockwise: (x, y) → (−y, x)', 'Matrix (0 −1 / 1 0)'], h: ['(x, y) → (−y, x) for 90° ACW'], mistake: 'Using the clockwise matrix.', tip: '90° ACW: (0 −1 / 1 0); 90° CW: (0 1 / −1 0).' },
  ]);
}

// ── age15-geometry L7 — Polygon Angles ───────────────────────────────────────
function genPolygonAngles(): Problem {
  const n = [5, 6, 8, 9, 10, 12][randInt(0, 5)];
  const interior = ((n - 2) * 180) / n;
  const exterior = 360 / n;
  const askInt = Math.random() < 0.5;
  const correct = askInt ? `${interior}°` : `${exterior}°`;
  return {
    id: uid(),
    question: `Find the size of each ${askInt ? 'interior' : 'exterior'} angle of a regular ${n}-sided polygon.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${askInt ? exterior : interior}°`, `${(askInt ? interior : exterior) + 10}°`, `${(n - 2) * 180}°`]),
    marks: 3,
    workingSteps: askInt
      ? [`Interior angle = (n − 2) × 180 ÷ n`, `= (${n} − 2) × 180 ÷ ${n} = ${(n - 2) * 180} ÷ ${n} = ${interior}°`]
      : [`Exterior angle = 360 ÷ n`, `= 360 ÷ ${n} = ${exterior}°`],
    hints: askInt ? [`Interior = (n − 2) × 180 / n`] : [`Exterior = 360 / n`],
    calculatorAllowed: true,
    commonMistake: `Mixing up the two formulas — interior + exterior = 180° at each vertex.`,
    examTip: `Exterior angles of any polygon sum to 360°. Interior = 180° − exterior.`,
  };
}

// ── age15-geometry L8 — Similar Shapes: Area & Volume ────────────────────────
function genScaleFactorAreaVol(): Problem {
  const k = randInt(2, 4);
  const small = randInt(2, 6);
  const isVol = Math.random() < 0.5;
  const u = isVol ? '³' : '²';
  const large = isVol ? small * k * k * k : small * k * k;
  return {
    id: uid(),
    question: isVol
      ? `Two similar solids have linear scale factor ${k}.\nThe smaller has volume ${small} cm³.\n\nFind the volume of the larger.`
      : `Two similar shapes have linear scale factor ${k}.\nThe smaller has area ${small} cm².\n\nFind the area of the larger.`,
    correctAnswer: `${large} cm${u}`,
    options: makeOptions(`${large} cm${u}`, [
      `${small * k} cm${u}`,
      `${isVol ? small * k * k : small * k * k * k} cm${u}`,
      `${large + small} cm${u}`,
    ]),
    marks: 3,
    workingSteps: isVol
      ? [`Volume scale factor = k³ = ${k}³ = ${k * k * k}`, `Larger volume = ${small} × ${k * k * k} = ${large} cm³`]
      : [`Area scale factor = k² = ${k}² = ${k * k}`, `Larger area = ${small} × ${k * k} = ${large} cm²`],
    hints: isVol ? [`Volume scales by k³`] : [`Area scales by k²`],
    calculatorAllowed: true,
    commonMistake: `Using the linear scale factor ${k} for ${isVol ? 'volume' : 'area'} — ${isVol ? 'cube it (k³)' : 'square it (k²)'}.`,
    examTip: `Length scales by k, area by k², volume by k³.`,
  };
}

// ── age15-algebra L7 — Changing the Subject ──────────────────────────────────
function genChangeSubject(): Problem {
  return fromCases([
    { q: `Make x the subject:\n y = 3x + 6`, c: 'x = (y − 6)/3', w: ['x = (y + 6)/3', 'x = 3(y − 6)', 'x = y/3 − 6'], s: ['y = 3x + 6', 'y − 6 = 3x', 'x = (y − 6)/3'], h: ['Undo + 6 first, then ÷ 3'], mistake: 'Dividing only part of the right-hand side by 3.', tip: 'Reverse the operations in reverse order.' },
    { q: `Make a the subject:\n v = u + at`, c: 'a = (v − u)/t', w: ['a = (v + u)/t', 'a = (v − u)t', 'a = v − u − t'], s: ['v = u + at', 'v − u = at', 'a = (v − u)/t'], h: ['Subtract u, then divide by t'], mistake: 'Forgetting to divide the whole bracket by t.', tip: 'Isolate the at term first.' },
    { q: `Make h the subject:\n V = lwh`, c: 'h = V/(lw)', w: ['h = Vlw', 'h = V − lw', 'h = lw/V'], s: ['V = lwh', 'Divide both sides by lw', 'h = V/(lw)'], h: ['Divide by everything multiplying h'], mistake: 'Subtracting lw instead of dividing.', tip: 'h is multiplied by lw, so divide by lw.' },
    { q: `Make r the subject:\n A = πr²`, c: 'r = √(A/π)', w: ['r = A/π', 'r = √(Aπ)', 'r = (A/π)²'], s: ['A = πr²', 'r² = A/π', 'r = √(A/π)'], h: ['Divide by π, then square-root'], mistake: 'Forgetting the square root at the end.', tip: 'Undo the square last by taking √.' },
  ]);
}

// ── age15-algebra L8 — Factorising by Grouping ───────────────────────────────
function genFactorGrouping(): Problem {
  return fromCases([
    { q: `Factorise by grouping:\n ax + ay + bx + by`, c: '(a + b)(x + y)', w: ['(a + x)(b + y)', '(a − b)(x − y)', 'ab(x + y)'], s: ['Group: a(x + y) + b(x + y)', 'Common factor (x + y)', '(a + b)(x + y)'], h: ['Group into pairs', 'Take out a common factor from each pair'], mistake: 'Pairing the wrong terms.', tip: 'Look for a common bracket after the first factoring step.' },
    { q: `Factorise by grouping:\n x² + 5x + 2x + 10`, c: '(x + 2)(x + 5)', w: ['(x + 5)(x + 5)', '(x + 2)(x − 5)', '(x + 10)(x + 1)'], s: ['Group: x(x + 5) + 2(x + 5)', 'Common factor (x + 5)', '(x + 2)(x + 5)'], h: ['Factor x from the first pair, 2 from the second'], mistake: 'Sign errors in the second bracket.', tip: 'Both brackets should match after the first step.' },
    { q: `Factorise by grouping:\n 2x + 2y + ax + ay`, c: '(2 + a)(x + y)', w: ['(2 − a)(x + y)', '(2 + x)(a + y)', '2a(x + y)'], s: ['Group: 2(x + y) + a(x + y)', '(2 + a)(x + y)'], h: ['Take 2 from the first pair, a from the second'], mistake: 'Mismatched brackets.', tip: 'The shared bracket is (x + y).' },
    { q: `Factorise by grouping:\n xy + 3x + 2y + 6`, c: '(x + 2)(y + 3)', w: ['(x + 3)(y + 2)', '(x + 6)(y + 1)', 'xy(3 + 2)'], s: ['Group: x(y + 3) + 2(y + 3)', '(x + 2)(y + 3)'], h: ['Factor x from the first pair, 2 from the second'], mistake: 'Swapping the bracket constants.', tip: 'Check by expanding: (x + 2)(y + 3) = xy + 3x + 2y + 6.' },
  ]);
}

// ── age15-trig L8 — Exact Trig Values ────────────────────────────────────────
function genExactTrigValues(): Problem {
  return fromCases([
    { q: `Write down the exact value of sin 30°.`, c: '1/2', w: ['√3/2', '1', '√2/2'], s: ['Standard exact value', 'sin 30° = 1/2'], h: ['Memorise the special angles'], mistake: 'Confusing sin 30° with sin 60°.', tip: 'sin 30° = 1/2, sin 60° = √3/2.' },
    { q: `Write down the exact value of cos 60°.`, c: '1/2', w: ['√3/2', '1/√2', '1'], s: ['cos 60° = 1/2 (= sin 30°)'], h: ['cos 60° = sin 30°'], mistake: 'Confusing cos 60° with cos 30°.', tip: 'cos 60° = 1/2, cos 30° = √3/2.' },
    { q: `Write down the exact value of tan 45°.`, c: '1', w: ['0', '√3', '1/√3'], s: ['tan 45° = sin 45° / cos 45° = 1'], h: ['At 45° opposite = adjacent'], mistake: 'Thinking tan 45° = √3.', tip: 'tan 45° = 1 exactly.' },
    { q: `Write down the exact value of sin 60°.`, c: '√3/2', w: ['1/2', '√2/2', '1'], s: ['sin 60° = √3/2'], h: ['Special triangle 30-60-90'], mistake: 'Confusing with sin 30°.', tip: 'sin 60° = √3/2 ≈ 0.866.' },
    { q: `Write down the exact value of cos 30°.`, c: '√3/2', w: ['1/2', '1', '√3'], s: ['cos 30° = √3/2'], h: ['cos 30° = sin 60°'], mistake: 'Writing √3 instead of √3/2.', tip: 'cos 30° = √3/2.' },
    { q: `Write down the exact value of tan 30°.`, c: '1/√3', w: ['√3', '1', '1/2'], s: ['tan 30° = sin 30° / cos 30° = (1/2)/(√3/2) = 1/√3'], h: ['tan = sin / cos'], mistake: 'Inverting to √3 (that is tan 60°).', tip: 'tan 30° = 1/√3 = √3/3; tan 60° = √3.' },
    { q: `Write down the exact value of cos 0°.`, c: '1', w: ['0', '1/2', '√3/2'], s: ['cos 0° = 1'], h: ['At 0° adjacent = hypotenuse'], mistake: 'Confusing cos 0° with sin 0°.', tip: 'cos 0° = 1, sin 0° = 0.' },
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
//  Age 16 (Systems) expansion — bring every topic up to 8 distinct levels.
// ═══════════════════════════════════════════════════════════════════════════

function factorial(n: number): number { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function comb(n: number, r: number): number { return factorial(n) / (factorial(r) * factorial(n - r)); }
function perm(n: number, r: number): number { return factorial(n) / factorial(n - r); }

// ── age16-trig2 L6 — Graphs of Trig Functions ────────────────────────────────
function genTrigGraphProps(): Problem {
  const a = randInt(2, 5), b = [1, 2, 3, 4][randInt(0, 3)], c = randInt(0, 3);
  const period = 360 / b;
  const askPeriod = Math.random() < 0.5;
  const cStr = c ? ` + ${c}` : '';
  const correct = askPeriod ? `${period}°` : `${a}`;
  return {
    id: uid(),
    question: `For the graph y = ${a} sin(${b}x)${cStr}, find the ${askPeriod ? 'period' : 'amplitude'}.`,
    correctAnswer: correct,
    options: askPeriod
      ? makeOptions(`${period}°`, [`360°`, `${period * 2}°`, `${a}°`])
      : makeOptions(`${a}`, [`${a + c}`, `${period}`, `${2 * a}`]),
    marks: 2,
    workingSteps: askPeriod
      ? [`Period = 360° ÷ b`, `= 360° ÷ ${b} = ${period}°`]
      : [`Amplitude = |a| = the number in front of sin`, `Amplitude = ${a}`],
    hints: askPeriod ? [`Period = 360° / b`] : [`Amplitude is the coefficient of sin`],
    calculatorAllowed: false,
    commonMistake: `Confusing amplitude (a) with period (360/b) — they come from different parts of the equation.`,
    examTip: `For y = a sin(bx) + c: amplitude = a, period = 360/b, vertical shift = c.`,
  };
}

// ── age16-trig2 L7 — Solving in an Interval ───────────────────────────────────
function genSolveTrigInterval(): Problem {
  return fromCases([
    { q: `Solve sin x = 0.5 for 0° ≤ x ≤ 360°.`, c: 'x = 30° and 150°', w: ['x = 30° only', 'x = 30° and 330°', 'x = 60° and 120°'], s: ['Basic angle: sin⁻¹(0.5) = 30°', 'sin is positive in quadrants 1 and 2', 'x = 30° and 180° − 30° = 150°'], h: ['Find the basic angle first', 'sin positive → quadrants 1 and 2'], mistake: 'Giving only the first solution — there are TWO in 0°–360°.', tip: 'Always check all quadrants for the given range.' },
    { q: `Solve cos x = 0.5 for 0° ≤ x ≤ 360°.`, c: 'x = 60° and 300°', w: ['x = 60° and 120°', 'x = 60° only', 'x = 30° and 330°'], s: ['Basic angle: cos⁻¹(0.5) = 60°', 'cos is positive in quadrants 1 and 4', 'x = 60° and 360° − 60° = 300°'], h: ['cos positive → quadrants 1 and 4'], mistake: 'Using the sine quadrants for a cosine equation.', tip: 'cos positive → 1st and 4th quadrants.' },
    { q: `Solve tan x = 1 for 0° ≤ x ≤ 360°.`, c: 'x = 45° and 225°', w: ['x = 45° only', 'x = 45° and 135°', 'x = 135° and 315°'], s: ['Basic angle: tan⁻¹(1) = 45°', 'tan is positive in quadrants 1 and 3', 'x = 45° and 180° + 45° = 225°'], h: ['tan repeats every 180°'], mistake: 'Forgetting the 3rd-quadrant solution at 225°.', tip: 'tan positive → quadrants 1 and 3 (180° apart).' },
    { q: `Solve sin x = 1 for 0° ≤ x ≤ 360°.`, c: 'x = 90°', w: ['x = 90° and 270°', 'x = 0° and 180°', 'x = 180°'], s: ['sin x = 1 at the maximum', 'Only x = 90° in this range'], h: ['Where is sin at its maximum?'], mistake: 'Adding a second solution — the maximum occurs once.', tip: 'sin = 1 only at 90°; sin = −1 only at 270°.' },
  ]);
}

// ── age16-trig2 L8 — Reciprocal Trig Ratios ──────────────────────────────────
function genReciprocalRatios(): Problem {
  return fromCases([
    { q: `Express sec θ in terms of cos θ.`, c: 'sec θ = 1/cos θ', w: ['sec θ = cos θ', 'sec θ = 1/sin θ', 'sec θ = sin θ/cos θ'], s: ['sec is the reciprocal of cos', 'sec θ = 1/cos θ'], h: ['sec ↔ cos'], mistake: 'Pairing sec with sin instead of cos.', tip: 'sec–cos, cosec–sin, cot–tan.' },
    { q: `Express cosec θ in terms of sin θ.`, c: 'cosec θ = 1/sin θ', w: ['cosec θ = sin θ', 'cosec θ = 1/cos θ', 'cosec θ = cos θ/sin θ'], s: ['cosec is the reciprocal of sin', 'cosec θ = 1/sin θ'], h: ['cosec ↔ sin'], mistake: 'Pairing cosec with cos.', tip: 'cosec–sin (both have the same second letter idea).' },
    { q: `If cos θ = 1/2, find sec θ.`, c: '2', w: ['1/2', '−2', '4'], s: ['sec θ = 1/cos θ', '= 1 ÷ (1/2) = 2'], h: ['Take the reciprocal of cos θ'], mistake: 'Leaving the answer as 1/2.', tip: 'sec = 1/cos → flip the fraction.' },
    { q: `If sin θ = 1/3, find cosec θ.`, c: '3', w: ['1/3', '−3', '9'], s: ['cosec θ = 1/sin θ', '= 1 ÷ (1/3) = 3'], h: ['Take the reciprocal of sin θ'], mistake: 'Leaving the answer as 1/3.', tip: 'cosec = 1/sin → flip the fraction.' },
    { q: `Express cot θ in terms of tan θ.`, c: 'cot θ = 1/tan θ', w: ['cot θ = tan θ', 'cot θ = sin θ/cos θ', 'cot θ = 1/sin θ'], s: ['cot is the reciprocal of tan', 'cot θ = 1/tan θ = cos θ/sin θ'], h: ['cot ↔ tan'], mistake: 'Writing cot = sin/cos (that is tan).', tip: 'cot = cos/sin = 1/tan.' },
  ]);
}

// ── age16-calculus L6 — Gradient at a Point ──────────────────────────────────
function genGradientAtPoint(): Problem {
  const a = randInt(1, 4), b = randInt(1, 6), c = randInt(0, 5), p = randInt(1, 5);
  const grad = 2 * a * p + b;
  return {
    id: uid(),
    question: `Find the gradient of the curve y = ${a}x² + ${b}x + ${c} at the point where x = ${p}.`,
    correctAnswer: `${grad}`,
    options: makeOptions(`${grad}`, [`${a * p * p + b * p + c}`, `${2 * a * p}`, `${grad + a}`]),
    marks: 3,
    workingSteps: [`dy/dx = ${2 * a}x + ${b}`, `At x = ${p}: ${2 * a}×${p} + ${b} = ${grad}`],
    hints: [`Differentiate first, then substitute x = ${p}`, `d/dx(axⁿ) = anxⁿ⁻¹`],
    calculatorAllowed: false,
    commonMistake: `Substituting into y instead of dy/dx — the gradient comes from the DERIVATIVE.`,
    examTip: `Gradient of a curve = value of dy/dx at that point. Differentiate, then substitute.`,
  };
}

// ── age16-calculus L7 — Equation of the Normal ───────────────────────────────
function genNormalLine(): Problem {
  const m = randInt(2, 5);
  const correct = `−1/${m}`;
  return {
    id: uid(),
    question: `The tangent to a curve at point P has gradient ${m}.\n\nFind the gradient of the normal at P.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${m}`, `1/${m}`, `−${m}`]),
    marks: 2,
    workingSteps: [`Normal ⟂ tangent`, `Normal gradient = −1 ÷ (tangent gradient)`, `= −1/${m}`],
    hints: [`The normal is perpendicular to the tangent`, `Perpendicular gradients multiply to −1`],
    calculatorAllowed: false,
    commonMistake: `Using the same gradient ${m} — the normal is PERPENDICULAR, so use −1/m.`,
    examTip: `Perpendicular gradient = negative reciprocal: m → −1/m.`,
  };
}

// ── age16-calculus L8 — Rates of Change (Kinematics) ─────────────────────────
function genRateOfChange(): Problem {
  const a = randInt(1, 3), b = randInt(1, 6), p = randInt(1, 5);
  const v = 2 * a * p + b;
  return {
    id: uid(),
    question: `A particle has displacement s = ${a}t² + ${b}t metres at time t seconds.\n\nFind its velocity at t = ${p} s.`,
    correctAnswer: `${v} m/s`,
    options: makeOptions(`${v} m/s`, [`${a * p * p + b * p} m/s`, `${2 * a * p} m/s`, `${v + b} m/s`]),
    marks: 3,
    workingSteps: [`Velocity v = ds/dt = ${2 * a}t + ${b}`, `At t = ${p}: ${2 * a}×${p} + ${b} = ${v} m/s`],
    hints: [`Velocity is the rate of change of displacement: v = ds/dt`, `Differentiate s, then substitute t`],
    calculatorAllowed: false,
    commonMistake: `Substituting into s (giving displacement) instead of differentiating to get velocity first.`,
    examTip: `v = ds/dt (differentiate once); acceleration a = dv/dt (differentiate again).`,
  };
}

// ── age16-exponential L4 — Properties of Exp Graphs ──────────────────────────
function genExpGraphProps(): Problem {
  return fromCases([
    { q: `State the y-intercept of y = 3 × 2ˣ.`, c: '3', w: ['1', '2', '6'], s: ['At x = 0, 2⁰ = 1', 'y = 3 × 1 = 3'], h: ['Substitute x = 0', 'Any base to the power 0 is 1'], mistake: 'Forgetting that 2⁰ = 1, not 0.', tip: 'For y = a·bˣ, the y-intercept is a.' },
    { q: `State the horizontal asymptote of y = 2ˣ.`, c: 'y = 0', w: ['y = 1', 'y = 2', 'x = 0'], s: ['As x → −∞, 2ˣ → 0', 'Asymptote: y = 0'], h: ['What does 2ˣ approach for very negative x?'], mistake: 'Giving x = 0 (a vertical line) instead of y = 0.', tip: 'y = bˣ has asymptote y = 0 (the x-axis).' },
    { q: `State the horizontal asymptote of y = 2ˣ + 4.`, c: 'y = 4', w: ['y = 0', 'y = 2', 'y = 5'], s: ['2ˣ → 0, so y → 0 + 4', 'Asymptote: y = 4'], h: ['The + 4 shifts the whole graph up 4'], mistake: 'Ignoring the + 4 shift.', tip: 'y = bˣ + c has asymptote y = c.' },
    { q: `Find y when x = 0 for y = 5 × 3ˣ.`, c: '5', w: ['15', '1', '3'], s: ['3⁰ = 1', 'y = 5 × 1 = 5'], h: ['Substitute x = 0'], mistake: 'Multiplying 5 × 3 = 15 (treating 3⁰ as 3).', tip: 'b⁰ = 1 for any base b.' },
  ]);
}

// ── age16-exponential L5 — Exponential Growth ────────────────────────────────
function genPopulationGrowth(): Problem {
  const P0 = [100, 200, 500][randInt(0, 2)];
  const factor = [2, 3][randInt(0, 1)];
  const t = randInt(2, 3);
  const P = P0 * Math.pow(factor, t);
  return {
    id: uid(),
    question: `A population starts at ${P0} and ${factor === 2 ? 'doubles' : 'triples'} every year.\n\nFind the population after ${t} years.`,
    correctAnswer: `${P}`,
    options: makeOptions(`${P}`, [`${P0 * factor * t}`, `${P0 * Math.pow(factor, t + 1)}`, `${P / factor}`]),
    marks: 3,
    workingSteps: [`P = ${P0} × ${factor}^t`, `P = ${P0} × ${factor}^${t} = ${P0} × ${Math.pow(factor, t)} = ${P}`],
    hints: [`Each year multiplies by ${factor}`, `P = P₀ × ${factor}^t`],
    calculatorAllowed: true,
    commonMistake: `Multiplying by ${factor}×${t} instead of raising to the power ${t} — growth is exponential, not linear.`,
    examTip: `Repeated multiplication = a power. After t years, multiply by ${factor}^t.`,
  };
}

// ── age16-exponential L6 — Exponential Decay & Half-Life ──────────────────────
function genHalfLife(): Problem {
  const A0 = [800, 1000, 1600, 2000][randInt(0, 3)];
  const n = randInt(2, 3);
  const A = A0 / Math.pow(2, n);
  return {
    id: uid(),
    question: `A radioactive sample of ${A0} g halves every hour.\n\nFind the mass remaining after ${n} hours.`,
    correctAnswer: `${A} g`,
    options: makeOptions(`${A} g`, [`${A0 / 2} g`, `${Math.round(A0 / Math.pow(2, n + 1))} g`, `${A0 - 100 * n} g`]),
    marks: 3,
    workingSteps: [`A = ${A0} × (1/2)^n`, `A = ${A0} × (1/2)^${n} = ${A0} ÷ ${Math.pow(2, n)} = ${A} g`],
    hints: [`Halving means × (1/2) each hour`, `A = A₀ × (1/2)^t`],
    calculatorAllowed: true,
    commonMistake: `Subtracting half each time linearly instead of multiplying by 1/2 repeatedly.`,
    examTip: `Decay is exponential: after n half-lives, divide the start by 2ⁿ.`,
  };
}

// ── age16-exponential L7 — Exponential ↔ Log Form ────────────────────────────
function genExpToLogForm(): Problem {
  return fromCases([
    { q: `Write 2³ = 8 in logarithm form.`, c: 'log₂8 = 3', w: ['log₃8 = 2', 'log₈2 = 3', 'log₂3 = 8'], s: ['bˣ = y ⟺ log_b(y) = x', '2³ = 8 → log₂8 = 3'], h: ['The base stays the base', 'The exponent becomes the answer'], mistake: 'Swapping the base and the result.', tip: 'bˣ = y means log_b y = x.' },
    { q: `Write 10² = 100 in logarithm form.`, c: 'log₁₀100 = 2', w: ['log₂100 = 10', 'log₁₀₀10 = 2', 'log₁₀2 = 100'], s: ['10² = 100 → log₁₀100 = 2'], h: ['Base 10 stays the base'], mistake: 'Putting 100 as the base.', tip: 'The base of the power = base of the log.' },
    { q: `Write log₃9 = 2 in index (power) form.`, c: '3² = 9', w: ['2³ = 9', '9² = 3', '3⁹ = 2'], s: ['log_b(y) = x ⟺ bˣ = y', 'log₃9 = 2 → 3² = 9'], h: ['The base of the log becomes the base of the power'], mistake: 'Swapping which number is the exponent.', tip: 'log_b y = x means bˣ = y.' },
    { q: `Write 5² = 25 in logarithm form.`, c: 'log₅25 = 2', w: ['log₂25 = 5', 'log₂₅5 = 2', 'log₅2 = 25'], s: ['5² = 25 → log₅25 = 2'], h: ['Base 5 stays the base'], mistake: 'Confusing the base with the result.', tip: 'bˣ = y → log_b y = x.' },
  ]);
}

// ── age16-exponential L8 — Doubling / Scaling Time ───────────────────────────
function genDoublingTime(): Problem {
  return fromCases([
    { q: `A quantity doubles each year. After how many years is it 8 times the start?`, c: '3 years', w: ['4 years', '8 years', '2 years'], s: ['Each year × 2', '2ⁿ = 8 → 2³ = 8', 'n = 3 years'], h: ['Find n where 2ⁿ = 8'], mistake: 'Saying 8 years (multiplying instead of using the power).', tip: '2ⁿ = 8 → n = 3 since 2³ = 8.' },
    { q: `A quantity triples each year. After how many years is it 27 times the start?`, c: '3 years', w: ['9 years', '27 years', '2 years'], s: ['3ⁿ = 27 → 3³ = 27', 'n = 3 years'], h: ['Find n where 3ⁿ = 27'], mistake: 'Saying 9 years.', tip: '3ⁿ = 27 → n = 3 since 3³ = 27.' },
    { q: `A quantity doubles each year. After how many years is it 16 times the start?`, c: '4 years', w: ['8 years', '16 years', '5 years'], s: ['2ⁿ = 16 → 2⁴ = 16', 'n = 4 years'], h: ['Find n where 2ⁿ = 16'], mistake: 'Saying 8 years.', tip: '2⁴ = 16 → n = 4.' },
    { q: `A quantity doubles each year. After how many years is it 4 times the start?`, c: '2 years', w: ['4 years', '1 year', '3 years'], s: ['2ⁿ = 4 → 2² = 4', 'n = 2 years'], h: ['Find n where 2ⁿ = 4'], mistake: 'Saying 4 years.', tip: '2² = 4 → n = 2.' },
  ]);
}

// ── age16-algebra3 L6 — Solving Cubics by Factor Theorem ─────────────────────
function genSolveCubicFactor(): Problem {
  return fromCases([
    { q: `Solve x³ − 6x² + 11x − 6 = 0.`, c: 'x = 1, 2, 3', w: ['x = −1, −2, −3', 'x = 1, 2, 6', 'x = 0, 2, 3'], s: ['Try x = 1: 1 − 6 + 11 − 6 = 0 ✓, so (x − 1) is a factor', 'Factorise: (x − 1)(x − 2)(x − 3) = 0', 'x = 1, 2, 3'], h: ['Test small factors of 6 (1, 2, 3, 6)', 'Use the factor theorem'], mistake: 'Giving the roots as negative — (x − 1) = 0 gives x = +1.', tip: 'Roots of (x − a) factors are POSITIVE a.' },
    { q: `Given (x − 1) is a factor of x³ − 2x² − x + 2, find ALL roots.`, c: 'x = 1, 2, −1', w: ['x = 1, −2, 1', 'x = 1, 2, 1', 'x = −1, −2, 1'], s: ['Divide: x³ − 2x² − x + 2 = (x − 1)(x² − x − 2)', 'Factorise: (x − 1)(x − 2)(x + 1)', 'x = 1, 2, −1'], h: ['Divide out (x − 1) first', 'Then factorise the quadratic'], mistake: 'Stopping after finding one root.', tip: 'After dividing out one factor, solve the remaining quadratic.' },
    { q: `Factorise fully: x³ − x.`, c: 'x(x − 1)(x + 1)', w: ['x(x² − 1)', 'x(x − 1)²', '(x − 1)(x + 1)'], s: ['Common factor x: x(x² − 1)', 'Difference of squares: x(x − 1)(x + 1)'], h: ['Take out x first', 'x² − 1 is a difference of two squares'], mistake: 'Leaving it as x(x² − 1) — not fully factorised.', tip: 'Always check for a difference of squares after taking out common factors.' },
    { q: `Solve x³ + 2x² − 5x − 6 = 0.`, c: 'x = 2, −1, −3', w: ['x = −2, 1, 3', 'x = 2, 1, 3', 'x = 2, −1, 3'], s: ['Try x = 2: 8 + 8 − 10 − 6 = 0 ✓', 'Factorise: (x − 2)(x + 1)(x + 3) = 0', 'x = 2, −1, −3'], h: ['Test factors of 6', 'Use the factor theorem'], mistake: 'Sign errors when reading roots from factors.', tip: '(x + 1) → x = −1, (x − 2) → x = 2.' },
  ]);
}

// ── age16-algebra3 L7 — Binomial Coefficients ────────────────────────────────
function genBinomialCoefficient16(): Problem {
  const n = randInt(4, 6);
  const r = randInt(2, n - 1);
  const coeff = comb(n, r);
  return {
    id: uid(),
    question: `Find the coefficient of x^${r} in the expansion of (1 + x)^${n}.`,
    correctAnswer: `${coeff}`,
    options: makeOptions(`${coeff}`, [`${comb(n, r - 1)}`, `${comb(n, r + 1) || n}`, `${n * r}`]),
    marks: 3,
    workingSteps: [`Coefficient of xʳ in (1 + x)ⁿ is ⁿCᵣ`, `⁞${n}C${r} = ${n}! / (${r}! × ${n - r}!) = ${coeff}`],
    hints: [`Use ⁿCᵣ = n! / (r!(n−r)!)`, `n = ${n}, r = ${r}`],
    calculatorAllowed: true,
    commonMistake: `Using nPr (order matters) instead of nCr — binomial coefficients are combinations.`,
    examTip: `The coefficient of xʳ in (1 + x)ⁿ is exactly ⁿCᵣ.`,
  };
}

// ── age16-algebra3 L8 — Solving Log Equations ────────────────────────────────
function genLogEquationSolve(): Problem {
  const a = randInt(2, 4), b = randInt(2, 3);
  const x = Math.pow(a, b);
  return {
    id: uid(),
    question: `Solve for x:  log${a === 2 ? '₂' : a === 3 ? '₃' : '₄'}(x) = ${b}`,
    correctAnswer: `x = ${x}`,
    options: makeOptions(`x = ${x}`, [`x = ${a * b}`, `x = ${a + b}`, `x = ${x + a}`]),
    marks: 3,
    workingSteps: [`log_a(x) = b means aᵇ = x`, `x = ${a}^${b} = ${x}`],
    hints: [`Rewrite in index form: aᵇ = x`, `a = ${a}, b = ${b}`],
    calculatorAllowed: false,
    commonMistake: `Computing ${a} × ${b} instead of ${a}^${b} — the log undoes a POWER.`,
    examTip: `log_a(x) = b ⟺ x = aᵇ. Convert to index form first.`,
  };
}

// ── age16-functions2 L5 — Domain & Range (restrictions) ──────────────────────
function genDomainRange16(): Problem {
  return fromCases([
    { q: `f(x) = 2/(x − 3). Which value is excluded from the domain?`, c: 'x = 3', w: ['x = 0', 'x = −3', 'x = 2'], s: ['Denominator ≠ 0', 'x − 3 = 0 → x = 3', 'Exclude x = 3'], h: ['Set the denominator ≠ 0'], mistake: 'Excluding x = 0 instead of x = 3.', tip: 'For a/(x − k), exclude x = k.' },
    { q: `State the domain of f(x) = √(2x − 6).`, c: 'x ≥ 3', w: ['x ≥ 6', 'x ≥ 0', 'x ≤ 3'], s: ['Inside √ must be ≥ 0', '2x − 6 ≥ 0 → 2x ≥ 6 → x ≥ 3'], h: ['Set the inside of √ ≥ 0', 'Solve the inequality'], mistake: 'Stopping at 2x ≥ 6 without dividing by 2.', tip: 'Solve the inequality fully: x ≥ 3.' },
    { q: `f(x) = x² − 4 with x ≥ 0. State the range.`, c: 'f(x) ≥ −4', w: ['f(x) ≥ 0', 'f(x) ≥ 4', 'f(x) ≤ −4'], s: ['Minimum of x² − 4 is at x = 0', 'f(0) = −4', 'Range: f(x) ≥ −4'], h: ['Find the minimum value'], mistake: 'Reading the range as ≥ 0.', tip: 'The constant sets the minimum here: −4.' },
    { q: `f(x) = 3/(x + 1). Which value is excluded from the domain?`, c: 'x = −1', w: ['x = 1', 'x = 0', 'x = −3'], s: ['Denominator ≠ 0', 'x + 1 = 0 → x = −1'], h: ['Set the denominator ≠ 0'], mistake: 'Giving x = 1 instead of x = −1.', tip: 'For a/(x + 1), exclude x = −1.' },
  ]);
}

// ── age16-functions2 L6 — Composite Function Expressions ─────────────────────
function genCompositeExpr(): Problem {
  const m = randInt(2, 4), k = randInt(1, 5);
  const correct = `${m}x² + ${k}`;
  return {
    id: uid(),
    question: `f(x) = ${m}x + ${k} and g(x) = x².\n\nFind fg(x).`,
    correctAnswer: correct,
    options: makeOptions(correct, [`(${m}x + ${k})²`, `${m}x + ${k}`, `${m * m}x² + ${k}`]),
    marks: 3,
    workingSteps: [`fg(x) = f(g(x)) = f(x²)`, `Substitute x² into f: ${m}(x²) + ${k}`, `= ${m}x² + ${k}`],
    hints: [`fg(x) means f(g(x)) — inner function g first`, `Put x² wherever x appears in f`],
    calculatorAllowed: false,
    commonMistake: `Computing gf(x) = (${m}x + ${k})² instead of fg(x) — order matters.`,
    examTip: `fg(x) = f(g(x)): substitute the WHOLE of g into f.`,
  };
}

// ── age16-functions2 L7 — Self-Inverse Functions ─────────────────────────────
function genSelfInverse(): Problem {
  return fromCases([
    { q: `f(x) = 1/x. Find f⁻¹(x).`, c: 'f⁻¹(x) = 1/x', w: ['f⁻¹(x) = x', 'f⁻¹(x) = −1/x', 'f⁻¹(x) = x − 1'], s: ['Let y = 1/x, swap: x = 1/y', 'Solve: y = 1/x', 'f is self-inverse'], h: ['Swap x and y, then solve for y'], mistake: 'Thinking the inverse must look different.', tip: 'f(x) = 1/x is its own inverse (self-inverse).' },
    { q: `f(x) = 6 − x. Find f⁻¹(x).`, c: 'f⁻¹(x) = 6 − x', w: ['f⁻¹(x) = x − 6', 'f⁻¹(x) = 6 + x', 'f⁻¹(x) = x/6'], s: ['Let y = 6 − x, swap: x = 6 − y', 'Solve: y = 6 − x', 'Self-inverse'], h: ['Swap x and y, then solve'], mistake: 'Writing x − 6 (sign error).', tip: 'f(x) = a − x is always self-inverse.' },
    { q: `f(x) = −x. Find f⁻¹(x).`, c: 'f⁻¹(x) = −x', w: ['f⁻¹(x) = x', 'f⁻¹(x) = 1/x', 'f⁻¹(x) = −1/x'], s: ['Let y = −x, swap: x = −y', 'Solve: y = −x', 'Self-inverse'], h: ['Swap x and y'], mistake: 'Giving x instead of −x.', tip: 'f(x) = −x maps to itself when inverted.' },
  ]);
}

// ── age16-functions2 L8 — Piecewise Functions ────────────────────────────────
function genPiecewiseFunc(): Problem {
  return fromCases([
    { q: `f(x) = 2x for x < 2,  x + 3 for x ≥ 2.\n\nFind f(5).`, c: '8', w: ['10', '7', '13'], s: ['5 ≥ 2 → use x + 3', 'f(5) = 5 + 3 = 8'], h: ['Check which condition 5 satisfies', '5 ≥ 2 → second rule'], mistake: 'Using 2x (the wrong piece) to get 10.', tip: 'Pick the rule whose condition the input meets.' },
    { q: `f(x) = 2x for x < 2,  x + 3 for x ≥ 2.\n\nFind f(1).`, c: '2', w: ['4', '5', '1'], s: ['1 < 2 → use 2x', 'f(1) = 2 × 1 = 2'], h: ['1 < 2 → first rule'], mistake: 'Using x + 3 to get 4.', tip: 'Check the condition before substituting.' },
    { q: `f(x) = x² for x ≤ 0,  3x for x > 0.\n\nFind f(4).`, c: '12', w: ['16', '7', '64'], s: ['4 > 0 → use 3x', 'f(4) = 3 × 4 = 12'], h: ['4 > 0 → second rule'], mistake: 'Using x² to get 16.', tip: 'Match the input to the correct interval first.' },
    { q: `f(x) = x² for x ≤ 0,  3x for x > 0.\n\nFind f(−2).`, c: '4', w: ['−6', '6', '−4'], s: ['−2 ≤ 0 → use x²', 'f(−2) = (−2)² = 4'], h: ['−2 ≤ 0 → first rule', '(−2)² = 4'], mistake: 'Using 3x to get −6.', tip: 'Negative input here → use the x² rule.' },
  ]);
}

// ── age16-analytical-geo L5 — Midpoint & Distance ────────────────────────────
function genMidpointDistance(): Problem {
  const x1 = randInt(0, 8), x2 = x1 + 2 * randInt(1, 4);
  const y1 = randInt(0, 8), y2 = y1 + 2 * randInt(1, 4);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const correct = `(${mx}, ${my})`;
  return {
    id: uid(),
    question: `Find the midpoint of A(${x1}, ${y1}) and B(${x2}, ${y2}).`,
    correctAnswer: correct,
    options: makeOptions(correct, [`(${x2 - x1}, ${y2 - y1})`, `(${x1 + x2}, ${y1 + y2})`, `(${mx + 1}, ${my})`]),
    marks: 2,
    workingSteps: [`Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2)`, `= ((${x1} + ${x2})/2, (${y1} + ${y2})/2) = (${mx}, ${my})`],
    hints: [`Average the x-coordinates and the y-coordinates`],
    calculatorAllowed: false,
    commonMistake: `Subtracting the coordinates (that gives the displacement, not the midpoint).`,
    examTip: `Midpoint = the AVERAGE of the endpoints.`,
  };
}

// ── age16-analytical-geo L6 — Parallel Lines ─────────────────────────────────
function genParallelLine(): Problem {
  const m = randInt(2, 4), px = randInt(1, 4), py = randInt(1, 8), oldC = randInt(1, 5);
  const newC = py - m * px;
  const cStr = newC >= 0 ? `+ ${newC}` : `− ${-newC}`;
  const oldCStr = `+ ${oldC}`;
  const correct = `y = ${m}x ${cStr}`;
  return {
    id: uid(),
    question: `Find the equation of the line parallel to y = ${m}x ${oldCStr} that passes through (${px}, ${py}).`,
    correctAnswer: correct,
    options: makeOptions(correct, [`y = ${m}x ${oldCStr}`, `y = ${-m}x ${cStr}`, `y = ${m}x ${newC + 1 >= 0 ? `+ ${newC + 1}` : `− ${-(newC + 1)}`}`]),
    marks: 3,
    workingSteps: [`Parallel lines have the SAME gradient: m = ${m}`, `y = ${m}x + c through (${px}, ${py}): ${py} = ${m}×${px} + c`, `c = ${py} − ${m * px} = ${newC}`, `Equation: ${correct}`],
    hints: [`Parallel → same gradient`, `Substitute the point to find c`],
    calculatorAllowed: false,
    commonMistake: `Changing the gradient — parallel lines keep the SAME gradient, only c changes.`,
    examTip: `Parallel: keep m, recompute c from the given point.`,
  };
}

// ── age16-analytical-geo L7 — Circle: Centre & Radius ────────────────────────
function genCircleCentreRadius(): Problem {
  const a = randInt(-4, 4), b = randInt(-4, 4), r = randInt(2, 6);
  const aStr = a >= 0 ? `− ${a}` : `+ ${-a}`;
  const bStr = b >= 0 ? `− ${b}` : `+ ${-b}`;
  const correct = `Centre (${a}, ${b}), r = ${r}`;
  return {
    id: uid(),
    question: `State the centre and radius of the circle:\n(x ${aStr})² + (y ${bStr})² = ${r * r}`,
    correctAnswer: correct,
    options: makeOptions(correct, [`Centre (${a}, ${b}), r = ${r * r}`, `Centre (${-a}, ${-b}), r = ${r}`, `Centre (${b}, ${a}), r = ${r}`]),
    marks: 3,
    workingSteps: [`Compare with (x − a)² + (y − b)² = r²`, `Centre = (${a}, ${b})`, `r² = ${r * r} → r = ${r}`],
    hints: [`Centre is (a, b) from (x − a)² + (y − b)²`, `Radius = √(right-hand side)`],
    calculatorAllowed: false,
    commonMistake: `Giving the radius as ${r * r} — that is r², so take the square root.`,
    examTip: `(x − a)² + (y − b)² = r²: centre (a, b), radius √(RHS).`,
  };
}

// ── age16-analytical-geo L8 — Tangent Length ─────────────────────────────────
function genTangentLength(): Problem {
  const triples = [[5, 3, 4], [13, 5, 12], [10, 6, 8], [17, 8, 15], [25, 7, 24]];
  const [d, r, t] = triples[randInt(0, triples.length - 1)];
  return {
    id: uid(),
    question: `A tangent is drawn from point P to a circle of radius ${r}. P is ${d} units from the centre.\n\nFind the length of the tangent.`,
    correctAnswer: `${t}`,
    options: makeOptions(`${t}`, [`${d - r}`, `${d + r}`, `${Math.round(Math.sqrt(d * d + r * r))}`]),
    marks: 3,
    workingSteps: [`Tangent ⟂ radius, so use Pythagoras`, `tangent² = d² − r² = ${d * d} − ${r * r} = ${t * t}`, `tangent = √${t * t} = ${t}`],
    hints: [`The radius meets the tangent at 90°`, `tangent² + r² = d²`],
    calculatorAllowed: true,
    commonMistake: `Subtracting d − r instead of using Pythagoras (√(d² − r²)).`,
    examTip: `Radius ⟂ tangent → right triangle: tangent = √(d² − r²).`,
  };
}

// ── age16-stats2 L5 — Probability Distributions ──────────────────────────────
function genProbDistribution(): Problem {
  const den = [10, 8, 12][randInt(0, 2)];
  const a = randInt(1, 3), b = randInt(1, 3), c = randInt(1, 2);
  const missing = den - a - b - c;
  const correct = simplify(missing, den);
  return {
    id: uid(),
    question: `A discrete random variable X has probabilities:\nP = ${a}/${den}, ${b}/${den}, ${c}/${den}, k.\n\nFind k (the probabilities must sum to 1).`,
    correctAnswer: correct,
    options: makeOptions(correct, [simplify(a + b + c, den), `${missing}/${den + 1}`, simplify(missing + 1, den)]),
    marks: 3,
    workingSteps: [`All probabilities sum to 1`, `k = 1 − (${a} + ${b} + ${c})/${den} = ${missing}/${den}`, `= ${correct}`],
    hints: [`ΣP(X) = 1`, `k = 1 − (sum of the others)`],
    calculatorAllowed: false,
    commonMistake: `Forgetting that all probabilities must total exactly 1.`,
    examTip: `For any distribution, the probabilities sum to 1 — use this to find a missing value.`,
  };
}

// ── age16-stats2 L6 — Combinations ───────────────────────────────────────────
function genCombinations(): Problem {
  const n = randInt(5, 8), r = randInt(2, 4);
  const val = comb(n, r);
  return {
    id: uid(),
    question: `In how many ways can a team of ${r} be chosen from ${n} people?\n(Order does not matter.)`,
    correctAnswer: `${val}`,
    options: makeOptions(`${val}`, [`${perm(n, r)}`, `${comb(n, r - 1)}`, `${n * r}`]),
    marks: 3,
    workingSteps: [`Order does not matter → combinations`, `ⁿCᵣ = ${n}! / (${r}! × ${n - r}!) = ${val}`],
    hints: [`Choosing (not arranging) → use ⁿCᵣ`, `ⁿCᵣ = n!/(r!(n−r)!)`],
    calculatorAllowed: true,
    commonMistake: `Using ⁿPᵣ (which counts order) — a team is a SELECTION, so use ⁿCᵣ.`,
    examTip: `"Choose" / "select" → combinations ⁿCᵣ. "Arrange" / "order" → permutations ⁿPᵣ.`,
  };
}

// ── age16-stats2 L7 — Permutations ───────────────────────────────────────────
function genPermutations(): Problem {
  const n = randInt(4, 6), r = randInt(2, 3);
  const val = perm(n, r);
  return {
    id: uid(),
    question: `In how many ways can ${r} people be arranged in a line, chosen from ${n}?\n(Order matters.)`,
    correctAnswer: `${val}`,
    options: makeOptions(`${val}`, [`${comb(n, r)}`, `${Math.pow(n, r)}`, `${n * r}`]),
    marks: 3,
    workingSteps: [`Order matters → permutations`, `ⁿPᵣ = ${n}! / ${n - r}! = ${val}`],
    hints: [`Arranging in order → use ⁿPᵣ`, `ⁿPᵣ = n!/(n−r)!`],
    calculatorAllowed: true,
    commonMistake: `Using ⁿCᵣ — when ORDER matters, use permutations ⁿPᵣ (always larger).`,
    examTip: `"Arrange" / "in a line" / "order" → permutations ⁿPᵣ.`,
  };
}

// ── age16-stats2 L8 — Fundamental Counting Principle ─────────────────────────
function genCountingPrinciple(): Problem {
  const m = randInt(3, 6), n = randInt(3, 6);
  return {
    id: uid(),
    question: `A menu has ${m} starters and ${n} main courses.\n\nHow many different two-course meals are possible?`,
    correctAnswer: `${m * n}`,
    options: makeOptions(`${m * n}`, [`${m + n}`, `${m * n + m}`, `${Math.max(m, n)}`]),
    marks: 2,
    workingSteps: [`Counting principle: multiply the choices`, `${m} × ${n} = ${m * n}`],
    hints: [`For independent stages, MULTIPLY the number of options`],
    calculatorAllowed: false,
    commonMistake: `Adding ${m} + ${n} instead of multiplying — each starter pairs with EVERY main.`,
    examTip: `Independent choices "AND" → multiply. (m ways) × (n ways) = m×n total.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
//  Age 17 (Thinkers) expansion — bring every topic up to 8 distinct levels.
// ═══════════════════════════════════════════════════════════════════════════

// ── age17-diff L6 — Quotient Rule ────────────────────────────────────────────
function genQuotientRule(): Problem {
  return fromCases([
    { q: `Differentiate y = x/(x + 1) using the quotient rule.`, c: '1/(x + 1)²', w: ['x/(x + 1)²', '−1/(x + 1)²', '1/(x + 1)'], s: ['u = x, u′ = 1; v = x + 1, v′ = 1', '(u′v − uv′)/v² = ((x+1) − x)/(x+1)²', '= 1/(x + 1)²'], h: ['Quotient rule: (u′v − uv′)/v²'], mistake: 'Forgetting to square the denominator.', tip: 'Quotient rule: (u′v − uv′) / v².' },
    { q: `Differentiate y = (x + 2)/x using the quotient rule.`, c: '−2/x²', w: ['2/x²', '1/x²', '−2/x'], s: ['u = x + 2, u′ = 1; v = x, v′ = 1', '(1·x − (x+2)·1)/x² = (x − x − 2)/x²', '= −2/x²'], h: ['(u′v − uv′)/v²'], mistake: 'Sign error in the numerator.', tip: 'Expand the numerator carefully before simplifying.' },
    { q: `Differentiate y = x/(x − 3) using the quotient rule.`, c: '−3/(x − 3)²', w: ['3/(x − 3)²', '1/(x − 3)²', '−3/(x − 3)'], s: ['u = x, u′ = 1; v = x − 3, v′ = 1', '((x−3) − x)/(x−3)² = −3/(x−3)²'], h: ['(u′v − uv′)/v²'], mistake: 'Dropping the minus sign.', tip: 'Keep the order u′v − uv′ (not uv′ − u′v).' },
    { q: `State the quotient rule for y = u/v.`, c: "dy/dx = (u′v − uv′)/v²", w: ["(uv′ − u′v)/v²", "(u′v + uv′)/v²", "u′/v′"], s: ['The quotient rule is (u′v − uv′)/v²'], h: ['"Low d-high minus high d-low, over low squared"'], mistake: 'Reversing the numerator order.', tip: 'Order matters: u′v comes first.' },
  ]);
}

// ── age17-diff L7 — Equation of a Tangent ────────────────────────────────────
function genTangentEqn17(): Problem {
  const p = randInt(1, 4);
  const m = 2 * p, c = p * p;
  const correct = `y = ${m}x − ${c}`;
  return {
    id: uid(),
    question: `Find the equation of the tangent to y = x² at the point where x = ${p}.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`y = ${m}x + ${c}`, `y = ${p}x − ${c}`, `y = ${c}x − ${m}`]),
    marks: 4,
    workingSteps: [
      `dy/dx = 2x → at x = ${p}, gradient = ${m}`,
      `Point on curve: (${p}, ${p * p})`,
      `y − ${p * p} = ${m}(x − ${p})`,
      `y = ${m}x − ${c}`,
    ],
    hints: [`Find the gradient from dy/dx`, `Use y − y₁ = m(x − x₁)`],
    calculatorAllowed: false,
    commonMistake: `Using the y-coordinate as the gradient — the gradient comes from dy/dx, not the point.`,
    examTip: `Tangent: differentiate for m, find the point, then y − y₁ = m(x − x₁).`,
  };
}

// ── age17-diff L8 — Connected Rates of Change ─────────────────────────────────
function genConnectedRates(): Problem {
  return fromCases([
    { q: `Given dy/dx = 3 and dx/dt = 2, find dy/dt.`, c: '6', w: ['1.5', '5', '2/3'], s: ['Chain rule: dy/dt = dy/dx × dx/dt', '= 3 × 2 = 6'], h: ['dy/dt = dy/dx × dx/dt'], mistake: 'Dividing instead of multiplying.', tip: 'Connected rates link via the chain rule — multiply.' },
    { q: `Area A = x², so dA/dx = 2x. At x = 5, dx/dt = 3. Find dA/dt.`, c: '30', w: ['10', '15', '6'], s: ['dA/dt = dA/dx × dx/dt = 2x × dx/dt', '= 2(5) × 3 = 10 × 3 = 30'], h: ['dA/dt = dA/dx × dx/dt', 'Substitute x = 5 into dA/dx first'], mistake: 'Forgetting to substitute x = 5 into 2x.', tip: 'Evaluate dA/dx at the given x, then multiply by dx/dt.' },
    { q: `Given dy/dx = 4 and dx/dt = 0.5, find dy/dt.`, c: '2', w: ['8', '4.5', '0.125'], s: ['dy/dt = dy/dx × dx/dt = 4 × 0.5 = 2'], h: ['Multiply the two rates'], mistake: 'Adding the rates.', tip: 'dy/dt = dy/dx × dx/dt.' },
    { q: `A balloon\'s volume grows at dV/dt = 12 cm³/s. If dV/dh = 4, find dh/dt.`, c: '3 cm/s', w: ['48 cm/s', '8 cm/s', '0.33 cm/s'], s: ['dV/dt = dV/dh × dh/dt', '12 = 4 × dh/dt', 'dh/dt = 12 ÷ 4 = 3 cm/s'], h: ['Rearrange dV/dt = dV/dh × dh/dt'], mistake: 'Multiplying 12 × 4 instead of dividing.', tip: 'Set up the chain, then solve for the unknown rate.' },
  ]);
}

// ── age17-int L6 — Indefinite Integration ────────────────────────────────────
function genIndefiniteIntegral(): Problem {
  const a = 2 * randInt(1, 3), b = randInt(1, 6);
  const correct = `${a / 2}x² + ${b}x + C`;
  return {
    id: uid(),
    question: `Find ∫(${a}x + ${b}) dx`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${a}x² + ${b}x + C`, `${a / 2}x² + ${b}x`, `${a}x + ${b} + C`]),
    marks: 3,
    workingSteps: [
      `Increase each power by 1 and divide by the new power`,
      `∫${a}x dx = ${a}x²/2 = ${a / 2}x²`,
      `∫${b} dx = ${b}x`,
      `= ${a / 2}x² + ${b}x + C`,
    ],
    hints: [`∫xⁿ dx = xⁿ⁺¹/(n+1)`, `Don't forget + C`],
    calculatorAllowed: false,
    commonMistake: `Omitting the constant of integration + C — indefinite integrals always need it.`,
    examTip: `Indefinite integral → always add + C.`,
  };
}

// ── age17-int L7 — Area Between Curves ────────────────────────────────────────
function genAreaBetweenCurves(): Problem {
  return fromCases([
    { q: `Find the area enclosed between y = x and y = x² from x = 0 to x = 1.`, c: '1/6', w: ['1/2', '1/3', '5/6'], s: ['Area = ∫₀¹ (x − x²) dx (top − bottom)', '= [x²/2 − x³/3]₀¹', '= 1/2 − 1/3 = 1/6'], h: ['Integrate (top curve − bottom curve)', 'On 0→1, x ≥ x²'], mistake: 'Integrating x² − x (the wrong way round) gives −1/6.', tip: 'Always subtract bottom curve from top curve.' },
    { q: `Find the area enclosed between y = 2x and y = x².`, c: '4/3', w: ['2/3', '8/3', '4'], s: ['Intersections: 2x = x² → x = 0, 2', 'Area = ∫₀² (2x − x²) dx = [x² − x³/3]₀²', '= 4 − 8/3 = 4/3'], h: ['Find the intersection points first', 'Integrate (line − curve)'], mistake: 'Forgetting to find the limits from the intersections.', tip: 'Set the curves equal to find the integration limits.' },
    { q: `Find the area between y = 4 and y = x² for −2 ≤ x ≤ 2.`, c: '32/3', w: ['16/3', '16', '8'], s: ['Area = ∫₋₂² (4 − x²) dx = [4x − x³/3]₋₂²', '= (8 − 8/3) − (−8 + 8/3) = 16/3 + 16/3 = 32/3'], h: ['Integrate (upper − lower) over the interval'], mistake: 'Forgetting the lower limit contribution (the −2 part).', tip: 'Evaluate F(b) − F(a) carefully with negative limits.' },
  ]);
}

// ── age17-int L8 — Volume of Revolution ──────────────────────────────────────
function genVolumeRevolution(): Problem {
  return fromCases([
    { q: `The region under y = x from x = 0 to x = 3 is rotated 360° about the x-axis.\nFind the volume.`, c: '9π', w: ['3π', '27π', '9π/2'], s: ['V = π ∫₀³ y² dx = π ∫₀³ x² dx', '= π [x³/3]₀³ = π × 9 = 9π'], h: ['V = π ∫ y² dx', 'Square y before integrating'], mistake: 'Forgetting to square y, or dropping π.', tip: 'Volume of revolution: V = π ∫ y² dx.' },
    { q: `The line y = 2 from x = 0 to x = 4 is rotated about the x-axis.\nFind the volume.`, c: '16π', w: ['8π', '32π', '4π'], s: ['V = π ∫₀⁴ 2² dx = π ∫₀⁴ 4 dx', '= π [4x]₀⁴ = π × 16 = 16π'], h: ['y² = 4 is constant'], mistake: 'Using y instead of y² (4, not 2).', tip: 'Square y first: 2² = 4.' },
    { q: `The region under y = √x from x = 0 to x = 4 is rotated about the x-axis.\nFind the volume.`, c: '8π', w: ['4π', '16π', '2π'], s: ['y² = x', 'V = π ∫₀⁴ x dx = π [x²/2]₀⁴ = π × 8 = 8π'], h: ['(√x)² = x'], mistake: 'Leaving √x unsquared.', tip: 'Squaring √x conveniently gives x.' },
    { q: `The region under y = x from x = 0 to x = 2 is rotated about the x-axis.\nFind the volume.`, c: '8π/3', w: ['4π/3', '8π', '4π'], s: ['V = π ∫₀² x² dx = π [x³/3]₀² = 8π/3'], h: ['V = π ∫ y² dx'], mistake: 'Dropping the /3 from integrating x².', tip: '∫x² dx = x³/3.' },
  ]);
}

// ── age17-series L6 — Arithmetic from Two Terms ──────────────────────────────
function genArithFromTerms(): Problem {
  const a = randInt(1, 6), d = randInt(2, 6);
  const t3 = a + 2 * d, t7 = a + 6 * d;
  return {
    id: uid(),
    question: `In an arithmetic sequence the 3rd term is ${t3} and the 7th term is ${t7}.\n\nFind the common difference d.`,
    correctAnswer: `${d}`,
    options: makeOptions(`${d}`, [`${t7 - t3}`, `${d + 1}`, `${a}`]),
    marks: 3,
    workingSteps: [`T₇ − T₃ = (a + 6d) − (a + 2d) = 4d`, `${t7} − ${t3} = ${t7 - t3} = 4d`, `d = ${t7 - t3} ÷ 4 = ${d}`],
    hints: [`Subtract the two term equations to eliminate a`, `The gap is 7 − 3 = 4 common differences`],
    calculatorAllowed: false,
    commonMistake: `Dividing by 7 − 3 wrongly, or by the term values instead of 4.`,
    examTip: `Tₘ − Tₙ = (m − n)d. Here (7 − 3) = 4, so divide the difference by 4.`,
  };
}

// ── age17-series L7 — Geometric Common Ratio ─────────────────────────────────
function genGeoFindR(): Problem {
  const a = randInt(2, 5), r = [2, 3][randInt(0, 1)];
  const t2 = a * r, t3 = a * r * r;
  return {
    id: uid(),
    question: `A geometric sequence has 2nd term ${t2} and 3rd term ${t3}.\n\nFind the common ratio r.`,
    correctAnswer: `${r}`,
    options: makeOptions(`${r}`, [`${t3 - t2}`, `${r + 1}`, `${a}`]),
    marks: 3,
    workingSteps: [`r = any term ÷ the previous term`, `r = T₃ ÷ T₂ = ${t3} ÷ ${t2} = ${r}`],
    hints: [`Divide consecutive terms to get r`, `r = Tₙ₊₁ ÷ Tₙ`],
    calculatorAllowed: false,
    commonMistake: `Subtracting terms (that finds d for arithmetic, not r for geometric).`,
    examTip: `Geometric: divide consecutive terms; Arithmetic: subtract them.`,
  };
}

// ── age17-series L8 — Sum to Infinity (find a) ───────────────────────────────
function genSumInfinityFind(): Problem {
  return fromCases([
    { q: `A geometric series has sum to infinity 20 and common ratio 1/2.\n\nFind the first term a.`, c: '10', w: ['40', '20', '5'], s: ['S∞ = a/(1 − r)', '20 = a/(1 − 1/2) = a/(1/2) = 2a', 'a = 10'], h: ['S∞ = a/(1 − r)', 'Rearrange for a'], mistake: 'Multiplying instead of dividing by 2.', tip: 'a = S∞ × (1 − r).' },
    { q: `A geometric series has sum to infinity 18 and common ratio 1/3.\n\nFind the first term a.`, c: '12', w: ['6', '54', '9'], s: ['S∞ = a/(1 − r)', '18 = a/(2/3)', 'a = 18 × 2/3 = 12'], h: ['a = S∞ × (1 − r)'], mistake: 'Using 1/3 instead of (1 − 1/3) = 2/3.', tip: 'Always use (1 − r), not r.' },
    { q: `A geometric series has sum to infinity 24 and common ratio 2/3.\n\nFind the first term a.`, c: '8', w: ['16', '36', '12'], s: ['S∞ = a/(1 − r)', '24 = a/(1/3)', 'a = 24 × 1/3 = 8'], h: ['a = S∞ × (1 − r)'], mistake: 'Forgetting 1 − 2/3 = 1/3.', tip: 'a = S∞(1 − r) = 24 × 1/3 = 8.' },
    { q: `A geometric series has sum to infinity 16 and common ratio 1/4.\n\nFind the first term a.`, c: '12', w: ['4', '64', '20'], s: ['S∞ = a/(1 − r)', '16 = a/(3/4)', 'a = 16 × 3/4 = 12'], h: ['a = S∞ × (1 − r)'], mistake: 'Using 1/4 instead of 3/4.', tip: 'a = 16 × 3/4 = 12.' },
  ]);
}

// ── age17-trig3 L5 — Double Angle Formulae ───────────────────────────────────
function genDoubleAngle17(): Problem {
  return fromCases([
    { q: `Express sin 2x in terms of sin x and cos x.`, c: '2 sin x cos x', w: ['sin²x − cos²x', '2 cos²x − 1', 'sin x cos x'], s: ['Double angle: sin 2x = 2 sin x cos x'], h: ['Memorise the double-angle formulae'], mistake: 'Dropping the factor of 2.', tip: 'sin 2x = 2 sin x cos x.' },
    { q: `Which is a correct form of cos 2x?`, c: 'cos²x − sin²x', w: ['2 sin x cos x', 'cos²x + sin²x', '2 cos x'], s: ['cos 2x = cos²x − sin²x = 1 − 2sin²x = 2cos²x − 1'], h: ['Three equivalent forms exist'], mistake: 'Confusing cos 2x with sin 2x.', tip: 'cos 2x has three equivalent forms.' },
    { q: `Given sin x = 3/5 and cos x = 4/5, find sin 2x.`, c: '24/25', w: ['12/25', '7/25', '6/5'], s: ['sin 2x = 2 sin x cos x', '= 2 × (3/5) × (4/5) = 24/25'], h: ['sin 2x = 2 sin x cos x'], mistake: 'Forgetting to multiply by 2.', tip: 'Substitute into 2 sin x cos x.' },
    { q: `Given sin x = 1/2 and cos x = √3/2, find sin 2x.`, c: '√3/2', w: ['1/2', '√3/4', '1'], s: ['sin 2x = 2 sin x cos x', '= 2 × (1/2) × (√3/2) = √3/2'], h: ['sin 2x = 2 sin x cos x'], mistake: 'Dropping the 2.', tip: 'This shows sin 60° = √3/2 (since 2×30° = 60°).' },
  ]);
}

// ── age17-trig3 L6 — Arc Length & Sector Area (radians) ──────────────────────
function genRadianArcSector(): Problem {
  const r = randInt(3, 8), theta = [2, 4][randInt(0, 1)];
  const arc = r * theta, area = 0.5 * r * r * theta;
  const askArc = Math.random() < 0.5;
  const correct = askArc ? `${arc} cm` : `${area} cm²`;
  return {
    id: uid(),
    question: `A sector has radius ${r} cm and angle ${theta} radians.\n\nFind the ${askArc ? 'arc length' : 'area'}.`,
    correctAnswer: correct,
    options: askArc
      ? makeOptions(`${arc} cm`, [`${r + theta} cm`, `${arc + r} cm`, `${0.5 * r * theta} cm`])
      : makeOptions(`${area} cm²`, [`${arc} cm²`, `${r * r * theta} cm²`, `${area + r} cm²`]),
    marks: 2,
    workingSteps: askArc
      ? [`Arc length s = rθ`, `= ${r} × ${theta} = ${arc} cm`]
      : [`Sector area = ½r²θ`, `= ½ × ${r}² × ${theta} = ${area} cm²`],
    hints: askArc ? [`s = rθ (θ in radians)`] : [`Area = ½r²θ (θ in radians)`],
    calculatorAllowed: true,
    commonMistake: `Using degrees — these formulas need the angle in RADIANS.`,
    examTip: `In radians: arc s = rθ, sector area = ½r²θ.`,
  };
}

// ── age17-trig3 L7 — Quadratic Trig Equations ────────────────────────────────
function genTrigQuadratic(): Problem {
  return fromCases([
    { q: `Solve sin²x = sin x for sin x.`, c: 'sin x = 0 or 1', w: ['sin x = 1 only', 'sin x = 0 only', 'sin x = −1 or 1'], s: ['sin²x − sin x = 0', 'sin x(sin x − 1) = 0', 'sin x = 0 or sin x = 1'], h: ['Move everything to one side, then factorise', 'Do NOT divide by sin x (you lose a solution)'], mistake: 'Dividing both sides by sin x and losing sin x = 0.', tip: 'Never divide by a variable — factorise instead.' },
    { q: `Solve 2cos²x − cos x − 1 = 0 for cos x.`, c: 'cos x = 1 or −1/2', w: ['cos x = 1 or 1/2', 'cos x = −1 or 1/2', 'cos x = 2 or −1'], s: ['Factorise: (2cos x + 1)(cos x − 1) = 0', 'cos x = −1/2 or cos x = 1'], h: ['Treat cos x as a single variable and factorise'], mistake: 'Sign errors when factorising.', tip: 'Let c = cos x: 2c² − c − 1 = (2c + 1)(c − 1).' },
    { q: `Solve tan²x = 1 for 0° ≤ x ≤ 180°.`, c: 'x = 45° and 135°', w: ['x = 45° only', 'x = 45° and 225°', 'x = 90°'], s: ['tan x = ±1', 'tan x = 1 → x = 45°', 'tan x = −1 → x = 135°'], h: ['Take ± when square-rooting'], mistake: 'Taking only the positive root.', tip: 'tan²x = 1 means tan x = +1 OR −1.' },
    { q: `Factorise to solve: 2sin²x + sin x = 0.`, c: 'sin x(2 sin x + 1) = 0', w: ['sin x(2 sin x − 1) = 0', '2 sin x(sin x + 1) = 0', '(sin x + 1)(sin x + 1) = 0'], s: ['Common factor sin x', 'sin x(2 sin x + 1) = 0'], h: ['Take out the common factor sin x'], mistake: 'Wrong sign inside the bracket.', tip: 'Factor out sin x first, then solve each bracket.' },
  ]);
}

// ── age17-trig3 L8 — Simplifying / Proving Identities ────────────────────────
function genTrigProve(): Problem {
  return fromCases([
    { q: `Simplify: 1 − cos²x.`, c: 'sin²x', w: ['cos²x', '1', 'tan²x'], s: ['sin²x + cos²x = 1', 'So 1 − cos²x = sin²x'], h: ['Rearrange the Pythagorean identity'], mistake: 'Leaving it as 1 − cos²x.', tip: '1 − cos²x = sin²x (and 1 − sin²x = cos²x).' },
    { q: `Simplify: sin x / cos x.`, c: 'tan x', w: ['cot x', 'sec x', 'sin x cos x'], s: ['Quotient identity: tan x = sin x / cos x'], h: ['Recall the quotient identity'], mistake: 'Writing cot x (that is cos/sin).', tip: 'tan x = sin x / cos x.' },
    { q: `Simplify: 1 + tan²x.`, c: 'sec²x', w: ['cosec²x', 'cos²x', 'tan x'], s: ['Identity: 1 + tan²x = sec²x'], h: ['A Pythagorean-type identity'], mistake: 'Confusing sec with cosec.', tip: '1 + tan²x = sec²x; 1 + cot²x = cosec²x.' },
    { q: `Simplify: cos²x − 1.`, c: '−sin²x', w: ['sin²x', '−cos²x', '1'], s: ['cos²x − 1 = −(1 − cos²x) = −sin²x'], h: ['Factor out the minus sign'], mistake: 'Forgetting the negative sign.', tip: 'cos²x − 1 = −sin²x.' },
  ]);
}

// ── age17-logexp L5 — Solving Exponential Equations (e) ──────────────────────
function genSolveExpEquation17(): Problem {
  return fromCases([
    { q: `Solve eˣ = 10. Give x in exact form.`, c: 'x = ln 10', w: ['x = log 10', 'x = e¹⁰', 'x = 10/e'], s: ['Take ln of both sides', 'ln(eˣ) = ln 10', 'x = ln 10'], h: ['ln is the inverse of eˣ'], mistake: 'Using log base 10 instead of ln.', tip: 'eˣ = a ⟺ x = ln a.' },
    { q: `Solve e^(2x) = 7. Give x in exact form.`, c: 'x = (ln 7)/2', w: ['x = ln 7', 'x = 2 ln 7', 'x = ln(7/2)'], s: ['ln both sides: 2x = ln 7', 'x = (ln 7)/2'], h: ['Bring the 2x down with ln, then divide'], mistake: 'Forgetting to divide by 2.', tip: 'e^(kx) = a → x = (ln a)/k.' },
    { q: `Solve 3eˣ = 12. Give x in exact form.`, c: 'x = ln 4', w: ['x = ln 12', 'x = ln 9', 'x = 4/e'], s: ['Divide by 3: eˣ = 4', 'x = ln 4'], h: ['Isolate eˣ first'], mistake: 'Taking ln before dividing by 3.', tip: 'Get eˣ alone, then take ln.' },
    { q: `Solve e^(x+1) = 5. Give x in exact form.`, c: 'x = ln 5 − 1', w: ['x = ln 5 + 1', 'x = ln 4', 'x = (ln 5)/1'], s: ['ln both sides: x + 1 = ln 5', 'x = ln 5 − 1'], h: ['ln undoes the exponential, then solve the linear bit'], mistake: 'Adding 1 instead of subtracting.', tip: 'x + 1 = ln 5 → x = ln 5 − 1.' },
  ]);
}

// ── age17-logexp L6 — Solving Natural Log Equations ──────────────────────────
function genLnEquation(): Problem {
  return fromCases([
    { q: `Solve ln x = 3. Give x in exact form.`, c: 'x = e³', w: ['x = 3e', 'x = e/3', 'x = ln 3'], s: ['Exponentiate both sides', 'e^(ln x) = e³', 'x = e³'], h: ['eˣ undoes ln'], mistake: 'Writing 3e instead of e³.', tip: 'ln x = k ⟺ x = eᵏ.' },
    { q: `Solve ln x = 0.`, c: 'x = 1', w: ['x = 0', 'x = e', 'x = −1'], s: ['x = e⁰ = 1'], h: ['e⁰ = 1'], mistake: 'Giving x = 0.', tip: 'ln 1 = 0, so x = 1.' },
    { q: `Solve ln(2x) = 1. Give x in exact form.`, c: 'x = e/2', w: ['x = 2e', 'x = e', 'x = 1/2'], s: ['2x = e¹ = e', 'x = e/2'], h: ['Exponentiate, then solve for x'], mistake: 'Forgetting to divide by 2.', tip: 'ln(2x) = 1 → 2x = e → x = e/2.' },
    { q: `Solve ln x = −1. Give x in exact form.`, c: 'x = 1/e', w: ['x = −e', 'x = e', 'x = −1'], s: ['x = e⁻¹ = 1/e'], h: ['e⁻¹ = 1/e'], mistake: 'Writing −e.', tip: 'ln x = −1 → x = e⁻¹ = 1/e.' },
  ]);
}

// ── age17-logexp L7 — Evaluating Logarithms ──────────────────────────────────
function genLogSimplify(): Problem {
  return fromCases([
    { q: `Evaluate log₂ 32.`, c: '5', w: ['16', '6', '4'], s: ['2? = 32', '2⁵ = 32', 'log₂ 32 = 5'], h: ['Ask: 2 to what power is 32?'], mistake: 'Dividing 32 by 2.', tip: 'log₂ 32 = 5 since 2⁵ = 32.' },
    { q: `Evaluate log₃ 81.`, c: '4', w: ['27', '3', '9'], s: ['3⁴ = 81', 'log₃ 81 = 4'], h: ['3 to what power is 81?'], mistake: 'Confusing with 81/3.', tip: '3⁴ = 81.' },
    { q: `Evaluate ln(e⁴).`, c: '4', w: ['e⁴', '1', 'e'], s: ['ln and e are inverses', 'ln(e⁴) = 4'], h: ['ln(eᵏ) = k'], mistake: 'Leaving it as e⁴.', tip: 'ln(eᵏ) = k.' },
    { q: `Evaluate log₁₀ 1000.`, c: '3', w: ['100', '4', '2'], s: ['10³ = 1000', 'log₁₀ 1000 = 3'], h: ['Count the zeros for base 10'], mistake: 'Giving 100.', tip: 'log₁₀(10ⁿ) = n.' },
    { q: `Evaluate log₅ 1.`, c: '0', w: ['1', '5', '−1'], s: ['Any base to the power 0 is 1', 'log₅ 1 = 0'], h: ['logₐ 1 = 0 for any base'], mistake: 'Giving 1.', tip: 'logₐ 1 = 0 always.' },
  ]);
}

// ── age17-logexp L8 — Continuous Growth Models ───────────────────────────────
function genExpGrowthContinuous(): Problem {
  return fromCases([
    { q: `A = 100e^(0.5t). Find the initial value (at t = 0).`, c: '100', w: ['150', '50', '0'], s: ['At t = 0, e⁰ = 1', 'A = 100 × 1 = 100'], h: ['Substitute t = 0', 'e⁰ = 1'], mistake: 'Multiplying by 0.5.', tip: 'In A = A₀eᵏᵗ, A₀ is the value at t = 0.' },
    { q: `In the model A = A₀eᵏᵗ, what does A₀ represent?`, c: 'The initial amount', w: ['The growth rate', 'The final amount', 'The time taken'], s: ['At t = 0, A = A₀e⁰ = A₀', 'A₀ is the starting value'], h: ['Set t = 0'], mistake: 'Confusing A₀ with the rate k.', tip: 'A₀ = value when t = 0.' },
    { q: `Is A = 50e^(0.2t) growth or decay?`, c: 'Growth', w: ['Decay', 'Neither', 'Constant'], s: ['The exponent coefficient k = 0.2 > 0', 'Positive k → growth'], h: ['Check the sign of k'], mistake: 'Ignoring the sign of k.', tip: 'k > 0 → growth; k < 0 → decay.' },
    { q: `Is A = 80e^(−0.3t) growth or decay?`, c: 'Decay', w: ['Growth', 'Neither', 'Constant'], s: ['k = −0.3 < 0', 'Negative k → decay'], h: ['Check the sign of k'], mistake: 'Reading the negative as growth.', tip: 'A negative exponent coefficient means decay.' },
  ]);
}

// ── age17-func3 L5 — Modulus Inequalities ────────────────────────────────────
function genModulusInequality(): Problem {
  return fromCases([
    { q: `Solve |x| < 3.`, c: '−3 < x < 3', w: ['x < 3', 'x > 3', 'x < −3 or x > 3'], s: ['|x| < a means −a < x < a', '−3 < x < 3'], h: ['|x| < a → a "sandwich"'], mistake: 'Giving only x < 3.', tip: '|x| < a → −a < x < a.' },
    { q: `Solve |x − 2| < 5.`, c: '−3 < x < 7', w: ['−5 < x < 5', '3 < x < 7', 'x < 7'], s: ['−5 < x − 2 < 5', 'Add 2: −3 < x < 7'], h: ['Write the double inequality, then add 2'], mistake: 'Forgetting to shift by +2.', tip: '|x − k| < a → k − a < x < k + a.' },
    { q: `Solve |x| > 4.`, c: 'x < −4 or x > 4', w: ['−4 < x < 4', 'x > 4', 'x < 4'], s: ['|x| > a means x < −a OR x > a', 'x < −4 or x > 4'], h: ['Greater-than splits into two regions'], mistake: 'Writing a sandwich inequality.', tip: '|x| > a → x < −a or x > a.' },
    { q: `Solve |x + 1| ≤ 3.`, c: '−4 ≤ x ≤ 2', w: ['−3 ≤ x ≤ 3', '−2 ≤ x ≤ 4', 'x ≤ 2'], s: ['−3 ≤ x + 1 ≤ 3', 'Subtract 1: −4 ≤ x ≤ 2'], h: ['Double inequality, then subtract 1'], mistake: 'Adding 1 instead of subtracting.', tip: '|x + 1| ≤ 3 → −3 ≤ x + 1 ≤ 3.' },
  ]);
}

// ── age17-func3 L6 — Inverse Domain & Range ──────────────────────────────────
function genInverseRange(): Problem {
  return fromCases([
    { q: `f has domain x ≥ 0 and range f(x) ≥ 2.\nState the DOMAIN of f⁻¹.`, c: 'x ≥ 2', w: ['x ≥ 0', 'x ≤ 2', 'all x'], s: ['Domain of f⁻¹ = range of f', 'Range of f is f(x) ≥ 2', 'Domain of f⁻¹: x ≥ 2'], h: ['Inverse swaps domain and range'], mistake: 'Using the domain of f instead of its range.', tip: 'Domain of f⁻¹ = range of f.' },
    { q: `The range of f⁻¹ equals the ______ of f.`, c: 'domain', w: ['range', 'gradient', 'inverse'], s: ['Inverting swaps domain and range', 'Range of f⁻¹ = domain of f'], h: ['Inverse reflects in y = x'], mistake: 'Saying "range".', tip: 'f⁻¹ swaps the roles of domain and range.' },
    { q: `f has range y ≥ 5.\nState the DOMAIN of f⁻¹.`, c: 'x ≥ 5', w: ['x ≤ 5', 'x ≥ 0', 'all x'], s: ['Domain of f⁻¹ = range of f = y ≥ 5', 'So x ≥ 5'], h: ['Range of f becomes domain of f⁻¹'], mistake: 'Flipping the inequality.', tip: 'Domain of f⁻¹ = range of f.' },
  ]);
}

// ── age17-func3 L7 — Evaluating Inverse Functions ────────────────────────────
function genCompositeInverse(): Problem {
  const a = randInt(2, 4), b = randInt(1, 5), k = randInt(1, 5);
  const y = a * k + b;
  return {
    id: uid(),
    question: `f(x) = ${a}x + ${b}.\n\nFind f⁻¹(${y}).`,
    correctAnswer: `${k}`,
    options: makeOptions(`${k}`, [`${a * y + b}`, `${y - b}`, `${k + 1}`]),
    marks: 3,
    workingSteps: [`f⁻¹(x) = (x − ${b})/${a}`, `f⁻¹(${y}) = (${y} − ${b})/${a} = ${y - b}/${a} = ${k}`],
    hints: [`Find f⁻¹ first: swap x and y, solve`, `Then substitute ${y}`],
    calculatorAllowed: false,
    commonMistake: `Substituting ${y} into f instead of f⁻¹.`,
    examTip: `f⁻¹(${y}) asks "what input gives ${y}?" — solve ${a}x + ${b} = ${y}.`,
  };
}

// ── age17-func3 L8 — Combined Transformations ────────────────────────────────
function genTransformationCombined(): Problem {
  return fromCases([
    { q: `y = 2f(x) is f(x) stretched vertically by scale factor ___.`, c: '2', w: ['1/2', '−2', '4'], s: ['Multiplying f(x) by 2 stretches vertically by factor 2'], h: ['Outside multiplier → vertical stretch'], mistake: 'Confusing with a horizontal stretch.', tip: 'y = a·f(x): vertical stretch factor a.' },
    { q: `y = f(2x) is f(x) stretched horizontally by scale factor ___.`, c: '1/2', w: ['2', '−2', '1/4'], s: ['Inside multiplier 2 compresses horizontally by factor 1/2'], h: ['Inside multiplier → horizontal stretch by 1/(factor)'], mistake: 'Saying factor 2 (it is the reciprocal).', tip: 'y = f(bx): horizontal stretch factor 1/b.' },
    { q: `y = f(x − 3) + 2 is a translation by vector ___.`, c: '(3, 2)', w: ['(−3, 2)', '(3, −2)', '(2, 3)'], s: ['(x − 3) → right 3', '+ 2 → up 2', 'Vector (3, 2)'], h: ['Inside opposite sign (right), outside same sign (up)'], mistake: 'Sign error on the horizontal shift.', tip: 'y = f(x − a) + b → translation (a, b).' },
    { q: `y = −f(x) + 1: a reflection in the x-axis, then a translation up by ___.`, c: '1', w: ['−1', '0', 'f(x)'], s: ['−f(x) reflects in the x-axis', '+ 1 translates up 1'], h: ['Apply the reflection, then the shift'], mistake: 'Missing the + 1 shift.', tip: 'Read transformations from the inside out.' },
  ]);
}

// ── age17-algebra4 L4 — Binomial Term ────────────────────────────────────────
function genBinomialTerm17(): Problem {
  const n = randInt(3, 5), b = randInt(2, 3), r = randInt(1, n - 1);
  const coeff = comb(n, r) * Math.pow(b, r);
  return {
    id: uid(),
    question: `Find the coefficient of x^${r} in the expansion of (1 + ${b}x)^${n}.`,
    correctAnswer: `${coeff}`,
    options: makeOptions(`${coeff}`, [`${comb(n, r)}`, `${comb(n, r) * b}`, `${Math.pow(b, r)}`]),
    marks: 4,
    workingSteps: [
      `General term: ⁿCᵣ × (${b}x)ʳ`,
      `Coefficient = ${n}C${r} × ${b}^${r} = ${comb(n, r)} × ${Math.pow(b, r)} = ${coeff}`,
    ],
    hints: [`Term in xʳ is ⁿCᵣ (bx)ʳ`, `Remember to raise ${b} to the power ${r} too`],
    calculatorAllowed: true,
    commonMistake: `Using only ⁿCᵣ and forgetting the ${b}^${r} factor from (${b}x)ʳ.`,
    examTip: `The coefficient includes BOTH ⁿCᵣ and the constant raised to the power r.`,
  };
}

// ── age17-algebra4 L5 — Remainder Theorem ────────────────────────────────────
function genRemainderTheorem17(): Problem {
  const a = randInt(1, 5), b = randInt(1, 6), k = randInt(1, 4);
  const rem = k * k + a * k + b;
  return {
    id: uid(),
    question: `Find the remainder when x² + ${a}x + ${b} is divided by (x − ${k}).`,
    correctAnswer: `${rem}`,
    options: makeOptions(`${rem}`, [`${rem + 1}`, `${k * k + a * k}`, `${a * k + b}`]),
    marks: 3,
    workingSteps: [`Remainder Theorem: remainder = f(${k})`, `f(${k}) = ${k}² + ${a}×${k} + ${b} = ${k * k} + ${a * k} + ${b} = ${rem}`],
    hints: [`Dividing by (x − k) → remainder is f(k)`, `Substitute x = ${k}`],
    calculatorAllowed: false,
    commonMistake: `Using x = −${k} — for (x − k) the remainder is f(+k).`,
    examTip: `Remainder when dividing by (x − k) is f(k). For (x + k) use f(−k).`,
  };
}

// ── age17-algebra4 L6 — Completing the Square ────────────────────────────────
function genCompleteSquare17(): Problem {
  const b = 2 * randInt(1, 4), c = randInt(1, 8), p = b / 2, q = c - p * p;
  const qStr = q >= 0 ? `+ ${q}` : `− ${-q}`;
  const correct = `(x + ${p})² ${qStr}`;
  return {
    id: uid(),
    question: `Express x² + ${b}x + ${c} in the form (x + p)² + q.`,
    correctAnswer: correct,
    options: makeOptions(correct, [`(x + ${b})² + ${c}`, `(x + ${p})² ${(-q) >= 0 ? `+ ${-q}` : `− ${q}`}`, `(x + ${p * 2})² + ${q}`]),
    marks: 3,
    workingSteps: [`p = b ÷ 2 = ${b} ÷ 2 = ${p}`, `q = c − p² = ${c} − ${p * p} = ${q}`, `= (x + ${p})² ${qStr}`],
    hints: [`p is half the coefficient of x`, `q = c − p²`],
    calculatorAllowed: false,
    commonMistake: `Forgetting to subtract p² — q = c − p², not c.`,
    examTip: `Completing the square: p = b/2, q = c − (b/2)².`,
  };
}

// ── age17-algebra4 L7 — Polynomial Identities ────────────────────────────────
function genPolynomialIdentity(): Problem {
  return fromCases([
    { q: `If x² + 5x + 6 ≡ (x + 2)(x + a), find a.`, c: 'a = 3', w: ['a = 2', 'a = 6', 'a = 5'], s: ['(x + 2)(x + a) = x² + (a + 2)x + 2a', 'Compare constants: 2a = 6 → a = 3', '(check: a + 2 = 5 ✓)'], h: ['Expand, then equate coefficients'], mistake: 'Guessing without comparing coefficients.', tip: 'Equate the constant terms: 2a = 6.' },
    { q: `If 3x + 7 ≡ A(x + 1) + B, find A.`, c: 'A = 3', w: ['A = 7', 'A = 4', 'A = 1'], s: ['A(x + 1) + B = Ax + (A + B)', 'Compare x terms: A = 3'], h: ['Compare the coefficients of x'], mistake: 'Confusing A with B.', tip: 'The coefficient of x gives A directly.' },
    { q: `If x² + bx + 9 is a perfect square (x + 3)², find b.`, c: 'b = 6', w: ['b = 3', 'b = 9', 'b = 18'], s: ['(x + 3)² = x² + 6x + 9', 'Compare: b = 6'], h: ['Expand (x + 3)²'], mistake: 'Using b = 3 (the root) instead of 6.', tip: 'For a perfect square, b = 2 × (the root).' },
    { q: `If 2x² + 8x + c ≡ 2(x + 2)², find c.`, c: 'c = 8', w: ['c = 4', 'c = 2', 'c = 16'], s: ['2(x + 2)² = 2(x² + 4x + 4) = 2x² + 8x + 8', 'Compare constants: c = 8'], h: ['Expand the right-hand side fully'], mistake: 'Forgetting to multiply the 4 by 2.', tip: 'Distribute the leading 2 across all terms.' },
  ]);
}

// ── age17-algebra4 L8 — Discriminant & Nature of Roots ───────────────────────
function genDiscriminant17(): Problem {
  return fromCases([
    { q: `For x² + 4x + 4 = 0, find the discriminant b² − 4ac.`, c: '0', w: ['16', '32', '8'], s: ['a = 1, b = 4, c = 4', 'b² − 4ac = 16 − 16 = 0'], h: ['Discriminant = b² − 4ac'], mistake: 'Forgetting the −4ac part.', tip: 'Δ = b² − 4ac.' },
    { q: `x² + 4x + 4 = 0 has what kind of roots?`, c: 'Equal (repeated) roots', w: ['Two distinct real roots', 'No real roots', 'Three roots'], s: ['Discriminant = 16 − 16 = 0', 'Δ = 0 → equal (repeated) roots'], h: ['Δ = 0 means a repeated root'], mistake: 'Saying two distinct roots.', tip: 'Δ = 0 → one repeated root.' },
    { q: `For 2x² + 3x + 5 = 0, describe the roots.`, c: 'No real roots', w: ['Two distinct real roots', 'Equal roots', 'One real root'], s: ['Δ = 3² − 4(2)(5) = 9 − 40 = −31', 'Δ < 0 → no real roots'], h: ['Check the sign of the discriminant'], mistake: 'Ignoring that a negative Δ means no real roots.', tip: 'Δ < 0 → no real roots.' },
    { q: `For x² − 5x + 6 = 0, describe the roots.`, c: 'Two distinct real roots', w: ['Equal roots', 'No real roots', 'No solution'], s: ['Δ = 25 − 24 = 1', 'Δ > 0 → two distinct real roots'], h: ['Δ > 0 means two different real roots'], mistake: 'Thinking Δ = 1 means one root.', tip: 'Δ > 0 → two distinct real roots.' },
  ]);
}

// ═══════════════════════════════════════════════════════════════════════════
//  Ages 13/14 (Explorers / Pioneers) — pre-storm tier of the Exam Studio.
//  CAPS Gr 8/9 foundations in the senior Problem format (marks, steps, tips).
//  Numbers kept simpler than the age15 IGCSE versions. Grade labels NEVER
//  appear in rendered strings (age-only rule).
// ═══════════════════════════════════════════════════════════════════════════

const COPRIME_PAIRS: [number, number][] = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [2, 7], [3, 7], [5, 6]];

// ── age13-algebra L1 — Substitution ──────────────────────────────────────────
function genSubstitution13(): Problem {
  const a = randInt(2, 6), b = randInt(1, 9), x = randInt(2, 8);
  const val = a * x + b;
  return {
    id: uid(),
    question: `Find the value of ${a}x + ${b} when x = ${x}.`,
    correctAnswer: `${val}`,
    options: makeOptions(`${val}`, [`${a * x}`, `${a + x + b}`, `${val + a}`]),
    marks: 2,
    workingSteps: [`Replace x with ${x}`, `${a}(${x}) + ${b} = ${a * x} + ${b} = ${val}`],
    hints: [`Substitute ${x} for x`, `Multiply first, then add`],
    calculatorAllowed: false,
    commonMistake: `Adding before multiplying — do ${a}×${x} first, then + ${b}.`,
    examTip: `Write the substitution line ${a}(${x}) + ${b} before simplifying — it earns a method mark.`,
  };
}

// ── age13-algebra L2 — Collecting Like Terms ─────────────────────────────────
function genLikeTerms13(): Problem {
  if (Math.random() < 0.5) {
    const a = randInt(2, 6), b = randInt(2, 6), c = randInt(1, 8), d = randInt(1, 8);
    const xc = a + b, k = c + d;
    return {
      id: uid(),
      question: `Simplify: ${a}x + ${c} + ${b}x + ${d}`,
      correctAnswer: `${xc}x + ${k}`,
      options: makeOptions(`${xc}x + ${k}`, [`${a * b}x + ${k}`, `${xc}x + ${k + 1}`, `${xc + k}x`]),
      marks: 2,
      workingSteps: [`Group like terms: (${a}x + ${b}x) + (${c} + ${d})`, `= ${xc}x + ${k}`],
      hints: [`Add the x terms together, then the numbers`],
      calculatorAllowed: false,
      commonMistake: `Multiplying the x coefficients instead of adding them.`,
      examTip: `Only add terms of the SAME type: x with x, numbers with numbers.`,
    };
  }
  const a = randInt(2, 6), b = randInt(2, 6), p = randInt(2, 6), q = randInt(2, 6);
  const xc = a + b, yc = p + q;
  return {
    id: uid(),
    question: `Simplify: ${a}x + ${p}y + ${b}x + ${q}y`,
    correctAnswer: `${xc}x + ${yc}y`,
    options: makeOptions(`${xc}x + ${yc}y`, [`${xc + yc}xy`, `${xc}x + ${yc + 1}y`, `${a * b}x + ${yc}y`]),
    marks: 2,
    workingSteps: [`Group like terms: (${a}x + ${b}x) + (${p}y + ${q}y)`, `= ${xc}x + ${yc}y`],
    hints: [`x terms together, y terms together`],
    calculatorAllowed: false,
    commonMistake: `Combining x and y into "xy" — they are different terms and stay separate.`,
    examTip: `x and y cannot be combined. Keep them as separate terms.`,
  };
}

// ── age13-algebra L3 — Expanding a Single Bracket ────────────────────────────
function genExpandSingle13(): Problem {
  const k = randInt(2, 5), a = randInt(2, 5), b = randInt(1, 6);
  return {
    id: uid(),
    question: `Expand: ${k}(${a}x + ${b})`,
    correctAnswer: `${k * a}x + ${k * b}`,
    options: makeOptions(`${k * a}x + ${k * b}`, [`${k * a}x + ${b}`, `${a}x + ${k * b}`, `${k + a}x + ${k * b}`]),
    marks: 2,
    workingSteps: [`Multiply each term inside by ${k}`, `${k}×${a}x = ${k * a}x,  ${k}×${b} = ${k * b}`, `= ${k * a}x + ${k * b}`],
    hints: [`Multiply BOTH terms inside the bracket by ${k}`],
    calculatorAllowed: false,
    commonMistake: `Multiplying only the first term — ${k} multiplies ${b} too.`,
    examTip: `Distribute the number to every term inside the bracket.`,
  };
}

// ── age13-algebra L4 — Expanding Double Brackets ─────────────────────────────
function genExpandDouble13(): Problem {
  const a = randInt(1, 6), b = randInt(1, 6);
  const mid = a + b, last = a * b;
  return {
    id: uid(),
    question: `Expand and simplify: (x + ${a})(x + ${b})`,
    correctAnswer: `x² + ${mid}x + ${last}`,
    options: makeOptions(`x² + ${mid}x + ${last}`, [`x² + ${last}x + ${mid}`, `x² + ${mid + 1}x + ${last}`, `x² + ${a}x + ${b}`]),
    marks: 3,
    workingSteps: [`FOIL: x×x + x×${b} + ${a}×x + ${a}×${b}`, `= x² + ${b}x + ${a}x + ${last}`, `= x² + ${mid}x + ${last}`],
    hints: [`Use FOIL: First, Outer, Inner, Last`, `Add the two middle x-terms`],
    calculatorAllowed: false,
    commonMistake: `Forgetting the middle term — combine ${a}x + ${b}x = ${mid}x.`,
    examTip: `Middle coefficient = sum (${a}+${b}); constant = product (${a}×${b}).`,
  };
}

// ── age13-algebra L5 — Factorising (Common Factor) ───────────────────────────
function genFactoriseCommon13(): Problem {
  const g = randInt(2, 5);
  const [a, b] = COPRIME_PAIRS[randInt(0, COPRIME_PAIRS.length - 1)];
  const t1 = g * a, t2 = g * b;
  return {
    id: uid(),
    question: `Factorise fully: ${t1}x + ${t2}`,
    correctAnswer: `${g}(${a}x + ${b})`,
    options: makeOptions(`${g}(${a}x + ${b})`, [`${g}(${a}x + ${b + 1})`, `${a}(${g}x + ${b})`, `${g}(${a}x + ${t2})`]),
    marks: 2,
    workingSteps: [`Highest common factor of ${t1} and ${t2} is ${g}`, `${t1}x + ${t2} = ${g}(${a}x + ${b})`],
    hints: [`Find the highest common factor first`, `Divide each term by it`],
    calculatorAllowed: false,
    commonMistake: `Taking out a factor that isn't the HIGHEST — check ${g} divides both fully.`,
    examTip: `Check by expanding: ${g}(${a}x + ${b}) should give back ${t1}x + ${t2}.`,
  };
}

// ── age13-algebra L6 — Solving Linear Equations ──────────────────────────────
function genSolveLinear13(): Problem {
  const a = randInt(2, 6), x = randInt(2, 9), b = randInt(1, 9);
  const c = a * x + b;
  return {
    id: uid(),
    question: `Solve: ${a}x + ${b} = ${c}`,
    correctAnswer: `x = ${x}`,
    options: makeOptions(`x = ${x}`, [`x = ${x + 1}`, `x = ${c - b}`, `x = ${Math.round(c / a)}`]),
    marks: 3,
    workingSteps: [`Subtract ${b}: ${a}x = ${c - b}`, `Divide by ${a}: x = ${x}`],
    hints: [`Undo + ${b} first`, `Then divide by ${a}`],
    calculatorAllowed: false,
    commonMistake: `Dividing before subtracting ${b} — remove the +${b} first.`,
    examTip: `Inverse operations in reverse order: subtract, then divide.`,
  };
}

// ── age13-algebra L7 — Equations with Brackets ───────────────────────────────
function genSolveBrackets13(): Problem {
  const a = randInt(2, 5), x = randInt(2, 8), b = randInt(1, 6);
  const c = a * (x + b);
  return {
    id: uid(),
    question: `Solve: ${a}(x + ${b}) = ${c}`,
    correctAnswer: `x = ${x}`,
    options: makeOptions(`x = ${x}`, [`x = ${x + b}`, `x = ${x + 1}`, `x = ${c - a}`]),
    marks: 3,
    workingSteps: [`Divide both sides by ${a}: x + ${b} = ${c / a}`, `Subtract ${b}: x = ${x}`],
    hints: [`Divide by ${a} first, or expand the bracket`, `Then subtract ${b}`],
    calculatorAllowed: false,
    commonMistake: `Forgetting to subtract ${b} after dividing.`,
    examTip: `Two valid routes: divide by ${a} first, OR expand then solve.`,
  };
}

// ── age13-algebra L8 — Forming Equations from Words ──────────────────────────
function genWordEquation13(): Problem {
  return fromCases([
    { q: `A number is multiplied by 4, then 3 is added. The result is 23.\nFind the number.`, c: '5', w: ['6', '20', '4'], s: ['Let the number be n: 4n + 3 = 23', '4n = 20', 'n = 5'], h: ['Turn the words into 4n + 3 = 23'], mistake: 'Forgetting to subtract the 3 before dividing.', tip: 'Build the equation step by step from the sentence.' },
    { q: `Twice a number minus 5 equals 11.\nFind the number.`, c: '8', w: ['3', '6', '16'], s: ['2n − 5 = 11', '2n = 16', 'n = 8'], h: ['"Twice a number" = 2n'], mistake: 'Subtracting instead of adding the 5 back.', tip: 'Reverse each operation in turn.' },
    { q: `Five more than three times a number is 26.\nFind the number.`, c: '7', w: ['9', '21', '8'], s: ['3n + 5 = 26', '3n = 21', 'n = 7'], h: ['"three times a number" = 3n'], mistake: 'Dividing 26 by 3 before removing the 5.', tip: 'Remove the +5 first, then divide.' },
    { q: `A number divided by 2, then add 4, gives 10.\nFind the number.`, c: '12', w: ['28', '6', '8'], s: ['n/2 + 4 = 10', 'n/2 = 6', 'n = 12'], h: ['"divided by 2" = n/2'], mistake: 'Multiplying by 2 before subtracting the 4.', tip: 'Undo +4, then undo ÷2 by ×2.' },
  ]);
}

// ── age14-exponents L1 — Product Law ─────────────────────────────────────────
function genExpProduct14(): Problem {
  const m = randInt(2, 6), n = randInt(2, 6);
  return {
    id: uid(),
    question: `Simplify: x^${m} × x^${n}`,
    correctAnswer: `x^${m + n}`,
    options: expOptions('x', m + n, [m * n, m, n, m + n + 1]),
    marks: 2,
    workingSteps: [`Same base, multiplying → ADD the powers`, `x^${m} × x^${n} = x^(${m}+${n}) = x^${m + n}`],
    hints: [`aᵐ × aⁿ = aᵐ⁺ⁿ`],
    calculatorAllowed: false,
    commonMistake: `Multiplying the powers (${m}×${n}) instead of adding them.`,
    examTip: `Multiplying same-base powers → ADD exponents.`,
  };
}

// ── age14-exponents L2 — Quotient Law ────────────────────────────────────────
function genExpQuotient14(): Problem {
  const m = randInt(5, 9), n = randInt(2, 4);
  return {
    id: uid(),
    question: `Simplify: x^${m} ÷ x^${n}`,
    correctAnswer: `x^${m - n}`,
    options: expOptions('x', m - n, [m + n, m, n]),
    marks: 2,
    workingSteps: [`Same base, dividing → SUBTRACT the powers`, `x^${m} ÷ x^${n} = x^(${m}−${n}) = x^${m - n}`],
    hints: [`aᵐ ÷ aⁿ = aᵐ⁻ⁿ`],
    calculatorAllowed: false,
    commonMistake: `Dividing the powers instead of subtracting them.`,
    examTip: `Dividing same-base powers → SUBTRACT exponents.`,
  };
}

// ── age14-exponents L3 — Power Law ───────────────────────────────────────────
function genExpPower14(): Problem {
  const m = randInt(2, 5), n = randInt(2, 4);
  return {
    id: uid(),
    question: `Simplify: (x^${m})^${n}`,
    correctAnswer: `x^${m * n}`,
    options: expOptions('x', m * n, [m + n, m, n]),
    marks: 2,
    workingSteps: [`Power of a power → MULTIPLY the powers`, `(x^${m})^${n} = x^(${m}×${n}) = x^${m * n}`],
    hints: [`(aᵐ)ⁿ = aᵐⁿ`],
    calculatorAllowed: false,
    commonMistake: `Adding the powers (${m}+${n}) instead of multiplying them.`,
    examTip: `Power raised to a power → MULTIPLY exponents.`,
  };
}

// ── age14-exponents L4 — Zero & Negative Exponents ───────────────────────────
function genExpZeroNeg14(): Problem {
  return fromCases([
    { q: `Evaluate: 5⁰`, c: '1', w: ['0', '5', '−5'], s: ['Any non-zero base to the power 0 is 1', '5⁰ = 1'], h: ['a⁰ = 1'], mistake: 'Writing 0 — anything to the power 0 is 1.', tip: 'b⁰ = 1 for any base b ≠ 0.' },
    { q: `Write 2⁻² as a fraction.`, c: '1/4', w: ['−4', '4', '1/2'], s: ['a⁻ⁿ = 1/aⁿ', '2⁻² = 1/2² = 1/4'], h: ['Negative power → reciprocal'], mistake: 'Making the answer negative — a negative power means a reciprocal, not a negative.', tip: 'a⁻ⁿ = 1/aⁿ.' },
    { q: `Write 2⁻³ as a fraction.`, c: '1/8', w: ['−8', '8', '1/6'], s: ['2⁻³ = 1/2³ = 1/8'], h: ['a⁻ⁿ = 1/aⁿ'], mistake: 'Computing 1/6 (2×3) instead of 1/2³.', tip: 'Cube first: 2³ = 8, then reciprocal.' },
    { q: `Evaluate: 10⁻¹`, c: '1/10', w: ['−10', '10', '0'], s: ['10⁻¹ = 1/10'], h: ['Negative power → reciprocal'], mistake: 'Writing −10.', tip: 'a⁻¹ = 1/a.' },
  ]);
}

// ── age14-exponents L5 — Scientific Notation ─────────────────────────────────
function genSciNotation14(): Problem {
  return fromCases([
    { q: `Write 45 000 in scientific notation.`, c: '4.5 × 10⁴', w: ['45 × 10³', '4.5 × 10³', '4.5 × 10⁵'], s: ['Move the point so one non-zero digit is in front', '4.5 × 10⁴ (point moved 4 places)'], h: ['One digit before the decimal point', 'Count how many places you move'], mistake: 'Miscounting the power of 10.', tip: 'a × 10ⁿ with 1 ≤ a < 10.' },
    { q: `Write 0.0032 in scientific notation.`, c: '3.2 × 10⁻³', w: ['3.2 × 10³', '32 × 10⁻⁴', '3.2 × 10⁻²'], s: ['Small number → negative power', 'Move the point 3 places right: 3.2 × 10⁻³'], h: ['Numbers < 1 give a negative power'], mistake: 'Using a positive power for a small number.', tip: 'Less than 1 → negative exponent.' },
    { q: `Write 6.7 × 10³ as an ordinary number.`, c: '6700', w: ['670', '67000', '6.7000'], s: ['10³ = 1000', '6.7 × 1000 = 6700'], h: ['Move the point 3 places right'], mistake: 'Moving the wrong number of places.', tip: 'Positive power → move right that many places.' },
    { q: `Write 250 000 in scientific notation.`, c: '2.5 × 10⁵', w: ['25 × 10⁴', '2.5 × 10⁴', '2.5 × 10⁶'], s: ['2.5 × 10⁵ (point moved 5 places)'], h: ['One digit before the point'], mistake: 'Off-by-one on the power.', tip: 'Count the places you shift the decimal point.' },
  ]);
}

// ── age14-exponents L6 — Evaluating Powers ───────────────────────────────────
function genExpEvaluate14(): Problem {
  const base = randInt(2, 5), exp = randInt(2, 4);
  const val = Math.pow(base, exp);
  return {
    id: uid(),
    question: `Evaluate: ${base}^${exp}`,
    correctAnswer: `${val}`,
    options: makeOptions(`${val}`, [`${base * exp}`, `${val + base}`, `${Math.pow(base, exp - 1)}`]),
    marks: 2,
    workingSteps: [`${base}^${exp} means ${base} multiplied by itself ${exp} times`, `= ${Array(exp).fill(base).join(' × ')} = ${val}`],
    hints: [`A power is repeated multiplication, not ${base}×${exp}`],
    calculatorAllowed: false,
    commonMistake: `Computing ${base}×${exp} = ${base * exp} instead of the power.`,
    examTip: `${base}^${exp} = ${base} × ${base} ... (${exp} times).`,
  };
}

// ── age14-exponents L7 — Simplifying with Multiple Laws ───────────────────────
function genExpSimplify14(): Problem {
  const a = randInt(2, 3), b = randInt(2, 3), p = randInt(2, 3);
  const correct = (a + b) * p;
  return {
    id: uid(),
    question: `Simplify: (x^${a} × x^${b})^${p}`,
    correctAnswer: `x^${correct}`,
    options: expOptions('x', correct, [a + b + p, a * b * p, a + b]),
    marks: 3,
    workingSteps: [`Inside the bracket: x^${a} × x^${b} = x^${a + b}`, `Then power of a power: (x^${a + b})^${p} = x^${correct}`],
    hints: [`Add the powers inside first`, `Then multiply by the outer power`],
    calculatorAllowed: false,
    commonMistake: `Mixing the laws up — add inside, THEN multiply by ${p}.`,
    examTip: `Work the bracket first, then apply the outer power.`,
  };
}

// ── age14-exponents L8 — Index Equations ─────────────────────────────────────
function genIndexEquation14(): Problem {
  return fromCases([
    { q: `Solve: 2ˣ = 32`, c: 'x = 5', w: ['x = 16', 'x = 4', 'x = 6'], s: ['Write 32 as a power of 2', '32 = 2⁵, so x = 5'], h: ['What power of 2 gives 32?'], mistake: 'Dividing 32 by 2 instead of finding the power.', tip: '2⁵ = 32.' },
    { q: `Solve: 3ˣ = 81`, c: 'x = 4', w: ['x = 27', 'x = 3', 'x = 9'], s: ['81 = 3⁴, so x = 4'], h: ['What power of 3 gives 81?'], mistake: 'Confusing 3⁴ with 3×4.', tip: '3⁴ = 81.' },
    { q: `Solve: 5ˣ = 25`, c: 'x = 2', w: ['x = 5', 'x = 3', 'x = 1'], s: ['25 = 5², so x = 2'], h: ['What power of 5 gives 25?'], mistake: 'Answering 5.', tip: '5² = 25.' },
    { q: `Solve: 2ˣ = 64`, c: 'x = 6', w: ['x = 32', 'x = 5', 'x = 8'], s: ['64 = 2⁶, so x = 6'], h: ['Keep doubling: 2,4,8,16,32,64'], mistake: 'Stopping at the wrong power.', tip: '2⁶ = 64.' },
    { q: `Solve: 10ˣ = 1000`, c: 'x = 3', w: ['x = 100', 'x = 4', 'x = 2'], s: ['1000 = 10³, so x = 3'], h: ['Count the zeros'], mistake: 'Answering 100.', tip: '10³ = 1000.' },
  ]);
}

// ── PYTHAG TRIPLES (clean answers for age13 geometry) ────────────────────────
const TRIPLES13: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]];
const fmtSign = (k: number) => (k >= 0 ? `+ ${k}` : `− ${-k}`);

// ── age13-geometry L1 — Pythagoras: Hypotenuse ───────────────────────────────
function genPythagHyp13(): Problem {
  const [a, b, c] = TRIPLES13[randInt(0, TRIPLES13.length - 1)];
  return {
    id: uid(),
    question: `A right-angled triangle has two shorter sides of ${a} cm and ${b} cm.\n\nFind the length of the hypotenuse.`,
    correctAnswer: `${c} cm`,
    options: makeOptions(`${c} cm`, [`${a + b} cm`, `${c + 1} cm`, `${c - 1} cm`]),
    marks: 3,
    workingSteps: [`c² = a² + b² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`, `c = √${a * a + b * b} = ${c} cm`],
    hints: [`Pythagoras: c² = a² + b²`, `The hypotenuse is the longest side (opposite the right angle)`],
    calculatorAllowed: true,
    commonMistake: `Adding the sides (${a} + ${b}) instead of squaring them first.`,
    examTip: `Square, add, then square-root. Show c² = ${a * a + b * b} before rooting.`,
  };
}

// ── age13-geometry L2 — Pythagoras: Shorter Side ─────────────────────────────
function genPythagLeg13(): Problem {
  const [a, b, c] = TRIPLES13[randInt(0, TRIPLES13.length - 1)];
  return {
    id: uid(),
    question: `A right-angled triangle has hypotenuse ${c} cm and one shorter side ${b} cm.\n\nFind the other shorter side.`,
    correctAnswer: `${a} cm`,
    options: makeOptions(`${a} cm`, [`${c - b} cm`, `${a + 1} cm`, `${c + b} cm`]),
    marks: 3,
    workingSteps: [`a² = c² − b² = ${c}² − ${b}² = ${c * c} − ${b * b} = ${c * c - b * b}`, `a = √${c * c - b * b} = ${a} cm`],
    hints: [`Rearrange Pythagoras: a² = c² − b²`, `Subtract (don't add) when finding a shorter side`],
    calculatorAllowed: true,
    commonMistake: `Adding instead of subtracting — to find a shorter side, SUBTRACT the squares.`,
    examTip: `Hypotenuse known → subtract: a² = c² − b².`,
  };
}

// ── age13-geometry L3 — Pythagoras Applications ──────────────────────────────
function genPythagApply13(): Problem {
  return fromCases([
    { q: `A ladder 5 m long leans against a wall, its foot 3 m from the wall.\nHow high up the wall does it reach?`, c: '4 m', w: ['2 m', '8 m', '4.5 m'], s: ['height² = 5² − 3² = 25 − 9 = 16', 'height = √16 = 4 m'], h: ['The ladder is the hypotenuse', 'a² = c² − b²'], mistake: 'Adding 5 + 3 or 5 − 3 without squaring.', tip: 'Draw the triangle: ladder = hypotenuse.' },
    { q: `A ship sails 8 km east, then 6 km north.\nHow far is it from the start (straight line)?`, c: '10 km', w: ['14 km', '2 km', '12 km'], s: ['distance² = 8² + 6² = 64 + 36 = 100', 'distance = √100 = 10 km'], h: ['The straight-line distance is the hypotenuse'], mistake: 'Adding 8 + 6 = 14.', tip: 'East then north → right angle → Pythagoras.' },
    { q: `A TV screen is 24 cm wide and 7 cm tall.\nFind the diagonal.`, c: '25 cm', w: ['31 cm', '17 cm', '24 cm'], s: ['d² = 24² + 7² = 576 + 49 = 625', 'd = √625 = 25 cm'], h: ['The diagonal is the hypotenuse'], mistake: 'Adding the two sides.', tip: 'Diagonal of a rectangle = hypotenuse.' },
    { q: `A gate is 12 m wide and 5 m tall.\nFind the length of the diagonal brace.`, c: '13 m', w: ['17 m', '7 m', '12 m'], s: ['d² = 12² + 5² = 144 + 25 = 169', 'd = √169 = 13 m'], h: ['Brace = diagonal = hypotenuse'], mistake: 'Adding 12 + 5.', tip: 'Look for the right angle, then apply Pythagoras.' },
  ]);
}

// ── age13-geometry L4 — Angles in a Triangle ─────────────────────────────────
function genTriangleAngleSum13(): Problem {
  const a = randInt(40, 80), b = randInt(30, 80);
  const third = 180 - a - b;
  return {
    id: uid(),
    question: `Two angles of a triangle are ${a}° and ${b}°.\n\nFind the third angle.`,
    correctAnswer: `${third}°`,
    options: makeOptions(`${third}°`, [`${180 - a}°`, `${third + 10}°`, `${a + b}°`]),
    marks: 2,
    workingSteps: [`Angles in a triangle add up to 180°`, `Third = 180 − ${a} − ${b} = ${third}°`],
    hints: [`The three angles of a triangle sum to 180°`],
    calculatorAllowed: false,
    commonMistake: `Subtracting from 360° instead of 180°.`,
    examTip: `Triangle angle sum = 180°.`,
  };
}

// ── age13-geometry L5 — Angles on Parallel Lines ─────────────────────────────
function genParallelAngles13(): Problem {
  return fromCases([
    { q: `Two parallel lines are cut by a transversal. One angle is 75°.\nFind its CORRESPONDING angle.`, c: '75°', w: ['105°', '15°', '180°'], s: ['Corresponding angles are EQUAL', 'So the angle is 75°'], h: ['Corresponding ("F" shape) angles are equal'], mistake: 'Treating corresponding angles as supplementary.', tip: 'Corresponding angles (F-shape) are equal.' },
    { q: `Co-interior (allied) angles on parallel lines. One is 110°.\nFind the other.`, c: '70°', w: ['110°', '250°', '20°'], s: ['Co-interior angles add up to 180°', '180 − 110 = 70°'], h: ['Co-interior ("C" shape) angles sum to 180°'], mistake: 'Saying they are equal — co-interior angles are supplementary.', tip: 'Co-interior (C-shape) angles add to 180°.' },
    { q: `Alternate angles on parallel lines. One is 50°.\nFind the other.`, c: '50°', w: ['130°', '40°', '100°'], s: ['Alternate angles are EQUAL', 'So the angle is 50°'], h: ['Alternate ("Z" shape) angles are equal'], mistake: 'Making them supplementary.', tip: 'Alternate angles (Z-shape) are equal.' },
    { q: `Vertically opposite angles. One is 130°.\nFind the other.`, c: '130°', w: ['50°', '230°', '65°'], s: ['Vertically opposite angles are EQUAL', 'So the angle is 130°'], h: ['Vertically opposite angles are equal'], mistake: 'Treating them as supplementary.', tip: 'Vertically opposite angles are always equal.' },
  ]);
}

// ── age13-geometry L6 — Exterior Angle of a Triangle ─────────────────────────
function genExteriorAngle13(): Problem {
  const a = randInt(40, 80), b = randInt(40, 80);
  return {
    id: uid(),
    question: `In a triangle, the two interior angles NOT next to an exterior angle are ${a}° and ${b}°.\n\nFind that exterior angle.`,
    correctAnswer: `${a + b}°`,
    options: makeOptions(`${a + b}°`, [`${180 - (a + b)}°`, `${a + b + 10}°`, `${180 - a}°`]),
    marks: 2,
    workingSteps: [`Exterior angle = sum of the two opposite interior angles`, `= ${a} + ${b} = ${a + b}°`],
    hints: [`The exterior angle equals the sum of the two remote interior angles`],
    calculatorAllowed: false,
    commonMistake: `Subtracting from 180° — the exterior angle is the SUM of the two far interior angles.`,
    examTip: `Exterior angle = sum of the two non-adjacent interior angles.`,
  };
}

// ── age13-geometry L7 — Angles on a Line / at a Point ────────────────────────
function genAnglesLinePoint13(): Problem {
  if (Math.random() < 0.5) {
    const a = randInt(30, 150);
    return {
      id: uid(),
      question: `Two angles lie on a straight line. One is ${a}°.\n\nFind the other.`,
      correctAnswer: `${180 - a}°`,
      options: makeOptions(`${180 - a}°`, [`${360 - a}°`, `${a}°`, `${180 - a + 10}°`]),
      marks: 2,
      workingSteps: [`Angles on a straight line add up to 180°`, `180 − ${a} = ${180 - a}°`],
      hints: [`Angles on a straight line sum to 180°`],
      calculatorAllowed: false,
      commonMistake: `Using 360° instead of 180° for a straight line.`,
      examTip: `Straight line = 180°.`,
    };
  }
  const a = randInt(60, 130), b = randInt(60, 130);
  return {
    id: uid(),
    question: `Three angles meet at a point: ${a}°, ${b}° and x.\n\nFind x.`,
    correctAnswer: `${360 - a - b}°`,
    options: makeOptions(`${360 - a - b}°`, [`${180 - a - b < 0 ? 180 : 180 - a - b}°`, `${360 - a}°`, `${360 - a - b + 10}°`]),
    marks: 2,
    workingSteps: [`Angles around a point add up to 360°`, `x = 360 − ${a} − ${b} = ${360 - a - b}°`],
    hints: [`Angles around a point sum to 360°`],
    calculatorAllowed: false,
    commonMistake: `Using 180° instead of 360° for angles around a point.`,
    examTip: `Around a point = 360°.`,
  };
}

// ── age13-geometry L8 — Isosceles Triangles ──────────────────────────────────
function genIsosceles13(): Problem {
  if (Math.random() < 0.5) {
    const apex = 2 * randInt(20, 50);
    const base = (180 - apex) / 2;
    return {
      id: uid(),
      question: `An isosceles triangle has an apex (top) angle of ${apex}°.\n\nFind each base angle.`,
      correctAnswer: `${base}°`,
      options: makeOptions(`${base}°`, [`${180 - apex}°`, `${base + 10}°`, `${apex}°`]),
      marks: 3,
      workingSteps: [`The two base angles are equal`, `Base angles = (180 − ${apex}) ÷ 2 = ${180 - apex} ÷ 2 = ${base}°`],
      hints: [`Base angles of an isosceles triangle are equal`, `Subtract the apex from 180, then halve`],
      calculatorAllowed: false,
      commonMistake: `Forgetting to halve after subtracting the apex angle.`,
      examTip: `Two equal base angles: (180 − apex) ÷ 2.`,
    };
  }
  const base = randInt(40, 70);
  const apex = 180 - 2 * base;
  return {
    id: uid(),
    question: `An isosceles triangle has base angles of ${base}° each.\n\nFind the apex (top) angle.`,
    correctAnswer: `${apex}°`,
    options: makeOptions(`${apex}°`, [`${base}°`, `${180 - base}°`, `${apex + 10}°`]),
    marks: 3,
    workingSteps: [`The two base angles are equal: ${base}° + ${base}° = ${2 * base}°`, `Apex = 180 − ${2 * base} = ${apex}°`],
    hints: [`Both base angles are ${base}°`, `Subtract their sum from 180°`],
    calculatorAllowed: false,
    commonMistake: `Subtracting only one base angle instead of both.`,
    examTip: `Apex = 180 − 2 × (base angle).`,
  };
}

// ── age13-graphs L1 — Gradient from Two Points ───────────────────────────────
function genGradient2pts13(): Problem {
  const m = [-3, -2, -1, 1, 2, 3][randInt(0, 5)];
  const x1 = randInt(0, 4), dx = randInt(1, 3), x2 = x1 + dx;
  const y1 = randInt(-3, 5), y2 = y1 + m * dx;
  return {
    id: uid(),
    question: `Find the gradient of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`,
    correctAnswer: `${m}`,
    options: makeOptions(`${m}`, [`${-m}`, `${m + 1}`, `${dx}`]),
    marks: 3,
    workingSteps: [`m = (y₂ − y₁)/(x₂ − x₁)`, `= (${y2} − ${y1})/(${x2} − ${x1}) = ${m * dx}/${dx} = ${m}`],
    hints: [`Gradient = rise ÷ run`, `(y₂ − y₁)/(x₂ − x₁)`],
    calculatorAllowed: false,
    commonMistake: `Dividing run by rise (upside down).`,
    examTip: `Keep the order consistent: change in y over change in x.`,
  };
}

// ── age13-graphs L2 — Read m and c ───────────────────────────────────────────
function genReadMC13(): Problem {
  const m = randInt(2, 5), c = randInt(-5, 5);
  return {
    id: uid(),
    question: `For the line y = ${m}x ${fmtSign(c)}, state the gradient and y-intercept.`,
    correctAnswer: `gradient ${m}, y-intercept ${c}`,
    options: makeOptions(`gradient ${m}, y-intercept ${c}`, [`gradient ${c}, y-intercept ${m}`, `gradient ${m + 1}, y-intercept ${c}`, `gradient ${m}, y-intercept ${c + 1}`]),
    marks: 2,
    workingSteps: [`Compare with y = mx + c`, `m = ${m} (gradient), c = ${c} (y-intercept)`],
    hints: [`y = mx + c: m is the gradient, c is the y-intercept`],
    calculatorAllowed: false,
    commonMistake: `Swapping m and c.`,
    examTip: `The number in front of x is the gradient; the constant is the y-intercept.`,
  };
}

// ── age13-graphs L3 — y-Intercept ────────────────────────────────────────────
function genYIntercept13(): Problem {
  const m = randInt(2, 5), c = randInt(-6, 6);
  return {
    id: uid(),
    question: `Where does y = ${m}x ${fmtSign(c)} cross the y-axis?`,
    correctAnswer: `(0, ${c})`,
    options: makeOptions(`(0, ${c})`, [`(${c}, 0)`, `(0, ${m})`, `(0, ${c + 1})`]),
    marks: 2,
    workingSteps: [`At the y-axis, x = 0`, `y = ${m}(0) ${fmtSign(c)} = ${c}`, `Point: (0, ${c})`],
    hints: [`Set x = 0`],
    calculatorAllowed: false,
    commonMistake: `Writing (${c}, 0) — the y-intercept has x = 0.`,
    examTip: `y-intercept: set x = 0. It's the constant c.`,
  };
}

// ── age13-graphs L4 — x-Intercept ────────────────────────────────────────────
function genXIntercept13(): Problem {
  const r = randInt(1, 5), m = randInt(2, 4), c = -m * r;
  return {
    id: uid(),
    question: `Where does y = ${m}x ${fmtSign(c)} cross the x-axis?`,
    correctAnswer: `(${r}, 0)`,
    options: makeOptions(`(${r}, 0)`, [`(0, ${c})`, `(${-r}, 0)`, `(${r + 1}, 0)`]),
    marks: 3,
    workingSteps: [`At the x-axis, y = 0`, `${m}x ${fmtSign(c)} = 0 → ${m}x = ${m * r}`, `x = ${r}, so (${r}, 0)`],
    hints: [`Set y = 0 and solve for x`],
    calculatorAllowed: false,
    commonMistake: `Setting x = 0 — that gives the y-intercept, not the x-intercept.`,
    examTip: `x-intercept: set y = 0.`,
  };
}

// ── age13-graphs L5 — Point on a Line ────────────────────────────────────────
function genPointOnLine13(): Problem {
  const m = randInt(2, 4), c = randInt(-4, 5), x = randInt(1, 6);
  const y = m * x + c;
  return {
    id: uid(),
    question: `Find y when x = ${x} on the line y = ${m}x ${fmtSign(c)}.`,
    correctAnswer: `${y}`,
    options: makeOptions(`${y}`, [`${m * x}`, `${y + m}`, `${m + x + c}`]),
    marks: 2,
    workingSteps: [`Substitute x = ${x}`, `y = ${m}(${x}) ${fmtSign(c)} = ${m * x} ${fmtSign(c)} = ${y}`],
    hints: [`Put x = ${x} into the equation`],
    calculatorAllowed: false,
    commonMistake: `Forgetting to add the constant ${c}.`,
    examTip: `Substitute the x-value and simplify.`,
  };
}

// ── age13-graphs L6 — Parallel Lines ─────────────────────────────────────────
function genParallelGradient13(): Problem {
  return fromCases([
    { q: `A line has gradient 3.\nWhat is the gradient of any line parallel to it?`, c: '3', w: ['−3', '1/3', '−1/3'], s: ['Parallel lines have the SAME gradient', 'Gradient = 3'], h: ['Parallel → equal gradients'], mistake: 'Using the negative reciprocal (that is perpendicular).', tip: 'Parallel lines share the same gradient.' },
    { q: `Which line is parallel to y = 4x + 2?`, c: 'y = 4x − 7', w: ['y = −4x + 2', 'y = 2x + 4', 'y = (1/4)x + 2'], s: ['Parallel means the same gradient (4)', 'y = 4x − 7 has gradient 4'], h: ['Match the number in front of x'], mistake: 'Matching the y-intercept instead of the gradient.', tip: 'Same gradient → parallel.' },
    { q: `Are y = 2x + 1 and y = 2x − 5 parallel?`, c: 'Yes — same gradient', w: ['No — different y-intercepts', 'No — they cross', 'Only at x = 0'], s: ['Both have gradient 2', 'Equal gradients → parallel'], h: ['Compare the gradients'], mistake: 'Thinking different y-intercepts means not parallel.', tip: 'Different y-intercepts but equal gradients = parallel.' },
    { q: `Parallel lines always have ______ gradients.`, c: 'equal', w: ['opposite', 'reciprocal', 'zero'], s: ['Parallel ⇒ equal gradients'], h: ['Think about lines that never meet'], mistake: 'Confusing with perpendicular (negative reciprocal).', tip: 'Parallel = equal gradients.' },
  ]);
}

// ── age13-graphs L7 — Find x from y (table) ──────────────────────────────────
function genTableValue13(): Problem {
  const m = randInt(2, 4), x = randInt(1, 6), c = randInt(-3, 5);
  const y = m * x + c;
  return {
    id: uid(),
    question: `For y = ${m}x ${fmtSign(c)}, find the value of x when y = ${y}.`,
    correctAnswer: `${x}`,
    options: makeOptions(`${x}`, [`${x + 1}`, `${y - c}`, `${y}`]),
    marks: 3,
    workingSteps: [`${m}x ${fmtSign(c)} = ${y}`, `${m}x = ${y - c}`, `x = ${x}`],
    hints: [`Substitute y = ${y}, then solve for x`],
    calculatorAllowed: false,
    commonMistake: `Forgetting to undo the constant before dividing.`,
    examTip: `Treat it as an equation: solve for x.`,
  };
}

// ── age13-graphs L8 — Midpoint ───────────────────────────────────────────────
function genMidpointGraph13(): Problem {
  const x1 = randInt(0, 8), x2 = x1 + 2 * randInt(1, 4);
  const y1 = randInt(0, 8), y2 = y1 + 2 * randInt(1, 4);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return {
    id: uid(),
    question: `Find the midpoint of (${x1}, ${y1}) and (${x2}, ${y2}).`,
    correctAnswer: `(${mx}, ${my})`,
    options: makeOptions(`(${mx}, ${my})`, [`(${x2 - x1}, ${y2 - y1})`, `(${x1 + x2}, ${y1 + y2})`, `(${mx + 1}, ${my})`]),
    marks: 2,
    workingSteps: [`Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2)`, `= ((${x1}+${x2})/2, (${y1}+${y2})/2) = (${mx}, ${my})`],
    hints: [`Average the x's and the y's`],
    calculatorAllowed: false,
    commonMistake: `Subtracting the coordinates instead of averaging.`,
    examTip: `Midpoint = average of the endpoints.`,
  };
}

// ── age13-numbers L1 — Adding & Subtracting Integers ─────────────────────────
function genIntegerAddSub13(): Problem {
  const t = randInt(0, 2);
  let q: string, ans: number;
  if (t === 0) { const a = randInt(2, 9), x = randInt(2, 12); q = `(−${a}) + ${x}`; ans = x - a; }
  else if (t === 1) { const x = randInt(1, 9), p = randInt(2, 9); q = `${x} − (−${p})`; ans = x + p; }
  else { const a = randInt(2, 9), b = randInt(2, 9); q = `(−${a}) − ${b}`; ans = -(a + b); }
  return {
    id: uid(),
    question: `Calculate:  ${q}`,
    correctAnswer: `${ans}`,
    options: makeOptions(`${ans}`, [`${-ans}`, `${ans + 1}`, `${ans - 1}`]),
    marks: 2,
    workingSteps: [t === 1 ? `Subtracting a negative is the same as adding: ${q} = ${ans}` : `${q} = ${ans}`],
    hints: [`Two minus signs together make a plus`, `Use a number line if unsure`],
    calculatorAllowed: false,
    commonMistake: `Mishandling the double negative — − (−p) becomes + p.`,
    examTip: `− (−n) = + n.`,
  };
}

// ── age13-numbers L2 — Multiplying & Dividing Integers ───────────────────────
function genIntegerMulDiv13(): Problem {
  const t = randInt(0, 2);
  const a = randInt(2, 9), b = randInt(2, 9);
  let q: string, ans: number;
  if (t === 0) { q = `(−${a}) × ${b}`; ans = -(a * b); }
  else if (t === 1) { q = `(−${a}) × (−${b})`; ans = a * b; }
  else { q = `${a * b} ÷ (−${b})`; ans = -a; }
  return {
    id: uid(),
    question: `Calculate:  ${q}`,
    correctAnswer: `${ans}`,
    options: makeOptions(`${ans}`, [`${-ans}`, `${ans + 1}`, `${ans - 1}`]),
    marks: 2,
    workingSteps: [`Apply the sign rule, then the numbers`, `${q} = ${ans}`],
    hints: [`Same signs → positive; different signs → negative`],
    calculatorAllowed: false,
    commonMistake: `Getting the sign wrong — two negatives multiply to a positive.`,
    examTip: `(−)(−) = +,  (−)(+) = −.`,
  };
}

// ── age13-numbers L3 — Order of Operations (BODMAS) ──────────────────────────
function genBODMAS13(): Problem {
  const t = randInt(0, 2);
  const a = randInt(2, 9), b = randInt(2, 6), c = randInt(2, 6);
  let q: string, ans: number;
  if (t === 0) { q = `${a} + ${b} × ${c}`; ans = a + b * c; }
  else if (t === 1) { q = `(${a} + ${b}) × ${c}`; ans = (a + b) * c; }
  else { q = `${a} × ${b} − ${c}`; ans = a * b - c; }
  return {
    id: uid(),
    question: `Calculate:  ${q}`,
    correctAnswer: `${ans}`,
    options: makeOptions(`${ans}`, [`${(a + b) * c === ans ? a + b * c : (a + b) * c}`, `${ans + 1}`, `${ans - 2}`]),
    marks: 2,
    workingSteps: [`Follow BODMAS: brackets, then × ÷, then + −`, `${q} = ${ans}`],
    hints: [`Do brackets and multiplication before addition`],
    calculatorAllowed: false,
    commonMistake: `Working strictly left to right instead of following BODMAS.`,
    examTip: `Brackets → Orders → ÷× → +−.`,
  };
}

// ── age13-numbers L4 — HCF & LCM ─────────────────────────────────────────────
function genHCFLCM13(): Problem {
  const pairs: [number, number][] = [[12, 18], [8, 12], [15, 20], [6, 9], [10, 15], [14, 21], [16, 24]];
  const [a, b] = pairs[randInt(0, pairs.length - 1)];
  const g = gcd(a, b), l = (a * b) / g;
  if (Math.random() < 0.5) {
    return {
      id: uid(),
      question: `Find the highest common factor (HCF) of ${a} and ${b}.`,
      correctAnswer: `${g}`,
      options: makeOptions(`${g}`, [`${l}`, `${g * 2}`, `${a}`]),
      marks: 2,
      workingSteps: [`List common factors of ${a} and ${b}`, `The highest is ${g}`],
      hints: [`HCF = biggest number that divides BOTH`],
      calculatorAllowed: false,
      commonMistake: `Giving the LCM (${l}) instead of the HCF.`,
      examTip: `HCF = Highest Common Factor (divides both).`,
    };
  }
  return {
    id: uid(),
    question: `Find the lowest common multiple (LCM) of ${a} and ${b}.`,
    correctAnswer: `${l}`,
    options: makeOptions(`${l}`, [`${g}`, `${a * b}`, `${l + a}`]),
    marks: 2,
    workingSteps: [`LCM = (${a} × ${b}) ÷ HCF = ${a * b} ÷ ${g} = ${l}`],
    hints: [`LCM = smallest number BOTH divide into`],
    calculatorAllowed: false,
    commonMistake: `Giving the HCF (${g}) instead of the LCM.`,
    examTip: `LCM = Lowest Common Multiple. Tip: a×b ÷ HCF.`,
  };
}

// ── age13-numbers L5 — Squares & Roots ───────────────────────────────────────
function genSquaresRoots13(): Problem {
  const n = randInt(4, 12);
  if (Math.random() < 0.5) {
    return {
      id: uid(),
      question: `Evaluate:  ${n}²`,
      correctAnswer: `${n * n}`,
      options: makeOptions(`${n * n}`, [`${n * 2}`, `${n * n + 1}`, `${n * n - n}`]),
      marks: 1,
      workingSteps: [`${n}² = ${n} × ${n} = ${n * n}`],
      hints: [`Squaring means multiplying by itself, not by 2`],
      calculatorAllowed: false,
      commonMistake: `Computing ${n} × 2 = ${n * 2} instead of ${n} × ${n}.`,
      examTip: `n² = n × n.`,
    };
  }
  return {
    id: uid(),
    question: `Evaluate:  √${n * n}`,
    correctAnswer: `${n}`,
    options: makeOptions(`${n}`, [`${n * n / 2}`, `${n + 1}`, `${n - 1}`]),
    marks: 1,
    workingSteps: [`√${n * n} asks: what number squared gives ${n * n}?`, `${n} × ${n} = ${n * n}, so √${n * n} = ${n}`],
    hints: [`Find the number that squares to ${n * n}`],
    calculatorAllowed: false,
    commonMistake: `Halving instead of taking the square root.`,
    examTip: `√ undoes squaring.`,
  };
}

// ── age13-numbers L6 — Rounding ──────────────────────────────────────────────
function genRounding13(): Problem {
  return fromCases([
    { q: `Round 3847 to the nearest 100.`, c: '3800', w: ['3900', '3850', '4000'], s: ['The tens digit is 4 (< 5), so round down', '3847 → 3800'], h: ['Look at the digit after the rounding place'], mistake: 'Rounding up when the next digit is below 5.', tip: '5 or more rounds up; less than 5 rounds down.' },
    { q: `Round 2.567 to 1 decimal place.`, c: '2.6', w: ['2.5', '2.57', '3.0'], s: ['Second decimal is 6 (≥ 5), round up', '2.567 → 2.6'], h: ['Look at the 2nd decimal digit'], mistake: 'Keeping too many decimals.', tip: '1 d.p. → look at the 2nd decimal.' },
    { q: `Round 48 to the nearest 10.`, c: '50', w: ['40', '48', '60'], s: ['Units digit is 8 (≥ 5), round up', '48 → 50'], h: ['8 is ≥ 5'], mistake: 'Rounding down to 40.', tip: 'Nearest 10: check the units digit.' },
    { q: `Round 6 392 to the nearest 1000.`, c: '6000', w: ['7000', '6400', '6300'], s: ['Hundreds digit is 3 (< 5), round down', '6 392 → 6000'], h: ['Look at the hundreds digit'], mistake: 'Rounding up incorrectly.', tip: 'Nearest 1000: check the hundreds digit.' },
  ]);
}

// ── age13-numbers L7 — Directed Numbers in Context ───────────────────────────
function genIntegerWord13(): Problem {
  return fromCases([
    { q: `The temperature was −3°C and rose by 8°C.\nWhat is the new temperature?`, c: '5°C', w: ['−11°C', '11°C', '−5°C'], s: ['−3 + 8 = 5°C'], h: ['Rising = adding'], mistake: 'Subtracting instead of adding the rise.', tip: 'A rise adds; a fall subtracts.' },
    { q: `A diver is 12 m below sea level and descends another 7 m.\nWhat is the new depth?`, c: '19 m below', w: ['5 m below', '19 m above', '5 m above'], s: ['−12 − 7 = −19, i.e. 19 m below'], h: ['Descending makes the depth more negative'], mistake: 'Subtracting the two depths instead of adding the descent.', tip: 'Going deeper adds to the depth.' },
    { q: `The temperature fell from 4°C to −6°C.\nBy how many degrees did it fall?`, c: '10°C', w: ['2°C', '−2°C', '6°C'], s: ['4 − (−6) = 4 + 6 = 10°C'], h: ['Difference = higher − lower'], mistake: 'Getting 2 by subtracting 6 − 4.', tip: 'Across zero, ADD the two distances.' },
    { q: `A submarine at −150 m rises 60 m.\nWhat is its new depth?`, c: '−90 m', w: ['−210 m', '90 m', '210 m'], s: ['−150 + 60 = −90 m'], h: ['Rising adds'], mistake: 'Adding to the depth instead of reducing it.', tip: 'Rising reduces depth (adds toward zero).' },
  ]);
}

// ── age13-numbers L8 — Primes & Factors ──────────────────────────────────────
function genPrimes13(): Problem {
  return fromCases([
    { q: `Which of these is a prime number?\n9,  15,  17,  21`, c: '17', w: ['9', '15', '21'], s: ['A prime has exactly two factors: 1 and itself', '17 = 1 × 17 only'], h: ['Check which has no factors other than 1 and itself'], mistake: 'Picking an odd number that is not prime (9 = 3×3).', tip: 'Odd ≠ prime. Test for factors.' },
    { q: `Is 1 a prime number?`, c: 'No', w: ['Yes', 'Sometimes', 'Only if odd'], s: ['A prime needs exactly TWO different factors', '1 has only one factor (itself)'], h: ['How many factors does 1 have?'], mistake: 'Assuming 1 is prime.', tip: '1 is NOT prime (it has only one factor).' },
    { q: `Write 12 as a product of its prime factors.`, c: '2² × 3', w: ['2 × 6', '3 × 4', '2 × 3 × 3'], s: ['12 = 2 × 2 × 3', '= 2² × 3'], h: ['Keep dividing by primes'], mistake: 'Leaving composite factors like 6 or 4.', tip: 'Break down until every factor is prime.' },
    { q: `What is the smallest prime number?`, c: '2', w: ['1', '3', '0'], s: ['2 is prime and is the smallest', 'It is also the only even prime'], h: ['1 is not prime'], mistake: 'Saying 1.', tip: '2 is the smallest (and only even) prime.' },
  ]);
}

// ── age13-proportion L1 — Sharing in a Ratio ─────────────────────────────────
function genRatioShare13(): Problem {
  const p = randInt(1, 4), q = randInt(1, 4), unit = randInt(2, 9) * 10;
  const total = (p + q) * unit;
  return {
    id: uid(),
    question: `Share R${total} between A and B in the ratio ${p} : ${q}.\n\nHow much does A receive?`,
    correctAnswer: `R${p * unit}`,
    options: makeOptions(`R${p * unit}`, [`R${q * unit}`, `R${Math.round(total / 2)}`, `R${p * unit + unit}`]),
    marks: 3,
    workingSteps: [`Total parts = ${p} + ${q} = ${p + q}`, `One part = ${total} ÷ ${p + q} = ${unit}`, `A = ${p} × ${unit} = R${p * unit}`],
    hints: [`Find the total parts, then the value of one part`],
    calculatorAllowed: true,
    commonMistake: `Splitting equally instead of by the ratio.`,
    examTip: `Value of one part = total ÷ sum of parts.`,
  };
}

// ── age13-proportion L2 — Simplifying Ratios ─────────────────────────────────
function genSimplifyRatio13(): Problem {
  const g = randInt(2, 6);
  const [a, b] = COPRIME_PAIRS[randInt(0, COPRIME_PAIRS.length - 1)];
  const A = g * a, B = g * b;
  return {
    id: uid(),
    question: `Simplify the ratio  ${A} : ${B}`,
    correctAnswer: `${a} : ${b}`,
    options: makeOptions(`${a} : ${b}`, [`${b} : ${a}`, `${a} : ${b + 1}`, `${a * 2} : ${b * 2}`]),
    marks: 2,
    workingSteps: [`Divide both parts by their HCF (${g})`, `${A} ÷ ${g} = ${a},  ${B} ÷ ${g} = ${b}`, `= ${a} : ${b}`],
    hints: [`Divide both sides by the highest common factor`],
    calculatorAllowed: false,
    commonMistake: `Dividing by a factor that isn't the highest, leaving it not fully simplified.`,
    examTip: `Keep dividing until the two parts share no common factor.`,
  };
}

// ── age13-proportion L3 — Unit Rates ─────────────────────────────────────────
function genUnitRate13(): Problem {
  if (Math.random() < 0.5) {
    const n = randInt(2, 8), price = randInt(2, 9), total = n * price;
    return {
      id: uid(),
      question: `${n} identical pens cost R${total} in total.\n\nFind the cost of ONE pen.`,
      correctAnswer: `R${price}`,
      options: makeOptions(`R${price}`, [`R${total}`, `R${price + 1}`, `R${n}`]),
      marks: 2,
      workingSteps: [`Cost of one = total ÷ number`, `R${total} ÷ ${n} = R${price}`],
      hints: [`Divide the total by how many there are`],
      calculatorAllowed: true,
      commonMistake: `Multiplying instead of dividing.`,
      examTip: `Unit price = total ÷ quantity.`,
    };
  }
  const s = [40, 50, 60, 80][randInt(0, 3)], t = randInt(2, 5), d = s * t;
  return {
    id: uid(),
    question: `A car travels ${d} km in ${t} hours at a steady speed.\n\nFind its speed.`,
    correctAnswer: `${s} km/h`,
    options: makeOptions(`${s} km/h`, [`${d} km/h`, `${s + 10} km/h`, `${d - t} km/h`]),
    marks: 2,
    workingSteps: [`Speed = distance ÷ time`, `${d} ÷ ${t} = ${s} km/h`],
    hints: [`Speed = distance ÷ time`],
    calculatorAllowed: true,
    commonMistake: `Multiplying distance by time.`,
    examTip: `Speed = distance ÷ time.`,
  };
}

// ── age13-proportion L4 — Percentage of an Amount ────────────────────────────
function genPercentOf13(): Problem {
  const p = [5, 10, 20, 25, 50][randInt(0, 4)], n = randInt(1, 9) * 20;
  const ans = (n * p) / 100;
  return {
    id: uid(),
    question: `Find ${p}% of ${n}.`,
    correctAnswer: `${ans}`,
    options: makeOptions(`${ans}`, [`${ans + p}`, `${Math.round(n / p)}`, `${ans * 2}`]),
    marks: 2,
    workingSteps: [`${p}% = ${p}/100`, `${p}/100 × ${n} = ${ans}`],
    hints: [`"of" means multiply`, `${p}% = ${p / 100}`],
    calculatorAllowed: true,
    commonMistake: `Dividing by the percentage instead of multiplying by p/100.`,
    examTip: `x% of N = (x/100) × N.`,
  };
}

// ── age13-proportion L5 — Percentage Change ──────────────────────────────────
function genPercentChange13(): Problem {
  const P = randInt(2, 9) * 100, r = [10, 20, 25, 50][randInt(0, 3)];
  const inc = Math.random() < 0.5, delta = (P * r) / 100, val = inc ? P + delta : P - delta;
  return {
    id: uid(),
    question: `A price of R${P} ${inc ? 'increases' : 'decreases'} by ${r}%.\n\nFind the new price.`,
    correctAnswer: `R${val}`,
    options: makeOptions(`R${val}`, [`R${delta}`, `R${inc ? P - delta : P + delta}`, `R${val + (inc ? delta : -delta)}`]),
    marks: 3,
    workingSteps: [`${r}% of ${P} = ${delta}`, `New price = ${P} ${inc ? '+' : '−'} ${delta} = R${val}`],
    hints: [`Find the change first, then ${inc ? 'add it' : 'subtract it'}`],
    calculatorAllowed: true,
    commonMistake: `Giving just the change (${delta}) instead of the new price.`,
    examTip: `Find the % amount, then ${inc ? 'add to' : 'subtract from'} the original.`,
  };
}

// ── age13-proportion L6 — Unit Conversion ────────────────────────────────────
function genUnitConvert13(): Problem {
  return fromCases([
    { q: `Convert 3 km to metres.`, c: '3000 m', w: ['300 m', '30 m', '30000 m'], s: ['1 km = 1000 m', '3 × 1000 = 3000 m'], h: ['1 km = 1000 m'], mistake: 'Wrong power of ten.', tip: 'km → m: × 1000.', calc: true },
    { q: `Convert 2.5 m to centimetres.`, c: '250 cm', w: ['25 cm', '2500 cm', '0.025 cm'], s: ['1 m = 100 cm', '2.5 × 100 = 250 cm'], h: ['1 m = 100 cm'], mistake: 'Using 1000 instead of 100.', tip: 'm → cm: × 100.', calc: true },
    { q: `Convert 4000 g to kilograms.`, c: '4 kg', w: ['40 kg', '400 kg', '0.4 kg'], s: ['1 kg = 1000 g', '4000 ÷ 1000 = 4 kg'], h: ['g → kg: ÷ 1000'], mistake: 'Dividing by the wrong amount.', tip: 'g → kg: ÷ 1000.', calc: true },
    { q: `Convert 3 hours to minutes.`, c: '180 min', w: ['30 min', '300 min', '120 min'], s: ['1 hour = 60 minutes', '3 × 60 = 180 min'], h: ['1 hour = 60 min'], mistake: 'Using 100 instead of 60.', tip: 'hours → min: × 60.', calc: true },
  ]);
}

// ── age13-proportion L7 — Best Buy ───────────────────────────────────────────
function genBestBuy13(): Problem {
  return fromCases([
    { q: `Which is better value?\n• 2 L of juice for R24\n• 3 L of juice for R30`, c: '3 L for R30', w: ['2 L for R24', 'Same value', 'Cannot tell'], s: ['2 L: 24 ÷ 2 = R12/L', '3 L: 30 ÷ 3 = R10/L', 'R10/L is cheaper'], h: ['Find the price per litre for each'], mistake: 'Choosing the cheaper total instead of the better unit price.', tip: 'Compare price per unit, not the total.', calc: true },
    { q: `Which is better value?\n• 500 g for R15\n• 1 kg for R28`, c: '1 kg for R28', w: ['500 g for R15', 'Same value', 'Cannot tell'], s: ['500 g → R30/kg', '1 kg → R28/kg', 'R28/kg is cheaper'], h: ['Scale both to the same amount (per kg)'], mistake: 'Comparing different quantities directly.', tip: 'Put both on a per-kg basis.', calc: true },
    { q: `Which is better value?\n• 4 rolls for R20\n• 6 rolls for R27`, c: '6 rolls for R27', w: ['4 rolls for R20', 'Same value', 'Cannot tell'], s: ['4 rolls: R5 each', '6 rolls: R4.50 each', 'R4.50 is cheaper'], h: ['Find the cost of one roll for each'], mistake: 'Picking the smaller total.', tip: 'Unit price decides best value.', calc: true },
  ]);
}

// ── age13-proportion L8 — Scale & Maps ───────────────────────────────────────
function genScale13(): Problem {
  return fromCases([
    { q: `A map scale is 1 cm : 5 km.\nA road is 4 cm long on the map.\nFind its real length.`, c: '20 km', w: ['9 km', '1.25 km', '45 km'], s: ['Each 1 cm = 5 km', '4 × 5 = 20 km'], h: ['Multiply map distance by the scale'], mistake: 'Adding instead of multiplying.', tip: 'Real = map distance × scale.', calc: true },
    { q: `A scale is 1 cm : 2 m.\nA wall is 6 cm on the plan.\nFind the real length.`, c: '12 m', w: ['3 m', '8 m', '6 m'], s: ['Each 1 cm = 2 m', '6 × 2 = 12 m'], h: ['Multiply by 2 m per cm'], mistake: 'Dividing by the scale.', tip: 'Real = plan length × scale.', calc: true },
    { q: `A model uses scale 1 : 100.\nThe model car is 4 cm long.\nFind the real length in cm.`, c: '400 cm', w: ['25 cm', '104 cm', '40 cm'], s: ['Real = 4 × 100 = 400 cm'], h: ['1 : 100 means real is 100× bigger'], mistake: 'Dividing instead of multiplying.', tip: '1 : n → multiply the model size by n.', calc: true },
  ]);
}

// ── age13-data L1 — Single-Event Probability ─────────────────────────────────
function genSingleProb13(): Problem {
  const r = randInt(2, 5), b = randInt(2, 5), g = randInt(2, 5);
  const total = r + b + g, which = randInt(0, 2);
  const cnt = [r, b, g][which], name = ['red', 'blue', 'green'][which];
  const correct = simplify(cnt, total);
  return {
    id: uid(),
    question: `A bag has ${r} red, ${b} blue and ${g} green balls.\nOne ball is taken at random.\n\nFind P(${name}).`,
    correctAnswer: correct,
    options: makeOptions(correct, [simplify(total - cnt, total), `${cnt}/${total + 1}`, simplify(cnt + 1, total)]),
    marks: 2,
    workingSteps: [`P = favourable ÷ total = ${cnt}/${total}`, `= ${correct}`],
    hints: [`Total balls = ${total}`, `P = favourable / total`],
    calculatorAllowed: false,
    commonMistake: `Using the wrong total — count ALL the balls.`,
    examTip: `Always simplify the probability fraction.`,
  };
}

// ── age13-data L2 — Complementary Events ─────────────────────────────────────
function genComplement13(): Problem {
  const total = randInt(8, 12), fav = randInt(2, total - 2);
  const correct = simplify(total - fav, total);
  return {
    id: uid(),
    question: `A bag has ${total} sweets; ${fav} are red.\nOne is taken at random.\n\nFind P(NOT red).`,
    correctAnswer: correct,
    options: makeOptions(correct, [simplify(fav, total), `${total - fav}/${total + 1}`, simplify(total - fav + 1, total)]),
    marks: 2,
    workingSteps: [`P(not red) = 1 − P(red) = 1 − ${fav}/${total}`, `= ${total - fav}/${total} = ${correct}`],
    hints: [`P(not A) = 1 − P(A)`],
    calculatorAllowed: false,
    commonMistake: `Giving P(red) instead of its complement.`,
    examTip: `Complement rule: P(not A) = 1 − P(A).`,
  };
}

// ── age13-data L3 — Independent Events ───────────────────────────────────────
function genIndependent13(): Problem {
  return fromCases([
    { q: `A coin is tossed and a dice is rolled.\nFind P(heads AND a 6).`, c: '1/12', w: ['1/8', '7/12', '1/6'], s: ['P(heads) = 1/2, P(6) = 1/6', 'Independent → multiply: 1/2 × 1/6 = 1/12'], h: ['"AND" with independent events → multiply'], mistake: 'Adding the probabilities.', tip: 'Independent + AND → multiply.' },
    { q: `Two coins are tossed.\nFind P(heads AND heads).`, c: '1/4', w: ['1/2', '1/3', '2/4'], s: ['1/2 × 1/2 = 1/4'], h: ['Multiply the two probabilities'], mistake: 'Saying 1/2.', tip: 'Each toss is 1/2; multiply them.' },
    { q: `A dice is rolled twice.\nFind P(a 6 AND a 6).`, c: '1/36', w: ['1/12', '2/6', '1/6'], s: ['1/6 × 1/6 = 1/36'], h: ['Multiply 1/6 by 1/6'], mistake: 'Adding to get 2/6.', tip: 'Independent rolls → multiply.' },
    { q: `P(rain) = 1/3 and P(late bus) = 1/2, independently.\nFind P(both happen).`, c: '1/6', w: ['5/6', '1/5', '2/3'], s: ['1/3 × 1/2 = 1/6'], h: ['Multiply the probabilities'], mistake: 'Adding the fractions.', tip: 'Independent AND → multiply.' },
  ]);
}

// ── age13-data L4 — Mean ─────────────────────────────────────────────────────
function genMean13(): Problem {
  // build 5 values whose total is divisible by 5 for a clean mean
  const base = Array.from({ length: 4 }, () => randInt(2, 18));
  const sum4 = base.reduce((a, b) => a + b, 0);
  const last = (5 * randInt(4, 14)) - sum4;
  const d = [...base, last].filter(v => v >= 1);
  while (d.length < 5) d.push(randInt(2, 12));
  const total = d.reduce((a, b) => a + b, 0);
  const mean = Math.round(total / d.length);
  const realMean = total / d.length;
  const correct = Number.isInteger(realMean) ? `${realMean}` : realMean.toFixed(1);
  return {
    id: uid(),
    question: `Find the mean of:\n${d.join(', ')}`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${mean + 1}`, `${d[2]}`, `${total}`]),
    marks: 2,
    workingSteps: [`Sum = ${d.join(' + ')} = ${total}`, `Mean = ${total} ÷ ${d.length} = ${correct}`],
    hints: [`Mean = sum ÷ how many values`],
    calculatorAllowed: true,
    commonMistake: `Dividing by the wrong count — there are ${d.length} values.`,
    examTip: `Mean = total ÷ number of values.`,
  };
}

// ── age13-data L5 — Median & Mode ────────────────────────────────────────────
function genMedianMode13(): Problem {
  const d = Array.from({ length: 5 }, () => randInt(1, 15)).sort((a, b) => a - b);
  if (Math.random() < 0.5) {
    const median = d[2];
    return {
      id: uid(),
      question: `Find the median of:\n${d.join(', ')}`,
      correctAnswer: `${median}`,
      options: makeOptions(`${median}`, [`${d[1]}`, `${d[3]}`, `${Math.round(d.reduce((a, b) => a + b, 0) / 5)}`]),
      marks: 2,
      workingSteps: [`Data is in order; 5 values → middle is the 3rd`, `Median = ${median}`],
      hints: [`Median = middle value when sorted`],
      calculatorAllowed: false,
      commonMistake: `Confusing the median with the mean.`,
      examTip: `Sort first, then take the middle value.`,
    };
  }
  const modeVal = d[randInt(0, 3)];
  const withMode = [...d, modeVal].sort((a, b) => a - b);
  return {
    id: uid(),
    question: `Find the mode of:\n${withMode.join(', ')}`,
    correctAnswer: `${modeVal}`,
    options: makeOptions(`${modeVal}`, [`${withMode[0]}`, `${withMode[withMode.length - 1]}`, `${withMode[2]}`]),
    marks: 2,
    workingSteps: [`The mode is the most frequent value`, `${modeVal} appears twice → mode = ${modeVal}`],
    hints: [`Mode = the value that appears most often`],
    calculatorAllowed: false,
    commonMistake: `Confusing mode with median.`,
    examTip: `Mode = most frequent value.`,
  };
}

// ── age13-data L6 — Range ────────────────────────────────────────────────────
function genRange13(): Problem {
  const d = Array.from({ length: 6 }, () => randInt(5, 45));
  const mx = Math.max(...d), mn = Math.min(...d), range = mx - mn;
  return {
    id: uid(),
    question: `Find the range of:\n${d.join(', ')}`,
    correctAnswer: `${range}`,
    options: makeOptions(`${range}`, [`${mx}`, `${mn}`, `${range + 2}`]),
    marks: 1,
    workingSteps: [`Range = largest − smallest = ${mx} − ${mn} = ${range}`],
    hints: [`Range = biggest − smallest`],
    calculatorAllowed: false,
    commonMistake: `Giving the largest value instead of the difference.`,
    examTip: `Range measures spread: max − min.`,
  };
}

// ── age13-data L7 — Quartiles & IQR ──────────────────────────────────────────
function genQuartiles13(): Problem {
  const d = Array.from({ length: 7 }, () => randInt(10, 50)).sort((a, b) => a - b);
  const q1 = d[1], q2 = d[3], q3 = d[5], iqr = q3 - q1;
  if (Math.random() < 0.5) {
    return {
      id: uid(),
      question: `Ordered data:\n${d.join(', ')}\n\nFind the interquartile range (IQR).\n(Q1 = ${q1}, Q3 = ${q3})`,
      correctAnswer: `${iqr}`,
      options: makeOptions(`${iqr}`, [`${iqr + 1}`, `${q3}`, `${q2}`]),
      marks: 2,
      workingSteps: [`IQR = Q3 − Q1 = ${q3} − ${q1} = ${iqr}`],
      hints: [`IQR = Q3 − Q1`],
      calculatorAllowed: false,
      commonMistake: `Using the median instead of Q1 in the subtraction.`,
      examTip: `IQR = upper quartile − lower quartile.`,
    };
  }
  return {
    id: uid(),
    question: `Ordered data (7 values):\n${d.join(', ')}\n\nFind the median.`,
    correctAnswer: `${q2}`,
    options: makeOptions(`${q2}`, [`${d[2]}`, `${d[4]}`, `${q1}`]),
    marks: 2,
    workingSteps: [`7 values → median is the 4th`, `Median = ${q2}`],
    hints: [`Median position = (n+1)/2 = 4th`],
    calculatorAllowed: false,
    commonMistake: `Picking the 3rd or 5th value.`,
    examTip: `For 7 values the median is the 4th.`,
  };
}

// ── age13-data L8 — Two-Way Tables ───────────────────────────────────────────
function genTwoWay13(): Problem {
  return fromCases([
    { q: `A class of 30:\n        Walk  Bus\nBoys     8    7\nGirls    9    6\n\nHow many learners take the bus?`, c: '13', w: ['15', '17', '7'], s: ['Bus column: boys 7 + girls 6 = 13'], h: ['Add down the Bus column'], mistake: 'Adding a row instead of the column.', tip: 'Read the correct row/column, then total.' },
    { q: `        Tea  Coffee\nAdults   12    8\nKids      5    0\n\nHow many people were surveyed in total?`, c: '25', w: ['20', '17', '13'], s: ['12 + 8 + 5 + 0 = 25'], h: ['Add every cell'], mistake: 'Forgetting a cell.', tip: 'The grand total = sum of all inner cells.' },
    { q: `        Pass  Fail\nGrade A   18    2\nGrade B   12    8\n\nHow many learners passed?`, c: '30', w: ['20', '10', '40'], s: ['Pass column: 18 + 12 = 30'], h: ['Add the Pass column'], mistake: 'Adding a row.', tip: 'Match the question to the right column.' },
  ]);
}

// ── age14-algebra L1 — Expanding (with a coefficient) ────────────────────────
function genExpandDouble14(): Problem {
  const a = randInt(2, 3), b = randInt(1, 5), d = randInt(1, 5);
  const mid = a * d + b, last = b * d;
  return {
    id: uid(),
    question: `Expand and simplify: (${a}x + ${b})(x + ${d})`,
    correctAnswer: `${a}x² + ${mid}x + ${last}`,
    options: makeOptions(`${a}x² + ${mid}x + ${last}`, [`${a}x² + ${b + d}x + ${last}`, `${a}x² + ${mid}x + ${b + d}`, `${a}x² + ${last}x + ${mid}`]),
    marks: 3,
    workingSteps: [`FOIL: ${a}x·x + ${a}x·${d} + ${b}·x + ${b}·${d}`, `= ${a}x² + ${a * d}x + ${b}x + ${last}`, `= ${a}x² + ${mid}x + ${last}`],
    hints: [`Multiply each term in the first bracket by each in the second`, `Combine the two x-terms`],
    calculatorAllowed: false,
    commonMistake: `Forgetting to multiply the ${a}x by ${d}.`,
    examTip: `Four products, then collect the middle x-terms.`,
  };
}

// ── age14-algebra L2 — Factorising Trinomials ────────────────────────────────
function genTrinomial14(): Problem {
  const p = randInt(1, 6), q = randInt(1, 6);
  const mid = p + q, last = p * q;
  return {
    id: uid(),
    question: `Factorise: x² + ${mid}x + ${last}`,
    correctAnswer: `(x + ${p})(x + ${q})`,
    options: makeOptions(`(x + ${p})(x + ${q})`, [`(x + ${p})(x + ${q + 1})`, `(x + ${mid})(x + ${last})`, `(x + ${p + 1})(x + ${q})`]),
    marks: 3,
    workingSteps: [`Find two numbers that MULTIPLY to ${last} and ADD to ${mid}`, `${p} and ${q} work`, `(x + ${p})(x + ${q})`],
    hints: [`Product = ${last}, sum = ${mid}`],
    calculatorAllowed: false,
    commonMistake: `Picking numbers that add to ${mid} but don't multiply to ${last}.`,
    examTip: `Two numbers: product = constant, sum = middle coefficient.`,
  };
}

// ── age14-algebra L3 — Common Factor (with variables) ────────────────────────
function genCommonFactor14(): Problem {
  const g = randInt(2, 4);
  const [a, b] = COPRIME_PAIRS[randInt(0, COPRIME_PAIRS.length - 1)];
  const t1 = g * a, t2 = g * b;
  return {
    id: uid(),
    question: `Factorise fully: ${t1}x² + ${t2}x`,
    correctAnswer: `${g}x(${a}x + ${b})`,
    options: makeOptions(`${g}x(${a}x + ${b})`, [`${g}(${a}x² + ${b}x)`, `x(${t1}x + ${t2})`, `${g}x(${a}x + ${b + 1})`]),
    marks: 3,
    workingSteps: [`Common factor of ${t1}x² and ${t2}x is ${g}x`, `= ${g}x(${a}x + ${b})`],
    hints: [`Take out the highest common factor — including x`],
    calculatorAllowed: false,
    commonMistake: `Taking out only the number (${g}) and leaving the x inside.`,
    examTip: `Pull out every common factor: the number AND the x.`,
  };
}

// ── age14-algebra L4 — Equations with x on Both Sides ────────────────────────
function genSolveBothSides14(): Problem {
  const a = randInt(3, 6), c = randInt(1, a - 1), x = randInt(2, 6), b = randInt(1, 6);
  const d = (a - c) * x + b;
  return {
    id: uid(),
    question: `Solve: ${a}x + ${b} = ${c}x + ${d}`,
    correctAnswer: `x = ${x}`,
    options: makeOptions(`x = ${x}`, [`x = ${x + 1}`, `x = ${d - b}`, `x = ${Math.round(d / a)}`]),
    marks: 3,
    workingSteps: [`Subtract ${c}x from both sides: ${a - c}x + ${b} = ${d}`, `Subtract ${b}: ${a - c}x = ${d - b}`, `Divide by ${a - c}: x = ${x}`],
    hints: [`Collect the x-terms on one side, numbers on the other`],
    calculatorAllowed: false,
    commonMistake: `Forgetting to move the ${c}x across first.`,
    examTip: `Gather x's on one side before solving.`,
  };
}

// ── age14-algebra L5 — Substituting into Formulae ────────────────────────────
function genSubstituteFormula14(): Problem {
  return fromCases([
    { q: `Use v = u + at with u = 5, a = 3, t = 4.\nFind v.`, c: '17', w: ['12', '60', '20'], s: ['v = 5 + 3×4', '= 5 + 12 = 17'], h: ['Multiply a×t first (BODMAS)'], mistake: 'Adding before multiplying.', tip: 'Substitute, then follow BODMAS.' },
    { q: `Use A = ½bh with b = 6, h = 8.\nFind A.`, c: '24', w: ['48', '14', '28'], s: ['A = ½ × 6 × 8', '= ½ × 48 = 24'], h: ['Area of a triangle'], mistake: 'Forgetting the ½.', tip: 'Don\'t drop the ½.' },
    { q: `Use P = 2(l + w) with l = 7, w = 3.\nFind P.`, c: '20', w: ['10', '21', '13'], s: ['P = 2(7 + 3) = 2 × 10 = 20'], h: ['Do the bracket first'], mistake: 'Multiplying only l by 2.', tip: 'Brackets before multiplying.' },
    { q: `Use s = d ÷ t with d = 100, t = 4.\nFind s.`, c: '25', w: ['400', '96', '104'], s: ['s = 100 ÷ 4 = 25'], h: ['Divide distance by time'], mistake: 'Multiplying instead of dividing.', tip: 'Read the operation in the formula.' },
  ]);
}

// ── age14-algebra L6 — Simplifying Algebraic Fractions ───────────────────────
function genSimplifyAlgFrac14(): Problem {
  return fromCases([
    { q: `Simplify: 6x ÷ 3`, c: '2x', w: ['3x', '2', '18x'], s: ['6x ÷ 3 = (6÷3)x = 2x'], h: ['Divide the number part'], mistake: 'Dividing the x away too.', tip: 'Only the coefficient divides.' },
    { q: `Simplify: 4x² ÷ 2x`, c: '2x', w: ['2', '2x²', '8x'], s: ['4x²/2x = (4/2)(x²/x) = 2x'], h: ['Divide numbers and subtract powers of x'], mistake: 'Leaving x² on top.', tip: 'x² ÷ x = x.' },
    { q: `Simplify: 10x ÷ 5x`, c: '2', w: ['2x', '5', '2x²'], s: ['10x/5x = 10/5 = 2 (the x\'s cancel)'], h: ['The x cancels top and bottom'], mistake: 'Keeping an x.', tip: 'Same factor top and bottom cancels.' },
    { q: `Simplify: x² ÷ x`, c: 'x', w: ['x²', '1', '2x'], s: ['x²/x = x^(2−1) = x'], h: ['Subtract the powers'], mistake: 'Writing 1.', tip: 'x²/x = x.' },
  ]);
}

// ── age14-algebra L7 — Changing the Subject ──────────────────────────────────
function genChangeSubject14(): Problem {
  return fromCases([
    { q: `Make x the subject:  y = x + 5`, c: 'x = y − 5', w: ['x = y + 5', 'x = 5 − y', 'x = 5y'], s: ['Subtract 5 from both sides', 'x = y − 5'], h: ['Undo the + 5'], mistake: 'Adding instead of subtracting.', tip: 'Do the inverse operation.' },
    { q: `Make x the subject:  y = 2x`, c: 'x = y/2', w: ['x = 2y', 'x = y − 2', 'x = 2/y'], s: ['Divide both sides by 2', 'x = y/2'], h: ['Undo the × 2'], mistake: 'Multiplying by 2.', tip: 'Divide to undo a multiply.' },
    { q: `Make x the subject:  y = 3x − 1`, c: 'x = (y + 1)/3', w: ['x = (y − 1)/3', 'x = 3(y + 1)', 'x = y/3 − 1'], s: ['Add 1: y + 1 = 3x', 'Divide by 3: x = (y + 1)/3'], h: ['Undo − 1 first, then ÷ 3'], mistake: 'Dividing before adding 1.', tip: 'Reverse operations in reverse order.' },
    { q: `Make a the subject:  v = u + at`, c: 'a = (v − u)/t', w: ['a = (v + u)/t', 'a = (v − u)t', 'a = v − u − t'], s: ['v − u = at', 'a = (v − u)/t'], h: ['Subtract u, then divide by t'], mistake: 'Not dividing the whole bracket by t.', tip: 'Isolate the at term first.' },
  ]);
}

// ── age14-algebra L8 — Linear Inequalities ───────────────────────────────────
function genInequality14(): Problem {
  const a = randInt(2, 4), bnd = randInt(2, 7), b = randInt(1, 6);
  const rhs = a * bnd + b;
  const lt = Math.random() < 0.5;
  const correct = lt ? `x < ${bnd}` : `x > ${bnd}`;
  return {
    id: uid(),
    question: `Solve:  ${a}x + ${b} ${lt ? '<' : '>'} ${rhs}`,
    correctAnswer: correct,
    options: makeOptions(correct, [lt ? `x > ${bnd}` : `x < ${bnd}`, lt ? `x < ${bnd + 1}` : `x > ${bnd + 1}`, `x ${lt ? '<' : '>'} ${rhs - b}`]),
    marks: 3,
    workingSteps: [`Subtract ${b}: ${a}x ${lt ? '<' : '>'} ${rhs - b}`, `Divide by ${a}: x ${lt ? '<' : '>'} ${bnd}`],
    hints: [`Solve like an equation`, `The sign only flips if you ÷ by a negative (not here)`],
    calculatorAllowed: false,
    commonMistake: `Flipping the inequality sign when dividing by a positive number.`,
    examTip: `Only flip < / > when multiplying or dividing by a NEGATIVE.`,
  };
}

// ── age14-finance L1 — VAT ───────────────────────────────────────────────────
function genVAT14(): Problem {
  const price = randInt(1, 9) * 100;
  const vat = price * 0.15, total = price + vat;
  return {
    id: uid(),
    question: `A jacket costs R${price} before VAT.\nVAT is 15%.\n\nFind the price including VAT.`,
    correctAnswer: `R${total}`,
    options: makeOptions(`R${total}`, [`R${vat}`, `R${price}`, `R${price + price * 0.5}`]),
    marks: 3,
    workingSteps: [`VAT = 15% of ${price} = ${vat}`, `Total = ${price} + ${vat} = R${total}`],
    hints: [`Find 15%, then add it on`, `Or multiply by 1.15`],
    calculatorAllowed: true,
    commonMistake: `Giving just the VAT amount instead of the total price.`,
    examTip: `Including VAT = price × 1.15.`,
  };
}

// ── age14-finance L2 — Profit & Loss ─────────────────────────────────────────
function genProfitLoss14(): Problem {
  const cost = randInt(2, 9) * 50;
  const profit = randInt(1, 5) * 20;
  const gain = Math.random() < 0.6;
  const sell = gain ? cost + profit : cost - profit;
  return {
    id: uid(),
    question: `An item is bought for R${cost} and sold for R${sell}.\n\nFind the ${gain ? 'profit' : 'loss'}.`,
    correctAnswer: `R${profit}`,
    options: makeOptions(`R${profit}`, [`R${profit + 20}`, `R${cost + sell}`, `R${Math.abs(profit - 20) || 10}`]),
    marks: 2,
    workingSteps: [gain ? `Profit = selling − cost = ${sell} − ${cost} = R${profit}` : `Loss = cost − selling = ${cost} − ${sell} = R${profit}`],
    hints: [gain ? `Profit = selling price − cost price` : `Loss = cost price − selling price`],
    calculatorAllowed: true,
    commonMistake: `Adding the two prices instead of finding the difference.`,
    examTip: `Profit/loss = the difference between cost and selling price.`,
  };
}

// ── age14-finance L3 — Simple Interest ───────────────────────────────────────
function genSimpleInterest14(): Problem {
  const P = randInt(2, 9) * 1000, R = [5, 8, 10][randInt(0, 2)], T = randInt(2, 5);
  const I = (P * R * T) / 100;
  return {
    id: uid(),
    question: `Find the simple interest on R${P} at ${R}% per year for ${T} years.`,
    correctAnswer: `R${I}`,
    options: makeOptions(`R${I}`, [`R${P + I}`, `R${(P * R) / 100}`, `R${I + 100}`]),
    marks: 3,
    workingSteps: [`I = P × R × T ÷ 100`, `= ${P} × ${R} × ${T} ÷ 100 = R${I}`],
    hints: [`I = PRT/100`],
    calculatorAllowed: true,
    commonMistake: `Giving the total amount (P + I) instead of just the interest.`,
    examTip: `Simple interest is the same amount each year: R${I / T}.`,
  };
}

// ── age14-finance L4 — Discount ──────────────────────────────────────────────
function genDiscount14(): Problem {
  const price = randInt(1, 9) * 100, r = [10, 20, 25, 50][randInt(0, 3)];
  const sale = price * (1 - r / 100), saved = price - sale;
  return {
    id: uid(),
    question: `A R${price} item has a ${r}% discount.\n\nFind the sale price.`,
    correctAnswer: `R${sale}`,
    options: makeOptions(`R${sale}`, [`R${saved}`, `R${price}`, `R${sale - 10}`]),
    marks: 3,
    workingSteps: [`Discount = ${r}% of ${price} = ${saved}`, `Sale price = ${price} − ${saved} = R${sale}`],
    hints: [`Find the discount, then subtract`, `Or multiply by ${1 - r / 100}`],
    calculatorAllowed: true,
    commonMistake: `Giving the amount saved instead of the price paid.`,
    examTip: `Sale price = original × (1 − rate).`,
  };
}

// ── age14-finance L5 — Hire Purchase ─────────────────────────────────────────
function genHirePurchase14(): Problem {
  const dep = randInt(2, 8) * 100, n = [6, 12][randInt(0, 1)], m = randInt(2, 9) * 50;
  const total = dep + n * m;
  return {
    id: uid(),
    question: `A fridge is bought with a R${dep} deposit and ${n} monthly payments of R${m}.\n\nFind the total amount paid.`,
    correctAnswer: `R${total}`,
    options: makeOptions(`R${total}`, [`R${n * m}`, `R${dep + m}`, `R${total + m}`]),
    marks: 3,
    workingSteps: [`Instalments = ${n} × ${m} = ${n * m}`, `Total = deposit + instalments = ${dep} + ${n * m} = R${total}`],
    hints: [`Total = deposit + (months × monthly payment)`],
    calculatorAllowed: true,
    commonMistake: `Forgetting to add the deposit.`,
    examTip: `Hire purchase total = deposit + all instalments.`,
  };
}

// ── age14-finance L6 — Exchange Rates ────────────────────────────────────────
function genExchangeRate14(): Problem {
  const rate = [15, 18, 20][randInt(0, 2)], d = randInt(2, 9) * 10;
  const rand = d * rate;
  return {
    id: uid(),
    question: `The exchange rate is R${rate} to $1.\n\nHow many rand do you get for $${d}?`,
    correctAnswer: `R${rand}`,
    options: makeOptions(`R${rand}`, [`R${d}`, `R${Math.round(d / rate)}`, `R${rand + rate}`]),
    marks: 2,
    workingSteps: [`Each dollar = R${rate}`, `$${d} × ${rate} = R${rand}`],
    hints: [`Multiply the dollars by the rate`],
    calculatorAllowed: true,
    commonMistake: `Dividing when converting dollars to rand here.`,
    examTip: `Dollars → rand: multiply by the rate (rand per dollar).`,
  };
}

// ── age14-finance L7 — Budgeting ─────────────────────────────────────────────
function genBudget14(): Problem {
  return fromCases([
    { q: `Monthly income: R5000.\nRent R2000, food R1500, transport R800.\nHow much is left?`, c: 'R700', w: ['R4300', 'R300', 'R800'], s: ['Total spent = 2000 + 1500 + 800 = 4300', 'Left = 5000 − 4300 = R700'], h: ['Add the expenses, then subtract from income'], mistake: 'Forgetting one expense.', tip: 'Income − total expenses = savings.', calc: true },
    { q: `Income R3000. You spend 2/3 of it.\nHow much do you SAVE?`, c: 'R1000', w: ['R2000', 'R1500', 'R3000'], s: ['Spent = 2/3 × 3000 = 2000', 'Saved = 3000 − 2000 = R1000'], h: ['Saved = 1/3 of the income'], mistake: 'Giving the amount spent.', tip: 'Saved = income − spent.', calc: true },
    { q: `You save R250 every month.\nHow much have you saved after 1 year?`, c: 'R3000', w: ['R2500', 'R250', 'R1500'], s: ['12 months × R250 = R3000'], h: ['1 year = 12 months'], mistake: 'Using the wrong number of months.', tip: 'Multiply the monthly amount by 12.', calc: true },
  ]);
}

// ── age14-finance L8 — Percentage Profit ─────────────────────────────────────
function genPercentProfit14(): Problem {
  const cost = randInt(1, 5) * 100, pct = [10, 20, 25, 50][randInt(0, 3)];
  const profit = (cost * pct) / 100, sell = cost + profit;
  return {
    id: uid(),
    question: `An item is bought for R${cost} and sold for R${sell}.\n\nFind the percentage profit.`,
    correctAnswer: `${pct}%`,
    options: makeOptions(`${pct}%`, [`${pct + 10}%`, `${profit}%`, `${Math.round((profit / sell) * 100)}%`]),
    marks: 3,
    workingSteps: [`Profit = ${sell} − ${cost} = ${profit}`, `% profit = profit ÷ cost × 100 = ${profit}/${cost} × 100 = ${pct}%`],
    hints: [`% profit = profit ÷ COST × 100`],
    calculatorAllowed: true,
    commonMistake: `Dividing the profit by the selling price instead of the cost price.`,
    examTip: `Percentage profit is always based on the COST price.`,
  };
}

// ── age14-geometry L1 — Translation ──────────────────────────────────────────
function genTranslation14(): Problem {
  const x = randInt(1, 6), y = randInt(1, 6), a = randInt(-4, 5), b = randInt(-4, 5);
  return {
    id: uid(),
    question: `Translate the point (${x}, ${y}) by the vector (${a}, ${b}).\n\nFind the image.`,
    correctAnswer: `(${x + a}, ${y + b})`,
    options: makeOptions(`(${x + a}, ${y + b})`, [`(${x - a}, ${y - b})`, `(${x + b}, ${y + a})`, `(${x + a}, ${y + b + 1})`]),
    marks: 2,
    workingSteps: [`Add the vector to the point`, `(${x} + ${a}, ${y} + ${b}) = (${x + a}, ${y + b})`],
    hints: [`Add the vector components to the coordinates`],
    calculatorAllowed: false,
    commonMistake: `Subtracting the vector instead of adding it.`,
    examTip: `Translation: new point = point + vector.`,
  };
}

// ── age14-geometry L2 — Reflection ───────────────────────────────────────────
function genReflection14(): Problem {
  const x = randInt(1, 6), y = randInt(1, 6), t = randInt(0, 2);
  const lines = ['the x-axis', 'the y-axis', 'the line y = x'];
  const imgs = [`(${x}, ${-y})`, `(${-x}, ${y})`, `(${y}, ${x})`];
  const correct = imgs[t];
  const wrong = imgs.filter((_, i) => i !== t);
  return {
    id: uid(),
    question: `Reflect the point (${x}, ${y}) in ${lines[t]}.\n\nFind the image.`,
    correctAnswer: correct,
    options: makeOptions(correct, [...wrong, `(${-x}, ${-y})`]),
    marks: 2,
    workingSteps: [
      t === 0 ? `Reflection in x-axis: (x, y) → (x, −y)` : t === 1 ? `Reflection in y-axis: (x, y) → (−x, y)` : `Reflection in y = x: swap → (y, x)`,
      `Image = ${correct}`,
    ],
    hints: [`x-axis: negate y · y-axis: negate x · y = x: swap`],
    calculatorAllowed: false,
    commonMistake: `Negating the wrong coordinate.`,
    examTip: `Know the three standard reflection rules.`,
  };
}

// ── age14-geometry L3 — Rotation ─────────────────────────────────────────────
function genRotation14(): Problem {
  const x = randInt(1, 6), y = randInt(1, 6), t = randInt(0, 2);
  const desc = ['90° clockwise', '90° anticlockwise', '180°'];
  const imgs = [`(${y}, ${-x})`, `(${-y}, ${x})`, `(${-x}, ${-y})`];
  const correct = imgs[t];
  const wrong = imgs.filter((_, i) => i !== t);
  return {
    id: uid(),
    question: `Rotate the point (${x}, ${y}) by ${desc[t]} about the origin.\n\nFind the image.`,
    correctAnswer: correct,
    options: makeOptions(correct, [...wrong, `(${x}, ${y})`]),
    marks: 3,
    workingSteps: [
      t === 0 ? `90° clockwise: (x, y) → (y, −x)` : t === 1 ? `90° anticlockwise: (x, y) → (−y, x)` : `180°: (x, y) → (−x, −y)`,
      `Image = ${correct}`,
    ],
    hints: [`90° CW: (y, −x) · 90° ACW: (−y, x) · 180°: (−x, −y)`],
    calculatorAllowed: false,
    commonMistake: `Mixing up clockwise and anticlockwise.`,
    examTip: `State the rule for the given direction before substituting.`,
  };
}

// ── age14-geometry L4 — Enlargement ──────────────────────────────────────────
function genEnlargement14(): Problem {
  const k = randInt(2, 4), x = randInt(1, 5), y = randInt(1, 5);
  return {
    id: uid(),
    question: `Enlarge the point (${x}, ${y}) by scale factor ${k}, centre the origin.\n\nFind the image.`,
    correctAnswer: `(${k * x}, ${k * y})`,
    options: makeOptions(`(${k * x}, ${k * y})`, [`(${x + k}, ${y + k})`, `(${k * x}, ${k * y + 1})`, `(${x}, ${y})`]),
    marks: 2,
    workingSteps: [`Multiply each coordinate by ${k}`, `(${k}×${x}, ${k}×${y}) = (${k * x}, ${k * y})`],
    hints: [`Enlargement from the origin: multiply by the scale factor`],
    calculatorAllowed: false,
    commonMistake: `Adding the scale factor instead of multiplying.`,
    examTip: `From the origin: image = (kx, ky).`,
  };
}

// ── age14-geometry L5 — Congruency Tests ─────────────────────────────────────
function genCongruency14(): Problem {
  return fromCases([
    { q: `Two triangles have all three pairs of sides equal.\nWhich congruency test is this?`, c: 'SSS', w: ['SAS', 'AAS', 'RHS'], s: ['Three equal sides → SSS'], h: ['Side-Side-Side'], mistake: 'Confusing with SAS.', tip: 'SSS = three sides.' },
    { q: `Two sides and the angle BETWEEN them are equal.\nWhich test?`, c: 'SAS', w: ['SSS', 'AAS', 'RHS'], s: ['Two sides + included angle → SAS'], h: ['The angle is between the two sides'], mistake: 'Using AAS.', tip: 'SAS = side-angle-side (included angle).' },
    { q: `Two angles and a corresponding side are equal.\nWhich test?`, c: 'AAS', w: ['SSS', 'SAS', 'RHS'], s: ['Two angles + a side → AAS'], h: ['Angle-Angle-Side'], mistake: 'Using SAS.', tip: 'AAS = two angles and a side.' },
    { q: `Right-angled triangles with equal hypotenuse and one side.\nWhich test?`, c: 'RHS', w: ['SSS', 'SAS', 'AAS'], s: ['Right angle, Hypotenuse, Side → RHS'], h: ['Only for right-angled triangles'], mistake: 'Using SSS.', tip: 'RHS = right-angle, hypotenuse, side.' },
  ]);
}

// ── age14-geometry L6 — Similar Triangles ────────────────────────────────────
function genSimilarTriangles14(): Problem {
  const k = randInt(2, 4), s2 = randInt(3, 6);
  return {
    id: uid(),
    question: `Two triangles are similar with scale factor ${k}.\nA side on the small triangle is ${s2}.\n\nFind the matching side on the large triangle.`,
    correctAnswer: `${k * s2}`,
    options: makeOptions(`${k * s2}`, [`${s2 + k}`, `${k * s2 + 1}`, `${Math.round(s2 / k) || 1}`]),
    marks: 3,
    workingSteps: [`Similar triangles: multiply matching sides by the scale factor`, `${s2} × ${k} = ${k * s2}`],
    hints: [`Multiply by the scale factor ${k}`],
    calculatorAllowed: false,
    commonMistake: `Adding the scale factor instead of multiplying.`,
    examTip: `Corresponding sides of similar shapes are in the same ratio.`,
  };
}

// ── age14-geometry L7 — Angle Relationships ──────────────────────────────────
function genAngleRelationships14(): Problem {
  const t = randInt(0, 2);
  if (t === 0) { const a = randInt(20, 70); return { id: uid(), question: `Two angles are COMPLEMENTARY. One is ${a}°.\n\nFind the other.`, correctAnswer: `${90 - a}°`, options: makeOptions(`${90 - a}°`, [`${180 - a}°`, `${a}°`, `${90 - a + 10}°`]), marks: 2, workingSteps: [`Complementary angles add up to 90°`, `90 − ${a} = ${90 - a}°`], hints: [`Complementary → sum 90°`], calculatorAllowed: false, commonMistake: `Using 180° (that's supplementary).`, examTip: `Complementary = 90°, Supplementary = 180°.` }; }
  if (t === 1) { const a = randInt(95, 160); return { id: uid(), question: `Two angles are SUPPLEMENTARY. One is ${a}°.\n\nFind the other.`, correctAnswer: `${180 - a}°`, options: makeOptions(`${180 - a}°`, [`${90 - a < 0 ? 90 : 90 - a}°`, `${a}°`, `${180 - a + 10}°`]), marks: 2, workingSteps: [`Supplementary angles add up to 180°`, `180 − ${a} = ${180 - a}°`], hints: [`Supplementary → sum 180°`], calculatorAllowed: false, commonMistake: `Using 90° instead of 180°.`, examTip: `Supplementary = 180°.` }; }
  const a = randInt(40, 140); return { id: uid(), question: `Two angles are VERTICALLY OPPOSITE. One is ${a}°.\n\nFind the other.`, correctAnswer: `${a}°`, options: makeOptions(`${a}°`, [`${180 - a}°`, `${90 - a < 0 ? 360 - a : 90 - a}°`, `${a + 10}°`]), marks: 2, workingSteps: [`Vertically opposite angles are equal`, `So the other angle is ${a}°`], hints: [`Vertically opposite → equal`], calculatorAllowed: false, commonMistake: `Treating them as supplementary.`, examTip: `Vertically opposite angles are always equal.` };
}

// ── age14-geometry L8 — Symmetry ─────────────────────────────────────────────
function genSymmetry14(): Problem {
  return fromCases([
    { q: `How many lines of symmetry does a SQUARE have?`, c: '4', w: ['2', '1', '8'], s: ['A square has 4 lines of symmetry'], h: ['Two diagonals plus two through the midpoints'], mistake: 'Counting only 2.', tip: 'Square = 4 lines of symmetry.' },
    { q: `What is the order of ROTATIONAL symmetry of an equilateral triangle?`, c: '3', w: ['1', '6', '2'], s: ['It looks the same 3 times in a full turn'], h: ['How many times does it match in 360°?'], mistake: 'Saying 1.', tip: 'Equilateral triangle: order 3.' },
    { q: `How many lines of symmetry does a (non-square) RECTANGLE have?`, c: '2', w: ['4', '1', '0'], s: ['Two lines through the midpoints of opposite sides'], h: ['The diagonals are NOT lines of symmetry here'], mistake: 'Counting the diagonals.', tip: 'Rectangle = 2 lines of symmetry.' },
    { q: `How many lines of symmetry does a regular PENTAGON have?`, c: '5', w: ['10', '4', '1'], s: ['A regular n-gon has n lines of symmetry → 5'], h: ['One line per vertex'], mistake: 'Doubling to 10.', tip: 'Regular n-gon: n lines of symmetry.' },
  ]);
}

// ── age14-measurement L1 — Perimeter ─────────────────────────────────────────
function genPerimeter14(): Problem {
  const l = randInt(4, 12), w = randInt(2, 10);
  return {
    id: uid(),
    question: `A rectangle is ${l} cm long and ${w} cm wide.\n\nFind its perimeter.`,
    correctAnswer: `${2 * (l + w)} cm`,
    options: makeOptions(`${2 * (l + w)} cm`, [`${l * w} cm`, `${l + w} cm`, `${2 * (l + w) + 2} cm`]),
    marks: 2,
    workingSteps: [`Perimeter = 2(l + w) = 2(${l} + ${w})`, `= 2 × ${l + w} = ${2 * (l + w)} cm`],
    hints: [`Perimeter = distance all the way around = 2(l + w)`],
    calculatorAllowed: false,
    commonMistake: `Multiplying l × w — that gives area, not perimeter.`,
    examTip: `Perimeter adds the sides; area multiplies them.`,
  };
}

// ── age14-measurement L2 — Area of a Rectangle ───────────────────────────────
function genAreaRect14(): Problem {
  const l = randInt(4, 12), w = randInt(2, 10);
  return {
    id: uid(),
    question: `A rectangle is ${l} cm by ${w} cm.\n\nFind its area.`,
    correctAnswer: `${l * w} cm²`,
    options: makeOptions(`${l * w} cm²`, [`${2 * (l + w)} cm²`, `${l + w} cm²`, `${l * w + l} cm²`]),
    marks: 2,
    workingSteps: [`Area = length × width = ${l} × ${w} = ${l * w} cm²`],
    hints: [`Area = length × width`],
    calculatorAllowed: false,
    commonMistake: `Adding instead of multiplying (that's perimeter).`,
    examTip: `Area units are squared (cm²).`,
  };
}

// ── age14-measurement L3 — Area of a Triangle ────────────────────────────────
function genAreaTriangle14(): Problem {
  const b = 2 * randInt(2, 7), h = randInt(3, 10);
  return {
    id: uid(),
    question: `A triangle has base ${b} cm and height ${h} cm.\n\nFind its area.`,
    correctAnswer: `${(b * h) / 2} cm²`,
    options: makeOptions(`${(b * h) / 2} cm²`, [`${b * h} cm²`, `${(b * h) / 2 + b} cm²`, `${b + h} cm²`]),
    marks: 2,
    workingSteps: [`Area = ½ × base × height = ½ × ${b} × ${h}`, `= ${(b * h) / 2} cm²`],
    hints: [`Area of a triangle = ½ × base × height`],
    calculatorAllowed: false,
    commonMistake: `Forgetting the ½.`,
    examTip: `Always halve base × height for a triangle.`,
  };
}

// ── age14-measurement L4 — Area of a Circle ──────────────────────────────────
function genAreaCircle14(): Problem {
  const r = randInt(2, 9);
  return {
    id: uid(),
    question: `Find the area of a circle with radius ${r} cm.\nGive your answer in terms of π.`,
    correctAnswer: `${r * r}π cm²`,
    options: makeOptions(`${r * r}π cm²`, [`${2 * r}π cm²`, `${r * r} cm²`, `${r * r + 1}π cm²`]),
    marks: 2,
    workingSteps: [`Area = πr² = π × ${r}² = ${r * r}π cm²`],
    hints: [`Area of a circle = πr²`],
    calculatorAllowed: false,
    commonMistake: `Using 2πr (that's the circumference) or forgetting to square r.`,
    examTip: `Area = πr²; circumference = 2πr or πd.`,
  };
}

// ── age14-measurement L5 — Circumference ─────────────────────────────────────
function genCircumference14(): Problem {
  const d = randInt(2, 12);
  return {
    id: uid(),
    question: `Find the circumference of a circle with diameter ${d} cm.\nGive your answer in terms of π.`,
    correctAnswer: `${d}π cm`,
    options: makeOptions(`${d}π cm`, [`${d * d}π cm`, `${2 * d}π cm`, `${d}π cm²`]),
    marks: 2,
    workingSteps: [`Circumference = πd = ${d}π cm`],
    hints: [`Circumference = πd (or 2πr)`],
    calculatorAllowed: false,
    commonMistake: `Using πr² (that's area) or squaring the diameter.`,
    examTip: `C = πd. Circumference is a length (cm, not cm²).`,
  };
}

// ── age14-measurement L6 — Compound Areas ────────────────────────────────────
function genCompoundArea14(): Problem {
  return fromCases([
    { q: `An L-shape is a 6 × 4 rectangle with a 2 × 2 square cut from one corner.\nFind the area.`, c: '20 cm²', w: ['24 cm²', '16 cm²', '28 cm²'], s: ['Big rectangle = 6 × 4 = 24', 'Cut-out = 2 × 2 = 4', 'Area = 24 − 4 = 20 cm²'], h: ['Find the whole, then subtract the missing piece'], mistake: 'Forgetting to subtract the cut-out.', tip: 'Split or subtract: whole − hole.', calc: true },
    { q: `Two rectangles are joined: 5 × 3 and 4 × 2.\nFind the total area.`, c: '23 cm²', w: ['20 cm²', '14 cm²', '26 cm²'], s: ['5 × 3 = 15', '4 × 2 = 8', 'Total = 15 + 8 = 23 cm²'], h: ['Add the two rectangle areas'], mistake: 'Adding the dimensions instead of the areas.', tip: 'Split into rectangles, add the areas.', calc: true },
    { q: `A 10 × 6 rectangle has a 4 × 3 rectangle cut out.\nFind the remaining area.`, c: '48 cm²', w: ['60 cm²', '12 cm²', '42 cm²'], s: ['10 × 6 = 60', '4 × 3 = 12', '60 − 12 = 48 cm²'], h: ['Whole minus the hole'], mistake: 'Subtracting perimeters.', tip: 'Subtract the cut-out area.', calc: true },
  ]);
}

// ── age14-measurement L7 — Volume of a Prism ─────────────────────────────────
function genVolumePrism14(): Problem {
  const l = randInt(2, 8), w = randInt(2, 6), h = randInt(2, 6);
  return {
    id: uid(),
    question: `A rectangular box is ${l} cm by ${w} cm by ${h} cm.\n\nFind its volume.`,
    correctAnswer: `${l * w * h} cm³`,
    options: makeOptions(`${l * w * h} cm³`, [`${2 * (l * w + l * h + w * h)} cm³`, `${l + w + h} cm³`, `${l * w} cm³`]),
    marks: 2,
    workingSteps: [`Volume = length × width × height`, `= ${l} × ${w} × ${h} = ${l * w * h} cm³`],
    hints: [`Volume = l × w × h`],
    calculatorAllowed: false,
    commonMistake: `Adding the dimensions instead of multiplying.`,
    examTip: `Volume units are cubed (cm³).`,
  };
}

// ── age14-measurement L8 — Surface Area ──────────────────────────────────────
function genSurfaceArea14(): Problem {
  const l = randInt(2, 6), w = randInt(2, 5), h = randInt(2, 5);
  const sa = 2 * (l * w + l * h + w * h);
  return {
    id: uid(),
    question: `A rectangular box is ${l} cm by ${w} cm by ${h} cm.\n\nFind its total surface area.`,
    correctAnswer: `${sa} cm²`,
    options: makeOptions(`${sa} cm²`, [`${l * w * h} cm²`, `${sa / 2} cm²`, `${sa + 2} cm²`]),
    marks: 3,
    workingSteps: [`Surface area = 2(lw + lh + wh)`, `= 2(${l * w} + ${l * h} + ${w * h}) = 2 × ${l * w + l * h + w * h} = ${sa} cm²`],
    hints: [`Six faces in three matching pairs: 2(lw + lh + wh)`],
    calculatorAllowed: true,
    commonMistake: `Computing the volume instead of the surface area.`,
    examTip: `Surface area = sum of all 6 faces = 2(lw + lh + wh).`,
  };
}

// ── age14-data L1 — Mean from a Frequency Table ──────────────────────────────
function genMeanFreq14(): Problem {
  const vals = [1, 2, 3, 4];
  const f = [randInt(1, 6), randInt(1, 6), randInt(1, 6), randInt(1, 6)];
  const sumF = f.reduce((a, b) => a + b, 0);
  const sumFX = vals.reduce((a, v, i) => a + v * f[i], 0);
  const mean = sumFX / sumF;
  const correct = Number.isInteger(mean) ? `${mean}` : mean.toFixed(2);
  const table = vals.map((v, i) => `|   ${v}   |  ${f[i]}   |`).join('\n');
  return {
    id: uid(),
    question: `| Value | Freq |\n|-------|------|\n${table}\n\nFind the mean.`,
    correctAnswer: correct,
    options: makeOptions(correct, [(mean + 1).toFixed(2), (sumFX / 4).toFixed(2), (mean + 0.5).toFixed(2)]),
    marks: 3,
    workingSteps: [`Σfx = ${vals.map((v, i) => `${v}×${f[i]}`).join(' + ')} = ${sumFX}`, `Σf = ${sumF}`, `Mean = ${sumFX} ÷ ${sumF} = ${correct}`],
    hints: [`Mean = Σfx ÷ Σf`],
    calculatorAllowed: true,
    commonMistake: `Dividing by the number of rows instead of Σf (${sumF}).`,
    examTip: `Add an fx column, total it, divide by total frequency.`,
  };
}

// ── age14-data L2 — Median (even count) ──────────────────────────────────────
function genMedianEven14(): Problem {
  const d = Array.from({ length: 6 }, () => randInt(2, 20)).sort((a, b) => a - b);
  const med = (d[2] + d[3]) / 2;
  const correct = Number.isInteger(med) ? `${med}` : med.toFixed(1);
  return {
    id: uid(),
    question: `Find the median of:\n${d.join(', ')}`,
    correctAnswer: correct,
    options: makeOptions(correct, [`${d[2]}`, `${d[3]}`, `${(med + 1).toFixed(1)}`]),
    marks: 2,
    workingSteps: [`6 values → average the 3rd and 4th`, `(${d[2]} + ${d[3]}) ÷ 2 = ${correct}`],
    hints: [`Even count → mean of the two middle values`],
    calculatorAllowed: false,
    commonMistake: `Picking one middle value instead of averaging the two.`,
    examTip: `Even number of values → average the middle pair.`,
  };
}

// ── age14-data L3 — Mode from a Frequency Table ──────────────────────────────
function genModeFreq14(): Problem {
  const vals = [2, 4, 6, 8];
  const f = [randInt(1, 4), randInt(1, 4), randInt(1, 4), randInt(1, 4)];
  let mi = 0; for (let i = 1; i < 4; i++) if (f[i] > f[mi]) mi = i;
  // ensure a unique maximum
  if (f.filter(v => v === f[mi]).length > 1) f[mi] += 2;
  const table = vals.map((v, i) => `|   ${v}   |  ${f[i]}   |`).join('\n');
  return {
    id: uid(),
    question: `| Value | Freq |\n|-------|------|\n${table}\n\nWhat is the mode?`,
    correctAnswer: `${vals[mi]}`,
    options: makeOptions(`${vals[mi]}`, [`${f[mi]}`, `${vals[(mi + 1) % 4]}`, `${vals[(mi + 2) % 4]}`]),
    marks: 2,
    workingSteps: [`The mode is the VALUE with the highest frequency`, `Highest frequency is ${f[mi]}, for the value ${vals[mi]}`],
    hints: [`Mode = the value (not the frequency) that occurs most`],
    calculatorAllowed: false,
    commonMistake: `Giving the frequency (${f[mi]}) instead of the value (${vals[mi]}).`,
    examTip: `Mode = the data value with the biggest frequency.`,
  };
}

// ── age14-data L4 — Range & IQR ──────────────────────────────────────────────
function genRangeIQR14(): Problem {
  const d = Array.from({ length: 7 }, () => randInt(10, 50)).sort((a, b) => a - b);
  const q1 = d[1], q3 = d[5], iqr = q3 - q1;
  return {
    id: uid(),
    question: `Ordered data:\n${d.join(', ')}\n\nFind the interquartile range (IQR).\n(Q1 = ${q1}, Q3 = ${q3})`,
    correctAnswer: `${iqr}`,
    options: makeOptions(`${iqr}`, [`${d[6] - d[0]}`, `${iqr + 1}`, `${q3}`]),
    marks: 2,
    workingSteps: [`IQR = Q3 − Q1 = ${q3} − ${q1} = ${iqr}`],
    hints: [`IQR = Q3 − Q1`, `Don't confuse it with the full range`],
    calculatorAllowed: false,
    commonMistake: `Giving the full range (max − min) instead of Q3 − Q1.`,
    examTip: `IQR uses the quartiles, not the extremes.`,
  };
}

// ── age14-data L5 — Tree Diagrams ────────────────────────────────────────────
function genTreeProb14(): Problem {
  const total = randInt(6, 9), r = randInt(2, total - 2);
  const num = r * (r - 1), den = total * (total - 1);
  const correct = simplify(num, den);
  return {
    id: uid(),
    question: `A bag has ${total} balls, ${r} red.\nTwo are taken WITHOUT replacement.\n\nFind P(both red).`,
    correctAnswer: correct,
    options: makeOptions(correct, [simplify(r * r, total * total), `${r}/${total}`, simplify(r * (r - 1), total * total)]),
    marks: 3,
    workingSteps: [`P(1st red) = ${r}/${total}`, `P(2nd red | 1st) = ${r - 1}/${total - 1}`, `Multiply: ${r}/${total} × ${r - 1}/${total - 1} = ${correct}`],
    hints: [`Without replacement → reduce both top and bottom for the 2nd draw`],
    calculatorAllowed: false,
    commonMistake: `Using ${r}/${total} twice (that's WITH replacement).`,
    examTip: `Multiply along the branches; adjust the 2nd fraction.`,
  };
}

// ── age14-data L6 — Expected Frequency ───────────────────────────────────────
function genExpFreq14(): Problem {
  const opts = [[1, 5, 60], [1, 4, 80], [1, 6, 60], [2, 5, 50], [3, 10, 100]];
  const [num, den, trials] = opts[randInt(0, opts.length - 1)];
  const exp = (num / den) * trials;
  return {
    id: uid(),
    question: `The probability of winning a game is ${num}/${den}.\nYou play ${trials} times.\n\nHow many wins would you EXPECT?`,
    correctAnswer: `${exp}`,
    options: makeOptions(`${exp}`, [`${trials - exp}`, `${exp + den}`, `${Math.round(trials / den)}`]),
    marks: 2,
    workingSteps: [`Expected = probability × number of games`, `= ${num}/${den} × ${trials} = ${exp}`],
    hints: [`Expected frequency = P × number of trials`],
    calculatorAllowed: true,
    commonMistake: `Using only the probability or only the number of games.`,
    examTip: `Expected frequency = P(event) × trials.`,
  };
}

// ── age14-data L7 — Scatter Graphs ───────────────────────────────────────────
function genScatter14(): Problem {
  return fromCases([
    { q: `As study time increases, test scores increase.\nWhat correlation does the scatter graph show?`, c: 'Positive correlation', w: ['Negative correlation', 'No correlation', 'Zero gradient'], s: ['Both increase together → positive'], h: ['Do both go up together?'], mistake: 'Confusing positive with negative.', tip: 'Both rise → positive.' },
    { q: `As a phone gets older, its value decreases.\nWhat correlation is this?`, c: 'Negative correlation', w: ['Positive correlation', 'No correlation', 'Perfect correlation'], s: ['One up, one down → negative'], h: ['One increases while the other falls'], mistake: 'Calling it positive.', tip: 'One up, one down → negative.' },
    { q: `Height vs phone number gives a random scatter.\nWhat correlation?`, c: 'No correlation', w: ['Positive correlation', 'Negative correlation', 'Strong correlation'], s: ['No pattern → no correlation'], h: ['Is there any trend?'], mistake: 'Inventing a trend.', tip: 'No pattern → no correlation.' },
    { q: `A line of best fit slopes UP from left to right.\nWhat correlation?`, c: 'Positive correlation', w: ['Negative correlation', 'No correlation', 'Zero correlation'], s: ['Upward slope → positive'], h: ['Which way does it slope?'], mistake: 'Reading the slope backwards.', tip: 'Upward line → positive.' },
  ]);
}

// ── age14-data L8 — Modal Class (grouped data) ───────────────────────────────
function genGroupedModal14(): Problem {
  return fromCases([
    { q: `| Mass (g) | Freq |\n|----------|------|\n| 0–10     |  3   |\n| 10–20    |  9   |\n| 20–30    |  5   |\n\nWhat is the modal class?`, c: '10–20', w: ['0–10', '20–30', '9'], s: ['The modal class has the highest frequency', 'Highest frequency is 9 → class 10–20'], h: ['Find the class with the biggest frequency'], mistake: 'Giving the frequency instead of the class.', tip: 'Modal CLASS = the interval, not the frequency.' },
    { q: `| Height (cm) | Freq |\n|-------------|------|\n| 100–120     |  6   |\n| 120–140     |  4   |\n| 140–160     | 10   |\n\nWhat is the modal class?`, c: '140–160', w: ['100–120', '120–140', '10'], s: ['Highest frequency is 10 → class 140–160'], h: ['Largest frequency wins'], mistake: 'Choosing the first class.', tip: 'Pick the interval with the most data.' },
    { q: `| Score | Freq |\n|-------|------|\n| 0–5   |  2   |\n| 5–10  |  7   |\n| 10–15 |  7   |\n| 15–20 |  3   |\n\nWhich statement is true?`, c: 'There are two modal classes', w: ['The modal class is 0–5', 'The modal class is 15–20', 'There is no mode'], s: ['Both 5–10 and 10–15 have frequency 7', 'So there are TWO modal classes'], h: ['Can two classes tie for the highest?'], mistake: 'Assuming there is always one modal class.', tip: 'Ties → more than one modal class.' },
  ]);
}

export const TOPIC_LEVELS: Record<string, TopicLevels> = {
  // ── Ages 13/14 (Explorers / Pioneers) ───────────────────────────────────────
  'age13-algebra':    { 1: genSubstitution13, 2: genLikeTerms13, 3: genExpandSingle13, 4: genExpandDouble13, 5: genFactoriseCommon13, 6: genSolveLinear13, 7: genSolveBrackets13, 8: genWordEquation13 },
  'age13-geometry':   { 1: genPythagHyp13, 2: genPythagLeg13, 3: genPythagApply13, 4: genTriangleAngleSum13, 5: genParallelAngles13, 6: genExteriorAngle13, 7: genAnglesLinePoint13, 8: genIsosceles13 },
  'age13-graphs':     { 1: genGradient2pts13, 2: genReadMC13, 3: genYIntercept13, 4: genXIntercept13, 5: genPointOnLine13, 6: genParallelGradient13, 7: genTableValue13, 8: genMidpointGraph13 },
  'age13-numbers':    { 1: genIntegerAddSub13, 2: genIntegerMulDiv13, 3: genBODMAS13, 4: genHCFLCM13, 5: genSquaresRoots13, 6: genRounding13, 7: genIntegerWord13, 8: genPrimes13 },
  'age13-proportion': { 1: genRatioShare13, 2: genSimplifyRatio13, 3: genUnitRate13, 4: genPercentOf13, 5: genPercentChange13, 6: genUnitConvert13, 7: genBestBuy13, 8: genScale13 },
  'age13-data':       { 1: genSingleProb13, 2: genComplement13, 3: genIndependent13, 4: genMean13, 5: genMedianMode13, 6: genRange13, 7: genQuartiles13, 8: genTwoWay13 },
  'age14-exponents':  { 1: genExpProduct14, 2: genExpQuotient14, 3: genExpPower14, 4: genExpZeroNeg14, 5: genSciNotation14, 6: genExpEvaluate14, 7: genExpSimplify14, 8: genIndexEquation14 },
  'age14-algebra':     { 1: genExpandDouble14, 2: genTrinomial14, 3: genCommonFactor14, 4: genSolveBothSides14, 5: genSubstituteFormula14, 6: genSimplifyAlgFrac14, 7: genChangeSubject14, 8: genInequality14 },
  'age14-finance':     { 1: genVAT14, 2: genProfitLoss14, 3: genSimpleInterest14, 4: genDiscount14, 5: genHirePurchase14, 6: genExchangeRate14, 7: genBudget14, 8: genPercentProfit14 },
  'age14-geometry':    { 1: genTranslation14, 2: genReflection14, 3: genRotation14, 4: genEnlargement14, 5: genCongruency14, 6: genSimilarTriangles14, 7: genAngleRelationships14, 8: genSymmetry14 },
  'age14-measurement': { 1: genPerimeter14, 2: genAreaRect14, 3: genAreaTriangle14, 4: genAreaCircle14, 5: genCircumference14, 6: genCompoundArea14, 7: genVolumePrism14, 8: genSurfaceArea14 },
  'age14-data':        { 1: genMeanFreq14, 2: genMedianEven14, 3: genModeFreq14, 4: genRangeIQR14, 5: genTreeProb14, 6: genExpFreq14, 7: genScatter14, 8: genGroupedModal14 },
  // ── Age 15 ────────────────────────────────────────────────────────────────
  'age15-numbers':    { 1: genSurds, 2: genIndices, 3: genQuadraticsFactor, 4: genSequences, 5: genLogs, 6: genStandardForm, 7: genEstimationRounding, 8: genLogQuotient },
  'age15-algebra':    { 1: genQuadraticFormula, 2: genSimultaneous, 3: genInequalities, 4: genAlgebraicFractions, 5: genCompletingSquare, 6: genSimultaneousLinQuad, 7: genChangeSubject, 8: genFactorGrouping },
  'age15-geometry':   { 1: genAnalyticalGeo, 2: genCircleGeometry, 3: genSimilarity, 4: genVectors, 5: genVolumeSA, 6: genSectorArc, 7: genPolygonAngles, 8: genScaleFactorAreaVol },
  'age15-trig':       { 1: genSOHCAHTOA, 2: genSineCosineRule, 3: genElevationDepression, 4: genBearings, 5: gen3DTrig, 6: genInverseTrig, 7: genTriangleAreaSinC, 8: genExactTrigValues },
  'age15-numeracy':   { 1: genPercentageRatio, 2: genPercentChange, 3: genReversePercent, 4: genRatioSharing, 5: genDirectProportion, 6: genInverseProportion, 7: genSpeedDistTime, 8: genUnitConversion },
  'age15-stats':      { 1: genAverages, 2: genBoxPlot, 3: genStats2, 4: genFreqTableMean, 5: genScatterCorrelation, 6: genStemLeaf, 7: genRangeSpread, 8: genComparingData },
  'age15-prob':       { 1: genVennTree, 2: genCompoundInterest, 3: genSingleEventProb, 4: genTreeDiagram, 5: genMutuallyExclusive, 6: genIndependentEvents, 7: genSimpleInterest, 8: genExpectedFrequency },
  'age15-functions':  { 1: genFunctionsDomain, 2: genFunctionsGraphs, 3: genDomainRange15, 4: genGraphTypeRecognition, 5: genLineFromTwoPoints, 6: genTurningPointForm, 7: genFunctionMapping, 8: genGraphTransform },
  'age15-matrices':   { 1: genTransformations, 2: genMatrices, 3: genInverseMatrix, 4: genMatrixAddSub, 5: genScalarMatrix, 6: genMatrixIdentity, 7: genMatrixEquation, 8: genTransformMatrix },
  // ── Age 16 ────────────────────────────────────────────────────────────────
  'age16-trig2':           { 1: genTrigIdentities, 2: genTrigEquations, 3: genRadians, 4: genPythagIdentity, 5: genDoubleAngle, 6: genTrigGraphProps, 7: genSolveTrigInterval, 8: genReciprocalRatios },
  'age16-calculus':        { 1: genDifferentiationFirstPrinciples, 2: genBasicDifferentiation, 3: genTangentLine, 4: genStationaryPoint, 5: genIntegration, 6: genGradientAtPoint, 7: genNormalLine, 8: genRateOfChange },
  'age16-exponential':     { 1: genExponentialFunctions, 2: genSolveExponential, 3: genExpModel, 4: genExpGraphProps, 5: genPopulationGrowth, 6: genHalfLife, 7: genExpToLogForm, 8: genDoublingTime },
  'age16-algebra3':        { 1: genPolynomialDivision, 2: genLogsAdvanced, 3: genRemainderTheorem, 4: genFactorTheorem, 5: genBinomial, 6: genSolveCubicFactor, 7: genBinomialCoefficient16, 8: genLogEquationSolve },
  'age16-functions2':      { 1: genFunctionTransformations, 2: genInverseFunctions16, 3: genComposite, 4: genSolveForInput, 5: genDomainRange16, 6: genCompositeExpr, 7: genSelfInverse, 8: genPiecewiseFunc },
  'age16-analytical-geo':  { 1: genEquationOfLine16, 2: genVectors2D, 3: genPerpendicular, 4: genCircleEquation, 5: genMidpointDistance, 6: genParallelLine, 7: genCircleCentreRadius, 8: genTangentLength },
  'age16-stats2':          { 1: genStandardDeviation, 2: genConditionalProbability, 3: genVariance, 4: genExpectedValue, 5: genProbDistribution, 6: genCombinations, 7: genPermutations, 8: genCountingPrinciple },
  // ── Age 17 ────────────────────────────────────────────────────────────────
  'age17-diff':      { 1: genChainRule, 2: genProductRule, 3: genSecondDerivative, 4: genStationaryNature, 5: genMinValue, 6: genQuotientRule, 7: genTangentEqn17, 8: genConnectedRates },
  'age17-int':       { 1: genDefiniteIntegral, 2: genAreaUnderCurve, 3: genIntegrateChain, 4: genIntegratePoly, 5: genDefiniteEval, 6: genIndefiniteIntegral, 7: genAreaBetweenCurves, 8: genVolumeRevolution },
  'age17-series':    { 1: genArithSum, 2: genGeoSum, 3: genSumInfinity, 4: genFindTermNumber, 5: genSigma, 6: genArithFromTerms, 7: genGeoFindR, 8: genSumInfinityFind },
  'age17-trig3':     { 1: genSolveTrig17, 2: genCompoundAngle, 3: genExactRadian, 4: genTrigSimplify, 5: genDoubleAngle17, 6: genRadianArcSector, 7: genTrigQuadratic, 8: genTrigProve },
  'age17-logexp':    { 1: genLnLaws, 2: genSolveLog, 3: genLogLawSolve, 4: genChangeBase, 5: genSolveExpEquation17, 6: genLnEquation, 7: genLogSimplify, 8: genExpGrowthContinuous },
  'age17-func3':     { 1: genCompositeQuad, 2: genInverseLinear17, 3: genModulusEq, 4: genRangeDomain, 5: genModulusInequality, 6: genInverseRange, 7: genCompositeInverse, 8: genTransformationCombined },
  'age17-algebra4':  { 1: genPartialFraction, 2: genBinomialCoeff, 3: genFactorCubic, 4: genBinomialTerm17, 5: genRemainderTheorem17, 6: genCompleteSquare17, 7: genPolynomialIdentity, 8: genDiscriminant17 },
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

export function generateMockExamProblems(age = 15, count = 40): Problem[] {
  // Pull every level generator across the given age's topics for a full paper.
  const prefix = `age${age}-`;
  const keys = Object.keys(TOPIC_LEVELS).filter(k => k.startsWith(prefix));
  const allGens: LevelGenerator[] = keys.flatMap(k => Object.values(TOPIC_LEVELS[k]));
  const problems: Problem[] = [];
  for (let i = 0; i < count; i++) {
    problems.push(allGens[i % allGens.length]());
  }
  return shuffle(problems);
}

// ═══════════════════════════════════════════════════════════════════════════
//  The Masters Quiz — critical thinking & logic (not tied to any one age).
//  Patterns, odd-one-out, analogies, rules, deduction, codes, reasoning.
// ═══════════════════════════════════════════════════════════════════════════

// Sequences — find the next term.
function genPatternNext(): Problem {
  const t = randInt(0, 3);
  let seq: number[], next: number, rule: string;
  if (t === 0) { const s = randInt(2, 9), d = randInt(2, 7); seq = [s, s + d, s + 2 * d, s + 3 * d]; next = s + 4 * d; rule = `add ${d} each time`; }
  else if (t === 1) { const s = randInt(2, 4), r = 2 + randInt(0, 1); seq = [s, s * r, s * r * r, s * r * r * r]; next = s * r * r * r * r; rule = `multiply by ${r} each time`; }
  else if (t === 2) { const st = randInt(1, 4); seq = [st * st, (st + 1) * (st + 1), (st + 2) * (st + 2), (st + 3) * (st + 3)]; next = (st + 4) * (st + 4); rule = `these are perfect squares`; }
  else { const s = randInt(1, 5); seq = [s, s + 1, s + 3, s + 6]; next = s + 10; rule = `the gap grows by 1 each time (+1, +2, +3, +4)`; }
  return {
    id: uid(),
    question: `What comes next in the sequence?\n\n${seq.join(',  ')},  ?`,
    correctAnswer: `${next}`,
    options: makeOptions(`${next}`, [`${next + 1}`, `${next - 2}`, `${seq[3] + (seq[3] - seq[2])}`]),
    marks: 1,
    workingSteps: [`Look at how each term changes`, `Rule: ${rule}`, `Next term = ${next}`],
    hints: [`Find the rule connecting each term to the next`],
    calculatorAllowed: false,
    commonMistake: `Assuming every sequence just adds a fixed number — check for multiplying or squaring too.`,
    examTip: `Test the gaps first; if they aren't constant, look for ×, squares, or a growing gap.`,
  };
}

// Odd one out.
function genOddOneOut(): Problem {
  return fromCases([
    { q: `Which is the ODD ONE OUT?\n\n4,  9,  16,  20`, c: '20', w: ['4', '9', '16'], s: ['4, 9 and 16 are perfect squares (2², 3², 4²)', '20 is not a perfect square'], h: ['What do three of them have in common?'], mistake: 'Picking the largest by habit.', tip: 'Find the shared property, then the exception.' },
    { q: `Which is the ODD ONE OUT?\n\n2,  3,  5,  9`, c: '9', w: ['2', '3', '5'], s: ['2, 3 and 5 are prime numbers', '9 = 3 × 3 is not prime'], h: ['Think about factors'], mistake: 'Assuming all odd numbers are prime.', tip: '9 is odd but not prime.' },
    { q: `Which is the ODD ONE OUT?\n\n10,  20,  25,  30`, c: '25', w: ['10', '20', '30'], s: ['10, 20, 30 are multiples of 10', '25 is not'], h: ['Which end in 0?'], mistake: 'Overthinking it.', tip: 'Look for the simplest shared rule.' },
    { q: `Which is the ODD ONE OUT?\n\n8,  27,  64,  100`, c: '100', w: ['8', '27', '64'], s: ['8 = 2³, 27 = 3³, 64 = 4³ are perfect cubes', '100 is not a cube'], h: ['Try cubing small numbers'], mistake: 'Confusing squares with cubes.', tip: '100 is a square (10²), not a cube.' },
    { q: `Which is the ODD ONE OUT?\n\ntriangle,  square,  circle,  cube`, c: 'cube', w: ['triangle', 'square', 'circle'], s: ['Triangle, square and circle are 2-D (flat) shapes', 'A cube is 3-D (solid)'], h: ['Flat vs solid?'], mistake: 'Picking circle because it has no corners.', tip: 'Group by a clear property: 2-D vs 3-D.' },
  ]);
}

// Number analogy (× rule).
function genNumberAnalogy(): Problem {
  const k = randInt(2, 5), a = randInt(2, 6), b = randInt(2, 6), c = randInt(2, 7);
  return {
    id: uid(),
    question: `Find the missing number:\n\n${a} → ${a * k},   ${b} → ${b * k},   ${c} → ?`,
    correctAnswer: `${c * k}`,
    options: makeOptions(`${c * k}`, [`${c * k + 1}`, `${c + k}`, `${c * k - 2}`]),
    marks: 1,
    workingSteps: [`Each output is the input × ${k}`, `${c} × ${k} = ${c * k}`],
    hints: [`What is done to each left number to get the right one?`],
    calculatorAllowed: false,
    commonMistake: `Adding the rule number instead of multiplying.`,
    examTip: `Check the same rule works for ALL given pairs before applying it.`,
  };
}

// Function machine (×a then +b).
function genMappingRule(): Problem {
  const a = randInt(2, 3), b = randInt(1, 4);
  return {
    id: uid(),
    question: `A number machine follows one rule:\n\n2 → ${2 * a + b},   3 → ${3 * a + b},   4 → ${4 * a + b}\n\nWhat does 5 become?`,
    correctAnswer: `${5 * a + b}`,
    options: makeOptions(`${5 * a + b}`, [`${5 * a + b + 1}`, `${5 * a}`, `${5 + a + b}`]),
    marks: 2,
    workingSteps: [`Rule: × ${a}, then + ${b}`, `5 × ${a} + ${b} = ${5 * a + b}`],
    hints: [`Find one rule that fits every pair`],
    calculatorAllowed: false,
    commonMistake: `Finding a rule that fits only the first pair.`,
    examTip: `A valid rule must work for every example given.`,
  };
}

// Logical deduction.
function genLogicDeduction(): Problem {
  return fromCases([
    { q: `All cats are animals.\nTom is a cat.\n\nTherefore Tom is...?`, c: 'an animal', w: ['a dog', 'not an animal', 'a plant'], s: ['Every cat is an animal', 'Tom is a cat → Tom is an animal'], h: ['Follow the chain of statements'], mistake: 'Adding facts that were not given.', tip: 'Only conclude what the statements force.' },
    { q: `If it rains, the ground gets wet.\nThe ground is DRY.\n\nWhat can you conclude?`, c: 'It did not rain', w: ['It rained', 'It will rain', 'The ground is wet'], s: ['Rain → wet ground', 'The ground is dry, so it cannot have rained'], h: ['Work backwards from the dry ground'], mistake: 'Ignoring the contradiction.', tip: 'If the result is absent, the cause was too.' },
    { q: `Sara is taller than Bob.\nBob is taller than Joe.\n\nWho is the tallest?`, c: 'Sara', w: ['Bob', 'Joe', 'Cannot tell'], s: ['Sara > Bob > Joe', 'So Sara is tallest'], h: ['Put them in order'], mistake: 'Stopping at the first comparison.', tip: 'Chain the comparisons into one order.' },
    { q: `No fish can fly.\nA shark is a fish.\n\nCan a shark fly?`, c: 'No', w: ['Yes', 'Sometimes', 'Only at night'], s: ['No fish can fly', 'A shark is a fish → it cannot fly'], h: ['Apply the rule to the shark'], mistake: 'Letting real-world guesses override the logic.', tip: 'Use only the given rules.' },
  ]);
}

// Growing shape pattern (matchsticks).
function genShapePattern(): Problem {
  const s = randInt(3, 5), d = randInt(2, 4);
  const seq = [s, s + d, s + 2 * d, s + 3 * d];
  const next = s + 4 * d;
  return {
    id: uid(),
    question: `A growing pattern uses these many matchsticks for shapes 1–4:\n\n${seq.join(',  ')}\n\nHow many for shape 5?`,
    correctAnswer: `${next}`,
    options: makeOptions(`${next}`, [`${next + d}`, `${next - 1}`, `${seq[3] + 1}`]),
    marks: 2,
    workingSteps: [`Each shape adds ${d} matchsticks`, `Shape 5 = ${seq[3]} + ${d} = ${next}`],
    hints: [`How many are added each step?`],
    calculatorAllowed: false,
    commonMistake: `Doubling instead of adding the same amount each time.`,
    examTip: `A constant gap means a linear rule: add ${d} each step.`,
  };
}

// Codes & ciphers.
function genCodePattern(): Problem {
  return fromCases([
    { q: `Using A=1, B=2, C=3, …\n\nWhat is the code for 'CAB'?`, c: '3, 1, 2', w: ['1, 2, 3', '3, 2, 1', '2, 1, 3'], s: ['C = 3, A = 1, B = 2', 'CAB → 3, 1, 2'], h: ['Convert each letter to its position'], mistake: 'Reordering the letters.', tip: 'Keep the letters in the same order.' },
    { q: `A code shifts each letter forward by 2:\nA→C, B→D, C→E.\n\nWhat does F become?`, c: 'H', w: ['G', 'E', 'I'], s: ['Shift F forward by 2 letters', 'F → G → H'], h: ['Count two letters on from F'], mistake: 'Shifting by 1.', tip: 'Apply the exact shift stated.' },
    { q: `If A=1, B=2, C=3, …\n\nWhich letter is number 8?`, c: 'H', w: ['G', 'I', 'J'], s: ['Count to the 8th letter', 'A,B,C,D,E,F,G,H → H'], h: ['Count along the alphabet'], mistake: 'Off-by-one counting.', tip: 'A is 1, so the 8th letter is H.' },
    { q: `Using A=1, B=2, …\n\nWhat is the code for 'DOG'?`, c: '4, 15, 7', w: ['4, 14, 7', '3, 15, 7', '4, 15, 8'], s: ['D = 4, O = 15, G = 7'], h: ['Find each letter\'s position'], mistake: 'Miscounting O (it is the 15th letter).', tip: 'Double-check middle-alphabet letters.' },
  ]);
}

// "Which MUST be true?"
function genMustBeTrue(): Problem {
  return fromCases([
    { q: `John is older than Mary.\n\nWhich statement MUST be true?`, c: 'Mary is younger than John', w: ['Mary is older than John', 'They are the same age', 'John is the oldest in the class'], s: ['"John older than Mary" means the same as "Mary younger than John"'], h: ['Restate the fact the other way round'], mistake: 'Adding claims the fact does not support.', tip: 'Only what is logically forced "must" be true.' },
    { q: `All squares are rectangles.\n\nWhich statement is true?`, c: 'A square is a rectangle', w: ['A rectangle is a square', 'No square is a rectangle', 'Squares have 3 sides'], s: ['Squares are a special kind of rectangle', 'So every square is a rectangle'], h: ['Direction matters: all squares ARE rectangles'], mistake: 'Reversing the statement.', tip: '"All A are B" does not mean "all B are A".' },
    { q: `Half the class wear glasses.\n\nWhich statement MUST be true?`, c: 'Some learners wear glasses', w: ['All learners wear glasses', 'No learners wear glasses', 'Only boys wear glasses'], s: ['Half wearing glasses means at least some do'], h: ['What is guaranteed by "half"?'], mistake: 'Over-claiming "all" or "none".', tip: 'Pick the weakest statement that is definitely true.' },
  ]);
}

const MASTERS_GENERATORS: LevelGenerator[] = [
  genPatternNext, genOddOneOut, genNumberAnalogy, genMappingRule,
  genLogicDeduction, genShapePattern, genCodePattern, genMustBeTrue,
];

export function generateMastersProblems(count = 15): Problem[] {
  const out: Problem[] = [];
  for (let i = 0; i < count; i++) out.push(MASTERS_GENERATORS[i % MASTERS_GENERATORS.length]());
  return shuffle(out);
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
