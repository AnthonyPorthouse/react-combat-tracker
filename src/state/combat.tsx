import { type PropsWithChildren } from 'react'
import { useImmerReducer } from 'use-immer'
import { CombatContext } from './combatContext'
import { combatReducer, initialCombatState } from './combatState'

/**
 * Initialises and owns the combat state for its entire subtree.
 *
 * Wraps `useImmerReducer` so that reducer cases can mutate a draft directly
 * rather than returning new objects — keeping the reducer logic concise for
 * the complex, nested state changes involved in turn management. The context
 * value is stable across renders unless state actually changes.
 *
 * Place this as high in the tree as needed so all combat-aware components
 * (combatant list, combat bar, modals) share the same instance.
 */
export function CombatProvider({ children }: PropsWithChildren) {
    const [state, dispatch] = useImmerReducer(combatReducer, initialCombatState)

    return (
        <CombatContext.Provider value={{ state, dispatch }}>
            {children}
        </CombatContext.Provider>
    )
}