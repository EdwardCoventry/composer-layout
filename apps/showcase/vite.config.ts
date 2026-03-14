import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';
import * as fs from 'fs';

const uiSrc = path.resolve(__dirname, '../../packages/ui/src');
const normalizeFsPath = (fsPath: string) => fsPath.split(path.sep).join(path.posix.sep);
const rewriteRootImports = (html: string, appDir: string, appBase: string) => {
  const normalizedRoot = normalizeFsPath(appDir);
  const srcPrefix = `/@fs/${normalizedRoot}/src/`;
  const publicPrefix = `/@fs/${normalizedRoot}/public/`;
  const baseEsc = appBase.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  return html
    .replace(new RegExp(`(src|href)=(["'])${baseEsc}src/`, 'g'), (_match, attr, quote) => `${attr}=${quote}${srcPrefix}`)
    .replace(new RegExp(`(src|href)=(["'])/src/`, 'g'), (_match, attr, quote) => `${attr}=${quote}${srcPrefix}`)
    .replace(new RegExp(`(src|href)=(["'])${baseEsc}public/`, 'g'), (_match, attr, quote) => `${attr}=${quote}${publicPrefix}`)
    .replace(new RegExp(`(src|href)=(["'])/public/`, 'g'), (_match, attr, quote) => `${attr}=${quote}${publicPrefix}`);
};

const appAliases: Record<string, string> = {
  'chat-messages-example': 'chat-messages-example',
  'chat-messages': 'chat-messages-example',
  'quiz-app-example': 'quiz-app-example',
  'quiz': 'quiz-app-example',
  'ai-assistant-example': 'ai-assistant-example',
  'ai-assistant': 'ai-assistant-example',
};

const proxiedAppPattern = new RegExp(`^/(${Object.keys(appAliases).join('|')})(/.*)?$`);

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'serve-examples',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const [urlPath, _query] = url.split('?');

          const match = proxiedAppPattern.exec(urlPath);
          if (match) {
            const appKey = match[1];
            const appName = appAliases[appKey] || appKey;

             // Map the URL to the file system path
             // url is like /quiz-app-example/foo.js
             // We want to map to ../quiz-app-example/foo.js relative to this config file

            // Handle directory index
            let targetPath = urlPath;
            if (targetPath.endsWith('/')) {
              targetPath += 'index.html';
            } else if (!path.extname(targetPath)) {
               // Naive check for no extension -> directory -> index.html
               if (targetPath === `/${appKey}`) {
                 targetPath += '/index.html';
               }
            }

            // Check if it's an index.html request to inject the preamble
            if (targetPath.endsWith('index.html')) {
                const appDir = path.resolve(__dirname, `../${appName}`);
                const indexPath = path.join(appDir, 'index.html');
                
                try {
                  let html = fs.readFileSync(indexPath, 'utf-8');
                  html = rewriteRootImports(html, appDir, `/${appKey}/`);
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'text/html');
                  server.transformIndexHtml(req.url, html)
                    .then((transformedHtml) => res.end(transformedHtml))
                    .catch((err) => {
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

            const rest = targetPath.split('/').slice(2).join('/');
            
            const absPath = path.resolve(__dirname, `../${appName}/${rest}`);
            const normalized = normalizeFsPath(absPath);
            req.url = `/@fs/${normalized}${_query ? `?${_query}` : ''}`;
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
        uiSrc,
      ]
    }
  },
  resolve: {
    alias: {
      'composer-layout': path.resolve(__dirname, '../../packages/composer-layout/src'),
      '@common': path.resolve(__dirname, '../common/components'),
      'ui': uiSrc,
    },
  },
});
