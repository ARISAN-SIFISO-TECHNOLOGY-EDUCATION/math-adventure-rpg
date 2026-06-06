# Math Adventure

A gamified maths-learning app for ages **3 to 17**, presented by **age only — never school grade**. Two experiences in one app:

- **🎮 Kids' Adventure (ages 3–12)** — a bright, turn-based RPG: solve problems to battle monsters, earn coins, unlock badges, and progress through 65 levels across 4 phases.
- **🎓 The Academy (ages 13–17)** — a dark, exam-prep interface: marks, worked steps, hints and exam tips, mastery-gated levels (≥ 80% to advance), 40-question mock papers, a Formula Vault, a Dashboard and a Study Planner — plus a cross-age **Masters Quiz** (critical thinking).

Built with Vite + React 19 + TypeScript + Tailwind CSS v4. Wrapped for Android with Capacitor 8. **No backend, no API keys, no accounts, no internet required.**

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion
- **Kids' RPG engine:** `src/mathEngine.ts` — procedural generators, all on-device
- **Academy engine:** `src/senior/mathEngine.ts` — IGCSE/CAPS `Problem` generators (marks, steps, tips) in a `TOPIC_LEVELS` map
- **Audio:** Web Audio API (SFX/BGM) + Web Speech API (narration)
- **Persistence:** `localStorage` — RPG progress/coins/badges/streaks (`mathProgress`, …) and Academy progress (`mathadv-senior-*`)
- **Android:** Capacitor 8 wrapping the Vite `dist/` build

## Local Development

```bash
npm install
npm run dev      # http://localhost:5173
```

For phone testing on your network: `npx vite --host` then open the Network URL.

## Available Scripts

- `npm run dev` — Vite dev server
- `npm run build` — type-check + production build → `dist/`
- `npm run preview` — preview the production build
- `npm run lint` — TypeScript type-check (`tsc --noEmit`)
- `node --experimental-strip-types smoke-senior.mts` — validate every Academy generator (4 distinct options, correct answer present)

## Android Build (Google Play)

```bash
npm run build
npx cap sync
npx cap open android   # Build → Generate Signed Bundle/APK → AAB
```

## Content Structure

**Kids' Adventure (RPG) — `/play?phase=1|2|3|4`**

| Phase | Band | Ages | Levels | Topics |
|-------|------|------|--------|--------|
| 1 | Pre-School | 3–5 | 15 | Counting, shapes, patterns, addition/subtraction within 5 |
| 2 | Lower Primary | 6–8 | 20 | Numbers, money, time, multiplication, fractions, data |
| 3 | Higher Primary | 9–12 | 15 | Decimals, fractions, ratio, algebra, data |
| 4 | Advanced Primary | 11–12 | 15 | Fractions, geometry, probability, algebra, sequences |

**The Academy — `/senior/topics/:age`** (every topic is a uniform 8 levels)

| Age | School | Topics | Levels |
|-----|--------|--------|--------|
| 13 | Explorers 🧭 | 6 | 48 |
| 14 | Pioneers 🚩 | 6 | 48 |
| 15 | Builders 🏗️ | 9 | 72 |
| 16 | Systems 🛰️ | 7 | 56 |
| 17 | Thinkers 🧩 | 7 | 56 |

Plus **The Masters Quiz** 🧠 — a cross-age critical-thinking quiz.

A full topic-by-topic map lives in [`docs/APP-CONTENT-AGES-3-TO-17.md`](docs/APP-CONTENT-AGES-3-TO-17.md).

## Privacy

- No accounts, no sign-up
- No data collection of any kind
- No ads, no in-app purchases
- Fully offline — no network calls during use
- COPPA, GDPR-K and POPIA aligned
