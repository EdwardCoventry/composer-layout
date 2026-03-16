# composer-layout

Responsive two-panel layout primitives for chat-style UIs. It keeps a content panel and a composer panel aligned on every screen size: on mobile the composer sits at the bottom and only takes the space it needs, and on desktop the composer holds a fixed fraction of the viewport.

Repository: https://github.com/EdwardCoventry/composer-layout

Live examples:
- Chat messages: https://edwardcoventry.com/apps/composer-layout/chat-messages/
- AI assistant: https://edwardcoventry.com/apps/composer-layout/ai-assistant/
- Quiz: https://edwardcoventry.com/apps/composer-layout/quiz/

## Install
```
npm install composer-layout
```
Current package version: 0.0.14 (see CHANGELOG in the repo root).
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
      contentPanelMode="chat-message"
      overlayPadContentPanel
      lockComposerPosition
      headerBehavior={{ pinned: true, floating: true, collapsedHeight: 64 }}
    />
  );
}
```

What it does:
- Two panels by default: content (scrollable) and composer (input + actions).
- Mobile: composer hugs the bottom and grows only as its content needs, with keyboard avoidance.
- Desktop: composer reserves a configurable fraction of the viewport so the transcript stays visible.
- Chat-message mode: `contentPanelMode="chat-message"` switches the frame to page-owned scrolling with a sticky header and sticky composer.
- Header behavior overrides: `headerBehavior` can make the chat header scroll away, float back, snap open, or collapse to a pinned sliver.
- Overlay padding: optional content padding so floating headers/toolbars don’t cover messages.
- Optional mobile locking: `lockComposerPosition` keeps the composer fixed even when the keyboard is closed to avoid focus loss on some WebKit builds.
- Height control: choose fraction-based, content-based, or custom-calculated composer heights.
- Hooks for responsive state and keyboard height: `useViewportCategory`, `useViewportKeyboardState`, `useKeyboardOpen`, `useIsMobile`, `useKeyboardOptionsSync`.

Composer sizing modes:
- `fraction`: `{ type: 'fraction', fraction: 0.5, minPx?: number }`
- `content`: `{ type: 'content', maxFraction?: number }` (auto height with optional cap)
- `calculated`: `{ type: 'calculated', getHeight: () => number, maxFraction?: number }`

Header behavior options:
- `pinned`: keep the header sticky at the top. Defaults to `true` in chat-message mode.
- `floating`: hide the header on downward scroll and reveal it on upward scroll.
- `snap`: with `floating`, fully reopen the header as soon as upward scroll is detected.
- `collapsedHeight`: leave a pinned sliver visible after collapse.

Keyboard + composer behavior:
- The mobile overlay activates when `useViewportKeyboardState` reports keyboard activity, including a short settling window while the visual viewport finishes closing.
- `useKeyboardOpen` remains available as the boolean convenience wrapper, but the underlying viewport model now treats focus as a hint and `VisualViewport` geometry as the source of truth.
- Fixed and sticky composer regions now use `effectiveBottomInset`, which preserves the last stable closed inset while browser chrome settles so the composer does not dip behind the bottom bar.
- When overlay is active—or when `lockComposerPosition` is set—the composer is fixed to the bottom and the content panel can opt into matching bottom padding via `overlayPadContentPanel`.

## Example apps (in this repo)
- `apps/chat-messages-example`: sticky/floating/snap/sliver header demo for chat-message mode with static transcript JSON, history/footer polish, and a compact `/embed` route. Dev: `npm run dev:chat-messages`.
- `apps/ai-assistant-example`: assistant layout with hero + quick-start chips, preferences/upload, hamburger/share controls, and a mocked response delay. Dev: `npm run dev:assistant`. Tests: `npm run test --workspace ai-assistant-example`.
- `apps/quiz-app-example`: header/content/composer/footer flow on desktop and mobile. Dev: `npm run dev:quiz`. Tests: `npm run test --workspace quiz-app-example`.

## Development (in monorepo)
- Build: `npm run build --workspace composer-layout`
- Test: `npm run test --workspace composer-layout`
- Full release validation from the repo root: `npm run check && npm run test --workspace composer-layout && npm run build`
- Release automation uses npm trusted publishing from GitHub Actions via `.github/workflows/release.yml`.
- License: MIT. See the repository `LICENSE` file.

Viewport model details live in `docs/viewport-keyboard-model.md`.
