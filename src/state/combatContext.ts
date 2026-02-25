import { createContext, useContext, type Dispatch } from 'react'
import type { CombatAction, CombatState } from './combatState'

interface CombatContextValue {
  state: CombatState
  dispatch: Dispatch<CombatAction>
}

export const CombatContext = createContext<CombatContextValue | null>(null)

export function useCombat() {
  const context = useContext(CombatContext)

  if (!context) {
    throw new Error('useCombat must be used within CombatProvider')
  }

  return context
}
