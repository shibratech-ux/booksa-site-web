import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  type PanInfo
} from 'framer-motion';
import MarketplaceMobileNav from '@/components/layout/MarketplaceMobileNav';
import { BooksaMap } from '@/components/maps/BooksaMap';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { useReservationSimulatorStore } from '@/store/reservation-simulator.store';
import { useAuthStore } from '@/store/auth.store';
import mapOutYourNextTripImage from '@/assets/images/map_out_your_next_trip.png';
import { DEFAULT_MAP_VIEW } from '@/pages/home/listing/seeAllMapDefaults';
import { useTheme } from '@/theme/useTheme';
import { ROUTES } from '@/utils/constants';
import { formatCalendarDate, formatCurrency } from '@/utils/formatters';

type SheetSnap = 'peek' | 'default' | 'expanded';

const SNAP_ORDER: SheetSnap[] = ['peek', 'default', 'expanded'];
const PEEK_HEIGHT = 140;
/** Drag handle row: 8px + 24px button + 8px. */
const HANDLE_HEIGHT = 40;
const EXPANDED_TOP_GAP = 24;
/** Space the snap heights were designed above (old nav allowance); the sheet now extends through it. */
const LEGACY_BOTTOM_INSET = 80;
const SHEET_SPRING = { type: 'spring', stiffness: 420, damping: 42, mass: 0.9 } as const;
/** How far (in seconds of travel) a fling's velocity carries the sheet before snapping. */
const FLING_PROJECTION = 0.2;

function TripsMap({ className, showControls = true }: { className?: string; showControls?: boolean }) {
  const { t } = useTranslation('booking');
  return (
    <BooksaMap
      title={t('reservationSimulator.mapTitle')}
      center={DEFAULT_MAP_VIEW.center}
      initialBounds={DEFAULT_MAP_VIEW.bounds}
      initialZoom={DEFAULT_MAP_VIEW.zoom}
      minZoom={DEFAULT_MAP_VIEW.minZoom}
      maxZoom={DEFAULT_MAP_VIEW.maxZoom}
      showControls={showControls}
      showExpandControl={false}
      controlLayout="split"
      className={className}
    />
  );
}

function TripEmptyState() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useTranslation('booking');

  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-col items-center px-6 py-6 text-center">
      <div className="relative h-32 w-40">
        <img
          src={mapOutYourNextTripImage}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_12px_14px_rgba(15,23,42,0.18)]"
        />
      </div>
      <h1 className="mt-3 text-[22px] font-semibold leading-[26px] tracking-[-0.02em] text-[var(--color-text-primary)] sm:text-[26px] sm:leading-[30px]">
        {t('reservationSimulator.emptyTitle')}
      </h1>
      <p className="mt-2 text-sm leading-[1.5] text-[var(--color-text-secondary)]">
        {t('reservationSimulator.emptyDescription')}
      </p>
      <button
        type="button"
        onClick={() => navigate(ROUTES.home)}
        className={`${theme.ui.button.primary} mt-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary-500)]`}
      >
        {t('reservationSimulator.getStarted')}
      </button>
    </div>
  );
}

