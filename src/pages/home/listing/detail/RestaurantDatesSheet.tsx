import { useEffect, useRef, useState, type FormEvent } from 'react';
import dayjs from 'dayjs';
import { Banknote, CalendarDays, Check, ChevronRight, CreditCard, LockKeyhole, Minus, Plus, X } from 'lucide-react';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { buildRestaurantBookingSearch, restaurantPreviewSlots as sampleTimes, type RestaurantPreviewPaymentMethod } from '@/domain/restaurant-booking';
import { restaurantCashDetailsSchema, type RestaurantCashDetails } from '@/domain/restaurant-cash-details';
import { quoteRestaurantVisit } from '@/domain/pricing';
import appleLogo from '@/assets/images/appel-logo.png';
import airtelMoneyLogo from '@/assets/images/operators/airtelmoney.png';
import googlePayLogo from '@/assets/images/operators/googleplay.png';
import mastercardLogo from '@/assets/images/operators/mastercard.png';
import mpesaLogo from '@/assets/images/operators/mpesa.png';
import orangeMoneyLogo from '@/assets/images/operators/orangemoney.png';
import paypalLogo from '@/assets/images/operators/paypal.png';
import visaLogo from '@/assets/images/operators/visa.png';
import { getPublishedListingDetail, type PublishedListingDetail } from '@/services/listing-catalog.service';
import { ROUTES } from '@/utils/constants';
import { formatCurrency, formatDate, formatTime } from '@/utils/formatters';

export type RestaurantVisitPreview = { date: string; time: string; guests: number };
const emptyCashDetails: RestaurantCashDetails = { firstName: '', lastName: '', streetAddress: '', apartment: '', city: '', region: '', postalCode: '', countryCode: 'CD' };

