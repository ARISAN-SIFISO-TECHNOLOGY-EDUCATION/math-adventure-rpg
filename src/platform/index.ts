// Platform seam — public surface. Import platform concerns from here:
//   import { PLATFORM, PROFILE, isEnabled } from '@/src/platform' (or relative)
//
// See ../../CLAUDE.md and peoples-home/brain/architecture/05-platform-editions-and-profiles.md
// for the reusable multi-shell model this implements.

export { PROFILE, type Profile } from './profiles';
export { PLATFORM, type Platform } from './platform';
export { isEnabled, featureFlags, type FeatureFlag } from './featureFlags';
export { platformAdapter, type PlatformAdapter } from './adapters';
