import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronRight, Heart, MoreVertical, Pencil, Swords, Trash2 } from 'lucide-react'
import type { Combatant } from '../../../../types/combatant'
import { RemoveCombatantModal } from '../../modals/RemoveCombatantModal'
import { UpdateHpModal } from '../../modals/UpdateHpModal'
import { EditCombatantModal } from '../../modals/EditCombatantModal'
import { DropdownMenu } from '../../../../components/common'

interface CombatantItemProps {
  combatant: Combatant
  isCurrentTurn: boolean
  inCombat: boolean
  /** Controls which elements are rendered.
   * - `'gm'` (default): full interface — drag handle, initiative, action menu.
   * - `'player'`: read-only view — name, turn indicator, HP bar only. */
  mode?: 'gm' | 'player'
  onRemove?: (combatantId: string) => void
  onUpdate?: (combatant: Combatant) => void
  /** Ref callback injected by `SortableCombatantItem` for dnd-kit DOM tracking. */
  dragRef?: (el: HTMLElement | null) => void
  /** Transform/transition/opacity styles injected by `SortableCombatantItem`. */
  dragStyle?: React.CSSProperties
  /** The drag handle button element, rendered by `SortableCombatantItem`
   *  so that dnd-kit listeners stay out of this component. */
  dragHandle?: React.ReactNode
}

/**
 * Renders a single combatant row in the combat list.
 *
 * Supports two display modes via the `mode` prop:
 * - **`'gm'`** (default): Full DM interface — initiative label, drag handle,
 *   Heal/Harm/Remove action menu.
 * - **`'player'`**: Read-only view — name, turn indicator, HP bar only.
 *   All GM-only info is hidden so the component can be safely rendered in
 *   the player-facing popout window without leaking sensitive data.
 *
 * Drag-and-drop state (ref, transform, listeners) is injected by the parent
 * `SortableCombatantItem` wrapper rather than called here. This keeps
 * `CombatantItem` usable outside a `DndContext` (e.g. the player view).
 *
 * The `▶` chevron marks the active turn. The HP bar (shown when `inCombat`)
 * transitions green → yellow → red via HSL hue interpolation.
 */
export function CombatantItem({
  combatant,
  isCurrentTurn,
  inCombat,
  mode = 'gm',
  onRemove,
  onUpdate,
  dragRef,
  dragStyle,
  dragHandle,
}: CombatantItemProps) {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const [isHealModalOpen, setIsHealModalOpen] = useState(false)
  const [isHarmModalOpen, setIsHarmModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { t } = useTranslation('combat')

  /**
   * Builds the initiative display string for the combatant's sub-label.
   *
   * For `roll` combatants the initiative is still a modifier (positive or
   * negative), so an explicit sign is shown. For `fixed` combatants the
   * number is the resolved initiative value and needs no sign prefix.
   */
  const getInitiativeLabel = (): string => {
    const initiativeValue =
      combatant.initiativeType === 'fixed'
        ? `${combatant.initiative}`
        : `${combatant.initiative >= 0 ? '+' : ''}${combatant.initiative}`
    return t('common:initSummary', { value: initiativeValue })
  }

  const hpPct = combatant.maxHp > 0 ? Math.min(combatant.hp / combatant.maxHp, 1) : 0
  const hpHue = hpPct * 120

  return (
    <div
      ref={dragRef}
      style={dragStyle}
      className="bg-white border border-gray-200 rounded transition-shadow overflow-hidden"
    >
      <div className="p-3 flex items-center gap-4">
        {mode === 'gm' && (
          <div className="flex items-center gap-2 w-16 text-gray-600">
            <div className="w-6 flex items-center justify-center">
              {dragHandle}
            </div>
            <div className="w-6 flex items-center justify-center font-bold">
              <AnimatePresence>
                {isCurrentTurn && (
                  <motion.span
                    className="inline-flex"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  >
                    <ChevronRight size={20} aria-label={t('combatantsTurn', { name: combatant.name })} aria-current="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {mode === 'player' && (
          <div className="w-6 flex items-center justify-center font-bold text-gray-600">
            <AnimatePresence>
              {isCurrentTurn && (
                <motion.span
                  className="inline-flex"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <ChevronRight size={20} aria-label={t('combatantsTurn', { name: combatant.name })} aria-current="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{combatant.name}</div>
          {mode === 'gm' && (
            <div className="text-sm text-gray-500">{getInitiativeLabel()}</div>
          )}
        </div>

        {mode === 'gm' && (
          <>
            <DropdownMenu
              triggerLabel={t('combatantActions', { name: combatant.name })}
              triggerContent={<MoreVertical size={18} />}
              triggerClassName="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
              menuClassName="max-w-64 min-w-46"
            >
              {(closeMenu) => (
                <>
                  {inCombat && (
                    <>
                      <button
                        type="button"
                        onClick={() => { closeMenu(); setIsHealModalOpen(true) }}
                        className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                        role="menuitem"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Heart size={14} />
                          {t('heal')}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { closeMenu(); setIsHarmModalOpen(true) }}
                        className="w-full text-left px-3 py-2 text-sm text-amber-600 hover:bg-amber-50"
                        role="menuitem"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Swords size={14} />
                          {t('harm')}
                        </span>
                      </button>
                      <hr className="my-1 border-gray-200" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => { closeMenu(); setIsEditModalOpen(true) }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Pencil size={14} />
                      {t('editCombatant')}
                    </span>
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu()
                      setIsRemoveModalOpen(true)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    role="menuitem"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trash2 size={14} />
                      {t('removeCombatant')}
                    </span>
                  </button>
                </>
              )}
            </DropdownMenu>

            <RemoveCombatantModal
              isOpen={isRemoveModalOpen}
              onClose={() => setIsRemoveModalOpen(false)}
              onConfirm={() => onRemove?.(combatant.id)}
              combatantName={combatant.name}
            />
            <UpdateHpModal
              isOpen={isHealModalOpen}
              onClose={() => setIsHealModalOpen(false)}
              onConfirm={(amount) => onUpdate?.({ ...combatant, hp: Math.min(combatant.maxHp, combatant.hp + amount) })}
              combatantName={combatant.name}
              mode="heal"
            />
            <UpdateHpModal
              isOpen={isHarmModalOpen}
              onClose={() => setIsHarmModalOpen(false)}
              onConfirm={(amount) => onUpdate?.({ ...combatant, hp: Math.max(0, combatant.hp - amount) })}
              combatantName={combatant.name}
              mode="harm"
            />
            <EditCombatantModal
              key={String(isEditModalOpen)}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onConfirm={(updated) => onUpdate?.(updated)}
              combatant={combatant}
            />
          </>
        )}
      </div>

      {inCombat && (
        <div
          role="progressbar"
          aria-valuenow={combatant.hp}
          aria-valuemin={0}
          aria-valuemax={combatant.maxHp}
          aria-label={t('combatantHitPoints', { name: combatant.name, hp: combatant.hp, maxHp: combatant.maxHp })}
          className="h-1 w-full bg-gray-100"
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${hpPct * 100}%`,
              backgroundColor: `hsl(${hpHue}, 70%, 45%)`,
            }}
          />
        </div>
      )}
    </div>
  )
}


