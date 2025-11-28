# LayoutFrame Demo

A minimal React + TypeScript Vite project demonstrating a reusable vertical layout frame with:

- Fixed header
- Flex-fill content panel ("always fit" content constraints + scroll fallback)
- Optional composer panel with 3 height modes (fraction / content / calculated)
- Optional footer (joins composer panel as BottomRegion when composer present)
- BottomRegion (composer panel + footer) unified overlay block
- Mobile keyboard overlay behavior (BottomRegion becomes fixed above keyboard if composer exists)
- Optional padding of content panel when overlay is active (`overlayPadContentPanel`)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Composer Height Modes

```ts
export type ComposerHeightMode =
  | { type: 'fraction'; fraction: number; minPx?: number }
  | { type: 'content'; maxFraction?: number }
  | { type: 'calculated'; getHeight: () => number; maxFraction?: number };
```

- fraction: fixed fraction of viewport height (e.g. 0.4 => 40vh), optional min pixel height
- content: natural composer content height, capped by `maxFraction * 100vh` if provided
- calculated: explicit pixel height from a function, optionally capped by a fraction of viewport

## BottomRegion Concept

When a composer panel is present (`showComposerPanel && composerPanel`):

- Composer panel + Footer are grouped into a single BottomRegion.
- BottomRegion height obeys the composer height mode rules.
- Inside BottomRegion:
  - Composer panel area scrolls (`overflow-y: auto`).
  - Footer is visually fixed to BottomRegion bottom edge (non-scrolling).
- Overlay: BottomRegion (composer + footer) is fixed above the keyboard on mobile.

When no composer panel is present:

- Footer renders standalone under the content panel.
- No overlay behavior applies by itself.

## Keyboard Overlay Behavior

Mobile heuristic: `innerWidth <= 768`. Keyboard detection via difference between `window.innerHeight` and `visualViewport.height` exceeding `keyboardThreshold`.

If composer exists and keyboard opens:

- BottomRegion switches to overlay: `position: fixed; bottom: 0; left: 0; right: 0;`
- Composer panel continues to scroll internally.
- Footer stays attached to BottomRegion bottom.
- If `overlayPadContentPanel` is true, the content panel gets bottom padding equal to BottomRegion height so its scrollable content stays visible.

If composer absent: layout remains inline (header → content panel → footer).

## Ordering

Inline with composer:

Header → Content Panel → BottomRegion (Composer Panel + Footer)

Inline without composer:

Header → Content Panel → Footer

Overlay (with composer):

Header → Content Panel (may be overlapped) + [BottomRegion fixed]

## Tuning Constants (see `App.tsx`)

```ts
const COMPOSER_FRACTION = 0.4;
const COMPOSER_MIN_PX = 200;
const COMPOSER_CONTENT_MAX_FRACTION = 0.6;
const COMPOSER_CALCULATED_HEIGHT_PX = 220;
```

Switch modes by editing the `composerHeightMode` value in `App.tsx`.

## Props (`LayoutFrame`)

```ts
interface LayoutFrameProps {
  header: React.ReactNode;
  contentPanel: React.ReactNode; // required content area
  composerPanel?: React.ReactNode; // optional composer panel
  showComposerPanel?: boolean; // toggle composer visibility
  composerHeightMode: ComposerHeightMode; // governs BottomRegion height when composer exists
  footer?: React.ReactNode; // optional footer (joins BottomRegion when composer present)
  overlayPadContentPanel?: boolean; // adds bottom padding to content panel in overlay
  keyboardThreshold?: number; // px diff heuristic for keyboard open
}
```

## Data Attributes

- `data-role="layout-frame"` root container
- `data-role="header"` header
- `data-role="content-wrapper"` wrapper around content panel
- `data-role="content-panel"` content panel scroll area
- `data-role="bottom-region"` outer container of composer+footer (only when composer exists)
- `data-role="composer-panel"` scrollable composer area
- `data-role="footer"` footer (inside BottomRegion or standalone)
- `data-mode="inline|overlay"` on BottomRegion when composer exists
- `data-footer-standalone="true"` on footer when rendered without composer

## CSS Variables

```css
:root {
  --composer-bg: #f97316; /* composer panel background */
  --header-bg: #222;
  --main-bg: #1e293b; /* content panel background */
  --footer-bg: #020617;
}
```

## Testing

```bash
npm test
```

Tests cover:

- Composer height modes via BottomRegion
- Overlay activation heuristic
- Structure ordering (with / without composer)
- Content panel scroll fallback
- Standalone footer behavior

## Future Improvements

- dvh units for fraction mode when overlay active
- Refined keyboard detection (focus + resize synergy)
- Accessibility (aria labels, focus management in overlay)
- Storybook examples
- Callback hooks for overlay state changes

## License

MIT

## Screen container pattern (recommended)

Keep `LayoutFrame` controlled and dumb; introduce a screen container that owns sizing state and passes a derived `composerHeightMode` plus a composer widget that emits events.

Example:

```tsx
function Screen() {
  const { isMobile } = useViewportCategory();
  const [sizingPreset, setSizingPreset] = useState<"auto" | "vhFraction">(isMobile ? "auto" : "vhFraction");
  const [isGridOpen, setIsGridOpen] = useState(false);

  const composerHeightMode = useMemo(() => (
    sizingPreset === 'auto'
      ? { type: 'content', maxFraction: 0.6 }
      : { type: 'fraction', fraction: 0.5, minPx: 200 }
  ), [sizingPreset]);

  return (
    <LayoutFrame
      header={<Header/>}
      contentPanel={<Content/>}
      composerPanel={
        <ComposerWidget
          isMobile={isMobile}
          sizingPreset={sizingPreset}
          onChangeSizingPreset={setSizingPreset}
          isGridOpen={isGridOpen}
          onToggleGrid={() => setIsGridOpen(v => !v)}
        />
      }
      showComposerPanel
      composerHeightMode={composerHeightMode}
      footer={<Footer/>}
      overlayPadContentPanel
    />
  );
}
```
