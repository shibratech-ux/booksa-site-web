import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { CalendarDays, Check, Minus, Plus, Utensils, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { PublishedListingDetail } from '@/services/listing-catalog.service';
import { formatDate, formatTime } from '@/utils/formatters';

export type RestaurantVisitPreview = { date: string; time: string; guests: number };

// Visual examples only. Replace with restaurant availability once its contract is defined.
const sampleTimes = [
  { start: '12:00', service: 'lunch', soldOut: false },
  { start: '12:30', service: 'lunch', soldOut: true },
  { start: '19:00', service: 'dinner', soldOut: false },
  { start: '19:30', service: 'dinner', soldOut: false }
] as const;

export function RestaurantDatesSheet({ open, listing, onClose, onSelect }: {
  open: boolean;
  listing: PublishedListingDetail;
  onClose: () => void;
  onSelect: (visit: RestaurantVisitPreview) => void;
}) {
  const { t, i18n } = useTranslation('booking');
  const { t: tCommon } = useTranslation('common');
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const [startDate, setStartDate] = useState(today);
  const [guests, setGuests] = useState(() => listing.basics.guests === 1 ? 1 : 2);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selected, setSelected] = useState<{ date: string; index: number } | null>(null);
  const [preview, setPreview] = useState(false);
  const previewTitle = useRef<HTMLHeadingElement>(null);
  const selectedSlot = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) setPreview(false); }, [open]);
  useEffect(() => {
    if (!open) return;
    if (preview) previewTitle.current?.focus({ preventScroll: true });
    else selectedSlot.current?.focus({ preventScroll: true });
  }, [preview, open]);
  const maxGuests = listing.basics.guests || undefined;
  const language = i18n.resolvedLanguage;
  const dates = [startDate, dayjs(startDate).add(1, 'day').format('YYYY-MM-DD'), dayjs(startDate).add(2, 'day').format('YYYY-MM-DD')];
  const dateLabel = (date: string) => {
    const label = formatDate(`${date}T12:00:00`, language, { weekday: 'long', month: 'long', day: 'numeric' });
    if (date === today) return t('restaurantDates.today', { date: formatDate(`${date}T12:00:00`, language, { month: 'long', day: 'numeric' }) });
    if (date === tomorrow) return t('restaurantDates.tomorrow', { date: formatDate(`${date}T12:00:00`, language, { month: 'long', day: 'numeric' }) });
    return label;
  };
  const timeLabel = (date: string, index: number) => {
    const slot = sampleTimes[index];
    return formatTime(`${date}T${slot.start}:00`, language);
  };
  const previewVisit = () => {
    if (!selected) return;
    onSelect({ date: selected.date, time: timeLabel(selected.date, selected.index), guests });
    setPreview(true);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t(preview ? 'restaurantDates.previewTitle' : 'restaurantDates.title')}
      variant="bottom-sheet"
      headerAction={<div className="restaurant-times-heading">
        <IconButton variant="plain" label={tCommon('actions.close')} icon={<X />} onClick={onClose} />
        <h2>{t(preview ? 'restaurantDates.previewTitle' : 'restaurantDates.title')}</h2>
      </div>}
      footer={!preview && selected ? <div className="restaurant-times-footer">
        <p>{dateLabel(selected.date)} · {timeLabel(selected.date, selected.index)}</p>
        <Button onClick={previewVisit}>{t('restaurantDates.previewAction')}</Button>
      </div> : undefined}
    >
      {preview && selected ? <div className="restaurant-times-preview">
        <Utensils className="h-7 w-7" aria-hidden="true" />
        <h3 ref={previewTitle} tabIndex={-1}>{listing.title}</h3>
        <p>{dateLabel(selected.date)}</p>
        <p>{timeLabel(selected.date, selected.index)}</p>
        <p>{t('restaurantDates.tableFor', { count: guests })} · {t(`restaurantDates.${sampleTimes[selected.index].service}`)}</p>
        <p className="restaurant-muted">{t('restaurantDates.previewNotice')}</p>
        <Button onClick={onClose}>{t('restaurantDetail.done')}</Button>
        <button type="button" className="restaurant-secondary" onClick={() => setPreview(false)}>{t('restaurantDates.editReservation')}</button>
      </div> : <div className="restaurant-times">
        <div className="restaurant-times-guests">
          <div><h3 aria-live="polite">{t('restaurantDates.diners', { count: guests })}</h3><p>{t('restaurantDates.partySize')}</p></div>
          <div className="flex items-center gap-1">
            <IconButton variant="plain" label={t('restaurantDates.removeGuest')} disabled={guests === 1} icon={<Minus />} onClick={() => setGuests(guests - 1)} />
            <span className="restaurant-times-count" aria-hidden="true">{guests}</span>
            <IconButton variant="plain" label={t('restaurantDates.addGuest')} disabled={maxGuests !== undefined && guests >= maxGuests} icon={<Plus />} onClick={() => setGuests(guests + 1)} />
          </div>
        </div>
        <button type="button" className="restaurant-times-month" aria-expanded={calendarOpen} aria-controls="restaurant-times-calendar" onClick={() => setCalendarOpen(value => !value)}>
          <span>{formatDate(`${startDate}T12:00:00`, language, { month: 'long', year: 'numeric' })}</span><CalendarDays aria-hidden="true" />
        </button>
        {calendarOpen ? <div id="restaurant-times-calendar" className="py-4">
          <Input type="date" label={t('restaurantDetail.date')} min={today} value={startDate} onChange={event => {
            const value = event.target.value;
            if (!value || value < today) return;
            setStartDate(value);
            setSelected(null);
          }} />
        </div> : null}
        <p className="restaurant-times-notice">{t('restaurantDates.sampleNotice')}</p>
        <div className="restaurant-times-days">
          {dates.map((date, dayIndex) => <section key={date} aria-labelledby={`restaurant-times-day-${dayIndex}`}>
            <h3 id={`restaurant-times-day-${dayIndex}`}>{dateLabel(date)}</h3>
            <div className="restaurant-times-slots">
              {sampleTimes.map((slot, index) => {
                const isSelected = selected?.date === date && selected.index === index;
                return <button
                  key={slot.start}
                  ref={isSelected ? selectedSlot : null}
                  type="button"
                  className="restaurant-time-slot"
                  disabled={slot.soldOut}
                  aria-pressed={isSelected}
                  onClick={() => setSelected({ date, index })}
                >
                  <span className={`restaurant-time-range ${slot.soldOut ? 'is-sold-out' : ''}`}>{timeLabel(date, index)}</span>
                  <span className="restaurant-time-details">{t('restaurantDates.tableFor', { count: guests })} · {t(`restaurantDates.${slot.service}`)}</span>
                  {isSelected ? <Check className="restaurant-time-check" aria-hidden="true" /> : <span className="restaurant-time-status">{t(slot.soldOut ? 'restaurantDates.soldOut' : 'restaurantDates.available')}</span>}
                </button>;
              })}
            </div>
          </section>)}
        </div>
      </div>}
    </Modal>
  );
}
