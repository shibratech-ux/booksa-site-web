import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, Image, Images, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import {
  removeListingPhotos,
  setListingCoverPhoto,
  updateListingPhotoTour,
  uploadListingPhotos
} from '@/services/listing-photo.service';
import { PhotoManagerDialog, photoActionClass, photoPrimaryClass, photoIconClass } from './PhotoManagerDialog';
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
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isManagingPhotos, setIsManagingPhotos] = useState(false);
  const [selectedPhotoIndexes, setSelectedPhotoIndexes] = useState<Set<number>>(() => new Set());
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isMovingPhotos, setIsMovingPhotos] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [failedDestinationImages, setFailedDestinationImages] = useState<Set<string>>(() => new Set());
  const [photoAssignments, setPhotoAssignments] = useState(() =>
    photoUrls.map((_, index) => photoLabels[index] ?? 'Unassigned')
  );

  // Reconcile subscription updates by URL so room labels and drafts follow their photos.
  // Only incoming URL changes should trigger this; local deletion updates its own arrays.
  useEffect(() => {
    if (photos.length === photoUrls.length && photos.every((url, index) => url === photoUrls[index])) return;
    const previousUrls = photos;
    const realign = (values: string[], incoming: string[], fallback: string) =>
      photoUrls.map((url, index) => {
        const previousIndex = previousUrls.indexOf(url);
        return previousIndex >= 0 ? values[previousIndex] ?? incoming[index] ?? fallback : incoming[index] ?? fallback;
      });
    setPhotos(photoUrls);
    setPhotoAssignments((current) => realign(current, photoLabels, 'Unassigned'));
    setDescriptions((current) => realign(current, photoDescriptions, ''));
    setSavedDescriptions((current) => realign(current, photoDescriptions, ''));
    setSelectedPhotoIndexes(new Set());
    setSelectedPhotoIndex((current) => {
      if (current === null) return null;
      const nextIndex = photoUrls.indexOf(previousUrls[current]);
      return nextIndex < 0 ? null : nextIndex;
    });
  }, [photoUrls]);

  useEffect(() => {
    const nextCover = coverPhotoUrl && photoUrls.includes(coverPhotoUrl)
      ? coverPhotoUrl : photoUrls[0] ?? '';
    setCoverUrl(nextCover);
    setSavedCoverUrl(nextCover);
  }, [coverPhotoUrl]);

  const openPhotoSelection = () => {
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
    if (!selectedDestination || isMovingPhotos || selectedPhotoIndexes.size === 0) return;
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
    setSelectedPhotoIndex(index);
  };

  const closePhotoEditor = () => {
    if (isSavingPhoto || isTrashActionBusy || isMovingPhotos) return;
    setDescriptions(savedDescriptions);
    setCoverUrl(savedCoverUrl);
    setSelectedPhotoIndex(null);
    setSelectedPhotoIndexes(new Set());
  };

  const openMoveDialogForPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndexes(new Set([selectedPhotoIndex]));
    setSelectedDestination(null);
    setIsMoveDialogOpen(true);
  };

  const saveSelectedPhoto = async () => {
    if (selectedPhotoIndex === null || isSavingPhoto) return;
    setIsSavingPhoto(true);
    try {
      await updateListingPhotoTour(listingId, photos, photoAssignments, descriptions);
      setSavedDescriptions(descriptions);
      if (coverUrl !== savedCoverUrl && coverUrl) await setListingCoverPhoto(listingId, coverUrl);
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
      if (nextPhotos.length === 0) setIsManagingPhotos(false);
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

  const isEditing = selectedPhotoIndex !== null && Boolean(selectedPhotoUrl);
  const isBusy = isSavingPhoto || isMovingPhotos || isTrashActionBusy;
  const hasPendingChanges = coverUrl !== savedCoverUrl ||
    descriptions.some((description, index) => description !== (savedDescriptions[index] ?? ''));
  const unassignedCount = photoAssignments.filter((label) => label === 'Unassigned').length;
  const allSelected = photos.length > 0 && selectedCount === photos.length;
  const destinations = [
    ...existingDestinations.map((label) => ({ label, imageUrl: photos[photoAssignments.indexOf(label)], existing: true })),
    ...roomDestinations.filter(({ label }) => !existingDestinations.includes(label)).map((room) => ({ ...room, existing: false }))
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="relative flex min-h-[calc(100dvh-96px)] flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[var(--color-text-primary)]"
    >
      <div className="mx-auto w-full max-w-[1280px] flex-1 px-5 pb-36 pt-6 sm:px-10 sm:pt-8 lg:px-16">
        <nav aria-label="Photo tour navigation" className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={isEditing ? closePhotoEditor : onBack} disabled={isBusy} className="group inline-flex min-h-11 items-center gap-3 rounded-full pr-3 text-sm font-semibold">
            <span className={`${photoIconClass} border border-[var(--color-border)] group-hover:bg-[var(--color-surface-muted)]`}><ArrowLeft className="h-4 w-4" aria-hidden="true" /></span>
            {isEditing ? 'All photos' : 'Photo tour'}
          </button>
          {isEditing ? (
            <span className="text-sm text-[var(--color-text-secondary)]">Photo {(selectedPhotoIndex ?? 0) + 1} of {photos.length}</span>
          ) : (
            <button type="button" onClick={() => setIsUploadDialogOpen(true)} className={photoActionClass}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add photos
            </button>
          )}
        </nav>

        {isEditing && selectedPhotoUrl && selectedPhotoIndex !== null ? (
          <>
            <header className="mb-8 mt-9 sm:mt-12">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Photo details</h1>
              <p className="mt-3 text-base text-[var(--color-text-secondary)]">Give guests a closer look at your space.</p>
            </header>
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:gap-12">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-photo bg-[var(--color-surface-muted)]">
                <ShimmerImage src={selectedPhotoUrl} alt={selectedPhotoDescription || `Listing photo ${selectedPhotoIndex + 1}`} className="h-full w-full object-contain" />
                {coverUrl === selectedPhotoUrl && <span className="absolute left-4 top-4 rounded-full bg-[var(--color-surface)] px-4 py-2 text-xs font-semibold shadow-[var(--shadow-sm)]">Cover photo</span>}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Make a great first impression</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Your cover photo is the first image guests see in search results.</p>
                <button type="button" disabled={coverUrl === selectedPhotoUrl || isBusy} onClick={() => setCoverUrl(selectedPhotoUrl)} className={`${photoActionClass} mt-5 w-full`}>
                  {coverUrl === selectedPhotoUrl ? <><Check className="h-4 w-4" aria-hidden="true" /> Cover photo</> : 'Make cover photo'}
                </button>
                <div className="my-7 border-t border-[var(--color-border)]" />
                <button type="button" onClick={openMoveDialogForPhoto} disabled={isBusy || hasPendingChanges} className="flex min-h-12 w-full items-center justify-between gap-4 rounded-button text-left disabled:opacity-50">
                  <span><span className="block text-xs text-[var(--color-text-secondary)]">Room or space</span><span className="mt-1 block font-semibold">{photoAssignments[selectedPhotoIndex] || 'Unassigned'}</span></span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <label className="mt-7 block" htmlFor="listing-photo-description">
                  <span className="text-base font-semibold">Visual description</span>
                  <span id="photo-description-help" className="mb-3 mt-2 block text-sm leading-6 text-[var(--color-text-secondary)]">Describe what’s in the photo to help everyone explore your space, including guests using screen readers.</span>
                </label>
                <textarea
                  id="listing-photo-description" value={selectedPhotoDescription} maxLength={250} disabled={isBusy}
                  aria-describedby="photo-description-help photo-description-count"
                  onChange={(event) => {
                    const value = event.target.value;
                    setDescriptions((current) => current.map((description, index) => index === selectedPhotoIndex ? value : description));
                  }}
                  placeholder="A bright living room with a sofa and large windows."
                  className="min-h-36 w-full resize-y rounded-field border border-[var(--color-border)] bg-transparent p-4 text-base sm:text-sm leading-6 outline-none focus:border-[var(--color-text-primary)] focus:ring-1 focus:ring-[var(--color-text-primary)] disabled:opacity-50"
                />
                <p id="photo-description-count" className="mt-2 text-right text-xs text-[var(--color-text-secondary)]">{selectedPhotoDescription.length}/250</p>
                <button type="button" onClick={() => setIsTrashDialogOpen(true)} disabled={isBusy || hasPendingChanges} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-button text-sm font-semibold underline underline-offset-4 disabled:opacity-40">
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove photo
                </button>
                {hasPendingChanges && <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Save or cancel your changes before moving or removing this photo.</p>}
              </div>
            </div>
          </>
        ) : (
          <>
            <header className="mb-8 mt-9 flex flex-wrap items-end justify-between gap-5 sm:mt-12">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All photos</h1>
                <p className="mt-3 text-base leading-6 text-[var(--color-text-secondary)]">Show guests what makes your place special.</p>
              </div>
              <button type="button" disabled={photos.length === 0 && !isManagingPhotos} onClick={isManagingPhotos ? closePhotoSelection : openPhotoSelection} className={photoActionClass}>
                {isManagingPhotos ? 'Done' : 'Manage photos'}
              </button>
            </header>
            <div className="mb-8 flex items-start gap-4 rounded-card bg-[var(--color-surface-muted)] p-5 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface)]"><Images className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" /></span>
              <div>
                <h2 className="text-sm font-semibold sm:text-base">Lead with your best photo</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">Choose a photo to set your cover or add a description. Use Manage photos to organize them into rooms and spaces.</p>
              </div>
            </div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-[var(--color-text-secondary)]"><span className="font-semibold text-[var(--color-text-primary)]">{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span>{unassignedCount > 0 && <span> · {unassignedCount} unassigned</span>}</p>
              {isManagingPhotos && <button type="button" className="min-h-11 rounded-button font-semibold underline underline-offset-4" onClick={() => setSelectedPhotoIndexes(allSelected ? new Set() : new Set(photos.map((_, index) => index)))}>{allSelected ? 'Deselect all' : 'Select all'}</button>}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
              {photos.map((photoUrl, index) => {
                const isSelected = selectedPhotoIndexes.has(index);
                const room = photoAssignments[index] || 'Unassigned';
                return (
                  <button key={`${photoUrl}-${index}`} type="button"
                    onClick={() => isManagingPhotos ? togglePhotoSelection(index) : openPhotoEditor(index)}
                    aria-pressed={isManagingPhotos ? isSelected : undefined}
                    aria-label={`${isManagingPhotos ? (isSelected ? 'Deselect' : 'Select') : 'Edit'} photo ${index + 1}, ${room}${photoUrl === coverUrl ? ', cover photo' : ''}`}
                    className="group min-w-0 rounded-photo text-left"
                  >
                    <span className={`relative block aspect-square overflow-hidden rounded-photo bg-[var(--color-surface-muted)] transition ${isManagingPhotos && isSelected ? 'ring-2 ring-[var(--color-text-primary)] ring-offset-4 ring-offset-[var(--color-surface)]' : ''}`}>
                      <ShimmerImage src={photoUrl} alt={descriptions[index] || ''} loading={index < 4 ? 'eager' : 'lazy'} decoding="async" className="h-full w-full object-cover transition duration-300 motion-safe:group-hover:scale-[1.04]" />
                      {photoUrl === coverUrl && <span className="absolute left-2 top-2 rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-[11px] font-semibold shadow-[var(--shadow-sm)] sm:left-3 sm:top-3">Cover photo</span>}
                      {isManagingPhotos && <span className={`absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-sm ${isSelected ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]' : 'bg-black/25'}`}>{isSelected && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}</span>}
                    </span>
                    <span className="mt-3 flex items-baseline justify-between gap-2 px-0.5"><span className="truncate text-sm font-medium">{room}</span><span className="text-xs text-[var(--color-text-secondary)]">{index + 1}</span></span>
                  </button>
                );
              })}
              {photos.length === 0 && (
                <div className="col-span-full flex min-h-80 flex-col items-center justify-center rounded-card border border-dashed border-[var(--color-border)] px-6 text-center">
                  <Image className="mb-5 h-10 w-10 text-[var(--color-text-secondary)]" strokeWidth={1.25} aria-hidden="true" />
                  <h2 className="text-xl font-semibold">Your space starts here</h2>
                  <p className="mb-6 mt-2 text-sm text-[var(--color-text-secondary)]">Add photos to bring your listing to life.</p>
                  <button type="button" onClick={() => setIsUploadDialogOpen(true)} className={photoPrimaryClass}><Plus className="h-4 w-4" aria-hidden="true" /> Add photos</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {(isEditing || isManagingPhotos) && (
        <footer className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 md:bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-10">
          <div className="mx-auto flex max-w-[1152px] flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm font-medium">{isEditing ? (hasPendingChanges ? 'Unsaved changes' : 'All changes saved') : `${selectedCount} selected`}</p>
            <div className="flex items-center gap-3">
              {isEditing ? <>
                <button type="button" onClick={closePhotoEditor} disabled={isBusy} className={photoActionClass}>{hasPendingChanges ? 'Cancel' : 'Done'}</button>
                <button type="button" onClick={() => void saveSelectedPhoto()} disabled={!hasPendingChanges || isBusy} className={photoPrimaryClass}>{isSavingPhoto ? 'Saving…' : 'Save'}</button>
              </> : <>
                <button type="button" onClick={() => setIsTrashDialogOpen(true)} disabled={!selectedCount || isBusy} aria-label="Remove selected photos" className={`${photoIconClass} border border-[var(--color-border)]`}><Trash2 className="h-5 w-5" aria-hidden="true" /></button>
                <button type="button" onClick={() => { setSelectedDestination(null); setIsMoveDialogOpen(true); }} disabled={!selectedCount || isBusy} className={photoPrimaryClass}>Move <span className="hidden sm:inline">to a room</span><ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
              </>}
            </div>
          </div>
        </footer>
      )}

      <PhotoManagerDialog open={isMoveDialogOpen} title={selectedCount === 1 ? 'Move photo' : 'Move photos'} busy={isMovingPhotos} onClose={closeMoveDialog}
        footer={<><button type="button" disabled={isMovingPhotos} onClick={closeMoveDialog} className={photoActionClass}>Cancel</button><button type="button" disabled={!selectedDestination || isMovingPhotos} onClick={() => void moveSelectedPhotos()} className={photoPrimaryClass}>{isMovingPhotos ? 'Moving…' : 'Move'}</button></>}
      >
        <h3 className="text-2xl font-semibold tracking-tight">Choose a room or space</h3>
        <p className="mb-6 mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Help guests see how your place fits together. Choose a room for {selectedCount === 1 ? 'this photo' : `these ${selectedCount} photos`}.</p>
        {[true, false].map((existing) => {
          const group = destinations.filter((room) => room.existing === existing);
          if (!group.length) return null;
          return <section key={String(existing)} className="mb-7 last:mb-0">
            <h4 className="mb-4 text-sm font-semibold">{existing ? 'Your rooms and spaces' : 'Add a new room or space'}</h4>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {group.map(({ label, imageUrl }) => <button key={label} type="button" disabled={isMovingPhotos} onClick={() => setSelectedDestination(label)} aria-pressed={selectedDestination === label} className="min-w-0 rounded-photo text-left disabled:opacity-50">
                <span className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-photo bg-[var(--color-surface-muted)] ${selectedDestination === label ? 'ring-2 ring-[var(--color-text-primary)] ring-offset-4 ring-offset-[var(--color-surface)]' : ''}`}>
                  {imageUrl && !failedDestinationImages.has(imageUrl) ? <ShimmerImage src={imageUrl} alt="" loading="lazy" onError={() => setFailedDestinationImages((current) => new Set(current).add(imageUrl))} className="h-full w-full object-cover" /> : <Image className="h-9 w-9 text-[var(--color-text-secondary)]" aria-hidden="true" />}
                  {selectedDestination === label && <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-text-primary)] text-[var(--color-surface)]"><Check className="h-4 w-4" aria-hidden="true" /></span>}
                </span>
                <span className="mt-3 block text-sm font-semibold">{label}</span>
                {existing && <span className="mt-1 block text-xs text-[var(--color-text-secondary)]">{photoAssignments.filter((room) => room === label).length} photos</span>}
              </button>)}
            </div>
          </section>;
        })}
      </PhotoManagerDialog>

      <PhotoManagerDialog open={isTrashDialogOpen} title={trashTargetIndexes.length === 1 ? 'Remove photo' : 'Remove photos'} busy={isTrashActionBusy} onClose={() => setIsTrashDialogOpen(false)}>
        <p className="mb-5 text-sm leading-6 text-[var(--color-text-secondary)]">Choose what to do with {trashTargetIndexes.length === 1 ? 'this photo' : `these ${trashTargetIndexes.length} photos`}.</p>
        <button type="button" disabled={isTrashActionBusy} onClick={() => void removeTargetPhotosFromRoom()} className="flex w-full items-center justify-between gap-4 rounded-card border border-[var(--color-border)] p-5 text-left hover:bg-[var(--color-surface-muted)] disabled:opacity-50">
          <span><span className="block font-semibold">Remove from room or space</span><span className="mt-1 block text-sm text-[var(--color-text-secondary)]">Keep in your listing as unassigned photos.</span></span><ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
        </button>
        <button type="button" disabled={isTrashActionBusy} onClick={() => void deleteTargetPhotos()} className="mt-3 flex w-full items-center justify-between gap-4 rounded-card border border-[var(--color-border)] p-5 text-left hover:bg-[var(--color-surface-muted)] disabled:opacity-50">
          <span><span className="block font-semibold text-[var(--color-danger)]">{isTrashActionBusy ? 'Working…' : 'Delete from listing'}</span><span className="mt-1 block text-sm text-[var(--color-text-secondary)]">Permanently delete. This can’t be undone.</span></span><Trash2 className="h-5 w-5 shrink-0 text-[var(--color-danger)]" aria-hidden="true" />
        </button>
      </PhotoManagerDialog>

      <PhotoUploadDialog open={isUploadDialogOpen} onClose={() => setIsUploadDialogOpen(false)} onUpload={async (files, onProgress) => { await uploadListingPhotos(files, onProgress, listingId); }} />
    </motion.section>
  );
}
