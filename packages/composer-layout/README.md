# composer-layout

Reusable chat layout frame and utility hooks for chat-style experiences.

## Install
```
npm install composer-layout
```
Peer deps: `react` and `react-dom` (React 18+).

## Quick usage
```tsx
import { LayoutFrame, type ComposerHeightMode } from 'composer-layout';

const composerHeight: ComposerHeightMode = { type: 'content', maxFraction: 0.6 };

export function Screen() {
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
- `fraction`: `{ type: 'fraction', fraction: 0.5, minPx?: number }`
- `content`: `{ type: 'content', maxFraction?: number }` (auto height with optional cap)
- `calculated`: `{ type: 'calculated', getHeight: () => number, maxFraction?: number }`

Hooks:
- `useViewportCategory`: responsive helpers (`isMobile`, `isDesktop`)
- `useKeyboardOpen`: detects on-screen keyboard opening by measuring viewport height
- `useIsMobile`: simple media-query backed boolean
- `useKeyboardOptionsSync`: keep an options tray in sync with keyboard state (auto-close options on keyboard open and blur fields when opening options)

## Development (in monorepo)
- Build: `npm run build --workspace composer-layout`
- Test: `npm run test --workspace composer-layout`

