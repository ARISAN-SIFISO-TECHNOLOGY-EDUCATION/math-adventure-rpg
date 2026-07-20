# Numeria — Animation & Storytelling Blueprint

**The canonical blueprint is not in this repository.** It lives in The People's Home Brain:

```
peoples-home/brain/apps/numeria-roadmap.md        the blueprint — MA-0 … MA-5, constraints
peoples-home/brain/apps/numeria-constitution.md   MA-0 — the constitution (read this first)
peoples-home/brain/decisions/DECISIONS.md         D-16 — why "Numeria", why no shared engine yet
```

This repository intentionally keeps only implementation notes. Product vision, architecture,
governance, and founder decisions live in the Brain.

---

## What you need to know before writing any animation code

**🗺️ Numeria** is the name of this app's world — the web-only experience layer that wraps the
existing game. It is **not** early-numeracy's "Number Kingdom", which belongs to a different app.

**Status: MA-0 is DRAFT and not frozen. Do not build yet.** The governance model is
`Blueprint → Freeze → Build`, and **freeze is a founder act** — never self-declare one.

Three rules that will not change:

1. **Web only.** Everything ships behind `src/platform/` — `isEnabled()` gates on build profile
   **and** web shell. The `play-store` bundle hash must not change. Verify it after every milestone.
2. **Wrap, don't rewrite.** `src/mathEngine.ts`, `src/game/phases.ts` progression, the 65 levels and
   the save format are frozen. Numeria is presentation, navigation, and emotion — never mechanics.
3. **The Four-Purpose Test.** Every story element must **teach, motivate, orient, or celebrate**.
   If it does none of those four, it does not belong in Numeria. "It looks cool" is not a purpose.

Story code, when it exists, goes in `src/web/numeria/` — **app-local**. Do not name it a "TPH Story
Engine" or extract it to `@tph/core`; that happens only when a second app genuinely needs it (D-16).
