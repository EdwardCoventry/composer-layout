import fs from 'fs';
import path from 'path';

const rootDir = path.resolve(__dirname, '..');
const showcaseDist = path.join(rootDir, 'apps/showcase/dist');

// Ensure showcase dist exists
if (!fs.existsSync(showcaseDist)) {
  console.error('Showcase dist not found. Run build first.');
  process.exit(1);
}

const apps = [
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

