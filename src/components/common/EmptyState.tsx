import { DocumentSearchRegular } from '@fluentui/react-icons';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="glass-panel flex min-h-[280px] flex-col items-center justify-center rounded-3xl p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
        <DocumentSearchRegular className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-gray-400">{description}</p>
      {actionLabel ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
