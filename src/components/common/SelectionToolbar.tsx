import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { SelectableIcon } from './SelectableIcon'
import { Button } from './Button'
import type { SelectionState } from '../../hooks/useSelection'

interface SelectionToolbarProps {
  /** Tri-state value reflecting how many visible items are selected. */
  selectionState: SelectionState
  /** Number of currently selected items. */
  selectionCount: number
  /** Fires when the header select-all / deselect-all icon is clicked. */
  onToggleAll: () => void
  /** Fires when the bulk-delete button is clicked. */
  onBulkDelete: () => void
}

/**
 * A toolbar row with a tri-state select-all icon and a contextual bulk-delete
 * button that appears when at least one item is selected.
 *
 * Designed to sit above a selectable list and paired with per-row
 * `SelectableIcon` toggles. The toolbar is intentionally stateless — all
 * selection logic lives in the parent via the `useSelection` hook so this
 * component stays a pure presentational wrapper.
 */
export function SelectionToolbar({
  selectionState,
  selectionCount,
  onToggleAll,
  onBulkDelete,
}: SelectionToolbarProps) {
  const { t } = useTranslation('library')

  return (
    <div className="flex items-center justify-between px-3">
      <SelectableIcon
        state={selectionState}
        onClick={onToggleAll}
        ariaLabel={selectionState === 'all' ? t('deselectAll') : t('selectAll')}
      />
      {selectionCount > 0 && (
        <Button
          variant="danger-icon"
          size="xs"
          icon={<Trash2 size={16} />}
          onClick={onBulkDelete}
          aria-label={t('deleteSelected', { count: selectionCount })}
        >
          {null}
        </Button>
      )}
    </div>
  )
}
