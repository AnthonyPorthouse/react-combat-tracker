import { useState, useCallback } from 'react'
import { useModal } from './useModal'
import { useSelection } from './useSelection'

interface UseListWithSelectionOptions {
  /** The IDs of all currently visible items. Passed directly to `useSelection`. */
  items: string[]
  /**
   * Called with the IDs to delete during a bulk-delete confirmation.
   * The hook handles closing the modal and clearing the selection afterwards.
   * Callers are responsible for the actual DB operation and any toast messages.
   */
  bulkDeleteFn: (ids: string[]) => Promise<void>
  /**
   * Called with the single item ID when the user confirms a single-item delete.
   * The hook handles closing the confirm dialog afterwards.
   * Callers are responsible for the actual DB operation and any toast messages.
   */
  singleDeleteFn: (id: string) => Promise<void>
}

/**
 * Combines selection, bulk-delete modal, and single-delete modal into one
 * reusable hook for list components that support per-row and bulk deletion.
 *
 * Callers supply the raw delete functions; this hook owns all the surrounding
 * modal-open/close, selection-clear, and toggle-all state so list components
 * don't have to wire that up themselves.
 */
export function useListWithSelection({
  items,
  bulkDeleteFn,
  singleDeleteFn,
}: UseListWithSelectionOptions) {
  const bulkDeleteModal = useModal()
  const singleDeleteModal = useModal()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const selection = useSelection(items)

  /**
   * Opens the single-item confirm dialog for the given item ID.
   * Store the ID so `handleSingleDelete` can reference it.
   */
  const openSingleConfirm = useCallback(
    (id: string) => {
      setPendingDeleteId(id)
      singleDeleteModal.open()
    },
    [singleDeleteModal],
  )

  /** Closes the single-item confirm dialog and clears the pending ID. */
  const closeSingleConfirm = useCallback(() => {
    singleDeleteModal.close()
    setPendingDeleteId(null)
  }, [singleDeleteModal])

  /**
   * Executes the single-item delete for the currently pending ID.
   * Closes the dialog on completion regardless of success/failure.
   */
  const handleSingleDelete = useCallback(async () => {
    if (!pendingDeleteId) return
    await singleDeleteFn(pendingDeleteId)
    closeSingleConfirm()
  }, [pendingDeleteId, singleDeleteFn, closeSingleConfirm])

  /**
   * Executes the bulk delete for all currently selected IDs.
   * Clears selection and closes the bulk-delete modal on completion.
   */
  const handleBulkDelete = useCallback(async () => {
    const ids = [...selection.selectedIds]
    await bulkDeleteFn(ids)
    selection.deselectAll()
    bulkDeleteModal.close()
  }, [selection, bulkDeleteFn, bulkDeleteModal])

  /** Toggles between select-all and deselect-all. */
  const handleToggleAll = useCallback(() => {
    if (selection.selectionState === 'all') {
      selection.deselectAll()
    } else {
      selection.selectAll()
    }
  }, [selection])

  return {
    // Selection surface
    selectedIds: selection.selectedIds,
    toggle: selection.toggle,
    isSelected: selection.isSelected,
    selectionState: selection.selectionState,
    selectionCount: selection.count,
    handleToggleAll,
    // Bulk delete
    bulkDeleteModal,
    handleBulkDelete,
    // Single-item delete
    singleDeleteModal,
    pendingDeleteId,
    openSingleConfirm,
    closeSingleConfirm,
    handleSingleDelete,
  }
}
