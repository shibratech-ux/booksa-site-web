import { motion } from 'framer-motion';
import {
  ArrowLeftRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  DismissRegular,
  HeartRegular,
  ShareRegular
} from '@fluentui/react-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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
  description: string;
  id: string;
  images: string[];
  label: string;
};

type TourImageGroups = Record<PhotoTourSection['id'], string[]>;

const defaultTourImages: TourImageGroups = {
  'living-room': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80'
  ],
  kitchen: [
    'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1556909172-8f7e5ad0d5f4?auto=format&fit=crop&w=1400&q=80'
  ],
  bedroom: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1505693416388-8c5c0d3c9d6b?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80'
  ],
  bathroom: [
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1564540586988-1f5d77f0b6e1?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80'
  ],
  balcony: [
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1502005229762-cf1b2da0a4f9?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80'
  ],
  gym: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1518609571773-39b7d303a87f?auto=format&fit=crop&w=1400&q=80'
  ],
  exterior: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80'
  ],
  pool: [
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1529307474719-3d0a417aaf8a?auto=format&fit=crop&w=1400&q=80'
  ]
};

const sharedFallbackTourImages = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80'
];

const sectionMeta = [
  {
    id: 'living-room',
    label: 'Salon',
    description: 'Climatisation · Connexion Ethernet · TV · Système audio',
    imageCount: 1
  },
  {
    id: 'kitchen',
    label: 'Cuisine équipée',
    description: 'Plaque de cuisson · Café · Machine à café · Essentiels de cuisine · Lave-vaisselle',
    imageCount: 3
  },
  {
    id: 'bedroom',
    label: 'Chambre',
    description: 'Lit king size · Climatisation · Linge de lit · Rideaux occultants',
    imageCount: 4
  },
  {
    id: 'bathroom',
    label: 'Salle de bain complète',
    description: 'Douche à l’italienne · Serviettes · Produits de nettoyage · Sèche-cheveux',
    imageCount: 5
  },
  {
    id: 'balcony',
    label: 'Balcon',
    description: 'Coin salon extérieur · Vue dégagée · Espace café du matin',
    imageCount: 6
  },
  {
    id: 'gym',
    label: 'Salle de sport',
    description: 'Appareils d’entraînement · Poids libres · Espace cardio',
    imageCount: 3
  },
  {
    id: 'exterior',
    label: 'Extérieur',
    description: 'Façade contemporaine avec accès facile et cheminements lumineux',
    imageCount: 4
  },
  {
    id: 'pool',
    label: 'Piscine',
    description: 'Accès à une piscine partagée avec transats et ambiance de resort',
    imageCount: 1
  }
] as const;

