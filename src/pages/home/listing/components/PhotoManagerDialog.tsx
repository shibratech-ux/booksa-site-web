import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

export const photoActionClass = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-5 text-sm font-semibold transition hover:bg-[var(--color-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40';
export const photoPrimaryClass = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-text-primary)] px-6 text-sm font-semibold text-[var(--color-surface)] transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40';
export const photoIconClass = 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-40';

/** Shared dialog shell for photo actions, including focus and scroll management. */
export function PhotoManagerDialog({ open, title, busy = false, onClose, children, footer }: {
  open: boolean;
  title: string;
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  const reduceMotion = useReducedMotion();
  closeRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!busyRef.current) closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      const elements = panel?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex="0"]');
      if (!elements?.length) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !panel?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[170] flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) onClose();
          }}
        >
          <motion.div
            ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-busy={busy}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97, y: reduceMotion ? 0 : 34 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.98, y: reduceMotion ? 0 : 22 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 360, damping: 28, mass: 0.8 }}
            className="flex max-h-[90dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-dialog bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-xl)] outline-none sm:rounded-dialog [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[var(--color-text-primary)]"
          >
            <header className="relative flex min-h-20 shrink-0 items-center justify-center border-b border-[var(--color-border)] px-16">
              <button type="button" onClick={onClose} disabled={busy} aria-label={`Close ${title.toLowerCase()} dialog`} className={`${photoIconClass} absolute left-4`}>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              <h2 id={titleId} className="text-base font-semibold">{title}</h2>
            </header>
            <div className="min-h-0 overflow-y-auto overscroll-contain p-6 sm:p-8">{children}</div>
            {footer && <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--color-border)] px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">{footer}</footer>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
