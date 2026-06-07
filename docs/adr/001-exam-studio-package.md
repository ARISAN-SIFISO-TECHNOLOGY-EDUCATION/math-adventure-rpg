# ADR 001 — Extract a shared `exam-studio` framework (in-repo first)

- **Status:** Accepted (2026-06-07)
- **Context:** Remaster plan S2 — "Ecosystem scalability (the Sprouts vision)."

## Context

The Academy (ages 13–17) is built on a reusable exam-prep pattern: a `Problem`
contract, option/conceptual generators, a mastery/progress engine (≥80% gating,
mistake log, streak, mock scores), and a set of page shells. The long-term goal
is a family of "Sprouts" apps (Science, Tech, Critical-Thinking) that share this
framework instead of each being a fork.

The open decision (from the plan): **monorepo / published package vs. something
lighter — and how much to do now.**

Key constraints:

- The app is **live on Google Play** (Capacitor + Vite), maintained by a solo
  developer. Build/release stability matters more than architectural purity.
- There is currently **exactly one consumer**. A second Sprouts app does not yet
  exist, so a fully published package would be abstraction ahead of need.
- The reusable core is already almost dependency-clean; the *page shells* are the
  only part tightly coupled to app content.

## Decision

**Establish the package boundary in-repo now; defer the workspace/publish split
until a second consumer actually exists.**

1. The content-free framework core moves to **`src/exam-studio/`** with a single
   public barrel (`index.ts`):
   - `types.ts` — `Problem`, `CaseDef`, `LevelGenerator`, `TopicLevels`.
   - `helpers.ts` — `makeOptions`, `fromCases`, `randInt`, `shuffle`, `gcd`,
     `simplify`, `expOptions`, `comb`, `perm`, `uid`.
   - `progress.ts` — the mastery engine + streak/daily-goal + mistake log.
2. **Dependencies point inward only:**
   `exam-studio  ←  senior (content + page shells)  ←  App`.
   The framework imports **no** app content (maths generators, curriculum,
   formulas) and **no** app UI.
3. The **one host seam** is `src/lib/safeStorage.ts` (a generic localStorage
   util). It is intentionally left in `src/lib` and consumed by the framework's
   `progress.ts`. On extraction it becomes a bundled util / `@sprouts/utils`.

### Why the page shells stay in `src/senior/` (not in the framework yet)

The shells (`ActivityPage`, `TopicsPage`, `DashboardPage`, …) import this app's
**content** directly (`mathEngine`, `curriculum`, `formulas`). Moving them into
the framework as-is would invert the dependency arrow (framework → content) and
create a cycle. Making them reusable requires **injecting** content (a
`ProblemSource` + `Curriculum` passed in via props/config) — that is the bulk of
the eventual extraction work and carries real regression risk for a live app.
It is deliberately deferred (see below).

## Consequences

- **No new build/release complexity.** The app still builds and ships exactly as
  before; `npm run lint / test / smoke / build` all pass unchanged.
- The reusable core is now **named, discoverable, and dependency-audited**, so a
  future extraction is near-mechanical.
- Consumers use the public API via the barrel:
  `import { recordAttempt, makeOptions, type Problem } from '../../exam-studio';`
- `src/senior/mathEngine.ts` imports the engine core **directly** (`../exam-studio/types.ts`,
  `../exam-studio/helpers.ts`, with `.ts` extensions) rather than via the barrel,
  so the Node strip-types smoke test never loads the `progress`/localStorage path.

## Migration path (when a 2nd Sprouts app exists)

1. **Invert shell content deps:** give the page shells a `ProblemSource`
   (`generateProblems`/`…TopicTest`/`…Mock`/`…Masters`) and a `Curriculum`
   value via props/context instead of importing them. Move the shells into
   `exam-studio/shells/`.
2. **Promote to a workspace package:** create `packages/exam-studio` (npm/pnpm
   workspaces), move `src/exam-studio/*` there, publish as `@sprouts/exam-studio`.
   Bundle `safeStorage` into the package (or a `@sprouts/utils`).
3. **Convert the repo to `apps/* + packages/*`**; each app provides its own
   content (`mathEngine`/`curriculum`/`formulas`) + routes and consumes the
   package.

Until step 1 is justified by a real second app, the in-repo boundary above is the
correct stopping point.
