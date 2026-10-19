import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Image, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { BackButton } from '@/components/ui/BackButton';
import { IconButton } from '@/components/ui/IconButton';
import { getOwnListingImageUrls } from '@/domain/listing-photos';
import type { ListingDraft } from '@/services/listing-draft.service';
import {
  getPhotoTourDescriptions,
  getPhotoTourRoomLabels,
  removeListingPhotos,
  updateListingPhotoTour,
  uploadListingPhotos
} from '@/services/listing-photo.service';
import { PhotoManagerDialog, photoActionClass, photoPrimaryClass, photoIconClass } from './PhotoManagerDialog';
import { ListingPhotoDetails } from './ListingPhotoDetails';
import { photoTourIllustration, photoTourRoomDestinations } from './photoTourRooms';
import { PhotoUploadDialog } from '../create-listing/components/PhotoUploadDialog';

export function AllPhotosManager({ listing, onPhotoLabelsChange, onBack }: {
  listing: ListingDraft;
  onPhotoLabelsChange?: (photoLabels: string[]) => void;
  onBack: () => void;
}) {
  // The live annonceslisting document is the only image source. Never fall back to legacy
  // URL arrays, nested user photos, or photo-tour assignments from another document.
  const photoUrls = useMemo(() => getOwnListingImageUrls(listing), [listing]);
  const photoLabels = useMemo(() => getPhotoTourRoomLabels(listing.photoTour, photoUrls)
    .map(label => label ?? 'Unassigned'), [listing.photoTour, photoUrls]);
  const photoDescriptions = useMemo(() => getPhotoTourDescriptions(listing.photoTour, photoUrls), [listing.photoTour, photoUrls]);

  return (
    <AllPhotosManagerContent
      key={listing.id}
      listingId={listing.id}
      photoUrls={photoUrls}
      photoLabels={photoLabels}
      photoDescriptions={photoDescriptions}
      coverPhotoUrl={photoUrls[0]}
      onPhotoLabelsChange={onPhotoLabelsChange}
      onBack={onBack}
    />
  );
}

