import { createContext, useContext, type Dispatch } from 'react'
import type { CombatAction, CombatState } from './combatState'

interface CombatContextValue {
  state: CombatState
  dispatch: Dispatch<CombatAction>
}

/**
 * The React context that carries live combat state and its dispatcher
 * down the component tree without prop-drilling.
 *
 * Initialised to `null` so that `useCombat` can detect when a consumer
 * is mistakenly rendered outside the `CombatProvider`.
 */
export const CombatContext = createContext<CombatContextValue | null>(null)

/**
 * Retrieves the current combat state and dispatch function from context.
 *
 * Throws immediately if called outside a `CombatProvider` subtree, making
 * misuse a loud, early failure rather than a silent runtime bug where
 * state appears to exist but is actually the initial null value.
 *
 * @throws {Error} When not rendered inside a `CombatProvider`.
 * @returns The live `CombatState` and the `dispatch` function for triggering actions.
 */
export function useCombat() {
  const context = useContext(CombatContext)

  if (!context) {
    throw new Error('useCombat must be used within CombatProvider')
  }

  return context
}
