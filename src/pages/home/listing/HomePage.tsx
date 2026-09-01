import {
  ArrowRightRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  HeartFilled,
  HeartRegular
} from '@fluentui/react-icons';
import { useRef, useState } from 'react';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import BooksaHeader from '@/components/layout/BooksaHeader';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { HOME_SECTION_TITLES } from '@/pages/home/homeSectionTitles';
import type { Listing } from './listing.types';
import { persistListingContext, persistSeeAllSectionTitle } from '@/utils/navigationPersistence';
import { ROUTES } from '@/utils/constants';

const popularHomes: Listing[] = [
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Chambre dans le 4e arrondissement',
    price: 'CDF 438,245',
    rating: '4.94'
  },
  {
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement dans le 15e arrondissement',
    price: 'CDF 1,227,086',
    rating: '5.0'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement dans le 14e arrondissement',
    price: 'CDF 1,445,085',
    rating: '5.0'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement dans le 3e arrondissement',
    price: 'CDF 1,717,021',
    rating: '4.98'
  },
  {
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement dans le 16e arrondissement',
    price: 'CDF 1,175,395',
    rating: '4.97'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement dans le 15e arrondissement',
    price: 'CDF 2,373,265',
    rating: '5.0'
  },
  {
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Loft dans le 9e arrondissement',
    price: 'CDF 1,034,220',
    rating: '4.91'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Studio dans le 5e arrondissement',
    price: 'CDF 882,410',
    rating: '4.96'
  },
  {
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement dans le 11e arrondissement',
    price: 'CDF 1,198,540',
    rating: '4.88'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement rooftop dans le 7e arrondissement',
    price: 'CDF 2,145,770',
    rating: '5.0'
  }
];

const hotelDeals: Listing[] = [
  {
    image:
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
    location: 'Hôtel Le Richemont',
    price: 'CDF 714,676',
    rating: '4.67'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Hotel de Sevigne',
    price: 'CDF 1,067,520',
    rating: '4.82'
  },
  {
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    location: 'Le 123 Elysees - Astotel',
    price: 'CDF 1,049,540',
    rating: '4.9'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    location: 'Hotel Europe Saint Severin',
    price: 'CDF 1,247,313',
    rating: '4.79'
  },
  {
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    location: 'Hôtel Du Flaneur',
    price: 'CDF 809,068',
    rating: '5.0'
  },
  {
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    location: 'Hôtel 7 Eiffel by Malone',
    price: 'CDF 925,933',
    rating: '4.8'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210f7?auto=format&fit=crop&w=1200&q=80',
    location: 'Maison Saint-Germain',
    price: 'CDF 1,314,220',
    rating: '4.91'
  },
  {
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    location: 'Hotel Bellecour Kinshasa',
    price: 'CDF 1,082,600',
    rating: '4.84'
  },
  {
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    location: 'Le Grand Marais',
    price: 'CDF 1,478,340',
    rating: '4.95'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
    location: 'Hôtel du Louvre Parc',
    price: 'CDF 1,742,900',
    rating: '5.0'
  }
];

const homesInJohannesburg: Listing[] = [
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement à Sandton',
    price: 'CDF 1,245,860',
    rating: '4.93'
  },
  {
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    location: 'Loft à Rosebank',
    price: 'CDF 1,004,220',
    rating: '4.87'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement à Maboneng',
    price: 'CDF 899,540',
    rating: '4.95'
  },
  {
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Studio à Melville',
    price: 'CDF 742,110',
    rating: '4.84'
  },
  {
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement à Bryanston',
    price: 'CDF 1,119,320',
    rating: '4.9'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    location: 'Maison de ville à Parkhurst',
    price: 'CDF 1,382,780',
    rating: '4.98'
  },
  {
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    location: 'Maison moderne à Houghton',
    price: 'CDF 1,554,600',
    rating: '4.92'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement design à Linden',
    price: 'CDF 1,087,430',
    rating: '4.97'
  },
  {
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    location: 'Penthouse à Killarney',
    price: 'CDF 2,014,770',
    rating: '4.96'
  },
  {
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    location: 'Maison familiale à Fourways',
    price: 'CDF 1,203,950',
    rating: '4.89'
  }
];

