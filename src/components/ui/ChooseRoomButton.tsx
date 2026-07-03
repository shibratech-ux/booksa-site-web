import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/helpers';

interface ChooseRoomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  compact?: boolean;
}

export function ChooseRoomButton({
  className,
  children = 'Réserver',
  compact = false,
  ...props
}: ChooseRoomButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'cursor-pointer rounded-full bg-[var(--color-primary-500)] px-5 py-3 text-[15px] font-normal text-white transition hover:-translate-y-0.5',
        compact ? 'mt-0 w-auto' : 'mt-4 w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
