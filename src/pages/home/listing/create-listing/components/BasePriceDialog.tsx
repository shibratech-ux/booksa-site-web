import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, CircleHelp, X } from 'lucide-react';

type BasePriceDialogProps = {
  open: boolean;
  price: number;
  similarListingsLabel: string;
  onClose: () => void;
  onSave: (price: number) => void;
};

const MINIMUM_PRICE = 1;
const MAXIMUM_PRICE = 9999999;
const GUEST_SERVICE_FEE_RATE = 0.1;
const HOST_SERVICE_FEE_RATE = 0.03;
const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

function normalizePrice(value: string) {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue)) return MINIMUM_PRICE;
  return Math.min(MAXIMUM_PRICE, Math.max(MINIMUM_PRICE, parsedValue));
}

export function BasePriceDialog({
  open,
  price,
  similarListingsLabel,
  onClose,
  onSave
}: BasePriceDialogProps) {
  const titleId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draftPrice, setDraftPrice] = useState(String(price));
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    setDraftPrice(String(price));
    setIsBreakdownOpen(false);
    const previousOverflow = document.body.style.overflow;
    const focusTimer = window.setTimeout(() => inputRef.current?.select(), 120);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open, price]);

  const isPriceInvalid = draftPrice === '' || Number(draftPrice) <= 0;
  const normalizedPrice = isPriceInvalid ? 0 : normalizePrice(draftPrice);
  const guestServiceFee = Math.round(normalizedPrice * GUEST_SERVICE_FEE_RATE);
  const guestPrice = normalizedPrice + guestServiceFee;
  const hostEarnings = normalizedPrice - Math.round(normalizedPrice * HOST_SERVICE_FEE_RATE);
  const formattedDraftPrice = isPriceInvalid ? '0' : priceFormatter.format(Number(draftPrice));

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSave = () => {
    if (isPriceInvalid) {
      inputRef.current?.focus();
      return;
    }

    onSave(normalizedPrice);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:px-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={handleBackdropClick}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
            className={`flex max-h-[92dvh] w-full max-w-[528px] flex-col overflow-y-auto rounded-lg bg-[var(--color-surface)] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 text-[var(--color-text-primary)] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-[height] duration-200 sm:max-h-[calc(100vh-32px)] sm:rounded-lg sm:px-6 sm:pb-4 ${
              isBreakdownOpen ? 'h-[min(580px,92dvh)]' : 'h-[min(444px,92dvh)]'
            }`}
          >
            <header className="grid h-12 shrink-0 grid-cols-[44px_1fr_44px] items-center">
              <button
                type="button"
                aria-label="Learn about base pricing"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-[var(--color-surface-muted)]"
              >
                <CircleHelp className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
              </button>
              <h2 id={titleId} className="text-center text-base font-semibold">
                Base price
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close base price dialog"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-[var(--color-surface-muted)]"
              >
                <X className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col items-center pt-6">
              <label
                className={`flex w-full items-center justify-center gap-2 text-[47.04px] font-bold leading-none tracking-[-0.055em] sm:text-[51.744px] ${
                  isPriceInvalid ? 'text-[var(--color-danger)]' : ''
                }`}
              >
                <span aria-hidden="true">FC</span>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={formattedDraftPrice}
                  style={{ width: `${Math.max(1, formattedDraftPrice.length)}ch` }}
                  onChange={(event) =>
                    setDraftPrice(event.target.value.replace(/[^\d]/g, '').slice(0, 7))
                  }
                  onBlur={() => {
                    if (!isPriceInvalid) setDraftPrice(String(normalizePrice(draftPrice)));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSave();
                  }}
                  aria-label="Base price in Congolese francs"
                  aria-invalid={isPriceInvalid}
                  aria-describedby={isPriceInvalid ? errorId : undefined}
                  className="appearance-none border-0 bg-transparent p-0 text-left outline-none [caret-color:var(--color-text-primary)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </label>

              {isPriceInvalid ? (
                <p id={errorId} role="alert" className="mt-3 text-sm font-medium text-[var(--color-danger)]">
                  Enter an amount greater than 0.
                </p>
              ) : null}

              <AnimatePresence mode="wait" initial={false}>
                {isBreakdownOpen ? (
                  <motion.div
                    key="price-breakdown"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16 }}
                    className="mt-7 w-full max-w-[319px]"
                  >
                    <div className="rounded-sm border-2 border-[var(--color-text-primary)] px-4 py-4 text-base">
                      <div className="flex items-center justify-between gap-5">
                        <span>Base price</span>
                        <span>FC {priceFormatter.format(normalizedPrice)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-5">
                        <span>Guest service fee</span>
                        <span>FC {priceFormatter.format(guestServiceFee)}</span>
                      </div>
                      <div className="my-4 border-t border-[var(--color-border)]" />
                      <div className="flex items-center justify-between gap-5 font-bold">
                        <span>Guest price before taxes</span>
                        <span className="shrink-0">FC {priceFormatter.format(guestPrice)}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-5 rounded-sm border border-[var(--color-border)] px-4 py-4 text-base font-bold">
                      <span>You earn</span>
                      <span className="shrink-0">FC {priceFormatter.format(hostEarnings)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsBreakdownOpen(false)}
                      className="mx-auto mt-7 flex items-center gap-1.5 rounded-md px-2 py-1 text-base transition hover:bg-[var(--color-surface-muted)]"
                    >
                      Show less
                      <ChevronUp className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="price-summary"
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsBreakdownOpen(true)}
                    className={`${isPriceInvalid ? 'mt-4' : 'mt-8'} inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-base transition hover:bg-[var(--color-surface-muted)]`}
                    aria-expanded="false"
                    aria-label={`Guest price before taxes is FC ${priceFormatter.format(guestPrice)}. Show price breakdown.`}
                  >
                    Guest price before taxes FC {priceFormatter.format(guestPrice)}
                    <ChevronDown className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <footer className="flex shrink-0 items-center justify-between gap-4">
              <button
                type="button"
                className="rounded-md px-1 py-2 text-sm font-medium underline underline-offset-2 transition hover:text-[var(--color-text-secondary)]"
              >
                View similar {similarListingsLabel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="min-w-[105.6px] rounded-md bg-[var(--color-text-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-surface)] transition hover:opacity-90"
              >
                Done
              </button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
