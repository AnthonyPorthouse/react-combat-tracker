import type { ButtonVariant, ButtonSize, ButtonProps } from '../../types/common';

const getVariantClasses = (variant: ButtonVariant = 'primary'): string => {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };
  return variants[variant];
};

const getSizeClasses = (size: ButtonSize = 'md'): string => {
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  return sizes[size];
};

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const baseClasses =
    'rounded font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed';
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);

  const fullClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  return (
    <button
      type={type}
      disabled={disabled}
      className={fullClasses}
      {...props}
    >
      {icon ? (
        <span className="flex items-center gap-2">
          {icon}
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
