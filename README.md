# Composer Layout

Responsive two-panel layout primitives for chat-style UIs. It keeps a content panel and a composer panel aligned on every screen size: on mobile the composer sits at the bottom and takes the minimum space it needs, and on desktop the composer holds a fixed fraction of the viewport.

Live examples:
- AI assistant: https://edwardcoventry.com/apps/composer-layout/ai-assistant/
- Quiz: https://edwardcoventry.com/apps/composer-layout/quiz/

## Install
```
npm install composer-layout
```
Peer deps: `react` and `react-dom` (React 19).

## Core ideas
- Two panels by default: content (the scrollable transcript or main surface) and composer (input + actions).
- Mobile: composer hugs the bottom, growing only as its content needs while avoiding keyboard overlap.
- Desktop: composer reserves a configurable fraction of the viewport so long content remains visible.
- Overlay padding: optionally pad the content area so floating headers or toolbars don’t cover messages.
- Height control: choose between fraction-based, content-based, or custom-calculated composer heights.
- Responsive helpers: hooks to detect mobile/desktop, viewport changes, and on-screen keyboard height.

## Usage
```tsx
import { LayoutFrame, type ComposerHeightMode } from 'composer-layout';

const composerHeight: ComposerHeightMode = { type: 'fraction', fraction: 0.4, minPx: 200 };

export function ChatScreen() {
  return (
    <LayoutFrame
      header={<Header />}
      contentPanel={<Content />}
      composerPanel={<Composer />}
      footer={<Footer />}
      composerHeightMode={composerHeight}
      overlayPadContentPanel
    />
  );
}
```

Composer sizing modes:
- `fraction`: lock to a viewport percentage (`fraction`, optional `minPx`).
- `content`: auto height based on content; cap with `maxFraction` (default 60% when overlaying).
- `calculated`: provide `getHeight()`; optionally cap with `maxFraction`.

Helpful hooks:
- `useViewportCategory`: gives `isMobile`, `isDesktop`, and breakpoint info.
- `useKeyboardOpen`: detects virtual keyboard height changes to keep the composer visible.
- `useIsMobile`: simple media-query-backed boolean.
- `useKeyboardOptionsSync`: keep option trays aligned with keyboard visibility and focus.

## Example apps (in this repo)
- AI assistant (`apps/ai-assistant-example`): hero + quick-start chips, preferences/upload, hamburger/share controls, mocked thinking delay. Dev: `npm run dev:assistant`.
- Quiz (`apps/quiz-app-example`): desktop/mobile layout demo with header/content/composer/footer widgets. Dev: `npm run dev:quiz`.

## Entry points (published package)
- `main`: `dist/index.cjs`
- `module`: `dist/index.mjs`
- `types`: `dist/index.d.ts`
- Published files: `dist/**` only (example apps are not in the tarball)

## Build and test
- Install deps: `npm install`
- Build everything: `npm run build`
- Test all workspaces: `npm test`
- Dev (quiz) app: `npm run dev` or `npm run dev:quiz` (http://localhost:5173)
- Dev (assistant) app: `npm run dev:assistant` (http://localhost:5173)

## Publish and releases
- Manual publish (from `packages/composer-layout`): `npm publish --access public` (requires login and `npm run build` first).
- Automated releases: push a tag like `v0.0.6` to trigger `.github/workflows/release.yml` (runs `npm ci`, `npm test`, then `npm publish --access public` with `NODE_AUTH_TOKEN` from `NPM_TOKEN`).
- Versioning flow: `npm version patch|minor|major --workspaces --no-git-tag-version`, commit, then push with a git tag for the release workflow.
