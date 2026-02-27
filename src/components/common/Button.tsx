import type { ButtonVariant, ButtonSize, ButtonProps } from '../../types/common';

/**
 * Maps a button variant to its Tailwind colour classes.
 *
 * Centralising variant→class mapping here means adding a new variant only
 * requires touching this one function rather than hunting for className
 * strings scattered across multiple components.
 *
 * @param variant - The semantic colour intent of the button.
 * @returns The Tailwind utility classes for the requested variant.
 */
const getVariantClasses = (variant: ButtonVariant = 'primary'): string => {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    'danger-icon': 'text-red-600 hover:text-red-700',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    ghost: 'text-slate-700 hover:text-slate-900 hover:bg-slate-100',
  };
  return variants[variant];
};

/**
 * Maps a button size to its Tailwind padding/text classes.
 *
 * Kept separate from variant mapping so each concern can evolve
 * independently — changing the `md` padding doesn't touch colour logic.
 *
 * @param size - The desired button size.
 * @returns The Tailwind utility classes for the requested size.
 */
const getSizeClasses = (size: ButtonSize = 'md'): string => {
  const sizes: Record<ButtonSize, string> = {
    xs: 'p-1 text-xs',
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  return sizes[size];
};

/**
 * A styled, accessible button with variant and size support.
 *
 * Accepts all native `<button>` attributes via spread props, making it a
 * drop-in replacement wherever a `<button>` is used. The optional `icon`
 * prop wraps both the icon and label in a flex container so they stay
 * vertically centred without callers needing to add layout classes.
 *
 * Disabled state is handled uniformly here rather than per-callsite — the
 * `disabled:` Tailwind variant overrides the variant colour and sets a
 * `not-allowed` cursor so the visual feedback is consistent everywhere.
 */
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
