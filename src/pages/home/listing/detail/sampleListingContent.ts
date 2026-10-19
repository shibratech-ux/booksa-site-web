import { Droplets, Key, MessageCircle, type LucideIcon } from 'lucide-react';

// Demo content for the sample Explore cards only. Real (published) listings never use it.
// TODO(team): remove once guest listings, reviews and host profiles come from Firestore.

export type SampleReview = { name: string; meta: string; location: string; avatarUrl: string; text: string };
export type SampleHighlight = { icon: LucideIcon; title: string; description: string };

export const sampleGallery = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80'
];

export const sampleDescription =
  'Un séjour lumineux et raffiné, avec des finitions soignées, une arrivée simple et le calme nécessaire pour une courte escapade ou un séjour plus long.\n\n' +
  'Le logement se trouve dans un quartier calme, proche des commerces, des restaurants et des principaux axes de la ville. ' +
  'Idéal pour un couple, un voyage en solo ou un déplacement professionnel.';

export const sampleBasics = { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 };
export const sampleAmenityIds = ['wifi', 'tv', 'air-conditioning', 'kitchen', 'free-parking', 'washer', 'hot-water', 'essentials', 'smoke-alarm'];
export const sampleHost = { name: 'Pamela', reviews: 317, rating: '4.74', yearsHosting: 2, responseRate: 100 };
export const sampleReviewCount = 113;
export const sampleCancellation = 'Annulation gratuite jusqu’à 48 heures avant l’arrivée. Remboursement partiel ensuite.';

export const sampleHighlights: SampleHighlight[] = [
  { icon: Droplets, title: 'Plongez directement', description: 'C’est l’un des rares lieux du secteur avec piscine.' },
  { icon: Key, title: 'Arrivée simple et fluide', description: 'Les voyageurs récents ont adoré le démarrage fluide de ce séjour.' },
  { icon: MessageCircle, title: 'Communication exceptionnelle de l’hôte', description: 'Les voyageurs récents ont attribué 5 étoiles à Pamela pour sa communication.' }
];

export const sampleReviews: SampleReview[] = [
  {
    name: 'Angie', meta: 'Séjour de quelques nuits', location: 'Kinshasa, RD Congo',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    text: 'Propre, calme et très bien situé. La chambre était lumineuse et confortable, et l’arrivée s’est faite simplement.'
  },
  {
    name: 'Theresa', meta: 'Séjour de quelques nuits', location: 'Bruxelles, Belgique',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    text: 'Le séjour était soigné et agréable. L’hôte répondait rapidement, et le logement correspondait bien aux photos.'
  },
  {
    name: 'Maria J', meta: 'Séjour d’une nuit', location: 'Mexico, Mexique',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    text: 'Un lieu confortable à l’ambiance agréable. Très pratique pour découvrir la ville et se déplacer.'
  },
  {
    name: 'Amine', meta: 'Séjour de quelques nuits', location: 'Casablanca, Maroc',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    text: 'Service chaleureux, nuits calmes et espace propice à la détente après une longue journée.'
  }
];
