# Math Adventure RPG — Complete Content Map (Ages 3 → 17)

> Every learning topic in the app, from first counting to A-Level calculus.
> **Presented by AGE only — never by school grade.** (CAPS-aligned internally; grade labels never appear in the UI.)

Last updated: 2026-06-06 · App version 1.x · Android (Google Play) · 100% offline · no ads · no accounts · no data collection.

---

## Two experiences, one app

| Ages | Experience | Style | Entry point |
|------|-----------|-------|-------------|
| **3 – 12** | **Math Monsters RPG** ("Kids' Adventure") | Bright, gamified worlds, a named companion, badges, narration | `/play?phase=1…4` |
| **13 – 17** | **The Academy** | Dark, exam-prep interface with marks, working steps, exam tips, mastery levels & mock papers | `/senior/topics/13…17` |

The home screen splits into two sections: **🎮 Kids' Adventure** (3–12) and **🎓 The Academy** (13–17). Tapping an age card opens the right experience automatically — the learner never picks a "grade".

> Ages 13/14 were deliberately shifted out of the kids' RPG into The Academy so teenagers get an age-appropriate, exam-style ramp toward the senior years. The old Phase 5/6 RPG levels still exist in code but are no longer linked from the home screen.

---

# PART 1 — Math Monsters RPG (Ages 3–12)

A single game engine (`src/game/Game.tsx`) drives all RPG phases. Each phase is a set of levels; most phases group levels into **worlds** with a boss at the end of each. Boss levels require **7 correct** answers; normal levels require **5**. Wrong answers never end the run — the child keeps trying with hints, narration, and an encouraging companion.

**Shared features:** named & customised companion character, spoken narration (Web Speech), streak tracking, earnable badges, a 30-minute healthy-play break overlay, and resume-where-you-left-off progress.

---

## Phase 1 — Pre-School · Ages 3–5 · 🌱 (15 levels)

Earliest numeracy and shape sense. No worlds — one gentle ramp.

| # | Topic |
|---|-------|
| 1 | Counting objects 1–5 |
| 2 | Counting objects 1–10 |
| 3 | Comparing two numbers — more / less |
| 4 | Simple addition (answer ≤ 5) |
| 5 | Simple subtraction (both numbers ≤ 5) |
| 6 | Subitizing — recognise a quantity at a glance |
| 7 | Number bonds — find the missing part |
| 8 | Counting objects 11–20 |
| 9 | Identify 2D shapes — circle, square, triangle, star |
| 10 | Spot the pattern — what comes next? |
| 11 | Sorting & classifying — odd one out |
| 12 | Size comparison — bigger, longer, taller |
| 13 | Identify 3D shapes — sphere, cube, cylinder, cone |
| 14 | Counting backwards from 10 |
| 15 | Ordinal numbers — first, second, third, fourth |

---

## Phase 2 — Lower Primary · Ages 6–8 · 📚 (20 levels · 4 worlds)

| World | Levels | Topics |
|-------|--------|--------|
| 🏫 **Academy of Numbers** | 1–5 | Addition to 20 · Subtraction within 20 · Add/subtract to 100 · 2/5/10 times tables · Missing-number problems |
| 🏪 **Merchant's Guild** | 6–10 | Place value (tens & units) · Money & change · Telling time · Word problems (+/−) · Doubles & halves |
| 🐉 **Dragon's Tower** | 11–15 | 3/4/6 times tables · Division by sharing · Simple fractions (½, ¼, ¾) · Perimeter · Multi-step word problems |
| 🌟 **Star Observatory** | 16–20 | Number patterns (2s–10s) · Measurement (cm, m, kg) · Pictographs · 3D properties (faces/edges/vertices) · Expanded notation |

---

## Phase 3 — Higher Primary · Ages 9–12 · 🔢 (15 levels · 3 worlds)

| World | Levels | Topics |
|-------|--------|--------|
| 🏦 **Merchant Republic** | 1–5 | Long multiplication (2×2 digit) · Division with remainders · Decimal +/− · Percentages (10% anchor) · Multi-step money |
| ⚙️ **Engineers' Citadel** | 6–10 | Area of rectangles/squares · Simplifying fractions · Adding fractions (unlike denominators) · Ratio & proportion · Combined problems |
| 🌩️ **Storm Observatory** | 11–15 | Negative integers · Mean/median/mode · Solving for unknown *n* · Order of operations (BODMAS) · Multi-step synthesis |

---

## Phase 4 — Advanced Primary · Ages 11–12 · 🧮 (15 levels)

Bridges primary into early secondary. Boss at the final level.

| # | Topic |
|---|-------|
| 16 | Adding & subtracting simple fractions |
| 17 | Adding & subtracting decimals (2 dp) |
| 18 | Percentage change & reverse percentages |
| 19 | BODMAS with squares & cubes |
| 20 | Multi-step word problems |
| 21 | Volume of rectangular prisms |
| 22 | Surface area of rectangular prisms |
| 23 | Angle relationships (supplementary, complementary, vertically opposite) |
| 24 | Triangle properties (angle sum, isosceles, exterior angles) |
| 25 | Combined geometry (volume, SA, angles) |
| 26 | Simple probability as a fraction |
| 27 | Expanding expressions & collecting like terms |
| 28 | Linear equations with variables on both sides |
| 29 | Arithmetic sequences |
| 30 | **Boss** — geometry, probability, algebra & sequences combined |

