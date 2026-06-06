// Safe localStorage access with schema validation + versioned migration.
//
// Why this exists: the app persists progress entirely in localStorage with no
// backend. A corrupt value, a quota error, or a shape change across an app
// update could otherwise throw on read and brick a returning user (no recovery,
// offline, on a child's device). Every persisted read should go through here so
// a bad value degrades to a safe fallback instead of crashing.

/**
 * Read + JSON.parse a key, validate its shape, and fall back safely.
 * - Missing key, invalid JSON, failed validation, or storage errors → `fallback`.
 * - `validate` should narrow unknown → T (return false to reject the value).
 */
export function safeLoad<T>(
  key: string,
  validate: (value: unknown) => value is T,
  fallback: T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/** Write a value as JSON. Swallows quota / serialization errors. */
export function safeSave(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

/**
 * Parse an arbitrary raw string defensively (for legacy inline reads that used
 * `JSON.parse(localStorage.getItem(k) || 'null')`). Returns `fallback` on any error.
 */
export function safeParse<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Convenience: read + defensively parse a key in one call. */
export function safeGet<T>(key: string, fallback: T): T {
  try {
    return safeParse(localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}
