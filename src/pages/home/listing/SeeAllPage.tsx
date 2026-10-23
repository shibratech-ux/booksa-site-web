import { useId, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BedDouble, House, LayoutGrid, Search, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { SearchDialog } from '@/components/home/SearchDialog';
import MarketplaceMobileNav from '@/components/layout/MarketplaceMobileNav';
import { ROUTES } from '@/utils/constants';
import { cn } from '@/utils/helpers';
import { persistSeeAllSectionTitle } from '@/utils/navigationPersistence';
import { ExploreTabContent } from './see-all/ExploreTabContent';
import { getSectionsForCategory, type ExploreCategory } from './see-all/seeAllContent';

/**
 * Explore tab: search pill, category chips and listing rails, built from the mobile design
 * reference. Structure follows Flutter's AirbnbExploreImagesWidget
 * (lib/pages/dashboard/tags/home/dashboard_home_view.dart).
 */
const CATEGORIES: ReadonlyArray<{ id: ExploreCategory; icon: LucideIcon }> = [
  { id: 'all', icon: LayoutGrid },
  { id: 'homes', icon: House },
  { id: 'experiences', icon: BedDouble },
  { id: 'services', icon: UtensilsCrossed }
];

export default function SeeAllPage() {
  const { t } = useTranslation('navigation');
  const navigate = useNavigate();
  const tabsId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState<ExploreCategory>('all');
  const activeIndex = CATEGORIES.findIndex(({ id }) => id === category);

  // Listing rail actions open the map results page.
  const openMap = (sectionTitle?: string) => {
    if (sectionTitle) persistSeeAllSectionTitle(sectionTitle);
    navigate(ROUTES.seeAllMap, sectionTitle ? { state: { sectionTitle } } : undefined);
  };

  const focusTab = (index: number) => {
    const next = CATEGORIES[(index + CATEGORIES.length) % CATEGORIES.length];
    setCategory(next.id);
    document.getElementById(`${tabsId}-tab-${next.id}`)?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowRight') focusTab(activeIndex + 1);
    else if (event.key === 'ArrowLeft') focusTab(activeIndex - 1);
    else if (event.key === 'Home') focusTab(0);
    else if (event.key === 'End') focusTab(CATEGORIES.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] pt-3">
        <div className="px-4">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t('openSearch')}
            // TODO(design): max width is a desktop-only addition; the reference is mobile.
            className="mx-auto flex h-[54px] w-full max-w-[720px] items-center justify-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 shadow-[var(--shadow-md)] transition-shadow hover:shadow-[var(--shadow-lg)]"
          >
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--color-text-primary)]" />
            <span className="truncate text-[12.88px] font-semibold leading-none text-[var(--color-text-primary)]">
              {t('startSearch')}
            </span>
          </button>
        </div>

        <div
          role="tablist"
          aria-label={t('exploreCategories')}
          className="mt-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Inner w-max row keeps the end inset and room for chip shadows while scrolling. */}
          <div className="flex w-max gap-2 px-4 pb-3 pt-0.5">
            {CATEGORIES.map(({ id, icon: Icon }) => {
              const isSelected = id === category;
              return (
                <button
                  key={id}
                  id={`${tabsId}-tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`${tabsId}-panel`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setCategory(id)}
                  onKeyDown={handleTabKeyDown}
                  className={cn(
                    'flex min-h-11 items-center gap-1.5 rounded-full border pl-2 pr-3.5 text-[12.88px] leading-none transition-[background-color,border-color,box-shadow] duration-[180ms]',
                    isSelected
                      ? 'border-[var(--color-border)] bg-[var(--color-surface-muted)] font-semibold text-[var(--color-text-primary)]'
                      : 'border-[var(--color-border-subtle)] bg-[var(--color-surface)] font-medium text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      isSelected ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-surface-muted)]'
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {t(id)}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main
        id={`${tabsId}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-tab-${category}`}
        className="pb-24 sm:pb-0"
      >
        <ExploreTabContent key={category} sections={getSectionsForCategory(category)} onOpenMap={openMap} />
      </main>

      <MarketplaceMobileNav />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
