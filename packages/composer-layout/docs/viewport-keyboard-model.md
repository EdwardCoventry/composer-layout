# Viewport keyboard model

Document type: normative.

This document defines the mobile keyboard and viewport behavior expected from the published `composer-layout` package.

## Ownership

- `useViewportKeyboardState` is the source of truth for mobile viewport and keyboard state.
- `useKeyboardOpen` is a compatibility wrapper that exposes only the boolean `keyboardOpen` result.
- `LayoutFrame` consumes `useViewportKeyboardState` to decide when the composer should float and how much bottom inset should be reserved.

## Model

The package treats browser geometry as truth and focus as a hint:

- `VisualViewport.height` and `VisualViewport.offsetTop` describe the actual visible viewport.
- Text-entry focus helps classify whether geometry changes are likely to be keyboard-related.
- A short settling window after blur prevents the layout from snapping down before the browser finishes closing the keyboard.

Tracked state:

- `liveBottomInset`
- `stableClosedBottomInset`
- `effectiveBottomInset`
- `keyboardOpen`
- `settling`
- `keyboardActive`

`effectiveBottomInset` is the value consumers should use for layout.

## LayoutFrame behavior

When `LayoutFrame` runs on mobile:

- overlay mode activates from `keyboardActive`, not only `keyboardOpen`
- fixed and sticky composer regions use `bottom: effectiveBottomInset`
- `overlayPadContentPanel` adds both composer height and `effectiveBottomInset`

This keeps the composer and padded content clear of transient bottom browser chrome while the keyboard is closing.

## Design rules

- Do not gate keyboard visibility purely on focus.
- Do not assume blur means the viewport has already returned to its final closed state.
- Update the remembered closed inset only once the viewport is unfocused and stable.
- Preserve `useKeyboardOpen` for consumers that only need a boolean, but route new layout work through `useViewportKeyboardState`.

## Validation

For hook/layout changes in this package, run:

- `npm run check`
- `npm run test --workspace composer-layout`
- `npm run build --workspace composer-layout`
