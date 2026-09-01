import { generatePath } from 'react-router-dom';
import { ExploreRail, type ExploreCardData } from '@/components/home/ExploreRail';
import BooksaHeader from '@/components/layout/BooksaHeader';
import Footer from '@/components/layout/Footer';
import { ROUTES } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';

export type ExperienceCardData = {
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
  return `À partir de ${formatCurrency(Math.round(amountUsd * CDF_PER_USD), 'CDF')} / invité`;
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

export const experienceCards = [...originalsCards, ...KinshasaCards, ...londonCards];

export function getExperienceById(experienceId?: string) {
  if (!experienceId) {
    return undefined;
  }

  return experienceCards.find((card) => card.id === experienceId);
}



function toExploreCard(card: ExperienceCardData): ExploreCardData {
  return {
    id: card.id,
    image: card.image,
    title: card.title,
    href: generatePath(ROUTES.experienceDetail, { experienceId: card.id }),
    state: { experience: card },
    badge: card.badge?.label,
    meta: card.location,
    price: card.price,
    rating: card.rating
  };
}

function ExperienceRail({ title, subtitle, cards }: ExperienceRailProps) {
  return <ExploreRail title={title} subtitle={subtitle} cards={cards.map(toExploreCard)} />;
}

export default function ExperiencesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-gray-900">
      <BooksaHeader />

      <main className="mx-auto max-w-[1400px] overflow-hidden px-4 pb-16 pt-4 sm:px-6 sm:py-8 lg:px-8 lg:py-11">
        <section className="space-y-8 sm:space-y-9 lg:space-y-10">
          <ExperienceRail
            title="Booksa Originals"
            subtitle="Animé par les personnes les plus intéressantes du monde"
            cards={originalsCards}
          />

          <div className="space-y-8 pt-2 sm:space-y-9 lg:space-y-10">
            <h1 className="max-w-4xl text-[17.64px] font-medium tracking-tight sm:text-[15.12px] lg:text-[20.16px]">
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
