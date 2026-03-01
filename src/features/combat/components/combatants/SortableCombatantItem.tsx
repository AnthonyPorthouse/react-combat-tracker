import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'
import type { Combatant } from '../../../../types/combatant'
import { CombatantItem } from './CombatantItem'

interface SortableCombatantItemProps {
  combatant: Combatant
  isCurrentTurn: boolean
  inCombat: boolean
  onRemove: (id: string) => void
  onUpdate: (combatant: Combatant) => void
}

/**
 * Wraps `CombatantItem` with dnd-kit sortable behaviour.
 *
 * Owns the `useSortable` hook call so that `CombatantItem` itself remains
 * usable outside a `DndContext` (e.g. in the read-only player view). The
 * drag handle button is constructed here (where the dnd-kit listeners live)
 * and passed to `CombatantItem` via the `dragHandle` prop.
 *
 * Exists as a named component (not an inline arrow) because React requires a
 * stable component reference for the reconciler to correctly pair drag state
 * to the right item during animated reorders.
 *
 * Wrapped with `React.memo` so turn advances that change `isCurrentTurn` for
 * only one row do not force every other combatant to re-render. Requires
 * stable `onRemove` and `onUpdate` references from the parent (provided via
 * `useCallback`) for the memo equality check to succeed.
 */
export const SortableCombatantItem = memo(function SortableCombatantItem({
  combatant,
  isCurrentTurn,
  inCombat,
  onRemove,
  onUpdate,
}: SortableCombatantItemProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: combatant.id })
  const { t } = useTranslation('combat')

  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const dragHandle = inCombat ? (
    <button
      className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
      aria-label={t('dragCombatant')}
    >
      <GripVertical size={20} />
    </button>
  ) : undefined

  return (
    <CombatantItem
      combatant={combatant}
      isCurrentTurn={isCurrentTurn}
      inCombat={inCombat}
      onRemove={onRemove}
      onUpdate={onUpdate}
      dragRef={setNodeRef}
      dragStyle={dragStyle}
      dragHandle={dragHandle}
    />
  )
})
