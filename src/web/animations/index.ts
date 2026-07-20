// Community Edition · Advanced Animations (Phase B scaffold — web-only).
// Inert until its feature flag is enabled. Real content lands later.

import { isEnabled } from '../../platform/featureFlags';

export const ANIMATIONS_ENABLED: boolean = isEnabled('animations');
