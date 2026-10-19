import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Half-open stay `[start, end)` as `YYYY-MM-DD` calendar dates. */
export type StayRange = { start: string | null; end: string | null };

const DATE = 'YYYY-MM-DD';

function monthCells(month: Dayjs) {
  const first = month.startOf('month');
  const leading = first.day();
  const total = Math.ceil((leading + month.daysInMonth()) / 7) * 7;
  return Array.from({ length: total }, (_, index) => {
    const day = index - leading + 1;
    return day < 1 || day > month.daysInMonth() ? null : first.date(day);
  });
}

export function StayCalendar({ range, onChange, today = dayjs().startOf('day') }: {
  range: StayRange;
  onChange: (range: StayRange) => void;
  today?: Dayjs;
}) {
  const { t, i18n } = useTranslation('booking');
  const language = i18n.resolvedLanguage ?? 'fr';
  const [month, setMonth] = useState(() => (range.start ? dayjs(range.start) : today).startOf('month'));
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(language, { weekday: 'narrow' }).format(new Date(Date.UTC(2023, 0, 1 + index, 12))));
  const monthLabel = (value: Dayjs) => new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' }).format(value.toDate());
  const dayLabel = (value: Dayjs) => new Intl.DateTimeFormat(language, { dateStyle: 'full' }).format(value.toDate());

  const select = (date: Dayjs) => {
    const value = date.format(DATE);
    if (!range.start || range.end || value <= range.start) onChange({ start: value, end: null });
    else onChange({ start: range.start, end: value });
  };

  const renderMonth = (current: Dayjs, className = '') => (
    <div className={className}>
      <div role="grid" aria-label={monthLabel(current)} className="grid grid-cols-7 gap-y-1 text-center">
        {weekdays.map((weekday, index) => (
          <div key={index} role="columnheader" className="pb-2 text-xs font-medium text-[var(--color-text-secondary)]">{weekday}</div>
        ))}
        {monthCells(current).map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="h-11" />;
          const value = date.format(DATE);
          const isStart = value === range.start;
          const isEnd = value === range.end;
          const inRange = Boolean(range.start && range.end && value > range.start && value < range.end);
          const disabled = date.isBefore(today, 'day');
          return (
            <div key={value} role="gridcell" className={`relative flex h-11 items-center justify-center ${inRange || (isStart && range.end) || isEnd ? 'bg-[var(--color-surface-muted)]' : ''} ${isStart && range.end ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''}`}>
              <button
                type="button"
                disabled={disabled}
                aria-pressed={isStart || isEnd}
                aria-label={dayLabel(date)}
                onClick={() => select(date)}
                className={`relative h-11 w-11 rounded-full text-sm font-semibold transition ${
                  isStart || isEnd
                    ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                    : disabled
                      ? 'cursor-not-allowed text-[var(--color-text-secondary)] line-through opacity-50'
                      : 'hover:ring-1 hover:ring-[var(--color-text-primary)]'
                }`}
              >
                {date.date()}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          aria-label={t('listingDetail.calendar.previous')}
          disabled={!month.isAfter(today, 'month')}
          onClick={() => setMonth(current => current.subtract(1, 'month'))}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div aria-live="polite" className="grid flex-1 grid-cols-1 text-center text-sm font-semibold capitalize lg:grid-cols-2 lg:gap-10">
          <p>{monthLabel(month)}</p>
          <p className="hidden lg:block">{monthLabel(month.add(1, 'month'))}</p>
        </div>
        <button
          type="button"
          aria-label={t('listingDetail.calendar.next')}
          onClick={() => setMonth(current => current.add(1, 'month'))}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        {renderMonth(month)}
        {renderMonth(month.add(1, 'month'), 'hidden lg:block')}
      </div>
      <button
        type="button"
        disabled={!range.start}
        onClick={() => onChange({ start: null, end: null })}
        className="mt-4 min-h-11 rounded-button px-2 text-sm font-semibold underline underline-offset-4 disabled:opacity-40"
      >
        {t('listingDetail.calendar.clear')}
      </button>
    </div>
  );
}
