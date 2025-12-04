# Copilot Instructions for composer-layout

Purpose: Ensure assistants consistently surface TypeScript and ESLint errors across the monorepo and use the proper workflows.

Core checks
- TypeScript project-wide check (references): `npm run typecheck`
- ESLint across the repository: `npm run lint`
- Combined quick check: `npm run check`

Where to run
- Run from the repo root: `C:\Users\Edward\Code\js-packages\composer-layout`
- The root `tsconfig.json` uses project references for apps and packages, so `tsc -b --noEmit` will traverse all workspaces.

Tooling notes
- ESLint: Config is at `./.eslintrc.json` and supports TS + React.
- TypeScript: Root `tsconfig.json` references `packages/composer-layout`, `apps/quiz-app-example`, and `apps/ai-assistant-example`.

Agent behavior
- Prefer running the checks via npm scripts rather than raw commands.
- If the task requires a multi-step plan (e.g., fixing waves of lint/type errors), invoke the `Plan` subagent to outline steps before making code edits.
- After any code edits, re-run `npm run check` and report PASS/FAIL succinctly.

Quality gates
- Build: not required for checks; use `npm run build --workspaces` only when necessary.
- Lint/Typecheck: must be green before concluding.
- Tests: run `npm run test --workspaces` when relevant.

Do not:
- Install conflicting ESLint/TypeScript plugin versions.
- Silence errors without justification. Prefer targeted fixes or rule scope exceptions in tests/examples.

