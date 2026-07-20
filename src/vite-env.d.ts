/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Build profile baked in by vite.config.ts. See src/platform/profiles.ts. */
  readonly VITE_PROFILE?: string;
}
