// Platform-adapter seam. Platform-specific services (storage, share, haptics,
// audio backend, …) will each implement PlatformAdapter, one per shell, adopted
// INCREMENTALLY in Phase C. For now this only documents the boundary and exposes
// the active shell's identity — the app keeps its existing direct calls until a
// subsystem is deliberately migrated behind this seam ("no file moves without a
// reason").

import { PLATFORM } from '../platform';

export interface PlatformAdapter {
  readonly name: 'web' | 'mobile' | 'desktop';
}

export const platformAdapter: PlatformAdapter = {
  name: PLATFORM.isMobile ? 'mobile' : PLATFORM.isDesktop ? 'desktop' : 'web',
};
