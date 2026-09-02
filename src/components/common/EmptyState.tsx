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
    <div className="surface-card flex min-h-[246px] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary-500)_10%,transparent)] text-[var(--color-primary-500)]">
        <DocumentSearchRegular className="h-[16.8px] w-[16.8px]" />
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
      {actionLabel ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
