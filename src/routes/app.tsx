import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createFileRoute } from '@tanstack/react-router'
import { Plus, Share, Import, BookOpen, Monitor } from 'lucide-react'
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
import { useCombatModals } from '../hooks'
import { useCombat } from '../state/combatContext'
import { PLAYER_VIEW_WIDTH, PLAYER_VIEW_HEIGHT } from '../utils/constants'

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
 *
 * Also manages the player-facing popout window (`/players`). A `useRef`
 * stores the popup `Window` handle so it can be focused or re-used across
 * renders. Two effects handle the `postMessage` sync:
 * 1. On every state change, push the latest state to the popup if it's open.
 * 2. Listen for `player-view:ready` from the popup (sent on its mount) and
 *    respond immediately with the current state, ensuring the popup always
 *    has data even if it opened before the first state change.
 */
function CombatAppPage() {
  const { state, dispatch } = useCombat()
  const modals = useCombatModals()
  const playerWindowRef = useRef<Window | null>(null)
  const { t } = useTranslation('combat')

  /** Push the latest state to the player popup whenever combat state changes. */
  useEffect(() => {
    const win = playerWindowRef.current
    if (win && !win.closed) {
      win.postMessage({ type: 'player-view:state', state }, window.location.origin)
    }
  }, [state])

  /** Respond to the popup's ready signal with the current state snapshot. */
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'player-view:ready') {
        playerWindowRef.current?.postMessage(
          { type: 'player-view:state', state },
          window.location.origin
        )
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [state])

  /**
   * Opens the player view popup, or focuses it if already open.
   *
   * The named window (`'player-view'`) ensures only one popup exists at a
   * time — subsequent calls with the same name re-use the existing window
   * rather than spawning a new one. The fixed size (400×600) is appropriate
   * for a narrow combat list displayed on a secondary screen.
   */
  const openPlayerView = () => {
    const existing = playerWindowRef.current
    if (existing && !existing.closed) {
      existing.focus()
      return
    }
    const w = PLAYER_VIEW_WIDTH, h = PLAYER_VIEW_HEIGHT
    const left = Math.round(screen.width / 2 - w / 2)
    const top = Math.round(screen.height / 2 - h / 2)
    playerWindowRef.current = window.open(
      '/players',
      'player-view',
      `width=${w},height=${h},left=${left},top=${top},popup`
    )
  }

  return (
    <div className="flex flex-col min-h-[70vh] rounded-3xl border border-slate-200 bg-white shadow-sm overflow-clip">
      <title>Combat Tracker | Combat</title>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t('pageTitle')}</h1>
          <p className="text-sm text-slate-500">{t('pageDescription')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            onClick={openPlayerView}
            icon={<Monitor size={18} />}
            aria-label={t('openPlayerView')}
            className="rounded-full"
          >
            {t('playerView')}
          </Button>
          <Button
            variant="ghost"
            onClick={modals.library.open}
            icon={<BookOpen size={18} />}
            aria-label={t('openLibrary')}
            className="rounded-full"
          >
            {t('library')}
          </Button>
          <Button
            variant="ghost"
            onClick={modals.exportState.open}
            icon={<Share size={18} />}
            aria-label={t('exportCombat')}
            className="rounded-full"
          >
            {t('export')}
          </Button>
          <Button
            variant="ghost"
            onClick={modals.importState.open}
            icon={<Import size={18} />}
            aria-label={t('importCombat')}
            className="rounded-full"
          >
            {t('import')}
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-start gap-6 p-6">
        <CombatantList
          combatants={state.combatants}
          currentStep={state.step}
          inCombat={state.inCombat}
          dispatch={dispatch}
        />

        <Button
          variant="success"
          onClick={modals.create.open}
          icon={<Plus size={18} />}
        >
          {t('addCombatant')}
        </Button>

        <CreateCombatant
          isOpen={modals.create.isOpen}
          onClose={modals.create.close}
          onSubmit={(combatant) => {
            dispatch({ type: 'ADD_COMBATANT', payload: combatant })
            modals.create.close()
          }}
        />

        <ExportModal
          isOpen={modals.exportState.isOpen}
          onClose={modals.exportState.close}
          state={state}
        />

        <ImportModal
          isOpen={modals.importState.isOpen}
          onClose={modals.importState.close}
          onImport={(importedState) => {
            dispatch({ type: 'IMPORT_STATE', payload: importedState })
          }}
        />

        <EndCombatModal
          isOpen={modals.endCombat.isOpen}
          onClose={modals.endCombat.close}
          onConfirm={() => dispatch({ type: 'END_COMBAT' })}
        />

        <CombatLibraryModal
          isOpen={modals.library.isOpen}
          onClose={modals.library.close}
          onAddCombatants={(combatants) => {
            if (combatants.length === 0) return
            dispatch({ type: 'ADD_COMBATANTS', payload: combatants })
          }}
        />
      </main>

      <footer className='justify-end'>
        <CombatBar
          inCombat={state.inCombat}
          round={state.round}
          step={state.step}
          combatantCount={state.combatants.length}
          onStartCombat={() => dispatch({ type: 'START_COMBAT' })}
          onEndCombat={() => modals.endCombat.open()}
          onNextStep={() => dispatch({ type: 'NEXT_STEP' })}
          onPreviousStep={() => dispatch({ type: 'PREVIOUS_STEP' })}
        />
      </footer>
    </div>
  )
}
