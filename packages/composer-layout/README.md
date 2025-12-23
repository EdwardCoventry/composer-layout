# composer-layout

Responsive two-panel layout primitives for chat-style UIs. It keeps a content panel and a composer panel aligned on every screen size: on mobile the composer sits at the bottom and only takes the space it needs, and on desktop the composer holds a fixed fraction of the viewport.

Live examples:
- AI assistant: https://edwardcoventry.com/apps/composer-layout/ai-assistant/
- Quiz: https://edwardcoventry.com/apps/composer-layout/quiz/

## Install
```
npm install composer-layout
```
Current package version: 0.0.11 (see CHANGELOG in the repo root).
Peer deps: `react` and `react-dom` (React 19).

## Quick usage
```tsx
import { LayoutFrame, type ComposerHeightMode } from 'composer-layout';

const composerHeight: ComposerHeightMode = { type: 'fraction', fraction: 0.4, minPx: 200 };

export function Screen() {
  return (
    <LayoutFrame
      header={<Header />}
      contentPanel={<Content />}
      composerPanel={<Composer />}
      footer={<Footer />}
      composerHeightMode={composerHeight}
      overlayPadContentPanel
      lockComposerPosition
    />
  );
}
```

What it does:
- Two panels by default: content (scrollable) and composer (input + actions).
- Mobile: composer hugs the bottom and grows only as its content needs, with keyboard avoidance.
- Desktop: composer reserves a configurable fraction of the viewport so the transcript stays visible.
- Overlay padding: optional content padding so floating headers/toolbars don’t cover messages.
- Optional mobile locking: `lockComposerPosition` keeps the composer fixed even when the keyboard is closed to avoid focus loss on some WebKit builds.
- Height control: choose fraction-based, content-based, or custom-calculated composer heights.
- Hooks for responsive state and keyboard height: `useViewportCategory`, `useKeyboardOpen`, `useIsMobile`, `useKeyboardOptionsSync`.

Composer sizing modes:
- `fraction`: `{ type: 'fraction', fraction: 0.5, minPx?: number }`
- `content`: `{ type: 'content', maxFraction?: number }` (auto height with optional cap)
- `calculated`: `{ type: 'calculated', getHeight: () => number, maxFraction?: number }`

Keyboard + composer behavior:
- The mobile overlay activates when `useKeyboardOpen` (powered by `use-detect-keyboard-open`) reports a keyboard height above `keyboardThreshold` (default 300px).
- `useKeyboardOpen` is gated on text-entry focus to avoid false positives from browser chrome changes; blurring a text field clears the open state.
- When overlay is active—or when `lockComposerPosition` is set—the composer is fixed to the bottom and the content panel can opt into matching bottom padding via `overlayPadContentPanel`.

## Example apps (in this repo)
- `apps/ai-assistant-example`: assistant layout with hero + quick-start chips, preferences/upload, hamburger/share controls, and a mocked response delay. Dev: `npm run dev:assistant`. Tests: `npm run test --workspace ai-assistant-example`.
- `apps/quiz-app-example`: header/content/composer/footer flow on desktop and mobile. Dev: `npm run dev:quiz`. Tests: `npm run test --workspace quiz-app-example`.

## Development (in monorepo)
- Build: `npm run build --workspace composer-layout`
- Test: `npm run test --workspace composer-layout`