function AllPhotosManagerContent({
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
  const { t } = useTranslation('dashboard');
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
  }, [coverPhotoUrl, photoUrls]);

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
      await updateListingPhotoTour(listingId, photos, photoAssignments, descriptions, coverUrl !== savedCoverUrl ? coverUrl : undefined);
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
  useEffect(() => {
    if (isEditing || isBusy) return;
    const labels = photos.map(url => photoLabels[photoUrls.indexOf(url)] ?? 'Unassigned');
    const details = photos.map(url => photoDescriptions[photoUrls.indexOf(url)] ?? '');
    const same = (current: string[], next: string[]) => current.length === next.length && current.every((value, index) => value === next[index]);
    setPhotoAssignments(current => same(current, labels) ? current : labels);
    setDescriptions(current => same(current, details) ? current : details);
    setSavedDescriptions(current => same(current, details) ? current : details);
  }, [isEditing, isBusy, photos, photoUrls, photoLabels, photoDescriptions]);
  const hasPendingChanges = coverUrl !== savedCoverUrl ||
    descriptions.some((description, index) => description !== (savedDescriptions[index] ?? ''));
  const unassignedCount = photoAssignments.filter((label) => label === 'Unassigned').length;
  const allSelected = photos.length > 0 && selectedCount === photos.length;
  const destinations = [
    ...existingDestinations.map((label) => ({ label, imageUrl: photoTourIllustration(label), existing: true })),
    ...photoTourRoomDestinations.filter(({ label }) => !existingDestinations.includes(label)).map((room) => ({ ...room, existing: false }))
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="relative flex min-h-[calc(100dvh-96px)] flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[var(--color-text-primary)]"
    >
      <div className="mx-auto w-full max-w-[1280px] flex-1 px-5 pb-36 pt-6 sm:px-10 sm:pt-8 lg:px-16">
        {!isEditing && <nav aria-label="Photo tour navigation" className="flex flex-wrap items-start justify-between gap-3">
          <BackButton
            onClick={onBack}
            disabled={isBusy}
            variant="plain"
            label={t('allPhotosNavigation.backToTour')}
          />
          <div className="flex items-center gap-3">
              <IconButton
                onClick={() => setIsUploadDialogOpen(true)}
                variant="plain"
                label={t('photoTour.addPhotos')}
                icon={<Plus className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />}
              />
              <button
                type="button"
                disabled={photos.length === 0 && !isManagingPhotos}
                onClick={isManagingPhotos ? closePhotoSelection : openPhotoSelection}
                className={photoActionClass}
              >
                {t(isManagingPhotos ? 'allPhotosNavigation.done' : 'allPhotosNavigation.manage')}
              </button>
          </div>
        </nav>}

        {isEditing && selectedPhotoUrl && selectedPhotoIndex !== null ? (
          <ListingPhotoDetails
            photoUrl={selectedPhotoUrl}
            description={selectedPhotoDescription}
            room={photoAssignments[selectedPhotoIndex] || 'Unassigned'}
            isCover={coverUrl === selectedPhotoUrl}
            busy={isBusy}
            hasPendingChanges={hasPendingChanges}
            onClose={closePhotoEditor}
            onMakeCover={() => setCoverUrl(selectedPhotoUrl)}
            onRemove={() => setIsTrashDialogOpen(true)}
            onMove={openMoveDialogForPhoto}
            onDescriptionChange={(value) => setDescriptions(current => current.map((description, index) => index === selectedPhotoIndex ? value : description))}
          />
        ) : (
          <>
            <header className="mb-8 mt-9 flex flex-wrap items-end justify-between gap-5 sm:mt-12">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All photos</h1>
              </div>
            </header>
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
                      {isManagingPhotos && <span className={`absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-sm ${isSelected ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]' : 'bg-black/25'}`}>{isSelected && <Check className="h-4 w-4 stroke-[1.5]" aria-hidden="true" />}</span>}
                    </span>
                    <span className="mt-3 flex items-baseline justify-between gap-2 px-0.5"><span className="truncate text-sm font-medium">{room}</span><span className="text-xs text-[var(--color-text-secondary)]">{index + 1}</span></span>
                  </button>
                );
              })}
              {photos.length === 0 && (
                <div className="col-span-full flex min-h-80 flex-col items-center justify-center rounded-card border border-dashed border-[var(--color-border)] px-6 text-center">
                  <Image className="mb-5 h-10 w-10 text-[var(--color-text-secondary)]" aria-hidden="true" />
                  <h2 className="text-xl font-semibold">Your space starts here</h2>
                  <p className="mb-6 mt-2 text-sm text-[var(--color-text-secondary)]">Add photos to bring your listing to life.</p>
                  <button type="button" onClick={() => setIsUploadDialogOpen(true)} className={photoPrimaryClass}><Plus className="h-4 w-4" aria-hidden="true" /> Add photos</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {((isEditing && hasPendingChanges) || isManagingPhotos) && (
        <footer className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-20 md:bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-10">
          <div className="mx-auto flex max-w-[1152px] flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm font-medium">{isEditing ? t(hasPendingChanges ? 'photoDetails.unsaved' : 'photoDetails.saved') : `${selectedCount} selected`}</p>
            <div className="flex items-center gap-3">
              {isEditing ? <>
                <button type="button" onClick={closePhotoEditor} disabled={isBusy} className={photoActionClass}>{t('editorSheet.cancel')}</button>
                <button type="button" onClick={() => void saveSelectedPhoto()} disabled={!hasPendingChanges || isBusy} className={photoPrimaryClass}>{t(isSavingPhoto ? 'editorSheet.saving' : 'editorSheet.save')}</button>
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
                  {imageUrl && !failedDestinationImages.has(imageUrl) ? <ShimmerImage src={imageUrl} alt="" loading="lazy" onError={() => setFailedDestinationImages((current) => new Set(current).add(imageUrl))} className="h-full w-full object-contain p-[12%]" /> : <Image className="h-9 w-9 text-[var(--color-text-secondary)]" aria-hidden="true" />}
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