function SimulatedTripsContent() {
  const { t, i18n } = useTranslation('booking');
  const guestUid = useAuthStore(state => state.user?.id ?? null);
  const allReservations = useReservationSimulatorStore(state => state.reservations);
  const reservations = useMemo(() => allReservations.filter(item => item.guestUid === guestUid), [allReservations, guestUid]);
  const cancel = useReservationSimulatorStore(state => state.cancel);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!reservations.length) return <TripEmptyState />;

  const dateLabel = (value: string) => formatCalendarDate(value, i18n.resolvedLanguage, {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-6 sm:px-2">
      <h1 className="text-[22px] font-semibold tracking-tight">{t('reservationSimulator.tripsTitle')}</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{t('reservationSimulator.tripsNotice')}</p>
      {error ? <p role="alert" className="mt-4 text-sm text-[var(--color-danger)]">{error}</p> : null}
      <ul className="mt-6 space-y-4">
        {reservations.map(reservation => (
          <li key={reservation.requestId} className="overflow-hidden rounded-card border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex gap-4 p-4">
              <ShimmerImage src={reservation.imageUrl} alt="" className="h-24 w-24 shrink-0 rounded-card object-cover" />
              <div className="min-w-0">
                <h2 className="text-base font-semibold leading-5">{reservation.listingTitle}</h2>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{reservation.listingLocation}</p>
                <p className="mt-2 text-xs font-semibold">{t(reservation.status === 'confirmed' ? 'reservationSimulator.confirmedStatus' : 'reservationSimulator.cancelledStatus')}</p>
              </div>
            </div>
            <div className="border-t border-[var(--color-border-subtle)] px-4 py-3 text-sm">
              <p>{dateLabel(reservation.checkIn)} – {dateLabel(reservation.checkOut)}</p>
              <p className="mt-1 text-[var(--color-text-secondary)]">{t('guests', { count: reservation.adults + reservation.children })}</p>
              <p className="mt-2 font-semibold">{reservation.totalCdf === null ? reservation.totalLabel : formatCurrency(reservation.totalCdf, 'CDF', i18n.resolvedLanguage)}</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t(reservation.paymentTiming === 'now' ? 'reservationSimulator.paymentNow' : 'reservationSimulator.paymentLater')}</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{t('reservationSimulator.reference', { id: reservation.requestId.slice(0, 8) })}</p>
            </div>
            {reservation.status === 'confirmed' ? (
              <div className="border-t border-[var(--color-border-subtle)] px-4 py-3">
                {confirmId === reservation.requestId ? (
                  <div>
                    <p className="text-sm font-semibold">{t('reservationSimulator.cancelPrompt')}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setConfirmId(null)} className="min-h-11 rounded-button bg-[var(--color-surface-muted)] px-4 text-sm font-semibold">{t('reservationSimulator.keepAction')}</button>
                      <button type="button" onClick={() => {
                        try { cancel(reservation.requestId); setConfirmId(null); setError(null); }
                        catch { setError(t('reservationSimulator.cancelError')); }
                      }} className="min-h-11 rounded-button border border-[var(--color-border)] px-4 text-sm font-semibold">{t('reservationSimulator.confirmCancel')}</button>
                    </div>
                  </div>
                ) : <button type="button" onClick={() => setConfirmId(reservation.requestId)} className="min-h-11 text-sm font-semibold underline underline-offset-4">{t('reservationSimulator.cancelAction')}</button>}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Draggable bottom sheet with three snap points. Its "default" height keeps the earlier sizing:
 * 86% of the viewport minus the bottom nav, minus the old max(32dvh, 12rem) map, plus 1.5rem.
 * The sheet runs to the bottom of the screen, behind the fixed nav.
 */
function TripsBottomSheet({ children }: { children: ReactNode }) {
  const { t } = useTranslation('booking');
  const stageRef = useRef<HTMLDivElement>(null);
  const safeTopProbeRef = useRef<HTMLDivElement>(null);
  const safeBottomProbeRef = useRef<HTMLDivElement>(null);
  const wasDragged = useRef(false);
  const [stage, setStage] = useState({ height: 0, viewport: 0, safeTop: 0, safeBottom: 0 });
  const [snap, setSnap] = useState<SheetSnap>('default');
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    const stageElement = stageRef.current;
    if (!stageElement) return;

    const measure = () =>
      setStage({
        height: stageElement.clientHeight,
        viewport: window.innerHeight,
        safeTop: safeTopProbeRef.current?.getBoundingClientRect().height ?? 0,
        safeBottom: safeBottomProbeRef.current?.getBoundingClientRect().height ?? 0
      });

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stageElement);
    return () => observer.disconnect();
  }, []);

  // Heights run to the screen bottom (behind the nav); the top edge of each snap is unchanged.
  const heights = useMemo(() => {
    const bottomInset = LEGACY_BOTTOM_INSET + stage.safeBottom;
    const expanded = Math.max(stage.height - stage.safeTop - EXPANDED_TOP_GAP, PEEK_HEIGHT + bottomInset);
    const standard = 0.86 * (stage.height - bottomInset - Math.max(0.32 * stage.viewport, 192) + 24) + bottomInset;
    return {
      peek: PEEK_HEIGHT + bottomInset,
      default: Math.min(Math.max(standard, PEEK_HEIGHT + bottomInset), expanded),
      expanded
    } satisfies Record<SheetSnap, number>;
  }, [stage]);

  // The sheet is always `expanded` tall; each snap is a downward offset.
  const offsetFor = (target: SheetSnap) => heights.expanded - heights[target];

  const settle = (target: SheetSnap) => {
    setSnap(target);
    if (reduceMotion) y.set(offsetFor(target));
    else animate(y, offsetFor(target), SHEET_SPRING);
  };

  // Place the sheet on first measure and keep it on its snap when the viewport changes.
  useEffect(() => {
    if (stage.height > 0) y.set(offsetFor(snap));
  }, [heights]);

  const handleDragEnd = (_event: PointerEvent, info: PanInfo) => {
    const projected = y.get() + info.velocity.y * FLING_PROJECTION;
    const nearest = SNAP_ORDER.reduce((best, candidate) =>
      Math.abs(offsetFor(candidate) - projected) < Math.abs(offsetFor(best) - projected) ? candidate : best
    );
    settle(nearest);
  };

  const handleToggle = () => {
    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }
    settle(snap === 'expanded' ? 'default' : 'expanded');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = SNAP_ORDER.indexOf(snap);
    if (event.key === 'ArrowUp') settle(SNAP_ORDER[Math.min(index + 1, SNAP_ORDER.length - 1)]);
    else if (event.key === 'ArrowDown') settle(SNAP_ORDER[Math.max(index - 1, 0)]);
    else return;
    event.preventDefault();
  };

  return (
    <div ref={stageRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div ref={safeTopProbeRef} aria-hidden="true" className="invisible absolute h-0 pt-[env(safe-area-inset-top)]" />
      <div ref={safeBottomProbeRef} aria-hidden="true" className="invisible absolute h-0 pb-[env(safe-area-inset-bottom)]" />
      <motion.section
        aria-label={t('reservationSimulator.tripsAria')}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: offsetFor('peek') }}
        dragElastic={0.06}
        dragMomentum={false}
        onDragStart={() => {
          wasDragged.current = true;
        }}
        onDragEnd={handleDragEnd}
        className="pointer-events-auto absolute inset-x-0 bottom-0 flex flex-col rounded-t-dialog border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)]"
        style={{ height: heights.expanded, y, visibility: stage.height > 0 ? 'visible' : 'hidden' }}
      >
        <div
          onPointerDown={(event) => dragControls.start(event)}
          className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-2 active:cursor-grabbing"
        >
          <button
            type="button"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            aria-label={t(snap === 'expanded' ? 'reservationSimulator.collapseTrips' : 'reservationSimulator.expandTrips')}
            aria-expanded={snap === 'expanded'}
            className="flex h-6 w-16 items-center justify-center rounded-full"
          >
            <span aria-hidden="true" className="h-1 w-9 rounded-full bg-[var(--color-border)]" />
          </button>
        </div>
        <div
          // Bottom padding keeps content clear of the fixed nav that overlaps the sheet.
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(64px+env(safe-area-inset-bottom))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ maxHeight: heights[snap] - HANDLE_HEIGHT }}
        >
          {children}
        </div>
      </motion.section>
    </div>
  );
}

export default function TripsPage() {
  const { t } = useTranslation('booking');
  return (
    <main className="min-h-dvh bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      {/* Mobile: full-bleed map behind a draggable bottom sheet, bottom nav underneath. */}
      <div className="relative h-dvh overflow-hidden sm:hidden">
        {/* Zoom buttons are hidden here: they would sit under the status bar; pinch zoom still works. */}
        <TripsMap className="absolute inset-0 h-full w-full" showControls={false} />
        <TripsBottomSheet>
          <SimulatedTripsContent />
        </TripsBottomSheet>
      </div>

      {/* Tablet/desktop: content on the left, sticky full-height map on the right. */}
      <div className="hidden min-h-dvh grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:grid">
        <section aria-label={t('reservationSimulator.tripsAria')} className="flex items-start justify-center overflow-y-auto py-8">
          <SimulatedTripsContent />
        </section>
        <div className="sticky top-0 h-dvh">
          <TripsMap className="h-full w-full" />
        </div>
      </div>

      <MarketplaceMobileNav />
    </main>
  );
}
