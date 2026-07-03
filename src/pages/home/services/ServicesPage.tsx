import { ChevronLeftRegular, ChevronRightRegular, HeartRegular } from '@fluentui/react-icons';
import { useRef } from 'react';
import { Link, generatePath } from 'react-router-dom';
import BooksaHeader from '@/components/layout/BooksaHeader';
import Footer from '@/components/layout/Footer';
import { ROUTES } from '@/utils/constants';
import { getServiceSlugFromTitle, serviceSections, type ServiceCard, type ServiceSection } from './serviceData';

function SectionControls({
  onPrevious,
  onNext
}: {
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Précédent"
        onClick={onPrevious}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 hover:text-gray-900"
      >
        <ChevronLeftRegular className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Suivant"
        onClick={onNext}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200 hover:text-gray-900"
      >
        <ChevronRightRegular className="h-5 w-5" />
      </button>
    </div>
  );
}

function ServiceCardView({ card }: { card: ServiceCard }) {
  const detailPath = generatePath(ROUTES.serviceDetail, {
    serviceId: getServiceSlugFromTitle(card.title)
  });

  return (
    <article className="group relative w-[190px] shrink-0 snap-start">
      <Link
        to={detailPath}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="relative aspect-[20/18] overflow-hidden rounded-[22px] bg-slate-100 shadow-lg shadow-slate-400/30 ring-1 ring-black/5 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-slate-400/35">
          <img
            src={card.image}
            alt={card.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </div>

        <div className="space-y-2 px-1 pt-3">
          <h3 className="line-clamp-2 text-[12px] font-medium leading-4 text-gray-900">{card.title}</h3>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11.5px] font-normal leading-4 text-gray-500">{card.price}</p>
              {card.minimum ? (
                <p className="mt-1 text-[11px] leading-4 text-gray-500">{card.minimum}</p>
              ) : null}
            </div>

            <div className="inline-flex shrink-0 flex-col items-center justify-center rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium leading-none text-gray-700">
              <span className="text-[10px] text-amber-500">★</span>
              <span className="mt-0.5">{card.rating}</span>
            </div>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Enregistrer ${card.title}`}
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/15 text-white backdrop-blur-sm transition hover:bg-black/30"
      >
        <HeartRegular className="h-4 w-4" />
      </button>
    </article>
  );
}

function ServiceRail({ section }: { section: ServiceSection }) {
  const railRef = useRef<HTMLDivElement | null>(null);

  function scrollRail(direction: 'previous' | 'next') {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    const distance = Math.max(rail.clientWidth * 0.86, 240);

    rail.scrollBy({
      left: direction === 'next' ? distance : -distance,
      behavior: 'smooth'
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 px-1">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">{section.title}</h2>
        <SectionControls
          onPrevious={() => scrollRail('previous')}
          onNext={() => scrollRail('next')}
        />
      </div>

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {section.cards.map((card) => (
          <ServiceCardView key={card.title} card={card} />
        ))}
      </div>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <BooksaHeader />

      <main className="mx-auto max-w-[1500px] space-y-8 px-4 py-8 sm:space-y-12 sm:px-6 lg:px-8">
        {serviceSections.map((section) => (
          <ServiceRail key={section.title} section={section} />
        ))}
      </main>

      <Footer />
    </div>
  );
}
