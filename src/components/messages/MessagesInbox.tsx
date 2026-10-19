import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, SearchIcon, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import chatBubblesImage from '@/assets/images/chat-bubbles-3d.svg';

type MessageFilter = 'all' | 'unread';

// host: sits under the 96px host header and above the 72px host tab bar.
// marketplace: full-page screen above MarketplaceMobileNav, which the page pads for.
type MessagesInboxLayout = 'host' | 'marketplace';

const layoutClasses: Record<MessagesInboxLayout, { section: string; mobile: string; desktop: string }> = {
  host: {
    section: 'min-h-[calc(100dvh-72px-env(safe-area-inset-bottom))] md:min-h-[calc(100vh-95px)]',
    mobile: 'min-h-[calc(100dvh-72px-env(safe-area-inset-bottom))] pb-[calc(150px+env(safe-area-inset-bottom))]',
    desktop: 'min-h-[calc(100vh-223px)]'
  },
  marketplace: {
    section: 'min-h-[calc(100dvh-64px-env(safe-area-inset-bottom))] md:min-h-dvh',
    mobile: 'min-h-[calc(100dvh-64px-env(safe-area-inset-bottom))] pb-12',
    desktop: 'min-h-dvh'
  }
};

export function InboxEmptyState({
  title,
  description,
  className = ''
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={`mx-auto flex max-w-[320px] flex-col items-center text-center ${className}`}>
      <ShimmerImage
        src={chatBubblesImage}
        alt=""
        aria-hidden="true"
        width={176}
        height={176}
        className="h-40 w-40 object-contain sm:h-44 sm:w-44"
      />
      <h2 className="mt-6 text-xl font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mt-3 text-sm leading-[1.5] text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}

export function MessagesInbox({
  layout = 'host',
  inboxEmptyHelp,
  mobileFooter,
  showDesktopBanner = layout === 'host'
}: {
  layout?: MessagesInboxLayout;
  /** Overrides the default (host-facing) empty inbox help text. */
  inboxEmptyHelp?: string;
  /** Rendered at the end of the mobile layout, e.g. the host attention card. */
  mobileFooter?: ReactNode;
  showDesktopBanner?: boolean;
}) {
  const { t } = useTranslation('dashboard');
  const { t: tCommon } = useTranslation('common');
  const [filter, setFilter] = useState<MessageFilter>('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isShowingPast, setIsShowingPast] = useState(false);
  // Messaging is not wired to data yet, so the inbox is always empty; filters only change the copy.
  const hasActiveFilters = filter !== 'all' || search.trim().length > 0;
  const classes = layoutClasses[layout];

  const clearFilters = () => {
    setFilter('all');
    setSearch('');
    setIsSearchOpen(false);
  };

  const emptyTitle = isShowingPast ? t('messages.pastEmpty') : t('messages.inboxEmpty');
  const emptyDescription = isShowingPast
    ? t('messages.pastEmptyHelp')
    : inboxEmptyHelp ?? t('messages.inboxEmptyHelp');

  const pastConversationsRow = (
    <button
      type="button"
      onClick={() => setIsShowingPast((showing) => !showing)}
      // Visually 30px tall (12px top padding + 18px label); the ::before layer keeps the 44px touch target.
      className="relative flex w-full items-center justify-between gap-4 border-t border-[var(--color-border)] pt-3 text-left text-sm leading-[18px] text-[var(--color-text-secondary)] transition before:absolute before:inset-x-0 before:-inset-y-[7px] hover:text-[var(--color-text-primary)]"
    >
      {isShowingPast ? t('messages.backToInbox') : t('messages.pastConversations')}
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`bg-[var(--color-surface)] ${classes.section}`}
    >
      <div className={`px-4 pt-7 md:hidden ${classes.mobile}`}>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[28px] font-semibold tracking-[-0.035em]">{t('messages.title')}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t('messages.search')}
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((open) => !open)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] active:scale-95"
            >
              <SearchIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={t('messages.settings')}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] active:scale-95"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {isSearchOpen ? (
          <label className="mt-4 flex h-12 items-center gap-2 rounded-field border border-[var(--color-border)] px-4">
            <SearchIcon className="h-5 w-5 text-[var(--color-text-secondary)]" aria-hidden="true" />
            <span className="sr-only">{tCommon('actions.search')}</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
              placeholder={tCommon('actions.search')}
              className="h-full min-w-0 flex-1 bg-transparent text-base sm:text-sm outline-none placeholder:text-[var(--color-text-secondary)]"
            />
          </label>
        ) : null}

        {hasActiveFilters ? (
          <div className="mx-auto mt-12 flex max-w-[308px] flex-col items-center text-center">
            <h2 className="text-md font-semibold">{t('messages.empty')}</h2>
            <p className="mt-2 text-[13px] leading-[1.5] text-[var(--color-text-secondary)]">{t('messages.emptyHelp')}</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 min-h-11 rounded-button border border-[var(--color-text-primary)] px-5 text-sm font-semibold active:scale-95"
            >
              {t('messages.clearFilters')}
            </button>
          </div>
        ) : (
          <>
            <InboxEmptyState title={emptyTitle} description={emptyDescription} className="mt-10" />
            <div className="mt-14">{pastConversationsRow}</div>
          </>
        )}

        {mobileFooter}
      </div>

      <div className="hidden md:block">
        {showDesktopBanner ? (
          <div className="h-32 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]" />
        ) : null}
        <div className={`flex bg-[var(--color-surface)] ${classes.desktop}`}>
        <aside className="w-full border-r border-[var(--color-border)] px-5 py-7 sm:px-8 lg:w-[462px] lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight">{t('messages.title')}</h1>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label={t('messages.search')}
                aria-expanded={isSearchOpen}
                onClick={() => setIsSearchOpen((open) => !open)}
                className="inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
              >
                <SearchIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={t('messages.settings')}
                className="inline-flex h-10 max-sm:h-11 max-sm:w-11 w-10 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
              >
                <Settings className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isSearchOpen ? (
            <label className="mt-4 flex h-11 items-center gap-2 rounded-field border border-[var(--color-border)] px-4">
              <SearchIcon className="h-5 w-5 text-[var(--color-text-secondary)]" aria-hidden="true" />
              <span className="sr-only">{tCommon('actions.search')}</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoFocus
                placeholder={tCommon('actions.search')}
                className="h-full min-w-0 flex-1 bg-transparent text-base sm:text-sm outline-none placeholder:text-[var(--color-text-secondary)]"
              />
            </label>
          ) : null}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`inline-flex h-10 items-center gap-2 rounded-pill px-5 text-sm font-semibold transition ${
                filter === 'all'
                  ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                  : 'border border-[var(--color-text-primary)]'
              }`}
            >
              {t('messages.all')}
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`h-10 rounded-pill px-5 text-sm font-semibold transition ${
                filter === 'unread'
                  ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                  : 'border border-[var(--color-text-primary)]'
              }`}
            >
              {t('messages.unread')}
            </button>
          </div>

          {hasActiveFilters ? (
            <div className="mx-auto mt-10 flex max-w-xs flex-col items-center text-center sm:mt-12">
              <MessageSquare className="h-9 w-9" aria-hidden="true" />
              <h2 className="mt-6 text-base font-semibold">{t('messages.empty')}</h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                {t('messages.emptyHelp')}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-button border border-[var(--color-text-primary)] px-5 py-2.5 text-sm font-semibold transition hover:bg-[var(--color-surface-muted)]"
              >
                {t('messages.clearFilters')}
              </button>
            </div>
          ) : (
            <>
              <InboxEmptyState title={emptyTitle} description={emptyDescription} className="mt-12" />
              <div className="mt-12">{pastConversationsRow}</div>
            </>
          )}
        </aside>
        <div className="hidden flex-1 bg-[var(--color-surface)] lg:block" aria-hidden="true" />
        </div>
      </div>
    </motion.section>
  );
}
