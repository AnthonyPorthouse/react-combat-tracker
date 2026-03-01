import { useTranslation } from 'react-i18next'
import type { Category } from '../../../db/stores/categories'
import { CategoryCheckboxList } from './CategoryCheckboxList'

interface CreatureFilterPanelProps {
  /** Current value of the name search input. */
  nameFilter: string
  /** Called when the name input value changes. */
  onNameFilterChange: (value: string) => void
  /** The set of currently active category filter IDs. */
  selectedCategoryIds: Set<string>
  /** Toggles a category in or out of the active filter set. */
  onToggleCategory: (categoryId: string) => void
  /**
   * The loaded category list. Pass `undefined` while the live query is still
   * loading; the panel renders the `noCategoriesMessage` in that case.
   */
  categories: Category[] | undefined
  /**
   * Message shown when no categories exist. Varies by context — the combat
   * view prompts the DM to visit the library, while the library modal prompts
   * them to create a category inline.
   */
  noCategoriesMessage: string
  /**
   * HTML `id` for the name search input. Must be unique per rendered page to
   * satisfy HTML validity, even though only one panel is in the DOM at a time.
   */
  nameInputId?: string
}

/**
 * Left-sidebar filter panel used inside creature browser modals.
 *
 * Renders a name search input and a scrollable list of category checkboxes.
 * Extracted from the previously duplicated implementations in
 * {@link CombatLibraryModal} and {@link LibraryModal}.
 *
 * This component is fully controlled — it holds no internal state. Pass
 * values and callbacks from {@link useCreatureFilter}.
 */
export function CreatureFilterPanel({
  nameFilter,
  onNameFilterChange,
  selectedCategoryIds,
  onToggleCategory,
  categories,
  noCategoriesMessage,
  nameInputId = 'creature-name-filter',
}: CreatureFilterPanelProps) {
  const { t: tCommon } = useTranslation('common')

  return (
    <div className="md:col-span-1 space-y-4">
      <div>
        <label
          htmlFor={nameInputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {tCommon('filterBy', { field: tCommon('name') })}
        </label>
        <input
          id={nameInputId}
          name={nameInputId}
          type="text"
          value={nameFilter}
          onChange={(e) => onNameFilterChange(e.target.value)}
          placeholder={tCommon('searchCreatures')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          {tCommon('categories')}
        </p>
        <CategoryCheckboxList
          categories={categories ?? []}
          selectedIds={selectedCategoryIds}
          onToggle={onToggleCategory}
          noCategoriesMessage={noCategoriesMessage}
          className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-white"
        />
      </div>
    </div>
  )
}
