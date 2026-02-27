# AGENTS.md

## Setup commands

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Lint code: `npm run lint`
- Lint translations: `npx i18next-cli lint`
- Generate i18next types: `npx i18next-cli types`

## Code style

- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible
- JSDoc docblocks must be used, describe what and why. A* quality only
- Extract string literals to translations, use namespace and key