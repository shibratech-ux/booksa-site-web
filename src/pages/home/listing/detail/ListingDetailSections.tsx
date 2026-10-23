import { useState, type ReactNode } from 'react';
import { CalendarX2, Home, KeyRound, Search, ShieldCheck, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BooksaMap } from '@/components/maps/BooksaMap';
import { Modal } from '@/components/ui/Modal';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { sampleCancellation, sampleReviews } from './sampleListingContent';
import { StayCalendar, type StayRange } from './StayCalendar';
import type { ListingDetailView } from './useListingDetailView';

const AMENITY_PREVIEW_COUNT = 6;
const secondaryButton = 'min-h-12 w-full rounded-button bg-[var(--color-surface-muted)] px-6 text-base font-semibold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto';

function Section({ id, title, children, className = '' }: { id?: string; title?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={id && title ? `${id}-title` : undefined} className={`border-t border-[var(--color-border-subtle)] py-8 ${className}`}>
      {title ? <h2 id={id ? `${id}-title` : undefined} className="mb-5 text-[22px] font-semibold leading-tight tracking-tight">{title}</h2> : null}
      {children}
    </section>
  );
}

function Avatar({ name, size = 'md' }: { name: string | null; size?: 'md' | 'lg' }) {
  const initial = (name?.trim()[0] ?? 'B').toUpperCase();
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-text-primary)] font-semibold text-[var(--color-surface)] ${size === 'lg' ? 'h-24 w-24 text-4xl' : 'h-12 w-12 text-lg'}`}>
      {initial}
    </span>
  );
}

/** Title block: centered sheet over the hero on mobile, left aligned from `md`. */
export function DetailHeader({ view }: { view: ListingDetailView }) {
  const { t } = useTranslation('booking');
  return (
    <header className="relative -mt-6 rounded-t-dialog bg-[var(--color-surface)] px-6 pt-7 text-center md:mt-0 md:rounded-none md:px-0 md:pt-0 md:text-left">
      <h1 className="text-[26px] font-semibold leading-tight tracking-tight md:text-[32px]">{view.title}</h1>
      <p className="mt-3 text-sm text-[var(--color-text-secondary)] md:text-base md:text-[var(--color-text-primary)]">{view.subtitle}</p>
      {view.facts.length ? <p className="mt-1 text-sm text-[var(--color-text-secondary)] md:text-base">{view.facts.join(' · ')}</p> : null}

      {view.sample ? (
        <>
          <a href="#reviews" className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm underline-offset-2 md:hidden">
            <Star className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
            <span>{view.sample.rating}</span>
            <span aria-hidden="true">·</span>
            <span className="underline">{t('listingDetail.reviews', { count: view.sample.reviewCount })}</span>
          </a>
          <div className="mt-6 hidden grid-cols-[1fr_auto_1fr_auto_1fr] items-center rounded-card py-3 md:grid md:max-w-xl md:border md:border-[var(--color-border)] md:px-4">
            <div className="text-center">
              <p className="text-lg font-semibold leading-none">{view.sample.rating}</p>
              <p className="mt-1 inline-flex gap-px" aria-label={t('listingDetail.ratingLabel', { rating: view.sample.rating })}>
                {Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-2.5 w-2.5" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />)}
              </p>
            </div>
            <span className="h-8 w-px bg-[var(--color-border)]" aria-hidden="true" />
            <p className="px-3 text-center text-[15px] font-semibold leading-tight">{t('listingDetail.guestFavorite')}</p>
            <span className="h-8 w-px bg-[var(--color-border)]" aria-hidden="true" />
            <div className="text-center">
              <p className="text-lg font-semibold leading-none">{view.sample.reviewCount}</p>
              <p className="mt-1 text-xs font-semibold">{t('listingDetail.reviews', { count: view.sample.reviewCount })}</p>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
          <Star className="h-4 w-4" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
          {t('listingDetail.new')}
          <span className="font-normal text-[var(--color-text-secondary)]">· {t('listingDetail.noReviews')}</span>
        </p>
      )}
    </header>
  );
}

export function HostAndHighlights({ view }: { view: ListingDetailView }) {
  const { t } = useTranslation('booking');
  return (
    <>
      <Section className="!py-5 md:!py-8">
        <div className="flex items-center gap-4">
          <Avatar name={view.hostName} />
          <div className="min-w-0">
            <p className="text-base font-semibold">{view.hostName ? t('listingDetail.hostedBy', { name: view.hostName }) : t('listingDetail.hostedOnBooksa')}</p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {view.sample ? t('listingDetail.sampleHostMeta', { count: view.sample.host.yearsHosting }) : t('listingDetail.hostOnBooksa')}
            </p>
          </div>
        </div>
      </Section>
      {view.highlights.length ? (
        <Section className="!py-6 md:!py-8">
          <ul className="space-y-5 md:space-y-6">
            {view.highlights.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-4 md:gap-5">
                <Icon className="mt-0.5 h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold md:text-base">{title}</p>
                  <p className="mt-0.5 text-sm leading-5 text-[var(--color-text-secondary)]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}

export function DescriptionSection({ view }: { view: ListingDetailView }) {
  const { t } = useTranslation('booking');
  const [open, setOpen] = useState(false);
  return (
    <Section>
      {view.description ? (
        <>
          <p className="whitespace-pre-line text-base leading-6">{view.description}</p>
          {view.description.length > 500 ? <button type="button" onClick={() => setOpen(true)} className={`${secondaryButton} mt-6`}>{t('listingDetail.showMore')}</button> : null}
          <Modal open={open} onClose={() => setOpen(false)} title={t('listingDetail.aboutTitle')} variant="bottom-sheet">
            <p className="whitespace-pre-line pb-6 text-base leading-7">{view.description}</p>
          </Modal>
        </>
      ) : (
        <p className="text-base text-[var(--color-text-secondary)]">{t('listingDetail.noDescription')}</p>
      )}
    </Section>
  );
}

/** Sample cards only: real listings have no reviews yet. */
export function SampleReviewsSection({ view }: { view: ListingDetailView }) {
  const { t } = useTranslation('booking');
  const [open, setOpen] = useState(false);
  if (!view.sample) return null;
  const { rating, reviewCount } = view.sample;

  const reviewCard = (review: typeof sampleReviews[number], wide = false) => (
    <article key={review.name} className={wide ? '' : 'w-[78%] shrink-0 snap-start border-r border-[var(--color-border-subtle)] pr-5 sm:w-[46%] md:w-auto md:border-r-0 md:pr-0'}>
      <div className="flex items-center gap-3">
        <ShimmerImage src={review.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
        <div>
          <h3 className="text-base font-semibold">{review.name}</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">{review.location}</p>
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
        {Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-2.5 w-2.5" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />)}
        <span className="ml-1 font-normal text-[var(--color-text-secondary)]">· {review.meta}</span>
      </p>
      <p className={`mt-2 text-base leading-6 ${wide ? '' : 'line-clamp-4'}`}>{review.text}</p>
    </article>
  );

  return (
    <Section id="reviews">
      <div className="md:hidden">
        <h2 id="reviews-title" className="flex items-center gap-2 text-[22px] font-semibold tracking-tight">
          <Star className="h-5 w-5" fill="currentColor" aria-hidden="true" />
          <span aria-label={t('listingDetail.ratingLabel', { rating })}>{rating}</span>
          <span aria-hidden="true">·</span>
          {t('listingDetail.reviews', { count: reviewCount })}
        </h2>
      </div>
      <div className="hidden text-center md:block">
        <p className="text-[64px] font-semibold leading-none tracking-tight" aria-label={t('listingDetail.ratingLabel', { rating })}>{rating}</p>
        <h2 className="mt-3 text-[22px] font-semibold">{t('listingDetail.guestFavorite')}</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-[var(--color-text-secondary)]">{t('listingDetail.guestFavoriteDescription')}</p>
      </div>
      <div className="mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] md:mt-8 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-8 md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {sampleReviews.map(review => reviewCard(review))}
      </div>
      <button type="button" onClick={() => setOpen(true)} className={`${secondaryButton} mt-6`}>
        {t('listingDetail.showAllReviews', { count: reviewCount })}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t('listingDetail.reviewsTitle')} variant="bottom-sheet">
        <div className="space-y-8 pb-6">{sampleReviews.map(review => reviewCard(review, true))}</div>
      </Modal>
    </Section>
  );
}

export function SleepAndAmenities({ view }: { view: ListingDetailView }) {
  const { t } = useTranslation('booking');
  const [open, setOpen] = useState(false);
  const preview = view.amenityGroups.flatMap(group => group.amenities).slice(0, AMENITY_PREVIEW_COUNT);
  const sleepPhoto = view.photos[1] ?? view.photos[0];

  return (
    <>
      {view.isStay && view.basics.bedrooms > 0 ? (
        <Section id="sleep" title={t('listingDetail.sleepTitle')}>
          <div className="w-56">
            <ShimmerImage src={sleepPhoto} alt="" className="aspect-[4/3] w-full rounded-card object-cover" />
            <p className="mt-3 text-base font-semibold">{t('listingDetail.facts.bedrooms', { count: view.basics.bedrooms })}</p>
            {view.basics.beds > 0 ? <p className="text-sm text-[var(--color-text-secondary)]">{t('listingDetail.facts.beds', { count: view.basics.beds })}</p> : null}
          </div>
        </Section>
      ) : null}

      <Section id="amenities" title={t('listingDetail.offersTitle')}>
        {preview.length ? (
          <>
            <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {preview.map(({ id, label, icon: Icon }) => (
                <li key={id} className="flex items-center gap-4 text-base">
                  <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
            {view.amenityCount > preview.length ? (
              <button type="button" onClick={() => setOpen(true)} className={`${secondaryButton} mt-8`}>
                {t('listingDetail.showAllAmenities', { count: view.amenityCount })}
              </button>
            ) : null}
            <Modal open={open} onClose={() => setOpen(false)} title={t('listingDetail.offersTitle')} variant="bottom-sheet">
              <div className="space-y-8 pb-6">
                {view.amenityGroups.map(group => (
                  <div key={group.id}>
                    <h3 className="text-lg font-semibold">{group.title}</h3>
                    <ul className="mt-2 divide-y divide-[var(--color-border-subtle)]">
                      {group.amenities.map(({ id, label, icon: Icon }) => (
                        <li key={id} className="flex min-h-16 items-center gap-4 text-base">
                          <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                          {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Modal>
          </>
        ) : (
          <p className="text-base text-[var(--color-text-secondary)]">{t('listingDetail.noAmenities')}</p>
        )}
      </Section>
    </>
  );
}

export function LocationSection({ view }: { view: ListingDetailView }) {
  const { t } = useTranslation('booking');
  return (
    <Section id="location" title={t('listingDetail.locationTitle')}>
      <p className="mb-5 text-base">{view.place.label}</p>
      <BooksaMap
        title={t('listingDetail.mapTitle', { place: view.place.label })}
        center={view.place.center}
        initialZoom={14}
        showControls={false}
        className="h-[280px] sm:h-[380px]"
        markers={[{ id: 'listing', label: view.title, ariaLabel: view.place.label, ...view.place.center }]}
        renderMarker={() => (
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)] shadow-[var(--shadow-md)]">
            <Home className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </span>
        )}
      />
      <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{t('listingDetail.exactLocationLater')}</p>
    </Section>
  );
}

export function AvailabilitySection({ view, range, onChange, nights }: {
  view: ListingDetailView;
  range: StayRange;
  onChange: (range: StayRange) => void;
  nights: number | null;
}) {
  const { t, i18n } = useTranslation('booking');
  const format = (value: string) =>
    new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`));
  return (
    <Section id="availability">
      <h2 id="availability-title" tabIndex={-1} className="text-[22px] font-semibold leading-tight tracking-tight outline-none">
        {nights && range.end ? t('nightsInCity', { count: nights, city: view.place.city }) : t('selectDates')}
      </h2>
      <p className="mb-5 mt-1 text-sm text-[var(--color-text-secondary)]">
        {range.start && range.end
          ? t('listingDetail.calendar.range', { start: format(range.start), end: format(range.end) })
          : t('listingDetail.calendar.addDatesHint')}
      </p>
      <StayCalendar range={range} onChange={onChange} />
    </Section>
  );
}

