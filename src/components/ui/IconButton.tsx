import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: ReactNode;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'plain' | 'muted';
}

const sizeStyles = {
  sm: 'h-11 w-11 [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-11 w-11 [&_svg]:h-5 [&_svg]:w-5',
  lg: 'h-12 w-12 [&_svg]:h-6 [&_svg]:w-6'
} as const;

const variantStyles = {
  outlined: 'border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)]',
  plain: 'hover:bg-[var(--color-surface-muted)]',
  muted: 'bg-[var(--color-surface-muted)] hover:brightness-95'
} as const;

export function IconButton({ icon, label, size = 'md', variant = 'outlined', className, ...props }: IconButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-[var(--color-text-primary)] transition focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-50',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      aria-label={label}
      type="button"
      {...props}
    >
      {icon}
    </motion.button>
  );
}