---

*(Ages 13 & 14 — formerly RPG Phases 5 & 6 — now live in The Academy below. The old RPG levels remain in code but are unlinked from home.)*

---

# PART 2 — The Academy (Ages 13–17)

A **dark, exam-prep interface** (`src/senior/`) for serious maths study. Every question carries **marks, worked solutions, hints, a common-mistake warning, and an exam tip**. Progress is **mastery-gated**: a learner must score **≥ 80%** to pass a level, and levels/topics unlock **sequentially** — no skipping ahead. Each age offers a **40-question Mock Exam**, a **Formula Vault**, a **Mistake Book**, a **Dashboard**, and a **Study Planner**. A hidden **Dev Mode** (tap the school title 7× in a release build) unlocks everything for content review.

The five Schools form one continuous upward arc: **Explorers → Pioneers → Builders → Systems → Thinkers** (find your footing → push forward → build foundations → connect & analyse systems → think abstractly).

---

## Age 13 — School of Explorers · 🧭 (6 topics · 48 levels)
*Foundations for The Academy — CAPS Gr 8/9 aligned (age-only in UI)*

| Topic | Levels | Covers |
|-------|--------|--------|
| 🔤 **Algebra Foundations** | 8 | Substitution · Like terms · Expand single & double brackets · Factorising (common + DOTS) · Solve linear · Brackets · Word problems |
| 📐 **Pythagoras & Angles** | 8 | Hypotenuse · Shorter side · Applications · Triangle angle sum · Parallel-line angles · Exterior angle · Line/point angles · Isosceles |
| 📈 **Straight-Line Graphs** | 8 | Gradient from 2 points · Read m & c · y-intercept · x-intercept · Point on line · Parallel lines · Find x · Midpoint |
| 🔢 **Numbers & Integers** | 8 | Add/subtract & multiply/divide integers · BODMAS · HCF & LCM · Squares & roots · Rounding · Directed-number word problems · Primes |
| 💯 **Ratio, Rate & Percent** | 8 | Sharing in a ratio · Simplify ratio · Unit rate · % of amount · % change · Unit conversion · Best buy · Scale |
| 🎲 **Probability & Data** | 8 | Single events · Complementary · Independent · Mean · Median & mode · Range · Quartiles & IQR · Two-way tables |

---

## Age 14 — School of Pioneers · 🚩 (6 topics · 48 levels)
*Pushing forward — CAPS Gr 9 aligned*

| Topic | Levels | Covers |
|-------|--------|--------|
| ⚡ **Exponents** | 8 | Product/quotient/power laws · Zero & negative · Scientific notation · Roots · Simplify · Evaluate · Index equations · Standard form |
| ✖️ **Algebra II** | 8 | Expand (with coefficient) · Trinomials · Common factor · Both-sides equations · Substitute into formulae · Algebraic fractions · Change of subject · Inequalities |
| 💰 **Financial Maths** | 8 | VAT · Profit & loss · Simple interest · Discount · Hire purchase · Exchange rates · Budgeting · Percentage profit |
| 🔷 **Geometry & Transformations** | 8 | Translation · Reflection · Rotation · Enlargement · Congruency tests · Similar triangles · Angle relationships · Symmetry |
| 📏 **Measurement** | 8 | Perimeter · Area (rectangle/triangle/circle) · Circumference · Compound areas · Volume · Surface area |
| 📊 **Data Handling** | 8 | Mean from table · Median (even) · Mode from table · Range & IQR · Tree diagrams · Expected frequency · Scatter · Modal class |

---

## Age 15 — School of Builders · 🏗️ (9 topics · 72 levels)
*IGCSE Core — Cambridge 0580 / 0607 / CAPS Grade 10 aligned*

| Topic | Levels | Covers |
|-------|--------|--------|
| 🔢 **Numbers & Algebra I** | 8 | Surds · Indices · Quadratics (factor) · Sequences · Logs · Standard form · Rounding/estimation · Log quotient law |
| ✏️ **Algebra II** | 8 | Quadratic formula · Simultaneous · Inequalities · Algebraic fractions · Completing the square · Linear + quadratic · Change of subject · Factor by grouping |
| 📐 **Geometry & Vectors** | 8 | Analytical geometry · Circle geometry · Similarity · Vectors · Volume & surface area · Sector arc · Polygon angles · Similar-shape area/volume |
| 📡 **Trigonometry** | 8 | SOH-CAH-TOA · Sine/cosine rule · Elevation & depression · Bearings · 3D trig · Inverse trig · ½ab sin C · Exact values |
| 💯 **Numeracy & Proportion** | 8 | Percentages · % change · Reverse % · Ratio sharing · Direct proportion · Inverse proportion · Speed-distance-time · Unit conversion |
| 📊 **Statistics** | 8 | Mean/median/mode · Box plots · Grouped data · Frequency-table mean · Scatter & correlation · Stem-and-leaf · Range · Comparing data |
| 🎲 **Probability & Finance** | 8 | Venn diagrams · Compound interest · Single events · Tree diagrams · Mutually exclusive · Independent events · Simple interest · Expected frequency |
| 🔀 **Functions** | 8 | Evaluate/composite/inverse · Graphs · Domain & range · Graph-type recognition · Line from 2 points · Turning point · Solving f(x)=k · Transformations |
| ⬛ **Matrices & Transformations** | 8 | Transformations · Multiply & determinant · Inverse matrix · Add/subtract · Scalar × · Identity · Matrix equations · Transformation matrices |

