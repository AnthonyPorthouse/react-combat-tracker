import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from '@tanstack/react-router'
import { db } from '../../../db/db'
import { Edit, Trash2 } from 'lucide-react'

interface CreatureListProps {
  selectedCategoryId?: string
}

/**
 * Searchable, filterable list of all library creatures.
 *
 * Supports filtering by a parent `selectedCategoryId` prop (used by
 * `LibraryPanel` when a category is selected) as well as a local free-text
 * search. Both filters are applied in a `useMemo` to avoid redundant
 * iteration on every keystroke.
 *
 * `getCategoryNames` resolves category ids to display names for each
 * creature row. It is intentionally called in the render body rather than
 * memoized per-creature, as the list is expected to be small (library
 * creatures are user-curated) and the Dexie live query already handles
 * re-renders when data changes.
 */
export function CreatureList({ selectedCategoryId }: CreatureListProps) {
  const creatures = useLiveQuery(() => db.creatures.toArray())
  const categories = useLiveQuery(() => db.categories.toArray())
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCreatures = useMemo(() => {
    if (!creatures) return []

    return creatures.filter((creature) => {
      const matchesCategory =
        !selectedCategoryId || creature.categoryIds.includes(selectedCategoryId)
      const matchesSearch =
        creature.name.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [creatures, selectedCategoryId, searchTerm])

  /** Deletes a creature permanently from the library after a native confirmation prompt. */
  const handleDelete = async (id: string) => {
    if (confirm('Delete this creature?')) {
      await db.creatures.delete(id)
    }
  }

  /**
   * Resolves category ids to a comma-separated list of names for display.
   *
   * Returns an empty string when `categories` is still loading (undefined)
   * so the UI gracefully shows nothing rather than crashing on `.filter()`.
   */
  const getCategoryNames = (categoryIds: string[]) => {
    if (!categories) return ''
    return categories
      .filter((c) => categoryIds.includes(c.id))
      .map((c) => c.name)
      .join(', ')
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Creatures</h3>
      </div>

      <input
        type="text"
        placeholder="Search creatures..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
      />

      {!creatures || filteredCreatures.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {creatures?.length === 0
            ? 'No creatures yet. Create one to get started.'
            : 'No creatures match your search.'}
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCreatures.map((creature) => (
            <div
              key={creature.id}
              className="p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h4 className="font-medium text-gray-900">{creature.name}</h4>
                  <p className="text-xs text-gray-500">
                    Initiative: {creature.initiative} ({creature.initiativeType === 'fixed' ? 'Fixed' : 'Roll'})
                  </p>
                  {getCategoryNames(creature.categoryIds) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {getCategoryNames(creature.categoryIds)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/library/creature/$id"
                    params={{ id: creature.id }}
                    className="text-blue-600 hover:text-blue-700 p-1 transition"
                    aria-label="Edit creature"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(creature.id)}
                    className="text-red-600 hover:text-red-700 p-1 transition"
                    aria-label="Delete creature"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
