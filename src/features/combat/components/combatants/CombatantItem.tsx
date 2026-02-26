import { useState } from 'react'
import { ChevronRight, GripVertical, MoreVertical, Trash2 } from 'lucide-react'
import type { Combatant } from '../../../../types/combatant'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { RemoveCombatantModal } from '../../modals/RemoveCombatantModal'
import { DropdownMenu } from '../../../../components/common'

interface CombatantItemProps {
  combatant: Combatant
  isCurrentTurn: boolean
  inCombat: boolean
  onRemove: (combatantId: string) => void
}

/**
 * Renders a single combatant row in the combat list.
 *
 * Each row shows the combatant's initiative, name, and a ⋮ action menu.
 * A `▶` chevron marks the currently active turn so the DM can instantly
 * see whose turn it is without reading initiative numbers.
 *
 * The drag handle (`⋮⋮`) is only shown during active combat — before combat
 * starts, initiative order hasn't been locked in and reordering is handled
 * implicitly by the `START_COMBAT` sort. During combat the DM may want to
 * manually reorder combatants (e.g. for late arrivals or initiative ties).
 *
 * Initiative is displayed differently by type:
 * - `fixed` — shown as a plain number (e.g. "Init: 15")
 * - `roll` — shown with an explicit sign (e.g. "Init: +3") to clarify it is
 *   still a modifier, not a resolved roll
 */
export function CombatantItem({ combatant, isCurrentTurn, inCombat, onRemove }: CombatantItemProps) {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: combatant.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

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
    return `Init: ${initiativeValue}`
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 bg-white border border-gray-200 rounded transition-shadow flex items-center gap-4"
    >
      <div className="flex items-center gap-2 w-16 text-gray-600">
        <div className="w-6 flex items-center justify-center">
          {inCombat && (
            <button
              className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
              aria-label="Drag combatant"
            >
              <GripVertical size={20} />
            </button>
          )}
        </div>
        <div className="w-6 flex items-center justify-center font-bold">
          {isCurrentTurn && <ChevronRight size={20} />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">{combatant.name}</div>
        <div className="text-sm text-gray-500">{getInitiativeLabel()}</div>
      </div>

      <DropdownMenu
        triggerLabel="Combatant actions"
        triggerContent={<MoreVertical size={18} />}
        triggerClassName="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
        menuClassName="max-w-64 min-w-46"
      >
        {(closeMenu) => (
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
              Remove combatant
            </span>
          </button>
        )}
      </DropdownMenu>

      <RemoveCombatantModal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        onConfirm={() => onRemove(combatant.id)}
        combatantName={combatant.name}
      />
    </div>
  )
}
