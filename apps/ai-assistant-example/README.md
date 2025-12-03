# AI Assistant Example

Second example Vite app (alongside the quiz demo) that mirrors the recipe-app layout: hero text with quick-start chips, preferences and image upload inside the composer panel, a hamburger + share control, and a simulated 3s delay before showing a response view.

## Commands
- Dev server: `npm run dev --workspace ai-assistant-example` (http://localhost:5173)
- Tests: `npm run test --workspace ai-assistant-example`
- Build: `npm run build --workspace ai-assistant-example`

## What to look at
- `src/screens/AssistantScreenLayout.tsx` — page/state orchestration and mock 3s delay
- `src/components/*` — header, hero, composer, result, shared types
  - Composer components were factored into `src/components/composer/*`:
    - `ComposerPanel.tsx` (container), `PreferencesControl.tsx`, `PhotoPicker.tsx`, `ComposeInputCard.tsx`, `AddMenu.tsx`, `TagInput.tsx`, `icons.tsx`
    - `src/components/ComposerPanel.tsx` re-exports the composer widgets so existing imports remain stable
- `src/screens/AssistantEmbedLayout.tsx` — also exports sizing helpers used by tests (computeEmbedTokens, etc.)

Because this app lives in the monorepo, edits to `packages/composer-layout` are picked up automatically when the dev server is running.

Compare with `apps/quiz-app-example` for a simpler, widget-focused layout wiring.
