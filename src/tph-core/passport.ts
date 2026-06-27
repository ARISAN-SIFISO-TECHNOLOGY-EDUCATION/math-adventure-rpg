// VENDORED from @tph/core (ARISAN-SIFISO-TECHNOLOGY-EDUCATION/tph-core) — do not edit here.
// Update upstream, then re-vendor. Source-only until @tph/core is published to a registry.
/**
 * @tph/core — People's Home Passport (the envelope core).
 *
 * The canonical, app-agnostic implementation of the cross-app Passport: a portable
 * JSON file that carries a learner's achievements BETWEEN People's Home apps. It's
 * the only shared-state mechanism that survives the ecosystem's reality — separate
 * Cloudflare origins, fully offline, no server. The transport is a file the user
 * holds; nothing is sent anywhere.
 *
 * Two layers in every Passport:
 *   • stamps[]  — UNIVERSAL milestones any app can read/show (the public face). They
 *                 accumulate as the passport travels app to app.
 *   • apps{}    — per-app PRIVATE state, so re-importing into the SAME app restores
 *                 it faithfully (e.g. completed ids / earned badges).
 *
 * Each app keeps a tiny adapter that maps its own progress model onto these
 * primitives — the universal logic (envelope shape, foreign-stamp merge, dedupe)
 * lives here, once. Pure data only (no DOM, no network) so it runs anywhere,
 * including a Node smoke. The file IO is in ./io.
 */
export const PASSPORT_KIND = 'peoples-home-passport';
export const PASSPORT_VERSION = 1;

const STAR = '⭐';

/** A milestone shown on a passport — earned in some app, readable by all. */
export interface PassportStamp {
  label: string; // first-person where possible, e.g. "I Found My First Province"
  app: string; // the friendly app it was earned in, e.g. "Our World"
  icon?: string;
}

/** A stamp carried INTO an app from another app (an app's own stamps stay native). */
export interface ImportedStamp {
  label: string;
  app: string;
  icon?: string;
}

export interface Learner {
  name: string;
  emoji: string;
}

export interface PassportEnvelope {
  kind: typeof PASSPORT_KIND;
  passportVersion: number;
  exportedAt: string;
  exportedFrom: string; // the app's friendly name
  learner: Learner;
  stamps: PassportStamp[];
  apps: { [appId: string]: Record<string, unknown> };
}

export interface BuildEnvelopeInput {
  appId: string; // stable id, e.g. "our-world"
  appName: string; // friendly name, e.g. "Our World"
  learner: Learner;
  nativeStamps: PassportStamp[]; // this app's own achievements, as universal stamps
  imported: ImportedStamp[]; // stamps already carried in from other apps
  privateState: Record<string, unknown>; // for faithful re-import into THIS app
}

/** Pack a learner's stamps (native + already-imported) into a portable envelope. */
export function buildEnvelope(input: BuildEnvelopeInput): PassportEnvelope {
  return {
    kind: PASSPORT_KIND,
    passportVersion: PASSPORT_VERSION,
    exportedAt: new Date().toISOString(),
    exportedFrom: input.appName,
    learner: input.learner,
    stamps: [
      ...input.nativeStamps,
      ...input.imported.map((s) => ({ label: s.label, app: s.app, icon: s.icon ?? STAR })),
    ],
    apps: { [input.appId]: input.privateState },
  };
}

/** Parse + validate a Passport file, with friendly errors (never trust the blob). */
export function parseEnvelope(jsonString: string): PassportEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error("That doesn't look like a Passport file — it couldn't be read.");
  }
  const p = parsed as Partial<PassportEnvelope>;
  if (!p || p.kind !== PASSPORT_KIND) {
    throw new Error("This file is not a People's Home Passport.");
  }
  if (!p.learner || !Array.isArray(p.stamps)) {
    throw new Error('This Passport is missing its learner or milestones.');
  }
  return p as PassportEnvelope;
}

/** The private restore-block this app stored in the envelope, if any. */
export function ownState<T = Record<string, unknown>>(env: PassportEnvelope, appId: string): T | undefined {
  return env.apps?.[appId] as T | undefined;
}

/**
 * Merge the envelope's FOREIGN stamps (those not from this app, and not already a
 * native achievement) into the current imported[], deduped by label. Returns the
 * new list + how many were newly carried in.
 */
export function mergeForeignStamps(
  current: ImportedStamp[],
  env: PassportEnvelope,
  selfAppName: string,
  isNative: (label: string) => boolean = () => false,
): { imported: ImportedStamp[]; added: number } {
  const map = new Map<string, ImportedStamp>();
  for (const s of current) map.set(s.label, s);
  const before = map.size;
  for (const s of env.stamps) {
    if (s.app === selfAppName) continue; // our own — handled via ownState by the adapter
    if (isNative(s.label)) continue; // don't shadow a native achievement
    map.set(s.label, { label: s.label, app: s.app, icon: s.icon });
  }
  const imported = Array.from(map.values());
  return { imported, added: imported.length - before };
}

/** Set-union of two string lists (order-stable on first appearance). */
export function unionStrings(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}

/** A safe, friendly file name for a downloaded passport. */
export function passportFileName(name: string, fallback = 'explorer'): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || fallback;
  return `peoples-home-passport-${slug}.json`;
}
