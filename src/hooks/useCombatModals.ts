import { useModal } from './useModal'

/**
 * Aggregates all combat-page modal handles into a single object.
 *
 * Prevents the five independent `useModal()` calls in `CombatAppPage` from
 * cluttering the component body and makes it easy to add or rename modals in
 * one place. Each property follows the `{ isOpen, open, close, toggle }`
 * shape returned by `useModal`.
 */
export function useCombatModals() {
  const create = useModal()
  const exportState = useModal()
  const importState = useModal()
  const endCombat = useModal()
  const library = useModal()

  return { create, exportState, importState, endCombat, library }
}
