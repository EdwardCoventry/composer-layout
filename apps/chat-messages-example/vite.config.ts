import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const composerSrc = path.resolve(__dirname, '../../packages/composer-layout/src');
const commonComponents = path.resolve(__dirname, '../common/components');
const uiSrc = path.resolve(__dirname, '../../packages/ui/src');

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3003,
    strictPort: true,
    fs: {
      allow: [composerSrc, commonComponents, uiSrc],
    },
  },
  resolve: {
    alias: {
      'composer-layout': composerSrc,
      '@common': commonComponents,
      'ui': uiSrc,
    },
  },
});
