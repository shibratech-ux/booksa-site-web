import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
}

const toneStyles: Record<NonNullable<BadgeProps['tone']>, string> = {
  success: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/20',
  warning: 'bg-amber-500/15 text-amber-300 ring-amber-400/20',
  danger: 'bg-rose-500/15 text-rose-300 ring-rose-400/20',
  neutral: 'bg-slate-500/15 text-gray-300 ring-slate-400/20',
  info: 'bg-cyan-500/15 text-cyan-300 ring-cyan-400/20'
};

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset',
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
