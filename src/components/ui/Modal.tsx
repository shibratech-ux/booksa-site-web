import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  variant?: 'default' | 'sheet' | 'bottom-sheet' | 'fullscreen';
  subtitle?: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  sheetSize?: 'default' | 'compact';
  dismissDisabled?: boolean;
  suspended?: boolean;
  /** `inverse`: dark-on-light sheet in both themes (host calendar editors). */
  sheetTone?: 'surface' | 'muted' | 'inverse';
}

export function Modal({ open, title, children, onClose, variant = 'default', subtitle, headerAction, footer, sheetSize = 'default', dismissDisabled = false, suspended = false, sheetTone = 'surface' }: ModalProps) {
  const isSheet = variant === 'sheet';
  const isBottomSheet = variant === 'bottom-sheet';
  const isFullscreen = variant === 'fullscreen';
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const suspendedRef = useRef(suspended);
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation('common');

  useEffect(() => { closeRef.current = () => { if (!dismissDisabled) onClose(); }; }, [onClose, dismissDisabled]);
  useEffect(() => { suspendedRef.current = suspended; }, [suspended]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (suspendedRef.current) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'
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
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`fixed inset-0 z-[150] flex items-end justify-center bg-[var(--color-overlay)] ${isFullscreen ? '' : 'sm:p-6'} ${isBottomSheet ? 'pt-[max(12px,env(safe-area-inset-top))]' : 'sm:items-center'}`}
          onClick={(event) => { if (event.target === event.currentTarget) closeRef.current(); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ scale: reducedMotion || isBottomSheet || isFullscreen ? 1 : 0.98, y: reducedMotion ? 0 : isBottomSheet ? '100%' : 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: reducedMotion || isBottomSheet || isFullscreen ? 1 : 0.98, y: reducedMotion ? 0 : isBottomSheet ? '100%' : 18, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className={isFullscreen ? 'flex h-dvh w-full flex-col overflow-hidden bg-[var(--color-surface)] text-[var(--color-text-primary)] outline-none' : `w-full max-w-2xl overscroll-contain rounded-t-dialog border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] outline-none sm:rounded-dialog ${isBottomSheet
              ? `flex max-h-full flex-col overflow-hidden p-0 ${sheetSize === 'compact' ? 'max-h-[min(420px,85dvh)]' : 'h-full sm:h-[min(760px,90dvh)]'} ${sheetTone === 'muted' ? 'bg-[var(--color-surface-muted)]!' : sheetTone === 'inverse' ? 'border-transparent! bg-[var(--color-inversurface)]! text-[var(--color-surface)]' : ''}`
              : isSheet
              ? `flex max-h-[calc(100dvh-16px)] flex-col overflow-hidden ${sheetSize === 'compact' ? 'h-[min(380px,85dvh)] sm:h-[min(560px,85dvh)]' : 'h-[85dvh] sm:h-[min(640px,85dvh)]'}`
              : 'max-h-[calc(100dvh-16px)] overflow-y-auto px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 sm:max-h-[calc(100dvh-48px)] sm:p-8'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-hidden={suspended || undefined}
          >
            {isFullscreen ? (
              <div className="flex shrink-0 justify-end px-3 pb-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
                <h3 id={titleId} className="sr-only">{title}</h3>
                {headerAction ?? <IconButton variant="plain" disabled={dismissDisabled} label={t('actions.close')} onClick={onClose} icon={<X className="h-5 w-5" aria-hidden="true" />} />}
              </div>
            ) : isBottomSheet ? (
              <div className="shrink-0 px-5 pb-3 pt-5">
                <h3 id={titleId} className="sr-only">{title}</h3>
                {headerAction}
              </div>
            ) : isSheet ? (
              <div className="grid shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center px-3 py-2">
                {headerAction ? <IconButton variant="plain" disabled={dismissDisabled} label={t('actions.close')} onClick={onClose} icon={<X className="h-5 w-5" aria-hidden="true" />} /> : <span aria-hidden="true" />}
                <div className="min-w-0 py-2 text-center">
                  <h3 id={titleId} className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
                  {subtitle ? <div className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{subtitle}</div> : null}
                </div>
                {headerAction ?? <IconButton variant="plain" disabled={dismissDisabled} label={t('actions.close')} onClick={onClose} icon={<X className="h-5 w-5" aria-hidden="true" />} />}
              </div>
            ) : (
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 id={titleId} className="break-words text-xl font-semibold text-[var(--color-text-primary)]">{title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t('modal.subtitle')}</p>
                </div>
                <IconButton disabled={dismissDisabled} label={t('actions.close')} onClick={onClose} icon={<X className="h-5 w-5" aria-hidden="true" />} />
              </div>
            )}
            {isFullscreen ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">{children}</div>
            ) : isBottomSheet ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(16px,env(safe-area-inset-bottom))]">{children}</div>
            ) : isSheet ? (
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 sm:px-8">
                {children}
              </div>
            ) : children}
            {footer ? <div className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-8">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
