import { useState } from 'react'
import type { Creature } from '../../../db/stores/creature'
import type { Combatant } from '../../../types/combatant'
import { creaturesToCombatants } from './useCreaturesFromLibrary'

interface UseConfirmAddFlowOptions {
  /** Dispatches the finalised combatant list to the active encounter. */
  onAddCombatants: (combatants: Combatant[]) => void
  /**
   * Closes the owning library modal after the confirm step completes.
   * Receives the original `onClose` prop — not the modal's internal
   * `handleCloseModal` — to avoid circular dependencies.
   */
  onClose: () => void
  /** Resets the creature selection set in the parent component after the flow completes. */
  onResetSelection: () => void
}

/**
 * Manages the two-step "select → confirm quantities" flow shared by
 * {@link CombatLibraryModal} and {@link LibraryModal}.
 *
 * Step 1 is the creature selection view (the parent modal). Step 2 is
 * `ConfirmAddCreaturesModal` where the DM specifies how many of each
 * creature to add. This hook owns the transition between the two steps.
 *
 * A snapshot of the selected creatures is taken when the confirm modal opens
 * so the quantity form works from stable data even if the live query updates
 * before the DM finishes confirming.
 *
 * @param options.onAddCombatants - Receives the fully expanded combatant list.
 * @param options.onClose - Called after successful confirmation to close the
 *   whole flow.
 * @param options.onResetSelection - Called after successful confirmation to
 *   clear the selected creature ID set in the parent component.
 */
export function useConfirmAddFlow({
  onAddCombatants,
  onClose,
  onResetSelection,
}: UseConfirmAddFlowOptions) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [confirmCreatures, setConfirmCreatures] = useState<Creature[]>([])

  /**
   * Resets the confirm step state. Called by the parent modal's close handler
   * so that closing the library modal without confirming leaves a clean slate.
   */
  const resetConfirm = () => {
    setIsConfirmOpen(false)
    setConfirmCreatures([])
  }

  /**
   * Snapshots the currently selected creatures and opens the confirm modal.
   *
   * Does nothing if the creature list has not yet loaded or no creatures are
   * selected, preventing an empty confirm modal from appearing.
   *
   * @param creatures - The current live creature list from the parent query.
   * @param selectedIds - The set of creature IDs the DM has checked.
   */
  const handleOpenConfirm = (
    creatures: Creature[] | undefined,
    selectedIds: Set<string>,
  ) => {
    if (!creatures) return
    const selected = creatures.filter((c) => selectedIds.has(c.id))
    if (selected.length === 0) return

    setConfirmCreatures(selected)
    setIsConfirmOpen(true)
  }

  /**
   * Expands confirmed creature+quantity pairs into individual combatants and
   * dispatches them to the encounter.
   *
   * Each creature is pushed `quantity` times so the reducer's renumbering
   * logic receives the correct repetition count for auto-naming
   * (e.g. 3× Goblin → "Goblin 1", "Goblin 2", "Goblin 3").
   */
  const handleConfirmAdd = (
    items: { creature: Creature; quantity: number }[],
  ) => {
    const expandedCreatures: Creature[] = []

    items.forEach(({ creature, quantity }) => {
      for (let i = 0; i < quantity; i += 1) {
        expandedCreatures.push(creature)
      }
    })

    onAddCombatants(creaturesToCombatants(expandedCreatures))
    onResetSelection()
    resetConfirm()
    onClose()
  }

  /** Closes the confirm modal and returns to the creature selection step. */
  const handleCancelConfirm = () => {
    setIsConfirmOpen(false)
  }

  return {
    isConfirmOpen,
    confirmCreatures,
    handleOpenConfirm,
    handleConfirmAdd,
    handleCancelConfirm,
    resetConfirm,
  }
}
