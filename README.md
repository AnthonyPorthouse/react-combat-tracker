# Combat Tracker

A web-based combat tracking application built with React and TypeScript. This tool is designed to help manage combat encounters by tracking combatants and their actions during gameplay.

## Features (In Progress)

- **Combatant Management**: Create and manage combatants with relevant combat statistics
- **Combat Bar**: Track initiative and turn order
- **State Management**: TypeScript-based state management for combat data

## Tech Stack

Built with:
- **React** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CSS** - Styling

## Development

### Getting Started

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── CombatBar.tsx   # Main combat interface
│   └── combatants/     # Combatant-related components
├── state/              # State management
├── types/              # TypeScript type definitions
└── main.tsx            # Entry point
```

## Status

This project is actively in development. Features and functionality are being added and refined.

## Accessibility

- **Focus trapping** — All modals and dropdown menus use the `useFocusTrap` hook, which marks background content `inert` while an overlay is open (preventing keyboard focus and pointer events from reaching it) and restores focus to the trigger element on close, meeting WCAG 2.1 SC 2.4.3.
- **Trigger refs** — `Button` forwards its `ref` so parent components can pass a `triggerRef` to any modal, enabling predictable focus restoration regardless of how the modal was opened.

## Performance

The application is designed to remain responsive on low-end devices even at scale:

- **Virtual scrolling** — The creature library list and the creature-select modals use [TanStack Virtual](https://tanstack.com/virtual) to render only the visible portion of the list, keeping DOM node count constant regardless of library size.
- **Animation threshold** — Per-item enter/exit animations are suppressed when a list exceeds 50 items. Large combat encounters (100+ combatants) and bulk-imported libraries skip Framer Motion layout work entirely and use plain HTML elements instead.
- **React.memo + stable callbacks** — Combatant rows are wrapped with `React.memo` and receive `useCallback`-stabilised handlers so that advancing a turn only re-renders the two affected rows (previous and new current turn), not the entire list.
- **Split contexts** — Combat state and dispatch are provided through separate React contexts. Components that only dispatch actions (button handlers) can subscribe to the dispatch context alone and will not re-render when state changes.
- **Atomic DB writes** — Category cascade deletes and bulk deletes are wrapped in Dexie transactions with `bulkPut`/`anyOf` so they execute as a single atomic batch rather than N sequential IndexedDB round-trips.


