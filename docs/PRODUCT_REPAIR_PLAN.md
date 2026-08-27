# Math Adventure RPG — Product Repair & Educational Trust Plan

## Context

Teachers who were approached months ago have come back through a middleman asking what you'd
like them to do with this app. Before answering, two audits were run: a codebase audit and a
child-facing product audit. The second one is why this plan exists.

The product audit established that Math Adventure genuinely supports **~6–17**, not the claimed
3–17, and that the gap isn't missing content — it's that **the narration meant to carry
non-readers doesn't say the words**. Emoji are stripped from speech (so "How many ⭐?" is spoken
as *"How many ?"*), the U+2212 minus is deleted by the speech filter (so `8 − 3 = ?` is read as
*"eight three equals what"*, across 12 of 65 levels), answer options are never spoken at all,
and the teaching explanation after a wrong answer is rendered as text and never voiced.

Alongside that: one item marks a correct answer wrong, a pictogram item is degenerate 3.7% of
the time, the kids' game labels children by school stage against the product's own
non-negotiable rule, and there is a single save slot on the device — which is the first thing a
teacher will ask about.

**Intended outcome:** a build a child can trust, in a state worth putting in front of a teacher.
Not a store submission that passes.

### Governing principle

> **Play 2.2 = repair. Web = experimentation and validation. Play graduation = deliberate
> founder decision.**

Restoring behaviour the product already promises is repair. Changing what the product *is* —
labels, answer formats, learner profiles — is a new product model and stays web-first until
validated.

### Decisions locked in

| Decision | Chosen | Framing |
|---|---|---|
| Age floor | **6+ now, Phase 0 later** | An honesty decision, not abandonment of the younger-child ambition. Phase 1 is re-presented as the age 5–7 foundation it actually is; 3–5 returns as a purpose-built voice-first tier. |
| Play LTS | **Bug + a11y + compliance to Play 2.2; structural web-first** | 2.2 makes the existing Play promise truthful. It does not redesign the product. |
| Profiles | **Lightweight local "Who's playing?" switcher** | ~6 learners per device, reusing the existing `companionSetup {name, emoji}` identity. No accounts, no cloud, no teacher dashboard, no additional personal data. |
| Matching-game defect | **Excluded — flagged for a separate audit** | Verified absent from this repo (see below). |

### Two things deliberately not in this plan

**The "matching-game defect" and "repeated timeline questions" are not Math Adventure's.**
I searched the repo: there is no matching activity, no drag-drop, no pair interaction and no
timeline. Every item in both experiences is 4-option multiple choice, plus the subitizing flash
(`meta.isSubitizing`) and the number-bond visual (`meta.bondTotal`). The `pairs` symbols in
`src/mathEngine.ts` are internal data arrays inside size-comparison and fraction generators, not
an activity type.

Those defects belong to another People's Home app — Our World, Everyday Foundations and Science
Sprouts all have bespoke activity types. As described (rejects correct answers, cannot complete,
shows both sides of the pair) they are genuinely P0 wherever they live. **Recommendation: run
the same play-the-app audit against the source app once identified.** Static verification would
not have caught it there either — which is exactly the lesson this audit produced.

**Assumption flagged:** the trust-track question wasn't answered in either round, so Track C
below is built from what your notes already specify — the Learner Experience Test as a new
layer, content mapped against age bands, teachers engaged as evaluators rather than reviewers of
a finished thing, and Teacher Approved as the downstream target. Adjust if that's wrong.

---

## Phase 0 — Unblock the release path

`scripts/release.mjs` refuses a dirty tree. The working copy currently holds the uncommitted
Living World work (7 new files, 6 modified). Commit or stash it before Track A ships.

Nothing in it reaches the Play build — the `play-store` bundle emits zero Living World chunks —
but the release script will not start.

---

## Track A — Play 2.2 "Repair"

Every item restores intended behaviour. None changes gameplay, saves, progression, or displayed
content.

### A1. Narration repair (the core of 2.2)

