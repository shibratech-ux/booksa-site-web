import {
  ArrowRightRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  HeartRegular,
  SparkleRegular
} from '@fluentui/react-icons';
import BooksaHeader from '@/components/layout/BooksaHeader';
import Footer from '@/components/layout/Footer';
import { useTheme } from '@/theme/useTheme';

type ExperienceCardData = {
  id: string;
  title: string;
  location: string;
  price: string;
  image: string;
  badge?: {
    label: string;
    tone?: 'neutral' | 'featured';
  };
  rating?: string;
};

type ExperienceRailProps = {
  title: string;
  subtitle?: string;
  cards: ExperienceCardData[];
};

const hotelRoomImages = [
  'https://unsplash.com/photos/p3UWyaujtQo/download?force=true',
  'https://unsplash.com/photos/a-bed-with-white-sheets-and-pillows-in-a-bedroom-pG-08dGwkAA/download?force=true',
  'https://unsplash.com/photos/JNvL0Z4MMDQ/download?force=true',
  'https://unsplash.com/photos/emqnSQwQQDo/download?force=true',
  'https://unsplash.com/photos/5BV56SdvLmo/download?force=true',
  'https://unsplash.com/photos/R5v8Xtc0ecg/download?force=true',
  'https://unsplash.com/photos/67-sOi7mVIk/download?force=true'
];

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickRandomHotelImage(seed: string) {
  return hotelRoomImages[hashString(seed) % hotelRoomImages.length];
}

type ExperienceCardSeed = Omit<ExperienceCardData, 'image'>;

const CDF_PER_USD = 2321;

function formatCdfPrice(amountUsd: number) {
  return `À partir de ${new Intl.NumberFormat('en-US').format(Math.round(amountUsd * CDF_PER_USD))} CDF / invité`;
}

function withHotelImage(card: ExperienceCardSeed, seedPrefix: string): ExperienceCardData {
  return {
    ...card,
    badge: card.badge
      ? {
          label: card.badge.label,
          tone: card.badge.tone
        }
      : undefined,
    image: pickRandomHotelImage(`${seedPrefix}:${card.id}`)
  };
}

const originalsCardsSeed = [
  {
    id: 'presnel',
    title: 'Jouez avec Presnel dans la Kimpembe Cup',
    location: 'Colombes, France',
    price: formatCdfPrice(69),
    rating: '5.0',
  },
  {
    id: 'triathlete',
    title: 'Nagez avec un triathlète pendant le Tour de France',
    location: 'Aix-les-Bains, France',
    price: formatCdfPrice(114),
  },
  {
    id: 'miami',
    title: 'Jouez un match avec des pros du football au Miami Stadium',
    location: 'Miami Gardens, États-Unis',
    price: formatCdfPrice(250),
  },
  {
    id: 'christen',
    title: 'Journée d’entraînement pour les jeunes avec la footballeuse Christen Press',
    location: 'Glendale, États-Unis',
    price: formatCdfPrice(150),
  },
  {
    id: 'wright',
    title: 'Journée d’entraînement pour les jeunes avec le footballeur Ian Wright',
    location: 'New York, États-Unis',
    price: formatCdfPrice(150),
  },
  {
    id: 'frenchie',
    title: 'Menu dégustation inspiré du Tour de France chez Frenchie',
    location: 'Kinshasa, France',
    price: formatCdfPrice(171),
  },
  {
    id: 'roommates',
    title: 'Assistez à l’enregistrement en direct de l’émission Roommates',
    location: 'PECK SLIP, États-Unis',
    price: 'Disponible le 24 juin',
  }
 ] satisfies ExperienceCardSeed[];

const originalsCards = originalsCardsSeed.map((card) => withHotelImage(card, 'originals'));

const KinshasaCardsSeed = [
  {
    id: 'seine',
    title: 'Croisière express sur la Seine au départ de la tour Eiffel',
    location: 'Kinshasa, France',
    price: formatCdfPrice(24),
    rating: '4.68',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  },
  {
    id: 'eiffel',
    title: 'Visite en ascenseur de la tour Eiffel jusqu’au sommet',
    location: 'Kinshasa, France',
    price: formatCdfPrice(84),
    rating: '4.63',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  },
  {
    id: 'craftsman',
    title: 'Sculptez la pierre Kinshasaienne avec un maître artisan',
    location: 'Kinshasa, France',
    price: formatCdfPrice(62),
    rating: '4.98',
    badge: {
      label: 'Original',
      tone: 'featured'
    },
  },
  {
    id: 'speakeasy',
    title: "Secrets de speakeasy : découvrez les bars cachés de Kinshasa",
    location: 'Kinshasa, France',
    price: formatCdfPrice(21),
    rating: '4.9',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  },
  {
    id: 'sketch',
    title: 'Croquez les Kinshasaiens avec un artiste de BD reconnu',
    location: 'Kinshasa, France',
    price: formatCdfPrice(55),
    rating: '4.97',
    badge: {
      label: 'Original',
      tone: 'featured'
    },
  },
  {
    id: 'sommelier',
    title: 'Tour de France œnologique avec un sommelier',
    location: 'Kinshasa, France',
    price: formatCdfPrice(79),
    rating: '4.97',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  },
  {
    id: 'disneyland',
    title: 'Disneyland Kinshasa : 1 jour, 2 parcs avec transport',
    location: 'Kinshasa, France',
    price: formatCdfPrice(148),
    rating: '4.73',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  }
 ] satisfies ExperienceCardSeed[];

