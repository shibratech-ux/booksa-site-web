import { useMemo } from 'react';
import { Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { getOwnListingImageUrls, type ListingPhotoSource } from '@/domain/listing-photos';

/** Cover in front plus the next two photos peeking out behind it. */
export const PHOTO_TOUR_PREVIEW_COUNT = 3;

const SIDE_PHOTO_POSITIONS = ['left-0', 'right-0'] as const;

/**
 * Fanned photo preview used by the editor's Photo tour card: a square cover with the
 * listing's next two photos tucked behind it on each side, and a photo-count badge.
 */
export function PhotoTourStack({ listing, className = '' }: { listing: ListingPhotoSource & { ownerUid?: unknown }; className?: string }) {
  const { t } = useTranslation('dashboard');
  const photoUrls = useMemo(() => getOwnListingImageUrls(listing), [listing]);
  const [coverUrl, ...sideUrls] = photoUrls.slice(0, PHOTO_TOUR_PREVIEW_COUNT);
  const photoCount = photoUrls.length;

  return (
    <span className={`relative block ${className}`}>
      {sideUrls.map((photoUrl, index) => (
        <ShimmerImage
          key={photoUrl}
          src={photoUrl}
          alt=""
          className={`absolute ${SIDE_PHOTO_POSITIONS[index]} top-[56%] h-[80%] w-[48%] -translate-y-1/2 rounded-[calc(var(--radius-photo)*0.85)] object-cover`}
        />
      ))}
      <span className="relative z-10 mx-auto block aspect-square w-[91.2%] overflow-hidden rounded-[calc(var(--radius-xl)*0.85)] bg-[var(--color-surface-muted)] shadow-[var(--shadow-md)]">
        {coverUrl ? (
          <ShimmerImage src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center">
            <Image className="h-8 w-8 text-[var(--color-text-secondary)]" aria-hidden="true" />
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[var(--color-surface)] px-3.5 py-2 text-[0.6228495rem] font-medium text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]">
          {t('photoTourBadge.photos', { count: photoCount })}
        </span>
      </span>
    </span>
  );
}
