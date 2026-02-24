import { Plus, Share, Import, BookOpen } from 'lucide-react'
import { combatReducer, initialCombatState } from './state/combat'
import { CreateCombatant } from './components/combatants/CreateCombatant'
import { CombatantList } from './components/combatants/CombatantList'
import { CombatBar } from './components/CombatBar'
import { ExportModal } from './components/modals/ExportModal'
import { ImportModal } from './components/modals/ImportModal'
import { EndCombatModal } from './components/modals/EndCombatModal'
import { LibraryModal } from './components/library/LibraryModal'
import { Button } from './components/common/Button'
import { useModal } from './hooks/useModal'
import { useImmerReducer } from 'use-immer'

function App() {
  const [state, dispatch] = useImmerReducer(combatReducer, initialCombatState)
  const createModal = useModal()
  const exportModal = useModal()
  const importModal = useModal()
  const endCombatModal = useModal()
  const libraryModal = useModal()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-gray-100 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Combat Tracker</h1>
        <div className="flex gap-3">
          <button
            onClick={libraryModal.open}
            className="text-gray-700 hover:text-gray-900 transition-colors p-2 hover:bg-gray-200 rounded"
            aria-label="Open creature library"
          >
            <BookOpen size={20} />
          </button>
          <button
            onClick={exportModal.open}
            className="text-gray-700 hover:text-gray-900 transition-colors p-2 hover:bg-gray-200 rounded"
            aria-label="Export combat state"
          >
            <Share size={20} />
          </button>
          <button
            onClick={importModal.open}
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

        <Button
          variant="success"
          onClick={createModal.open}
          icon={<Plus size={18} />}
        >
          Add Combatant
        </Button>

        <CreateCombatant
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          onSubmit={(combatant) => {
            dispatch({ type: 'ADD_COMBATANT', payload: combatant })
            createModal.close()
          }}
        />

        <ExportModal
          isOpen={exportModal.isOpen}
          onClose={exportModal.close}
          state={state}
        />

        <ImportModal
          isOpen={importModal.isOpen}
          onClose={importModal.close}
          onImport={(importedState) => {
            dispatch({ type: 'IMPORT_STATE', payload: importedState })
          }}
        />

        <EndCombatModal
          isOpen={endCombatModal.isOpen}
          onClose={endCombatModal.close}
          onConfirm={() => dispatch({ type: 'END_COMBAT' })}
        />

        <LibraryModal
          isOpen={libraryModal.isOpen}
          onClose={libraryModal.close}
          onAddCombatants={(combatants) => {
            if (combatants.length === 0) return
            dispatch({ type: 'ADD_COMBATANTS', payload: combatants })
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
        onEndCombat={() => endCombatModal.open()}
        onNextStep={() => dispatch({ type: 'NEXT_STEP' })}
        onPreviousStep={() => dispatch({ type: 'PREVIOUS_STEP' })}
      />
      </footer>
      
    </div>
  )
}

export default App
