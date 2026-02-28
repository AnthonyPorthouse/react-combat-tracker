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
- Translations should be user oriented, avoid technical jargon
- Prefer single exports per file, except for barrel files.

## Functionality considerations

- Prefer existing well used and actively maintained packages over rolling our own behaviour

## Review Tasks

- Run `npx tsc --noEmit` to verify there are no build errors
- Run `npm run lint` to verify we have no eslint issues
- Run `npx i18next-cli lint` to verify translations are ok
- Update the `README.md` when new functionality is added, or behaviours are changed
