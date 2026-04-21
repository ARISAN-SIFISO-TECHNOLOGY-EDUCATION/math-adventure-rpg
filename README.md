# Math Adventure RPG

A gamified math learning app for children ages 3–12. Players solve math problems to battle monsters, earn coins, unlock badges, and progress through 45 levels across 4 difficulty phases.

Built with Vite + React 19 + TypeScript. Wrapped for Android using Capacitor. No backend, no API keys, no internet required.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion
- **Math Engine:** Procedural generator (`src/mathEngine.ts`) — all problems generated on-device
- **Audio:** Web Audio API (SFX/BGM) + Web Speech API (narration)
- **Persistence:** `localStorage` — progress, coins, badges, streaks
- **Android:** Capacitor 8 wrapping the Vite `dist/` build

## Local Development

### Prerequisites
- Node.js v18+
- npm

### Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Available Scripts

- `npm run dev` — Start the Vite development server
- `npm run build` — Build for production (outputs to `dist/`)
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run TypeScript type checking

## Android Build (Google Play)

After making changes, sync to Android:

```bash
npm run build
npx cap sync
```

Then open Android Studio to build the signed AAB:

```bash
npx cap open android
```

Build → Generate Signed Bundle/APK → Android App Bundle

## Game Structure

| Phase | Badge | Ages | Levels | Topics |
|-------|-------|------|--------|--------|
| 1 | Pre-School | 3–5 | 10 | Counting, shapes, patterns, addition within 5 |
| 2 | Lower Primary | 6–8 | 15 | Numbers, money, time, multiplication, fractions |
| 3 | Higher Primary | 9–12 | 15 | Decimals, algebra, data, ratio |
| 4 | Advanced Primary | 11–12 | 5 | BODMAS, percentages, multi-step word problems |

## Privacy

- No accounts, no sign-up
- No data collection of any kind
- No ads, no in-app purchases
- Fully offline — no network calls during gameplay
- COPPA and GDPR-K compliant
