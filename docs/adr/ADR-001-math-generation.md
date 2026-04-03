# ADR-001: Math Problem Generation Strategy

## Status
**Accepted** – April 3, 2026

## Context
The Math Adventure RPG requires a steady stream of age‑appropriate math problems during turn‑based battles. Problems must scale with player level and phase (Pre‑School through Higher Primary). The game targets mobile devices (iOS/Android) with the following constraints:

- **Offline play** is a core requirement (kids may not have continuous internet).
- **Turn‑based battles** require near‑instant problem generation (<100ms).
- **Costs** must be predictable and low (no per‑problem fees).
- **Content must be deterministic** and verifiable (no off‑curriculum or malformed problems).

One proposed approach was to call an LLM API (e.g., Claude) at runtime to generate each problem. Another was to use purely procedural JavaScript logic.

## Decision
**Math problems will be generated procedurally using deterministic JavaScript functions. No runtime LLM API calls will be made for core gameplay.**

The procedural engine will:
- Accept `phase` (1–4) and `level` (1–20) as inputs.
- Output a problem object: `{ question: string, answer: number, distractors: number[] }`.
- Use only built‑in JavaScript math and randomisation (seeded for consistency if needed).
- Be bundled entirely inside the mobile app.

## Consequences

### Positive
- **Zero latency** – problems generated instantly on device.
- **Zero runtime cost** – no API fees, no network dependency.
- **Offline‑first** – game works anywhere, anytime.
- **Predictable difficulty** – exact control over problem types per phase/level.
- **Simpler security** – no API keys to manage or leak.

### Negative
- **Less variety** – cannot generate open‑ended word problems without additional logic.
- **Manual expansion** – adding new problem types (e.g., fractions, decimals) requires coding new branches.

### Mitigations
- For **word problems** or **story‑rich content**, an optional pre‑generation script can use an LLM offline to create a static JSON bank (built at compile time, not runtime).
- The procedural engine can be extended with new rules as the curriculum grows.

## Alternatives Considered

| Alternative | Why Rejected |
|-------------|---------------|
| **Runtime LLM API calls** | High latency (1‑3s per problem), unpredictable costs, no offline play, potential for malformed or off‑curriculum output. |
| **Pre‑generated static bank (LLM‑created)** | Acceptable for word problems, but for basic arithmetic, procedural is simpler, faster, and fully deterministic. Will be used only for optional narrative content. |
| **Third‑party math API** | Similar issues as LLM (latency, cost, offline failure) plus vendor lock‑in. |

## Related Decisions
- ADR-002: Audio Management
- ADR-003: State Persistence

## Reviewers
- Engineering team
- Product owner / parent representative