// Community Edition · Story Theatre (Phase B scaffold — web-only).
// No gameplay logic yet: this module exists so the feature has a home and a flag.
// It is inert unless its feature flag is enabled. Real content lands later.

import { isEnabled } from '../../platform/featureFlags';

export const STORY_THEATRE_ENABLED: boolean = isEnabled('storyTheatre');
