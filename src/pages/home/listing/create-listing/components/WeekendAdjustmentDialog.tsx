import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleHelp, Pencil, X } from 'lucide-react';

type WeekendAdjustmentDialogProps = {
  open: boolean;
  basePrice: number;
  adjustment: number;
  similarListingsLabel: string;
  onClose: () => void;
  onSave: (adjustment: number) => void;
};

const MINIMUM_ADJUSTMENT = -99;
const MAXIMUM_ADJUSTMENT = 99;
const priceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

function clampAdjustment(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAXIMUM_ADJUSTMENT, Math.max(MINIMUM_ADJUSTMENT, Math.round(value)));
}

function getAdjustmentLabel(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function WeekendAdjustmentDialog({
  open,
  basePrice,
  adjustment,
  similarListingsLabel,
  onClose,
  onSave
}: WeekendAdjustmentDialogProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draftAdjustment, setDraftAdjustment] = useState(adjustment);

  useEffect(() => {
    if (!open) return;

    setDraftAdjustment(adjustment);
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adjustment, onClose, open]);

  const adjustedPrice = Math.round(basePrice * (1 + draftAdjustment / 100));

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleSave = () => {
    onSave(draftAdjustment);
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
            className="flex h-[min(420px,92dvh)] max-h-[92dvh] w-full max-w-[480px] flex-col overflow-y-auto rounded-t-[28px] bg-[var(--color-surface)] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 text-[var(--color-text-primary)] shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:h-[394px] sm:max-h-[calc(100vh-32px)] sm:rounded-[30px] sm:px-6 sm:pb-4"
          >
            <header className="grid h-12 shrink-0 grid-cols-[44px_1fr_44px] items-center">
              <button
                type="button"
                aria-label="Learn about weekend adjustments"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
              >
                <CircleHelp className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
              </button>
              <h2 id={titleId} className="text-center text-base font-semibold">
                Weekend adjustment
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close weekend adjustment dialog"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
              >
                <X className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col items-center pt-8">
              <div className="flex items-center justify-center gap-2">
                <label className="flex items-center text-[44px] font-bold leading-none tracking-[-0.05em]">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={getAdjustmentLabel(draftAdjustment)}
                    onChange={(event) => {
                      const sanitizedValue = event.target.value.replace(/[^\d-]/g, '');
                      const parsedValue = Number.parseInt(sanitizedValue, 10);
                      setDraftAdjustment(clampAdjustment(parsedValue));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSave();
                    }}
                    aria-label="Weekend adjustment percentage"
                    className="w-[3ch] appearance-none border-0 bg-transparent p-0 text-right outline-none [caret-color:var(--color-text-primary)]"
                  />
                  <span aria-hidden="true">%</span>
                </label>
                <button
                  type="button"
                  onClick={() => inputRef.current?.select()}
                  aria-label="Edit weekend adjustment percentage"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] transition hover:border-[var(--color-text-primary)]"
                >
                  <Pencil className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-7 text-sm text-[var(--color-text-secondary)]">
                FC {priceFormatter.format(adjustedPrice)} for Fri and Sat
              </p>

              <input
                type="range"
                min={MINIMUM_ADJUSTMENT}
                max={MAXIMUM_ADJUSTMENT}
                step={1}
                value={draftAdjustment}
                onChange={(event) => setDraftAdjustment(Number(event.target.value))}
                aria-label="Weekend adjustment slider"
                className="mt-10 h-1 w-full max-w-[432px] cursor-pointer appearance-none rounded-full bg-[var(--color-border)] [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[var(--color-text-primary)] [&::-moz-range-thumb]:bg-[var(--color-surface)] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[var(--color-text-primary)] [&::-webkit-slider-thumb]:bg-[var(--color-surface)] [&::-webkit-slider-thumb]:shadow-md"
              />
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
                className="min-w-[96px] rounded-[14px] bg-[var(--color-text-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-surface)] transition hover:opacity-90"
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
