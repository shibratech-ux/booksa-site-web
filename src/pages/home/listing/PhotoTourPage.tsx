import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Share } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { EmptyState } from '@/components/common/EmptyState';
import { BackButton } from '@/components/ui/BackButton';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import type { Listing } from './listing.types';
import { ROUTES } from '@/utils/constants';
import {
  readPersistedListingContext,
  readPersistedPhotoTourContext
} from '@/utils/navigationPersistence';

type PhotoTourState = {
  listing?: Listing;
};

type PhotoTourSection = {
  id: string;
  images: string[];
  label: string;
};


const sectionMeta = [
  { id: 'living-room', labelKey: 'photoTourPage.rooms.livingRoom', imageCount: 1 },
  { id: 'kitchen', labelKey: 'photoTourPage.rooms.kitchen', imageCount: 3 },
  { id: 'bedroom', labelKey: 'photoTourPage.rooms.bedroom', imageCount: 4 },
  { id: 'bathroom', labelKey: 'photoTourPage.rooms.bathroom', imageCount: 5 },
  { id: 'balcony', labelKey: 'photoTourPage.rooms.balcony', imageCount: 6 },
  { id: 'gym', labelKey: 'photoTourPage.rooms.gym', imageCount: 3 },
  { id: 'exterior', labelKey: 'photoTourPage.rooms.exterior', imageCount: 4 },
  { id: 'pool', labelKey: 'photoTourPage.rooms.pool', imageCount: 1 }
] as const;

type BookingT = ReturnType<typeof useTranslation<'booking'>>['t'];

function buildSections(t: BookingT, listing?: Listing): PhotoTourSection[] {
  const sourceImages = [...new Set([
    ...(listing?.gallery?.length ? listing.gallery : []),
    listing?.image
  ].filter((url): url is string => typeof url === 'string' && url.trim().length > 0))];

  let sourceCursor = 0;

  const sections: PhotoTourSection[] = sectionMeta.flatMap((meta) => {
    const images = sourceImages.slice(sourceCursor, sourceCursor + meta.imageCount);
    sourceCursor += images.length;
    if (!images.length) return [];
    return [{
      id: meta.id,
      label: t(meta.labelKey),
      images
    }];
  });

  if (sourceCursor < sourceImages.length) {
    sections.push({
      id: 'additional',
      label: t('photoTourPage.additionalPhotos'),
      images: sourceImages.slice(sourceCursor)
    });
  }

  return sections;
}

