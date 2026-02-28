# Plan 1: Deduplicate CombatLibraryModal + LibraryModal

**Priority:** Critical  
**Status:** Complete

## Problem

`CombatLibraryModal` (~314 lines) and `LibraryModal` (~346 lines) share ~250 lines of identical filter, selection, and confirm-flow logic. The only meaningful differences are the data source and whether inline creation forms are shown.

Both modals:
- manage `nameFilter`, `selectedCategoryIds`, `selectedCreatureIds` state
- implement identical `filteredCreatures` `useMemo` logic and `toggleCategory`/`toggleCreature` handlers
- implement an identical `isConfirmOpen` / `confirmCreatures` two-step confirm flow

`LibraryModal` also has a correctness bug: it uses `Array.includes` for the creature selection set rather than a `Set`, unlike `CombatLibraryModal` which uses `Set` correctly.

## Goal

Extract the shared logic into reusable hooks and a shared filter sidebar component, leaving each modal containing only what makes it unique.

## Steps

1. **Create `useCreatureFilter` hook**
   - Path: `src/features/library/hooks/useCreatureFilter.ts`
   - Accepts: `creatures` array, `categories` array
   - Manages: `nameFilter`, `selectedCategoryIds` state
   - Exposes: memoised `filteredCreatures`, `toggleCategory`, `clearFilters`, `setNameFilter`, `nameFilter`, `selectedCategoryIds`

2. **Create `useConfirmAddFlow` hook**
   - Path: `src/features/library/hooks/useConfirmAddFlow.ts`
   - Accepts: `onAdd: (creatures: Creature[]) => void` callback
   - Manages: `confirmCreatures`, `isConfirmOpen`
   - Exposes: `handleOpenConfirm`, `handleConfirmAdd`, `handleCancelConfirm`, `isConfirmOpen`, `confirmCreatures`

3. **Create `CreatureFilterPanel` component**
   - Path: `src/features/library/components/CreatureFilterPanel.tsx`
   - Renders: name `<input>` + `<CheckboxItem>` per category (the left sidebar)
   - Accepts filter state and callbacks as props from `useCreatureFilter`

4. **Refactor `CombatLibraryModal`**
   - Path: `src/features/combat/modals/CombatLibraryModal.tsx`
   - Consume `useCreatureFilter`, `useConfirmAddFlow`, and `<CreatureFilterPanel>`
   - Verify `Set`-based selection is retained

5. **Refactor `LibraryModal`**
   - Path: `src/features/library/modals/LibraryModal.tsx`
   - Consume `useCreatureFilter`, `useConfirmAddFlow`, and `<CreatureFilterPanel>`
   - **Fix:** migrate `Array.includes` selection check to `Set`

6. **Update barrel exports**
   - Add new hooks to `src/features/library/hooks/` barrel (create `index.ts` if absent)

## Verification

- [x] Both modals filter by name and category correctly
- [x] Creature selection (toggle individual, clear on close) works in both
- [x] Confirm-add two-step flow works in both
- [x] `LibraryModal` `Set`-based selection is consistent with `CombatLibraryModal`
- [x] `npx tsc --noEmit` passes
- [x] `npm run lint` passes
- [x] `npx i18next-cli lint` passes

## Notes

- `useCreatureFilter` lives under the `library` feature since both modals are library-data consumers. `CombatLibraryModal` will import from `../../library/hooks`.
- `CreatureFilterPanel` will also be used by the filter sidebars introduced by the `CategoryCheckboxList` extraction in Plan 6.
