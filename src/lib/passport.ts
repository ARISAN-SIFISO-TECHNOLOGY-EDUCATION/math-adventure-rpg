/**
 * Math Adventure's Passport adapter — maps MA's progress model onto the shared
 * @tph/core envelope. MA has no Household profiles and stores progress as earned
 * BADGE ids, so its "native" achievements are the child's badges (mapped to
 * universal stamps by the caller) and its private restore-state is `earnedBadges`.
 * The universal logic lives in the vendored core; this is just the MA-specific glue.
 */
import {
  buildEnvelope,
  parseEnvelope,
  ownState,
  mergeForeignStamps,
  unionStrings,
  passportFileName as coreFileName,
  type ImportedStamp,
  type PassportStamp,
  type PassportEnvelope,
} from '../tph-core/passport.ts';

export const APP_ID = 'math-adventure';
export const APP_NAME = 'Math Adventure';

export type { ImportedStamp, PassportStamp, PassportEnvelope };

export interface BuildInput {
  name: string;
  emoji: string;
  nativeStamps: PassportStamp[]; // the child's earned badges, resolved to stamps
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

/** Build the downloadable Passport for this learner (their badges + already-imported milestones). */
export function buildPassport(input: BuildInput): PassportEnvelope {
  return buildEnvelope({
    appId: APP_ID,
    appName: APP_NAME,
    learner: { name: input.name, emoji: input.emoji },
    nativeStamps: input.nativeStamps,
    imported: input.imported,
    privateState: { earnedBadges: input.earnedBadges },
  });
}

export const parsePassport = parseEnvelope;
export const passportFileName = (name: string) => coreFileName(name);

/** Merge an imported Passport into the current badges + foreign stamps (union, no dupes). */
export function mergeImport(
  current: { earnedBadges: string[]; imported: ImportedStamp[] },
  env: PassportEnvelope,
): ImportResult {
  const ours = ownState<{ earnedBadges?: string[] }>(env, APP_ID);
  const beforeNative = current.earnedBadges.length;
  const earnedBadges = unionStrings(current.earnedBadges, ours?.earnedBadges ?? []);

  const { imported, added: foreignAdded } = mergeForeignStamps(current.imported, env, APP_NAME);

  return {
    earnedBadges,
    imported,
    learnerName: env.learner.name,
    nativeAdded: earnedBadges.length - beforeNative,
    foreignAdded,
  };
}
