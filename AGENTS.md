# Agents Guide

This repository uses npm scripts to surface errors quickly across all workspaces.

Primary checks
- TypeScript (project references): `npm run typecheck`
- ESLint (TS + React): `npm run lint`
- Combined check: `npm run check`

Workflow for agents
1. When asked to “check for errors” or “see them all,” run `npm run check` at the repo root.
2. If planning or multiple steps are needed (e.g., triage + fixes), use the `Plan` subagent to outline steps, then execute.
3. After changes, re-run `npm run check` and summarize results.
4. For `packages/composer-layout` release-prep work, also run `npm run test --workspace composer-layout` and `npm run build` at the repo root.

Locations
- Root config: `./tsconfig.json`, `./.eslintrc.json`
- Workspaces: `packages/*`, `apps/*`

Conventions
- Prefer targeted fixes over disabling rules globally.
- For tests/examples, local rule exceptions are acceptable with justification.
- When shipping a package release, update `CHANGELOG.md`, `README.md`, `packages/composer-layout/README.md`, and version strings together.
- When viewport or keyboard behavior changes, keep `packages/composer-layout/docs/viewport-keyboard-model.md` aligned with the released behavior.
- The `apps/chat-messages-example` workspace is the source-of-truth demo for `contentPanelMode="chat-message"` and its `/embed` variant.

