
---

## ADR-003: State Persistence

**File:** `docs/adr/ADR-003-state-persistence.md`

```markdown
# ADR-003: State Persistence

## Status
**Accepted** – April 3, 2026

## Context
The Math Adventure RPG needs to save player progress locally:
- Current level, phase, and XP.
- Character stats (HP, attack power).
- Story flags (quests completed).
- User preferences (mute toggle).

Requirements:
- **Fast read/write** – save after every battle (frequent).
- **No backend** – all data stays on device (privacy, offline).
- **Secure** – no plaintext PII; encryption optional but not required for non‑sensitive data.
- **Reliable** – writes must complete before app closes.

## Decision
**Use `react-native-mmkv` for all local persistence.**

MMKV is a high‑performance, key‑value storage library (used by WeChat). It will replace AsyncStorage for all critical game state.

## Consequences

### Positive
- **Blazing fast** – synchronous reads/writes (~microseconds).
- **Small footprint** – built in C++, minimal JS bridge overhead.
- **Works with Expo** – via `expo-build-properties` or config plugin.
- **Encryption support** – optional for future parent‑controlled settings.

### Negative
- **Additional native dependency** – requires custom Expo config (but well documented).
- **No querying** – key‑value only; complex queries must be done in JS.

### Mitigations
- For complex queries (e.g., “find all unlocked levels”), store an index in a separate MMKV key.
- Use a single MMKV instance with namespaced keys: `@player/level`, `@player/xp`, `@settings/mute`.

## Implementation Plan

```typescript
// services/storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'math-adventure-storage',
  encryptionKey: undefined, // Set optional key for production
});

// Wrappers for type safety
export const savePlayer = (player: PlayerState) => {
  storage.set('player', JSON.stringify(player));
};

export const loadPlayer = (): PlayerState | null => {
  const raw = storage.getString('player');
  return raw ? JSON.parse(raw) : null;
};

// Zustand middleware to auto‑save on state change
import { persist } from 'zustand/middleware';
import { storage } from './storage';

const usePlayerStore = create(
  persist(
    (set) => ({ /* ... */ }),
    {
      name: 'player',
      storage: {
        getItem: (key) => storage.getString(key),
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      },
    }
  )
);