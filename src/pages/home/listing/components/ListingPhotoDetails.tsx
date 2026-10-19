import { useEffect, useId, useRef } from 'react';
import { Check, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { IconButton } from '@/components/ui/IconButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

const DESCRIPTION_LIMIT = 250;

export function ListingPhotoDetails({ photoUrl, description, room, isCover, busy, hasPendingChanges, onClose, onMakeCover, onRemove, onMove, onDescriptionChange }: {
  photoUrl: string;
  description: string;
  room: string;
  isCover: boolean;
  busy: boolean;
  hasPendingChanges: boolean;
  onClose: () => void;
  onMakeCover: () => void;
  onRemove: () => void;
  onMove: () => void;
  onDescriptionChange: (description: string) => void;
}) {
  const { t } = useTranslation('dashboard');
  const descriptionId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const roomLabel = room === 'Unassigned' ? t('photoDetails.unassigned') : room;

  useEffect(() => { headingRef.current?.focus(); }, []);

  return (
    <section aria-labelledby={`${descriptionId}-heading`} className="mx-auto w-full max-w-4xl">
      <h1 ref={headingRef} tabIndex={-1} id={`${descriptionId}-heading`} className="sr-only">{t('photoDetails.heading')}</h1>
      <header className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2">
        <IconButton variant="muted" label={t('photoDetails.close')} disabled={busy} onClick={onClose} icon={<X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />} />
        <button
          type="button"
          onClick={onMakeCover}
          disabled={busy || isCover}
          className="inline-flex min-h-11 min-w-0 max-w-full items-center justify-self-end gap-2 rounded-full bg-[var(--color-surface-muted)] px-4 text-xs font-semibold disabled:cursor-default disabled:opacity-60"
        >
          {isCover ? <Check className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" /> : null}
          <span className="truncate">{t(isCover ? 'photoDetails.cover' : 'photoDetails.makeCover')}</span>
        </button>
        <IconButton variant="muted" label={t('photoDetails.remove')} disabled={busy || hasPendingChanges} onClick={onRemove} icon={<Trash2 className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />} />
      </header>

      <div className="mt-10 grid items-start gap-5 md:grid-cols-2 md:gap-8">
        <div className="relative aspect-[3/4] overflow-hidden rounded-photo bg-[var(--color-surface-muted)]">
          <ShimmerImage src={photoUrl} alt={description || t('photoDetails.imageAlt')} className="h-full w-full object-cover" />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.focus()}
            className="absolute bottom-2 right-2 inline-flex min-h-11 max-w-[calc(100%-1rem)] items-center gap-2 rounded-full bg-[var(--color-text-primary)] px-3 text-xs font-medium text-[var(--color-surface)] disabled:opacity-60"
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            {t(description ? 'photoDetails.editDescription' : 'photoDetails.addDescription')}
          </button>
        </div>

        <div>
          <button type="button" onClick={onMove} disabled={busy || hasPendingChanges} className="flex min-h-11 w-full items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3 text-left text-sm disabled:opacity-50">
            <span><Trans t={t} i18nKey="photoDetails.moveFrom" values={{ room: roomLabel }} components={{ strong: <strong className="font-semibold" /> }} /></span>
            <ChevronRight className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <label htmlFor={descriptionId} className="sr-only">{t('photoDetails.descriptionLabel')}</label>
          <textarea
            ref={inputRef}
            id={descriptionId}
            rows={2}
            value={description}
            maxLength={DESCRIPTION_LIMIT}
            disabled={busy}
            onChange={event => onDescriptionChange(event.target.value)}
            aria-describedby={`${descriptionId}-count${hasPendingChanges ? ` ${descriptionId}-pending` : ''}`}
            placeholder={t('photoDetails.placeholder')}
            className="mt-1 block min-h-16 w-full resize-y rounded-field border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm leading-5 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-text-primary)] disabled:opacity-60"
          />
          <p id={`${descriptionId}-count`} className="mt-2 text-xs text-[var(--color-text-secondary)]">{t('photoDetails.remaining', { count: Math.max(0, DESCRIPTION_LIMIT - description.length) })}</p>
          {hasPendingChanges ? <p id={`${descriptionId}-pending`} className="mt-3 text-xs leading-5 text-[var(--color-text-secondary)]">{t('photoDetails.pending')}</p> : null}
        </div>
      </div>
    </section>
  );
}
