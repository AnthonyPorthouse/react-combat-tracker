/**
 * A labelled `<select>` with inline validation error display.
 *
 * Mirrors the `FormField` component's pattern so selects and text inputs
 * share the same visual language — consistent label/error presentation and
 * the same conditional red/blue border styling on error vs. focus.
 *
 * All extra `SelectHTMLAttributes` are forwarded to the underlying `<select>`.
 */
export function SelectField({
  label,
  id,
  error,
  required = false,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  id: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-3 py-2 border rounded outline-none transition focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-red-600 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
