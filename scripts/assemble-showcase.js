import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Derive __filename and __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const showcaseDist = path.join(rootDir, 'apps/showcase/dist');

// Ensure showcase dist exists
if (!fs.existsSync(showcaseDist)) {
  console.error('Showcase dist not found. Run build first.');
  process.exit(1);
}

const apps = [
  { name: 'chat-messages-example', src: 'apps/chat-messages-example/dist', dest: 'apps/showcase/dist/chat-messages-example' },
  { name: 'quiz-app-example', src: 'apps/quiz-app-example/dist', dest: 'apps/showcase/dist/quiz-app-example' },
  { name: 'ai-assistant-example', src: 'apps/ai-assistant-example/dist', dest: 'apps/showcase/dist/ai-assistant-example' }
];

apps.forEach(app => {
  const srcPath = path.join(rootDir, app.src);
  const destPath = path.join(rootDir, app.dest);

  console.log(`Copying ${app.name} to showcase...`);
  
  if (fs.existsSync(srcPath)) {
    // Ensure destination parent directory exists
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    // Copy
    fs.cpSync(srcPath, destPath, { recursive: true });
  } else {
    console.warn(`Warning: ${app.name} dist not found at ${srcPath}`);
  }
});

console.log('Showcase assembly complete.');
