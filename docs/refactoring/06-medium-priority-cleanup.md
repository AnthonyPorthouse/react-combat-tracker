# Plan 6: Medium-Priority Cleanup Bundle

**Priority:** Medium  
**Status:** Complete ✅

## Overview

Four smaller, independent cleanups grouped into one pass. Each item is self-contained and can be tackled in any order.

---

## 6a: Extract `SortableCombatantItem` to its own file

### Problem

`SortableCombatantItem` is defined as a named `memo` component at the top of `CombatantList.tsx` but is only used within that file. It blurs the module boundary and makes `CombatantList` harder to scan.

### Steps

1. Move `SortableCombatantItem` from `src/features/combat/components/combatants/CombatantList.tsx` into a new file `src/features/combat/components/combatants/SortableCombatantItem.tsx`
2. Update the import in `CombatantList.tsx`
3. Optionally extract `useDndSensors` to `src/hooks/useDndSensors.ts` (the `useSensors(PointerSensor + TouchSensor + KeyboardSensor)` configuration block) if DnD is likely to be used elsewhere

### Verification

- [x] Drag-to-reorder still works in the combat view
- [x] `npx tsc --noEmit` passes

---

## 6b: Use `useFormValidation` in `CreatureForm` and `CategoryForm`

### Problem

The app has a generic `useFormValidation` hook (`src/hooks/useFormValidation.ts`) that handles Zod-based per-field error state. Both `CreatureForm` and `CategoryForm` bypass it, each managing their own `const [error, setError] = useState('')` with a manual `try/catch` around `validator.parse()`.

Additionally, the same `<fieldset>/<legend>/<CheckboxItem>` category selector block appears in both `CreatureForm` and the library modal filter sidebars introduced in Plan 1 — it should be extracted once.

### Steps

1. Refactor `src/features/library/components/CreatureForm.tsx` to use `useFormValidation<CreatureFormData>(creatureValidator)` — removes ~15 lines of manual error handling
2. Refactor `src/features/library/components/CategoryForm.tsx` the same way
3. Extract the category checkboxes block to `src/features/library/components/CategoryCheckboxList.tsx`
   - Accepts: `categories`, `selectedIds: Set<string>`, `onToggle` props
   - Uses `useId()` internally for checkbox id uniqueness (no external `idPrefix` prop needed)
   - Used by: `CreatureForm` and `CreatureFilterPanel` from Plan 1

### Verification

- [x] Creature form validates and displays errors correctly on invalid submit
- [x] Category form validates and displays errors correctly
- [x] Category checkboxes render and update correctly in both forms
- [x] `npx tsc --noEmit` passes
- [x] `npm run lint` passes

---

## 6c: Delete deprecated `AddCreaturesModal`

### Problem

`src/features/library/modals/AddCreaturesModal.tsx` (~254 lines) is explicitly marked `@deprecated` in its JSDoc, with a note that new code should use `CombatLibraryModal`. It duplicates the virtualiser and creature filter logic, adding maintenance burden with no benefit.

### Steps

1. Confirm no import sites reference `AddCreaturesModal` (search codebase for the import path and component name)
2. Remove it from any barrel exports in `src/features/library/modals/index.ts` (if it is listed)
3. Delete `src/features/library/modals/AddCreaturesModal.tsx`

### Verification

- [x] No runtime errors or broken imports after deletion
- [x] `npx tsc --noEmit` passes

---

## 6d: Extract `useFocusTrap` hook

### Problem

`DropdownMenu.tsx` and `BaseModal.tsx` independently manage `inert` toggling on `#root` and `#modal-root`, plus focus restoration to the trigger element on close. The logic is duplicated across both files and will need to be duplicated again in any future portalled overlay.

### Steps

1. Create `src/hooks/useFocusTrap.ts`
   - Accepts: `isOpen: boolean`, `triggerRef: RefObject<HTMLElement | null>`, optional `{ inertSelectors, focusOnOpenSelector }`
   - Manages: toggling `inert` on configured selectors, setting initial focus on open, restoring focus to trigger on close
2. Refactor `src/components/common/DropdownMenu.tsx` to consume `useFocusTrap`
3. Refactor `src/components/modals/BaseModal.tsx` to consume `useFocusTrap`
   - `triggerRef` is a **required** prop on `BaseModal` — pass `useRef(null)` when no obvious trigger exists
4. Add `forwardRef` to `src/components/common/Button.tsx` so callers can attach trigger refs
5. Thread `triggerRef` through all `BaseModal` consumers (wrapper modals) and `ConfirmDialog`
6. Update all parent call sites to create refs and attach to trigger buttons:
   - `src/routes/app.tsx` — refs for library, export, import, and create combatant buttons; `endCombatRef` is a null ref (trigger is inside `CombatBar`)
   - `src/routes/library/index.tsx` — refs for export and import library buttons
   - `src/features/combat/components/combatants/CombatantActionMenu.tsx` — null refs for all four modals (dropdown items are the triggers; `DropdownMenu`'s own focus trap handles the return path)
   - `src/features/library/components/CategoryList.tsx` — captures `e.currentTarget` for single-delete; null ref for bulk-delete
   - `src/features/library/components/CreatureList.tsx` — same pattern as `CategoryList`

### Notes

- `ConfirmDialogProps` (in `src/types/common.ts`) also gains a required `triggerRef` field so it flows through `ConfirmDialog` → `BaseModal`
- Null `triggerRef` values are intentional in a few call sites where focus restoration is either impossible or already handled by another layer

### Verification

- [x] Dropdown opens, traps focus, and restores focus to trigger on close
- [x] Modal opens, traps focus, and restores focus to trigger on close
- [x] Background content is inert (not keyboard-reachable) while overlay is open
- [x] `npx tsc --noEmit` passes
- [x] `npm run lint` passes
