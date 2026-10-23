import { ArrowRight, ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, generatePath, useLocation, useNavigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import BooksaHeader from '@/components/layout/BooksaHeader';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { SeeAllCard } from '@/components/home/SeeAllCard';
import { EmptyState } from '@/components/common/EmptyState';
import { AuthRequiredSheet } from '@/components/auth/AuthRequiredSheet';
import { ExploreTabContent } from './see-all/ExploreTabContent';
import { HOME_TAB_SECTIONS } from './see-all/seeAllContent';
import type { Listing } from './listing.types';
import { persistListingContext } from '@/utils/navigationPersistence';
import { ROUTES } from '@/utils/constants';
import { useTheme } from '@/theme/useTheme';
import { listPublishedListings, type ExploreCategoryId, type PublishedListingSummary } from '@/services/listing-catalog.service';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency } from '@/utils/formatters';
import { groupExploreRails } from './exploreRails';

// Reusable card used for the horizontal property grids.
function ListingCard({ listing }: { listing: Listing }) {
  const listingId = encodeURIComponent(listing.id ?? `${listing.location}-${listing.price}`);
  const detailPath = generatePath(ROUTES.listingDetail, { listingId });
  const [isSaved, setIsSaved] = useState(false);
  const { theme } = useTheme();
  const priceStyle = { color: theme.colors.textSecondary };

  return (
    <article className="marketplace-reference-card group relative shrink-0 snap-start">
      <Link
        to={detailPath}
        state={{ listing }}
        onClick={() => persistListingContext(listing)}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="relative aspect-[1.04/1] overflow-hidden rounded-photo bg-slate-100 ring-1 ring-black/5">
          <ShimmerImage
            src={listing.image}
            alt={listing.title ?? listing.location}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
          {listing.badge ? (
            <span className="absolute left-3 top-3 max-w-[calc(100%-3.75rem)] truncate rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
              {listing.badge}
            </span>
          ) : null}
        </div>

        <div className="px-0.5 pt-2">
          <h3 className="line-clamp-2 min-h-5 break-words text-[12px] font-semibold leading-[15px] text-slate-900 sm:text-[13px] sm:leading-[17px]">
            {listing.location}
          </h3>
          <div className="mt-1" style={{ color: theme.colors.textSecondary }}>
            <p className="flex min-w-0 items-center text-[12px] font-semibold leading-[15px]">
              <span className="min-w-0 truncate">
                <span style={priceStyle}>{listing.price}</span>{' '}
                {listing.priceSuffix === '' ? null : <span style={priceStyle}>{listing.priceSuffix ?? 'pour 2 nuits'}</span>}
              </span>
              {listing.rating ? (
                <span className="shrink-0" aria-label={`Note ${listing.rating} sur 5`}>
                  <span className="inline-flex items-center gap-1">
                    <span aria-hidden="true">·</span>
                    <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    {listing.rating}
                  </span>
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Enregistrer ${listing.title ?? listing.location}`}
        aria-pressed={isSaved}
        onClick={() => setIsSaved((saved) => !saved)}
        className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-full text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] transition hover:scale-105"
      >
        {isSaved ? (
          <Heart className="h-6 w-6 text-[var(--color-primary-500)]" fill="currentColor" aria-hidden="true" />
        ) : (
          <Heart className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </article>
  );
}

function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  onPrevious,
  onNext
}: {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        {onSeeAll ? (
          <button type="button" onClick={onSeeAll} className="group flex min-h-11 min-w-0 items-center gap-1.5 text-left sm:min-h-0">
            <h2 className="truncate text-[18px] font-bold tracking-[-0.025em] text-slate-900 sm:text-[22px]">{title}</h2>
            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-200/70 transition group-hover:bg-slate-200">
              <ArrowRight className="h-2 w-2 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </button>
        ) : (
          <h2 className="flex min-h-11 items-center truncate text-[18px] font-bold tracking-[-0.025em] text-slate-900 sm:min-h-0 sm:text-[22px]">{title}</h2>
        )}
        {subtitle ? <p className="mt-0.5 truncate text-[11.76px] text-slate-500 sm:text-[13px]">{subtitle}</p> : null}
      </div>
      <div className="hidden shrink-0 items-center gap-[6px] sm:flex">
        <button
          type="button"
          aria-label="Défiler à gauche"
          onClick={onPrevious}
          className="hidden h-[28px] w-[28px] items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-900 sm:inline-flex"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Défiler à droite"
          onClick={onNext}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full sm:h-[28px] sm:w-[28px] bg-slate-100 text-slate-800 transition hover:bg-slate-200"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function PropertyRail({
  title,
  subtitle,
  listings,
  sectionClassName,
  onSeeAll
}: {
  title: string;
  subtitle?: string;
  listings: Listing[];
  sectionClassName?: string;
  /** Omit for rails without a See all destination. */
  onSeeAll?: (sectionTitle: string) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (direction: -1 | 1) => {
    railRef.current?.scrollBy({
      left: direction * Math.min(railRef.current.clientWidth * 0.8, 840),
      behavior: 'smooth'
    });
  };

  return (
    <section className={`space-y-3 ${sectionClassName ?? ''}`}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        onSeeAll={onSeeAll ? () => onSeeAll(title) : undefined}
        onPrevious={() => scrollRail(-1)}
        onNext={() => scrollRail(1)}
      />

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-[12px] overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] max-sm:-mx-4 max-sm:scroll-pl-4 max-sm:[&>*:first-child]:ml-4 max-sm:[&>*:last-child]:mr-4 [&::-webkit-scrollbar]:hidden"
      >
        {listings.map((listing) => (
          <ListingCard key={listing.id ?? `${listing.location}-${listing.price}`} listing={listing} />
        ))}

        {onSeeAll ? (
          <SeeAllCard
            title={title}
            images={listings.map((listing) => listing.image)}
            onClick={() => onSeeAll(title)}
          />
        ) : null}
      </div>
    </section>
  );
}

// Explore tags in BooksaHeader (navigation namespace) for each listing category.
const categoryTagKeys: Record<ExploreCategoryId, 'hotel' | 'room' | 'restaurant'> = {
  hotel: 'hotel',
  'private-room': 'room',
  restaurant: 'restaurant'
};

type PublishedState =
  | { status: 'signed-out' | 'loading' | 'error' }
  | { status: 'loaded'; listings: PublishedListingSummary[] };

function usePublishedListings(userId: string | undefined, attempt: number): PublishedState {
  const [state, setState] = useState<PublishedState>({ status: userId ? 'loading' : 'signed-out' });

  useEffect(() => {
    if (!userId) {
      setState({ status: 'signed-out' });
      return;
    }
    let active = true;
    setState({ status: 'loading' });
    listPublishedListings()
      .then((listings) => { if (active) setState({ status: 'loaded', listings }); })
      .catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, [userId, attempt]);

  return state;
}

function PublishedRailSkeleton({ label }: { label: string }) {
  return (
    <section role="status" aria-label={label} className="space-y-3">
      <div className="h-6 w-40 animate-pulse rounded-button bg-[var(--color-surface-muted)]" />
      <div className="flex gap-[12px] overflow-hidden">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="marketplace-reference-card shrink-0">
            <div className="aspect-[1.04/1] animate-pulse rounded-photo bg-[var(--color-surface-muted)]" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded-button bg-[var(--color-surface-muted)]" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage({ category }: { category?: ExploreCategoryId } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const authRequest = location.state as { authRequired?: boolean; from?: { pathname: string; search?: string; hash?: string } } | null;
  const { t, i18n } = useTranslation('booking');
  const { t: tNavigation } = useTranslation('navigation');
  const { t: tCommon } = useTranslation('common');
  const userId = useAuthStore((state) => state.user?.id);
  const [publishedAttempt, setPublishedAttempt] = useState(0);
  const published = usePublishedListings(userId, publishedAttempt);

  const toCard = (listing: PublishedListingSummary): Listing => ({
    id: listing.id,
    image: listing.coverImageUrl,
    location: listing.title,
    title: listing.title,
    description: listing.location,
    price: formatCurrency(listing.basePrice, listing.currency, i18n.resolvedLanguage),
    // TODO(team): confirm what basePrice means for restaurants; no unit is shown until then.
    priceSuffix: listing.category === 'restaurant' ? '' : t('explorePublished.perNight'),
    rating: '',
    // Tag from "Which of these best describes your place?" (flowDraft.listingCategory).
    badge: t(`propertyTypeStep.categories.${listing.category}`)
  });
  // Same city always gets the same phrase, so titles stay stable across reloads.
  const cityRailTitle = (category: ExploreCategoryId, city: string | null) => {
    if (!city) return null;
    // returnObjects interpolates {{city}} into every phrase of the array.
    const phrases = t(`explorePublished.cityTitles.${category}`, { returnObjects: true, city }) as unknown;
    if (!Array.isArray(phrases) || phrases.length === 0) return city;
    const seed = [...`${category}:${city.toLowerCase()}`].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);
    return String(phrases[seed % phrases.length]);
  };
  const publishedRails = published.status === 'loaded'
    ? groupExploreRails(category ? published.listings.filter((listing) => listing.category === category) : published.listings)
    : [];

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <BooksaHeader />

      <main className="marketplace-reference-container mx-auto space-y-8 overflow-hidden px-4 pb-24 pt-4 sm:space-y-9 sm:px-6 sm:py-8 lg:space-y-10 lg:px-0 lg:pb-11 lg:pt-10">
        {published.status === 'signed-out' && !category ? (
          <ExploreTabContent sections={HOME_TAB_SECTIONS} onOpenMap={() => navigate(ROUTES.seeAll)} />
        ) : null}
        {/* Listings deployed by hosts ("Ready for guests"), one rail per tag + city (max 10 rails × 7 listings). */}
        {published.status === 'loading' ? <PublishedRailSkeleton label={t('explorePublished.loading')} /> : null}
        {published.status === 'error' ? (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            <span>{t('explorePublished.loadError')}</span>
            <button
              type="button"
              onClick={() => setPublishedAttempt((value) => value + 1)}
              className="min-h-11 rounded-button px-3 font-semibold text-[var(--color-text-primary)] underline underline-offset-4"
            >
              {tCommon('actions.retry')}
            </button>
          </div>
        ) : null}
        {published.status === 'signed-out' && category ? (
          <EmptyState
            title={t('explorePublished.signedOutTitle')}
            description={t('explorePublished.signedOutDescription')}
            actionLabel={t('explorePublished.signIn')}
            onAction={() => navigate(location.pathname, { state: { authRequired: true, from: { pathname: location.pathname } } })}
          />
        ) : null}
        {published.status === 'loaded' && publishedRails.length === 0 ? (
          <EmptyState
            title={category ? t(`explorePublished.emptyCategory.${category}.title`) : t('explorePublished.emptyTitle')}
            description={category ? t(`explorePublished.emptyCategory.${category}.description`) : t('explorePublished.emptyDescription')}
          />
        ) : null}
        {publishedRails.map(({ key, category, city, listings }) => (
          <PropertyRail
            key={key}
            title={cityRailTitle(category, city) ?? tNavigation(categoryTagKeys[category])}
            listings={listings.map(toCard)}
          />
        ))}

      </main>

      <AuthRequiredSheet
        open={Boolean(authRequest?.authRequired)}
        from={authRequest?.from}
        onClose={() => navigate(location.pathname, { replace: true, state: null })}
      />

      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
