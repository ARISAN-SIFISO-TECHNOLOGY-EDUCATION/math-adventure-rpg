/**
 * The People's Home Passport — a portable, offline backup of a learner's
 * achievements that can travel BETWEEN apps as a downloaded file. Same envelope
 * as Our World's and Everyday Foundations' passport modules, so all three apps
 * read each other's files.
 *
 * Math Adventure has no Household profiles and stores progress as earned BADGE
 * ids — so here the "native" achievements are the child's badges, mapped to the
 * universal stamp shape every People's Home app understands.
 *
 *   • stamps[]  — UNIVERSAL milestones any app can show (the passport's public face).
 *   • apps{}    — per-app private state, so re-importing into the SAME app restores
 *                 it faithfully (here: Math Adventure's `earnedBadges` ids).
 *
 * Pure data only (no DOM, no network) — the file IO lives in lib/download.ts.
 */
export const PASSPORT_KIND = 'peoples-home-passport';
export const PASSPORT_VERSION = 1;
export const APP_ID = 'math-adventure';
export const APP_NAME = 'Math Adventure';

export interface ImportedStamp {
  label: string; // a milestone from ANOTHER app, e.g. "I Found My First Province"
  app: string; // the friendly app it came from, e.g. "Our World"
  icon?: string;
}

export interface PassportStamp {
  label: string;
  app: string; // the friendly app name the milestone was earned in
  icon?: string;
}

export interface PassportEnvelope {
  kind: typeof PASSPORT_KIND;
  passportVersion: number;
  exportedAt: string;
  exportedFrom: string; // APP_NAME
  learner: { name: string; emoji: string };
  stamps: PassportStamp[]; // universal — grows as the passport travels app to app
  apps: { [appId: string]: Record<string, unknown> }; // private state for faithful re-import
}

export interface BuildInput {
  name: string;
  emoji: string;
  nativeStamps: PassportStamp[]; // this app's badges, already resolved to stamps
  earnedBadges: string[]; // the private restore-state (badge ids)
  imported: ImportedStamp[];
}

export interface ImportResult {
  earnedBadges: string[]; // Math Adventure badge ids after merge (union)
  imported: ImportedStamp[];
  learnerName: string;
  nativeAdded: number; // badges restored
  foreignAdded: number; // milestones from other apps newly carried in
}

const STAR = '⭐';

/** Build the downloadable Passport for this learner (their badges + already-imported milestones). */
export function buildPassport(input: BuildInput): PassportEnvelope {
  const universal: PassportStamp[] = [
    ...input.nativeStamps,
    ...input.imported.map((s) => ({ label: s.label, app: s.app, icon: s.icon ?? STAR })),
  ];
  return {
    kind: PASSPORT_KIND,
    passportVersion: PASSPORT_VERSION,
    exportedAt: new Date().toISOString(),
    exportedFrom: APP_NAME,
    learner: { name: input.name, emoji: input.emoji },
    stamps: universal,
    apps: { [APP_ID]: { earnedBadges: input.earnedBadges } },
  };
}

/** Parse + validate a Passport file, with friendly errors (never trust the blob). */
export function parsePassport(jsonString: string): PassportEnvelope {
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

/** Merge an imported Passport into the current badges + foreign stamps (union, no dupes). */
export function mergeImport(
  current: { earnedBadges: string[]; imported: ImportedStamp[] },
  env: PassportEnvelope,
): ImportResult {
  const union = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));

  // Restore our own badges if this passport carried them.
  const ours = env.apps?.[APP_ID] as { earnedBadges?: string[] } | undefined;
  const beforeNative = current.earnedBadges.length;
  const earnedBadges = union(current.earnedBadges, ours?.earnedBadges ?? []);

  // Carry in milestones earned in OTHER apps (deduped by label).
  const importedMap = new Map<string, ImportedStamp>();
  for (const s of current.imported) importedMap.set(s.label, s);
  const beforeForeign = importedMap.size;
  for (const s of env.stamps) {
    if (s.app === APP_NAME) continue; // our own badges — handled above
    importedMap.set(s.label, { label: s.label, app: s.app, icon: s.icon });
  }
  const imported = Array.from(importedMap.values());

  return {
    earnedBadges,
    imported,
    learnerName: env.learner.name,
    nativeAdded: earnedBadges.length - beforeNative,
    foreignAdded: imported.length - beforeForeign,
  };
}

/** A safe file name for the downloaded passport. */
export function passportFileName(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'explorer';
  return `peoples-home-passport-${slug}.json`;
}