---

## Age 16 — School of Systems · 🛰️ (7 topics · 56 levels)
*IGCSE Extended / A-Level AS — Cambridge 9709 / CAPS Grade 11 aligned*

| Topic | Levels | Covers |
|-------|--------|--------|
| 🌊 **Advanced Trigonometry** | 8 | Identities · Equations · Radians · Pythagorean identity · Double angle · Graph properties · Interval solutions · Reciprocal ratios |
| ∫ **Calculus** | 8 | First principles · Differentiation · Tangents · Stationary points · Integration · Gradient at a point · Normals · Rates of change |
| 📈 **Exponential Functions** | 8 | Growth & decay · Solving equations · Models · Graph properties · Population growth · Half-life · Log form · Doubling time |
| 🧮 **Algebra III** | 8 | Polynomial division · Logs · Remainder theorem · Factor theorem · Binomial · Solving cubics · Binomial coefficients · Log equations |
| 🔁 **Functions II** | 8 | Transformations · Inverse · Composite · Solve for input · Domain & range · Composite expressions · Self-inverse · Piecewise |
| 📌 **Analytical Geometry II** | 8 | Equation of a line · Vectors · Perpendicular · Circle · Midpoint & distance · Parallel lines · Centre & radius · Tangent length |
| 📉 **Statistics II** | 8 | Standard deviation · Conditional probability · Variance · E(X) · Probability distributions · Combinations · Permutations · Counting principle |

---

## Age 17 — School of Thinkers · 🧩 (7 topics · 56 levels)
*A-Level Pure Mathematics — Cambridge 9709 / CAPS Grade 12 aligned*

| Topic | Levels | Covers |
|-------|--------|--------|
| 📉 **Differentiation** | 8 | Chain rule · Product rule · Second derivative · Stationary nature · Optimisation · Quotient rule · Tangent equations · Connected rates of change |
| ∫ **Integration** | 8 | Definite integrals · Area under a curve · Reverse chain · Polynomials · Evaluation · Indefinite integrals · Area between curves · Volumes of revolution |
| 🔢 **Sequences & Series** | 8 | Arithmetic sum · Geometric sum · Sum to infinity · Find the term · Sigma notation · Arithmetic from two terms · Common ratio · First term from S∞ |
| 📐 **Trigonometry III** | 8 | Solving equations · Compound angles · Exact radians · Simplifying · Double angle · Arc & sector (radians) · Quadratic trig equations · Identities |
| 📈 **Logs & Exponentials** | 8 | ln laws · Solving logs · Log-law equations · Change of base · Solving eˣ equations · ln equations · Evaluating logs · Continuous growth models |
| 🔀 **Functions** | 8 | Composite · Inverse · Modulus equations · Domain & range · Modulus inequalities · Inverse domain/range · Evaluating inverses · Combined transformations |
| 🧮 **Algebra & Proof** | 8 | Partial fractions · Binomial coefficients · Factorising cubics · Binomial terms · Remainder theorem · Completing the square · Polynomial identities · Discriminant |

---

# Content at a glance

| Band | Ages | Experience | Worlds/Topics | Levels |
|------|------|-----------|---------------|--------|
| Pre-School | 3–5 | Kids' Adventure (RPG) | — | 15 |
| Lower Primary | 6–8 | Kids' Adventure (RPG) | 4 worlds | 20 |
| Higher Primary | 9–12 | Kids' Adventure (RPG) | 3 worlds | 15 |
| Advanced Primary | 11–12 | Kids' Adventure (RPG) | — | 15 |
| School of Explorers | 13 | The Academy | 6 topics | 48 |
| School of Pioneers | 14 | The Academy | 6 topics | 48 |
| School of Builders | 15 | The Academy | 9 topics | 72 |
| School of Systems | 16 | The Academy | 7 topics | 56 |
| School of Thinkers | 17 | The Academy | 7 topics | 56 |

**Kids' Adventure total:** 65 levels (ages 3–12) · **The Academy total:** 280 levels across 35 topics (ages 13–17) — every Academy topic is a uniform 8 levels.

Every generated question is verified to offer **4 distinct multiple-choice options** with the correct answer always present (engine-level guarantee). Senior questions add worked steps, exam tips, and common-mistake notes; senior progress is mastery-gated at ≥ 80% with sequential unlocking.

---

*This document reflects the in-app content. The curriculum is CAPS-aligned and Cambridge-referenced internally, but the app's UI always presents learning by age, never by grade.*
