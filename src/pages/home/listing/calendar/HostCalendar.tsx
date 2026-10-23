import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, ChevronDown, LayoutGrid, Settings } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { getLanguageOption } from '@/i18n/types';
import { cn } from '@/utils/helpers';
import { currencySymbol, formatCompactAmount } from '@/utils/compactAmount';
import {
  isWeekendNight,
  monthGrid,
  monthRange,
  nightlyPrice,
  parseDateKey,
  todayKey,
  type CalendarMonth,
  type DateKey
} from '@/domain/calendar';
import { CalendarDayPanel } from './CalendarDayPanel';
import { NightPriceSheet } from './NightPriceSheet';

export type CalendarListing = {
  id: string;
  title: string;
  coverImageUrl?: string;
  /** Nightly base price in whole `currency` units; prices are hidden when missing. */
  basePrice?: number;
  weekendAdjustment: number;
  currency: string;
  /** IANA zone from confirmedLocation; "today" is computed there. */
  timeZone?: string;
};

type HostCalendarProps = {
  listings: CalendarListing[];
  isLoading?: boolean;
  onOpenListings: () => void;
  className?: string;
};

const MONTHS_BEFORE = 1;
const MONTH_COUNT = 13;
/** Leaves the end of the previous month visible above the current month, as in the design. */
const INITIAL_SCROLL_PEEK = 24;

const utcDate = (key: DateKey) => {
  const { year, month, day } = parseDateKey(key);
  return new Date(Date.UTC(year, month, day));
};

/**
 * Airbnb-style host calendar: listing picker, sticky month picker with weekday row, and a
 * vertically scrolling list of month grids showing each night's price.
 */
