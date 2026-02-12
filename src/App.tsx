import { useState } from 'react'
import { combatReducer, initialCombatState } from './state/combat'
import { CreateCombatant } from './components/combatants/CreateCombatant'
import { CombatantList } from './components/combatants/CombatantList'
import { CombatBar } from './components/CombatBar'
import { useImmerReducer } from 'use-immer'
import './App.css'

function App() {
  const [state, dispatch] = useImmerReducer(combatReducer, initialCombatState)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Combat Tracker</h1>
      </header>

      <CombatBar
        inCombat={state.inCombat}
        round={state.round}
        step={state.step}
        onStartCombat={() => dispatch({ type: 'START_COMBAT' })}
        onNextStep={() => dispatch({ type: 'NEXT_STEP' })}
        onPreviousStep={() => dispatch({ type: 'PREVIOUS_STEP' })}
      />

      <main className="app-main">
        <CombatantList
          combatants={state.combatants}
          currentStep={state.step}
          inCombat={state.inCombat}
          dispatch={dispatch}
        />

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="add-combatant-button"
        >
          + Add Combatant
        </button>

        <CreateCombatant
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(combatant) => {
            dispatch({ type: 'ADD_COMBATANT', payload: combatant })
            setIsCreateModalOpen(false)
          }}
        />
      </main>
    </div>
  )
}

export default App
