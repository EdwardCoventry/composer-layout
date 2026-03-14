# Chat Messages Example

Demo Vite app for `composer-layout`'s `contentPanelMode="chat-message"` path. It shows a sticky header, sticky composer, page-owned transcript scrolling, a history rail, and a compact `/embed` variant for review.

## Commands
- Dev server: `npm run dev --workspace chat-messages-example` (http://localhost:5173, embed at `/embed`)
- Build: `npm run build --workspace chat-messages-example`

## What to look at
- `src/App.tsx` - route split between the full chat view and the `/embed` variant
- `src/data/thread.json` - static message data used to exercise transcript spacing and scrolling
- `src/index.css` - layout and presentation for the pinned chat treatment

Because this app lives in the monorepo, edits to `packages/composer-layout` are picked up automatically when the dev server is running.
