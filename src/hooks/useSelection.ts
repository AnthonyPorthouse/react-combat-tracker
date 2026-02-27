import { useState, useCallback, useMemo } from 'react'

/** Describes how many of the visible items are currently selected. */
export type SelectionState = 'none' | 'some' | 'all'

/**
 * Manages a set of selected IDs for multi-select UI patterns.
 *
 * The hook is intentionally scoped to a list of currently visible IDs so
 * that "select all" and the tri-state indicator always reflect the filtered
 * view, not stale items that are no longer on screen. When `visibleIds`
 * changes (e.g. a search filter is applied) the selection is automatically
 * intersected with the new visible set so that only still-visible items
 * remain selected.
 *
 * @param visibleIds - The IDs currently rendered in the list.
 */
export function useSelection(visibleIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const visibleSet = useMemo(() => new Set(visibleIds), [visibleIds])

  /**
   * Only keep selected IDs that are still visible. This replaces the
   * previous useEffect-based reset and avoids both setState-in-effect
   * and ref-access-during-render lint violations.
   */
  const effectiveSelectedIds = useMemo(() => {
    if (selectedIds.size === 0) return selectedIds
    const intersected = new Set<string>()
    for (const id of selectedIds) {
      if (visibleSet.has(id)) {
        intersected.add(id)
      }
    }
    return intersected
  }, [selectedIds, visibleSet])

  /** Toggle a single ID in or out of the selection. */
  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  /** Select every currently visible ID. */
  const selectAll = useCallback(
    () => setSelectedIds(new Set(visibleIds)),
    [visibleIds],
  )

  /** Remove every ID from the selection. */
  const deselectAll = useCallback(() => setSelectedIds(new Set()), [])

  /** Check whether a single ID is selected. */
  const isSelected = useCallback(
    (id: string) => effectiveSelectedIds.has(id),
    [effectiveSelectedIds],
  )

  /**
   * Returns a tri-state value describing how the current selection relates
   * to the visible items: `'none'` when nothing is selected, `'all'` when
   * every visible item is selected, and `'some'` for anything in between.
   */
  const selectionState: SelectionState = useMemo(() => {
    if (effectiveSelectedIds.size === 0 || visibleIds.length === 0) return 'none'
    if (visibleIds.every((id) => effectiveSelectedIds.has(id))) return 'all'
    return 'some'
  }, [effectiveSelectedIds, visibleIds])

  return {
    selectedIds: effectiveSelectedIds,
    toggle,
    selectAll,
    deselectAll,
    isSelected,
    selectionState,
    count: effectiveSelectedIds.size,
  }
}
