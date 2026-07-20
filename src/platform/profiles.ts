// Build profiles — the single knob that selects an edition (see the repo CLAUDE.md
// and peoples-home/brain/apps/math-adventure-release-policy.md). Supersedes the bare
// WEB_BUILD flag (which stays supported for backward-compatibility, mapped to
// `community` in vite.config.ts). The active profile is resolved at BUILD time and
// baked into the bundle via `define` in vite.config.ts.

export type Profile = 'play-store' | 'community' | 'development' | 'demo';

function normalize(v: string | undefined): Profile {
  switch (v) {
    case 'community':
    case 'development':
    case 'demo':
    case 'play-store':
      return v;
    default:
      // Absent / unknown → the frozen Stable/LTS edition. Safe default: the
      // Google Play build must never accidentally opt into web experiments.
      return 'play-store';
  }
}

/** The build profile this bundle was compiled for. */
export const PROFILE: Profile = normalize(import.meta.env.VITE_PROFILE);
