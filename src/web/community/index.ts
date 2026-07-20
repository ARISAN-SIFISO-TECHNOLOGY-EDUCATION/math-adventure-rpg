// Community Edition · Community features (Phase B scaffold — web-only).
// Inert until its feature flag is enabled. Real content lands later.

import { isEnabled } from '../../platform/featureFlags';

export const COMMUNITY_ENABLED: boolean = isEnabled('community');
