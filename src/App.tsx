import { useState } from 'react'
import { Plus, Share, Import } from 'lucide-react'
import { combatReducer, initialCombatState } from './state/combat'
import { CreateCombatant } from './components/combatants/CreateCombatant'
import { CombatantList } from './components/combatants/CombatantList'
import { CombatBar } from './components/CombatBar'
import { ExportModal } from './components/ExportModal'
import { ImportModal } from './components/ImportModal'
import { useImmerReducer } from 'use-immer'

function App() {
  const [state, dispatch] = useImmerReducer(combatReducer, initialCombatState)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-gray-100 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Combat Tracker</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="text-gray-700 hover:text-gray-900 transition-colors p-2 hover:bg-gray-200 rounded"
            aria-label="Export combat state"
          >
            <Share size={20} />
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="text-gray-700 hover:text-gray-900 transition-colors p-2 hover:bg-gray-200 rounded"
            aria-label="Import combat state"
          >
            <Import size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start gap-6 p-6">
        <CombatantList
          combatants={state.combatants}
          currentStep={state.step}
          inCombat={state.inCombat}
          dispatch={dispatch}
        />

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Combatant
        </button>

        <CreateCombatant
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(combatant) => {
            dispatch({ type: 'ADD_COMBATANT', payload: combatant })
            setIsCreateModalOpen(false)
          }}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          state={state}
        />

        <ImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={(importedState) => {
            dispatch({ type: 'IMPORT_STATE', payload: importedState })
          }}
        />
      </main>

      <footer>
      <CombatBar
        inCombat={state.inCombat}
        round={state.round}
        step={state.step}
        combatantCount={state.combatants.length}
        onStartCombat={() => dispatch({ type: 'START_COMBAT' })}
        onNextStep={() => dispatch({ type: 'NEXT_STEP' })}
        onPreviousStep={() => dispatch({ type: 'PREVIOUS_STEP' })}
      />
      </footer>
      
    </div>
  )
}

export default App