const homesInGoma: Listing[] = [
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement avec vue sur le lac à Goma',
    price: 'CDF 956,420',
    rating: '4.92'
  },
  {
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    location: 'Studio dans le centre-ville de Goma',
    price: 'CDF 724,100',
    rating: '4.83'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement près du lac Kivu',
    price: 'CDF 1,108,330',
    rating: '4.96'
  },
  {
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement moderne à Majengo',
    price: 'CDF 842,770',
    rating: '4.88'
  },
  {
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    location: 'Maison familiale à Katindo',
    price: 'CDF 1,274,500',
    rating: '4.9'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    location: 'Loft design à Ndosho',
    price: 'CDF 1,012,890',
    rating: '4.97'
  },
  {
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement calme à Himbi',
    price: 'CDF 903,450',
    rating: '4.86'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    location: 'Villa à Kyeshero',
    price: 'CDF 1,399,200',
    rating: '4.99'
  },
  {
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement cosy à Virunga',
    price: 'CDF 788,660',
    rating: '4.84'
  },
  {
    image:
      'https://images.unsplash.com/photo-1501117716987-c8e1ecb210f7?auto=format&fit=crop&w=1200&q=80',
    location: 'Penthouse dans le secteur de Gisenyi Road',
    price: 'CDF 1,621,840',
    rating: '4.95'
  }
];

const homeskigali: Listing[] = [
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement à Kacyiru',
    price: 'CDF 934,200',
    rating: '4.91'
  },
  {
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    location: 'Loft à Kimihurura',
    price: 'CDF 1,104,500',
    rating: '4.87'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement à Nyarutarama',
    price: 'CDF 1,276,300',
    rating: '4.96'
  },
  {
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    location: 'Studio à Remera',
    price: 'CDF 781,900',
    rating: '4.83'
  },
  {
    image:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement à Gacuriro',
    price: 'CDF 1,148,770',
    rating: '4.9'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    location: 'Maison de ville à Kanombe',
    price: 'CDF 1,365,800',
    rating: '4.98'
  },
  {
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    location: 'Maison moderne à Nyamirambo',
    price: 'CDF 1,212,400',
    rating: '4.92'
  },
  {
    badge: 'Favori des voyageurs',
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    location: 'Appartement design à Kibagabaga',
    price: 'CDF 1,093,600',
    rating: '4.97'
  },
  {
    image:
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    location: 'Penthouse à Kiyovu',
    price: 'CDF 2,018,900',
    rating: '4.95'
  },
  {
    image:
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    location: 'Maison familiale à Rebero',
    price: 'CDF 1,248,700',
    rating: '4.89'
  }
];

