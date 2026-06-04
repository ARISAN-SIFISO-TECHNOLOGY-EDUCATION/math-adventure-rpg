# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server — http://localhost:5173
npm run build      # Type-check + production build → dist/
npm run preview    # Serve the production build locally
npm run lint       # TypeScript type-check only (tsc --noEmit), no test runner
npm run clean      # Delete dist/

# Mobile (Android) — run after every build
npx cap sync          # Copy dist/ → android/app/src/main/assets/www/
npx cap open android  # Open Android Studio → Build signed AAB
```

For network mobile testing: `npx vite --host` then open the Network URL on the phone.

## Architecture

React 19 + TypeScript + Vite + Tailwind CSS v4 + Capacitor 8 (Android wrapper).

**Routing** (`src/App.tsx`): React Router 7. Marketing pages (`/features`, `/curriculum`, `/preschool`, `/lower-primary`, etc.) plus the single game entry point `/play?phase=1|2|3|4`.

**Game engine** (`src/game/Game.tsx`): One large component that owns all game state. Uses a `GameState` enum — `'START' | 'TUTORIAL' | 'LEVEL_INTRO' | 'PLAYING' | 'VICTORY'` — and transitions between them via event handlers (`startGame`, `handleAnswer`, `handleTutorialDone`, etc.).

**Math engine** (`src/mathEngine.ts`): All question generation lives here. `generateProblem(phase, level)` looks up a key `'${phase}-${level}'` in the `GENERATORS` map and calls the matching function. There are 105 generators total: `p1l1`–`p1l15`, `p2l1`–`p2l20`, and `p3`–`p9` with 15 levels each (`pNl1`–`pNl15`). Key helpers: `numericOptions(correct, count, minVal, spread)`, `shuffle<T>()`, `fractionStr(num, den)`, `rand(min, max)`.

**Data layer** (`src/data/grades.ts`): `GRADES[]` is a 9-item config array (one per phase) that drives the landing-page grade cards, phase names, topic lists, and play/detail links. When adding a phase or changing level counts, update `GRADES` here AND `PHASES[]` inside `Game.tsx`.

**Companion** (`src/game/Companion.tsx`): Displays the player's named character. Accepts an `emotion` prop (`'idle' | 'happy' | 'excited' | 'thinking' | 'encouraging' | 'celebrating'`) which drives animation and picks a random message from `MESSAGES[emotion]`. Pass `customMessage` to override the random pick.

**Narration** (`src/game/useNarration.ts`): Web Speech API wrapper. Called in `Game.tsx` to read question text aloud when a new problem loads. Respects the mute toggle.

**Persistence** (all `localStorage`):
- `mathProgress` — `{ phase, levelInPhase }` — resumes where the player left off
- `earnedBadges` — array of badge IDs
- `companionSetup` — `{ name, emoji }`
- `streakData` — `{ date, count }`
- `sessionTimer` — enforces the 30-minute break overlay

## Phases, Levels, and Generators

| Phase | Ages | CAPS | Worlds | Levels (lip) | Generator keys |
|-------|------|------|--------|--------------|----------------|
| 1 | 3–5 | Pre-School | Pre-School (no worlds) | 1–15 | `1-1` … `1-15` |
| 2 | 6–8 | Foundation | Academy, Merchant's Guild, Dragon's Tower, Star Observatory | 1–20 | `2-1` … `2-20` |
| 3 | 9–12 | Intermediate | Merchant Republic, Engineers' Citadel, Storm Observatory | 1–15 | `3-1` … `3-15` |
| 4 | 11–12 | Advanced Primary | The Pinnacle, Geometry Forge, Summit Academy | 1–15 | `4-1` … `4-15` |
| 5 | 13 | Gr 8 | Iron Citadel, Storm Fortress, Oracle's Nexus | 1–15 | `5-1` … `5-15` |
| 6 | 14 | Gr 9 | Algebra Lab, Proof Chamber, Data Observatory | 1–15 | `6-1` … `6-15` |
| 7 | 15 | FET Gr 10 | Algebra Foundry, Function Observatory, Geometry Citadel | 1–15 | `7-1` … `7-15` |
| 8 | 16 | FET Gr 11 | Quadratic Forge, Analytical Tower, Trigon Sanctum | 1–15 | `8-1` … `8-15` |
| 9 | 17 | FET Gr 12 | Sequence Spire, Calculus Crucible, Apex Observatory | 1–15 | `9-1` … `9-15` |

`levelInPhase` (lip) is the 1-indexed position within the phase. `PHASES[phase-1].levels[lip-1].n` is the display number shown to the player (cumulative 1–105). Boss levels are lip 5, 10, 15, 20 for Phase 2+ (require 7 correct instead of 5). For phases with three 5-level worlds, world entries are lip 1, 6, 11; wire new world phases into `P{n}_WORLDS`, `P{n}_LEVEL_INTROS`, `P{n}_HINTS`, `getHint`, the intro/world lookup, the world-entry detection in `startGame`/`handleAnswer`, and the in-game hint render block.

## Adding a New Level (e.g. Phase 2 lip 21)

1. Write `p2l21()` in `src/mathEngine.ts` returning a `Problem` — requires `question`, `options`, `correctAnswer`; `explanation` is optional but recommended.
2. Register `'2-21': p2l21` in the `GENERATORS` map (after the last `2-x` entry, before the next phase block).
3. Add `{ n: <display_n>, topic: '...' }` to `PHASES[1].levels` in `Game.tsx`.
4. Update `src/data/grades.ts`: increment `levels` count for Phase 2.
5. If this starts a new world: add the world to `P2_WORLDS`, add the lip to `P2_LEVEL_INTROS`, `P2_HINTS`, `isBossLevel`, and both `isP2WorldEntry` locations in `Game.tsx`.

## Android Release Checklist

1. Bump `versionCode` and `versionName` in `android/app/build.gradle`
2. `npm run build && npx cap sync`
3. Android Studio → Build → Generate Signed Bundle/APK → release AAB
4. Upload AAB to Google Play Console (closed testing track while in testing)

See `docs/android-build-guide.md` for first-time keystore setup.
