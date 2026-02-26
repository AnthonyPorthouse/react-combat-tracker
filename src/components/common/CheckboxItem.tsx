import type { CheckboxItemProps } from '../../types/common';

/**
 * A labelled checkbox with optional secondary descriptive text.
 *
 * Wraps the native `<input type="checkbox">` in a `<label>` so the entire
 * row (not just the small checkbox element) is clickable — an important
 * usability improvement on touch devices where small hit targets cause
 * accidental misses. The `secondaryText` slot is used to show sub-labels
 * like initiative values in creature selection lists.
 */
export function CheckboxItem({
  id,
  label,
  checked,
  onChange,
  secondaryText,
}: CheckboxItemProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300"
      />
      <div className="flex flex-col">
        <span className="text-sm text-gray-700">{label}</span>
        {secondaryText && (
          <span className="text-xs text-gray-500">{secondaryText}</span>
        )}
      </div>
    </label>
  );
}
