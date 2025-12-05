import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const composerSrc = path.resolve(__dirname, '../../packages/composer-layout/src');
const commonComponents = path.resolve(__dirname, '../common/components');

export default defineConfig({
  base: '/quiz-app-example/',
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true,
    fs: {
      allow: [composerSrc, commonComponents],
    },
  },
  resolve: {
    alias: {
      // Point the example app at the source of composer-layout for live edits
      'composer-layout': composerSrc,
      '@common': commonComponents,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  }
});