function buildSections(listing?: Listing): PhotoTourSection[] {
  const sourceImages = [
    ...(listing?.gallery?.length ? listing.gallery : []),
    listing?.image
  ].filter(Boolean) as string[];

  let sourceCursor = 0;
  let fallbackCursor = 0;

  return sectionMeta.map((meta) => {
    const sectionFallbacks = defaultTourImages[meta.id] ?? [];
    const pickedSourceImages = sourceImages.slice(sourceCursor, sourceCursor + meta.imageCount);
    sourceCursor += pickedSourceImages.length;

    const missingCount = Math.max(0, meta.imageCount - pickedSourceImages.length);
    const pickedSectionFallbacks = sectionFallbacks.slice(0, missingCount);
    const remainingCount = Math.max(0, meta.imageCount - pickedSourceImages.length - pickedSectionFallbacks.length);
    const pickedSharedFallbacks = sharedFallbackTourImages.slice(fallbackCursor, fallbackCursor + remainingCount);
    fallbackCursor += pickedSharedFallbacks.length;

    return {
      ...meta,
      images: [...pickedSourceImages, ...pickedSectionFallbacks, ...pickedSharedFallbacks]
    };
  });
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
    'h-full overflow-hidden rounded-sm bg-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-black/5';

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
            <ShimmerImage alt={`${label} vue principale`} className="h-auto min-h-[286px] w-full object-cover sm:min-h-[462px] lg:h-full" src={images[0]} />
          </button>
        </div>
        <div className="grid gap-1.5 lg:h-full">
          {images.slice(1).map((image, index) => (
            <div key={`${image}-${index}`} className="min-h-0 lg:h-1/2">
              <button type="button" onClick={onImageClick} className="block h-full w-full cursor-pointer">
                <ShimmerImage alt={`${label} détail ${index + 1}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[229.9px] lg:h-full" src={image} />
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
              <ShimmerImage alt={`${label} détail ${index + 1}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[264px] lg:h-full" src={image} />
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
            <ShimmerImage alt={`${label} vue principale`} className="h-auto min-h-[286px] w-full object-cover sm:min-h-[533.5px] lg:h-full" src={images[0]} />
          </button>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:h-full">
          {images.slice(1).map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`min-h-0 ${index === 3 ? 'sm:col-span-2 lg:col-span-2' : ''}`}
            >
              <button type="button" onClick={onImageClick} className="block h-full w-full cursor-pointer">
                <ShimmerImage alt={`${label} détail ${index + 1}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[264px] lg:h-full" src={image} />
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
              <ShimmerImage alt={`${label} détail ${index + 1}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[242px] lg:h-full" src={image} />
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
            <ShimmerImage alt={`${label} détail ${index + 1}`} className="h-auto min-h-[143px] w-full object-cover sm:min-h-[264px] lg:h-full" src={image} />
          </button>
        </div>
      ))}
    </div>
  );
}

function PhotoLightbox({
  images,
  initialIndex,
  onClose
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);

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
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [images.length, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!images.length) {
    return null;
  }

  const currentImage = images[currentIndex];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/95" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between px-3 py-3 text-white sm:px-6 sm:py-5 lg:px-8">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/15 sm:bg-transparent sm:px-2 sm:py-1 sm:backdrop-blur-0"
          >
            <DismissRegular className="h-5 w-5" />
            <span className="hidden sm:inline">Fermer</span>
          </button>

          <div className="rounded-sm bg-white/10 px-3 py-1.5 text-sm font-medium tabular-nums text-white/95 backdrop-blur-sm sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0">
            {currentIndex + 1} / {images.length}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/15"
              aria-label="Partager"
            >
              <ShareRegular className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-white/10 text-white transition hover:bg-white/15"
              aria-label="Enregistrer"
            >
              <HeartRegular className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center pb-6 pt-1 sm:px-10 sm:pb-8 sm:pt-2">
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
                  alt={`Photo ${index + 1}`}
                  className="max-h-[calc(100vh-148px)] w-auto max-w-full object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentIndex((current) => (current - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 hidden h-10 w-10 cursor-pointer -translate-y-1/2 items-center justify-center rounded-md border border-white/40 bg-black/45 text-white backdrop-blur-sm transition hover:bg-white/15 sm:inline-flex sm:left-6 sm:h-12 sm:w-12"
            aria-label="Image précédente"
          >
            <ChevronLeftRegular className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <motion.img
            key={currentImage}
            src={currentImage}
            alt={`Photo ${currentIndex + 1}`}
            className="hidden max-h-[calc(100vh-148px)] w-auto max-w-[min(1040px,calc(100vw-72px))] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:block sm:max-h-[calc(100vh-150px)] sm:max-w-[min(1040px,calc(100vw-120px))]"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />

          <button
            type="button"
            onClick={() => setCurrentIndex((current) => (current + 1) % images.length)}
            className="absolute right-2 top-1/2 hidden h-10 w-10 cursor-pointer -translate-y-1/2 items-center justify-center rounded-md border border-white/40 bg-black/45 text-white backdrop-blur-sm transition hover:bg-white/15 sm:inline-flex sm:right-6 sm:h-12 sm:w-12"
            aria-label="Image suivante"
          >
            <ChevronRightRegular className="h-5 w-5 sm:h-6 sm:w-6" />
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
      className="grid gap-5 border-t border-slate-200 py-0 sm:pb-16 sm:pt-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-10 lg:pb-20 lg:pt-12"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="space-y-3 lg:sticky lg:top-8 lg:self-start">
        <h2 className="text-[19.7568px] font-medium tracking-[-0.03em] text-gray-900 sm:text-[17.78112px]">
          {section.label}
        </h2>
        <p className="max-w-md text-[11.85408px] font-normal leading-5 text-gray-500 sm:text-[13.82976px] sm:leading-6">
          {section.description}
        </p>
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

function PhotoTourMobileCard({
  section,
  onActivate
}: {
  section: PhotoTourSection;
  onActivate: (imageUrl: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
  }, [section.id]);

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

  const currentImage = section.images[currentIndex] ?? section.images[0];
  const mobileCardHeight = ['h-52', 'h-40', 'h-60', 'h-44', 'h-56', 'h-48'][currentIndex % 6];

  return (
    <motion.button
      type="button"
      onClick={() => onActivate(currentImage)}
      className="group relative overflow-hidden rounded-md bg-slate-100 text-left ring-1 ring-black/5"
      whileTap={{ scale: 0.98 }}
    >
      <div
        ref={mobileCarouselRef}
        className={`flex w-full snap-x snap-mandatory overflow-x-auto scroll-smooth touch-pan-x ${mobileCardHeight} [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        onScroll={(event) => {
          const container = event.currentTarget;
          const nextIndex = Math.round(container.scrollLeft / container.clientWidth);
          setCurrentIndex(Math.min(section.images.length - 1, Math.max(0, nextIndex)));
        }}
      >
        {section.images.map((image, index) => (
          <div key={`${section.id}-${image}-${index}`} className="h-full w-full shrink-0 snap-center">
            <ShimmerImage alt={`${section.label} image ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" src={image} />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-[12.84192px] font-semibold leading-4 text-white">{section.label}</p>
        <p className="mt-1 line-clamp-2 text-[10.86624px] leading-4 text-white/80">{section.description}</p>
      </div>

      {section.images.length > 1 ? (
        <div className="absolute right-3 top-3 rounded-sm bg-black/45 px-2.5 py-1 text-[9.8784px] font-medium text-white backdrop-blur-sm">
          {currentIndex + 1}/{section.images.length}
        </div>
      ) : null}
    </motion.button>
  );
}

function PhotoTourMobileBoard({
  sections,
  onSectionActivate
}: {
  sections: PhotoTourSection[];
  onSectionActivate: (imageUrl: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:hidden">
      {sections.map((section) => (
        <PhotoTourMobileCard key={section.id} section={section} onActivate={onSectionActivate} />
      ))}
    </div>
  );
}

export function PhotoTourPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PhotoTourState | null;
  const listing =
    state?.listing ??
    readPersistedPhotoTourContext<PhotoTourState>()?.listing ??
    readPersistedListingContext<Listing>();
  const sections = useMemo(() => buildSections(listing ?? undefined), [listing]);
  const allImages = useMemo(() => sections.flatMap((section) => section.images), [sections]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightboxForImage = (imageUrl: string) => {
    const index = allImages.findIndex((image) => image === imageUrl);
    setLightboxIndex(index >= 0 ? index : 0);
  };

  const scrollToSection = (sectionId: string) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
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

  const galleryTitle = listing?.location ?? 'Visite photo';
  const subtitle = listing?.title ?? 'Un regard plus précis sur les espaces et les équipements';

  if (location.pathname !== ROUTES.photoTour) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="sticky top-0 z-30 border-b border-transparent bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1584px] items-center justify-between px-4 py-3 sm:px-8 sm:py-4 lg:px-14">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-gray-900 transition hover:bg-slate-100 sm:h-11 sm:w-11"
            aria-label="Retour"
          >
            <ArrowLeftRegular className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900 sm:gap-3">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition hover:bg-slate-100 sm:px-3"
            >
              <ShareRegular className="h-4 w-4" />
              <span className="hidden sm:inline">Partager</span>
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm transition hover:bg-slate-100 sm:px-3"
            >
              <HeartRegular className="h-4 w-4" />
              <span className="hidden sm:inline">Enregistrer</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1584px] px-4 pb-16 pt-4 sm:px-8 sm:pb-20 sm:pt-8 lg:px-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-5 sm:mb-8"
        >
          <h1 className="text-[19.7568px] font-medium tracking-[-0.04em] text-gray-900 sm:text-[21.73248px]">
            Visite photo
          </h1>
          <p className="mt-1 max-w-xl text-[11.85408px] leading-5 text-gray-500 sm:mt-3 sm:max-w-2xl sm:text-[12.84192px] sm:leading-4">
            {galleryTitle}
            <span className="mx-2 text-gray-300">•</span>
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          className="mb-8 grid grid-flow-col auto-cols-[101.2px] gap-2.5 overflow-x-auto pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mb-10 sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:auto-cols-auto lg:grid-cols-4 xl:grid-cols-8"
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
              <div className="overflow-hidden rounded-sm bg-slate-100 ring-1 ring-black/5">
                <ShimmerImage
                  alt={section.label}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  src={section.images[0]}
                />
              </div>
              <p className="mt-1.5 text-[10.86624px] font-normal text-gray-900 sm:mt-2 sm:text-[12.84192px]">{section.label}</p>
            </motion.button>
          ))}
        </motion.div>

        <div className="sm:hidden">
          <PhotoTourMobileBoard sections={sections} onSectionActivate={openLightboxForImage} />
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
                onActivate={() => openLightboxForImage(section.images[0])}
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
        />
      ) : null}
    </div>
  );
}

export default PhotoTourPage;
