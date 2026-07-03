import { ArrowCounterclockwiseRegular, WarningRegular } from '@fluentui/react-icons';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Une erreur est survenue',
  description = 'Impossible de charger cette section pour le moment. Veuillez réessayer.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="glass-panel flex min-h-[280px] flex-col items-center justify-center rounded-3xl p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
        <WarningRegular className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-gray-400">{description}</p>
      {onRetry ? (
        <Button className="mt-6" onClick={onRetry} leftIcon={<ArrowCounterclockwiseRegular className="h-4 w-4" />}>
          Réessayer
        </Button>
      ) : null}
    </div>
  );
}
