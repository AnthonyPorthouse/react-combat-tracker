import { useMemo, type Dispatch } from 'react'
import type { Combatant } from '../../../../types/combatant'
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
import type { CombatAction } from '../../../../state/combatState'
import { CombatantItem } from './CombatantItem'

type CombatDispatch = Dispatch<CombatAction>

interface CombatantListProps {
  combatants: Combatant[]
  currentStep: number
  inCombat: boolean
  dispatch: CombatDispatch
}

function SortableCombatantItem({ combatant, isCurrentTurn, inCombat, onRemove }: { combatant: Combatant; isCurrentTurn: boolean; inCombat: boolean; onRemove: (id: string) => void }) {
  return <CombatantItem combatant={combatant} isCurrentTurn={isCurrentTurn} inCombat={inCombat} onRemove={onRemove} />
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
              inCombat={inCombat}
              onRemove={(id) => dispatch({ type: 'REMOVE_COMBATANT', payload: id })}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
