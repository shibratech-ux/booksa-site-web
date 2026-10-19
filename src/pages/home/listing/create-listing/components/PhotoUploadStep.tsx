import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Ellipsis, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import photoCameraImage from '@/assets/images/photo_camera.png';
import { PhotoUploadDialog } from './PhotoUploadDialog';
import { uploadListingPhotos, type UploadedListingPhotoMap } from '@/services/listing-photo.service';
import { getCurrentUserListing, updateCurrentUserDraft } from '@/services/listing-draft.service';

export const MINIMUM_PHOTOS = 5;

export function ListingPhotoGrid({ photos, cover, busy, onCover, onRemove, onAdd }: {
  photos: UploadedListingPhotoMap;
  cover: string;
  busy: boolean;
  onCover: (url: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  const { t } = useTranslation('booking');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const ordered = Object.values(photos).sort((a, b) => a.order - b.order);
  const featured = ordered.find(photo => photo.url === cover) ?? ordered[0];
  if (!featured) return null;
  const gallery = [featured, ...ordered.filter(photo => photo.id !== featured.id)];

  const selected = gallery.find(photo => photo.id === selectedId);
  const selectedNumber = gallery.findIndex(photo => photo.id === selectedId) + 1;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5" aria-label={t('photoStep.gallery')}>
        {gallery.map((photo, index) => {
          const isCover = photo.id === featured.id;
          return (
            <figure key={photo.id} className={`min-w-0 ${index === 0 ? 'sm:col-span-2' : ''}`}>
              <div className={`relative overflow-hidden rounded-photo bg-[var(--color-surface-muted)] ${index === 0 ? 'aspect-[3/2] sm:aspect-[16/10]' : 'aspect-[3/2]'}`}>
                <ShimmerImage src={photo.url} alt={t('photoStep.photoAlt', { number: index + 1 })} className="h-full w-full object-cover" />
                {isCover ? (
                  <span className="absolute left-3 top-3 inline-flex min-h-8 items-center rounded-button bg-[var(--color-surface)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)] sm:text-sm">
                    {t('photoStep.cover')}
                  </span>
                ) : null}
                <IconButton
                  variant="outlined"
                  className="absolute right-2 top-2"
                  label={t('photoStep.actions', { number: index + 1 })}
                  disabled={busy}
                  aria-haspopup="dialog"
                  onClick={() => setSelectedId(photo.id)}
                  icon={<Ellipsis className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />}
                />
              </div>
              {isCover ? <figcaption className="pt-2 text-xs leading-relaxed text-[var(--color-text-secondary)] sm:text-sm">{t('photoStep.coverHint')}</figcaption> : null}
            </figure>
          );
        })}
        <button type="button" disabled={busy} onClick={onAdd} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-photo border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50 sm:aspect-[3/2]">
          <Plus className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
          {t('photoStep.addMore')}
        </button>
      </div>
      <Modal open={Boolean(selected)} title={t('photoStep.actions', { number: selectedNumber })} variant="sheet" onClose={() => { if (!busy) setSelectedId(null); }}>
        {selected ? (
          <div className="space-y-3">
            <div className="mx-auto aspect-[3/2] w-full max-w-sm overflow-hidden rounded-photo bg-[var(--color-surface-muted)]">
              <ShimmerImage src={selected.url} alt={t('photoStep.photoAlt', { number: selectedNumber })} className="h-full w-full object-cover" />
            </div>
            {selected.id !== featured.id ? (
              <button type="button" disabled={busy} onClick={() => { onCover(selected.url); setSelectedId(null); }} className="flex min-h-11 w-full items-center gap-3 rounded-button px-4 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50">
                <Check className="h-5 w-5" aria-hidden="true" />{t('photoStep.makeCover')}
              </button>
            ) : null}
            <button type="button" disabled={busy} onClick={() => { onRemove(selected.id); setSelectedId(null); }} className="flex min-h-11 w-full items-center gap-3 rounded-button px-4 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50">
              <Trash2 className="h-5 w-5" aria-hidden="true" />{t('photoStep.remove', { number: selectedNumber })}
            </button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export function PhotoUploadStep({ listingId, onPhotoCount, onPendingChange }: {
  listingTypeLabel: string; listingId?: string; files: File[]; onChange: (files: File[]) => void;
  onPhotoCount: (count: number) => void; onPendingChange: (pending: boolean) => void;
}) {
  const { t } = useTranslation('booking');
  const reduceMotion = useReducedMotion();
  const [photos, setPhotos] = useState<UploadedListingPhotoMap>({});
  const [cover, setCover] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoadState('loading');
    onPendingChange(true);
    onPhotoCount(0);
    if (!listingId) {
      setLoadState('error');
      onPendingChange(false);
      return;
    }
    void getCurrentUserListing(listingId).then(data => {
      if (!active) return;
      const stored = (data.listingPhotos ?? {}) as UploadedListingPhotoMap;
      setPhotos(stored);
      setCover(typeof data.coverImageUrl === 'string' ? data.coverImageUrl : '');
      onPhotoCount(Object.keys(stored).length);
      setLoadState('ready');
    }).catch(() => {
      if (active) setLoadState('error');
    }).finally(() => {
      if (active) onPendingChange(false);
    });
    return () => { active = false; onPendingChange(false); };
  }, [listingId, onPhotoCount, onPendingChange, reload]);

  const save = async (next: UploadedListingPhotoMap, nextCover: string, cleanup: string[] = []) => {
    if (!listingId || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    onPendingChange(true);
    try {
      await updateCurrentUserDraft(listingId, { listingPhotos: next, coverImageUrl: nextCover, photoCleanupPaths: cleanup });
      setPhotos(next);
      setCover(nextCover);
      onPhotoCount(Object.keys(next).length);
    } catch {
      toast.error(t('photoStep.saveError'));
    } finally {
      busyRef.current = false;
      setBusy(false);
      onPendingChange(false);
    }
  };
  const count = Object.keys(photos).length;
  const remaining = Math.max(0, MINIMUM_PHOTOS - count);

  return (
    <motion.section
      initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-5 sm:px-10 sm:pb-12 sm:pt-8"
      aria-labelledby="photo-step-title"
    >
      <div className="mx-auto w-full max-w-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 id="photo-step-title" className={`font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] ${count > 0 ? 'text-lg sm:text-3xl' : 'text-2xl sm:text-4xl'}`}>{t(count > 0 ? 'photoStep.reviewTitle' : 'photoStep.title')}</h1>
            <p className="mt-2 text-sm leading-snug text-[var(--color-text-secondary)] sm:text-base">{t(count > 0 ? 'photoStep.reviewSubtitle' : 'photoStep.subtitle', { minimum: MINIMUM_PHOTOS })}</p>
          </div>
          {count > 0 ? <IconButton variant="muted" label={t('photoStep.addMore')} disabled={busy || loadState !== 'ready'} onClick={() => setOpen(true)} icon={<Plus className="h-5 w-5" aria-hidden="true" />} /> : null}
        </div>

        {loadState === 'loading' ? <LoadingScreen fullScreen={false} label={t('photoStep.loading')} /> : loadState === 'error' ? (
          <div className="mt-8"><ErrorState description={t('photoStep.loadError')} onRetry={() => setReload(value => value + 1)} /></div>
        ) : (
          <>
            {count > 0 ? (
              <div className="mb-5 mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] sm:text-sm" role="status" aria-live="polite" aria-atomic="true">
                <p className="flex items-center gap-2 font-medium text-[var(--color-text-primary)]">
                  {remaining === 0 ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                  {t('photoStep.uploaded', { count })}
                </p>
                <p>{busy ? t('photoStep.saving') : remaining ? t('photoStep.remaining', { count: remaining }) : t('photoStep.reviewReady')}</p>
              </div>
            ) : null}
            {count === 0 ? (
              <div className="relative mt-10 flex aspect-square w-full flex-col items-center justify-center rounded-card border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 sm:mt-12">
                <ShimmerImage src={photoCameraImage} alt="" className="h-36 w-36 object-contain sm:h-44 sm:w-44" />
                <button ref={uploadButtonRef} type="button" className="absolute bottom-8 inline-flex min-h-11 items-center justify-center rounded-button bg-[var(--color-background)] px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-border)] disabled:cursor-not-allowed disabled:opacity-50 sm:bottom-10" disabled={busy} onClick={() => setOpen(true)}>{t('photoStep.add')}</button>
              </div>
            ) : (
              <ListingPhotoGrid photos={photos} cover={cover} busy={busy} onAdd={() => setOpen(true)} onCover={url => void save(photos, url)} onRemove={id => {
                const photo = photos[id];
                if (!photo) return;
                const next = { ...photos };
                delete next[id];
                const first = Object.values(next).sort((a, b) => a.order - b.order)[0];
                void save(next, cover === photo.url ? first?.url ?? '' : cover, [photo.storagePath]);
              }} />
            )}
            {count > 0 ? <p className="mt-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('photoStep.tip')}</p> : null}
          </>
        )}
        <PhotoUploadDialog open={open} onClose={() => {
          setOpen(false);
          window.requestAnimationFrame(() => uploadButtonRef.current?.focus());
        }} onUpload={async (files, progress) => {
          if (!listingId || busyRef.current) throw new Error(t('photoStep.saveError'));
          busyRef.current = true;
          setBusy(true);
          onPendingChange(true);
          try {
            const uploaded = await uploadListingPhotos(files, progress, listingId);
            const next = { ...photos, ...uploaded };
            setPhotos(next);
            setCover(cover || Object.values(uploaded)[0]?.url || '');
            onPhotoCount(Object.keys(next).length);
          } finally {
            busyRef.current = false;
            setBusy(false);
            onPendingChange(false);
          }
        }} />
      </div>
    </motion.section>
  );
}
