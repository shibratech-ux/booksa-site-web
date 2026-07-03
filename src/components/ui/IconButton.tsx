import type { ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface IconButtonProps extends HTMLMotionProps<'button'> {
  icon: ReactNode;
  label: string;
}

export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 text-gray-200 transition hover:border-cyan-400/40 hover:text-cyan-300',
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
