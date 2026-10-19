import { RotateCcw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  description,
  onRetry
}: ErrorStateProps) {
  const { t } = useTranslation('common');

  return (
    <div className="surface-card flex min-h-[308px] flex-col items-center justify-center p-8 text-center" role="alert">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-rose-500/10 text-[var(--color-danger)]">
        <TriangleAlert className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">{title ?? t('errors.generic')}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">{description ?? t('errors.loadSection')}</p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
          {t('actions.retry')}
        </Button>
      ) : null}
    </div>
  );
}
