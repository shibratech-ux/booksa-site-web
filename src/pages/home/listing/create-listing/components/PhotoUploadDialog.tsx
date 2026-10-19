import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DotsLoader } from '@/components/common/DotsLoader';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import photoCameraImage from '@/assets/images/photo_camera.png';

const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;
const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-button bg-[var(--color-text-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-surface)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)]';

export function PhotoUploadDialog({ open, onClose, onUpload }: {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[], onProgress: (completed: number, total: number) => void) => Promise<void>;
}) {
  const { t } = useTranslation('booking');
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadGuard = useRef(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });
  const previews = useMemo(() => pendingFiles.map(file => ({ file, key: getFileKey(file), url: URL.createObjectURL(file) })), [pendingFiles]);

  useEffect(() => () => { previews.forEach(({ url }) => URL.revokeObjectURL(url)); }, [previews]);
  useEffect(() => {
    if (!open) {
      setPendingFiles([]);
      setIsDragging(false);
      setUploadError(null);
      setUploadProgress({ completed: 0, total: 0 });
      setIsUploadComplete(false);
    }
  }, [open]);

  const closeDialog = () => {
    if (!uploadGuard.current) onClose();
  };
  const addPendingFiles = (incoming: File[]) => {
    if (uploadGuard.current || isUploadComplete) return;
    const images = incoming.filter(file => file.type.startsWith('image/'));
    setUploadError(images.length !== incoming.length ? t('photoStep.dialog.imageOnly') : null);
    setPendingFiles(current => {
      const keys = new Set(current.map(getFileKey));
      return [...current, ...images.filter(file => {
        const key = getFileKey(file);
        if (keys.has(key)) return false;
        keys.add(key);
        return true;
      })];
    });
  };
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addPendingFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addPendingFiles(Array.from(event.dataTransfer.files));
  };
  const handleUpload = async () => {
    if (!pendingFiles.length || uploadGuard.current || isUploadComplete) return;
    uploadGuard.current = true;
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({ completed: 0, total: pendingFiles.length });
    try {
      await onUpload(pendingFiles, (completed, total) => setUploadProgress({ completed, total }));
      setIsUploadComplete(true);
    } catch {
      setUploadError(t('photoStep.dialog.uploadError'));
    } finally {
      uploadGuard.current = false;
      setIsUploading(false);
    }
  };
  const progress = uploadProgress.total ? Math.min(100, 100 * uploadProgress.completed / uploadProgress.total) : 0;

  return (
    <Modal
      open={open}
      title={t('photoStep.dialog.title')}
      onClose={closeDialog}
      variant="sheet"
      sheetSize="compact"
      dismissDisabled={isUploading}
      subtitle={<p role="status" aria-live="polite" aria-atomic="true">{isUploadComplete ? t('photoStep.dialog.complete', { count: pendingFiles.length }) : isUploading ? t('photoStep.dialog.progress', uploadProgress) : t('photoStep.dialog.selected', { count: pendingFiles.length })}</p>}
      headerAction={<IconButton variant="plain" disabled={isUploading || isUploadComplete} label={t('photoStep.addMore')} onClick={() => inputRef.current?.click()} icon={<Plus className="h-5 w-5" aria-hidden="true" />} />}
      footer={
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={closeDialog} disabled={isUploading} className="min-h-11 px-2 text-sm font-semibold text-[var(--color-text-primary)] disabled:opacity-50">{t('photoStep.dialog.done')}</button>
          <button type="button" disabled={!pendingFiles.length || isUploading || isUploadComplete} onClick={() => void handleUpload()} className={actionClass}>
            {isUploading ? <DotsLoader className="w-8" label={t('photoStep.dialog.uploading')} /> : isUploadComplete ? <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> : null}
            {t(isUploading ? 'photoStep.dialog.uploading' : isUploadComplete ? 'photoStep.dialog.uploaded' : 'photoStep.dialog.upload')}
          </button>
        </div>
      }
    >
      <div className="flex min-h-full flex-col" aria-busy={isUploading || undefined}>
        <input ref={inputRef} type="file" accept="image/*" multiple disabled={isUploading || isUploadComplete} onChange={handleInputChange} aria-label={t('photoStep.dialog.browse')} className="hidden" />
        <div
          onDragEnter={event => { event.preventDefault(); if (!isUploading && !isUploadComplete) setIsDragging(true); }}
          onDragOver={event => event.preventDefault()}
          onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false); }}
          onDrop={handleDrop}
          className={`flex flex-1 flex-col rounded-button transition-colors ${isDragging ? 'bg-[var(--color-surface-muted)] ring-2 ring-[var(--color-text-primary)]' : ''}`}
        >
          {pendingFiles.length === 0 ? (
            <div className="flex min-h-48 flex-1 flex-col items-center justify-center gap-5 rounded-button border border-dashed border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-5 py-8 text-center">
              <ShimmerImage src={photoCameraImage} alt="" className="h-24 w-24 object-contain" />
              <button type="button" onClick={() => inputRef.current?.click()} className={actionClass}>{t('photoStep.dialog.browseButton')}</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previews.map(({ file, key, url }, index) => {
                const uploaded = isUploadComplete || (isUploading && uploadProgress.completed > index);
                return (
                  <figure key={key} className="min-w-0">
                    <div className="relative aspect-square overflow-hidden rounded-photo bg-[var(--color-surface-muted)]">
                      <ShimmerImage src={url} alt={t('photoStep.photoAlt', { number: index + 1 })} className="h-full w-full object-cover" />
                      {isUploading && !uploaded ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-overlay)]"><span className="rounded-button bg-[var(--color-surface)] px-3 py-2 text-[var(--color-text-primary)]"><DotsLoader className="w-12" label={t('photoStep.dialog.uploading')} /></span></div>
                      ) : null}
                      {uploaded ? <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-primary)]"><Check className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /><span className="sr-only">{t('photoStep.dialog.uploaded')}</span></span> : null}
                      <div className="absolute right-1 top-1"><IconButton size="sm" variant="muted" disabled={isUploading || isUploadComplete} label={t('photoStep.remove', { number: index + 1 })} onClick={() => setPendingFiles(current => current.filter(candidate => getFileKey(candidate) !== key))} icon={<Trash2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />} /></div>
                    </div>
                    <figcaption className="truncate pt-2 text-xs text-[var(--color-text-secondary)]">{file.name}</figcaption>
                  </figure>
                );
              })}
            </div>
          )}
        </div>
        {isUploading ? (
          <div className="mt-5">
            <div className="h-1 overflow-hidden rounded-full bg-[var(--color-surface-muted)]" role="progressbar" aria-label={t('photoStep.dialog.uploading')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
              <div className="h-full bg-[var(--color-text-primary)] transition-[width] motion-reduce:transition-none" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{t('photoStep.dialog.keepOpen')}</p>
          </div>
        ) : null}
        {uploadError ? <p className="mt-4 text-sm text-[var(--color-danger)]" role="alert">{uploadError}</p> : null}
      </div>
    </Modal>
  );
}
