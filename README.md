# Composer Layout Monorepo

Reusable chat layout primitives plus a Vite demo app that exercises them.

## What's inside
- `packages/composer-layout`: exported React layout frame and hooks
- `apps/composer-layout-example`: demo UI showing header/content/composer/footer behavior on desktop and mobile

## Get started
```
npm install
npm run dev --workspace composer-layout-example
```
The dev server runs at http://localhost:5173 (default Vite port).

## Build and test
- Build everything: `npm run build`
- Test library only: `npm run test --workspace composer-layout`
- Test example app: `npm run test --workspace composer-layout-example`

## Library quickstart
```tsx
import { LayoutFrame, type ComposerHeightMode } from 'composer-layout';

const composerHeight: ComposerHeightMode = { type: 'fraction', fraction: 0.5, minPx: 200 };

<LayoutFrame
  header={<Header />}
  contentPanel={<Content />}
  composerPanel={<Composer />}
  composerHeightMode={composerHeight}
  footer={<Footer />}
  overlayPadContentPanel
/>;
```

Composer sizing modes:
- `fraction`: lock to a viewport percentage (`fraction`, optional `minPx`)
- `content`: auto height; cap with `maxFraction` (defaults to 60% overlay)
- `calculated`: provide `getHeight()`; optional `maxFraction`

Helpful hooks:
- `useViewportCategory`: tells you if the viewport is mobile-sized
- `useKeyboardOpen`: detects virtual keyboard height changes
- `useIsMobile`: simple media-query-backed mobile check

