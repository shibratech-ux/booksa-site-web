import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: ReactNode;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-10 w-10 [&_svg]:h-4 [&_svg]:w-4',
  md: 'h-11 w-11 [&_svg]:h-5 [&_svg]:w-5',
  lg: 'h-12 w-12 [&_svg]:h-6 [&_svg]:w-6'
} as const;

export function IconButton({ icon, label, size = 'md', className, ...props }: IconButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] transition hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)]',
        sizeStyles[size],
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
