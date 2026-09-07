import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
}

const toneStyles: Record<NonNullable<BadgeProps['tone']>, string> = {
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
  warning: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
  danger: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
  neutral: 'bg-slate-500/10 text-[var(--color-text-secondary)] ring-[var(--color-border)]',
  info: 'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300'
};

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
