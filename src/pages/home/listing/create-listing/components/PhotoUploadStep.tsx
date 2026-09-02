import { useEffect, useMemo, useState } from 'react';
import { Camera, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { PhotoUploadDialog } from './PhotoUploadDialog';
import { uploadListingPhotos } from '@/services/listing-photo.service';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

const MINIMUM_PHOTOS = 5;

const getFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

export function PhotoUploadStep({
  listingTypeLabel,
  listingId,
  files,
  onChange
}: {
  listingTypeLabel: string;
  listingId?: string;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const previews = useMemo(
    () => files.map((file) => ({ file, key: getFileKey(file), url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(
    () => () => {
      previews.forEach(({ url }) => URL.revokeObjectURL(url));
    },
    [previews]
  );

  const addFiles = (incomingFiles: File[]) => {
    const imageFiles = incomingFiles.filter((file) => file.type.startsWith('image/'));
    const currentKeys = new Set(files.map(getFileKey));
    const uniqueFiles = imageFiles.filter((file) => !currentKeys.has(getFileKey(file)));
    if (uniqueFiles.length > 0) onChange([...files, ...uniqueFiles]);
  };

  const remainingPhotos = Math.max(0, MINIMUM_PHOTOS - files.length);
  const listingType = listingTypeLabel.toLocaleLowerCase();

  return (
    <motion.section
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5 sm:px-10 sm:pb-12"
      aria-labelledby="photo-upload-title"
    >
      <div className="mx-auto w-full max-w-[704px]">
        <h1
          id="photo-upload-title"
          className="text-[32.928px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl"
        >
          Add some photos of your {listingType}
        </h1>
        <p className="mt-2 text-base leading-relaxed text-[var(--color-text-secondary)] sm:text-lg">
          You&apos;ll need 5 photos to get started. You can add more or make changes later.
        </p>

        {files.length === 0 ? (
          <div className="mt-7 flex min-h-[308px] items-center justify-center rounded-sm border border-dashed border-[var(--color-text-secondary)] bg-[var(--color-surface-muted)]/35 sm:mt-12 sm:min-h-[473px]">
            <div className="flex flex-col items-center px-6 text-center">
              <span className="inline-flex h-24 w-24 items-center justify-center rounded-sm bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
                <Camera className="h-12 w-12" strokeWidth={1.45} aria-hidden="true" />
              </span>
              <button
                type="button"
                onClick={() => setIsUploadDialogOpen(true)}
                className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[var(--color-surface)] px-5 text-sm font-semibold shadow-[var(--shadow-xs)] transition hover:bg-[var(--color-surface-muted)]"
              >
                Add photos
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10 rounded-sm p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previews.map(({ file, key, url }, index) => (
                <figure
                  key={key}
                  className={`group flex flex-col overflow-hidden rounded-sm border border-[var(--color-border)] bg-[var(--color-surface-muted)] ${
                    index === 0 ? 'col-span-2 row-span-2 sm:col-span-2' : ''
                  }`}
                >
                  <ShimmerImage
                    src={url}
                    alt={`Listing photo ${index + 1}: ${file.name}`}
                    className="aspect-square w-full object-cover"
                  />
                  <figcaption className="flex min-h-11 items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3">
                    <span className="min-w-0 truncate text-xs font-semibold">
                      {index === 0 ? 'Cover photo' : file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChange(files.filter((candidate) => getFileKey(candidate) !== key))}
                      aria-label={`Remove ${file.name}`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition hover:bg-[var(--color-surface-muted)]"
                    >
                      <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </figcaption>
                </figure>
              ))}

              <button
                type="button"
                onClick={() => setIsUploadDialogOpen(true)}
                className="flex aspect-square flex-col items-center justify-center rounded-md border border-dashed border-[var(--color-text-secondary)] bg-[var(--color-surface-muted)]/35 text-sm font-semibold transition hover:border-[var(--color-text-primary)]"
              >
                <Plus className="mb-2 h-7 w-7" strokeWidth={1.8} aria-hidden="true" />
                Add more
              </button>
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-[var(--color-text-secondary)]" aria-live="polite">
          {remainingPhotos > 0
            ? `Add ${remainingPhotos} more ${remainingPhotos === 1 ? 'photo' : 'photos'} to continue.`
            : `${files.length} photos added. You can continue or add more.`}
        </p>
      </div>

      <PhotoUploadDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={async (incomingFiles, onProgress) => {
          await uploadListingPhotos(incomingFiles, onProgress, listingId);
          addFiles(incomingFiles);
        }}
      />
    </motion.section>
  );
}

export { MINIMUM_PHOTOS };
