import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

/**
 * Configures and returns the dnd-kit sensor set used for drag-and-drop
 * reordering throughout the application.
 *
 * Three sensors are registered:
 * - `PointerSensor` with an 8 px distance threshold — prevents accidental
 *   drags when the user intends to click an action button.
 * - `TouchSensor` with a 250 ms delay and 5 px tolerance — mobile browsers
 *   intercept touch events for native scrolling before `PointerSensor` fires,
 *   so a dedicated `TouchSensor` is required. The 250 ms delay gives the
 *   browser time to distinguish a scroll gesture from a drag intent; the 5 px
 *   tolerance allows minor finger movement during the hold without cancelling.
 * - `KeyboardSensor` — enables drag-and-drop for keyboard-only users, using
 *   `sortableKeyboardCoordinates` from @dnd-kit/sortable for correct
 *   up/down navigation within a vertical sortable list.
 *
 * Extracted from `CombatantList` so that any future sortable list can reuse
 * the same consistent sensor configuration without copy-pasting the block.
 *
 * @returns The sensor array to pass to `DndContext` `sensors` prop.
 */
export function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
}
