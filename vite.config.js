import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    modules: {
      // Readable class names in dev, short hashes in production.
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  server: {
    port: 5173,
  },
  ssgOptions: {
    // Pages are rendered to static HTML at build time so that crawlers get
    // full markup. Interactive parts hydrate on the client as usual.
    script: 'async',
    formatting: 'minify',
  },
});
