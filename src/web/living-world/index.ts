// Community Edition · Living World (Phase B scaffold — web-only).
// Inert until its feature flag is enabled. Real content lands later.
// NOTE: this is Math Adventure RPG's OWN experience layer — it is NOT
// early-numeracy's "Number Kingdom" (a different app).

import { isEnabled } from '../../platform/featureFlags';

export const LIVING_WORLD_ENABLED: boolean = isEnabled('livingWorld');
