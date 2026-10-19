import { useEffect, useId, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Search, X } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { BackButton } from '@/components/ui/BackButton';
import { DestinationSuggestions } from './DestinationSuggestions';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ROUTES } from '@/utils/constants';
import { formatDateRange } from '@/utils/formatters';

type Section = 'where' | 'when' | 'who';
type Category = 'homes' | 'experiences' | 'services';

export function SearchDialog({ open, onClose, initialSection = 'where' }: {
  open: boolean;
  onClose: () => void;
  initialSection?: Section;
}) {
  const { t } = useTranslation('navigation');
  const location = useLocation();
  const navigate = useNavigate();
  const id = useId();
  const [section, setSection] = useState<Section>(initialSection);
  const category: Category = location.pathname === ROUTES.experiences ? 'experiences' : location.pathname === ROUTES.services ? 'services' : 'homes';
  useEffect(() => {
    if (open) {
      setSection(initialSection);
      setPickingDestination(false);
    }
  }, [open, initialSection]);
  const [pickingDestination, setPickingDestination] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const destinationTriggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!pickingDestination) return;
    const frame = requestAnimationFrame(() => destinationInputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [pickingDestination]);
  const [destination, setDestination] = useState('');
  const [nearby, setNearby] = useState(false);
  const [arrival, setArrival] = useState('');
  const [departure, setDeparture] = useState('');
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0 });
  const totalGuests = guests.adults + guests.children;
  // Date inputs retain local calendar dates; no booking or availability is created here.
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const checkoutMinimum = new Date(`${arrival || today}T12:00:00`);
  checkoutMinimum.setDate(checkoutMinimum.getDate() + 1);
  const earliestCheckout = `${checkoutMinimum.getFullYear()}-${String(checkoutMinimum.getMonth() + 1).padStart(2, '0')}-${String(checkoutMinimum.getDate()).padStart(2, '0')}`;
  const summary = {
    where: nearby ? t('searchPanel.nearby') : destination || t('searchDestinations'),
    when: arrival && departure ? formatDateRange(`${arrival}T12:00:00`, `${departure}T12:00:00`) : t('addDates'),
    who: totalGuests || guests.infants ? [totalGuests ? t('searchPanel.guests', { count: totalGuests }) : '', guests.infants ? t('searchPanel.infantCount', { count: guests.infants }) : ''].filter(Boolean).join(', ') : t('addGuests')
  };

  function returnToSearch() {
    setPickingDestination(false);
    requestAnimationFrame(() => destinationTriggerRef.current?.focus());
  }

  function selectDestination(value: string | null) {
    setDestination(value ?? '');
    setNearby(value === null);
    setPickingDestination(false);
    setSection('when');
    requestAnimationFrame(() => document.getElementById(`${id}-when-trigger`)?.focus());
  }

  function clear() {
    setDestination('');
    setNearby(false);
    setArrival('');
    setDeparture('');
    setGuests({ adults: 0, children: 0, infants: 0 });
    setSection('where');
  }

  function submit() {
    const params = new URLSearchParams({ category });
    if (nearby) params.set('nearby', 'true');
    else if (destination.trim()) params.set('destination', destination.trim());
    if (arrival) params.set('checkIn', arrival);
    if (departure) params.set('checkOut', departure);
    for (const [key, value] of Object.entries(guests)) if (value) params.set(key, String(value));
    onClose();
    navigate(`${ROUTES.seeAllMap}?${params.toString()}`);
  }

  return (
    <BottomSheet
      open={open}
      onClose={pickingDestination ? returnToSearch : onClose}
      title={t(pickingDestination ? 'searchDestinations' : 'searchAll')}
      tone={pickingDestination ? 'surface' : 'muted'}
      header={pickingDestination ? (
        <form onSubmit={(event) => { event.preventDefault(); if (destinationQuery.trim()) selectDestination(destinationQuery.trim()); }} className="flex h-14 items-center rounded-field border border-[var(--color-inversurface)] px-1 focus-within:ring-1 focus-within:ring-[var(--color-inversurface)]">
          <BackButton label={t('searchPanel.backToSearch')} onClick={returnToSearch} />
          <input ref={destinationInputRef} type="search" enterKeyHint="search" aria-label={t('searchDestinations')} placeholder={t('searchDestinations')} value={destinationQuery}
            onChange={(event) => setDestinationQuery(event.target.value)} className="h-full min-w-0 flex-1 rounded-field bg-transparent pr-3 text-sm focus-visible:outline-none" />
        </form>
      ) : (
        <div className="flex justify-end">
          <IconButton label={t('searchPanel.closeSearch')} onClick={onClose} icon={<X className="h-5 w-5" aria-hidden="true" />} />
        </div>
      )}
      footer={pickingDestination ? undefined : (
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={clear} className="min-h-11 font-semibold underline underline-offset-4">{t('searchPanel.clearAll')}</button>
          <Button fullWidth={false} onClick={submit} disabled={Boolean(arrival && !departure)} className="h-auto! min-h-11 py-[11.2px] max-sm:h-auto! max-sm:py-[12.8px] bg-[var(--color-primary-500)]! hover:bg-[var(--color-primary-600)]! focus:ring-[var(--color-primary-500)]! focus:ring-offset-[var(--color-surface)]" leftIcon={<Search className="h-5 w-5" aria-hidden="true" />}>
            {t('searchPanel.search')}
          </Button>
        </div>
      )}
    >
      {pickingDestination ? (
        <DestinationSuggestions query={destinationQuery} onSelect={selectDestination} />
      ) : (
        <div className="space-y-3 text-[var(--color-text-primary)]">
          {(['where', 'when', 'who'] as const).map((key) => (
            <section key={key} className={`overflow-hidden bg-[var(--color-surface)] shadow-[var(--shadow-md)] ${section === key ? 'rounded-dialog' : 'rounded-card'}`}>
              <h2>
                <button id={`${id}-${key}-trigger`} type="button" aria-expanded={section === key} aria-controls={`${id}-${key}`} onClick={() => setSection(key)}
                  className={`flex min-h-14 w-full items-center justify-between gap-3 px-6 text-left ${section === key ? 'pt-5 pb-3 text-2xl font-bold tracking-tight' : 'py-4 text-sm'}`}>
                  <span className={section === key ? '' : 'text-[var(--color-text-secondary)]'}>{t(section === key ? `searchPanel.${key}Title` : key)}</span>
                  {section !== key && <span className="truncate font-semibold">{summary[key]}</span>}
                </button>
              </h2>
              <div id={`${id}-${key}`} hidden={section !== key}>
                {key === 'where' && (
                  <div className="px-6 pb-3">
                    <button ref={destinationTriggerRef} type="button" onClick={() => { setDestinationQuery(destination); setPickingDestination(true); }} aria-haspopup="dialog"
                      className="mb-4 flex h-14 w-full items-center gap-3 rounded-field border border-[var(--color-inversurface)] px-4 text-left text-sm focus-visible:outline-[var(--color-inversurface)]">
                      <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className={`truncate ${destination || nearby ? '' : 'text-[var(--color-text-secondary)]'}`}>{summary.where}</span>
                    </button>
                    <DestinationSuggestions query="" compact onSelect={selectDestination} />
                  </div>
                )}
                {key === 'when' && (
                  <div className="space-y-4 px-6 pb-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="min-w-0 space-y-2 text-sm"><span className="block">{t('searchPanel.checkIn')}</span><input type="date" value={arrival} min={today} onChange={(event) => { const value = event.target.value; setArrival(value); if (!value || departure <= value) setDeparture(''); }} className="min-h-12 w-full min-w-0 rounded-field border border-[var(--color-border)] bg-transparent px-3" /></label>
                      <label className="min-w-0 space-y-2 text-sm"><span className="block">{t('searchPanel.checkOut')}</span><input type="date" value={departure} disabled={!arrival} min={earliestCheckout} onChange={(event) => setDeparture(event.target.value > arrival ? event.target.value : '')} className="min-h-12 w-full min-w-0 rounded-field border border-[var(--color-border)] bg-transparent px-3 disabled:opacity-50" /></label>
                    </div>
                    <Button variant="secondary" onClick={() => setSection('who')}>{t('searchPanel.next')}</Button>
                  </div>
                )}
                {key === 'who' && (
                  <div className="px-6 pb-4">
                    {(['adults', 'children', 'infants'] as const).map((group) => (
                      <div key={group} className="flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] py-4 last:border-0">
                        <span><span id={`${id}-${group}`} className="block text-sm font-semibold">{t(`searchPanel.${group}`)}</span><span className="text-xs text-[var(--color-text-secondary)]">{t(`searchPanel.${group}Age`)}</span></span>
                        <div className="flex items-center gap-3">
                          <IconButton label={t('searchPanel.remove', { group: t(`searchPanel.${group}`) })} icon={<Minus aria-hidden="true" />} disabled={!guests[group]} onClick={() => setGuests((current) => ({ ...current, [group]: current[group] - 1 }))} />
                          <output aria-labelledby={`${id}-${group}`} aria-live="polite" className="w-4 text-center text-sm">{guests[group]}</output>
                          <IconButton label={t('searchPanel.add', { group: t(`searchPanel.${group}`) })} icon={<Plus aria-hidden="true" />} disabled={guests[group] >= 16} onClick={() => setGuests((current) => ({ ...current, [group]: current[group] + 1 }))} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
