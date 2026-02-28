# Plan 4: Split CombatantItem Mixed Concerns

**Priority:** High  
**Status:** Not started

## Problem

`CombatantItem` (~262 lines) is a single `memo` component that handles too many responsibilities:

1. Row layout (two display modes: `'gm'` vs `'player'`)
2. Initiative label computation (`getInitiativeLabel`)
3. HP bar calculation (`hpPct`, `hpHue` via HSL interpolation)
4. Four independent `useState` open/closed flags for modals
5. Four inline modal instances (`RemoveCombatantModal`, `UpdateHpModal` ×2, `EditCombatantModal`)
6. HP clamping math (`Math.min(maxHp, hp + amount)`, `Math.max(0, hp - amount)`) inlined in modal `onConfirm` callbacks
7. Full `<DropdownMenu>` render with four action buttons

## Goal

Separate concerns so `CombatantItem` is a pure layout component. Move action state and HP logic into dedicated units.

## Steps

1. **Create `CombatantHpBar` component**
   - Path: `src/features/combat/components/combatants/CombatantHpBar.tsx`
   - Accepts: `hp: number`, `maxHp: number`
   - Contains: HSL hue interpolation and `role="progressbar"` div
   - Pure presentational — no hooks, no side effects
   - Potentially reusable for HP display in library creature cards

2. **Create `useCombatantActions` hook**
   - Path: `src/features/combat/hooks/useCombatantActions.ts`
   - Accepts: `combatant` object
   - Manages: four `isOpen` flags (remove, heal, harm, edit)
   - Contains: HP clamp math (`Math.min`/`Math.max` callbacks for heal/harm)
   - Exposes: open/close handlers and computed values for each modal

3. **Create `CombatantActionMenu` component**
   - Path: `src/features/combat/components/combatants/CombatantActionMenu.tsx`
   - Renders: `<DropdownMenu>` with Heal/Harm/Edit/Remove menu items, plus the four modal instances
   - Consumes `useCombatantActions` internally
   - Accepts: `combatant`, `inCombat` as props

4. **Refactor `CombatantItem`**
   - Path: `src/features/combat/components/combatants/CombatantItem.tsx`
   - Compose `<CombatantHpBar>` and `<CombatantActionMenu>` 
   - File should contain only row layout + `getInitiativeLabel`

## Verification

- [ ] Heal action updates HP correctly (clamped to `maxHp`)
- [ ] Harm action updates HP correctly (clamped to `0`)
- [ ] Edit modal opens, saves, and closes correctly
- [ ] Remove modal opens and removes combatant from encounter
- [ ] HP bar renders correctly at 0%, ~50%, and 100% HP (check colour transitions)
- [ ] Both `'gm'` and `'player'` display modes render correctly
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` passes
