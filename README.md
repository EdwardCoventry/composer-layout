# Composer Layout

Responsive two-panel layout primitives for chat-style UIs. It keeps a content panel and a composer panel aligned on every screen size: on mobile the composer sits at the bottom and takes the minimum space it needs, and on desktop the composer holds a fixed fraction of the viewport.

Repository: https://github.com/EdwardCoventry/composer-layout

Live examples:
- Chat messages: https://edwardcoventry.com/apps/composer-layout/chat-messages/
- AI assistant: https://edwardcoventry.com/apps/composer-layout/ai-assistant/
- Quiz: https://edwardcoventry.com/apps/composer-layout/quiz/

## Install
```
npm install composer-layout
```
Current package version: 0.0.14 (see CHANGELOG).
Peer deps: `react` and `react-dom` (React 19).
Viewport model details: `packages/composer-layout/docs/viewport-keyboard-model.md`.

## Core ideas
- Two panels by default: content (the scrollable transcript or main surface) and composer (input + actions).
- Mobile: composer hugs the bottom, growing only as its content needs while avoiding keyboard overlap.
- Desktop: composer reserves a configurable fraction of the viewport so long content remains visible.
- Chat-message mode: pin the header to the top and the composer to the bottom while the page owns the vertical scrollbar.
- Header behavior overrides: opt into sticky, floating, snap, collapsed-sliver, or combined pinned-floating headers in chat-message mode.
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
      contentPanelMode="chat-message"
      overlayPadContentPanel
      headerBehavior={{ pinned: true, floating: true, collapsedHeight: 64 }}
    />
  );
}
```

Header behavior options in `contentPanelMode="chat-message"`:
- `pinned`: keep the header sticky at the top. Defaults to `true`.
- `floating`: hide the header while scrolling down and reveal it on reverse scroll.
- `snap`: when used with `floating`, fully reopen the header as soon as reverse scroll is detected.
- `collapsedHeight`: keep a sliver pinned at the top after the header collapses.

Composer sizing modes:
- `fraction`: lock to a viewport percentage (`fraction`, optional `minPx`).
- `content`: auto height based on content; cap with `maxFraction` (default 60% when overlaying).
- `calculated`: provide `getHeight()`; optionally cap with `maxFraction`.

Helpful hooks:
- `useViewportCategory`: gives `isMobile`, `isDesktop`, and breakpoint info.
- `useViewportKeyboardState`: exposes live/stable/effective bottom insets plus keyboard-open and settling state from `VisualViewport`.
- `useKeyboardOpen`: boolean convenience wrapper over `useViewportKeyboardState`.
- `useIsMobile`: simple media-query-backed boolean.
- `useKeyboardOptionsSync`: keep option trays aligned with keyboard visibility and focus.

## Example apps (in this repo)
- Chat messages (`apps/chat-messages-example`): static transcript demo for the `contentPanelMode="chat-message"` path with switchable sticky/floating/snap/sliver headers, a sticky composer, history panel, release-style footer, and a compact `/embed` variant. Dev: `npm run dev:chat-messages`.
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
- Dev (chat messages) app: `npm run dev:chat-messages` (http://localhost:5173, embed at `/embed`)

## Publish and releases
- Manual publish (from `packages/composer-layout`): `npm publish --access public` (requires login and `npm run build` first).
- Automated releases: push a tag like `v0.0.14` to trigger `.github/workflows/release.yml`. The workflow uses npm trusted publishing with GitHub OIDC, so it no longer needs an `NPM_TOKEN`.
- GitHub Actions billing: on GitHub's current billing rules, standard GitHub-hosted runners are free for public repositories. Private repositories consume your account's Actions quota and can be blocked by billing limits.
- Versioning flow: `npm version patch|minor|major --workspaces --no-git-tag-version`, update `CHANGELOG.md`, both READMEs, and `AGENTS.md`, then commit and push with a git tag for the release workflow.
- License: MIT. See [LICENSE](C:/Users/Edward/Code/js-packages/composer-layout/LICENSE).
