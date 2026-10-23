import { useEffect, useRef, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/helpers';

type CalendarDayPanelProps = {
  /** Short date for the pill, e.g. "Nov 3". */
  dateLabel: string;
  /** Full date for screen readers. */
  fullDateLabel: string;
  isBlocked: boolean;
  onBlockedChange: (blocked: boolean) => void;
  /** Formatted nightly price; hidden when the listing has no valid price. */
  price?: { symbol: string; amount: string; label: string };
  /** Opens the night price editor; the card is static when omitted. */
  onEditPrice?: () => void;
  onClose: () => void;
};

const card = 'rounded-[22px] bg-[var(--color-inversurface)] text-[var(--color-surface)] shadow-[var(--shadow-lg)]';

/**
 * Panel for the selected calendar day: date pill with close, availability toggle, the night's price
 * and a custom-settings entry that swaps the cards for the custom settings view.
 * Dark cards use the inverse surface in both themes.
 */
export function CalendarDayPanel({ dateLabel, fullDateLabel, isBlocked, onBlockedChange, price, onEditPrice, onClose }: CalendarDayPanelProps) {
  const { t } = useTranslation('dashboard');
  const [view, setView] = useState<'day' | 'custom'>('day');
  const customSettingsButtonRef = useRef<HTMLButtonElement>(null);
  const customHeadingRef = useRef<HTMLHeadingElement>(null);
  const hasSwitchedView = useRef(false);

  // Move focus into the view that just replaced the one holding it (skipped on first render).
  useEffect(() => {
    if (!hasSwitchedView.current) return;
    if (view === 'custom') customHeadingRef.current?.focus();
    else customSettingsButtonRef.current?.focus();
  }, [view]);

  const showView = (next: 'day' | 'custom') => {
    hasSwitchedView.current = true;
    setView(next);
  };

  return (
    <section
      aria-label={fullDateLabel}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        if (view === 'custom') showView('day');
        else onClose();
      }}
      className="absolute inset-x-3 bottom-3 z-20 md:inset-x-6"
    >
      <div className="mb-2 flex items-center justify-end gap-2">
        <span className="inline-flex h-11 items-center rounded-full bg-[var(--color-inversurface)] px-5 text-sm font-semibold text-[var(--color-surface)] shadow-[var(--shadow-lg)]">
          {dateLabel}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('calendar.dayPanel.close')}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-inversurface)] text-[var(--color-surface)] shadow-[var(--shadow-lg)] transition active:scale-[0.96]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {view === 'custom' ? (
        <div className={cn(card, 'p-4')}>
          <h2 ref={customHeadingRef} tabIndex={-1} className="text-[13px] font-normal opacity-70 outline-none">
            {t('calendar.dayPanel.customSettings')}
          </h2>
          {/* TODO(design): no editor screens yet. TODO(team): min nights and cancellation policy need fields
              agreed with the Flutter app (availability is a [target] collection) before these rows can open. */}
          <ul className="mt-4 space-y-2.5">
            {(['minimumNights', 'cancellationPolicy'] as const).map((setting) => (
              <li key={setting}>
                <button
                  type="button"
                  disabled
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-card border border-[color-mix(in_srgb,var(--color-surface)_18%,transparent)] px-4 text-left text-sm font-semibold disabled:cursor-default"
                >
                  {t(`calendar.dayPanel.${setting}`)}
                  <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => showView('day')}
            className="mt-3.5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[var(--color-surface)] px-4 text-sm font-semibold text-[var(--color-text-primary)] transition active:scale-[0.98]"
          >
            {t('calendar.dayPanel.done')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          <div className={cn(card, 'flex min-h-[172px] flex-col justify-between p-4')}>
            <div className="flex items-center justify-between gap-2 text-[13px]">
              <span>{t(isBlocked ? 'calendar.dayPanel.blocked' : 'calendar.dayPanel.available')}</span>
              <span
                aria-hidden="true"
                className={cn('h-2 w-2 rounded-full', isBlocked ? 'bg-[var(--color-text-secondary)]' : 'bg-[var(--color-success)]')}
              />
            </div>
            {/* TODO(team): persist to the planned availability collection; local to this screen until then. */}
            <div
              role="radiogroup"
              aria-label={t('calendar.dayPanel.availability')}
              className="grid h-11 grid-cols-2 rounded-full bg-[color-mix(in_srgb,var(--color-surface)_14%,transparent)] p-1"
            >
              {([
                { blocked: true, Icon: X, label: t('calendar.dayPanel.block') },
                { blocked: false, Icon: Check, label: t('calendar.dayPanel.open') }
              ] as const).map(({ blocked, Icon, label }) => {
                const isActive = isBlocked === blocked;
                return (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    aria-label={label}
                    onClick={() => onBlockedChange(blocked)}
                    className={cn(
                      'inline-flex items-center justify-center rounded-full transition-colors',
                      isActive && 'bg-[var(--color-surface)] text-[var(--color-text-primary)]'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-rows-[1fr_auto] gap-1.5">
            {/* TODO(team): Airbnb shows the last-minute discounted price here; discount rates are not modelled yet. */}
            {price && onEditPrice ? (
              <button
                type="button"
                onClick={onEditPrice}
                aria-label={`${t('calendar.dayPanel.nightlyPrice')}, ${price.label}`}
                className={cn(card, 'flex min-w-0 flex-col justify-between p-4 text-left transition active:scale-[0.98]')}
              >
                <span className="text-[13px]">{t('calendar.dayPanel.nightlyPrice')}</span>
                <span className="mt-3 max-w-full truncate text-[30px] font-semibold leading-none tracking-[-0.02em]">
                  <span className="text-[0.6em] opacity-70">{price.symbol}</span> {price.amount}
                </span>
              </button>
            ) : (
              <div className={cn(card, 'flex flex-col justify-between p-4')}>
                <span className="text-[13px]">{t('calendar.dayPanel.nightlyPrice')}</span>
                <span className="mt-3 text-[13px] opacity-70">{t('calendar.dayPanel.noPrice')}</span>
              </div>
            )}
            <button
              ref={customSettingsButtonRef}
              type="button"
              onClick={() => showView('custom')}
              className={cn(card, 'flex min-h-14 items-center justify-between px-4 text-left text-[13px] transition active:scale-[0.98]')}
            >
              {t('calendar.dayPanel.customSettings')}
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">{t(isBlocked ? 'calendar.dayPanel.blocked' : 'calendar.dayPanel.available')}</p>
      <p className="mt-1.5 text-center">
        <span className="inline-block rounded-full bg-[var(--color-surface)] px-3 py-1 text-[11px] text-[var(--color-text-secondary)]">{t('calendar.dayPanel.localOnly')}</span>
      </p>
    </section>
  );
}
