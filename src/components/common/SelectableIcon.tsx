import { Square, SquareMinus, SquareCheck } from 'lucide-react'
import type { SelectionState } from '../../hooks/useSelection'

interface SelectableIconProps {
  /** Which visual state to render: unchecked, indeterminate, or checked. */
  state: SelectionState | 'checked' | 'unchecked'
  /** Fires when the icon is clicked. */
  onClick: () => void
  /** Accessible label describing what the checkbox controls. */
  ariaLabel: string
}

/**
 * A clickable Lucide-icon checkbox replacement with tri-state support.
 *
 * Renders `Square` (unchecked), `SquareMinus` (indeterminate / "some"),
 * or `SquareCheck` (checked / "all") depending on `state`. Used in place
 * of a native `<input type="checkbox">` so the visual style is consistent
 * with the rest of the icon-driven UI.
 *
 * Row-level items only need two states (`'checked'` / `'unchecked'`) while
 * the header "select-all" toggle uses the full tri-state (`'none'` / `'some'`
 * / `'all'`).
 */
export function SelectableIcon({
  state,
  onClick,
  ariaLabel,
}: SelectableIconProps) {
  const isActive = state === 'all' || state === 'checked'
  const colorClass = isActive
    ? 'text-blue-600 hover:text-blue-700'
    : 'text-gray-400 hover:text-gray-500'

  const Icon =
    state === 'some'
      ? SquareMinus
      : isActive
        ? SquareCheck
        : Square

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-0.5 transition-colors ${colorClass}`}
      aria-label={ariaLabel}
    >
      <Icon size={20} />
    </button>
  )
}
