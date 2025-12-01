# Composer Layout

React layout primitives for chat-style UIs plus an example app that exercises them.

## Install
```
npm install composer-layout
```
Peer deps: `react` and `react-dom` (React 19).

## Features
- Layout frame that keeps header/content/composer/footer aligned on desktop and mobile
- Composer height modes (`fraction`, `content`, `calculated`) with overlay padding support
- Hooks for viewport sizing (`useViewportCategory`, `useIsMobile`) and keyboard detection (`useKeyboardOpen`)
- Example app in `apps/composer-layout-example` to demo responsive behavior (shipped in repo, not in the published package)

## Entry points (published package)
- `main`: `dist/index.cjs`
- `module`: `dist/index.mjs`
- `types`: `dist/index.d.ts`
- Published files: `dist/**` only (example app excluded from the tarball)

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
- Dev example app: `npm run dev --workspace composer-layout-example` (runs on http://localhost:5173)

## Publish and releases
- Manual publish (from `packages/composer-layout`): `npm publish --access public` (requires login and `npm run build` first).
- Automated releases: push a tag like `v0.0.2` to trigger `.github/workflows/release.yml` (runs `npm ci`, `npm test`, then `npm publish --access public` with `NODE_AUTH_TOKEN` from `NPM_TOKEN`).
- Versioning flow: `npm version patch|minor|major --workspaces --no-git-tag-version`, commit, then push with a git tag for the release workflow.

