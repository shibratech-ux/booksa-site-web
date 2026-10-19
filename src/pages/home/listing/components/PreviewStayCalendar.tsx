import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  addMonths,
  isSelectableStayDay,
  isWithinStay,
  monthGrid,
  parseDateKey,
  selectStayDate,
  todayKey,
  type CalendarMonth,
  type DateKey,
  type StayRange,
  type StayRules
} from '@/domain/calendar';
import { formatDate } from '@/utils/formatters';

const MONTHS_AHEAD = 12;

// Calendar days are rendered at UTC noon so formatting never shifts them across a day boundary.
export const dateKeyToDate = (key: DateKey) => {
  const { year, month, day } = parseDateKey(key);
  return new Date(Date.UTC(year, month, day, 12));
};

/** Sunday-first weekday initials in the active language (2026-10-04 is a Sunday). */
export function useWeekdayInitials() {
  const { i18n } = useTranslation('dashboard');
  return Array.from({ length: 7 }, (_, index) =>
    formatDate(new Date(Date.UTC(2026, 9, 4 + index, 12)), i18n.language, { weekday: 'narrow', timeZone: 'UTC' })
  );
}

export function WeekdayRow({ className = '' }: { className?: string }) {
  const weekdays = useWeekdayInitials();
  return (
    <div className={`grid grid-cols-7 text-center text-xs text-[var(--color-text-secondary)] ${className}`} aria-hidden="true">
      {weekdays.map((weekday, index) => <span key={index} className="py-2 uppercase">{weekday}</span>)}
    </div>
  );
}

export function MonthGrid({ month, range, today, rules, onSelect, showWeekdays = true, titleAlign = 'center' }: {
  month: CalendarMonth;
  range: StayRange;
  today: DateKey;
  rules: StayRules;
  onSelect: (key: DateKey) => void;
  showWeekdays?: boolean;
  titleAlign?: 'center' | 'start';
}) {
  const { t, i18n } = useTranslation('dashboard');
  const label = formatDate(new Date(Date.UTC(month.year, month.month, 1, 12)), i18n.language, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const hasStay = Boolean(range.checkIn && range.checkOut);

  return (
    <div role="group" aria-label={label} data-month={`${month.year}-${month.month}`} className="min-w-0 flex-1">
      <h3 className={`text-[0.93427425rem] font-semibold capitalize ${titleAlign === 'center' ? 'text-center' : 'text-left'}`}>{label}</h3>
      {showWeekdays ? <WeekdayRow className="mt-4" /> : <div className="mt-4" />}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {monthGrid(month).map((key, index) => {
          if (!key) return <span key={`blank-${index}`} />;
          const isPast = key < today;
          const selectable = isSelectableStayDay(range, key, today, rules);
          const isStart = key === range.checkIn;
          const isEnd = key === range.checkOut;
          const inside = isWithinStay(range, key);
          const date = dateKeyToDate(key);
          const dateLabel = formatDate(date, i18n.language, { dateStyle: 'full', timeZone: 'UTC' });
          const status = isStart ? t('listingPreview.checkInDay') : isEnd ? t('listingPreview.checkOutDay') : !selectable && !isPast ? t('listingPreview.unavailableDay') : '';

          return (
            <div key={key} className="relative flex h-11 items-center justify-center">
              {/* Band connecting check-in and checkout: full width inside, half width at each end. */}
              {inside || (hasStay && (isStart || isEnd)) ? (
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 bg-[var(--color-surface-muted)] ${
                    isStart ? 'left-1/2 right-0' : isEnd ? 'left-0 right-1/2' : 'inset-x-0'
                  }`}
                />
              ) : null}
              <button
                type="button"
                disabled={!selectable}
                aria-pressed={isStart || isEnd}
                aria-label={status ? `${dateLabel}, ${status}` : dateLabel}
                onClick={() => onSelect(key)}
                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full text-[0.830466rem] font-semibold transition ${
                  isStart || isEnd
                    ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                    : isPast
                      ? 'cursor-not-allowed font-normal text-[var(--color-text-secondary)] line-through opacity-60'
                      : !selectable
                        ? 'cursor-not-allowed font-normal text-[var(--color-text-secondary)] opacity-40'
                        : 'hover:ring-1 hover:ring-[var(--color-text-primary)]'
                }`}
              >
                {parseDateKey(key).day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Airbnb-style stay picker for the listing preview: one month on mobile, two from md up.
// TODO(team): block host-unavailable and booked dates once availability is stored.
export function PreviewStayCalendar({ range, rules, timeZone, onChange }: {
  range: StayRange;
  rules: StayRules;
  timeZone?: string;
  onChange: (range: StayRange) => void;
}) {
  const { t } = useTranslation('dashboard');
  const today = todayKey(timeZone);
  const { year, month: monthIndex } = parseDateKey(today);
  const firstMonth: CalendarMonth = { year, month: monthIndex };
  const [offset, setOffset] = useState(0);
  const months = [addMonths(firstMonth, offset), addMonths(firstMonth, offset + 1)];
  const select = (key: DateKey) => onChange(selectStayDate(range, key, rules));

  return (
    <div>
      <div className="relative">
        <div className="absolute inset-x-0 top-0 flex justify-between">
          <button
            type="button"
            onClick={() => setOffset((value) => value - 1)}
            disabled={offset <= 0}
            aria-label={t('listingPreview.previousMonth')}
            className="-mt-3 inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setOffset((value) => value + 1)}
            disabled={offset >= MONTHS_AHEAD}
            aria-label={t('listingPreview.nextMonth')}
            className="-mt-3 inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex gap-10">
          <MonthGrid month={months[0]} range={range} today={today} rules={rules} onSelect={select} />
          <div className="hidden min-w-0 flex-1 md:block">
            <MonthGrid month={months[1]} range={range} today={today} rules={rules} onSelect={select} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onChange({ checkIn: null, checkOut: null })}
        disabled={!range.checkIn}
        className="mt-4 min-h-11 rounded-button px-2 text-[0.72665775rem] font-semibold underline-offset-4 transition enabled:hover:underline disabled:opacity-40"
      >
        {t('listingPreview.clearDates')}
      </button>
    </div>
  );
}
