import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const composerSrc = path.resolve(__dirname, '../../packages/composer-layout/src');
const commonComponents = path.resolve(__dirname, '../common/components');
const uiSrc = path.resolve(__dirname, '../../packages/ui/src');

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    fs: {
      allow: [composerSrc, commonComponents, uiSrc],
    },
  },
  resolve: {
    alias: {
      // Point the example app at the source of composer-layout for live edits
      'composer-layout': composerSrc,
      '@common': commonComponents,
      'ui': uiSrc,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
});