const KinshasaCards = KinshasaCardsSeed.map((card) => withHotelImage(card, 'Kinshasa'));

const londonCardsSeed = [
  {
    id: 'eye',
    title: 'Vues express sur la Tamise depuis le London Eye',
    location: 'London, Royaume-Uni',
    price: formatCdfPrice(38),
    rating: '4.81',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  },
  {
    id: 'guards',
    title: 'Rencontrez les gardes historiques du palais de Buckingham',
    location: 'London, Royaume-Uni',
    price: formatCdfPrice(42),
    rating: '4.91',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  },
  {
    id: 'big-ben',
    title: 'Big Ben au coucher du soleil avec un conteur local',
    location: 'London, Royaume-Uni',
    price: formatCdfPrice(36),
    rating: '4.88',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  },
  {
    id: 'bus',
    title: 'Montez à bord d’un bus vintage à travers le centre-ville',
    location: 'London, Royaume-Uni',
    price: formatCdfPrice(29),
    rating: '4.79',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  },
  {
    id: 'palace',
    title: 'Tea time avec vue sur le palais de Kensington',
    location: 'London, Royaume-Uni',
    price: formatCdfPrice(57),
    rating: '4.86',
    badge: {
      label: 'Original',
      tone: 'featured'
    },
  },
  {
    id: 'flowers',
    title: 'Balade au marché aux fleurs avec un fleuriste local',
    location: 'London, Royaume-Uni',
    price: formatCdfPrice(33),
    rating: '4.94',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  },
  {
    id: 'river-night',
    title: 'Croisière du soir sur la Tamise et dîner avec vue sur les gratte-ciel',
    location: 'London, Royaume-Uni',
    price: formatCdfPrice(96),
    rating: '4.84',
    badge: {
      label: 'Populaire',
      tone: 'neutral'
    },
  }
 ] satisfies ExperienceCardSeed[];

const londonCards = londonCardsSeed.map((card) => withHotelImage(card, 'london'));



function RailButton({ direction }: { direction: 'left' | 'right' }) {
  const Icon = direction === 'left' ? ChevronLeftRegular : ChevronRightRegular;

  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Défiler à gauche' : 'Défiler à droite'}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-gray-900 transition ${
        direction === 'left'
          ? 'border-slate-200 bg-white text-gray-300'
          : 'border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function ExperienceCard({ card }: { card: ExperienceCardData }) {
  const badgeClassName =
    card.badge?.tone === 'featured'
      ? 'bg-[rgba(255,247,235,0.96)] text-gray-900'
      : 'bg-white/95 text-gray-900';

  return (
    <article className="group relative w-[190px] shrink-0 snap-start cursor-pointer px-2">
      <div className="relative  aspect-[20/18] overflow-hidden rounded-[22px] bg-slate-100 shadow-[0_10px_26px_rgba(15,23,42,0.08)] cursor-pointer">
        <img
          src={card.image}
          alt={card.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />

        {card.badge ? (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${badgeClassName}`}
          >
            {card.badge.tone === 'featured' ? <SparkleRegular className="mr-1 h-3 w-3" aria-hidden="true" /> : null}
            {card.badge.label}
          </span>
        ) : null}

        <button
          type="button"
          aria-label={`Enregistrer ${card.title}`}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/15 text-white backdrop-blur-sm transition hover:bg-black/30"
        >
          <HeartRegular className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1 pt-3">
        <h3 className="text-[12px] font-medium leading-5">{card.title}</h3>
        <p className="mt-0.5 text-xs text-gray-500">{card.location}</p>

        <div className="text-[11px] text-gray-500">
          <span>{card.price}</span>
          {card.rating ? (
            <p>
              ★ <span className="font-medium text-gray-700">{card.rating}</span>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ExperienceRail({ title, subtitle, cards }: ExperienceRailProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 px-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-semibold tracking-tight text-gray-900 sm:text-[18px]">{title}</h2>
          </div>
          {subtitle ? <p className="mt-1 text-[13px] text-gray-600">{subtitle}</p> : null}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <RailButton direction="left" />
          <RailButton direction="right" />
        </div>
      </div>

      <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((card) => (
          <ExperienceCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}

export default function ExperiencesPage() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      <BooksaHeader />

      <main className="mx-auto max-w-[1500px] px-0 pb-12 pt-6 sm:px-0 lg:px-8 lg:pt-8">
        <section className="space-y-10">
          <ExperienceRail
            title="Booksa Originals"
            subtitle="Animé par les personnes les plus intéressantes du monde"
            cards={originalsCards}
          />

          <div className="space-y-8 px-3 pt-2">
            <h1 className="max-w-4xl text-[21px] font-medium tracking-tight sm:text-[18px] lg:text-[24px]">
              Populaire auprès des voyageurs de votre région
            </h1>

            <ExperienceRail title="Expériences à Kinshasa" cards={KinshasaCards} />
            <ExperienceRail title="Expériences à Londres" cards={londonCards} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
