import { useTranslation } from 'react-i18next';
import { DotsLoader } from '@/components/common/DotsLoader';

interface LoadingScreenProps {
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

export function LoadingScreen({
  fullScreen = true,
  label,
  className
}: LoadingScreenProps) {
  const { t } = useTranslation('common');
  const statusLabel = label ?? t('states.loadingInterface');

  return (
    <div
      className={`flex w-full items-center justify-center bg-[var(--color-background)] text-[var(--color-text-primary)] ${fullScreen ? 'min-h-screen' : 'min-h-[264px]'} ${className ?? ''}`.trim()}
    >
      <DotsLoader className="w-24" label={statusLabel} />
    </div>
  );
}
