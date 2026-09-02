import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Images, LoaderCircle, Plus, Trash2, X } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

export function PhotoUploadDialog({
  open,
  onClose,
  onUpload
}: {
  open: boolean;
  onClose: () => void;
  onUpload: (
    files: File[],
    onProgress: (completed: number, total: number) => void
  ) => Promise<void>;
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null);
  const previews = useMemo(
    () => pendingFiles.map((file) => ({ file, key: getFileKey(file), url: URL.createObjectURL(file) })),
    [pendingFiles]
  );

  useEffect(
    () => () => {
      previews.forEach(({ url }) => URL.revokeObjectURL(url));
    },
    [previews]
  );

  useEffect(() => {
    if (!open) {
      setPendingFiles([]);
      setIsDragging(false);
      setUploadError(null);
      setUploadProgress(null);
      setIsUploadComplete(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isUploading) onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUploading, open, onClose]);

  const closeDialog = () => {
    if (isUploading) return;
    setPendingFiles([]);
    setIsDragging(false);
    setUploadError(null);
    setUploadProgress(null);
    setIsUploadComplete(false);
    onClose();
  };

  const addPendingFiles = (incomingFiles: File[]) => {
    const imageFiles = incomingFiles.filter((file) => file.type.startsWith('image/'));
    setPendingFiles((current) => {
      const currentKeys = new Set(current.map(getFileKey));
      return [...current, ...imageFiles.filter((file) => !currentKeys.has(getFileKey(file)))];
    });
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0 || isUploading || isUploadComplete) return;

    setIsUploading(true);
    setIsUploadComplete(false);
    setUploadError(null);
    setUploadProgress({ completed: 0, total: pendingFiles.length });

    try {
      await onUpload(pendingFiles, (completed, total) => setUploadProgress({ completed, total }));
      setIsUploadComplete(true);
    } catch (error) {
      setUploadProgress(null);
      setUploadError(error instanceof Error ? error.message : 'The photos could not be uploaded.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isUploading || isUploadComplete) return;
    addPendingFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isUploading || isUploadComplete) return;
    setIsDragging(false);
    addPendingFiles(Array.from(event.dataTransfer.files));
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeDialog();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={handleBackdropClick}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:px-4 sm:py-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`flex w-full max-w-[624.8px] flex-col overflow-hidden rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.3)] sm:rounded-lg ${
              pendingFiles.length > 0
                ? 'h-[min(664px,92dvh)]'
                : 'max-h-[92dvh]'
            }`}
          >
            <header
              className={`grid shrink-0 grid-cols-[44px_1fr_44px] items-center px-5 sm:px-6 ${
                pendingFiles.length > 0 ? 'min-h-16' : 'min-h-[96.8px]'
              }`}
            >
              <button
                type="button"
                onClick={closeDialog}
                disabled={isUploading}
                aria-label="Close photo upload"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-[var(--color-surface-muted)]"
              >
                <X className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
              </button>
              <div className="min-w-0 text-center">
                <h2 id={titleId} className="text-base font-semibold">
                  Upload photos
                </h2>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]" aria-live="polite">
                  {isUploading
                    ? `${uploadProgress?.completed ?? 0} of ${
                        uploadProgress?.total ?? pendingFiles.length
                      } items uploaded`
                    : isUploadComplete
                      ? `${pendingFiles.length} of ${pendingFiles.length} items uploaded`
                      : pendingFiles.length === 0
                        ? 'No items selected'
                        : `${pendingFiles.length} ${
                            pendingFiles.length === 1 ? 'item' : 'items'
                          } selected`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading || isUploadComplete}
                aria-label="Browse for more photos"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md transition hover:bg-[var(--color-surface-muted)]"
              >
                <Plus className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
              </button>
            </header>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={isUploading || isUploadComplete}
              onChange={handleInputChange}
              className="sr-only"
            />

            <div
              className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6 ${
                pendingFiles.length > 0 ? 'pt-6' : ''
              }`}
            >
              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragging(false);
                }}
                onDrop={handleDrop}
                className={`rounded-sm text-center transition ${
                  pendingFiles.length > 0
                    ? 'block min-h-0 border-0 p-0'
                    : `flex min-h-[299.2px] flex-col items-center justify-center border-2 p-5 sm:min-h-[299.2px] ${
                        isDragging
                          ? 'border-[var(--color-text-primary)] bg-[var(--color-surface-muted)]'
                          : 'border-dashed border-[var(--color-text-secondary)]'
                      }`
                }`}
              >
                {pendingFiles.length === 0 ? (
                  <>
                    <Images className="h-14 w-14" strokeWidth={1.45} aria-hidden="true" />
                    <h3 className="mt-4 text-xl font-semibold">Drag and drop</h3>
                    <p className="mt-4 text-sm">or browse for photos</p>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      disabled={isUploading || isUploadComplete}
                      className="mt-5 inline-flex h-12 min-w-[123.2px] items-center justify-center rounded-md bg-[var(--color-text-primary)] px-6 text-base font-semibold text-[var(--color-surface)] transition hover:opacity-90"
                    >
                      Browse
                    </button>
                  </>
                ) : (
                  <div className="grid w-full grid-cols-2 gap-4">
                    {previews.map(({ file, key, url }, index) => {
                      const isFileUploaded =
                        isUploadComplete || (uploadProgress?.completed ?? 0) > index;

                      return (
                        <figure
                          key={key}
                          className={`group flex min-w-0 flex-col overflow-hidden rounded-sm border bg-[var(--color-surface-muted)] transition ${
                            isFileUploaded
                              ? 'border-[var(--color-success)]'
                              : 'border-transparent'
                          }`}
                        >
                          <div className="relative grid aspect-square w-full overflow-hidden">
                            <ShimmerImage
                              src={url}
                              alt={file.name}
                              className={`h-full w-full object-cover transition [grid-area:1/1] ${
                                isUploading && !isFileUploaded ? 'brightness-50' : 'brightness-100'
                              }`}
                            />
                            {isUploading && !isFileUploaded ? (
                              <span
                                className="flex items-center justify-center bg-black/20 text-white [grid-area:1/1]"
                                aria-label={`${file.name} uploading`}
                              >
                                <LoaderCircle
                                  className="h-9 w-9 animate-spin"
                                  strokeWidth={2.2}
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                            <button
                              type="button"
                              onClick={() =>
                                setPendingFiles((current) =>
                                  current.filter((candidate) => getFileKey(candidate) !== key)
                                )
                              }
                              disabled={isUploading || isUploadComplete}
                              aria-label={`Remove ${file.name}`}
                              className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md bg-black/75 text-white shadow-[var(--shadow-sm)] transition hover:bg-black disabled:opacity-70"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                            {isFileUploaded ? (
                              <span
                                className="absolute bottom-2 left-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-sm bg-[var(--color-success)] text-white shadow-[var(--shadow-sm)]"
                                aria-label={`${file.name} uploaded`}
                              >
                                <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                              </span>
                            ) : null}
                          </div>
                        </figure>
                      );
                    })}
                  </div>
                )}
              </div>
              {uploadError ? (
                <p className="mt-3 text-sm font-medium text-[var(--color-danger)]" role="alert">
                  {uploadError}
                </p>
              ) : null}
            </div>

            <footer className="flex min-h-[88px] shrink-0 items-center justify-between border-t border-[var(--color-border)] px-6">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isUploading}
                className="px-3 py-3 text-base font-semibold underline-offset-4 hover:underline"
              >
                {pendingFiles.length > 0 && !isUploadComplete ? 'Cancel' : 'Done'}
              </button>
              <button
                type="button"
                disabled={pendingFiles.length === 0 || isUploading || isUploadComplete}
                onClick={() => void handleUpload()}
                className={`inline-flex h-12 min-w-[123.2px] items-center justify-center gap-2 rounded-md px-6 text-base font-semibold transition hover:opacity-90 disabled:cursor-not-allowed ${
                  pendingFiles.length === 0
                    ? 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] opacity-60'
                    : 'bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                }`}
              >
                {isUploading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>
                      Uploading {uploadProgress?.completed ?? 0}/
                      {uploadProgress?.total ?? pendingFiles.length}
                    </span>
                  </>
                ) : isUploadComplete ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>Uploaded</span>
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
