# Plan 6: Medium-Priority Cleanup Bundle

**Priority:** Medium  
**Status:** Not started

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

- [ ] Drag-to-reorder still works in the combat view
- [ ] `npx tsc --noEmit` passes

---

## 6b: Use `useFormValidation` in `CreatureForm` and `CategoryForm`

### Problem

The app has a generic `useFormValidation` hook (`src/hooks/useFormValidation.ts`) that handles Zod-based per-field error state. Both `CreatureForm` and `CategoryForm` bypass it, each managing their own `const [error, setError] = useState('')` with a manual `try/catch` around `validator.parse()`.

Additionally, the same `<fieldset>/<legend>/<CheckboxItem>` category selector block appears in both `CreatureForm` and the library modal filter sidebars introduced in Plan 1 — it should be extracted once.

### Steps

1. Refactor `src/features/library/components/CreatureForm.tsx` to use `useFormValidation<CreatureFormData>(creatureValidator)` — removes ~15 lines of manual error handling
2. Refactor `src/features/library/components/CategoryForm.tsx` the same way
3. Extract the category checkboxes block to `src/features/library/components/CategoryCheckboxList.tsx`
   - Accepts: `categories`, `selectedIds`, `onChange` props
   - Used by: `CreatureForm` and `CreatureFilterPanel` from Plan 1

### Verification

- [ ] Creature form validates and displays errors correctly on invalid submit
- [ ] Category form validates and displays errors correctly
- [ ] Category checkboxes render and update correctly in both forms
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes

---

## 6c: Delete deprecated `AddCreaturesModal`

### Problem

`src/features/library/modals/AddCreaturesModal.tsx` (~254 lines) is explicitly marked `@deprecated` in its JSDoc, with a note that new code should use `CombatLibraryModal`. It duplicates the virtualiser and creature filter logic, adding maintenance burden with no benefit.

### Steps

1. Confirm no import sites reference `AddCreaturesModal` (search codebase for the import path and component name)
2. Remove it from any barrel exports in `src/features/library/modals/index.ts` (if it is listed)
3. Delete `src/features/library/modals/AddCreaturesModal.tsx`

### Verification

- [ ] No runtime errors or broken imports after deletion
- [ ] `npx tsc --noEmit` passes

---

## 6d: Extract `useFocusTrap` hook

### Problem

`DropdownMenu.tsx` and `BaseModal.tsx` independently manage `inert` toggling on `#root` and `#modal-root`, plus focus restoration to the trigger element on close. The logic is duplicated across both files and will need to be duplicated again in any future portalled overlay.

### Steps

1. Create `src/hooks/useFocusTrap.ts`
   - Accepts: `isOpen: boolean`, `triggerRef: RefObject<HTMLElement>`
   - Manages: toggling `inert` on `#root` (and `#modal-root` where applicable), setting initial focus on open, restoring focus to trigger on close
2. Refactor `src/components/common/DropdownMenu.tsx` to consume `useFocusTrap`
3. Refactor `src/components/modals/BaseModal.tsx` to consume `useFocusTrap`

### Verification

- [ ] Dropdown opens, traps focus, and restores focus to trigger on close
- [ ] Modal opens, traps focus, and restores focus to trigger on close
- [ ] Background content is inert (not keyboard-reachable) while overlay is open
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
