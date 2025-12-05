import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import * as fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-examples',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const [urlPath, _query] = url.split('?');

          if (urlPath.startsWith('/quiz-app-example') || urlPath.startsWith('/ai-assistant-example')) {
            // Map the URL to the file system path
            // url is like /quiz-app-example/foo.js
            // We want to map to ../quiz-app-example/foo.js relative to this config file
            
            // Handle directory index
            let targetPath = urlPath;
            if (targetPath.endsWith('/')) {
              targetPath += 'index.html';
            } else if (!path.extname(targetPath)) {
               // Naive check for no extension -> directory -> index.html
               if (targetPath === '/quiz-app-example' || targetPath === '/ai-assistant-example') {
                 targetPath += '/index.html';
               }
            }

            // Check if it's an index.html request to inject the preamble
            if (targetPath.endsWith('index.html')) {
                const appName = targetPath.split('/')[1]; // quiz-app-example
                const appDir = path.resolve(__dirname, `../${appName}`);
                const indexPath = path.join(appDir, 'index.html');
                
                try {
                  let html = fs.readFileSync(indexPath, 'utf-8');
                  
                  // Rewrite src="/src/..." to src="/quiz-app-example/src/..."
                  // This is crucial because the browser sees the page at /quiz-app-example/
                  // so a root-relative path /src/main.tsx would go to /src/main.tsx (showcase's src),
                  // OR if base is set in the other html, it might be fine?
                  // The other apps have base: '/quiz-app-example/' in their vite.config.ts but that is for build/dev mode of THAT app.
                  // Here we are serving their static HTML manually.
                  
                  // We need to manually adjust the script tags in the HTML to point to the correct location
                  // so that the middleware intercepts them again.
                  html = html.replace(/src="\/src\//g, `src="/${appName}/src/`);
                  
                  // Also handle non-root relative paths if any?
                  // And we need to inject the Vite React Preamble if it's missing, 
                  // but typically the Vite server transformIndexHtml does that.
                  // Since we are bypassing the standard serving logic by rewriting req.url to @fs,
                  // we might need to let Vite transform it.
                  
                  // Instead of redirecting to @fs, let's serve the modified HTML directly.
                  // AND explicitly call transformIndexHtml.
                  
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'text/html');
                  
                  // We need to apply vite transforms
                  server.transformIndexHtml(req.url, html).then(transformedHtml => {
                    res.end(transformedHtml);
                  }).catch(err => {
                    console.error('Transform error', err);
                    next(err);
                  });
                  
                  return;
                  
                } catch (e) {
                  console.error('Error serving index.html', e);
                  next();
                  return;
                }
            }

            const appName = targetPath.split('/')[1]; // quiz-app-example
            const rest = targetPath.split('/').slice(2).join('/');
            
            const absPath = path.resolve(__dirname, `../${appName}/${rest}`);
            req.url = `/@fs/${absPath}`;
          }
          next();
        });
      }
    }
  ],
  server: {
    host: true,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    strictPort: false,
    fs: {
      // Allow serving files from sibling example apps and shared components
      allow: [
        path.resolve(__dirname, '..'), // ../*
        path.resolve(__dirname, '../..'), // repo root
      ]
    }
  },
  resolve: {
    alias: {
      'composer-layout': path.resolve(__dirname, '../../packages/composer-layout/src'),
      '@common': path.resolve(__dirname, '../common/components'),
    },
  },
});
