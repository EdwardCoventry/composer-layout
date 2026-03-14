# Changelog

## Unreleased

## 0.0.12
- Add `contentPanelMode="chat-message"` to `LayoutFrame` so chat transcripts can use page-owned scrolling with a sticky header and sticky composer.
- Add a new `apps/chat-messages-example` wireframe demo that showcases the pinned chat layout with static transcript JSON.
- Polish the chat-messages example with generic AI chat copy, a history surface, release-style footer treatment, and a compact `/embed` route for embed-layout review.
- Refresh root/package README guidance and the agent instructions to document the new example and release validation flow.

## 0.0.11
- Bump package version and refresh README guidance for the latest publish.

## 0.0.10
- Bump package version to republish the latest `composer-layout` build to npm.

## 0.0.9
- Add `lockComposerPosition` to keep the composer fixed on mobile even when the keyboard is closed, avoiding focus loss on some WebKit builds.
- Harden `useKeyboardOpen` with visualViewport baselines and a focus-based fallback for coarse pointers so keyboard overlay stays accurate on iOS/Safari.
- Refresh docs to cover the new composer locking option and the keyboard detection behavior.

## 0.0.6
- Refresh metadata and docs for the 0.0.6 release.

## 0.0.5
- Keep `LayoutFrame` pinned to the viewport by using `height`/`maxHeight` of `100dvh` so the content panel remains the only scrollable area.

## 0.0.4
- Republish the package to surface the latest composer layout fixes.

## 0.0.3
- Add `allowAutoHeight` support to fraction-based composer height mode.
- Clean up layout refs and test utilities to align with React 19.

## 0.0.2
- Add AI assistant example app alongside the quiz demo.
- Update docs to cover both examples and workspace commands.
- Broaden `.gitignore` for workspace caches.

## 0.0.1
- Add React 19 support (peer deps now `react`/`react-dom` ^19).
- Refresh build/test against React 19 and republish package.

## 0.0.0
- Initial publish of `composer-layout`.
