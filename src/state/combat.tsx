import { type PropsWithChildren } from 'react'
import { useImmerReducer } from 'use-immer'
import { CombatContext, CombatStateContext, CombatDispatchContext } from './combatContext'
import { combatReducer, initialCombatState } from './combatState'

/**
 * Initialises and owns the combat state for its entire subtree.
 *
 * Provides three contexts in a single provider:
 * 1. `CombatStateContext` — the Immer-produced state object.
 * 2. `CombatDispatchContext` — the stable dispatch function.
 * 3. `CombatContext` (legacy) — both combined for backward-compatible consumers.
 *
 * Separating state and dispatch means components that only call `dispatch`
 * (e.g. button handlers) will not re-render when unrelated state changes.
 * Components that read state can further reduce re-renders by subscribing
 * via `useCombatSelector` rather than consuming the full state object.
 */
export function CombatProvider({ children }: PropsWithChildren) {
    const [state, dispatch] = useImmerReducer(combatReducer, initialCombatState)

    return (
        <CombatStateContext.Provider value={state}>
            <CombatDispatchContext.Provider value={dispatch}>
                <CombatContext.Provider value={{ state, dispatch }}>
                    {children}
                </CombatContext.Provider>
            </CombatDispatchContext.Provider>
        </CombatStateContext.Provider>
    )
}