import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Build profile — the single knob that selects an edition (see CLAUDE.md § Profiles
// & Editions). `play-store` is the frozen Stable/LTS Android build; `community` is
// the web Community Edition. Backward-compatible: WEB_BUILD=1 still means "web" and
// maps to `community`, so existing Cloudflare Pages build config keeps working.
type Profile = 'play-store' | 'community' | 'development' | 'demo';
const KNOWN: Profile[] = ['play-store', 'community', 'development', 'demo'];
const raw = process.env.VITE_PROFILE as Profile | undefined;
const PROFILE: Profile = raw && KNOWN.includes(raw)
  ? raw
  : (process.env.WEB_BUILD ? 'community' : 'play-store');
const isWebProfile = PROFILE !== 'play-store';

export default defineConfig({
  // Capacitor (Android / `play-store`) needs relative asset paths → './'. The web
  // profiles (Cloudflare Pages) need an absolute base so multi-segment routes like
  // /senior/topics/15 resolve their assets correctly → '/'. The shipped Android
  // build uses `play-store` (default), so it is completely unaffected.
  base: isWebProfile ? '/' : './',
  // Bake the resolved profile into the bundle so runtime code (src/platform) sees
  // the same value the build was compiled for — including the WEB_BUILD fallback.
  define: {
    'import.meta.env.VITE_PROFILE': JSON.stringify(PROFILE),
  },
  plugins: [
    react(),
    tailwindcss(),
    // Web-only PWA layer: installable + 100% offline app shell. The service
    // worker is NOT auto-registered here (`injectRegister: false`); main.tsx
    // registers it only when NOT running inside Capacitor, so the live
    // Android/Play build is left byte-for-byte untouched.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["hero.jpg"],
      manifest: {
        name: "Math Adventure RPG",
        short_name: "Math Adventure",
        description:
          "A playful maths RPG for kids (3–12) and an exam-prep Academy for teens (13–17). 100% offline, no ads, no accounts. Free forever.",
        theme_color: "#4338CA",
        background_color: "#4338CA",
        display: "standalone",
        orientation: "portrait",
        // base is './' (relative) so keep start_url/scope relative too — works
        // whether the site is served from a domain root or a sub-path.
        start_url: ".",
        scope: ".",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the whole app shell so it loads with no network.
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff,woff2}"],
        // SPA (React Router): serve index.html for unknown routes offline.
        navigateFallback: "index.html",
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            // Google Fonts stylesheet — refresh in background, serve from cache.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            // Google Fonts files — cache-first so type renders offline once seen.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Split heavy third-party libs into their own cacheable chunks instead
        // of one monolithic bundle, so an app-code change doesn't bust the
        // vendor cache and the initial download parallelises.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-router')) return 'router';
          if (id.includes('/motion/') || id.includes('framer-motion')) return 'motion';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('canvas-confetti')) return 'confetti';
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'react';
          return 'vendor';
        },
      },
    },
  },
});
