import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, X } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

export function RestaurantPhotoGallery({ open, photos, onClose }: {
  open: boolean;
  photos: string[];
  onClose: () => void;
}) {
  const { t } = useTranslation('booking');
  const { t: tCommon } = useTranslation('common');
  const [selected, setSelected] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const mosaic = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const mosaicScroll = useRef(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => { if (!open) setSelected(null); }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    if (selected !== null && viewer.current) {
      viewer.current.scrollLeft = selected * viewer.current.clientWidth;
      viewer.current.focus({ preventScroll: true });
    } else if (selected === null && mosaic.current) {
      const scroller = mosaic.current.parentElement;
      if (scroller) scroller.scrollTop = mosaicScroll.current;
      trigger.current?.focus({ preventScroll: true });
    }
  }, [selected, open]);

  const move = (direction: -1 | 1) => {
    const index = Math.max(0, Math.min(photos.length - 1, active + direction));
    if (viewer.current) viewer.current.scrollTo({ left: index * viewer.current.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const openPhoto = (index: number, button: HTMLButtonElement) => {
    mosaicScroll.current = mosaic.current?.parentElement?.scrollTop ?? 0;
    trigger.current = button;
    setActive(index);
    setSelected(index);
  };

  const header = selected === null ? undefined : (
    <div className="grid w-full grid-cols-[44px_minmax(0,1fr)_44px] items-center">
      <IconButton variant="plain" label={t('listingDetail.showAllPhotos')} icon={<Copy />} onClick={() => setSelected(null)} />
      <p role="status" aria-live="polite" className="text-center text-xs text-[var(--color-text-secondary)]">
        {t('listingDetail.photoCounter', { current: active + 1, total: photos.length })}
      </p>
      <IconButton variant="plain" label={tCommon('actions.close')} icon={<X />} onClick={onClose} />
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={t('listingDetail.showAllPhotos')} variant="fullscreen" headerAction={header}>
      <div ref={mosaic} className="restaurant-photo-mosaic" hidden={selected !== null}>
        {[0, 1].map(column => (
          <div key={column} className="restaurant-photo-column">
            {photos.map((photo, index) => index % 2 === column ? (
              <button
                key={`${photo}-${index}`}
                type="button"
                onClick={event => openPhoto(index, event.currentTarget)}
                aria-label={t('listingDetail.openPhoto', { index: index + 1, total: photos.length })}
                className={`restaurant-mosaic-button ${index % 3 === 2 ? 'is-square' : ''}`}
              >
                <ShimmerImage
                  src={photo}
                  alt=""
                  loading={index < 4 ? 'eager' : 'lazy'}
                  className="restaurant-mosaic-image"
                />
              </button>
            ) : null)}
          </div>
        ))}
      </div>
      {selected !== null ? (
        <div className="restaurant-photo-viewer">
          <div
            ref={viewer}
            tabIndex={0}
            role="region"
            aria-label={t('listingDetail.showAllPhotos')}
            className="restaurant-photo-viewer-strip"
            onScroll={event => {
              const { scrollLeft, clientWidth } = event.currentTarget;
              if (clientWidth) setActive(Math.max(0, Math.min(photos.length - 1, Math.round(scrollLeft / clientWidth))));
            }}
            onKeyDown={event => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                move(event.key === 'ArrowLeft' ? -1 : 1);
              }
            }}
          >
            {photos.map((photo, index) => (
              <div key={`${photo}-${index}`} className="restaurant-photo-slide">
                <ShimmerImage src={photo} alt={t('photoStep.photoAlt', { number: index + 1 })} loading={Math.abs(index - active) <= 1 ? 'eager' : 'lazy'} className="restaurant-viewer-image" />
              </div>
            ))}
          </div>
          <div className="restaurant-viewer-navigation">
            <IconButton variant="muted" label={t('restaurantDetail.previous')} disabled={active === 0} icon={<ChevronLeft />} onClick={() => { viewer.current?.focus({ preventScroll: true }); move(-1); }} />
            <IconButton variant="muted" label={t('restaurantDetail.next')} disabled={active === photos.length - 1} icon={<ChevronRight />} onClick={() => { viewer.current?.focus({ preventScroll: true }); move(1); }} />
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
