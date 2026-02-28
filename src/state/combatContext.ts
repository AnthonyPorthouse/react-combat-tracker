import { createContext, useContext, type Dispatch } from 'react'
import type { CombatAction, CombatState } from './combatState'

// ---------------------------------------------------------------------------
// Split contexts — subscribe to only the slice you need
// ---------------------------------------------------------------------------

/**
 * Carries only the live combat state. Components that subscribe here will
 * re-render on every state change. Prefer `useCombatSelector` to read a
 * specific slice and avoid re-renders caused by unrelated state mutations.
 */
export const CombatStateContext = createContext<CombatState | null>(null)

/**
 * Carries the stable dispatch function. Components that only dispatch actions
 * (e.g. button handlers) can subscribe here without re-rendering whenever
 * state changes. `dispatch` is stable across renders because `useImmerReducer`
 * returns the same reference.
 */
export const CombatDispatchContext = createContext<Dispatch<CombatAction> | null>(null)

// ---------------------------------------------------------------------------
// Legacy combined context — kept for backward compatibility
// ---------------------------------------------------------------------------

interface CombatContextValue {
  state: CombatState
  dispatch: Dispatch<CombatAction>
}

/**
 * @deprecated Use `useCombatSelector` + `useCombatDispatch` for new code.
 * This combined context is retained so existing consumers need no changes.
 */
export const CombatContext = createContext<CombatContextValue | null>(null)

/**
 * Returns both state and dispatch from the combined legacy context.
 *
 * Re-renders on every state change. Existing consumers are unaffected;
 * new code should prefer `useCombatSelector` + `useCombatDispatch` to
 * minimise unnecessary re-renders.
 *
 * @throws {Error} When not rendered inside a `CombatProvider`.
 * @returns The live `CombatState` and the `dispatch` function.
 */
export function useCombat() {
  const context = useContext(CombatContext)

  if (!context) {
    throw new Error('useCombat must be used within CombatProvider')
  }

  return context
}

/**
 * Derives a stable value from combat state using a selector function.
 *
 * The component re-renders only when the selector's return value changes
 * by reference equality. Subscribe to only the slice of state required to
 * minimise re-renders caused by unrelated parts of the combat state tree.
 *
 * @example
 * const round = useCombatSelector(s => s.round)
 *
 * @throws {Error} When not rendered inside a `CombatProvider`.
 */
export function useCombatSelector<T>(selector: (state: CombatState) => T): T {
  const state = useContext(CombatStateContext)
  if (state === null) {
    throw new Error('useCombatSelector must be used within CombatProvider')
  }
  return selector(state)
}

/**
 * Returns the stable dispatch function without subscribing to state changes.
 *
 * Use in components that only dispatch actions and never read state, so they
 * are not forced to re-render when unrelated state properties change.
 *
 * @throws {Error} When not rendered inside a `CombatProvider`.
 */
export function useCombatDispatch(): Dispatch<CombatAction> {
  const dispatch = useContext(CombatDispatchContext)
  if (!dispatch) {
    throw new Error('useCombatDispatch must be used within CombatProvider')
  }
  return dispatch
}
