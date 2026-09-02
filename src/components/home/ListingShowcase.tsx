import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShimmerImage } from '@/components/ui/ShimmerImage';

type ShowcaseImage = {
  alt: string;
  src: string;
};

const showcaseImages: ShowcaseImage[] = [
  {
    alt: 'Chambre lumineuse avec linge de lit rose et décor floral doux',
    src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80'
  },
  {
    alt: 'Table de repas soignée avec fleurs et verrerie',
    src: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1200&q=80'
  },
  {
    alt: 'Chambre avec armoire miroir et tons blush',
    src: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
  },
  {
    alt: 'Coin bureau chaleureux avec ordinateur portable et fleurs',
    src: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
  }
];

function shuffleImages(items: ShowcaseImage[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function PhotoTile({
  alt,
  className,
  src
}: ShowcaseImage & { className: string }) {
  return (
    <div className={`group relative overflow-hidden bg-slate-100 ${className}`}>
      <ShimmerImage
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        src={src}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 opacity-80" />
    </div>
  );
}

function SwapView({ images }: { images: ShowcaseImage[] }) {
  const [visibleImages, setVisibleImages] = useState(() => shuffleImages(images));

  useEffect(() => {
    setVisibleImages(shuffleImages(images));

    const intervalId = window.setInterval(() => {
      setVisibleImages(shuffleImages(images));
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [images]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="grid gap-3 max-[619px]:gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr]"
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <PhotoTile
        alt={visibleImages[0].alt}
        className="aspect-[4/3] min-h-[198px] rounded-sm sm:aspect-auto sm:min-h-[288.2px] lg:h-[420.2px]"
        src={visibleImages[0].src}
      />

      <div className="grid gap-3 max-[619px]:grid-cols-2 max-[619px]:gap-2 sm:grid-cols-2 lg:grid-rows-2">
        {visibleImages.slice(1).map((image) => (
          <PhotoTile
            key={`${image.alt}-${image.src}`}
            alt={image.alt}
            className="aspect-[4/3] min-h-[118.8px] rounded-sm sm:aspect-auto lg:h-full"
            src={image.src}
          />
        ))}

        <button
          type="button"
          className="group relative min-h-[118.8px] overflow-hidden rounded-md border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] sm:aspect-auto"
        >
          <ShimmerImage
            alt="Coin de la pièce avec un ordinateur portable et des fleurs"
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent" />
          <span className="absolute bottom-4 right-4 inline-flex min-h-9 items-center gap-2 rounded-sm bg-white px-4 py-2 text-xs font-semibold text-gray-900 shadow-[var(--shadow-sm)] transition group-hover:translate-y-[-1px]">
            <span className="grid h-5 w-5 place-items-center rounded-sm bg-slate-100 text-gray-700">
              <span className="grid grid-cols-3 gap-0.5">
                <span className="h-1 w-1 rounded-sm bg-current" />
                <span className="h-1 w-1 rounded-sm bg-current" />
                <span className="h-1 w-1 rounded-sm bg-current" />
                <span className="h-1 w-1 rounded-sm bg-current" />
                <span className="h-1 w-1 rounded-sm bg-current" />
                <span className="h-1 w-1 rounded-sm bg-current" />
                <span className="h-1 w-1 rounded-sm bg-current" />
                <span className="h-1 w-1 rounded-sm bg-current" />
                <span className="h-1 w-1 rounded-sm bg-current" />
              </span>
            </span>
            Voir toutes les photos
          </span>
        </button>
      </div>
    </motion.div>
  );
}

export function ListingShowcase() {
  return (
    <section className="space-y-5">
      <div className="hidden overflow-hidden rounded-sm min-[620px]:block">
        <SwapView images={showcaseImages} />
      </div>
    </section>
  );
}

export default ListingShowcase;
