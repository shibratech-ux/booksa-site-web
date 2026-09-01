import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-card w-full max-w-lg p-8 text-center shadow-[var(--shadow-sm)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-500)]">404</p>
        <h1 className="mt-4 text-3xl font-bold text-[var(--color-text-primary)]">{t('notFound.title')}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          {t('notFound.description')}
        </p>
        <div className="mt-8">
          <Button onClick={() => navigate(ROUTES.home)}>{t('notFound.home')}</Button>
        </div>
      </div>
    </div>
  );
}
