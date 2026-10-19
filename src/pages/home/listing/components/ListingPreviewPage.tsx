import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import type { CustomTypeOptions } from 'i18next';
import {
  AlarmSmoke,
  CalendarX2,
  Flag,
  Heart,
  Home,
  KeyRound,
  Search,
  Share,
  ShieldCheck,
  Star,
  type LucideIcon
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { BooksaMap, type MapPoint } from '@/components/maps/BooksaMap';
import { formatDate, formatDateRange } from '@/utils/formatters';
import { getListingCategory } from '../create-listing/listingCategories';
import { getAmenityGroups } from '../create-listing/components/AmenitiesStep';
import { useHostProfile } from './ListingHostCard';
import { EMPTY_STAY, nightsBetween, type StayRange, type StayRules } from '@/domain/calendar';
import { PreviewStayCalendar, dateKeyToDate } from './PreviewStayCalendar';
import { ListingStayDatesSheet } from './ListingStayDatesSheet';
import { ListingPhotoGalleryPage } from './ListingPhotoGalleryPage';

type AmenitiesCopy = CustomTypeOptions['resources']['dashboard']['listingAmenities'];

const PREVIEW_AMENITY_COUNT = 4;
const SAFETY_ALARMS = [
  { id: 'carbon-monoxide-alarm', icon: ShieldCheck },
  { id: 'smoke-alarm', icon: AlarmSmoke }
] as const;

export type ListingPreviewData = {
  title: string;
  photoUrls: string[];
  propertyType: string;
  placeLabel: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  guests: number;
  description: string | null;
  categoryId: unknown;
  amenityIds: string[];
  mapCenter: MapPoint;
  hasLocation: boolean;
  stayRules: StayRules;
  timeZone?: string;
};

const sectionClass = 'border-t border-[var(--color-border)] py-8';
const sectionHeadingClass = 'text-[1.245699rem] font-semibold tracking-tight';

// Guest-facing preview of the host's own listing. Guest actions (share, save, message, report) are
// not available until the listing is published, so they explain that instead of acting.
export function ListingPreviewPage({ data, onBack }: { data: ListingPreviewData; onBack: () => void }) {
  const { t, i18n } = useTranslation('dashboard');
  const host = useHostProfile();
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [stay, setStay] = useState<StayRange>(EMPTY_STAY);
  const [isDatesSheetOpen, setIsDatesSheetOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const galleryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const calendarHeadingRef = useRef<HTMLHeadingElement>(null);
  const photoCount = data.photoUrls.length;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  // Stay summary for the calendar heading and booking bar; dates are calendar days in the listing's zone.
  const stayNights = stay.checkIn && stay.checkOut ? nightsBetween(stay.checkIn, stay.checkOut) : null;
  const shortDate = (key: string) => formatDate(dateKeyToDate(key), i18n.language, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const longDate = (key: string) => formatDate(dateKeyToDate(key), i18n.language, { dateStyle: 'medium', timeZone: 'UTC' });
  const calendarHeading = stayNights !== null
    ? t('listingPreview.nightsIn', { count: stayNights, place: data.placeLabel || data.title })
    : stay.checkIn
      ? t('listingPreview.selectCheckOut')
      : t('listingPreview.selectCheckIn');
  const calendarHelp = stayNights !== null && stay.checkIn && stay.checkOut
    ? `${longDate(stay.checkIn)} – ${longDate(stay.checkOut)}`
    : stay.checkIn && data.stayRules.minNights > 1
      ? t('listingPreview.minimumStay', { count: data.stayRules.minNights })
      : t('listingPreview.selectCheckInHelp');

  const scrollToCalendar = () => {
    calendarHeadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    calendarHeadingRef.current?.focus({ preventScroll: true });
  };
  // An unpublished listing can't be booked, so a complete stay explains that (like a turned-off listing).
  const changeStay = (next: StayRange) => {
    setStay(next);
    if (next.checkIn && next.checkOut) toast.error(t('listingPreview.notBookable'), { id: 'listing-not-bookable' });
  };

  const previewOnly = () => toast(t('listingPreview.previewOnly'), { id: 'listing-preview-only' });

  // Amenity catalog for the listing category; unknown IDs are skipped.
  const category = getListingCategory(typeof data.categoryId === 'string' ? data.categoryId : null);
  const catalog = category ? getAmenityGroups(category).flatMap((group) => group.amenities) : [];
  const offered = data.amenityIds
    .map((id) => catalog.find((amenity) => amenity.id === id))
    .filter((amenity): amenity is (typeof catalog)[number] => Boolean(amenity))
    .map(({ id, icon }) => ({ id, icon: icon as LucideIcon, missing: false }));
  const missingAlarms = SAFETY_ALARMS
    .filter(({ id }) => !data.amenityIds.includes(id))
    .map(({ id, icon }) => ({ id, icon: icon as LucideIcon, missing: true }));
  const amenityRows = [...offered, ...missingAlarms];
  const visibleAmenities = showAllAmenities ? amenityRows : amenityRows.slice(0, PREVIEW_AMENITY_COUNT);
  const amenityLabel = (id: string) => t(`listingAmenities.labels.${id as keyof AmenitiesCopy['labels']}`);

  const hostAvatar = host.avatarUrl && failedAvatar !== host.avatarKey ? host.avatarUrl : undefined;
  const hostInitial = host.name.charAt(0).toLocaleUpperCase(i18n.language);
  const hostingMonths = host.createdDate
    ? Math.max(1, Math.floor((Date.now() - host.createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
    : null;
  const hostingSince = hostingMonths === null
    ? null
    : hostingMonths >= 12
      ? t('listingPreview.yearsHosting', { count: Math.floor(hostingMonths / 12) })
      : t('listingPreview.monthsHosting', { count: hostingMonths });

  const avatar = (sizeClass: string, textClass: string) => (
    <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-100)] font-semibold text-[var(--color-primary-700)] ${sizeClass} ${textClass}`}>
      {hostAvatar ? (
        <ShimmerImage src={hostAvatar} alt="" className="h-full w-full object-cover" onError={() => setFailedAvatar(host.avatarKey)} />
      ) : <span aria-hidden="true">{hostInitial}</span>}
    </span>
  );

  const thingsToKnow: { id: string; icon: LucideIcon; title: string; lines: string[] }[] = [
    { id: 'cancellation', icon: CalendarX2, title: t('listingPreview.cancellationPolicy'), lines: [t('listingPreview.cancellationHelp')] },
    { id: 'houseRules', icon: KeyRound, title: t('houseRulesPage.heading'), lines: [t('listingPreview.guestsMaximum', { count: data.guests })] },
    {
      id: 'safety',
      icon: ShieldCheck,
      title: t('listingPreview.safetyProperty'),
      lines: missingAlarms.length
        ? missingAlarms.map(({ id }) => t('listingPreview.notReported', { amenity: amenityLabel(id) }))
        : [t('listingPreview.alarmsReported')]
    }
  ];

  return (
    <section
      aria-labelledby="listing-preview-heading"
      className="relative min-h-[calc(100dvh-96px)] bg-[var(--color-surface)] pb-[calc(128px+72px+env(safe-area-inset-bottom))] text-[var(--color-text-primary)] md:pb-28 [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[var(--color-text-primary)]"
    >
      <div className="mx-auto w-full max-w-[720px] md:px-8 md:pt-6">
        {/* Photo carousel: swipe on touch, scroll-snap elsewhere; the counter follows the visible slide. */}
        <div className="relative h-[340px] overflow-hidden bg-[var(--color-surface-muted)] md:h-[420px] md:rounded-card">
          {photoCount > 0 ? (
            <div
              className="flex h-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-roledescription={t('listingPreview.carousel')}
              aria-label={t('listingPreview.photos')}
              onScroll={(event) => {
                const { scrollLeft, clientWidth } = event.currentTarget;
                setPhotoIndex(Math.round(scrollLeft / Math.max(clientWidth, 1)));
              }}
            >
              {data.photoUrls.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={t('listingPreview.openGallery', { number: index + 1, total: photoCount })}
                  onClick={(event) => {
                    galleryTriggerRef.current = event.currentTarget;
                    setGalleryIndex(index);
                  }}
                  className="h-full w-full shrink-0 snap-center cursor-zoom-in focus-visible:-outline-offset-4"
                >
                  <ShimmerImage
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
              <Home className="h-10 w-10" aria-hidden="true" />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <BackButton label={t('listingPreview.back')} onClick={onBack} variant="outlined" className="pointer-events-auto border-transparent shadow-[var(--shadow-sm)]" />
            <div className="pointer-events-auto flex gap-3">
              <IconButton label={t('listingPreview.share')} onClick={previewOnly} icon={<Share strokeWidth={1.5} aria-hidden="true" />} className="border-transparent shadow-[var(--shadow-sm)]" />
              <IconButton label={t('listingPreview.save')} onClick={previewOnly} icon={<Heart strokeWidth={1.5} aria-hidden="true" />} className="border-transparent shadow-[var(--shadow-sm)]" />
            </div>
          </div>
          {photoCount > 1 ? (
            <span aria-hidden="true" className="absolute bottom-10 right-4 rounded-full bg-[color-mix(in_srgb,var(--color-text-primary)_70%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-surface)] md:bottom-4">
              {photoIndex + 1} / {photoCount}
            </span>
          ) : null}
        </div>

        <div className="relative -mt-6 rounded-t-dialog bg-[var(--color-surface)] px-6 pt-8 md:mt-0 md:rounded-none md:px-0">
          <header className="pb-8 text-center">
            <h1 id="listing-preview-heading" ref={headingRef} tabIndex={-1} className="text-[1.660932rem] font-semibold leading-tight tracking-tight outline-none">
              {data.title}
            </h1>
            <p className="mt-3 text-[0.830466rem] text-[var(--color-text-secondary)]">
              {data.placeLabel ? t('listingPreview.typeIn', { type: data.propertyType, place: data.placeLabel }) : data.propertyType}
            </p>
            <p className="mt-1 text-[0.830466rem] text-[var(--color-text-secondary)]">
              {[
                t('listingPreview.bedrooms', { count: data.bedrooms }),
                t('listingPreview.beds', { count: data.beds }),
                t('listingPreview.bathrooms', { count: data.bathrooms })
              ].join(' · ')}
            </p>
            <p className="mt-4 inline-flex items-center gap-1 text-[0.72665775rem] font-medium">
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
              {t('listingPreview.noReviews')}
            </p>
          </header>

          <div className={`${sectionClass} flex items-center gap-4`} aria-busy={host.loading}>
            {avatar('h-11 w-11', 'text-[0.830466rem]')}
            <div className="min-w-0">
              <p className="truncate text-[0.93427425rem] font-medium">{t('listingPreview.hostedBy', { name: host.name })}</p>
              {hostingSince ? <p className="text-[0.830466rem] text-[var(--color-text-secondary)]">{hostingSince}</p> : null}
            </div>
          </div>

          <div className={sectionClass}>
            <p className="whitespace-pre-line break-words text-[0.93427425rem] leading-relaxed">
              {data.description ?? t('listingPreview.noDescription')}
            </p>
          </div>

          <div className={sectionClass}>
            <h2 className={sectionHeadingClass}>{t('listingPreview.offers')}</h2>
            {amenityRows.length > 0 ? (
              <ul className="mt-6 grid gap-5">
                {visibleAmenities.map(({ id, icon: Icon, missing }) => (
                  <li key={id} className="flex items-center gap-4 text-[0.93427425rem]">
                    <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    {missing ? (
                      <span>
                        <span className="line-through">{amenityLabel(id)}</span>
                        <span className="sr-only"> ({t('listingPreview.unavailable')})</span>
                      </span>
                    ) : amenityLabel(id)}
                  </li>
                ))}
              </ul>
            ) : null}
            {offered.length > 0 && amenityRows.length > PREVIEW_AMENITY_COUNT ? (
              <button
                type="button"
                aria-expanded={showAllAmenities}
                onClick={() => setShowAllAmenities((current) => !current)}
                className="mt-8 min-h-12 w-full rounded-button bg-[var(--color-surface-muted)] px-6 text-[0.830466rem] font-semibold transition hover:brightness-95"
              >
                {showAllAmenities ? t('listingPreview.showFewerAmenities') : t('listingPreview.showAllAmenities', { count: offered.length })}
              </button>
            ) : null}
          </div>

          <div className={sectionClass}>
            <h2 className={sectionHeadingClass}>{t('listingPreview.whereYoullBe')}</h2>
            <p className="mt-4 text-[0.93427425rem]">{data.placeLabel || t('listingPreview.locationMissing')}</p>
            <BooksaMap
              center={data.mapCenter}
              initialZoom={14}
              title={t('listingPreview.mapTitle', { place: data.placeLabel || data.title })}
              className="mt-6 h-[280px] w-full"
            >
              {data.hasLocation ? (
                <span className="pointer-events-none absolute left-1/2 top-1/2 inline-flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)] shadow-[var(--shadow-md)]">
                  <Home className="h-5 w-5" aria-hidden="true" />
                </span>
              ) : null}
            </BooksaMap>
          </div>

          <div className={sectionClass}>
            <div aria-live="polite">
              <h2 ref={calendarHeadingRef} tabIndex={-1} className={`${sectionHeadingClass} outline-none`}>{calendarHeading}</h2>
              <p className="mt-1 text-[0.830466rem] text-[var(--color-text-secondary)]">{calendarHelp}</p>
            </div>
            <div className="mt-6">
              <PreviewStayCalendar range={stay} rules={data.stayRules} timeZone={data.timeZone} onChange={changeStay} />
            </div>
          </div>

          <div className={sectionClass}>
            <h2 className={sectionHeadingClass}>{t('listingPreview.noReviewsHeading')}</h2>
            <p className="mt-4 text-[0.93427425rem]">{t('listingPreview.beFirst')}</p>

            <div className="mt-8 rounded-card bg-[var(--color-surface-muted)] px-5 py-8 text-center">
              <h3 className="text-[1.038rem] font-semibold">{t('listingPreview.askAboutHome')}</h3>
              <button
                type="button"
                onClick={previewOnly}
                className="mx-auto mt-5 flex min-h-12 w-full max-w-sm items-center gap-3 rounded-full bg-[var(--color-surface)] px-5 text-left text-[0.830466rem] text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)]"
              >
                <Search className="h-4 w-4 shrink-0 text-[var(--color-text-primary)]" aria-hidden="true" />
                {t('listingPreview.askPlaceholder')}
              </button>
            </div>
          </div>

          <div className={sectionClass}>
            <h2 className={sectionHeadingClass}>{t('listingPreview.meetHost')}</h2>
            <div className="mt-6 flex flex-col items-center rounded-card bg-[var(--color-surface)] px-6 py-8 text-center shadow-[var(--shadow-md)] dark:border dark:border-[var(--color-border)]">
              {avatar('h-24 w-24', 'text-[2rem]')}
              <p className="mt-4 text-[1.245699rem] font-semibold">{host.name}</p>
              {host.createdDate ? (
                <p className="text-[0.6228495rem] text-[var(--color-text-secondary)]">
                  {t('listingPreview.startedHosting', { year: formatDate(host.createdDate, i18n.language, { year: 'numeric' }) })}
                </p>
              ) : null}
              {host.error ? (
                <button type="button" onClick={host.retry} className="mt-2 min-h-11 rounded-button px-3 text-[0.72665775rem] font-semibold underline">
                  {t('listingHost.retry')}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={previewOnly}
              className="mt-8 min-h-12 w-full rounded-button bg-[var(--color-surface-muted)] px-6 text-[0.830466rem] font-semibold transition hover:brightness-95"
            >
              {t('listingPreview.messageHost')}
            </button>
            <p className="mt-6 flex items-start gap-3 text-[0.6228495rem] leading-relaxed text-[var(--color-text-secondary)]">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--color-text-primary)]" strokeWidth={1.5} aria-hidden="true" />
              {t('listingPreview.paymentProtection')}
            </p>
          </div>

          <div className={sectionClass}>
            <h2 className={sectionHeadingClass}>{t('listingPreview.thingsToKnow')}</h2>
            <ul className="mt-6 grid gap-6">
              {thingsToKnow.map(({ id, icon: Icon, title, lines }) => (
                <li key={id} className="flex items-start gap-4">
                  <Icon className="mt-0.5 h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-[0.830466rem] font-semibold">{title}</p>
                    {lines.map((line) => (
                      <p key={line} className="text-[0.830466rem] leading-snug text-[var(--color-text-secondary)]">{line}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={sectionClass}>
            <button type="button" onClick={previewOnly} className="inline-flex min-h-11 items-center gap-3 rounded-button text-[0.830466rem] font-semibold underline underline-offset-4">
              <Flag className="h-4 w-4" aria-hidden="true" />
              {t('listingPreview.report')}
            </button>
          </div>
        </div>
      </div>

      {/* Fixed booking bar; sits above the host tab bar below md. Stacked until a stay is chosen, then one row. */}
      <div className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)] md:bottom-0">
        <div
          className={`mx-auto flex w-full max-w-[720px] gap-3 px-6 py-3 md:px-8 md:pb-[max(12px,env(safe-area-inset-bottom))] ${
            stayNights !== null ? 'flex-row items-center justify-between' : 'flex-col sm:flex-row sm:items-center sm:justify-between'
          }`}
        >
          {stayNights !== null && stay.checkIn && stay.checkOut ? (
            <button
              type="button"
              onClick={() => setIsDatesSheetOpen(true)}
              aria-haspopup="dialog"
              aria-label={t('listingPreview.editDates', {
                dates: formatDateRange(dateKeyToDate(stay.checkIn), dateKeyToDate(stay.checkOut), i18n.language, { month: 'short', day: 'numeric', timeZone: 'UTC' })
              })}
              className="min-h-11 min-w-0 rounded-button text-left text-[0.830466rem] font-medium underline underline-offset-4"
            >
              {formatDateRange(dateKeyToDate(stay.checkIn), dateKeyToDate(stay.checkOut), i18n.language, { month: 'short', day: 'numeric', timeZone: 'UTC' })}
            </button>
          ) : (
            <p className="text-[0.830466rem] font-semibold">
              {stay.checkIn ? t('listingPreview.checkInOn', { date: shortDate(stay.checkIn) }) : t('listingPreview.addDates')}
            </p>
          )}
          {/* TODO(team): enable real availability checks and Reserve once bookings and pricing exist. */}
          <Button
            fullWidth={false}
            // Theme primary + pill radius; vertical padding is 10% under Button's default
            // (14px → 12.6px at sm+, 16px → 14.4px on mobile around the 20/24px line height).
            className={`h-[45.2px]! rounded-pill! bg-[var(--color-primary-500)]! hover:bg-[var(--color-primary-600)]! focus:ring-[var(--color-primary-500)]! max-sm:h-[52.8px]! ${
              stayNights !== null ? 'w-auto shrink-0 px-8' : 'w-full sm:w-auto sm:px-10'
            }`}
            aria-haspopup={stayNights !== null ? 'dialog' : undefined}
            onClick={stayNights !== null ? () => setIsDatesSheetOpen(true) : scrollToCalendar}
          >
            {stayNights !== null ? t('listingPreview.changeDates') : t('listingPreview.checkAvailability')}
          </Button>
        </div>
      </div>
      {galleryIndex !== null ? (
        <ListingPhotoGalleryPage
          title={data.title}
          photoUrls={data.photoUrls}
          initialIndex={galleryIndex}
          onBack={() => {
            setGalleryIndex(null);
            requestAnimationFrame(() => galleryTriggerRef.current?.focus({ preventScroll: true }));
          }}
        />
      ) : null}
      <ListingStayDatesSheet
        open={isDatesSheetOpen}
        range={stay}
        rules={data.stayRules}
        timeZone={data.timeZone}
        onClose={() => setIsDatesSheetOpen(false)}
        onSave={(next) => {
          setIsDatesSheetOpen(false);
          changeStay(next);
        }}
        onClear={() => {
          // Reset the stay and close so the bar is back to "Check availability".
          setIsDatesSheetOpen(false);
          setStay(EMPTY_STAY);
        }}
      />
    </section>
  );
}
