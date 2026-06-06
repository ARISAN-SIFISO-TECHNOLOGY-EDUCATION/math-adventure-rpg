import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
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
