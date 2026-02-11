import { useMemo, type Dispatch } from 'react'
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
import './CombatantList.css'
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
      className="combatant-item"
      {...attributes}
      {...listeners}
    >
      <div className="combatant-marker">
        {isCurrentTurn && <span>→</span>}
      </div>
      <div className="combatant-name">{combatant.name}</div>
      <div className="combatant-hp">{getHpPercentage(combatant.hp, combatant.maxHp)}</div>
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

  return (
    <div className="combatant-list">
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
