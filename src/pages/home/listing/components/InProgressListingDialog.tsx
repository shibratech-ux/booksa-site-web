import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { DotsLoader } from '@/components/common/DotsLoader';

/** Drag distance (px) or fling speed (px/s) that dismisses the sheet. */
const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 500;

function useIsSmallScreen() {
  const query = '(max-width: 639px)'; // below Tailwind `sm`
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return matches;
}

/**
 * Actions for an in-progress listing: a draggable bottom sheet on phones, a centered dialog from `sm` up.
 */
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
  const sheetRef = useRef<HTMLElement>(null);
  const isSheet = useIsSmallScreen();
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();

  // Latest callbacks for the key handler, so the open effect below runs only on open/close.
  const latest = useRef({ isRemoving, onClose });
  latest.current = { isRemoving, onClose };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !latest.current.isRemoving) latest.current.onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    sheetRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isRemoving) onClose();
  };

  const handleDragEnd = (_event: PointerEvent, info: PanInfo) => {
    if (!isRemoving && (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY)) onClose();
  };

  const motionProps = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : isSheet
      ? {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
          transition: { type: 'spring' as const, stiffness: 420, damping: 40, mass: 0.9 }
        }
      : {
          initial: { opacity: 0, scale: 0.96, y: 16 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.97, y: 12 },
          transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const }
        };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[140] flex items-end justify-center bg-black/40 sm:items-center sm:px-4 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={handleBackdropClick}
        >
          <motion.section
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            {...motionProps}
            drag={isSheet && !isRemoving ? 'y' : false}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            onMouseDown={(event) => event.stopPropagation()}
            className="relative flex max-h-[92dvh] w-full flex-col items-center overflow-y-auto rounded-t-dialog bg-[var(--color-surface)] px-6 pb-[max(24px,env(safe-area-inset-bottom))] text-center text-[var(--color-text-primary)] shadow-[var(--shadow-xl)] outline-none sm:min-h-[501.6px] sm:max-w-[415.8px] sm:rounded-dialog sm:pb-7 sm:pt-16"
          >
            {/* Grab handle (phones only): drag down to dismiss. */}
            <div
              onPointerDown={(event) => !isRemoving && dragControls.start(event)}
              className="flex w-full shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing sm:hidden"
              aria-hidden="true"
            >
              <span className="h-1 w-9 rounded-full bg-[var(--color-border)]" />
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isRemoving}
              aria-label="Close listing dialog"
              className="absolute left-3 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)] disabled:opacity-50 sm:left-4 sm:h-10 sm:w-10"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="mt-6 flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-photo bg-[var(--color-surface-muted)] sm:mt-0 sm:h-[154px] sm:w-[154px]">
              {cover}
            </div>
            <h2 id={titleId} className="mt-4 max-w-[341px] text-base font-semibold leading-snug sm:text-sm">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{location}</p>

            <button
              type="button"
              onClick={onEdit}
              disabled={isRemoving}
              className="mt-8 h-12 w-full shrink-0 rounded-button bg-[var(--color-text-primary)] px-6 text-base font-semibold text-[var(--color-surface)] transition hover:opacity-90 disabled:opacity-50 sm:mt-10"
            >
              Edit listing
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={isRemoving}
              className="mt-3 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-button px-4 text-base font-semibold transition hover:bg-[var(--color-surface-muted)] disabled:cursor-wait disabled:opacity-60 sm:mt-5"
            >
              {isRemoving ? (
                <DotsLoader className="w-[60px]" />
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
