import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { DismissRegular } from '@fluentui/react-icons';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation('common');

  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--color-overlay)] p-3 sm:items-center sm:p-6"
          onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ scale: reducedMotion ? 1 : 0.98, y: reducedMotion ? 0 : 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: reducedMotion ? 1 : 0.98, y: reducedMotion ? 0 : 18, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="max-h-[calc(100dvh-24px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-xl)] outline-none sm:max-h-[calc(100dvh-48px)] sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 id={titleId} className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t('modal.subtitle')}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} leftIcon={<DismissRegular className="h-4 w-4" />}>
                {t('actions.close')}
              </Button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
