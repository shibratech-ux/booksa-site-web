import { useEffect, useId, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LoaderCircle, Trash2, X } from 'lucide-react';

export function InProgressListingDialog({
  open,
  title,
  location,
  cover,
  isRemoving,
  onClose,
  onEdit,
  onRemove
}: {
  open: boolean;
  title: string;
  location: string;
  cover: ReactNode;
  isRemoving: boolean;
  onClose: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isRemoving) onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRemoving, onClose, open]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isRemoving) onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={handleBackdropClick}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
            className="relative flex min-h-[456px] w-full max-w-[378px] flex-col items-center rounded-[30px] bg-[var(--color-surface)] px-6 pb-7 pt-16 text-center text-[var(--color-text-primary)] shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isRemoving}
              aria-label="Close listing dialog"
              className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
            >
              <X className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </button>

            <div className="flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-lg bg-[var(--color-surface-muted)]">
              {cover}
            </div>
            <h2 id={titleId} className="mt-4 max-w-[310px] text-sm font-semibold leading-snug">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{location}</p>

            <button
              type="button"
              onClick={onEdit}
              disabled={isRemoving}
              className="mt-10 h-12 w-full rounded-[14px] bg-[var(--color-text-primary)] px-6 text-base font-semibold text-[var(--color-surface)] transition hover:opacity-90 disabled:opacity-50"
            >
              Edit listing
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={isRemoving}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold transition hover:bg-[var(--color-surface-muted)] disabled:cursor-wait disabled:opacity-60"
            >
              {isRemoving ? (
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              )}
              Remove listing
            </button>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
