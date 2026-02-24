import type { CheckboxItemProps } from '../../types/common';

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
