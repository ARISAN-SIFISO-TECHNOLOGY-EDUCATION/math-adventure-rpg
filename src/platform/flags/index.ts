// Feature-flag registry — the declarative list of Community-Edition capabilities
// and which build profile turns each one on by default. This is data only; the
// resolver that combines it with the runtime shell lives in ../featureFlags.ts.

import type { Profile } from '../profiles';

/** The named Community-Edition capabilities the app can gate on. */
export type FeatureFlag =
  | 'storyTheatre'
  | 'livingWorld'
  | 'animations'
  | 'kingdomMap'
  | 'advancedAudio'
  | 'community';

type FlagSet = Record<FeatureFlag, boolean>;

const ALL_OFF: FlagSet = {
  storyTheatre: false,
  livingWorld: false,
  animations: false,
  kingdomMap: false,
  advancedAudio: false,
  community: false,
};

const ALL_ON: FlagSet = {
  storyTheatre: true,
  livingWorld: true,
  animations: true,
  kingdomMap: true,
  advancedAudio: true,
  community: true,
};

/**
 * Which flags each profile enables by default.
 * - `play-store` (Stable/LTS): core only — every experiment OFF.
 * - `community` / `development`: the full innovation lab.
 * - `demo`: a curated public showcase (no live community features).
 */
export const PROFILE_FLAGS: Record<Profile, FlagSet> = {
  'play-store': ALL_OFF,
  community: ALL_ON,
  development: ALL_ON,
  demo: { ...ALL_ON, kingdomMap: false, community: false },
};