The root cause is that speech is *derived from display text* by a destructive filter,
`cleanForSpeech` in `src/game/useNarration.ts`. Repair it in four layers, smallest blast radius
first.

**A1a — Speak operators as words.** Extend the allow-list to U+2212 and substitute symbols with
words before the utterance is built: `−`→"minus", `+`→"plus", `×`→"times", `÷`→"divided by",
`=`→"equals".

*Reuse the pattern that already exists:* `speakQuestion` already does exactly this for fractions
via `lines.fractionOver`. Add the operator words to `NarrationLines` in `src/i18n/narration.ts`
for both `en` and `zu`, alongside `fractionOver`. Keeping them in the locale files is required —
`src/i18n/i18n.test.ts` enforces key parity and the build fails on drift.

**A1b — Stop losing the noun.** In counting, comparison, pattern and sort levels the emoji *is*
the mathematical object; stripping it removes the subject of the sentence.

Add an optional `speech?: string` to `Problem['meta']` in `src/mathEngine.ts` and have
`speakQuestion` prefer it, falling back to `cleanForSpeech(question)` when absent. This is
additive to the existing `meta` object, so **only the ~10 affected Phase 1–2 generators need
touching, not all 65**. Displayed content is unchanged; only what is spoken changes.

**A1c — Speak the answer options.** Add `speakOptions` to `useNarration`. Build question and
options into a **single utterance** ("What shape is this? Is it Triangle, Circle, Square, or
Star?") rather than two `speak()` calls — the existing `speak` begins with `synth.cancel()`, so
consecutive calls would cancel each other.

**A1d — Speak the teaching moment.** The reveal panel in `src/game/Game.tsx` renders
`problem?.explanation` and never voices it. Speak it when the reveal fires — currently
`speakWrong()` plays only a generic encouragement line.

**A1e — Replay control.** A speaker button beside the question that re-speaks question and
options. Reuses `speak`. Without it, a child who misses the audio has no recovery.

Files: `src/game/useNarration.ts`, `src/i18n/narration.ts`, `src/mathEngine.ts` (meta type +
~10 generators), `src/game/Game.tsx`.

### A2. One item marks a correct answer wrong

`p4l12` in `src/mathEngine.ts` asks `Expand: 6(5 − 2)`, accepts only `30 − 12`, and offers `18`
— the true value — as a distractor, generated by `${a * (b - c)}`. **Check all three variants**;
the same construction appears in the `+` branch as `${a * (b + c)}`.

Fix: drop the evaluated value from the distractor set and replace it with a structural error.
Testing "expand" as distinct from "evaluate" is legitimate, but not while the correct
calculation is on screen as a wrong answer and the explanation never says why.

### A3. Degenerate pictogram item

`p2l18` variant 2 in `src/mathEngine.ts` retries for distinct categories, gives up after 20
attempts, and emits the item anyway — 3.7% of "how many more" draws ask about two visibly
identical bars with answer 0. Replace the retry-and-hope loop with a deterministic guard that
forces distinct values.

### A4. Visible focus state

`src/game/Game.tsx` answer buttons carry `focus:outline-none` with no replacement. Reuse the
existing pattern from `src/senior/pages/FormulaVaultPage.tsx:54`
(`focus:ring-2 focus:ring-teal/50`). This is the primary interaction — keyboard and switch users
currently cannot see their selection.

### A5. HUD touch targets

The mute/music/home strip in `src/game/Game.tsx` renders ~32 px (`p-2 md:p-3` + `w-4 h-4`).
Raise to ≥44 px on mobile. The answer buttons themselves are already generously sized.

### A6. Academy item calls a valid method a mistake

`src/senior/mathEngine.ts`, age 15 · Numbers & Algebra I · level 8 (`log₅ 125 − log₅ 25`). The
`commonMistake` field describes evaluating each log and subtracting as a mistake. It is a
correct method. Rewrite so it teaches the quotient law without labelling valid work as wrong.

### A7. Marketing copy that overstates the range

`src/pages/FeaturesPage.tsx:16` already carries the honest line — *"Ages 6–12 can play
independently; ages 3–5 play best alongside a parent."* Bring the rest into line with it:
README, `src/i18n/en.ts` (`home.tagline`, `home.badge.play`, `home.preschool.sub`), `zu.ts`, and
the phase-1 tip in `src/data/grades.ts`.

### A8. The declaration decision — gated, not assumed

Your own sequence puts *decide the release age band* after *fix the defects*. So: **2.2 does not
submit until the Learner Experience Test (C1) has been walked on a real device.** The audit's
answer is 6+, but confirm it against the repaired build rather than against the audit.

One point to settle at that moment: this is **one app containing both experiences**, so the
declaration must span the kids' game and the Academy together — `6–8`, `9–12`, `13–15`, `16–17`
— unless you intend to split them into separate listings. That is a strategic question, not a
compliance one, and it is worth deciding deliberately rather than by default.

---

## Track B — Web Community Edition (structural)

Validated on the web before any graduation to Play.

### B1. Age-honest labelling, behind a flag

"Pre-School / Lower Primary / Higher Primary / Advanced Primary" render in six places in
`src/game/Game.tsx` — including above every question — plus the difficulty picker, badge
descriptions, both locales and the marketing pages. The Academy already does this correctly:
Explorers, Pioneers, Builders, Systems, Thinkers carry no grade signal.

**Mechanism matters here.** Both editions build from one source, so "web-first" for labelling
should be enforced by the platform seam rather than by discipline. Add an `ageFirstLabels` flag
to `src/platform/flags/index.ts` (the registry already exists, with `PROFILE_FLAGS` per profile)
and gate the new labels behind `isEnabled('ageFirstLabels')`. The Play build then keeps the
shipped names until you deliberately graduate them.

Files: `src/game/phases.ts` (`name`, `ageRange`), `src/game/levelContent.ts` (`BADGES` descs),
`src/data/grades.ts` (`badge`), `src/i18n/en.ts` + `zu.ts` (`label.*` — parity enforced),
`src/pages/*`.

### B2. Resolve the phase 3/4 overlap

Phase 3 is labelled 9–12 and Phase 4 is 11–12 while being substantially harder, so Phase 4's
range sits entirely inside Phase 3's. `AGE_CARDS` in `src/pages/HomePage.tsx` consequently
renders "Age 11" and "Age 12" twice. Present them as a sequence, not as parallel choices.

### B3. Reading load

Measured over 400 draws per level, the always-visible hint strip is the largest source of
on-screen English in the youngest band — 5.9 words against 2.7 for the question. Once A1 lands,
narrate it, or suppress it for the youngest band. This is the flag Play's expert review actually
raised; the earlier fix removed the level-intro tip (seen once per level) but left the hint
(seen every question).

### B4. Local learner profiles

The kids' game uses eight flat, un-namespaced keys — `mathProgress`, `earnedBadges`,
`companionSetup`, `streakData`, `sessionTimer`, `lifetimeCoins`, `consolationCoins`,
`tutorialDone` — while the Academy already namespaces under `mathadv-senior-*`.

**Design:** a `src/lib/profiles.ts` module plus a storage-scoping shim that prefixes those keys
with the active profile id. Identity reuses the existing `companionSetup {name, emoji}` shape,
which `src/game/PassportPanel.tsx` already treats as the learner identity via its `identity()`
helper. On first run, existing flat keys migrate to profile 1 so no child loses progress.

**Do this in the same pass as the `safeSave` migration.** The codebase audit found 18 raw
`localStorage` calls in `Game.tsx` with zero `try` blocks — line 695 writes inside
`handleAnswer`, so a storage exception crashes the game mid-level in private browsing or a
partitioned webview. `safeSave` in `src/lib/safeStorage.ts` already swallows exactly this. Those
are the same call sites the profile scoping has to touch: one edit, one review.

**Constraints, per your instruction:** local only. No accounts, no cloud sync, no teacher
dashboard, no classroom administration, no additional personal data. Names are child-chosen
nicknames. This eliminates shared-device collision and nothing more — what the product becomes
for teachers is a question for the teachers.

Decide during implementation whether `mathadv-senior-*` is scoped in this pass or the next.

### B5. Phase 0 — voice-first preschool (successor work, not this plan)

Design principles to hold to when it starts: emoji-only answers, every element spoken,
tap-to-hear throughout, no written English required to answer anything. Built web-only behind a
flag. The 3+ declaration returns when this exists — not before.

---

## Track C — Trust and validation

### C1. The Learner Experience Test — a release gate

A written, repeatable script in `docs/`, walked on a real device before any external
presentation: **open → understand → choose → learn → make a mistake → be taught → complete →
return → see progress retained.**

Wire it into `scripts/release.mjs`, which already prints a manual checklist after the automated
gates — add the LET alongside the existing "install on a REAL device and smoke-test it" step.
This is the layer the audits exposed as missing: lint, tests, smoke and the contrast pass were
all green while the narration said *"Count the"*.

### C2. Curriculum evidence pack

Extend `docs/APP-CONTENT-AGES-3-TO-17.md` into a per-level CAPS mapping with **honest** age
placements — the audit found content sitting one to two years above its label in every kids'
phase. This is also the artefact that makes the teacher conversation concrete.

### C3. Educator review — the first teacher engagement

My age placements are inferred from content against CAPS phase expectations, **not confirmed by
a practitioner**. An SA Foundation Phase / maths teacher should validate the placements, the
isiZulu draft (still marked DRAFT in `src/i18n/narration.ts`), and a sample of Academy items.

This is the answer to the middleman — not *"here is my app, what do you think"* but *"we are
building a mathematics learning environment for South African children, and we want experienced
teachers to help us determine whether it actually teaches."*

### C4. Teacher Approved preparation

After C1–C3. Google's programme is open to apps for children and to multi-age apps including
children, so the range decided in A8 does not exclude you. Prepare against the published quality
criteria once the repaired build has been validated.

---

## Sequencing

| Step | Work | Gate before proceeding |
|---|---|---|
| 0 | Land the Living World working tree | Clean tree |
| 1 | Track A (A1–A7) | New tests green (below) |
| 2 | C1 — LET walked on a real device | Journey completes without a trust failure |
| 3 | A8 — confirm the age declaration against the repaired build | Founder decision |
| 4 | Ship Play 2.2 | Signed AAB smoke-tested on device |
| 5 | Track B on web, C2 in parallel | Validated on the Community Edition |
| 6 | C3 — educator review | Placements confirmed |
| 7 | Teacher conversation, then C4 | — |

Track B may start in parallel with step 1 as long as it stays behind its flag.

---

## Verification

**Existing gates** — all currently green, keep them that way:
`npm run lint` · `npm test` (376) · `npm run smoke` · `npm run build` for **both** profiles
(`VITE_PROFILE=community` as well as the default).

**New tests — these are the point of the exercise.** The existing suite passed while narration
was broken, so add tests that would have caught it:

1. **Narration output test** (`src/game/useNarration.test.ts`) — assert the *spoken string* for a
   fixed set of Phase 1–2 questions. Must prove: `5 − 2 = ?` speaks "minus"; counting questions
   retain their noun; options are included in the utterance. This locks the defect closed
   permanently.
2. **Distractor invariant** (extend `src/mathEngine.test.ts`) — over many draws, no item's
   distractor set may contain a value mathematically equal to the correct answer. Catches the
   `p4l12` class of bug generally, not just the one instance.
3. **Non-degenerate items** — no "how many more" pictogram item may have `diff === 0`.
4. **Profile isolation** (Track B) — switching profiles does not leak progress between learners;
   migration preserves pre-existing flat-key progress into profile 1.
5. **Reading-load budget** (optional but cheap) — assert on-screen English word count per
   question stays under a threshold for the youngest band, so the hint strip can't silently grow
   back.

**Manual, and non-negotiable before external presentation:** the C1 script on a real Android
device, with sound on, listening to the questions. The narration defect was inaudible to every
automated gate in this repo.
