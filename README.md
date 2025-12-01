# Composer Layout

React layout primitives for chat-style UIs plus two example apps that exercise them (quiz + AI assistant).

## Install
```
npm install composer-layout
```
Peer deps: `react` and `react-dom` (React 19).

## Features
- Layout frame that keeps header/content/composer/footer aligned on desktop and mobile
- Composer height modes (`fraction`, `content`, `calculated`) with overlay padding support
- Hooks for viewport sizing (`useViewportCategory`, `useIsMobile`) and keyboard detection (`useKeyboardOpen`)
- Quiz demo in `apps/quiz-app-example` and an AI assistant demo in `apps/ai-assistant-example` (shipped in repo, not in the published package)

## Entry points (published package)
- `main`: `dist/index.cjs`
- `module`: `dist/index.mjs`
- `types`: `dist/index.d.ts`
- Published files: `dist/**` only (example app excluded from the tarball)

## Example apps (monorepo only)
- Quiz app (`apps/quiz-app-example`): desktop/mobile layout demonstration with header/content/composer/footer widgets. Dev: `npm run dev:quiz`. Tests: `npm run test --workspace quiz-app-example`.
- AI assistant (`apps/ai-assistant-example`): landing hero with quick-start chips, composer-level preferences + upload, hamburger/share controls, and a mocked 3s “thinking” delay. Dev: `npm run dev:assistant`. Tests: `npm run test --workspace ai-assistant-example`.

## Usage
```tsx
import { LayoutFrame, type ComposerHeightMode } from 'composer-layout';

const composerHeight: ComposerHeightMode = { type: 'fraction', fraction: 0.5, minPx: 200 };

export function ChatScreen() {
  return (
    <LayoutFrame
      header={<Header />}
      contentPanel={<Content />}
      composerPanel={<Composer />}
      composerHeightMode={composerHeight}
      footer={<Footer />}
      overlayPadContentPanel
    />
  );
}
```

Composer sizing modes:
- `fraction`: lock to a viewport percentage (`fraction`, optional `minPx`)
- `content`: auto height; cap with `maxFraction` (defaults to 60% overlay)
- `calculated`: provide `getHeight()`; optional `maxFraction`

Helpful hooks:
- `useViewportCategory`: tells you if the viewport is mobile-sized
- `useKeyboardOpen`: detects virtual keyboard height changes
- `useIsMobile`: simple media-query-backed mobile check

## Build and test
- Install deps: `npm install`
- Build everything: `npm run build`
- Test all workspaces: `npm test`
- Dev (quiz) app: `npm run dev` or `npm run dev:quiz` (http://localhost:5173)
- Dev (assistant) app: `npm run dev:assistant` (also http://localhost:5173)

## Publish and releases
- Manual publish (from `packages/composer-layout`): `npm publish --access public` (requires login and `npm run build` first).
- Automated releases: push a tag like `v0.0.2` to trigger `.github/workflows/release.yml` (runs `npm ci`, `npm test`, then `npm publish --access public` with `NODE_AUTH_TOKEN` from `NPM_TOKEN`).
- Versioning flow: `npm version patch|minor|major --workspaces --no-git-tag-version`, commit, then push with a git tag for the release workflow.

