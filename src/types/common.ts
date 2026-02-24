// Button component types
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

// Form field types
export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

// Checkbox item types
export interface CheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  secondaryText?: string;
}

// Modal action types
export interface ModalActionsProps {
  primaryLabel: string;
  primaryVariant?: ButtonVariant;
  onPrimary: () => void | Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// Confirm dialog types
export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: React.ReactNode;
  actionLabel: string;
  actionVariant?: ButtonVariant;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
}

// Form validation types
export interface FormErrors {
  [key: string]: string;
}
