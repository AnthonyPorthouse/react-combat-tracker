import { useId } from 'react'
import type { Category } from '../../../db/stores/categories'
import { CheckboxItem } from '../../../components/common/CheckboxItem'

interface CategoryCheckboxListProps {
  /** The full list of available categories. */
  categories: Category[]
  /** The set of currently selected category IDs. */
  selectedIds: Set<string>
  /** Called with a category ID whenever its checkbox is toggled. */
  onToggle: (categoryId: string) => void
  /**
   * Message displayed when `categories` is empty.
   * Should be context-appropriate — e.g. prompt to create a category in
   * the library, or to visit the library from the combat view.
   */
  noCategoriesMessage: string
  /** Optional additional class names applied to the scrollable wrapper. */
  className?: string
}

/**
 * Scrollable list of category checkboxes with a built-in empty state.
 *
 * Renders a `CheckboxItem` for every category in the list. When empty,
 * shows `noCategoriesMessage` instead. Uses `Set<string>` for the selected
 * state so callers that already maintain a set (e.g. `CreatureFilterPanel`)
 * can pass it directly without conversion.
 *
 * Each checkbox `id` is derived from `useId()` — a React-stable unique
 * prefix per component instance — plus the category's own id, guaranteeing
 * globally unique HTML ids with no caller configuration required.
 *
 * This component is intentionally narrow — it owns only the scrollable list
 * portion. Callers supply the heading element (`<legend>`, `<p>`, etc.) and
 * any outer wrapper (`<fieldset>`, `<div>`) that suits their layout context.
 */
export function CategoryCheckboxList({
  categories,
  selectedIds,
  onToggle,
  noCategoriesMessage,
  className = 'space-y-2 max-h-48 overflow-y-auto',
}: CategoryCheckboxListProps) {
  const uid = useId()

  if (categories.length === 0) {
    return <p className="text-gray-500 text-sm">{noCategoriesMessage}</p>
  }

  return (
    <div className={className}>
      {categories.map((category) => (
        <CheckboxItem
          key={category.id}
          id={`${uid}-${category.id}`}
          label={category.name}
          checked={selectedIds.has(category.id)}
          onChange={() => onToggle(category.id)}
        />
      ))}
    </div>
  )
}