function RestaurantCalendar({ today, selectedDate, language, onSelect }: {
  today: string;
  selectedDate: string;
  language: string | undefined;
  onSelect: (date: string) => void;
}) {
  const firstMonth = dayjs(today).startOf('month');
  const firstWeekday = dayjs(today).subtract(dayjs(today).day(), 'day');
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    formatDate(`${firstWeekday.add(index, 'day').format('YYYY-MM-DD')}T12:00:00`, language, { weekday: 'narrow' })
  );

  return <div id="restaurant-times-calendar" className="restaurant-calendar">
    <div className="restaurant-calendar-weekdays" aria-hidden="true">
      {weekdays.map((weekday, index) => <span key={index}>{weekday}</span>)}
    </div>
    <div className="restaurant-calendar-months">
      {Array.from({ length: 12 }, (_, monthIndex) => {
        const month = firstMonth.add(monthIndex, 'month');
        const monthId = `restaurant-calendar-month-${monthIndex}`;
        return <section key={month.format('YYYY-MM')} aria-labelledby={monthId} className="restaurant-calendar-month">
          <h3 id={monthId}>{formatDate(`${month.format('YYYY-MM-DD')}T12:00:00`, language, { month: 'long', year: 'numeric' })}</h3>
          <div className="restaurant-calendar-grid">
            {Array.from({ length: month.day() }, (_, index) => <span key={`empty-${index}`} aria-hidden="true" />)}
            {Array.from({ length: month.daysInMonth() }, (_, index) => {
              const date = month.date(index + 1).format('YYYY-MM-DD');
              const isPast = date < today;
              return <button
                key={date}
                type="button"
                className="restaurant-calendar-day"
                disabled={isPast}
                aria-pressed={date === selectedDate}
                aria-label={formatDate(`${date}T12:00:00`, language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                onClick={() => onSelect(date)}
              ><span>{index + 1}</span></button>;
            })}
          </div>
        </section>;
      })}
    </div>
  </div>;
}

export function RestaurantDatesSheet({ open, listing, onClose, onSelect }: {
  open: boolean;
  listing: PublishedListingDetail;
  onClose: () => void;
  onSelect: (visit: RestaurantVisitPreview) => void;
}) {
  const { t, i18n } = useTranslation('booking');
  const navigate = useNavigate();
  const { t: tCommon } = useTranslation('common');
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const [startDate, setStartDate] = useState(today);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [draftAdults, setDraftAdults] = useState(1);
  const [draftChildren, setDraftChildren] = useState(0);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(startDate);
  const [selected, setSelected] = useState<{ date: string; index: number } | null>(null);
  const [dateConfirmed, setDateConfirmed] = useState(false);
  const [preview, setPreview] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentSheet, setPaymentSheet] = useState<'card' | 'cash' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<RestaurantPreviewPaymentMethod>('applePay');
  const [cashDetails, setCashDetails] = useState<RestaurantCashDetails>({ ...emptyCashDetails });
  const [cashAttempted, setCashAttempted] = useState(false);
  const [reviewListing, setReviewListing] = useState<PublishedListingDetail | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const reviewRequest = useRef(0);
  const previewTitle = useRef<HTMLHeadingElement>(null);
  const selectedSlot = useRef<HTMLButtonElement>(null);
  const calendarHeading = useRef<HTMLHeadingElement>(null);
  const guestsHeading = useRef<HTMLHeadingElement>(null);
  const calendarTrigger = useRef<HTMLButtonElement>(null);
  const cashForm = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (open) {
      setPreview(false);
      setDateConfirmed(false);
      setReviewListing(null);
      setReviewStatus('idle');
      setPriceOpen(false);
      setPaymentOpen(false);
      setPaymentSheet(null);
      setPaymentMethod('applePay');
      setCashDetails({ ...emptyCashDetails });
      setCashAttempted(false);
    }
    return () => { reviewRequest.current += 1; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    if (guestsOpen) guestsHeading.current?.focus({ preventScroll: true });
    else if (calendarOpen) calendarHeading.current?.focus({ preventScroll: true });
    else if (preview) previewTitle.current?.focus({ preventScroll: true });
    else (selectedSlot.current ?? calendarTrigger.current)?.focus({ preventScroll: true });
  }, [calendarOpen, guestsOpen, preview, open]);
  const maxGuests = (reviewListing ?? listing).basics.guests || undefined;
  const guests = adults + children;
  const draftGuests = draftAdults + draftChildren;
  const language = i18n.resolvedLanguage;
  const quote = quoteRestaurantVisit((reviewListing ?? listing).basePrice, adults, children);
  const totalPrice = quote ? formatCurrency(quote.total, quote.currency, language) : t('restaurantDates.priceUnavailable');
  const cashValidation = cashAttempted ? restaurantCashDetailsSchema.safeParse(cashDetails) : null;
  const invalidCashFields = new Set(cashValidation && !cashValidation.success ? cashValidation.error.issues.map(issue => issue.path[0]) : []);
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
  const previewVisit = async () => {
    if (!selected || reviewStatus === 'loading') return;
    const request = ++reviewRequest.current;
    setReviewStatus('loading');
    try {
      const latest = await getPublishedListingDetail(listing.id);
      if (request !== reviewRequest.current) return;
      if (!latest || latest.category !== 'restaurant') { setReviewStatus('error'); return; }
      setReviewListing(latest);
      onSelect({ date: selected.date, time: timeLabel(selected.date, selected.index), guests });
      setReviewStatus('idle');
      setPreview(true);
    } catch {
      if (request === reviewRequest.current) setReviewStatus('error');
    }
  };
  const openCalendar = () => {
    setCalendarDate(startDate);
    setCalendarOpen(true);
  };
  const openGuests = () => {
    setDraftAdults(adults);
    setDraftChildren(children);
    setGuestsOpen(true);
  };
  const saveGuests = () => {
    setAdults(draftAdults);
    setChildren(draftChildren);
    if (selected) onSelect({ date: selected.date, time: timeLabel(selected.date, selected.index), guests: draftGuests });
    setGuestsOpen(false);
  };
  const dismissFlow = () => {
    reviewRequest.current += 1;
    setPreview(false);
    setPaymentOpen(false);
    setPaymentSheet(null);
    setPriceOpen(false);
    setGuestsOpen(false);
    setCalendarOpen(false);
    setCashDetails({ ...emptyCashDetails });
    setCashAttempted(false);
    onClose();
  };
  const openPaymentSheet = (method: 'card' | 'cash') => {
    setPaymentSheet(method);
    if (method === 'cash') setCashAttempted(false);
  };
  const closePaymentSheet = () => {
    setPaymentSheet(null);
    setCashDetails({ ...emptyCashDetails });
    setCashAttempted(false);
  };
  const updateCashField = (field: Exclude<keyof RestaurantCashDetails, 'countryCode'>, value: string) => {
    setCashDetails(current => ({ ...current, [field]: value }));
  };
  const submitCashDetails = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCashAttempted(true);
    const result = restaurantCashDetailsSchema.safeParse(cashDetails);
    if (!result.success) {
      const firstField = result.error.issues[0]?.path[0];
      if (typeof firstField === 'string') cashForm.current?.querySelector<HTMLInputElement>(`[name="${firstField}"]`)?.focus();
      return;
    }
    goToBooking('cash');
  };
  const goToBooking = (method: RestaurantPreviewPaymentMethod) => {
    if (!selected || !quote) return;
    const search = buildRestaurantBookingSearch({
      date: selected.date,
      time: sampleTimes[selected.index].start,
      adults,
      children,
      paymentMethod: method
    });
    dismissFlow();
    navigate(`${generatePath(ROUTES.restaurantBooking, { listingId: listing.id })}?${search}`);
  };
  const closeSheet = () => {
    if (calendarOpen) setCalendarOpen(false);
    else dismissFlow();
  };
  const confirmCalendar = () => {
    if (calendarDate !== startDate) {
      setStartDate(calendarDate);
    }
    setSelected({ date: calendarDate, index: 0 });
    setDateConfirmed(true);
    setCalendarOpen(false);
  };
  const sheetTitle = t(calendarOpen ? 'restaurantDetail.date' : dateConfirmed ? 'restaurantDates.selectTime' : 'restaurantDates.title');

  return <>
    <Modal
      open={open && !preview}
      onClose={closeSheet}
      title={sheetTitle}
      variant="bottom-sheet"
      headerAction={<div className="restaurant-times-heading">
        <IconButton variant="plain" label={tCommon('actions.close')} icon={<X />} onClick={closeSheet} />
        <h2 ref={calendarHeading} tabIndex={calendarOpen ? -1 : undefined} className={calendarOpen ? 'sr-only' : undefined}>{sheetTitle}</h2>
      </div>}
      footer={calendarOpen ? <button type="button" className="restaurant-calendar-next" onClick={confirmCalendar}>{t('restaurantDetail.next')}</button> : <div className="restaurant-times-footer-wrap">
        {reviewStatus === 'error' ? <p role="alert" className="restaurant-times-error">{t('listingDetail.loadError')}</p> : null}
        <div className="restaurant-times-footer">
          <div className="restaurant-times-footer-summary">
            <strong>{totalPrice}</strong>
            <span>{t('restaurantDates.estimatedTotal')}{selected ? ` · ${timeLabel(selected.date, selected.index)}` : ''}</span>
          </div>
          <button type="button" className="restaurant-times-next" disabled={!selected || !quote || reviewStatus === 'loading'} aria-busy={reviewStatus === 'loading'} onClick={() => void previewVisit()}>{reviewStatus === 'loading' ? tCommon('states.loading') : t(reviewStatus === 'error' ? 'restaurantDetail.retry' : 'restaurantDetail.next')}</button>
        </div>
      </div>}
    >
      {calendarOpen ? <RestaurantCalendar today={today} selectedDate={calendarDate} language={language} onSelect={setCalendarDate} /> : <div className="restaurant-times">
        <div className="restaurant-times-guests">
          <div><h3 aria-live="polite">{t('restaurantDates.diners', { count: guests })}</h3><p>{t('restaurantDates.partySize')}</p></div>
          <div className="flex items-center gap-1">
            <IconButton variant="plain" label={t('restaurantDates.removeGuest')} disabled={adults === 1 || reviewStatus === 'loading'} icon={<Minus />} onClick={() => setAdults(value => value - 1)} />
            <span className="restaurant-times-count" aria-hidden="true">{guests}</span>
            <IconButton variant="plain" label={t('restaurantDates.addGuest')} disabled={reviewStatus === 'loading' || (maxGuests !== undefined && guests >= maxGuests)} icon={<Plus />} onClick={() => setAdults(value => value + 1)} />
          </div>
        </div>
        <button ref={calendarTrigger} type="button" className="restaurant-times-month" disabled={reviewStatus === 'loading'} onClick={openCalendar}>
          <span>{formatDate(`${startDate}T12:00:00`, language, { month: 'long', year: 'numeric' })}</span><CalendarDays aria-hidden="true" />
        </button>
        <Link to={ROUTES.restaurants} className="restaurant-times-nearby">
          <span><strong>{t('restaurantDates.otherTimes')}</strong><small>{t('restaurantDetail.moreRestaurants')}</small></span>
          <span className="restaurant-times-nearby-arrow"><ChevronRight aria-hidden="true" /></span>
        </Link>
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
                  disabled={slot.soldOut || reviewStatus === 'loading'}
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
    <Modal
      open={open && preview && Boolean(selected && reviewListing)}
      suspended={guestsOpen || priceOpen || paymentOpen}
      onClose={() => setPreview(false)}
      title={t('restaurantDates.reviewTitle')}
      variant="fullscreen"
      headerAction={<div className="restaurant-payment-heading">
        <BackButton label={t('restaurantDates.backToTimes')} onClick={() => setPreview(false)} />
        <IconButton variant="plain" label={tCommon('actions.close')} icon={<X aria-hidden="true" />} onClick={dismissFlow} />
      </div>}
      footer={<div className="restaurant-payment-footer">
        <span className="sr-only">{t('restaurantDates.stepOneOfThree')}</span>
        <div className="restaurant-payment-progress" data-step="1" aria-hidden="true"><span /><span /><span /></div>
        <button type="button" className="restaurant-calendar-next" onClick={() => setPaymentOpen(true)}>{t('restaurantDetail.next')}</button>
      </div>}
    >
      {selected && reviewListing ? <div className="restaurant-review-page">
        <h2 ref={previewTitle} tabIndex={-1}>{t('restaurantDates.reviewTitle')}</h2>
        <div className="restaurant-review">
          <div className="restaurant-review-card">
            <div className="restaurant-review-listing">
              <ShimmerImage src={reviewListing.coverImageUrl} alt="" className="restaurant-review-photo" />
              <div className="min-w-0"><h3>{reviewListing.title}</h3><p>{t('restaurantDetail.category')} · {reviewListing.city ?? reviewListing.location}</p></div>
            </div>
            <div className="restaurant-review-row"><strong>{t('restaurantDetail.date')}</strong><p>{formatDate(`${selected.date}T12:00:00`, language, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}<br />{timeLabel(selected.date, selected.index)}</p></div>
            <div className="restaurant-review-row restaurant-review-row-action"><div><strong>{t('restaurantDetail.guests')}</strong><p>{t('restaurantDates.adults', { count: adults })}{children > 0 ? ` · ${t('restaurantDates.children', { count: children })}` : ''}</p></div><button type="button" className="restaurant-review-change" aria-label={t('restaurantDates.editGuests')} onClick={openGuests}>{tCommon('actions.edit')}</button></div>
            <button type="button" className="restaurant-review-row restaurant-review-price-row" onClick={() => setPriceOpen(true)}>
              <span><strong>{t('restaurantDates.estimatedTotal')}</strong><span>{totalPrice}</span></span>
              <span className="restaurant-review-change">{t('restaurantDates.priceDetailsAction')}</span>
            </button>
            <div className="restaurant-review-row"><strong>{t('listingDetail.cancellation')}</strong><p>{t('listingDetail.cancellationUnset')}</p></div>
          </div>
          <p className="restaurant-review-notice">{t('restaurantDates.previewNotice')}</p>
        </div>
      </div> : null}
    </Modal>
    <Modal
      open={open && guestsOpen}
      onClose={() => setGuestsOpen(false)}
      title={t('restaurantDates.editGuests')}
      variant="bottom-sheet"
      headerAction={<div className="restaurant-times-heading">
        <IconButton variant="plain" label={tCommon('actions.close')} icon={<X aria-hidden="true" />} onClick={() => setGuestsOpen(false)} />
        <h2 ref={guestsHeading} tabIndex={-1}>{t('restaurantDates.editGuests')}</h2>
      </div>}
      footer={<div className="restaurant-guests-footer"><strong aria-live="polite">{t('restaurantDates.diners', { count: draftGuests })}</strong><button type="button" className="restaurant-guest-save" disabled={maxGuests !== undefined && draftGuests > maxGuests} onClick={saveGuests}>{tCommon('actions.save')}</button></div>}
    >
      <div className="restaurant-guests-editor">
        <div className="restaurant-guest-row">
          <div><h3>{t('restaurantDates.adultLabel')}</h3><p>{t('restaurantDates.adultAge')}</p></div>
          <div className="restaurant-guest-controls">
            <IconButton variant="muted" label={t('restaurantDates.removeAdult')} disabled={draftAdults <= 1} icon={<Minus aria-hidden="true" />} onClick={() => setDraftAdults(value => value - 1)} />
            <span aria-live="polite">{draftAdults}</span>
            <IconButton variant="muted" label={t('restaurantDates.addAdult')} disabled={maxGuests !== undefined && draftGuests >= maxGuests} icon={<Plus aria-hidden="true" />} onClick={() => setDraftAdults(value => value + 1)} />
          </div>
        </div>
        <div className="restaurant-guest-row">
          <div><h3>{t('restaurantDates.childLabel')}</h3><p>{t('restaurantDates.childAge')}</p></div>
          <div className="restaurant-guest-controls">
            <IconButton variant="muted" label={t('restaurantDates.removeChild')} disabled={draftChildren <= 0} icon={<Minus aria-hidden="true" />} onClick={() => setDraftChildren(value => value - 1)} />
            <span aria-live="polite">{draftChildren}</span>
            <IconButton variant="muted" label={t('restaurantDates.addChild')} disabled={maxGuests !== undefined && draftGuests >= maxGuests} icon={<Plus aria-hidden="true" />} onClick={() => setDraftChildren(value => value + 1)} />
          </div>
        </div>
      </div>
    </Modal>
    <Modal
      open={open && priceOpen && Boolean(reviewListing)}
      onClose={() => setPriceOpen(false)}
      title={t('restaurantDates.priceDetails')}
      variant="bottom-sheet"
      sheetSize="compact"
      headerAction={<div className="restaurant-price-heading">
        <h2>{t('restaurantDates.priceDetails')}</h2>
        <IconButton variant="plain" label={tCommon('actions.close')} icon={<X aria-hidden="true" />} onClick={() => setPriceOpen(false)} />
      </div>}
    >
      <div className="restaurant-price-details">
        {quote ? <>
          <div className="restaurant-price-details-row"><span>{formatCurrency(quote.perGuestPrice, quote.currency, language)} × {t('restaurantDates.adults', { count: quote.adults })}</span><strong>{formatCurrency(quote.adultSubtotal, quote.currency, language)}</strong></div>
          {quote.children > 0 ? <div className="restaurant-price-details-row"><span>{formatCurrency(quote.perGuestPrice, quote.currency, language)} × {t('restaurantDates.children', { count: quote.children })}</span><strong>{formatCurrency(quote.childSubtotal, quote.currency, language)}</strong></div> : null}
          <div className="restaurant-price-details-row restaurant-price-details-total"><span>{t('restaurantDates.estimatedTotal')}</span><strong>{totalPrice}</strong></div>
        </> : <p role="status">{t('restaurantDates.priceUnavailable')}</p>}
        <p>{t('restaurantDetail.priceHint')}</p>
      </div>
    </Modal>
    <Modal
      open={open && paymentOpen}
      suspended={paymentSheet !== null}
      onClose={() => setPaymentOpen(false)}
      title={t('restaurantDates.paymentTitle')}
      variant="fullscreen"
      headerAction={<div className="restaurant-payment-heading">
        <BackButton label={t('restaurantDates.backToReview')} onClick={() => setPaymentOpen(false)} />
        <IconButton variant="plain" label={tCommon('actions.close')} icon={<X aria-hidden="true" />} onClick={dismissFlow} />
      </div>}
      footer={<div className="restaurant-payment-footer">
        <span className="sr-only">{t('restaurantDates.stepTwoOfThree')}</span>
        <div className="restaurant-payment-progress" data-step="2" aria-hidden="true"><span /><span /><span /></div>
        <button type="button" className="restaurant-calendar-next" onClick={() => goToBooking(paymentMethod)}>{t('restaurantDetail.next')}</button>
      </div>}
    >
      <div className="restaurant-payment-page">
        <h2>{t('restaurantDates.paymentTitle')}</h2>
        <fieldset className="restaurant-payment-options">
          <legend className="sr-only">{t('restaurantDates.paymentTitle')}</legend>
          {([
            { value: 'card', label: t('restaurantDates.cardMethod'), icon: CreditCard, brands: [visaLogo, mastercardLogo] },
            { value: 'mpesa', label: t('restaurantDates.mpesaMethod'), logo: mpesaLogo },
            { value: 'airtelMoney', label: t('restaurantDates.airtelMoneyMethod'), logo: airtelMoneyLogo },
            { value: 'orangeMoney', label: t('restaurantDates.orangeMoneyMethod'), logo: orangeMoneyLogo },
            { value: 'paypal', label: t('restaurantDates.paypalMethod'), logo: paypalLogo },
            { value: 'googlePay', label: t('restaurantDates.googlePayMethod'), logo: googlePayLogo },
            { value: 'applePay', label: t('restaurantDates.applePayMethod'), logo: appleLogo },
            { value: 'cash', label: t('restaurantDates.cashMethod'), icon: Banknote }
          ] satisfies Array<{ value: RestaurantPreviewPaymentMethod; label: string; logo?: string; icon?: typeof Banknote; brands?: string[] }>).map(({ value, label, logo, icon: Icon, brands }) => <label key={value} className="restaurant-payment-option" onClick={() => { if (value === 'card' || value === 'cash') openPaymentSheet(value); }}>
            <input type="radio" name="restaurant-payment-method" value={value} checked={paymentMethod === value} onChange={() => { if (value === 'card' || value === 'cash') openPaymentSheet(value); else setPaymentMethod(value); }} />
            <span className={`restaurant-payment-icon ${logo ? 'restaurant-payment-logo' : ''}`.trim()}>
              {logo ? <ShimmerImage src={logo} alt="" /> : Icon ? <Icon aria-hidden="true" strokeWidth={1.5} /> : null}
            </span>
            <span className="restaurant-payment-label">
              {label}
              {brands ? <span className="restaurant-payment-brands">{brands.map(brand => <ShimmerImage key={brand} src={brand} alt="" />)}</span> : null}
            </span>
            <span className="restaurant-payment-radio" aria-hidden="true" />
          </label>)}
        </fieldset>
        <p className="restaurant-payment-notice">{t('restaurantDates.paymentNotice')}</p>
      </div>
    </Modal>
    <Modal
      open={open && paymentOpen && paymentSheet !== null}
      onClose={closePaymentSheet}
      title={t(paymentSheet === 'cash' ? 'restaurantDates.cashDetailsTitle' : 'restaurantDates.cardDetailsTitle')}
      variant="bottom-sheet"
      headerAction={<div className="restaurant-price-heading">
        <h2>{t(paymentSheet === 'cash' ? 'restaurantDates.cashDetailsTitle' : 'restaurantDates.cardDetailsTitle')}</h2>
        <IconButton variant="plain" label={tCommon('actions.close')} icon={<X aria-hidden="true" />} onClick={closePaymentSheet} />
      </div>}
      footer={<div className="restaurant-card-footer">
        <button type="button" className="restaurant-card-cancel" onClick={closePaymentSheet}>{tCommon('actions.cancel')}</button>
        <button type={paymentSheet === 'cash' ? 'submit' : 'button'} form={paymentSheet === 'cash' ? 'restaurant-cash-details-form' : undefined} className="restaurant-times-next" onClick={() => { if (paymentSheet === 'card') goToBooking('card'); }}>{t('restaurantDetail.next')}</button>
      </div>}
    >
      {paymentSheet === 'cash' ? <form id="restaurant-cash-details-form" ref={cashForm} className="restaurant-cash-preview" onSubmit={submitCashDetails} noValidate>
        <p className="restaurant-card-preview-notice">{t('restaurantDates.cashPreviewNotice')}</p>
        <div className="restaurant-card-field-group">
          {(['firstName', 'lastName'] as const).map(field => <label key={field} className="restaurant-card-field restaurant-card-input">
            <span className="sr-only">{t(field === 'firstName' ? 'restaurantDates.cardFirstName' : 'restaurantDates.cardLastName')}</span>
            <input name={field} type="text" autoComplete={field === 'firstName' ? 'given-name' : 'family-name'} placeholder={t(field === 'firstName' ? 'restaurantDates.cardFirstName' : 'restaurantDates.cardLastName')} value={cashDetails[field]} onChange={event => updateCashField(field, event.target.value)} aria-invalid={invalidCashFields.has(field)} aria-describedby={invalidCashFields.has(field) ? 'restaurant-cash-details-error' : undefined} maxLength={80} />
          </label>)}
        </div>
        <h3>{t('restaurantDates.cardBillingAddress')}</h3>
        <div className="restaurant-card-field-group">
          {(['streetAddress', 'apartment', 'city'] as const).map(field => <label key={field} className="restaurant-card-field restaurant-card-input">
            <span className="sr-only">{t(field === 'streetAddress' ? 'restaurantDates.cardStreetAddress' : field === 'apartment' ? 'restaurantDates.cardApartment' : 'restaurantDates.cardCity')}</span>
            <input name={field} type="text" autoComplete={field === 'streetAddress' ? 'street-address' : field === 'apartment' ? 'address-line2' : 'address-level2'} placeholder={t(field === 'streetAddress' ? 'restaurantDates.cardStreetAddress' : field === 'apartment' ? 'restaurantDates.cardApartment' : 'restaurantDates.cardCity')} value={cashDetails[field]} onChange={event => updateCashField(field, event.target.value)} aria-invalid={invalidCashFields.has(field)} aria-describedby={invalidCashFields.has(field) ? 'restaurant-cash-details-error' : undefined} maxLength={120} />
          </label>)}
          <div className="restaurant-card-field-grid">
            {(['region', 'postalCode'] as const).map(field => <label key={field} className="restaurant-card-field restaurant-card-input">
              <span className="sr-only">{t(field === 'region' ? 'restaurantDates.cardState' : 'restaurantDates.cardPostalCode')}</span>
              <input name={field} type="text" autoComplete={field === 'region' ? 'address-level1' : 'postal-code'} placeholder={t(field === 'region' ? 'restaurantDates.cardState' : 'restaurantDates.cardPostalCode')} value={cashDetails[field]} onChange={event => updateCashField(field, event.target.value)} aria-invalid={invalidCashFields.has(field)} aria-describedby={invalidCashFields.has(field) ? 'restaurant-cash-details-error' : undefined} maxLength={field === 'region' ? 120 : 20} />
            </label>)}
          </div>
        </div>
        <div className="restaurant-card-field-group restaurant-card-country"><div><span>{t('restaurantDates.cardCountryRegion')}</span><strong>{t('restaurantDates.cardCountryPlaceholder')}</strong></div></div>
        {cashValidation && !cashValidation.success ? <p id="restaurant-cash-details-error" role="alert" className="restaurant-cash-error">{t('restaurantDates.cashValidationError')}</p> : null}
        <div className="restaurant-cash-total"><span>{t('restaurantDates.estimatedTotal')}</span><strong>{totalPrice}</strong></div>
      </form> : <div className="restaurant-card-preview">
        <p className="restaurant-card-preview-notice">{t('restaurantDates.cardPreviewNotice')}</p>
        <div className="restaurant-card-field-group">
          <div className="restaurant-card-field">{t('restaurantDates.cardNumber')} <LockKeyhole aria-hidden="true" /></div>
          <div className="restaurant-card-field-grid"><div className="restaurant-card-field">{t('restaurantDates.cardExpiration')}</div><div className="restaurant-card-field">{t('restaurantDates.cardCvv')}</div></div>
        </div>
        <div className="restaurant-card-field-group">
          <div className="restaurant-card-field">{t('restaurantDates.cardFirstName')}</div>
          <div className="restaurant-card-field">{t('restaurantDates.cardLastName')}</div>
        </div>
        <h3>{t('restaurantDates.cardBillingAddress')}</h3>
        <div className="restaurant-card-field-group">
          <div className="restaurant-card-field">{t('restaurantDates.cardStreetAddress')}</div>
          <div className="restaurant-card-field">{t('restaurantDates.cardApartment')}</div>
          <div className="restaurant-card-field">{t('restaurantDates.cardCity')}</div>
          <div className="restaurant-card-field-grid"><div className="restaurant-card-field">{t('restaurantDates.cardState')}</div><div className="restaurant-card-field">{t('restaurantDates.cardPostalCode')}</div></div>
        </div>
        <div className="restaurant-card-field-group restaurant-card-country">
          <div><span>{t('restaurantDates.cardCountryRegion')}</span><strong>{t('restaurantDates.cardCountryPlaceholder')}</strong></div>
        </div>
      </div>}
    </Modal>
  </>;
}