export function HostSection({ view }: { view: ListingDetailView }) {
  const { t } = useTranslation('booking');
  const host = view.sample?.host;
  return (
    <>
      <Section>
        <div className="rounded-dialog bg-[var(--color-surface-muted)] px-6 py-8 text-center">
          <h2 className="text-[22px] font-semibold">{t('listingDetail.askTitle')}</h2>
          {/* TODO(team): wire listing Q&A once messaging exists. */}
          <label className="mx-auto mt-5 flex min-h-14 max-w-sm items-center gap-3 rounded-full bg-[var(--color-surface)] px-5 shadow-[var(--shadow-md)]">
            <Search className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="sr-only">{t('listingDetail.askTitle')}</span>
            <input disabled placeholder={t('listingDetail.askPlaceholder')} className="min-w-0 flex-1 bg-transparent text-base outline-none disabled:cursor-not-allowed" />
          </label>
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">{t('listingDetail.comingSoon')}</p>
        </div>
      </Section>

      <Section id="host" title={t('listingDetail.meetHost')}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
          <div className="flex items-center justify-around gap-4 rounded-dialog border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-md)] sm:gap-6 sm:p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <Avatar name={view.hostName} size="lg" />
                {host ? (
                  <span className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-500)] text-white">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </span>
                ) : null}
              </div>
              <p className="mt-3 max-w-[180px] text-[22px] font-semibold leading-tight sm:text-[28px]">{view.hostName ?? t('listingDetail.hostOnBooksa')}</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{host ? t('listingDetail.superhost') : t('listingDetail.hostOnBooksa')}</p>
            </div>
            {host ? (
              <dl className="w-24 divide-y divide-[var(--color-border-subtle)]">
                {[
                  [String(host.reviews), t('listingDetail.statsReviews')],
                  [`${host.rating}★`, t('listingDetail.statsRating')],
                  [String(host.yearsHosting), t('listingDetail.statsYears')]
                ].map(([value, label]) => (
                  <div key={label} className="flex flex-col-reverse py-2.5">
                    <dt className="text-[11px] font-semibold">{label}</dt>
                    <dd className="text-xl font-semibold leading-tight">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
          <div>
            {host ? (
              <>
                <h3 className="text-lg font-semibold">{t('listingDetail.hostDetails')}</h3>
                <p className="mt-2 text-base leading-6">
                  {t('listingDetail.responseRate', { rate: host.responseRate })}<br />{t('listingDetail.respondsWithinHour')}
                </p>
              </>
            ) : null}
            {/* TODO(team): enable once threads/{id}/messages exist. */}
            <button type="button" disabled className={`${secondaryButton} mt-6`} aria-describedby="message-host-soon">
              {t('listingDetail.messageHost')}
            </button>
            <p id="message-host-soon" className="mt-2 text-xs text-[var(--color-text-secondary)]">{t('listingDetail.comingSoon')}</p>
            <p className="mt-6 flex items-start gap-3 border-t border-[var(--color-border-subtle)] pt-6 text-xs leading-5 text-[var(--color-text-secondary)]">
              <ShieldCheck className="h-6 w-6 shrink-0 text-[var(--color-primary-500)]" strokeWidth={1.5} aria-hidden="true" />
              {t('listingDetail.paymentProtection')}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}

export function ThingsToKnowSection({ view }: { view: ListingDetailView }) {
  const { t } = useTranslation('booking');
  const items = [
    { icon: KeyRound, title: t('listingDetail.houseRules'), lines: view.houseRules, empty: t('listingDetail.houseRulesUnset') },
    { icon: ShieldCheck, title: t('listingDetail.safety'), lines: [], empty: t('listingDetail.safetyUnset') },
    { icon: CalendarX2, title: t('listingDetail.cancellation'), lines: view.sample ? [sampleCancellation] : [], empty: t('listingDetail.cancellationUnset') }
  ];
  return (
    <Section id="things-to-know" title={t('listingDetail.thingsToKnow')}>
      <ul className="grid gap-6 md:grid-cols-3">
        {items.map(({ icon: Icon, title, lines, empty }) => (
          <li key={title} className="flex min-w-0 gap-4 md:flex-col">
            <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold md:text-base">{title}</h3>
              <ul className="mt-1 space-y-0.5 text-sm leading-5 text-[var(--color-text-secondary)]">
                {(lines.length ? lines : [empty]).map(line => <li key={line}>{line}</li>)}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
