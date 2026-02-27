/**
 * Shared prop types and UI primitives used across the application.
 *
 * Centralised here rather than co-located with individual components so that
 * the types can be imported by both the component implementations and any
 * consumer that needs to pass typed props without importing the full component
 * module (e.g. in tests or higher-order wrappers).
 */

/** Semantic colour intent for the `Button` component. */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-icon' | 'success' | 'ghost';

/** Visual size scale for the `Button` component. */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Props for the `Button` component.
 * Extends all native `<button>` attributes so callers can set `onClick`,
 * `aria-label`, `type`, etc. without extra wrapper props.
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Optional icon rendered to the left of the label text inside a flex row. */
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Props for the `FormField` component.
 * Extends all native `<input>` attributes so callers can set `type`,
 * `placeholder`, `min`, `max`, etc. directly without extra wrapper props.
 */
export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** The `name` attribute for the input, required for native form data and accessibility. */
  name: string;
  /** Validation error message shown below the input. Triggers a red border when set. */
  error?: string;
  required?: boolean;
}

/** Props for the `CheckboxItem` component. */
export interface CheckboxItemProps {
  id: string;
  label: string;
  /** The `name` attribute for the checkbox input, used for grouping and native form data. */
  name?: string;
  checked: boolean;
  /** Called with the new checked boolean when the user toggles the checkbox. */
  onChange: (checked: boolean) => void;
  /** Optional sub-label rendered in a smaller font below the main label. */
  secondaryText?: string;
}

/** Props for the `ModalActions` submit/cancel button pair. */
export interface ModalActionsProps {
  primaryLabel: string;
  primaryVariant?: ButtonVariant;
  onPrimary: () => void | Promise<void>;
  onCancel: () => void;
  /** Disables the primary action button while keeping the modal open. */
  disabled?: boolean;
  /** Disables both buttons and shows "Loading…" on the primary action. */
  loading?: boolean;
}

/** Props for the `ConfirmDialog` reusable confirmation modal. */
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** Icon rendered above the title, typically from lucide-react. */
  icon?: React.ReactNode;
  actionLabel: string;
  actionVariant?: ButtonVariant;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * A flat map of field names to their first validation error message.
 *
 * Used by `useFormValidation` and consumed by form components to display
 * per-field error messages. Only the first error per field is stored —
 * sufficient for guiding the user without over-communicating.
 */
export interface FormErrors {
  [key: string]: string;
}
