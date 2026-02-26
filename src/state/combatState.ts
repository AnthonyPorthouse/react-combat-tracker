import z from 'zod'
import { CombatantValidator, type Combatant } from '../types/combatant'

/**
 * Zod schema for the complete combat session state.
 *
 * Used both for runtime type-checking and for validating imported state
 * strings — a single schema ensures the data model is consistent whether the
 * state comes from live app usage or a pasted export string. `strictObject`
 * rejects extra keys so malformed imports fail loudly rather than silently
 * carrying unknown fields into the app.
 */
export const CombatValidator = z.strictObject({
  inCombat: z.boolean(),
  round: z.number().int().nonnegative().default(0),
  step: z.number().int().nonnegative().default(0),
  combatants: z.array(CombatantValidator).default([]),
})

export type CombatState = z.infer<typeof CombatValidator>

/**
 * All actions that can be dispatched to modify combat state.
 *
 * The discriminated union on `type` lets TypeScript narrow the payload type
 * inside each reducer case, and ensures the exhaustive `default` branch
 * catches any future unhandled actions at compile time.
 */
export type CombatAction =
  | { type: 'ADD_COMBATANT'; payload: Combatant }
  | { type: 'ADD_COMBATANTS'; payload: Combatant[] }
  | { type: 'REMOVE_COMBATANT'; payload: string }
  | { type: 'UPDATE_COMBATANT'; payload: Combatant }
  | { type: 'REORDER_COMBATANTS'; payload: Combatant[] }
  | { type: 'START_COMBAT' }
  | { type: 'END_COMBAT' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'IMPORT_STATE'; payload: CombatState }

/** The state of a combat session before any encounter has been started. */
export const initialCombatState: CombatState = {
  inCombat: false,
  round: 0,
  step: 0,
  combatants: [],
}

/**
 * Strips a trailing number from a combatant name, returning the base name.
 *
 * This is the inverse of the `"BaseName N"` pattern that `renumberCombatants`
 * produces. It is used to group combatants by creature type so that auto-
 * numbering can keep "Goblin 1", "Goblin 2", "Goblin 3" in sync when any
 * member is added or removed.
 *
 * @example
 * getBaseName('Goblin 3') // → 'Goblin'
 * getBaseName('Dragon')   // → 'Dragon'  (no trailing number)
 *
 * @param name - The full combatant display name.
 * @returns The base name without its trailing `\s\d+` suffix, or the original
 *   name if no suffix is present.
 */
function getBaseName(name: string): string {
  const match = name.match(/^(.*)\s(\d+)$/)
  if (!match) return name
  return match[1]
}

/**
 * Ensures all combatants of the same base creature type are numbered
 * sequentially, starting from 1.
 *
 * Whenever a combatant is added or removed, every group of same-type
 * combatants (identified by their base name) is re-indexed so the display
 * names stay gap-free — e.g. removing "Goblin 2" from ["Goblin 1", "Goblin 2",
 * "Goblin 3"] yields ["Goblin 1", "Goblin 2"] rather than leaving a hole.
 *
 * Singletons (only one combatant with a given base name) are left exactly as
 * the user named them, with no trailing number appended.
 *
 * @param combatants - The full combatant array after an add/remove mutation.
 * @returns A new array where each combatant's `name` reflects its sequential
 *   position within its group.
 */
function renumberCombatants(combatants: Combatant[]): Combatant[] {
  const grouped = new Map<string, Combatant[]>()

  combatants.forEach((combatant) => {
    const baseName = getBaseName(combatant.name).trim()
    const group = grouped.get(baseName) ?? []
    group.push(combatant)
    grouped.set(baseName, group)
  })

  return combatants.map((combatant) => {
    const baseName = getBaseName(combatant.name).trim()
    const group = grouped.get(baseName) ?? []

    if (group.length <= 1) {
      return combatant
    }

    const index = group.findIndex((member) => member.id === combatant.id)
    const numberedName = `${baseName} ${index + 1}`

    if (combatant.name === numberedName) {
      return combatant
    }

    return {
      ...combatant,
      name: numberedName,
    }
  })
}

/**
 * Pure reducer for all combat session state changes.
 *
 * Receives an Immer draft of `CombatState` so cases can use direct mutation
 * syntax, keeping the code concise for complex nested updates. Returning
 * `undefined` (implicit `return` after mutation) is the Immer convention for
 * "apply the mutations to the draft". Cases that assign a new value to the
 * whole draft field (e.g. `draft.combatants = …`) are also valid in Immer.
 *
 * ### Key behavioural notes
 * - **START_COMBAT:** Resolves all `roll`-type initiative values by simulating
 *   a d20 roll (1–20) + modifier, converts them to `fixed`, then sorts
 *   highest-first so the combatant list reflects turn order.
 * - **NEXT_STEP / PREVIOUS_STEP:** `step` is 1-indexed and wraps around
 *   round boundaries. Step 0 is never valid during active combat.
 * - **ADD_COMBATANT(S):** Always runs `renumberCombatants` so that inserting
 *   a second "Goblin" automatically produces "Goblin 1" and "Goblin 2".
 *
 * @param draft - Immer-proxied mutable copy of the current `CombatState`.
 * @param action - The dispatched action describing what should change.
 */
export function combatReducer(draft: CombatState, action: CombatAction) {
  switch (action.type) {
    case 'START_COMBAT':
      draft.inCombat = true
      draft.round = 1
      draft.step = 1

      draft.combatants = draft.combatants.map((combatant) => {
        if (combatant.initiativeType === 'roll') {
          return CombatantValidator.parse({
            ...combatant,
            initiativeType: 'fixed',
            initiative: Math.floor(Math.random() * 20) + 1 + combatant.initiative,
          })
        }

        return combatant
      })

      draft.combatants.sort((a, b) => b.initiative - a.initiative)
      return

    case 'END_COMBAT':
      draft.inCombat = false
      draft.round = 0
      draft.step = 0
      draft.combatants = []
      return

    case 'NEXT_STEP':
      if (draft.step >= draft.combatants.length) {
        draft.step = 1
        draft.round += 1
        return
      }

      draft.step += 1
      return

    case 'PREVIOUS_STEP':
      if (draft.step == 1 && draft.round == 1) {
        return
      }

      if (draft.step == 1) {
        draft.step = draft.combatants.length
        draft.round -= 1
        return
      }

      draft.step -= 1
      return

    case 'ADD_COMBATANT':
      draft.combatants = renumberCombatants([
        ...draft.combatants,
        action.payload,
      ])
      return

    case 'ADD_COMBATANTS':
      draft.combatants = renumberCombatants([
        ...draft.combatants,
        ...action.payload,
      ])
      return

    case 'REMOVE_COMBATANT':
      draft.combatants = draft.combatants.filter((combatant) => combatant.id !== action.payload)
      return

    case 'UPDATE_COMBATANT': {
      const index = draft.combatants.findIndex((c) => c.id === action.payload.id)
      if (index !== -1) {
        draft.combatants[index] = action.payload
      }
      return
    }

    case 'REORDER_COMBATANTS':
      draft.combatants = action.payload
      return

    case 'IMPORT_STATE':
      draft.inCombat = action.payload.inCombat
      draft.round = action.payload.round
      draft.step = action.payload.step
      draft.combatants = action.payload.combatants
      return

    default: {
      const _exhaustiveCheck: never = action
      throw new Error(`Unhandled action type: ${String(_exhaustiveCheck)}`)
    }
  }
}
