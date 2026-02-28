import { useMemo, useState } from 'react'
import type { Creature } from '../../../db/stores/creature'

/**
 * Manages the name and category filter state for a creature browser.
 *
 * Centralises the filtering logic shared between {@link CombatLibraryModal}
 * and {@link LibraryModal}, preventing drift between the two implementations.
 * Category membership is tracked in a `Set` for O(1) lookups; an empty set
 * means "show all categories" rather than "show nothing".
 *
 * @param creatures - The full unfiltered creature list (may be `undefined`
 *   while the live query is still loading).
 * @returns Filter state, the derived filtered list, and toggle/reset handlers.
 */
export function useCreatureFilter(creatures: Creature[] | undefined) {
  const [nameFilter, setNameFilter] = useState('')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(
    new Set(),
  )

  const filteredCreatures = useMemo(() => {
    if (!creatures) return []
    const loweredName = nameFilter.trim().toLowerCase()

    return creatures.filter((creature) => {
      const matchesName =
        loweredName.length === 0 ||
        creature.name.toLowerCase().includes(loweredName)
      const matchesCategory =
        selectedCategoryIds.size === 0 ||
        creature.categoryIds.some((id) => selectedCategoryIds.has(id))

      return matchesName && matchesCategory
    })
  }, [creatures, nameFilter, selectedCategoryIds])

  /**
   * Toggles a category in the active filter set.
   *
   * Adding a category narrows the creature list to those assigned to any
   * selected category. Removing a category widens it. An empty set means
   * all creatures are visible regardless of category.
   */
  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  /** Resets name filter and category selection to their initial empty state. */
  const clearFilters = () => {
    setNameFilter('')
    setSelectedCategoryIds(new Set())
  }

  return {
    nameFilter,
    setNameFilter,
    selectedCategoryIds,
    filteredCreatures,
    toggleCategory,
    clearFilters,
  }
}
