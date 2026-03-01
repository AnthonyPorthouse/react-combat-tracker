import { useMemo, useCallback, type Dispatch } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Combatant } from '../../../../types/combatant'
import { slideUpVariants, transitions, shouldAnimate } from '../../../../utils/motion'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { CombatAction } from '../../../../state/combatState'
import { useDndSensors } from '../../../../hooks'
import { SortableCombatantItem } from './SortableCombatantItem'

type CombatDispatch = Dispatch<CombatAction>

interface CombatantListProps {
  combatants: Combatant[]
  currentStep: number
  inCombat: boolean
  dispatch: CombatDispatch
}

/**
 * Renders the full sortable list of combatants for the current encounter.
 *
 * Wraps the combatant rows in a `DndContext` + `SortableContext` from
 * @dnd-kit so the DM can drag combatants into a custom order during combat.
 * Two sensors are configured:
 * - `PointerSensor` with an 8px distance threshold — prevents accidental
 *   drags when the user intends to click an action button.
 * - `TouchSensor` with a 250ms delay and 5px tolerance — mobile browsers
 *   intercept touch events for native scrolling before PointerSensor fires,
 *   so a dedicated TouchSensor is needed. The 250ms delay gives the browser
 *   time to distinguish a scroll gesture from a drag intent; the 5px tolerance
 *   allows minor finger movement during the hold without cancelling the drag.
 * - `KeyboardSensor` — enables drag-and-drop for keyboard-only users.
 *
 * Drag-and-drop is disabled (`disabled={!inCombat}`) before combat starts,
 * because pre-combat ordering is overridden by the initiative sort on
 * `START_COMBAT`. Post-sort manual reordering is intentional (e.g. to
 * handle tied initiative values).
 *
 * The component returns `undefined` when the list is empty rather than an
 * empty container, so the parent can conditionally render call-to-action
 * content in the same space.
 */
export function CombatantList({
  combatants,
  currentStep,
  inCombat,
  dispatch,
}: CombatantListProps) {
  const sensors = useDndSensors()

  const combatantIds = useMemo(() => combatants.map((c) => c.id), [combatants])

  /**
   * Translates a dnd-kit drag-end event into a `REORDER_COMBATANTS` dispatch.
   *
   * `arrayMove` from @dnd-kit/sortable is used instead of manual splice logic
   * to correctly handle index calculations when dragging forwards vs backwards
   * in the list. The dispatch only fires when the item has actually moved to a
   * different position (`active.id !== over.id`).
   */
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

  /**
   * Returns true if the combatant at `index` holds the current turn.
   *
   * `step` is 1-indexed in the state (step 1 = first combatant) while array
   * indices are 0-indexed, so `step - 1 === index` is the correct comparison.
   * Only meaningful during active combat — always false otherwise.
   */
  const isCurrentTurn = (index: number): boolean => {
    return inCombat && currentStep - 1 === index
  }

  /**
   * Stable remove callback memoised with `useCallback` so that `React.memo`
   * on `SortableCombatantItem` can pass its equality check — an inline arrow
   * function would be a new reference on every render.
   *
   * `dispatch` from `useImmerReducer` has a stable identity, so the callback
   * itself never changes unless the parent re-mounts.
   */
  const handleRemove = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_COMBATANT', payload: id }),
    [dispatch],
  )

  /** Stable update callback. See `handleRemove` for rationale. */
  const handleUpdate = useCallback(
    (updated: Combatant) => dispatch({ type: 'UPDATE_COMBATANT', payload: updated }),
    [dispatch],
  )

  /**
   * Whether per-item enter/exit animations should run for this list.
   * Suppressed above `ANIMATION_THRESHOLD` to avoid blocking the main thread
   * with simultaneous Framer Motion layout recalculations during turn advances
   * when the encounter has many combatants.
   */
  const animateItems = shouldAnimate(combatants.length)

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
          <ol className="flex flex-col gap-3 list-none">
            {animateItems ? (
              <AnimatePresence initial={false}>
              {combatants.map((combatant, index) => (
                <motion.li
                  key={combatant.id}
                  variants={slideUpVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transitions.item}
                >
                  <SortableCombatantItem
                    combatant={combatant}
                    isCurrentTurn={isCurrentTurn(index)}
                    inCombat={inCombat}
                    onRemove={handleRemove}
                    onUpdate={handleUpdate}
                  />
                </motion.li>
              ))}
              </AnimatePresence>
            ) : (
              combatants.map((combatant, index) => (
                <li key={combatant.id}>
                  <SortableCombatantItem
                    combatant={combatant}
                    isCurrentTurn={isCurrentTurn(index)}
                    inCombat={inCombat}
                    onRemove={handleRemove}
                    onUpdate={handleUpdate}
                  />
                </li>
              ))
            )}
          </ol>
        </SortableContext>
      </DndContext>
    </div>
  )
}
