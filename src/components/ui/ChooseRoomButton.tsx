import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/helpers';
import { useTranslation } from 'react-i18next';

interface ChooseRoomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  compact?: boolean;
}

export function ChooseRoomButton({
  className,
  children,
  compact = false,
  ...props
}: ChooseRoomButtonProps) {
  const { t } = useTranslation('common');
  return (
    <button
      type="button"
      className={cn(
        'min-h-12 cursor-pointer rounded-md bg-[var(--color-primary-500)] px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-600)]',
        compact ? 'mt-0 w-auto' : 'mt-4 w-full',
        className
      )}
      {...props}
    >
      {children ?? t('booking.reserve')}
    </button>
  );
}
