import { useMemo, type Dispatch } from 'react'
import { ChevronRight } from 'lucide-react'
import type { Combatant } from '../../types/combatant'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CombatAction } from '../../state/combat'

type CombatDispatch = Dispatch<CombatAction>

interface CombatantListProps {
  combatants: Combatant[]
  currentStep: number
  inCombat: boolean
  dispatch: CombatDispatch
}

interface SortableCombatantItemProps {
  combatant: Combatant
  isCurrentTurn: boolean
}

function SortableCombatantItem({ combatant, isCurrentTurn }: SortableCombatantItemProps) {
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
      className="p-3 bg-white border border-gray-200 rounded cursor-grab hover:cursor-grabbing hover:shadow-md transition-shadow flex items-center gap-3"
      {...attributes}
      {...listeners}
    >
      <div className="text-gray-600 font-bold w-6">
        {isCurrentTurn && <ChevronRight size={20} />}
      </div>
      <div className="flex-1 font-medium text-gray-900">{combatant.name}</div>
      <div className="text-gray-600 text-sm font-semibold">{getHpPercentage(combatant.hp, combatant.maxHp)}</div>
    </div>
  )
}

export function CombatantList({
  combatants,
  currentStep,
  inCombat,
  dispatch,
}: CombatantListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const combatantIds = useMemo(() => combatants.map((c) => c.id), [combatants])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = combatants.findIndex((c) => c.id === active.id)
      const newIndex = combatants.findIndex((c) => c.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(combatants, oldIndex, newIndex)
        dispatch({ type: 'REORDER_COMBATANTS', payload: newOrder })
      }
    }
  }

  const isCurrentTurn = (index: number): boolean => {
    return inCombat && currentStep - 1 === index
  }

  if (combatants.length === 0) {
    return;
  }

  return (
    <div className="flex flex-col gap-3 w-full md:max-w-sm p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={combatantIds}
          strategy={verticalListSortingStrategy}
          disabled={!inCombat}
        >
          {combatants.map((combatant, index) => (
            <SortableCombatantItem
              key={combatant.id}
              combatant={combatant}
              isCurrentTurn={isCurrentTurn(index)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