function PhotoTourGallery({
  images,
  label,
  onImageClick
}: {
  images: string[];
  label: string;
  onImageClick: () => void;
}) {
  const galleryFrameClass =
    'h-full overflow-hidden rounded-photo bg-[var(--color-surface-muted)] shadow-[var(--shadow-md)]';

  if (images.length <= 1) {
    return (
      <div className={`${galleryFrameClass} lg:h-full`}>
        <button type="button" onClick={onImageClick} className="block w-full cursor-pointer">
          <ShimmerImage
            alt={label}
            className="h-auto min-h-[286px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:min-h-full lg:h-full lg:min-h-0"
            src={images[0]}
          />
        </button>
      </div>
    );
  }

  if (images.length === 3) {
    return (
      <div className={`${galleryFrameClass} grid gap-1.5 lg:h-full lg:grid-cols-[1.35fr_0.9fr]`}>
        <div className="min-h-0 lg:h-full">
          <button type="button" onClick={onImageClick} className="block h-full w-full cursor-pointer">
            <ShimmerImage alt={`${label} 1`} className="h-auto min-h-[286px] w-full object-cover sm:min-h-[462px] lg:h-full" src={images[0]} />
          </button>
        </div>
        <div className="grid gap-1.5 lg:h-full">
          {images.slice(1).map((image, index) => (
            <div key={`${image}-${index}`} className="min-h-0 lg:h-1/2">
              <button type="button" onClick={onImageClick} className="block h-full w-full cursor-pointer">
                <ShimmerImage alt={`${label} ${index + 2}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[229.9px] lg:h-full" src={image} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 4) {
    return (
      <div className={`${galleryFrameClass} grid gap-1.5 sm:grid-cols-2 lg:h-full`}>
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="min-h-0 lg:h-1/2">
            <button type="button" onClick={onImageClick} className="block h-full w-full cursor-pointer">
              <ShimmerImage alt={`${label} ${index + 1}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[264px] lg:h-full" src={image} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  if (images.length === 5) {
    return (
      <div className={`${galleryFrameClass} grid gap-1.5 lg:h-full lg:grid-cols-[1.08fr_0.92fr]`}>
        <div className="min-h-0 lg:h-full">
          <button type="button" onClick={onImageClick} className="block h-full w-full cursor-pointer">
            <ShimmerImage alt={`${label} 1`} className="h-auto min-h-[286px] w-full object-cover sm:min-h-[533.5px] lg:h-full" src={images[0]} />
          </button>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:h-full">
          {images.slice(1).map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`min-h-0 ${index === 3 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
            >
              <button type="button" onClick={onImageClick} className="block h-full w-full cursor-pointer">
                <ShimmerImage alt={`${label} ${index + 2}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[264px] lg:h-full" src={image} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (images.length >= 6) {
    return (
      <div className={`${galleryFrameClass} grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3 lg:h-full`}>
        {images.slice(0, 6).map((image, index) => (
          <div key={`${image}-${index}`} className="min-h-0 lg:h-1/2">
            <button type="button" onClick={onImageClick} className="block h-full w-full cursor-pointer">
              <ShimmerImage alt={`${label} ${index + 1}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[242px] lg:h-full" src={image} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${galleryFrameClass} grid gap-1.5 sm:grid-cols-2 lg:h-full`}>
      {images.map((image, index) => (
        <div key={`${image}-${index}`} className="min-h-0 lg:h-1/2">
          <button type="button" onClick={onImageClick} className="block h-full w-full cursor-pointer">
            <ShimmerImage alt={`${label} ${index + 1}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[264px] lg:h-full" src={image} />
          </button>
        </div>
      ))}
    </div>
  );
}

function PhotoLightbox({
  images,
  initialIndex,
  onClose,
  onShare
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  onShare: () => void;
}) {
  const { t } = useTranslation('booking');
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const container = mobileCarouselRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      left: container.clientWidth * currentIndex,
      behavior: 'auto'
    });
  }, [currentIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'ArrowLeft') {
        setCurrentIndex((current) => (current - 1 + images.length) % images.length);
      }

      if (event.key === 'ArrowRight') {
        setCurrentIndex((current) => (current + 1) % images.length);
      }

      if (event.key === 'Tab') {
        const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])
          .filter(button => button.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) event.preventDefault();
        else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [images.length, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  if (!images.length) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('photoTourPage.title')}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-black text-white outline-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex h-dvh flex-col">
        <div className="grid shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center px-3 pb-2 pt-[max(8px,env(safe-area-inset-top))] sm:px-6 sm:pt-4 lg:px-8">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10"
            aria-label={t('listingDetail.back')}
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
          </button>

          <div className="text-center text-sm font-medium tabular-nums" aria-live="polite">
            {currentIndex + 1} / {images.length}
          </div>
          <button
            type="button"
            onClick={onShare}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10"
            aria-label={t('listingDetail.share')}
          >
            <Share className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center pb-[env(safe-area-inset-bottom)] sm:px-10">
          <div
            ref={mobileCarouselRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden"
            onScroll={(event) => {
              const container = event.currentTarget;
              const nextIndex = Math.round(container.scrollLeft / container.clientWidth);
              setCurrentIndex(Math.min(images.length - 1, Math.max(0, nextIndex)));
            }}
          >
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="flex h-full w-full shrink-0 snap-center items-center justify-center">
                <ShimmerImage
                  src={image}
                  alt={t('photoTourPage.photoNumber', { index: index + 1, total: images.length })}
                  className="max-h-full w-auto max-w-full object-contain"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentIndex((current) => (current - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 hidden h-10 max-sm:h-11 max-sm:w-11 w-10 cursor-pointer -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur-sm transition hover:bg-white/15 sm:inline-flex sm:left-6 sm:h-12 sm:w-12"
            aria-label={t('photoTourPage.previous')}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </button>

          <motion.img
            key={currentImage}
            src={currentImage}
            alt={t('photoTourPage.photoNumber', { index: currentIndex + 1, total: images.length })}
            className="hidden max-h-full w-auto max-w-[min(1040px,calc(100vw-120px))] object-contain sm:block"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />

          <button
            type="button"
            onClick={() => setCurrentIndex((current) => (current + 1) % images.length)}
            className="absolute right-2 top-1/2 hidden h-10 max-sm:h-11 max-sm:w-11 w-10 cursor-pointer -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur-sm transition hover:bg-white/15 sm:inline-flex sm:right-6 sm:h-12 sm:w-12"
            aria-label={t('photoTourPage.next')}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PhotoTourSectionCard({
  section,
  onActivate
}: {
  section: PhotoTourSection;
  onActivate: () => void;
}) {
  return (
    <motion.section
      id={section.id}
      className="grid gap-5 border-t border-[var(--color-border-subtle)] py-0 sm:pb-16 sm:pt-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-10 lg:pb-20 lg:pt-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="space-y-3 lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-lg">
          {section.label}
        </h2>
      </div>

      <motion.div
        className="group cursor-pointer lg:h-[462px]"
        onClick={onActivate}
        whileHover={{ scale: 1.005 }}
      >
        <PhotoTourGallery images={section.images} label={section.label} onImageClick={onActivate} />
      </motion.div>
    </motion.section>
  );
}

function PhotoTourMobileBoard({
  sections,
  onSectionActivate
}: {
  sections: PhotoTourSection[];
  onSectionActivate: (sectionId: string, imageIndex: number) => void;
}) {
  return (
    <div className="space-y-10 sm:hidden">
      {sections.map((section) => (
        <section key={section.id} id={`mobile-${section.id}`} className="scroll-mt-6">
          <h2 className="mb-5 px-5 text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">{section.label}</h2>
          <div className="grid grid-cols-2 gap-1.5">
            {section.images.map((image, index) => (
              <button
                key={`${section.id}-${image}-${index}`}
                type="button"
                onClick={() => onSectionActivate(section.id, index)}
                aria-label={`${section.label}, ${index + 1} / ${section.images.length}`}
                className={`block min-h-11 overflow-hidden bg-[var(--color-surface-muted)] ${section.images.length === 1 || (section.images.length % 2 === 1 && index === section.images.length - 1) ? 'col-span-2' : ''}`}
              >
                <ShimmerImage
                  alt=""
                  src={image}
                  className={`w-full object-cover ${section.images.length === 1 || (section.images.length % 2 === 1 && index === section.images.length - 1) ? 'aspect-[3/2]' : 'aspect-[3/4]'}`}
                />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function PhotoTourPage() {
  const { t } = useTranslation('booking');
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PhotoTourState | null;
  const listing =
    state?.listing ??
    readPersistedPhotoTourContext<PhotoTourState>()?.listing ??
    readPersistedListingContext<Listing>();
  const sections = useMemo(() => buildSections(t, listing ?? undefined), [listing, t]);
  const allImages = useMemo(() => sections.flatMap((section) => section.images), [sections]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightboxForSection = (sectionId: string, imageIndex: number) => {
    const sectionIndex = sections.findIndex(section => section.id === sectionId);
    if (sectionIndex < 0) return;
    const precedingPhotos = sections.slice(0, sectionIndex).reduce((count, section) => count + section.images.length, 0);
    setLightboxIndex(precedingPhotos + imageIndex);
  };

  const scrollToSection = (sectionId: string) => {
    const target = window.matchMedia('(max-width: 639px)').matches
      ? document.getElementById(`mobile-${sectionId}`)
      : sectionRefs.current[sectionId];
    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(ROUTES.home);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: listing?.title ?? t('photoTourPage.title'), url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success(t('listingDetail.linkCopied'));
      }
    } catch {
      // The share sheet was dismissed.
    }
  };

  if (location.pathname !== ROUTES.photoTour) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <div className="md:sticky md:top-0 md:z-30 md:bg-[var(--color-surface)]/95 md:backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-3 sm:px-8 sm:py-4 lg:px-14">
          <BackButton onClick={handleBack} label={t('listingDetail.back')} />
          <button
            type="button"
            onClick={() => void share()}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition hover:bg-[var(--color-surface-muted)]"
            aria-label={t('listingDetail.share')}
          >
            <Share className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] pb-16 pt-3 sm:px-8 sm:pb-20 sm:pt-8 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-5 px-5 sm:mb-8 sm:px-0"
        >
          <h1 className="text-xl font-semibold tracking-tight">
            {t('photoTourPage.title')}
          </h1>
          {listing?.title ? <p className="mt-2 hidden text-sm text-[var(--color-text-secondary)] sm:block">{listing.title}</p> : null}
        </motion.div>

        {sections.length === 0 ? (
          <div className="px-5 sm:px-0">
            <EmptyState title={t('photoTourPage.emptyTitle')} description={t('photoTourPage.emptyDescription')} />
          </div>
        ) : null}

        {sections.length > 0 ? <motion.div
          className="mb-12 grid grid-flow-col auto-cols-[142px] gap-3 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mb-10 sm:grid-cols-3 sm:auto-cols-auto sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-8"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.06
              }
            }
          }}
        >
          {sections.map((section) => (
            <motion.button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="group cursor-pointer text-left"
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="overflow-hidden rounded-card bg-[var(--color-surface-muted)]">
                <ShimmerImage
                  alt=""
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.04] sm:aspect-[4/3]"
                  src={section.images[0]}
                />
              </div>
              <p className="mt-1.5 text-xs text-[var(--color-text-primary)] sm:mt-2 sm:text-sm">{section.label}</p>
            </motion.button>
          ))}
        </motion.div> : null}

        <div className="sm:hidden">
          <PhotoTourMobileBoard sections={sections} onSectionActivate={openLightboxForSection} />
        </div>

        <div className="hidden flex-col gap-16 sm:flex">
          {sections.map((section) => (
            <div
              key={section.id}
              ref={(node) => {
                sectionRefs.current[section.id] = node;
              }}
            >
              <PhotoTourSectionCard
                section={section}
                onActivate={() => openLightboxForSection(section.id, 0)}
              />
            </div>
          ))}
        </div>
      </main>

      {lightboxIndex !== null ? (
        <PhotoLightbox
          images={allImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onShare={() => void share()}
        />
      ) : null}
    </div>
  );
}

export default PhotoTourPage;
