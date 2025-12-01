# Quiz App Example

Demo Vite app that consumes the `composer-layout` library and shows how the header/content/composer/footer respond on desktop vs mobile and when the virtual keyboard is open. Pairs with the AI assistant example for a fuller, hero-style experience.

## Commands
- Dev server: `npm run dev --workspace quiz-app-example` (http://localhost:5173)
- Tests: `npm run test --workspace quiz-app-example`
- Build: `npm run build --workspace quiz-app-example`

## What to look at
- `src/screens/QuizScreenLayout.tsx` — wires `LayoutFrame` with sizing presets and overlay padding
- `src/components/*Widget.tsx` — small, styled demo widgets for header/content/composer/footer

Because this app lives in the monorepo, edits to `packages/composer-layout` are picked up automatically when the dev server is running.

