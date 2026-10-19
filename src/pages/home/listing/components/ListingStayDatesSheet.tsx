import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  EMPTY_STAY,
  addMonths,
  nightsBetween,
  parseDateKey,
  selectStayDate,
  todayKey,
  type StayRange,
  type StayRules
} from '@/domain/calendar';
import { formatDate } from '@/utils/formatters';
import { EditorBottomSheet } from './EditorBottomSheet';
import { MonthGrid, WeekdayRow, dateKeyToDate } from './PreviewStayCalendar';

const MONTH_COUNT = 13;

// Airbnb-style "change dates" sheet: ✕ · Clear dates, a sticky stay summary + weekday row, months stacked
// vertically, and a right-aligned Save. Edits a draft; Save hands it back, ✕ discards it, and
// Clear dates resets the stay right away (no Save needed).
export function ListingStayDatesSheet({ open, range, rules, timeZone, onClose, onSave, onClear }: {
  open: boolean;
  range: StayRange;
  rules: StayRules;
  timeZone?: string;
  onClose: () => void;
  onSave: (range: StayRange) => void;
  onClear: () => void;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const [draft, setDraft] = useState<StayRange>(range);
  const today = todayKey(timeZone);
  const { year, month } = parseDateKey(today);
  const months = Array.from({ length: MONTH_COUNT }, (_, index) => addMonths({ year, month }, index));
  const nights = draft.checkIn && draft.checkOut ? nightsBetween(draft.checkIn, draft.checkOut) : null;
  const isComplete = nights !== null;
  const isEmpty = !draft.checkIn;
  const changed = draft.checkIn !== range.checkIn || draft.checkOut !== range.checkOut;
  const canSave = changed && (isComplete || isEmpty);
  const longDate = (key: string) => formatDate(dateKeyToDate(key), i18n.language, { dateStyle: 'medium', timeZone: 'UTC' });

  useEffect(() => {
    if (!open) return;
    setDraft(range);
    // Bring the check-in month into view once the sheet has rendered.
    const frame = requestAnimationFrame(() => {
      if (!range.checkIn) return;
      const { year: checkInYear, month: checkInMonth } = parseDateKey(range.checkIn);
      document.querySelector(`[data-stay-sheet-month="${checkInYear}-${checkInMonth}"]`)?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, range]);

  const heading = isComplete
    ? t('listingPreview.nights', { count: nights })
    : draft.checkIn
      ? t('listingPreview.selectCheckOut')
      : t('listingPreview.selectDates');
  const summary = isComplete && draft.checkIn && draft.checkOut
    ? `${longDate(draft.checkIn)} – ${longDate(draft.checkOut)}`
    : draft.checkIn
      ? rules.minNights > 1
        ? t('listingPreview.minimumStay', { count: rules.minNights })
        : longDate(draft.checkIn)
      : t('listingPreview.selectCheckInHelp');

  return (
    <EditorBottomSheet
      open={open}
      heading={heading}
      headingVisuallyHidden
      closeLabel={t('listingPreview.closeDates')}
      isSaving={false}
      canSave={canSave}
      onClose={onClose}
      onSave={() => onSave(draft)}
      hideCancel
      headerAction={
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY_STAY);
            onClear();
          }}
          disabled={isEmpty && !range.checkIn}
          className="min-h-11 justify-self-end rounded-button px-2 text-[0.72665775rem] font-semibold transition hover:bg-[var(--color-surface-muted)] disabled:opacity-40"
        >
          {t('listingPreview.clearDates')}
        </button>
      }
      bodyClassName="pb-6 pt-0"
    >
      <div>
        {/* Summary + weekday initials stay pinned while the months scroll underneath. */}
        <div className="sticky top-0 z-10 -mx-6 bg-[var(--color-surface)] px-6 pt-4 sm:-mx-8 sm:px-8">
          <p aria-live="polite" className="text-[1.453315rem] font-semibold tracking-tight">{heading}</p>
          <p className="mt-1 text-[0.830466rem] text-[var(--color-text-secondary)]">{summary}</p>
          <WeekdayRow className="-mx-6 mt-4 border-b border-[var(--color-border-subtle)] px-6 sm:-mx-8 sm:px-8" />
        </div>

        <div className="grid gap-8 pt-6">
          {months.map((calendarMonth) => (
            <div
              key={`${calendarMonth.year}-${calendarMonth.month}`}
              data-stay-sheet-month={`${calendarMonth.year}-${calendarMonth.month}`}
              className="scroll-mt-36"
            >
              <MonthGrid
                month={calendarMonth}
                range={draft}
                today={today}
                rules={rules}
                onSelect={(key) => setDraft((current) => selectStayDate(current, key, rules))}
                showWeekdays={false}
                titleAlign="start"
              />
            </div>
          ))}
        </div>
      </div>
    </EditorBottomSheet>
  );
}
