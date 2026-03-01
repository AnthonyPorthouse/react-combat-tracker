import { useTranslation } from 'react-i18next'
import { Heart, MoreVertical, Pencil, Swords, Trash2 } from 'lucide-react'
import type { Combatant } from '../../../../types/combatant'
import { DropdownMenu } from '../../../../components/common'
import { RemoveCombatantModal } from '../../modals/RemoveCombatantModal'
import { UpdateHpModal } from '../../modals/UpdateHpModal'
import { EditCombatantModal } from '../../modals/EditCombatantModal'
import { useCombatantActions } from '../../hooks/useCombatantActions'

interface CombatantActionMenuProps {
  combatant: Combatant
  /** Whether the encounter is currently active. Heal/Harm actions are only shown in-combat. */
  inCombat: boolean
  onRemove?: (combatantId: string) => void
  onUpdate?: (combatant: Combatant) => void
}

/**
 * Renders the action dropdown menu and associated modals for a single combatant.
 *
 * Consumes `useCombatantActions` to manage open/closed state for the four
 * modals (remove, heal, harm, edit) and their HP-clamping confirm callbacks.
 * Heal and Harm items are only shown when `inCombat` is true — outside of
 * combat the only available actions are Edit and Remove.
 *
 * The `EditCombatantModal` is keyed on `isEditModalOpen` so the form always
 * remounts with fresh state when the modal reopens.
 */
export function CombatantActionMenu({
  combatant,
  inCombat,
  onRemove,
  onUpdate,
}: CombatantActionMenuProps) {
  const { t } = useTranslation('combat')

  const {
    isRemoveModalOpen,
    openRemoveModal,
    closeRemoveModal,
    isHealModalOpen,
    openHealModal,
    closeHealModal,
    isHarmModalOpen,
    openHarmModal,
    closeHarmModal,
    isEditModalOpen,
    openEditModal,
    closeEditModal,
    handleRemoveConfirm,
    handleHealConfirm,
    handleHarmConfirm,
    handleEditConfirm,
  } = useCombatantActions({ combatant, onRemove, onUpdate })

  return (
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
                  onClick={() => { closeMenu(); openHealModal() }}
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
                  onClick={() => { closeMenu(); openHarmModal() }}
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
              onClick={() => { closeMenu(); openEditModal() }}
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
              onClick={() => { closeMenu(); openRemoveModal() }}
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
        onClose={closeRemoveModal}
        onConfirm={handleRemoveConfirm}
        combatantName={combatant.name}
      />
      <UpdateHpModal
        isOpen={isHealModalOpen}
        onClose={closeHealModal}
        onConfirm={handleHealConfirm}
        combatantName={combatant.name}
        mode="heal"
      />
      <UpdateHpModal
        isOpen={isHarmModalOpen}
        onClose={closeHarmModal}
        onConfirm={handleHarmConfirm}
        combatantName={combatant.name}
        mode="harm"
      />
      <EditCombatantModal
        key={String(isEditModalOpen)}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onConfirm={handleEditConfirm}
        combatant={combatant}
      />
    </>
  )
}
