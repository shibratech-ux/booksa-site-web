import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { CalendarDays, CalendarX2, ChevronLeft, ChevronRight, Heart, MapPin, MessageCircle, Share, Star, Users, Utensils, Accessibility } from 'lucide-react';
import BooksaHeader from '@/components/layout/BooksaHeader';
import Footer from '@/components/layout/Footer';
import { BooksaMap } from '@/components/maps/BooksaMap';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { listPublishedListings, type PublishedListingDetail, type PublishedListingSummary } from '@/services/listing-catalog.service';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ROUTES } from '@/utils/constants';
import { DesktopGallery } from './detail/DetailGallery';
import { RestaurantPhotoGallery } from './detail/RestaurantPhotoGallery';
import { RestaurantDatesSheet, type RestaurantVisitPreview } from './detail/RestaurantDatesSheet';
import type { ListingDetailView } from './detail/useListingDetailView';
import './restaurant-detail.css';

function Section({ id, title, action, children }: { id: string; title: string; action?: ReactNode; children: ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-title`} className="restaurant-section">
    <div className="restaurant-section-heading"><h2 id={`${id}-title`}>{title}</h2>{action}</div>
    {children}
  </section>;
}

function HostAvatar({ name, large = false }: { name: string | null; large?: boolean }) {
  return <span aria-hidden="true" className={`restaurant-avatar ${large ? 'restaurant-avatar-large' : ''}`}>
    {(name?.trim()[0] ?? 'B').toUpperCase()}
  </span>;
}

type RelatedState = { status: 'loading' | 'error' } | { status: 'loaded'; listings: PublishedListingSummary[] };

function RelatedRestaurants({ listing }: { listing: PublishedListingDetail }) {
  const { t, i18n } = useTranslation('booking');
  const [state, setState] = useState<RelatedState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    listPublishedListings().then(listings => {
      if (!active) return;
      const restaurants = listings.filter(item => item.category === 'restaurant' && item.id !== listing.id);
      // Show the current city first while retaining the catalog's ordering within each group.
      const sameCity = (item: PublishedListingSummary) => Boolean(listing.city && item.city?.toLowerCase() === listing.city.toLowerCase());
      setState({ status: 'loaded', listings: [...restaurants.filter(sameCity), ...restaurants.filter(item => !sameCity(item))].slice(0, 8) });
    }).catch(() => { if (active) setState({ status: 'error' }); });
    return () => { active = false; };
  }, [listing.id, listing.city, attempt]);

  return <Section id="restaurant-related" title={t('restaurantDetail.moreRestaurants')} action={state.status === 'loaded' && state.listings.length > 0 ? <div className="restaurant-rail-controls">
    <IconButton label={t('restaurantDetail.previous')} variant="muted" icon={<ChevronLeft />} onClick={() => rail.current?.scrollBy({ left: -300, behavior: 'smooth' })} />
    <IconButton label={t('restaurantDetail.next')} variant="muted" icon={<ChevronRight />} onClick={() => rail.current?.scrollBy({ left: 300, behavior: 'smooth' })} />
  </div> : null}>
    {state.status === 'loading' ? <p role="status" className="restaurant-muted">{t('explorePublished.loading')}</p> : null}
    {state.status === 'error' ? <div role="alert">
      <p className="restaurant-muted">{t('explorePublished.loadError')}</p>
      <button type="button" className="restaurant-secondary mt-3" onClick={() => setAttempt(value => value + 1)}>{t('restaurantDetail.retry')}</button>
    </div> : null}
    {state.status === 'loaded' && !state.listings.length ? <p className="restaurant-muted">{t('restaurantDetail.noRelated')}</p> : null}
    {state.status === 'loaded' && state.listings.length > 0 ? <>
      <div ref={rail} className="restaurant-related-rail">
        {state.listings.map(item => <Link key={item.id} to={generatePath(ROUTES.listingDetail, { listingId: item.id })} className="marketplace-reference-card shrink-0 snap-start">
          <ShimmerImage src={item.coverImageUrl} alt="" className="aspect-[1.04/1] w-full rounded-photo object-cover" />
          <h3 className="mt-2 text-[12px] font-semibold leading-[15px] sm:text-[13px] sm:leading-[17px]">{item.title}</h3>
          <p className="mt-1 text-xs leading-[15px] text-[var(--color-text-secondary)]">{item.city ?? item.location}</p>
          <p className="mt-1 text-xs font-semibold leading-[15px] text-[var(--color-text-secondary)]">{formatCurrency(item.basePrice, item.currency, i18n.resolvedLanguage)}</p>
        </Link>)}
      </div>
    </> : null}
  </Section>;
}

export default function RestaurantDetailPage({ listing, view }: { listing: PublishedListingDetail; view: ListingDetailView }) {
  const { t, i18n } = useTranslation('booking');
  const navigate = useNavigate();
  const gallery = useRef<HTMLDivElement>(null);
  const [carouselPhoto, setCarouselPhoto] = useState(0);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [datesOpen, setDatesOpen] = useState(false);
  const [visit, setVisit] = useState<RestaurantVisitPreview | null>(null);
  const amenities = view.amenityGroups.flatMap(group => group.amenities);
  const amenityStories = view.amenityGroups.flatMap(group => group.amenities.map(amenity => ({ ...amenity, groupTitle: group.title }))).slice(0, 4);
  const price = formatCurrency(listing.basePrice, listing.currency, i18n.resolvedLanguage);
  const hostLabel = listing.hostFirstName ? t('listingDetail.hostedBy', { name: listing.hostFirstName }) : t('listingDetail.hostedOnBooksa');
  const selectedDate = visit ? `${formatDate(`${visit.date}T12:00:00`, i18n.resolvedLanguage, { dateStyle: 'long' })} · ${visit.time}` : '';
  const visibleDotCount = Math.min(view.photos.length, 7);
  const firstVisibleDot = Math.max(0, Math.min(carouselPhoto - 3, view.photos.length - visibleDotCount));

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: listing.title, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); toast.success(t('listingDetail.linkCopied')); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) toast.error(t('restaurantDetail.shareError'));
    }
  };
  const showDates = () => setDatesOpen(true);
  const openPhotos = () => setPhotoOpen(true);
  const closePhotos = () => setPhotoOpen(false);

  const dateButton = <Button fullWidth={false} onClick={showDates} className="restaurant-date-button">{t('restaurantDetail.showDates')}</Button>;

  return <div className="restaurant-detail">
    <div className="hidden lg:block"><BooksaHeader /></div>
    <header className="restaurant-topbar">
      <div className="restaurant-topbar-inner">
        <BackButton label={t('listingDetail.back')} onClick={() => window.history.length > 1 ? navigate(-1) : navigate(ROUTES.restaurants)} />
        <p>{listing.city ?? listing.location}<span aria-hidden="true"> · </span>{t('restaurantDetail.category')}</p>
        <div className="flex shrink-0">
          <IconButton variant="plain" label={t('listingDetail.share')} icon={<Share />} onClick={() => void share()} />
          <IconButton variant="plain" label={t(saved ? 'listingDetail.unsave' : 'listingDetail.save')} aria-pressed={saved} icon={<Heart fill={saved ? 'currentColor' : 'none'} />} onClick={() => setSaved(value => !value)} />
        </div>
      </div>
    </header>

    <main className="restaurant-main">
      <div className="restaurant-hero md:hidden">
        <div ref={gallery} className="restaurant-photo-strip" onScroll={event => {
          const element = event.currentTarget;
          if (element.clientWidth) setCarouselPhoto(Math.max(0, Math.min(view.photos.length - 1, Math.round(element.scrollLeft / element.clientWidth))));
        }}>
          {view.photos.map((photo, index) => <button key={`${photo}-${index}`} type="button" className="restaurant-hero-photo" onClick={openPhotos} aria-label={t('listingDetail.openPhoto', { index: index + 1, total: view.photos.length })}>
            <ShimmerImage src={photo} alt={index === 0 ? listing.title : ''} loading={index === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
          </button>)}
        </div>


        {view.photos.length > 1 ? <>
          <div className="restaurant-photo-dots" aria-hidden="true">
            {view.photos.slice(firstVisibleDot, firstVisibleDot + visibleDotCount).map((photo, index) =>
              <span key={`${photo}-${firstVisibleDot + index}`} className={carouselPhoto === firstVisibleDot + index ? 'is-active' : ''} />
            )}
          </div>
          <span className="sr-only" role="status">{t('listingDetail.photoCounter', { current: carouselPhoto + 1, total: view.photos.length })}</span>
        </> : null}
      </div>
      <DesktopGallery photos={view.photos} title={listing.title} onOpen={openPhotos} />

      <div className="restaurant-columns">
        <div className="min-w-0">
          <div className="restaurant-intro">
            <h1>{listing.title}</h1>
            <p className="restaurant-muted mt-3">{view.subtitle}</p>
            {listing.description ? <p className="restaurant-intro-description mt-3 line-clamp-3">{listing.description}</p> : null}
            <a href="#restaurant-reviews" className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold">
              <Star className="h-4 w-4" aria-hidden="true" />{t('listingDetail.new')}<span className="restaurant-muted font-normal">· {t('listingDetail.noReviews')}</span>
            </a>
          </div>

          <section aria-label={t('restaurantDetail.atAGlance')} className="restaurant-glance">
            <div className="restaurant-info-row restaurant-hosted-row"><HostAvatar name={listing.hostFirstName} /><div><h2>{hostLabel}</h2><p>{t('listingDetail.hostOnBooksa')}</p></div></div>
            <a href="#restaurant-location" className="restaurant-info-row"><MapPin aria-hidden="true" /><div><h2>{listing.city ?? listing.location}</h2><p>{listing.location}</p></div><ChevronRight className="ml-auto shrink-0" aria-hidden="true" /></a>
            <div className="restaurant-info-row"><Utensils aria-hidden="true" /><div><h2>{t('restaurantDetail.category')}</h2><p>{view.highlights[0]?.title ?? t('restaurantDetail.dining')}</p></div></div>
            {listing.basics.guests > 0 ? <div className="restaurant-info-row"><Users aria-hidden="true" /><div><h2>{t('restaurantDetail.capacity')}</h2><p>{t('listingDetail.maxGuests', { count: listing.basics.guests })}</p></div></div> : null}
          </section>

          <Section id="restaurant-about" title={t('restaurantDetail.about')}>
            <p className="restaurant-about-copy whitespace-pre-line">{listing.description || t('listingDetail.noDescription')}</p>
            {amenityStories.length ? <div className="restaurant-story-list">
              {amenityStories.map(({ id, label, groupTitle }, index) => <div key={id} className="restaurant-story-row">
                <ShimmerImage src={view.photos[(index + 1) % view.photos.length]} alt="" className="restaurant-story-image" />
                <div className="min-w-0"><h3>{label}</h3><p className="restaurant-muted">{groupTitle}</p></div>
              </div>)}
            </div> : null}
          </Section>

          <Section id="restaurant-offers" title={t('restaurantDetail.offers')}>
            {amenities.length ? <ul className="grid gap-5 sm:grid-cols-2">
              {amenities.map(({ id, label, icon: Icon }) => <li key={id} className="flex items-center gap-3 text-sm"><Icon className="h-5 w-5 shrink-0" aria-hidden="true" />{label}</li>)}
            </ul> : <p className="restaurant-muted">{t('listingDetail.noAmenities')}</p>}
          </Section>

          <Section id="restaurant-reviews" title={t('listingDetail.reviewsTitle')}>
            <div className="restaurant-empty"><Star className="mx-auto mb-3 h-7 w-7" aria-hidden="true" /><h3 className="font-semibold">{t('listingDetail.noReviews')}</h3><p className="restaurant-muted mt-2">{t('restaurantDetail.reviewsEmpty')}</p></div>
          </Section>

          <Section id="restaurant-dates" title={t('restaurantDetail.planVisit')}>
            <div className="restaurant-date-card"><IconButton variant="plain" size="lg" className="-ml-2 -mr-2" label={t('restaurantDates.title')} aria-haspopup="dialog" aria-expanded={datesOpen} icon={<CalendarDays aria-hidden="true" />} onClick={showDates} /><div><h3 className="font-semibold">{visit ? selectedDate : t('restaurantDetail.chooseDate')}</h3><p className="restaurant-muted mt-1">{t('restaurantDetail.datesHint')}</p></div></div>
            <button type="button" onClick={showDates} className="restaurant-secondary restaurant-dates-primary mt-5">{t('restaurantDetail.showDates')}</button>
          </Section>

          <Section id="restaurant-location" title={t('restaurantDetail.location')}>
            <p className="mb-5 text-sm leading-6">{listing.location}</p>
            {listing.coordinates ? <BooksaMap center={listing.coordinates} title={t('listingDetail.mapTitle', { place: listing.location })} initialZoom={15} interactive={false} showControls={false} showExpandControl={false} basemap="google-roadmap" appearance="soft" className="h-[300px] sm:h-[360px]" markers={[{ id: listing.id, label: listing.title, ...listing.coordinates }]} renderMarker={() => <span className="restaurant-map-pin"><MapPin className="h-6 w-6" aria-hidden="true" /></span>} /> : <p className="restaurant-empty restaurant-muted">{t('restaurantDetail.locationMissing')}</p>}
          </Section>

          <RelatedRestaurants listing={listing} />

          <Section id="restaurant-host" title={t('restaurantDetail.meetHost')}>
            <div className="restaurant-host-card"><HostAvatar name={listing.hostFirstName} large /><h3>{listing.hostFirstName ?? t('listingDetail.hostOnBooksa')}</h3><p className="restaurant-muted">{t('listingDetail.hostOnBooksa')}</p></div>
            <button type="button" disabled className="restaurant-secondary mt-6" aria-describedby="restaurant-message-hint"><MessageCircle className="h-4 w-4" aria-hidden="true" />{t('listingDetail.messageHost')}</button>
            <p id="restaurant-message-hint" className="restaurant-muted mt-3 text-center">{t('restaurantDetail.messagingSoon')}</p>
            <p className="restaurant-muted mt-5 text-center">{t('restaurantDetail.previewHint')}</p>
          </Section>

          <Section id="restaurant-rules" title={t('listingDetail.thingsToKnow')}>
            <div className="space-y-6">
              <div className="restaurant-info-row"><Users aria-hidden="true" /><div><h3>{t('restaurantDetail.guestRequirements')}</h3>{view.houseRules.length ? <ul>{view.houseRules.map(rule => <li key={rule} className="restaurant-muted">{rule}</li>)}</ul> : <p>{t('listingDetail.houseRulesUnset')}</p>}</div></div>
              <div className="restaurant-info-row"><Accessibility aria-hidden="true" /><div><h3>{t('restaurantDetail.accessibility')}</h3><p>{listing.amenityIds.includes('accessible') ? t('amenitiesStep.labels.accessible') : t('restaurantDetail.askAccessibility')}</p></div></div>
              <div className="restaurant-info-row"><CalendarX2 aria-hidden="true" /><div><h3>{t('listingDetail.cancellation')}</h3><p>{t('listingDetail.cancellationUnset')}</p></div></div>
            </div>
          </Section>
        </div>

        <aside className="restaurant-booking-aside"><div className="restaurant-booking-card">
          <Utensils className="mb-5 h-7 w-7" aria-hidden="true" /><p className="restaurant-muted">{t('restaurantDetail.listedPrice')}</p><p className="mt-1 text-2xl font-semibold">{price}</p><p className="restaurant-muted mb-6 mt-3">{t('restaurantDetail.priceHint')}</p>{dateButton}<p className="restaurant-muted mt-4 text-center">{t('restaurantDetail.previewHint')}</p>
        </div></aside>
      </div>
    </main>

    <div className="restaurant-booking-bar"><div className="min-w-0"><p className="text-[11px] text-[var(--color-text-secondary)]">{t('restaurantDetail.listedPrice')}</p><p className="truncate text-sm font-semibold">{price}</p></div>{dateButton}</div>
    <div className="hidden lg:block"><Footer /></div>

    <RestaurantPhotoGallery open={photoOpen} onClose={closePhotos} photos={view.photos} />
    <RestaurantDatesSheet open={datesOpen} listing={listing} onClose={() => setDatesOpen(false)} onSelect={setVisit} />
  </div>;
}
