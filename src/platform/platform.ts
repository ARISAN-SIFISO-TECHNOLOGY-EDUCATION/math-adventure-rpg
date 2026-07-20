// PLATFORM — the single source of truth for which shell we are running in.
// Adopt this instead of calling Capacitor.isNativePlatform() directly around the
// codebase, so platform branching lives in one place and reads clearly.

import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export interface Platform {
  /** Web / PWA — the Community Edition shell (Cloudflare Pages). */
  readonly isWeb: boolean;
  /** Native app — the Google Play Stable/LTS shell (Capacitor Android). */
  readonly isMobile: boolean;
  /** Reserved for a future desktop / Chromebook / classroom shell. */
  readonly isDesktop: boolean;
}

export const PLATFORM: Platform = {
  isWeb: !isNative,
  isMobile: isNative,
  isDesktop: false,
};
