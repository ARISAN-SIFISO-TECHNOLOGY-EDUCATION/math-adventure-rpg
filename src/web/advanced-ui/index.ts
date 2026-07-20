// Community Edition · Advanced UI (large-screen, keyboard & mouse) — Phase B
// scaffold, web-only. Inert until its feature flag is enabled. Real content later.
// Uses the `animations` flag for now; splits into its own flag when it grows.

import { isEnabled } from '../../platform/featureFlags';

export const ADVANCED_UI_ENABLED: boolean = isEnabled('animations');
