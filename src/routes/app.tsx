import { createFileRoute } from '@tanstack/react-router'
import { Plus, Share, Import, BookOpen } from 'lucide-react'
import {
  CombatantList,
  CombatBar,
  CreateCombatant,
  ExportModal,
  ImportModal,
  EndCombatModal,
  CombatLibraryModal,
} from '../features/combat'
import { Button } from '../components/common'
import { useModal } from '../hooks'
import { useCombat } from '../state/combatContext'

export const Route = createFileRoute('/app')({
  component: CombatAppPage,
})

/**
 * The primary combat tracking page at `/app`.
 *
 * Owns the modal visibility state for all combat-related dialogs (create
 * combatant, export, import, end combat, library browser) and wires their
 * open/close callbacks to the shared `useCombat` context so every modal
 * dispatches into the same reducer instance. Keeping modal state local to
 * this page (rather than in the reducer) avoids polluting the serialisable
 * combat state with transient UI flags.
 */
function CombatAppPage() {
  const { state, dispatch } = useCombat()
  const createModal = useModal()
  const exportModal = useModal()
  const importModal = useModal()
  const endCombatModal = useModal()
  const libraryModal = useModal()

  return (
    <div className="flex flex-col min-h-[70vh] rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Combat Tracker</h2>
          <p className="text-sm text-slate-500">Manage the current encounter in one place.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={libraryModal.open}
            className="text-slate-700 hover:text-slate-900 transition-colors px-3 py-2 hover:bg-slate-100 rounded-full flex items-center gap-2 text-sm font-medium"
            aria-label="Open creature library"
          >
            <BookOpen size={18} />
            Library
          </button>
          <button
            onClick={exportModal.open}
            className="text-slate-700 hover:text-slate-900 transition-colors px-3 py-2 hover:bg-slate-100 rounded-full flex items-center gap-2 text-sm font-medium"
            aria-label="Export combat state"
          >
            <Share size={18} />
            Export
          </button>
          <button
            onClick={importModal.open}
            className="text-slate-700 hover:text-slate-900 transition-colors px-3 py-2 hover:bg-slate-100 rounded-full flex items-center gap-2 text-sm font-medium"
            aria-label="Import combat state"
          >
            <Import size={18} />
            Import
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-start gap-6 p-6">
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

        <CombatLibraryModal
          isOpen={libraryModal.isOpen}
          onClose={libraryModal.close}
          onAddCombatants={(combatants) => {
            if (combatants.length === 0) return
            dispatch({ type: 'ADD_COMBATANTS', payload: combatants })
          }}
        />
      </div>

      <footer className='justify-end'>
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
