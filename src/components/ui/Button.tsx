import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { ArrowSyncRegular } from '@fluentui/react-icons';
import { cn } from '@/utils/helpers';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-[var(--color-primary-500)] text-white shadow-none hover:bg-[var(--color-primary-600)] focus-visible:ring-[var(--color-primary-500)]',
  secondary:
    'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)] hover:bg-[var(--color-surface-muted)] focus-visible:ring-[var(--color-primary-500)]',
  ghost:
    'border-transparent bg-transparent text-[var(--color-text-primary)] shadow-none hover:bg-[var(--color-surface-muted)] focus-visible:ring-[var(--color-primary-500)]',
  danger:
    'border-transparent bg-[var(--color-danger)] text-white shadow-none hover:brightness-95 focus-visible:ring-[var(--color-danger)]'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-[var(--control-compact)] px-[var(--space-lg)] text-lg',
  md: 'min-h-[var(--control-standard)] px-[var(--space-2xl)] text-lg',
  lg: 'min-h-[var(--control-large)] px-[var(--space-2xl)] text-lg'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    type,
    ...props
  },
  ref
) {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type ?? 'button'}
      whileHover={isDisabled || prefersReducedMotion ? undefined : { y: -1, scale: 1.01 }}
      whileTap={isDisabled || prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
      className={cn(
        'inline-flex items-center justify-center gap-[var(--space-sm)] whitespace-nowrap rounded-md border font-semibold transition-[background-color,border-color,color,box-shadow,filter,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-55',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...props}
    >
      {loading ? <ArrowSyncRegular className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
      <span>{children}</span>
      {!loading ? rightIcon : null}
    </motion.button>
  );
});
