import { useTranslation } from 'react-i18next';
import MarketplaceMobileNav from '@/components/layout/MarketplaceMobileNav';
import { MessagesInbox } from '@/components/messages/MessagesInbox';

export default function MessagesPage() {
  const { t } = useTranslation('dashboard');

  return (
    <main className="min-h-dvh bg-[var(--color-surface)] pb-[calc(64px+env(safe-area-inset-bottom))] text-[var(--color-text-primary)] sm:pb-0">
      <MessagesInbox layout="marketplace" inboxEmptyHelp={t('messages.guestInboxEmptyHelp')} />
      <MarketplaceMobileNav />
    </main>
  );
}
