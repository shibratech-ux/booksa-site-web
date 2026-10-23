import { useEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { countStayNights } from '@/domain/pricing';
import type { StayRange } from '@/pages/home/listing/detail/StayCalendar';
import { formatCalendarDate } from '@/utils/formatters';

const DATE = 'YYYY-MM-DD';

export function StayDatesSheet({ open, range, onClose, onSave }: {
  open: boolean;
  range: StayRange;
  onClose: () => void;
  onSave: (range: StayRange) => void;
}) {
  const { t, i18n } = useTranslation('booking');
  const language = i18n.resolvedLanguage;
  const today = dayjs().startOf('day');
  const currentMonth = today.startOf('month');
  const [draft, setDraft] = useState<StayRange>(range);
  const [firstMonth, setFirstMonth] = useState(() =>
    range.start && dayjs(range.start).isAfter(currentMonth, 'month')
      ? dayjs(range.start).startOf('month') : currentMonth
  );

  useEffect(() => {
    if (!open) return;
    setDraft(range);
    setFirstMonth(range.start && dayjs(range.start).isAfter(currentMonth, 'month')
      ? dayjs(range.start).startOf('month') : currentMonth);
  }, [open, range.start, range.end]);

  const weekdays = Array.from({ length: 7 }, (_, index) =>
    formatCalendarDate(dayjs('2023-01-01').add(index, 'day').format(DATE), language, { weekday: 'narrow' }));
  const monthLabel = (month: Dayjs) =>
    formatCalendarDate(month.format(DATE), language, { month: 'long', year: 'numeric' });
  const fullDateLabel = (date: string) =>
    formatCalendarDate(date, language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const selectDate = (date: string) => {
    if (!draft.start || draft.end || date <= draft.start) setDraft({ start: date, end: null });
    else setDraft({ start: draft.start, end: date });
  };

  const renderMonth = (month: Dayjs) => {
    const monthKey = month.format('YYYY-MM');
    return <section key={monthKey} aria-labelledby={`stay-sheet-${monthKey}`} className="mb-5">
      <h3 id={`stay-sheet-${monthKey}`} className="mb-3 text-sm font-semibold capitalize">{monthLabel(month)}</h3>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {Array.from({ length: month.day() }, (_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}
        {Array.from({ length: month.daysInMonth() }, (_, index) => {
          const date = month.date(index + 1).format(DATE);
          const isStart = date === draft.start;
          const isEnd = date === draft.end;
          const inRange = Boolean(draft.start && draft.end && date > draft.start && date < draft.end);
          const hasRangeBackground = inRange || (isStart && draft.end) || isEnd;
          const isPast = date < today.format(DATE);
          return <span key={date} className={`flex h-11 items-center justify-center ${hasRangeBackground ? 'bg-[var(--color-surface-muted)]' : ''} ${isStart && draft.end ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''}`}>
            <button
              type="button"
              disabled={isPast}
              aria-label={fullDateLabel(date)}
              aria-pressed={isStart || isEnd}
              onClick={() => selectDate(date)}
              className={`h-11 w-11 rounded-full text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)] ${isStart || isEnd
                ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                : isPast
                  ? 'text-[var(--color-text-secondary)] opacity-40'
                  : 'hover:bg-[var(--color-surface-muted)]'}`}
            >{index + 1}</button>
          </span>;
        })}
      </div>
    </section>;
  };

  return <Modal
    open={open}
    title={t('reviewContinue.changeDates')}
    onClose={onClose}
    variant="bottom-sheet"
    headerAction={<div className="flex justify-end"><IconButton variant="plain" label={t('reviewContinue.closeDates')} onClick={onClose} icon={<X className="h-5 w-5" aria-hidden="true" />} /></div>}
    footer={<div className="flex items-center justify-between gap-4">
      <button type="button" onClick={() => setDraft({ start: null, end: null })} disabled={!draft.start} className="min-h-11 px-1 text-xs font-semibold underline underline-offset-4 disabled:opacity-40">{t('listingDetail.calendar.clear')}</button>
      <button type="button" disabled={!draft.start || !draft.end || draft.start < today.format(DATE) || !countStayNights(draft.start, draft.end)} onClick={() => onSave(draft)} className="min-h-11 min-w-20 rounded-button bg-[var(--color-text-primary)] px-5 text-xs font-semibold text-[var(--color-surface)] disabled:opacity-40">{t('reviewContinue.saveDates')}</button>
    </div>}
  >
    <h2 className="mb-5 text-[22px] font-semibold tracking-tight">{t('reviewContinue.changeDates')}</h2>
    <div className="sticky top-0 z-10 grid grid-cols-7 bg-[var(--color-surface)] py-2 text-center text-[11px] font-semibold text-[var(--color-text-secondary)]" aria-hidden="true">
      {weekdays.map((weekday, index) => <span key={index}>{weekday}</span>)}
    </div>
    <button type="button" disabled={!firstMonth.isAfter(currentMonth, 'month')} onClick={() => setFirstMonth(month => month.subtract(1, 'month'))} className="mb-4 min-h-11 w-full rounded-button bg-[var(--color-surface-muted)] text-xs font-semibold disabled:opacity-40">{t('reviewContinue.loadEarlierDates')}</button>
    {Array.from({ length: 13 }, (_, index) => renderMonth(firstMonth.add(index, 'month')))}
  </Modal>;
}
