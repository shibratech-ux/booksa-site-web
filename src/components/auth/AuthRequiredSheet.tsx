import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ROUTES } from '@/utils/constants';

export function AuthRequiredSheet({ open, from, onClose }: {
  open: boolean;
  from?: { pathname: string; search?: string; hash?: string };
  onClose: () => void;
}) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

  return (
    <Modal open={open} title={t('requiredSheet.title')} onClose={onClose} variant="sheet" sheetSize="compact">
      <div className="flex h-full flex-col justify-between gap-8 pb-3 pt-5 text-[var(--color-text-primary)]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t('requiredSheet.heading')}</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {t('requiredSheet.description')}
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.login, { state: from ? { from } : undefined })}>
          {t('requiredSheet.action')}
        </Button>
      </div>
    </Modal>
  );
}
