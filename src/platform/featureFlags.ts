// Feature-flag resolver. Combines the per-profile registry (./flags) with the
// runtime shell (./platform). Consumers gate Community-Edition code with
// `isEnabled('storyTheatre')` instead of raw platform checks.

import { PROFILE } from './profiles';
import { PLATFORM } from './platform';
import { PROFILE_FLAGS, type FeatureFlag } from './flags';

export type { FeatureFlag };

/**
 * Whether a Community-Edition feature is enabled in this build.
 *
 * Gated by BOTH the build profile AND the runtime shell: an experimental feature
 * can never light up inside the native (Google Play / LTS) shell, even if a
 * flag-enabled bundle were somehow loaded there. This upholds the Stable Build
 * Principle — the Play edition's experience never changes behind our backs.
 */
export function isEnabled(flag: FeatureFlag): boolean {
  return PROFILE_FLAGS[PROFILE][flag] && PLATFORM.isWeb;
}

/** Resolved snapshot of every flag for this build (handy for a demo/debug panel). */
export const featureFlags: Record<FeatureFlag, boolean> = {
  storyTheatre: isEnabled('storyTheatre'),
  livingWorld: isEnabled('livingWorld'),
  animations: isEnabled('animations'),
  kingdomMap: isEnabled('kingdomMap'),
  advancedAudio: isEnabled('advancedAudio'),
  community: isEnabled('community'),
};
