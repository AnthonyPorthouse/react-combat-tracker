# Plan 5: Fix CategoryList + CreatureList Duplication and native confirm() Inconsistency

**Priority:** High  
**Status:** Not started

## Problem

`CategoryList` (~239 lines) and `CreatureList` (~280 lines) share:

- `useLiveQuery` + `useSelection` + `useModal` + `useToast` wiring
- `SelectionToolbar` + per-row `SelectableIcon` pattern
- `ConfirmDialog` for bulk delete
- An animated/static conditional render via `shouldAnimate` with **entirely duplicated JSX** — every item row is written twice (once wrapped in `<motion.*>`, once not)
- Identical `handleToggleAll` implementation

**Critical inconsistency:** Both lists use the native browser `confirm()` dialog for single-item deletes. This defeats the design system, is non-accessible, and is inconsistent with the `ConfirmDialog` component used everywhere else in the app.

## Goal

Extract the shared wiring into a reusable hook, eliminate the double-render-path JSX duplication, and replace native `confirm()` with `ConfirmDialog` throughout.

## Steps

1. **Create `useListWithSelection` hook**
   - Path: `src/hooks/useListWithSelection.ts`
   - Accepts: `{ items: { id: string }[], deleteFn: (ids: string[]) => Promise<void> }`
   - Wraps: `useSelection`, `useModal` (for bulk confirm), `useToast`
   - Exposes: `selected`, `toggleItem`, `toggleAll`, `isBulkConfirmOpen`, `openBulkConfirm`, `closeBulkConfirm`, `handleBulkDelete`

2. **Create `AnimatableList` component**
   - Path: `src/components/common/AnimatableList.tsx`
   - Accepts: `animate: boolean`, `children: ReactNode`
   - Wraps children in `<AnimatePresence>` when `animate` is true, plain fragment otherwise
   - Eliminates the duplicated double-render-path pattern in both list components
   - Export from the `common` barrel: `src/components/common/index.ts`

3. **Refactor `CategoryList`**
   - Path: `src/features/library/components/CategoryList.tsx`
   - Replace manual selection/toast/modal wiring with `useListWithSelection`
   - Replace native `confirm()` with a `ConfirmDialog` for single-item deletes (requires adding a single-delete confirm state, easily provided by `useModal`)
   - Use `<AnimatableList>` to remove the duplicated animated/static JSX paths

4. **Refactor `CreatureList`**
   - Path: `src/features/library/components/CreatureList.tsx`
   - Same changes as `CategoryList` above

## Verification

- [ ] Single-item delete shows `ConfirmDialog` (not browser `confirm()`) in both lists
- [ ] Bulk delete via `SelectionToolbar` still functions correctly
- [ ] "Toggle all" selects and deselects all items
- [ ] Animations still trigger on first load
- [ ] Animations trigger after add/remove
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
- [ ] `npx i18next-cli lint` passes

## Notes

- Replacing `confirm()` is bundled here because both fixes share the same modal state wiring being introduced. The single-delete `ConfirmDialog` requires one extra `useModal` call — exactly what `useListWithSelection` encapsulates.
- `AnimatableList` may also be useful in future list views outside the library feature.
