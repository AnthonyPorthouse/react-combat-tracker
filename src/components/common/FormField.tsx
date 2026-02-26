import type { FormFieldProps } from '../../types/common';

/**
 * A labelled text input with inline validation error display.
 *
 * Composes the repetitive label + input + error-message pattern into a single
 * unit so forms stay DRY and error styling is applied consistently. The
 * `error` prop drives both a red border on the input and a descriptive
 * message below it, giving users both a visual indicator and readable context
 * for what went wrong.
 *
 * All extra `InputHTMLAttributes` are forwarded to the underlying `<input>`
 * via spread props, so callers can set `type`, `placeholder`, `min`, etc.
 * without needing wrapper-specific props for each one.
 */
export function FormField({
  label,
  id,
  error,
  required = false,
  value,
  onChange,
  ...props
}: FormFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded outline-none transition ${
          error
            ? 'border-red-500 focus:border-red-600'
            : 'border-gray-300 focus:border-blue-500'
        }`}
        {...props}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
