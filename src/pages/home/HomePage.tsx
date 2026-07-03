import {
  ArrowRightRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  HeartRegular
} from '@fluentui/react-icons';
import { Link, generatePath, useNavigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import BooksaHeader from '@/components/layout/BooksaHeader';
import ListingShowcase from '@/components/home/ListingShowcase';
import { HOME_SECTION_TITLES } from '@/pages/home/homeSectionTitles';
import type { Listing } from '@/pages/home/listing.types';
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

  return (
    <article className="group relative w-[190px] shrink-0 snap-start cursor-pointer">
      <Link
        to={detailPath}
        state={{ listing }}
        onClick={() => persistListingContext(listing)}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div
          className="relative aspect-[20/18] overflow-hidden rounded-[22px] bg-slate-100 shadow-xl shadow-slate-400/40 ring-1 ring-black/5"
          style={{
            backgroundImage: `url(${listing.image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        >

        </div>

        <div className="space-y-1 px-1 pt-3">
          <h3 className="text-sm sm:text-[12px] font-medium leading-4 text-gray-900">{listing.location}</h3>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xs sm:text-[12px] font-medium sm:font-normal text-gray-500">{listing.price}</p>
            <p className="text-[11px] text-gray-500">
              ★ <span className="font-medium text-gray-500">{listing.rating}</span>
            </p>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Enregistrer ${listing.title ?? listing.location}`}
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/35"
      >
        <HeartRegular className="h-3.5 w-3.5" />
      </button>
    </article>
  );
}

function SectionHeader({
  title
}: {
  title: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">{title}</h2>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <button
          type="button"
          aria-label="Défiler à gauche"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <ChevronLeftRegular className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Défiler à droite"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <ChevronRightRegular className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function PropertyRail({
  title,
  listings,
  sectionClassName,
  onSeeAll
}: {
  title: string;
  listings: Listing[];
  sectionClassName?: string;
  onSeeAll: (sectionTitle: string) => void;
}) {
  return (
    <section className={`space-y-4 ${sectionClassName ?? ''}`}>
      <SectionHeader title={title} />

      <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-2">
        {listings.map((listing) => (
          <ListingCard key={`${listing.location}-${listing.price}`} listing={listing} />
        ))}

        <button
          type="button"
          onClick={() => onSeeAll(title)}
          className="group flex h-44 w-[190px] shrink-0 flex-col items-center justify-center rounded-[28px] border border-slate-200 bg-white text-gray-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-2xl aspect-[20/16]"
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
    <div className="min-h-screen bg-[var(--color-project-shell)]">
      <BooksaHeader />

      <main className="mx-auto max-w-[1500px] space-y-8 px-0 py-8 sm:space-y-12 sm:px-0 lg:px-8">
        <PropertyRail
          title={HOME_SECTION_TITLES.popularHomesKinshasa}
          listings={popularHomes}
          onSeeAll={(sectionTitle) => {
            persistSeeAllSectionTitle(sectionTitle);
            navigate(ROUTES.seeAll, { state: { sectionTitle } });
          }}
        />

        <ListingShowcase />

        <PropertyRail
          title={HOME_SECTION_TITLES.greatDealsHotels}
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

      <Footer />
    </div>
  );
}
