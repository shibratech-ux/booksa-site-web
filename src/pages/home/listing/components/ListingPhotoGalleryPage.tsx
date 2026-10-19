import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ImageOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/ui/BackButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

// Pinterest-style masonry of every listing photo, shown as a full-screen page over the preview so the
// preview keeps its scroll position and state. Opens scrolled to the photo that was clicked.
export function ListingPhotoGalleryPage({ title, photoUrls, initialIndex, onBack }: {
  title: string;
  photoUrls: string[];
  initialIndex: number;
  onBack: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const reducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const backRef = useRef(onBack);

  useEffect(() => { backRef.current = onBack; }, [onBack]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    headingRef.current?.focus({ preventScroll: true });
    const frame = requestAnimationFrame(() => {
      if (initialIndex > 0) {
        scrollerRef.current
          ?.querySelector(`[data-gallery-index="${initialIndex}"]`)
          ?.scrollIntoView({ block: 'center' });
      }
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        backRef.current();
      }
      // The back button is the only control, so keep focus inside the page.
      if (event.key === 'Tab') {
        event.preventDefault();
        scrollerRef.current?.querySelector<HTMLButtonElement>('header button')?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [initialIndex]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      ref={scrollerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-gallery-heading"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 330, damping: 34, mass: 0.9 }}
      className="fixed inset-0 z-[150] overflow-y-auto overscroll-contain bg-[var(--color-surface)] text-[var(--color-text-primary)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[var(--color-text-primary)]"
    >
      <header className="sticky top-0 z-10 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-8">
          <BackButton label={t('listingGallery.back')} onClick={onBack} />
          <div className="min-w-0">
            <h1 id="listing-gallery-heading" ref={headingRef} tabIndex={-1} className="truncate text-[0.93427425rem] font-semibold outline-none">
              {title}
            </h1>
            <p className="text-[0.72665775rem] text-[var(--color-text-secondary)]">{t('listingGallery.count', { count: photoUrls.length })}</p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pb-[max(32px,env(safe-area-inset-bottom))] pt-4 sm:px-8 sm:pt-6">
        {photoUrls.length > 0 ? (
          // CSS columns give the masonry: each photo keeps its own aspect ratio and flows top to bottom.
          <ul className="columns-2 gap-2 sm:columns-3 sm:gap-3 lg:columns-4">
            {photoUrls.map((url, index) => (
              <li
                key={url}
                data-gallery-index={index}
                className="relative mb-2 break-inside-avoid overflow-hidden rounded-photo bg-[var(--color-surface-muted)] sm:mb-3"
              >
                <ImageOff className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" aria-hidden="true" />
                <ShimmerImage
                  src={url}
                  alt={t('listingPreview.photoAlt', { number: index + 1, total: photoUrls.length, title })}
                  loading={Math.abs(index - initialIndex) < 6 ? 'eager' : 'lazy'}
                  decoding="async"
                  // Reserve height while loading so columns don't jump; hide the broken-image glyph on error.
                  className="relative block h-auto w-full data-[image-state=error]:invisible data-[image-state=error]:min-h-40 data-[image-state=loading]:min-h-48"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="py-16 text-center text-[0.830466rem] text-[var(--color-text-secondary)]">{t('listingGallery.empty')}</p>
        )}
      </div>
    </motion.div>,
    document.body
  );
}
