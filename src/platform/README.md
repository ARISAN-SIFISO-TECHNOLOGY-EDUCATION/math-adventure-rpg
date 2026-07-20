# `src/platform/` — the platform seam

One codebase, two editions. This layer is the seam that lets the **web (Community Edition)** evolve
while **Google Play (Stable/LTS)** stays frozen. Introduced **2026-07-10** (seam-first — no existing
code was moved).

| File | Role |
|---|---|
| `profiles.ts` | `PROFILE` — the build profile (`play-store \| community \| development \| demo`), resolved at build time. Supersedes bare `WEB_BUILD`. |
| `platform.ts` | `PLATFORM` — `{ isWeb, isMobile, isDesktop }`, the single source of truth for the runtime shell. Use instead of raw `Capacitor.isNativePlatform()`. |
| `flags/index.ts` | Declarative feature-flag registry: which flags each profile enables. |
| `featureFlags.ts` | `isEnabled(flag)` — resolves a flag from **profile AND runtime shell** (experiments can never light up in the native/Play shell). |
| `adapters/` | Platform-adapter seam (stub now; real per-shell services adopted incrementally in Phase C). |
| `index.ts` | Public barrel — import platform concerns from here. |

## The rules

- **Stable Build Principle.** The Play (LTS) edition's gameplay, saves, progression, content, and UX
  never change without explicit founder approval. `play-store` profile ships **core only**.
- **Seam-first, incremental.** Phase A = this seam. Phase B = `src/web/` feature area. Phase C =
  move shared code into `src/core/` one subsystem at a time, by stability, freeze between.
  **"No file moves without a reason."**

See the repo `CLAUDE.md` and
`peoples-home/brain/apps/math-adventure-release-policy.md` for the full policy.
