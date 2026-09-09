import { forwardRef, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/helpers';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: ReactNode;
  label?: string;
  loading?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  /** Retained for existing callers; all sizes use 56px on mobile and 48px at sm and above. */
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#E61E4D] text-white hover:bg-[#D70466]',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]',
  outline:
    'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]',
  ghost:
    'bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]',
  danger: 'bg-[var(--color-danger)] text-white hover:brightness-95'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    label,
    onClick,
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = true,
    className = '',
    variant = 'primary',
    size: _size,
    leftIcon,
    rightIcon,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      {...props}
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      className={cn(
        fullWidth ? 'w-full' : 'w-auto',
        'flex h-12 max-sm:h-[56px] items-center justify-center gap-2 rounded-button border-0! px-6 text-[16px] max-sm:text-[17.2px] font-semibold leading-5 max-sm:leading-6 shadow-none! transition-all duration-200 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#E61E4D] focus:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100',
        variantStyles[variant],
        className
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          Logging in...
        </span>
      ) : (
        <>
          {leftIcon}
          {label ?? children}
          {rightIcon}
        </>
      )}
    </motion.button>
  );
});
