import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Outlined field with a small floating label, shared by the listing editor sheets.
export const editorSheetFieldClass =
  'block min-h-14 w-full rounded-field border border-[var(--color-border)] bg-[var(--color-surface)] px-4 pb-2 pt-6 text-[0.93427425rem] text-[var(--color-text-primary)] transition focus-within:border-[var(--color-text-primary)] focus-within:ring-1 focus-within:ring-[var(--color-text-primary)]';

// Full-height bottom sheet on mobile, centered dialog from `sm` up: close · heading, scrollable body, Cancel/Save footer.
// `variant="picker"`: compact sheet with a left-aligned heading + description and a single full-width Save
// (dismiss with Escape or the backdrop).
export function EditorBottomSheet({
  open,
  heading,
  closeLabel,
  isSaving,
  canSave,
  onClose,
  onSave,
  initialFocusRef,
  headerAction,
  bodyClassName,
  compact = false,
  variant = 'default',
  showFooter = true,
  hideCancel = false,
  closeIcon = 'close',
  cancelStyle = 'link',
  headingVisuallyHidden = false,
  description,
  saveLabel,
  overlay,
  children
}: {
  open: boolean;
  heading: string;
  closeLabel: string;
  isSaving: boolean;
  canSave: boolean;
  onClose: () => void;
  onSave: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  headerAction?: ReactNode;
  bodyClassName?: string;
  compact?: boolean;
  variant?: 'default' | 'picker';
  showFooter?: boolean;
  /** Footer shows only a right-aligned Save (dismiss with ✕, Escape or the backdrop). */
  hideCancel?: boolean;
  /** ← when the sheet is a step inside a page flow, ✕ otherwise. */
  closeIcon?: 'close' | 'back';
  cancelStyle?: 'link' | 'outlined';
  /** Keeps the header heading for assistive tech when the body renders its own visible title. */
  headingVisuallyHidden?: boolean;
  description?: string;
  /** Primary footer label in the default variant; "Save" when omitted. */
  saveLabel?: string;
  overlay?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation('dashboard');
  const headingId = useId();
  const descriptionId = useId();
  const isPicker = variant === 'picker';
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const closeRef = useRef(onClose);
  const isSavingRef = useRef(isSaving);

  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => { isSavingRef.current = isSaving; }, [isSaving]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => (initialFocusRef?.current ?? panelRef.current)?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!isSavingRef.current) closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'
      ) ?? []).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {
        event.preventDefault();
      } else if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [open, initialFocusRef]);

  const requestClose = () => {
    if (!isSavingRef.current) onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex h-dvh items-end justify-center bg-[var(--color-overlay)] pt-6 sm:items-center sm:p-6 [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[var(--color-text-primary)]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) requestClose();
          }}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            aria-describedby={description ? descriptionId : undefined}
            initial={reducedMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { y: '100%' }}
            transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 330, damping: 34, mass: 0.9 }}
            className={`relative flex w-full flex-col overflow-hidden rounded-t-dialog bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-xl)] outline-none dark:border dark:border-[var(--color-border)] sm:max-w-xl sm:rounded-dialog ${compact || isPicker ? 'max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)]' : 'h-full sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:min-h-[560px]'}`}
          >
            {isPicker ? (
              <header className="shrink-0 px-6 pb-3 pt-6 sm:px-8">
                <h2 id={headingId} className="text-[0.93427425rem] font-medium">{heading}</h2>
                {description ? (
                  <p id={descriptionId} className="mt-1 text-[0.72665775rem] leading-snug text-[var(--color-text-secondary)]">{description}</p>
                ) : null}
              </header>
            ) : (
            <header className="grid shrink-0 grid-cols-[minmax(44px,auto)_minmax(0,1fr)_minmax(44px,auto)] items-center px-4 pb-2 pt-4 sm:px-6 sm:pt-5">
              <button
                type="button"
                onClick={requestClose}
                disabled={isSaving}
                aria-label={closeLabel}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
              >
                {closeIcon === 'back' ? <ArrowLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /> : <X className="h-5 w-5" aria-hidden="true" />}
              </button>
              <h2 id={headingId} className={`truncate text-center text-[0.93427425rem] font-semibold ${headingVisuallyHidden ? 'sr-only' : ''}`}>
                {heading}
              </h2>
              {headerAction}
            </header>
            )}

            <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-8 ${bodyClassName ?? 'pb-24 pt-6'}`}>
              {children}
            </div>

            {overlay}

            {!showFooter ? null : isPicker ? (
              <footer className="shrink-0 border-t border-[var(--color-border-subtle)] px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:px-8">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={!canSave || isSaving}
                  aria-busy={isSaving}
                  className="min-h-12 w-full rounded-full bg-[var(--color-text-primary)] px-6 text-[0.830466rem] font-semibold text-[var(--color-surface)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:border disabled:border-[var(--color-border)] disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)]"
                >
                  {isSaving ? t('editorSheet.saving') : t('editorSheet.save')}
                </button>
              </footer>
            ) : (
            <footer className={`flex shrink-0 items-center border-t border-[var(--color-border-subtle)] px-6 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:px-8 ${hideCancel ? 'justify-end' : 'justify-between'}`}>
              {hideCancel ? null : (
              <button
                type="button"
                onClick={requestClose}
                disabled={isSaving}
                className={cancelStyle === 'outlined'
                  ? 'min-h-11 rounded-full border border-[var(--color-text-primary)] px-4 text-[0.830466rem] font-semibold transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50'
                  : 'min-h-11 rounded-button px-2 text-[0.830466rem] font-semibold underline-offset-4 transition hover:underline disabled:opacity-50'}
              >
                {t('editorSheet.cancel')}
              </button>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={!canSave || isSaving}
                aria-busy={isSaving}
                className={`min-h-12 bg-[var(--color-text-primary)] text-[0.830466rem] font-semibold text-[var(--color-surface)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-surface)] ${
                  cancelStyle === 'outlined' ? 'rounded-full px-12' : 'rounded-button px-6'
                }`}
              >
                {isSaving ? t('editorSheet.saving') : saveLabel ?? t('editorSheet.save')}
              </button>
            </footer>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
