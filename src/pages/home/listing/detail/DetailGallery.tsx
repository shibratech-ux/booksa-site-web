import { useState, type ReactNode } from 'react';
import { ArrowLeft, Grid3x3, Heart, Share } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

const overlayButton = 'inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] transition active:scale-95';

export function GalleryActions({ saved, onBack, onShare, onToggleSave, className = '' }: {
  saved: boolean;
  onBack?: () => void;
  onShare: () => void;
  onToggleSave: () => void;
  className?: string;
}) {
  const { t } = useTranslation('booking');
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {onBack ? (
        <button type="button" onClick={onBack} aria-label={t('listingDetail.back')} className={overlayButton}>
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      ) : <span />}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onShare} aria-label={t('listingDetail.share')} className={overlayButton}>
          <Share className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
        <button type="button" onClick={onToggleSave} aria-label={t(saved ? 'listingDetail.unsave' : 'listingDetail.save')} aria-pressed={saved} className={overlayButton}>
          <Heart className={`h-4 w-4 ${saved ? 'text-[var(--color-primary-500)]' : ''}`} fill={saved ? 'currentColor' : 'none'} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** Full-bleed swipeable hero shown below `md`. */
export function MobileGallery({ photos, title, onOpen, actions }: {
  photos: string[];
  title: string;
  onOpen: (index: number) => void;
  actions: ReactNode;
}) {
  const { t } = useTranslation('booking');
  const [active, setActive] = useState(0);

  return (
    <div className="relative md:hidden">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={event => {
          const { scrollLeft, clientWidth } = event.currentTarget;
          setActive(Math.min(photos.length - 1, Math.max(0, Math.round(scrollLeft / clientWidth))));
        }}
      >
        {photos.map((photo, index) => (
          <button
            key={`${photo}-${index}`}
            type="button"
            onClick={() => onOpen(index)}
            aria-label={t('listingDetail.openPhoto', { index: index + 1, total: photos.length })}
            className="block w-full shrink-0 snap-center"
          >
            <ShimmerImage src={photo} alt={index === 0 ? title : ''} className="aspect-[4/3.6] w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="absolute inset-x-4 top-[max(16px,env(safe-area-inset-top))]">{actions}</div>
      <span aria-hidden="true" className="absolute bottom-10 right-4 rounded-[6px] bg-[var(--color-overlay)] px-2.5 py-1 text-xs font-semibold text-white">
        {t('listingDetail.photoCounter', { current: active + 1, total: photos.length })}
      </span>
    </div>
  );
}

/** Rounded five-photo mosaic shown from `md`. */
export function DesktopGallery({ photos, title, onOpen }: { photos: string[]; title: string; onOpen: (index: number) => void }) {
  const { t } = useTranslation('booking');
  const tiles = photos.slice(0, 5);

  return (
    <div className="relative hidden h-[clamp(320px,42vw,460px)] gap-2 overflow-hidden rounded-card md:grid md:grid-cols-4 md:grid-rows-2">
      {tiles.map((photo, index) => (
        <button
          key={`${photo}-${index}`}
          type="button"
          onClick={() => onOpen(index)}
          aria-label={t('listingDetail.openPhoto', { index: index + 1, total: photos.length })}
          className={`group relative overflow-hidden ${index === 0 ? 'col-span-2 row-span-2' : ''} ${tiles.length === 1 ? 'col-span-4' : ''}`}
        >
          <ShimmerImage src={photo} alt={index === 0 ? title : ''} className="h-full w-full object-cover transition duration-300 group-hover:brightness-90" />
        </button>
      ))}
      {photos.length > 1 ? (
        <button
          type="button"
          onClick={() => onOpen(0)}
          className="absolute bottom-4 right-4 inline-flex min-h-11 items-center gap-2 rounded-button border border-[var(--color-text-primary)] bg-[var(--color-surface)] px-4 text-sm font-semibold"
        >
          <Grid3x3 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {t('listingDetail.showAllPhotos')}
        </button>
      ) : null}
    </div>
  );
}
