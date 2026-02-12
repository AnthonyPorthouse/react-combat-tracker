import { ChevronRight, GripVertical } from 'lucide-react'
import type { Combatant } from '../../types/combatant'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface CombatantItemProps {
  combatant: Combatant
  isCurrentTurn: boolean
  inCombat: boolean
}

export function CombatantItem({ combatant, isCurrentTurn, inCombat }: CombatantItemProps) {
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

  const getHpPercentage = (hp: number, maxHp: number): string => {
    if (maxHp === 0) return '0%'
    return `${Math.round((hp / maxHp) * 100)}%`
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 bg-white border border-gray-200 rounded transition-shadow flex items-center gap-3"
    >
      {inCombat && (
        <button
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing flex-shrink-0"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </button>
      )}
      {!inCombat && <div className="w-6" />}
      <div className="text-gray-600 font-bold w-6">
        {isCurrentTurn && <ChevronRight size={20} />}
      </div>
      <div className="flex-1 font-medium text-gray-900">{combatant.name}</div>
      <div className="text-gray-600 text-sm font-semibold">{getHpPercentage(combatant.hp, combatant.maxHp)}</div>
    </div>
  )
}