export function HostCalendar({ listings, isLoading = false, onOpenListings, className }: HostCalendarProps) {
  const { t, i18n } = useTranslation('dashboard');
  const locale = getLanguageOption(i18n.language).locale;
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const monthRefs = useRef<Array<HTMLElement | null>>([]);
  const todayRef = useRef<HTMLButtonElement>(null);

  const [listingId, setListingId] = useState<string | undefined>(undefined);
  const listing = listings.find(({ id }) => id === listingId) ?? listings[0];
  const today = todayKey(listing?.timeZone);
  const todayParts = parseDateKey(today);
  const months = useMemo(
    () => monthRange({ year: todayParts.year, month: todayParts.month }, MONTHS_BEFORE, MONTH_COUNT),
    [todayParts.year, todayParts.month]
  );
  const [visibleMonthIndex, setVisibleMonthIndex] = useState(MONTHS_BEFORE);
  const [todayIsAbove, setTodayIsAbove] = useState(true);
  const [selectedKey, setSelectedKey] = useState<DateKey | null>(null);
  // TODO(team): load and save through the planned availability collection; screen-local until it exists.
  const [blockedKeys, setBlockedKeys] = useState<ReadonlySet<DateKey>>(() => new Set());
  // TODO(team): same as availability; custom nightly prices are screen-local until a collection exists.
  const [priceOverrides, setPriceOverrides] = useState<ReadonlyMap<DateKey, number>>(() => new Map());
  const [priceSheetOpen, setPriceSheetOpen] = useState(false);

  useEffect(() => {
    setSelectedKey(null);
    setBlockedKeys(new Set());
    setPriceOverrides(new Map());
    setPriceSheetOpen(false);
  }, [listing?.id]);

  const setPriceOverride = (key: DateKey, price: number | null) => {
    setPriceOverrides((current) => {
      const next = new Map(current);
      if (price === null) next.delete(key);
      else next.set(key, price);
      return next;
    });
  };

  const setBlocked = (key: DateKey, blocked: boolean) => {
    setBlockedKeys((current) => {
      const next = new Set(current);
      if (blocked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const formatters = useMemo(() => {
    const currency = listing?.currency ?? 'CDF';
    return {
      month: new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }),
      monthYear: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' }),
      fullDate: new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }),
      shortDate: new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      // Full amount for screen readers; cells show the symbol plus a compact amount (12.5k).
      price: new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }),
      symbol: currencySymbol(currency, locale)
    };
  }, [listing?.currency, locale]);

  const monthLabel = ({ year, month }: CalendarMonth) => {
    const date = new Date(Date.UTC(year, month, 1));
    return year === todayParts.year ? formatters.month.format(date) : formatters.monthYear.format(date);
  };

  // Sunday-first weekday initials (2026-10-04 is a Sunday).
  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => formatters.weekday.format(new Date(Date.UTC(2026, 9, 4 + index)))),
    [formatters]
  );

  const stickyOffset = () => stickyRef.current?.offsetHeight ?? 0;

  const updateScrollState = () => {
    const container = scrollRef.current;
    if (!container) return;
    const line = container.scrollTop + stickyOffset() + 1;
    let index = 0;
    monthRefs.current.forEach((element, monthIndex) => {
      if (element && element.offsetTop <= line) index = monthIndex;
    });
    setVisibleMonthIndex(index);

    const todayCell = todayRef.current;
    if (todayCell) {
      const containerRect = container.getBoundingClientRect();
      const cellRect = todayCell.getBoundingClientRect();
      setTodayIsAbove(cellRect.top + cellRect.height / 2 < containerRect.top + containerRect.height / 2);
    }
  };

  const scrollToMonth = (index: number, behavior: ScrollBehavior) => {
    const container = scrollRef.current;
    const section = monthRefs.current[index];
    if (!container || !section) return;
    container.scrollTo({ top: Math.max(section.offsetTop - stickyOffset(), 0), behavior });
  };

  useLayoutEffect(() => {
    const container = scrollRef.current;
    const section = monthRefs.current[MONTHS_BEFORE];
    if (!container || !section) return;
    container.scrollTop = Math.max(section.offsetTop - stickyOffset() - INITIAL_SCROLL_PEEK, 0);
    updateScrollState();
    // Re-anchor when the listing (and so its time zone's "today") changes.
  }, [listing?.id]);

  const scrollToToday = () => {
    todayRef.current?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const priceFor = (key: DateKey) =>
    listing?.basePrice !== undefined ? priceOverrides.get(key) ?? nightlyPrice(listing.basePrice, listing.weekendAdjustment, key) : undefined;

  return (
    <section className={cn('flex min-h-0 flex-col bg-[var(--color-surface)] text-[90%] text-[var(--color-text-primary)]', className)}>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[var(--color-border-subtle)] px-4 md:h-16">
        <div className="relative flex min-w-0 flex-1 items-center gap-2.5">
          {listing?.coverImageUrl ? (
            <ShimmerImage src={listing.coverImageUrl} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
          ) : (
            <span aria-hidden="true" className="h-8 w-8 shrink-0 rounded-md bg-[var(--color-surface-muted)]" />
          )}
          <span className="truncate text-[15.3px] font-semibold">
            {isLoading ? <span className="inline-block h-4 w-36 animate-pulse rounded-full bg-[var(--color-surface-muted)] align-middle" /> : listing?.title ?? t('calendar.noListings')}
          </span>
          {listings.length > 1 ? (
            <>
              <ChevronDown className="h-5 w-5 shrink-0" aria-hidden="true" />
              {/* Native select over the title: accessible and uses the platform picker on phones. */}
              <select
                aria-label={t('calendar.chooseListing')}
                value={listing?.id}
                onChange={(event) => setListingId(event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {listings.map(({ id, title }) => <option key={id} value={id}>{title}</option>)}
              </select>
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onOpenListings}
          aria-label={t('calendar.openListings')}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
        >
          <LayoutGrid className="h-5 w-5" aria-hidden="true" />
        </button>
        {/* TODO(design): calendar settings (availability, pricing rules) have no screen yet. */}
        <button
          type="button"
          disabled
          aria-label={t('calendar.settings')}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full disabled:opacity-40"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className={cn('h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', selectedKey ? 'pb-72' : 'pb-24')}
        >
          <div ref={stickyRef} className="sticky top-0 z-10 bg-[var(--color-surface)] px-4 pt-3 md:px-6">
            <div className="flex items-center gap-3">
              <div className="relative inline-flex items-center gap-1">
                <span className="text-[18.414px] font-semibold leading-8 tracking-[-0.02em]">{monthLabel(months[visibleMonthIndex])}</span>
                <ChevronDown className="h-5 w-5" aria-hidden="true" />
                <select
                  aria-label={t('calendar.chooseMonth')}
                  value={visibleMonthIndex}
                  onChange={(event) => scrollToMonth(Number(event.target.value), reduceMotion ? 'auto' : 'smooth')}
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  {months.map((month, index) => <option key={`${month.year}-${month.month}`} value={index}>{formatters.monthYear.format(new Date(Date.UTC(month.year, month.month, 1)))}</option>)}
                </select>
              </div>
            </div>
            <div aria-hidden="true" className="mt-2 grid grid-cols-7 border-b border-[var(--color-border-subtle)] pb-2 text-center text-[11.7px] text-[var(--color-text-secondary)]">
              {weekdays.map((weekday, index) => <span key={index}>{weekday}</span>)}
            </div>
          </div>

          {months.map((month, monthIndex) => (
            <section
              key={`${month.year}-${month.month}`}
              ref={(element) => {
                monthRefs.current[monthIndex] = element;
              }}
              aria-label={formatters.monthYear.format(new Date(Date.UTC(month.year, month.month, 1)))}
              className="px-1.5 pt-8 md:px-4"
            >
              <h2 className="px-2.5 pb-4 text-[21.762px] font-semibold leading-8 tracking-[-0.02em] md:px-2">{monthLabel(month)}</h2>
              <div className="grid grid-cols-7 gap-1 md:gap-1.5">
                {monthGrid(month).map((key, index) => {
                  if (!key) return <span key={`blank-${index}`} aria-hidden="true" />;
                  const isPast = key < today;
                  const isToday = key === today;
                  const isSelected = key === selectedKey;
                  const isBlocked = !isPast && blockedKeys.has(key);
                  const price = priceFor(key);
                  const dateLabel = formatters.fullDate.format(utcDate(key));
                  return (
                    <button
                      key={key}
                      ref={isToday ? todayRef : undefined}
                      type="button"
                      disabled={isPast}
                      aria-pressed={isPast ? undefined : isSelected}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={[dateLabel, price !== undefined ? formatters.price.format(price) : null, isPast ? t('calendar.unavailable') : null, isBlocked ? t('calendar.dayPanel.blocked') : null].filter(Boolean).join(', ')}
                      onClick={() => setSelectedKey(isSelected ? null : key)}
                      className={cn(
                        'flex h-20 min-w-0 flex-col items-center rounded-md border pt-2.5 text-[11.7px] transition-colors md:h-24 md:text-[12.6px]',
                        isPast && 'cursor-default border-transparent bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]',
                        !isPast && !isSelected && !isBlocked && 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)]',
                        !isSelected && isBlocked && 'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] line-through',
                        isSelected && 'border-transparent bg-[var(--color-inversurface)] text-[var(--color-surface)]',
                        isSelected && isBlocked && 'line-through'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-6 min-w-6 items-center justify-center rounded-full px-1 font-medium',
                          isToday && 'bg-[var(--color-primary-500)] font-semibold text-white'
                        )}
                      >
                        {parseDateKey(key).day}
                      </span>
                      {price !== undefined ? (
                        <span className="mt-3 max-w-full truncate px-0.5 text-[10.8px] font-medium md:text-[11.7px]">
                          <span className="opacity-70">{formatters.symbol}</span> {formatCompactAmount(price, locale)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {selectedKey ? (
          <CalendarDayPanel
            key={selectedKey}
            dateLabel={formatters.shortDate.format(utcDate(selectedKey))}
            fullDateLabel={formatters.fullDate.format(utcDate(selectedKey))}
            isBlocked={blockedKeys.has(selectedKey)}
            onBlockedChange={(blocked) => setBlocked(selectedKey, blocked)}
            price={(() => {
              const price = priceFor(selectedKey);
              return price === undefined ? undefined : { symbol: formatters.symbol, amount: formatCompactAmount(price, locale), label: formatters.price.format(price) };
            })()}
            onEditPrice={() => setPriceSheetOpen(true)}
            onClose={() => setSelectedKey(null)}
          />
        ) : (
          <button
            type="button"
            onClick={scrollToToday}
            aria-label={t('calendar.jumpToToday')}
            className="absolute bottom-4 right-4 z-20 inline-flex h-11 items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 text-[13.5px] font-semibold shadow-[var(--shadow-lg)] transition active:scale-[0.98]"
          >
            {todayIsAbove ? <ArrowUp className="h-5 w-5" aria-hidden="true" /> : <ArrowDown className="h-5 w-5" aria-hidden="true" />}
            {t('nav.today')}
          </button>
        )}
      </div>

      {selectedKey && listing?.basePrice !== undefined ? (
        <NightPriceSheet
          open={priceSheetOpen}
          dateLabel={formatters.shortDate.format(utcDate(selectedKey))}
          price={priceFor(selectedKey) ?? listing.basePrice}
          basePrice={listing.basePrice}
          weekendAdjustment={isWeekendNight(selectedKey) ? listing.weekendAdjustment : 0}
          isCustom={priceOverrides.has(selectedKey)}
          currency={listing.currency}
          locale={locale}
          formatPrice={(value) => formatters.price.format(value)}
          onClose={() => setPriceSheetOpen(false)}
          onSave={(price) => {
            setPriceOverride(selectedKey, price);
            setPriceSheetOpen(false);
          }}
          onReset={() => {
            setPriceOverride(selectedKey, null);
            setPriceSheetOpen(false);
          }}
        />
      ) : null}
    </section>
  );
}
