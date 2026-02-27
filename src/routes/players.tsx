import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createFileRoute } from '@tanstack/react-router'
import { Swords } from 'lucide-react'
import type { CombatState } from '../state/combatState'
import { CombatantItem } from '../features/combat/components/combatants/CombatantItem'

export const Route = createFileRoute('/players')({
  component: PlayerViewPage,
})

/**
 * Read-only combat view at `/players`, intended to be opened as a popout
 * window by the GM for display on a secondary screen.
 *
 * State is received exclusively via the `postMessage` API from the GM's
 * combat window (`/app`). On mount, this page signals `player-view:ready`
 * to `window.opener` so the GM window can immediately send the current
 * combat snapshot. Subsequent state changes in the GM window are pushed as
 * `player-view:state` messages, keeping this view in real-time sync without
 * any polling or shared storage.
 *
 * Before combat starts (`!state.inCombat`) a waiting placeholder is shown
 * so players see a clean screen rather than an empty list. Once combat begins,
 * each combatant is rendered with `CombatantItem` in `mode="player"`, which
 * suppresses initiative numbers, drag handles, and the action menu.
 */
function PlayerViewPage() {
  const { t } = useTranslation('combat')
  const [state, setState] = useState<CombatState | null>(null)

  useEffect(() => {
    // Signal to the opener that this window is ready to receive state.
    // The GM window listens for this and responds with the current snapshot.
    if (window.opener) {
      window.opener.postMessage({ type: 'player-view:ready' }, window.location.origin)
    }

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'player-view:state') {
        setState(e.data.state as CombatState)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const isWaiting = !state || !state.inCombat

  return (
    <div className="flex flex-col gap-4 p-6">
      <title>{t('playerViewPageTitle')}</title>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Swords size={20} />
          {t('combat')}
        </h1>
        {state?.inCombat && (
          <span className="text-sm font-medium text-slate-500">
            {t('round', { round: state.round })}
          </span>
        )}
      </div>

      {isWaiting ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
          <Swords size={40} strokeWidth={1} />
          <p className="text-sm font-medium">{t('waitingForCombat')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {state.combatants.map((combatant, index) => (
            <CombatantItem
              key={combatant.id}
              combatant={combatant}
              isCurrentTurn={state.step - 1 === index}
              inCombat={state.inCombat}
              mode="player"
            />
          ))}
        </div>
      )}
    </div>
  )
}
