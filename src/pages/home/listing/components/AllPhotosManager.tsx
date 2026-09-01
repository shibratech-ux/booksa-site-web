import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, Image, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import {
  removeListingPhotos,
  setListingCoverPhoto,
  updateListingPhotoTour,
  uploadListingPhotos
} from '@/services/listing-photo.service';
import { PhotoUploadDialog } from '../create-listing/components/PhotoUploadDialog';

const roomDestinationImageModules = import.meta.glob<string>(
  [
    '../../../../assets/images/move-photos/*.png',
    '!../../../../assets/images/move-photos/Screenshot_*.png'
  ],
  { eager: true, import: 'default' }
);

const roomLabelOverrides: Record<string, string> = {
  'Childrens playroom': "Children's playroom"
};

const roomDestinations = Object.entries(roomDestinationImageModules)
  .map(([imagePath, imageUrl]) => {
    const imageName = imagePath.split('/').pop()?.replace(/\.png$/i, '') ?? '';
    return {
      imageName,
      imageUrl,
      label: roomLabelOverrides[imageName] ?? imageName
    };
  })
  .filter(({ imageName }) => imageName && !imageName.startsWith('Screenshot_'))
  .sort((first, second) => first.label.localeCompare(second.label));

function TrashActionsDialog({
  open,
  busy,
  onClose,
  onRemoveFromRoom,
  onDelete
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onRemoveFromRoom: () => void;
  onDelete: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[170] flex items-center justify-center bg-black/10 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Photo removal options"
            initial={{ opacity: 0, scale: 0.97, y: 34 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 22 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.8 }}
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-[265px] overflow-hidden rounded-2xl bg-[var(--color-surface)] px-5 py-5 shadow-[0_14px_45px_rgba(0,0,0,0.24)]"
          >
            <button
              type="button"
              disabled={busy}
              onClick={onRemoveFromRoom}
              className="flex min-h-[52px] w-full items-center justify-between gap-4 rounded-xl px-1 text-left text-base font-medium hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
            >
              <span>Remove from room or space</span>
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onDelete}
              className="mt-1 flex min-h-[52px] w-full items-center justify-between gap-4 rounded-xl px-1 text-left text-base font-medium hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
            >
              <span>{busy ? 'Working…' : 'Delete from listing'}</span>
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function AllPhotosManager({
  photoUrls,
  photoLabels = [],
  photoDescriptions = [],
  coverPhotoUrl,
  listingId,
  onPhotoLabelsChange,
  onBack
}: {
  photoUrls: string[];
  photoLabels?: string[];
  photoDescriptions?: string[];
  coverPhotoUrl?: string;
  listingId: string;
  onPhotoLabelsChange?: (photoLabels: string[]) => void;
  onBack: () => void;
}) {
  const [showArrangeDialog, setShowArrangeDialog] = useState(true);
  const [photos, setPhotos] = useState(photoUrls);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [descriptions, setDescriptions] = useState(() =>
    photoUrls.map((_, index) => photoDescriptions[index] ?? '')
  );
  const [coverUrl, setCoverUrl] = useState(coverPhotoUrl ?? photoUrls[0] ?? '');
  const [savedDescriptions, setSavedDescriptions] = useState(() =>
    photoUrls.map((_, index) => photoDescriptions[index] ?? '')
  );
  const [savedCoverUrl, setSavedCoverUrl] = useState(coverPhotoUrl ?? photoUrls[0] ?? '');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false);
  const [isTrashActionBusy, setIsTrashActionBusy] = useState(false);
  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isManagingPhotos, setIsManagingPhotos] = useState(false);
  const [selectedPhotoIndexes, setSelectedPhotoIndexes] = useState<Set<number>>(() => new Set());
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isMovingPhotos, setIsMovingPhotos] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [failedDestinationImages, setFailedDestinationImages] = useState<Set<string>>(
    () => new Set()
  );
  const [photoAssignments, setPhotoAssignments] = useState(() =>
    photoUrls.map((_, index) => photoLabels[index] ?? 'Unassigned')
  );

  useEffect(() => {
    setPhotos(photoUrls);
  }, [photoUrls]);

  useEffect(() => {
    if (!showArrangeDialog && !isMoveDialogOpen && !isTrashDialogOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (isTrashDialogOpen) {
        setIsTrashDialogOpen(false);
      } else if (isMoveDialogOpen) {
        setIsMoveDialogOpen(false);
        setSelectedDestination(null);
      } else {
        setShowArrangeDialog(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoveDialogOpen, isTrashDialogOpen, showArrangeDialog]);

  const closeFromBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setShowArrangeDialog(false);
  };

  const openPhotoSelection = () => {
    setShowArrangeDialog(false);
    setSelectedPhotoIndexes(new Set());
    setIsManagingPhotos(true);
  };

  const closePhotoSelection = () => {
    setSelectedPhotoIndexes(new Set());
    setIsManagingPhotos(false);
  };

  const togglePhotoSelection = (index: number) => {
    setSelectedPhotoIndexes((currentSelection) => {
      const nextSelection = new Set(currentSelection);
      if (nextSelection.has(index)) nextSelection.delete(index);
      else nextSelection.add(index);
      return nextSelection;
    });
  };

  const selectedCount = selectedPhotoIndexes.size;
  const existingDestinations = Array.from(
    new Set(photoAssignments.filter((label) => label && label !== 'Unassigned'))
  );

  const closeMoveDialog = () => {
    setIsMoveDialogOpen(false);
    setSelectedDestination(null);
  };

  const moveSelectedPhotos = async () => {
    if (!selectedDestination) return;
    const nextAssignments = photoAssignments.map((assignment, index) =>
      selectedPhotoIndexes.has(index) ? selectedDestination : assignment
    );

    setIsMovingPhotos(true);
    try {
      await updateListingPhotoTour(listingId, photos, nextAssignments, descriptions);
      setPhotoAssignments(nextAssignments);
      onPhotoLabelsChange?.(nextAssignments);
      setSelectedPhotoIndexes(new Set());
      closeMoveDialog();
      toast.success('Photo tour updated.');
    } catch (error) {
      console.error('Unable to update the listing photo tour.', error);
      toast.error(error instanceof Error ? error.message : 'The photo tour could not be updated.');
    } finally {
      setIsMovingPhotos(false);
    }
  };

  const openPhotoEditor = (index: number) => {
    setShowArrangeDialog(false);
    setSelectedPhotoIndex(index);
  };

  const closePhotoEditor = () => setSelectedPhotoIndex(null);

  const openMoveDialogForPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndexes(new Set([selectedPhotoIndex]));
    setSelectedDestination(photoAssignments[selectedPhotoIndex] ?? null);
    setIsMoveDialogOpen(true);
  };

  const saveSelectedPhoto = async () => {
    if (selectedPhotoIndex === null) return;
    setIsSavingPhoto(true);
    try {
      await updateListingPhotoTour(listingId, photos, photoAssignments, descriptions);
      if (coverUrl) await setListingCoverPhoto(listingId, coverUrl);
      setSavedDescriptions(descriptions);
      setSavedCoverUrl(coverUrl);
      onPhotoLabelsChange?.(photoAssignments);
      toast.success('Photo details saved.');
    } catch (error) {
      console.error('Unable to save the photo details.', error);
      toast.error(error instanceof Error ? error.message : 'The photo details could not be saved.');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const trashTargetIndexes = selectedPhotoIndex !== null
    ? [selectedPhotoIndex]
    : [...selectedPhotoIndexes];

  const removeTargetPhotosFromRoom = async () => {
    if (trashTargetIndexes.length === 0 || isTrashActionBusy) return;
    const targetIndexes = new Set(trashTargetIndexes);
    const nextAssignments = photoAssignments.map((assignment, index) =>
      targetIndexes.has(index) ? 'Unassigned' : assignment
    );
    setIsTrashActionBusy(true);
    try {
      await updateListingPhotoTour(listingId, photos, nextAssignments, descriptions);
      setPhotoAssignments(nextAssignments);
      onPhotoLabelsChange?.(nextAssignments);
      setSelectedPhotoIndexes(new Set());
      setIsTrashDialogOpen(false);
      toast.success('Photo removed from room or space.');
    } catch (error) {
      console.error('Unable to remove the photo from its room or space.', error);
      toast.error(error instanceof Error ? error.message : 'The photo could not be updated.');
    } finally {
      setIsTrashActionBusy(false);
    }
  };

  const deleteTargetPhotos = async () => {
    if (trashTargetIndexes.length === 0 || isTrashActionBusy) return;
    const targetIndexes = new Set(trashTargetIndexes);
    const urlsToDelete = photos.filter((_, index) => targetIndexes.has(index));
    const nextPhotos = photos.filter((_, index) => !targetIndexes.has(index));
    const nextAssignments = photoAssignments.filter((_, index) => !targetIndexes.has(index));
    const nextDescriptions = descriptions.filter((_, index) => !targetIndexes.has(index));
    setIsTrashActionBusy(true);
    try {
      await removeListingPhotos(
        listingId,
        urlsToDelete,
        nextPhotos,
        nextAssignments,
        nextDescriptions
      );
      setPhotos(nextPhotos);
      setPhotoAssignments(nextAssignments);
      setDescriptions(nextDescriptions);
      setSavedDescriptions(nextDescriptions);
      if (urlsToDelete.includes(coverUrl)) setCoverUrl(nextPhotos[0] ?? '');
      if (urlsToDelete.includes(savedCoverUrl)) setSavedCoverUrl(nextPhotos[0] ?? '');
      onPhotoLabelsChange?.(nextAssignments);
      setSelectedPhotoIndexes(new Set());
      setSelectedPhotoIndex(null);
      setIsTrashDialogOpen(false);
      toast.success(urlsToDelete.length === 1 ? 'Photo deleted.' : 'Photos deleted.');
    } catch (error) {
      console.error('Unable to delete the listing photos.', error);
      toast.error(error instanceof Error ? error.message : 'The photos could not be deleted.');
    } finally {
      setIsTrashActionBusy(false);
    }
  };

  const selectedPhotoUrl = selectedPhotoIndex === null ? undefined : photos[selectedPhotoIndex];
  const selectedPhotoDescription = selectedPhotoIndex === null
    ? ''
    : descriptions[selectedPhotoIndex] ?? '';

  if (selectedPhotoIndex !== null && selectedPhotoUrl) {
    const isCoverPhoto = coverUrl === selectedPhotoUrl;
    const roomLabel = photoAssignments[selectedPhotoIndex] || 'Unassigned';
    const hasPendingChanges = coverUrl !== savedCoverUrl ||
      selectedPhotoDescription !== (savedDescriptions[selectedPhotoIndex] ?? '');

    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[calc(100vh-95px)] flex-col bg-[var(--color-surface)]"
      >
        <div className="flex flex-1 flex-col px-5 pb-10 pt-6 sm:px-10 lg:px-20">
          <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between">
            <button
              type="button"
              onClick={closePhotoEditor}
              aria-label="Close photo editor"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isCoverPhoto}
                onClick={() => setCoverUrl(selectedPhotoUrl)}
                className="h-11 rounded-full bg-[var(--color-surface-muted)] px-5 text-sm font-semibold transition hover:brightness-95 disabled:text-[var(--color-text-secondary)]"
              >
                {isCoverPhoto ? 'Cover photo' : 'Make cover photo'}
              </button>
              <button
                type="button"
                onClick={() => setIsTrashDialogOpen(true)}
                disabled={isTrashActionBusy}
                aria-label="Delete photo"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95 disabled:opacity-60"
              >
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <main className="mx-auto mt-7 w-full max-w-[610px] flex-1 sm:mt-2">
            <div className="relative overflow-hidden rounded-[22px] bg-[var(--color-surface-muted)]">
              <ShimmerImage
                src={selectedPhotoUrl}
                alt={`Listing photo ${selectedPhotoIndex + 1}`}
                className="aspect-[1.82/1] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => descriptionInputRef.current?.focus()}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
                Add a visual description
              </button>
            </div>

            <button
              type="button"
              onClick={openMoveDialogForPhoto}
              className="mt-7 flex min-h-12 w-full items-center justify-between gap-4 text-left text-base"
            >
              <span>Move from <strong>{roomLabel}</strong>?</span>
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>

            <label className="mt-3 block">
              <span className="sr-only">Photo description</span>
              <textarea
                ref={descriptionInputRef}
                value={selectedPhotoDescription}
                maxLength={250}
                onChange={(event) => {
                  const value = event.target.value;
                  setDescriptions((current) => current.map((description, index) =>
                    index === selectedPhotoIndex ? value : description
                  ));
                }}
                placeholder="Add a description for this room or space."
                className="min-h-[92px] w-full resize-none rounded-2xl border-2 border-[var(--color-text-primary)] bg-transparent px-4 py-3 text-base outline-none placeholder:text-[var(--color-text-secondary)] focus:ring-2 focus:ring-[var(--color-primary-500)]"
              />
              <span className="mt-2 block text-sm text-[var(--color-text-secondary)]">
                {250 - selectedPhotoDescription.length} characters available
              </span>
            </label>
          </main>
        </div>

        <footer className="sticky bottom-0 flex min-h-24 items-center justify-end border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 sm:px-10 lg:px-20">
          <button
            type="button"
            onClick={() => void saveSelectedPhoto()}
            disabled={!hasPendingChanges || isSavingPhoto}
            className="h-12 min-w-[92px] rounded-xl bg-[var(--color-text-primary)] px-7 text-base font-semibold text-[var(--color-surface)] disabled:opacity-50"
          >
            {isSavingPhoto ? 'Saving…' : 'Save'}
          </button>
        </footer>

        <TrashActionsDialog
          open={isTrashDialogOpen}
          busy={isTrashActionBusy}
          onClose={() => setIsTrashDialogOpen(false)}
          onRemoveFromRoom={() => void removeTargetPhotosFromRoom()}
          onDelete={() => void deleteTargetPhotos()}
        />

        <AnimatePresence>
          {isMoveDialogOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 px-4 py-6"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeMoveDialog();
              }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="move-one-photo-title"
                initial={{ opacity: 0, scale: 0.96, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 12 }}
                onMouseDown={(event) => event.stopPropagation()}
                className="flex max-h-[min(82vh,665px)] w-full max-w-[570px] flex-col overflow-hidden rounded-[30px] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
              >
                <header className="relative flex h-20 shrink-0 items-center justify-center px-16">
                  <button
                    type="button"
                    onClick={closeMoveDialog}
                    aria-label="Close move photo dialog"
                    className="absolute left-4 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-surface-muted)]"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <h2 id="move-one-photo-title" className="text-base font-semibold">Move photo</h2>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
                  <h3 className="mb-4 text-2xl font-semibold tracking-tight">Choose a room or space</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                    {[...new Set([...existingDestinations, ...roomDestinations.map(({ label }) => label)])].map((destination) => {
                      const existingPhotoIndex = photoAssignments.findIndex((label) => label === destination);
                      const destinationAsset = roomDestinations.find(({ label }) => label === destination);
                      const previewUrl = existingPhotoIndex >= 0
                        ? photos[existingPhotoIndex]
                        : destinationAsset?.imageUrl;
                      const isActive = selectedDestination === destination;

                      return (
                        <button
                          key={destination}
                          type="button"
                          onClick={() => setSelectedDestination(destination)}
                          aria-pressed={isActive}
                          className="min-w-0 text-left"
                        >
                          <span className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-surface-muted)] ${isActive ? 'ring-2 ring-[var(--color-text-primary)] ring-offset-2' : ''}`}>
                            {previewUrl ? (
                              <ShimmerImage src={previewUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Image className="h-10 w-10 text-[var(--color-text-secondary)]" aria-hidden="true" />
                            )}
                            {isActive ? (
                              <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
                                <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-2 block truncate text-base font-semibold">{destination}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <footer className="flex h-20 shrink-0 items-center justify-between border-t border-[var(--color-border)] px-6">
                  <button type="button" onClick={closeMoveDialog} className="h-11 px-3 text-base font-semibold">
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedDestination || isMovingPhotos}
                    onClick={() => void moveSelectedPhotos()}
                    className="h-12 min-w-[112px] rounded-xl bg-[var(--color-text-primary)] px-7 text-base font-semibold text-[var(--color-surface)] disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)]"
                  >
                    {isMovingPhotos ? 'Moving…' : 'Move'}
                  </button>
                </footer>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[calc(100vh-95px)] bg-[var(--color-surface)] px-6 py-10 sm:px-10 lg:px-20"
    >
      <div className="mx-auto max-w-[1240px]">
        {isManagingPhotos ? (
          <div className="grid min-h-11 grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="justify-self-start">
              {selectedCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndexes(new Set())}
                  className="h-11 rounded-full bg-[var(--color-surface-muted)] px-5 text-sm font-semibold"
                >
                  Deselect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closePhotoSelection}
                  aria-label="Close photo selection"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
            </div>

            <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
              {selectedCount > 0 ? `${selectedCount} selected` : 'Select photos'}
            </h1>

            <div className="flex items-center gap-2 justify-self-end">
              {selectedCount > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsMoveDialogOpen(true)}
                    className="h-11 rounded-full bg-[var(--color-surface-muted)] px-6 text-sm font-semibold"
                  >
                    Move
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTrashDialogOpen(true)}
                    aria-label={`Delete ${selectedCount} selected ${selectedCount === 1 ? 'photo' : 'photos'}`}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)]"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-5">
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to photo tour"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)] transition hover:brightness-95"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openPhotoSelection}
                className="h-11 rounded-full bg-[var(--color-surface-muted)] px-6 text-sm font-semibold"
              >
                Manage photos
              </button>
              <button
                type="button"
                onClick={() => setIsUploadDialogOpen(true)}
                aria-label="Add photos"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-muted)]"
              >
                <Plus className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {photos.map((photoUrl, index) => {
            const isSelected = selectedPhotoIndexes.has(index);
            const photo = (
              <figure
              key={`${photoUrl}-${index}`}
              className={`relative aspect-square overflow-hidden rounded-2xl bg-[var(--color-surface-muted)] transition ${
                isSelected ? 'ring-2 ring-[var(--color-text-primary)] ring-offset-2' : ''
              }`}
            >
              <ShimmerImage src={photoUrl} alt={`Listing photo ${index + 1}`} className="h-full w-full object-cover" />
              {photoUrl === coverUrl ? (
                <figcaption className="absolute left-4 top-4 rounded-full bg-[var(--color-surface)]/90 px-4 py-2 text-sm font-medium shadow-[var(--shadow-sm)] backdrop-blur-sm">
                  Cover photo
                </figcaption>
              ) : null}
              {isManagingPhotos && photoAssignments[index] && photoAssignments[index] !== 'Unassigned' ? (
                <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] truncate rounded-full bg-[var(--color-surface)]/95 px-4 py-2 text-sm font-medium shadow-[var(--shadow-sm)]">
                  {photoAssignments[index]}
                </span>
              ) : null}
              {isManagingPhotos && isSelected ? (
                <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
                  <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                </span>
              ) : null}
            </figure>
            );

            return isManagingPhotos ? (
              <button
                key={`${photoUrl}-${index}`}
                type="button"
                onClick={() => togglePhotoSelection(index)}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? 'Deselect' : 'Select'} listing photo ${index + 1}`}
                className="block rounded-2xl text-left"
              >
                {photo}
              </button>
            ) : (
              <button
                key={`${photoUrl}-${index}`}
                type="button"
                onClick={() => openPhotoEditor(index)}
                aria-label={`Edit listing photo ${index + 1}`}
                className="block rounded-2xl text-left"
              >
                {photo}
              </button>
            );
          })}
          {photos.length === 0 ? (
            <div className="col-span-full flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)]">
              <span className="flex flex-col items-center gap-3">
                <Image className="h-10 w-10" aria-hidden="true" />
                No photos available
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {showArrangeDialog ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={closeFromBackdrop}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 px-4 py-6"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="arrange-photos-title"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
              className="relative flex min-h-[448px] w-full max-w-[378px] flex-col items-center rounded-[30px] bg-[var(--color-surface)] px-6 pb-7 pt-16 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
            >
              <button
                type="button"
                onClick={() => setShowArrangeDialog(false)}
                aria-label="Close photo arrangement dialog"
                className="absolute left-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-surface-muted)]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="relative h-[120px] w-[270px] max-w-full">
                {photos.slice(0, 3).map((photoUrl, index) => (
                  <ShimmerImage
                    key={`${photoUrl}-preview`}
                    src={photoUrl}
                    alt=""
                    className="absolute left-1/2 top-1/2 h-[96px] w-[122px] rounded-lg object-cover shadow-[var(--shadow-md)]"
                    style={{
                      transform: `translate(-50%, -50%) translateX(${(index - 1) * 50}px) rotate(${(index - 1) * 5}deg)`,
                      zIndex: index === 1 ? 3 : index + 1
                    }}
                  />
                ))}
                {photos.length === 0 ? (
                  <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-[var(--color-surface-muted)]">
                    <Image className="h-9 w-9 text-[var(--color-text-secondary)]" aria-hidden="true" />
                  </span>
                ) : null}
              </div>

              <h2 id="arrange-photos-title" className="mt-6 text-2xl font-semibold tracking-tight">
                Lead with your best photos
              </h2>
              <p className="mt-3 max-w-[310px] text-sm leading-snug text-[var(--color-text-secondary)]">
                Instantly sort your photos so the best ones show up first.
              </p>
              <button
                type="button"
                onClick={() => setShowArrangeDialog(false)}
                className="mt-10 h-12 w-full rounded-[14px] bg-[var(--color-text-primary)] px-6 text-base font-semibold text-[var(--color-surface)]"
              >
                Arrange photos
              </button>
              <button
                type="button"
                onClick={() => setShowArrangeDialog(false)}
                className="mt-4 min-h-11 rounded-lg px-5 text-base font-semibold hover:bg-[var(--color-surface-muted)]"
              >
                No thanks
              </button>
            </motion.div>
          </motion.div>
        ) : null}

        {isMoveDialogOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[160] flex items-center justify-center bg-black/40 px-4 py-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeMoveDialog();
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="move-photos-title"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onMouseDown={(event) => event.stopPropagation()}
              className="flex max-h-[min(82vh,665px)] w-full max-w-[570px] flex-col overflow-hidden rounded-[30px] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
            >
              <header className="relative flex h-20 shrink-0 items-center justify-center px-16">
                <button
                  type="button"
                  onClick={closeMoveDialog}
                  aria-label="Close move photos dialog"
                  className="absolute left-4 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-surface-muted)]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
                <h2 id="move-photos-title" className="text-base font-semibold">Move photos</h2>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
                {existingDestinations.length > 0 ? (
                  <section>
                    <h3 className="mb-4 text-2xl font-semibold tracking-tight">Choose a room or space</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                      {existingDestinations.map((destination) => {
                        const photoIndex = photoAssignments.findIndex((label) => label === destination);
                        const isActive = selectedDestination === destination;
                        return (
                          <button
                            key={destination}
                            type="button"
                            onClick={() => setSelectedDestination(destination)}
                            aria-pressed={isActive}
                            className="min-w-0 text-left"
                          >
                            <span className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-surface-muted)] ${isActive ? 'ring-2 ring-[var(--color-text-primary)] ring-offset-2' : ''}`}>
                              {photoUrls[photoIndex] ? (
                                <ShimmerImage src={photoUrls[photoIndex]} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Image className="h-10 w-10 text-[var(--color-text-secondary)]" aria-hidden="true" />
                              )}
                              {isActive ? (
                                <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
                                  <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-2 block truncate text-base font-semibold">{destination}</span>
                            <span className="mt-0.5 block text-sm text-[var(--color-text-secondary)]">
                              {photoAssignments.filter((label) => label === destination).length} photos
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                <section className={existingDestinations.length > 0 ? 'mt-9' : ''}>
                  <h3 className="mb-4 text-2xl font-semibold tracking-tight">Add a new room or space</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                    {roomDestinations.map(({ label, imageName, imageUrl }) => {
                      const isActive = selectedDestination === label;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setSelectedDestination(label)}
                          aria-pressed={isActive}
                          className="min-w-0 text-left"
                        >
                          <span className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[var(--color-surface-muted)] ${isActive ? 'ring-2 ring-[var(--color-text-primary)] ring-offset-2' : ''}`}>
                            {failedDestinationImages.has(imageName) ? (
                              <Image
                                className="h-10 w-10 text-[var(--color-text-secondary)]"
                                aria-hidden="true"
                              />
                            ) : (
                              <ShimmerImage
                                src={imageUrl}
                                alt=""
                                aria-hidden="true"
                                data-room-image={imageName}
                                loading="lazy"
                                decoding="async"
                                onError={() => {
                                  setFailedDestinationImages((failedImages) =>
                                    new Set(failedImages).add(imageName)
                                  );
                                }}
                                className="h-full w-full object-cover"
                              />
                            )}
                            {isActive ? (
                              <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
                                <Check className="h-5 w-5" strokeWidth={3} aria-hidden="true" />
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-2 block truncate text-base font-semibold">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              <footer className="flex h-20 shrink-0 items-center justify-between border-t border-[var(--color-border)] px-6">
                <button type="button" onClick={closeMoveDialog} className="h-11 px-3 text-base font-semibold">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedDestination || isMovingPhotos}
                  onClick={() => void moveSelectedPhotos()}
                  className="h-12 min-w-[112px] rounded-xl bg-[var(--color-text-primary)] px-7 text-base font-semibold text-[var(--color-surface)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-secondary)]"
                >
                  {isMovingPhotos ? 'Moving…' : 'Move'}
                </button>
              </footer>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <TrashActionsDialog
        open={isTrashDialogOpen}
        busy={isTrashActionBusy}
        onClose={() => setIsTrashDialogOpen(false)}
        onRemoveFromRoom={() => void removeTargetPhotosFromRoom()}
        onDelete={() => void deleteTargetPhotos()}
      />

      <PhotoUploadDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={async (files, onProgress) => {
          await uploadListingPhotos(files, onProgress, listingId);
        }}
      />
    </motion.section>
  );
}
