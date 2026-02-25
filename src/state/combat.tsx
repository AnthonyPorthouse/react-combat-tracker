import { type PropsWithChildren } from 'react'
import { useImmerReducer } from 'use-immer'
import { CombatContext } from './combatContext'
import { combatReducer, initialCombatState } from './combatState'

export function CombatProvider({ children }: PropsWithChildren) {
    const [state, dispatch] = useImmerReducer(combatReducer, initialCombatState)

    return (
        <CombatContext.Provider value={{ state, dispatch }}>
            {children}
        </CombatContext.Provider>
    )
}