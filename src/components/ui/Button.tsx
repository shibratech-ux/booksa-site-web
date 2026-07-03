import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { ArrowSyncRegular } from '@fluentui/react-icons';
import { cn } from '@/utils/helpers';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'primary-button',
  secondary: 'secondary-button',
  ghost: 'ghost-button',
  danger: 'danger-button'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base'
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
  return (
    <motion.button
      ref={ref}
      type={type ?? 'button'}
      whileHover={{ y: -1, scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <ArrowSyncRegular className="h-4 w-4 animate-spin" /> : leftIcon}
      <span>{children}</span>
      {!loading ? rightIcon : null}
    </motion.button>
  );
});
