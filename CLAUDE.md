# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server — http://localhost:5173
npm run build      # Type-check + production build → dist/
npm run preview    # Serve the production build locally
npm run lint       # TypeScript type-check only (tsc --noEmit), no test runner
npm run clean      # Delete dist/

# Academy generator smoke test (option distinctness + correct ∈ options)
node --experimental-strip-types smoke-senior.mts

# Mobile (Android) — run after every build
npx cap sync          # Copy dist/ → android/app/src/main/assets/www/
npx cap open android  # Open Android Studio → Build signed AAB
```

For network mobile testing: `npx vite --host` then open the Network URL on the phone.

## Core product rule

**Present everything by AGE, never by school grade.** CAPS/IGCSE/Cambridge alignment is internal only — grade labels must never appear in rendered UI. This is non-negotiable.

## Architecture

React 19 + TypeScript + Vite + Tailwind CSS v4 + Capacitor 8 (Android wrapper).

The app has **two experiences**, chosen on the home screen (`src/pages/HomePage.tsx`, split into 🎮 *Kids' Adventure* 3–12 and 🎓 *The Academy* 13–17):

### 1. Kids' Adventure — the RPG (ages 3–12)
- **Entry:** `/play?phase=1|2|3|4` (the Game **clamps phase to ≤ 4**).
- **Engine** (`src/game/Game.tsx`): one large component owning all state via a `GameState` enum (`'START' | 'TUTORIAL' | 'LEVEL_INTRO' | 'PLAYING' | 'VICTORY'`) with handlers (`startGame`, `handleAnswer`, …). Bright theme, companion (`src/game/Companion.tsx`, default "Sparky" 🐉), narration (`src/game/useNarration.ts`), badges, streaks, 30-min break timer.
- **Math** (`src/mathEngine.ts`): `generateProblem(phase, level)` looks up `'${phase}-${level}'` in `GENERATORS`. Active generators are `p1l*`, `p2l*`, `p3l*`, `p4l*`. Helpers: `numericOptions`, `shuffle`, `fractionStr`, `rand`.
- **Levels:** Phase 1 = 15, Phase 2 = 20, Phase 3 = 15, Phase 4 = 15 → **65 levels**.

### 2. The Academy — exam prep (ages 13–17)
- **Entry:** `/senior/topics/:age` (+ `/senior/activity|success|mistakes|formulas/:topicId|dashboard|planner`). Lazy-loaded in `src/App.tsx`. Dark theme; the global marketing `BottomNav` is hidden on `/senior/*`.
- **Math** (`src/senior/mathEngine.ts`): `TOPIC_LEVELS` maps `'age{N}-{topic}'` → `{ levelNumber: generator }`. Each generator returns the IGCSE `Problem` type: `question, correctAnswer, options:[string×4], marks, workingSteps[], hints[], calculatorAllowed, commonMistake, examTip`. `makeOptions(correct, wrong[])` guarantees 4 distinct options (de-dupe + numeric-neighbour padding). `fromCases(CaseDef[])` builds compact conceptual generators; `factorial`/`comb`/`perm` are shared helpers.
  - `generateProblems(topicId, _diff, count, level)` — a single level. `generateTopicTestProblems(topicId)` — topic test. `generateMockExamProblems(age, count)` — pulls every `age{N}-*` generator for a full paper. `generateMastersProblems(count)` — the cross-age **Masters Quiz** (critical thinking; mode `'masters'`, not tied to one age).
- **Curriculum** (`src/senior/curriculum.ts`): `CURRICULUM: AgeGroup[]` keyed by `age` (13–17). Each has a `school` name and `topics[]` (`id`, `title`, `subtitle`, `levels`, …).
- **Progress** (`src/senior/progress.ts`): localStorage keys `mathadv-senior-*`. **Pass = ≥ 80%**, sequential level + topic unlock (mastery gating), mistake log, mock scores. **Dev Mode** (`isDevButtonRevealed`/`revealDevButton`, key `mathadv-senior-devreveal`) unlocks everything for content review — always shown on the dev server, hidden in release until the school title is tapped 7×.
- **Formula Vault** (`src/senior/formulas.ts`): `FORMULAS` keyed by topic id.
- **Schools (one upward arc):** 13 **Explorers** 🧭 · 14 **Pioneers** 🚩 · 15 **Builders** 🏗️ · 16 **Systems** 🛰️ · 17 **Thinkers** 🧩. **Every topic is a uniform 8 levels.** Totals: 48 / 48 / 72 / 56 / 56 = **280 levels across 35 topics**.

**Routing** (`src/App.tsx`): React Router 7. Marketing pages (`/about`, `/features`, `/curriculum`, `/parents`, `/preschool` … `/age17`, `/secondary`, `/grown-up-corner`) + the two experiences above. `isImmersive = pathname === '/play' || startsWith('/senior')` hides the global `BottomNav`.

**Navigation surfaces (no link duplicated across them):** mobile `BottomNav` (Home · Learn=`/curriculum` · Grown-Ups=`/grown-up-corner` · Start=`/`); home footer + marketing `Footer` (About · Parent Guide · Privacy · Contact); desktop `Navbar`.

**Data layer** (`src/data/grades.ts`): `GRADES[]` is a 9-item legacy config driving the Curriculum/marketing pages. Phases 1–4 are the live RPG (`playLink` → `/play?phase=N`); phases 5–9 are the Academy ages 13–17 (`playLink` → `/senior/topics/{age}`, real school names + level counts). `GRADES`/`GradeConfig` are legacy internal names — UI shows ages only.

**Persistence** (all `localStorage`):
- Kids' RPG: `mathProgress` `{ phase, levelInPhase }`, `earnedBadges`, `companionSetup`, `streakData`, `sessionTimer`
- Academy: `mathadv-senior-progress`, `mathadv-senior-settings`, `mathadv-senior-devreveal`

> **Orphaned RPG phases 5–9.** `src/mathEngine.ts` still contains `p5l*`–`p9l*` and `Game.tsx` still has `PHASES[4..8]`, but ages 13–17 now live in The Academy — these phases are **unlinked from home and unreachable** (`/play` clamps phase to ≤ 4). Treat them as legacy/retirement candidates; do not extend them.

## Adding content

### Add an Academy level/topic (ages 13–17) — the common case
1. Write `genX()` in `src/senior/mathEngine.ts` returning a `Problem` (arithmetic generators should *compute* the answer; conceptual ones use hand-verified `fromCases`).
2. Register it in the topic's `TOPIC_LEVELS['age{N}-{topic}']` map.
3. For a **new topic**: add a `TopicCard` to that age's `topics[]` in `src/senior/curriculum.ts`, and (optionally) a `FORMULAS['age{N}-{topic}']` set in `formulas.ts`.
4. Run `node --experimental-strip-types smoke-senior.mts`, then `npm run lint` and `npm run build`.

### Add a Kids' RPG level (ages 3–12)
1. Write `pNlM()` in `src/mathEngine.ts`; register `'N-M': pNlM` in `GENERATORS`.
2. Add `{ n, topic }` to `PHASES[N-1].levels` in `Game.tsx`; bump the `levels` count in `src/data/grades.ts`.
3. Boss levels (Phase 2+) are at lip 5/10/15/20 (require 7 correct vs 5). New worlds must be wired into `P{n}_WORLDS`, `P{n}_LEVEL_INTROS`, `P{n}_HINTS`, `getHint`, and the world-entry detection in `startGame`/`handleAnswer`.

## Android Release Checklist

1. Bump `versionCode` and `versionName` in `android/app/build.gradle`
2. `npm run build && npx cap sync`
3. Android Studio → Build → Generate Signed Bundle/APK → release AAB
4. Upload AAB to Google Play Console (closed testing track while in testing)

See `docs/android-build-guide.md` for first-time keystore setup.