// Reusable card used for the horizontal property grids.
function ListingCard({ listing }: { listing: Listing }) {
  const listingId = encodeURIComponent(`${listing.location}-${listing.price}`);
  const detailPath = generatePath(ROUTES.listingDetail, { listingId });
  const [isSaved, setIsSaved] = useState(false);

  return (
    <article className="group relative w-[140px] shrink-0 snap-start sm:w-[194px] lg:w-[202px]">
      <Link
        to={detailPath}
        state={{ listing }}
        onClick={() => persistListingContext(listing)}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="relative aspect-[1.08/1] overflow-hidden rounded-[16px] bg-slate-100 ring-1 ring-black/5">
          <ShimmerImage
            src={listing.image}
            alt={listing.title ?? listing.location}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
          {listing.badge ? (
            <span className="absolute left-3 top-3 max-w-[calc(100%-3.75rem)] truncate rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
              {listing.badge}
            </span>
          ) : null}
        </div>

        <div className="px-0.5 pt-2">
          <h3 className="line-clamp-2 min-h-5 break-words text-[11px] font-semibold leading-[15px] text-slate-900 sm:text-[13.5px] sm:leading-[19px]">
            {listing.location}
          </h3>
          <div className="mt-1 flex flex-col gap-1 text-slate-500">
            <p className="leading-[9px]">
              <span className="text-sm font-medium">{listing.price}</span>{' '}
              <span className="text-[11px]">pour 2 nuits</span>
            </p>
            <p className="text-[11px] leading-[9px]">
              <span aria-hidden="true">★</span> {listing.rating}
            </p>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Enregistrer ${listing.title ?? listing.location}`}
        aria-pressed={isSaved}
        onClick={() => setIsSaved((saved) => !saved)}
        className="absolute right-2.5 top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] transition hover:scale-105"
      >
        {isSaved ? (
          <HeartFilled className="h-[22px] w-[22px] text-[var(--color-primary-500)]" />
        ) : (
          <HeartRegular className="h-[22px] w-[22px]" />
        )}
      </button>
    </article>
  );
}

function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  onPrevious,
  onNext
}: {
  title: string;
  subtitle?: string;
  onSeeAll: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <button type="button" onClick={onSeeAll} className="group flex min-w-0 items-center gap-1.5 text-left">
          <h2 className="truncate text-[15px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-[19px]">{title}</h2>
          <ArrowRightRegular className="hidden h-5 w-5 shrink-0 text-slate-700 transition group-hover:translate-x-0.5 sm:block" />
        </button>
        {subtitle ? <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-xs">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Défiler à gauche"
          onClick={onPrevious}
          className="hidden h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 sm:inline-flex"
        >
          <ChevronLeftRegular className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Défiler à droite"
          onClick={onNext}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-800 transition hover:bg-slate-200"
        >
          <ChevronRightRegular className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PropertyRail({
  title,
  subtitle,
  listings,
  sectionClassName,
  onSeeAll
}: {
  title: string;
  subtitle?: string;
  listings: Listing[];
  sectionClassName?: string;
  onSeeAll: (sectionTitle: string) => void;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (direction: -1 | 1) => {
    railRef.current?.scrollBy({
      left: direction * Math.min(railRef.current.clientWidth * 0.8, 840),
      behavior: 'smooth'
    });
  };

  return (
    <section className={`space-y-3 ${sectionClassName ?? ''}`}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        onSeeAll={() => onSeeAll(title)}
        onPrevious={() => scrollRail(-1)}
        onNext={() => scrollRail(1)}
      />

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] max-sm:-mx-4 max-sm:scroll-pl-4 max-sm:[&>*:first-child]:ml-4 max-sm:[&>*:last-child]:mr-4 [&::-webkit-scrollbar]:hidden"
      >
        {listings.map((listing) => (
          <ListingCard key={`${listing.location}-${listing.price}`} listing={listing} />
        ))}

        <button
          type="button"
          onClick={() => onSeeAll(title)}
          className="group flex aspect-[1.08/1] w-[140px] shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-gray-900 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] sm:w-[194px] lg:w-[202px]"
        >
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-300 text-gray-900 transition group-hover:bg-[var(--color-primary-500)] group-hover:text-white">
            <ArrowRightRegular className="h-5 w-5" />
          </div>
          <span className="mt-4 text-sm font-medium">Tout voir</span>
        </button>
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <BooksaHeader />

      <main className="mx-auto max-w-[1400px] space-y-8 overflow-hidden px-4 pb-24 pt-4 sm:space-y-9 sm:px-6 sm:py-8 lg:space-y-10 lg:px-8 lg:py-11">
        <PropertyRail
          title={HOME_SECTION_TITLES.popularHomesKinshasa}
          listings={popularHomes}
          onSeeAll={(sectionTitle) => {
            persistSeeAllSectionTitle(sectionTitle);
            navigate(ROUTES.seeAll, { state: { sectionTitle } });
          }}
        />

        <PropertyRail
          title={HOME_SECTION_TITLES.greatDealsHotels}
          subtitle="Profitez de crédits Booksa dans une sélection d'hôtels."
          listings={hotelDeals}
          onSeeAll={(sectionTitle) => {
            persistSeeAllSectionTitle(sectionTitle);
            navigate(ROUTES.seeAll, { state: { sectionTitle } });
          }}
        />

        <PropertyRail
          title={HOME_SECTION_TITLES.homesJohannesburg}
          listings={homesInJohannesburg}
          onSeeAll={(sectionTitle) => {
            persistSeeAllSectionTitle(sectionTitle);
            navigate(ROUTES.seeAll, { state: { sectionTitle } });
          }}
        />

        <PropertyRail
          title={HOME_SECTION_TITLES.homesKigali}
          listings={homeskigali}
          onSeeAll={(sectionTitle) => {
            persistSeeAllSectionTitle(sectionTitle);
            navigate(ROUTES.seeAll, { state: { sectionTitle } });
          }}
        />

        <PropertyRail
          title={HOME_SECTION_TITLES.homesGoma}
          listings={homesInGoma}
          onSeeAll={(sectionTitle) => {
            persistSeeAllSectionTitle(sectionTitle);
            navigate(ROUTES.seeAll, { state: { sectionTitle } });
          }}
        />
      </main>

      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
}
