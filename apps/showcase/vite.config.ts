import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/quiz-app-example': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/ai-assistant-example': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      'composer-layout': path.resolve(__dirname, '../../packages/composer-layout/src'),
    },
  },
});
