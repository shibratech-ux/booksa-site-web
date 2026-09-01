import type { FluentIcon } from '@fluentui/react-icons';
import { CameraRegular, ClockRegular, HeartRegular, LocationRegular, SparkleRegular, FoodRegular } from '@fluentui/react-icons';
import { formatCurrency } from '@/utils/formatters';

export type ServiceCard = {
  title: string;
  image: string;
  price: string;
  rating: string;
  minimum?: string;
  badge?: string;
};

export type ServiceSection = {
  title: string;
  cards: ServiceCard[];
};

export type ServiceDetail = {
  id: string;
  title: string;
  city: string;
  heroImage: string;
  hostAvatarImage: string;
  hostName: string;
  hostRole: string;
  description: string;
  price: string;
  rating: string;
  reviewCount: string;
  summary: string;
  highlights: { icon: FluentIcon; title: string; description: string }[];
  details: { title: string; description: string }[];
  contextTitle: string;
  contextDescription: string;
};

const UNSPLASH_IMAGE_QUERY = 'auto=format&fit=crop&w=1200&q=80';
const USD_TO_CDF_RATE = 2321;

function unsplashImage(photoId: string) {
  return `https://images.unsplash.com/${photoId}?${UNSPLASH_IMAGE_QUERY}`;
}

function formatCdfAmount(amount: number) {
  return formatCurrency(Math.round(amount), 'CDF');
}

function quarteredPriceLabel(amount: number) {
  const quarteredAmount = amount / 4;
  const cdfAmount = quarteredAmount * USD_TO_CDF_RATE;
  return `À partir de ${formatCdfAmount(cdfAmount)}`;
}

function quarteredMinimumLabel(amount: number) {
  const quarteredAmount = amount / 4;
  const cdfAmount = quarteredAmount * USD_TO_CDF_RATE;
  return `Minimum ${formatCdfAmount(cdfAmount)} pour réserver`;
}

export const serviceSections: ServiceSection[] = [
  {
    title: 'Culinaire à Kinshasa',
    cards: [
      {
        title: 'Photos cinématographiques à Kinshasa avec Shithila',
        image: unsplashImage('photo-1504674900247-0877df9cc836'),
        price: quarteredPriceLabel(55),
        rating: '4.99'
      },
      {
        title: 'Expérience photo emblématique à Kinshasa',
        image: unsplashImage('photo-1498837167922-ddd27525d352'),
        price: quarteredPriceLabel(46),
        rating: '4.98',
        minimum: quarteredMinimumLabel(137)
      },
      {
        title: 'Photo et vidéo sur mesure à Kinshasa par Thai - promo d’été',
        image: unsplashImage('photo-1551218808-94e220e084d2'),
        price: quarteredPriceLabel(46),
        rating: '4.99'
      },
      {
        title: 'Séances photo à la tour Eiffel avec Picster !',
        image: unsplashImage('photo-1490645935967-10de6ba17061'),
        price: quarteredPriceLabel(68),
        rating: '4.91'
      },
      {
        title: 'Massages, hammam et gommages avec Mon Mas Sage',
        image: unsplashImage('photo-1547592180-85f173990554'),
        price: quarteredPriceLabel(58),
        rating: '4.98'
      },
      {
        title: 'Expérience photo à Kinshasa',
        image: unsplashImage('photo-1447078806655-40579c2520d6'),
        price: quarteredPriceLabel(52),
        rating: '4.99'
      },
      {
        title: 'Séance photo - vivre à la Kinshasaienne',
        image: unsplashImage('photo-1512058564366-18510be2db19'),
        price: quarteredPriceLabel(69),
        rating: '4.99',
        minimum: quarteredMinimumLabel(86)
      }
    ]
  },
  {
    title: 'Culinaire à Londres',
    cards: [
      {
        title: 'Massage relaxant et remise à zéro profonde',
        image: unsplashImage('photo-1504674900247-0877df9cc836'),
        price: quarteredPriceLabel(42),
        rating: '4.96'
      },
      {
        title: 'Séance portrait dans un Londres verdoyant',
        image: unsplashImage('photo-1498837167922-ddd27525d352'),
        price: quarteredPriceLabel(58),
        rating: '4.93'
      },
      {
        title: 'Séance urbaine narrative',
        image: unsplashImage('photo-1551218808-94e220e084d2'),
        price: quarteredPriceLabel(46),
        rating: '4.99',
        badge: 'Populaire'
      },
      {
        title: 'Mise en scène créative des portraits',
        image: unsplashImage('photo-1490645935967-10de6ba17061'),
        price: quarteredPriceLabel(71),
        rating: '5.0',
        badge: 'Populaire'
      },
      {
        title: 'Balade champêtre avec un photographe',
        image: unsplashImage('photo-1547592180-85f173990554'),
        price: quarteredPriceLabel(39),
        rating: '4.95'
      },
      {
        title: 'Séance classique dans une cabine téléphonique londonienne',
        image: unsplashImage('photo-1447078806655-40579c2520d6'),
        price: quarteredPriceLabel(54),
        rating: '4.94'
      },
      {
        title: 'Photos de couple au bord de la rivière',
        image: unsplashImage('photo-1512058564366-18510be2db19'),
        price: quarteredPriceLabel(61),
        rating: '4.97'
      }
    ]
  },
  {
    title: 'Culinaire à Rome',
    cards: [
      {
        title: 'Séance photo à Rome entre lieux emblématiques et trésors cachés',
        image: unsplashImage('photo-1504674900247-0877df9cc836'),
        price: quarteredPriceLabel(35),
        rating: '4.95'
      },
      {
        title: 'Séance photo cinématographique à Rome',
        image: unsplashImage('photo-1498837167922-ddd27525d352'),
        price: quarteredPriceLabel(46),
        rating: '4.99'
      },
      {
        title: 'Découvrez les séances photo à Rome avec Vahid',
        image: unsplashImage('photo-1551218808-94e220e084d2'),
        price: quarteredPriceLabel(46),
        rating: '4.96',
        minimum: quarteredMinimumLabel(57)
      },
      {
        title: 'Séance photo style éditorial au rendu cinéma',
        image: unsplashImage('photo-1490645935967-10de6ba17061'),
        price: quarteredPriceLabel(56),
        rating: '5.0'
      },
      {
        title: 'Créez des souvenirs durables à Rome',
        image: unsplashImage('photo-1547592180-85f173990554'),
        price: quarteredPriceLabel(29),
        rating: '4.95',
        minimum: quarteredMinimumLabel(34)
      },
      {
        title: 'Rome avec un photographe professionnel',
        image: unsplashImage('photo-1447078806655-40579c2520d6'),
        price: quarteredPriceLabel(35),
        rating: '4.95'
      },
      {
        title: 'Séance photo unique à Rome',
        image: unsplashImage('photo-1512058564366-18510be2db19'),
        price: quarteredPriceLabel(22),
        rating: '4.93'
      }
    ]
  },
  {
    title: 'Culinaire à Milan',
    cards: [
      {
        title: 'Photographie narrative avec Ethan',
        image: unsplashImage('photo-1504674900247-0877df9cc836'),
        price: quarteredPriceLabel(56),
        rating: '4.99',
        badge: 'Populaire'
      },
      {
        title: 'Séance photo privée à Milan',
        image: unsplashImage('photo-1498837167922-ddd27525d352'),
        price: quarteredPriceLabel(98),
        rating: '5.0'
      },
      {
        title: 'Massage complet du corps',
        image: unsplashImage('photo-1551218808-94e220e084d2'),
        price: quarteredPriceLabel(115),
        rating: '5.0',
        badge: 'Populaire'
      },
      {
        title: 'Terme De Montel : spa thermal et massages',
        image: unsplashImage('photo-1490645935967-10de6ba17061'),
        price: quarteredPriceLabel(91),
        rating: '5.0'
      },
      {
        title: 'Séance photo cinématographique à Milan',
        image: unsplashImage('photo-1547592180-85f173990554'),
        price: quarteredPriceLabel(56),
        rating: '5.0'
      },
      {
        title: 'Portraits narratifs avec Amir',
        image: unsplashImage('photo-1447078806655-40579c2520d6'),
        price: quarteredPriceLabel(23),
        rating: '5.0'
      },
      {
        title: 'Séance photo privée dans des lieux uniques',
        image: unsplashImage('photo-1512058564366-18510be2db19'),
        price: quarteredPriceLabel(68),
        rating: '4.94'
      }
    ]
  }
];

const serviceDetailData: Record<string, ServiceDetail> = {
  Kinshasa: {
    id: 'Kinshasa',
    title: 'Séance photo cinématographique à Milan',
    city: 'Milan, Italy',
    heroImage: unsplashImage('photo-1490645935967-10de6ba17061'),
    hostAvatarImage: unsplashImage('photo-1500648767791-00dcc994a43e'),
    hostName: 'Victor',
    hostRole: 'Photographe',
    description:
      'Photographe portrait à Milan créant des images élégantes et narratives pour les voyageurs solo, les couples et les séances en robe fluide, en mêlant arrière-plans emblématiques et instants naturels.',
    price: quarteredPriceLabel(56),
    rating: '5.0',
    reviewCount: '14 avis',
    summary: 'Sur place',
    highlights: [
      {
        icon: CameraRegular,
        title: '8 ans d’expérience',
        description: 'Je suis photographe professionnel, spécialisé dans le portrait et la photographie lifestyle.'
      },
      {
        icon: SparkleRegular,
        title: 'Moment fort de carrière',
        description: 'J’ai travaillé avec divers médias et photographié des voyageurs pour créer des images mémorables.'
      },
      {
        icon: HeartRegular,
        title: 'Favori des voyageurs',
        description: 'Apprécié pour sa qualité constante, sa direction soignée et son énergie chaleureuse sur le plateau.'
      }
    ],
    details: [
      {
        title: 'Portraits rapides',
        description: 'Durée : 30 minutes. Capturez vos moments à Milan lors d’une séance photo détendue.'
      },
      {
        title: 'Séance portrait prolongée',
        description: 'Durée : 1 heure. Explorez une séance portrait premium dans les lieux emblématiques de Milan.'
      },
      {
        title: 'Photographie en robe fluide',
        description: 'Durée : 1 heure. Plongez dans une séance photo de rêve à Milan avec des images en robe fluide.'
      }
    ],
    contextTitle: 'À savoir',
    contextDescription:
      'Les conditions pour les voyageurs, les remarques d’accessibilité, la politique d’annulation et les autres détails restent fixes à gauche de la page.'
  },
  london: {
    id: 'london',
    title: 'Expérience culinaire à Londres',
    city: 'London, England',
    heroImage: unsplashImage('photo-1498837167922-ddd27525d352'),
    hostAvatarImage: unsplashImage('photo-1438761681033-6461ffad8d80'),
    hostName: 'Amelia',
    hostRole: 'Chef et hôte',
    description:
      'Une expérience centrée sur la gastronomie, inspirée des pages de services Booksa. Goûtez, cuisinez et apprenez dans une cuisine chaleureuse avec un hôte local.',
    price: quarteredPriceLabel(71),
    rating: '4.9',
    reviewCount: '28 avis',
    summary: 'Dans une cuisine privée',
    highlights: [
      {
        icon: FoodRegular,
        title: 'Cuisine pratique',
        description: 'Apprenez lors d’une séance guidée avec préparation des ingrédients et dressage.'
      },
      {
        icon: ClockRegular,
        title: 'Durée flexible',
        description: 'Choisissez entre une dégustation plus courte ou un atelier culinaire plus immersif.'
      },
      {
        icon: LocationRegular,
        title: 'Emplacement central',
        description: 'L’expérience se déroule dans un cadre londonien calme et facile d’accès.'
      }
    ],
    details: [
      {
        title: 'Parcours gustatif',
        description: 'Une dégustation guidée avec hors-d’œuvre, boissons et ingrédients locaux.'
      },
      {
        title: 'Cuisiner ensemble',
        description: 'Préparez un repas complet dans une cuisine partagée, puis dégustez-le à table.'
      },
      {
        title: 'Apprendre le dressage',
        description: 'Terminez avec des conseils de présentation et une table prête à être photographiée.'
      }
    ],
    contextTitle: 'Ce que vous ferez',
    contextDescription:
      'La colonne de gauche reste fixe avec le résumé du service, tandis que la partie droite reflète le contexte sélectionné.'
  },
  rome: {
    id: 'rome',
    title: 'Atelier de pâtes à Rome',
    city: 'Rome, Italy',
    heroImage: unsplashImage('photo-1551218808-94e220e084d2'),
    hostAvatarImage: unsplashImage('photo-1544005313-94ddf0286df2'),
    hostName: 'Giulia',
    hostRole: 'Home cook',
    description:
      'Une session culinaire inspirée de Rome, présentée comme une fiche de service Booksa, avec une colonne gauche fixe et des cartes d’activités détaillées à droite.',
    price: quarteredPriceLabel(46),
    rating: '4.96',
    reviewCount: '19 avis',
    summary: 'Petits groupes bienvenus',
    highlights: [
      {
        icon: FoodRegular,
        title: 'Ingrédients frais',
        description: 'Cuisinez avec des ingrédients locaux et des techniques simples.'
      },
      {
        icon: SparkleRegular,
        title: 'Atmosphère authentique',
        description: 'Une cuisine romaine chaleureuse, avec une présentation simple et épurée.'
      },
      {
        icon: CameraRegular,
        title: 'Moments photogéniques',
        description: 'Le dressage, la préparation et le service sont pensés pour être superbes en photo.'
      }
    ],
    details: [
      {
        title: 'Départ au marché',
        description: 'Commencez par un aperçu rapide des ingrédients et une introduction façon marché.'
      },
      {
        title: 'Démonstration en cuisine',
        description: 'Observez l’hôte montrer les étapes clés avant de cuisiner ensemble.'
      },
      {
        title: 'Repas partagé',
        description: 'Installez-vous pour savourer les plats finis dans un cadre détendu.'
      }
    ],
    contextTitle: 'Contexte culinaire',
    contextDescription:
      'Cette mise en page garde la colonne de gauche fixe, comme dans la référence Booksa, tandis que la colonne de droite change selon le service sélectionné.'
  },
  milan: {
    id: 'milan',
    title: 'Séance dîner et stylisme à Milan',
    city: 'Milan, Italy',
    heroImage: unsplashImage('photo-1512058564366-18510be2db19'),
    hostAvatarImage: unsplashImage('photo-1494790108377-be9c29b29330'),
    hostName: 'Victor',
    hostRole: 'Photographe',
    description:
      'Une page de service soignée, au style éditorial, avec une colonne gauche fixe et un panneau droit qui peut afficher les avis, les qualifications, la carte et le portfolio.',
    price: quarteredPriceLabel(68),
    rating: '5.0',
    reviewCount: '14 avis',
    summary: 'Direction créative incluse',
    highlights: [
      {
        icon: CameraRegular,
        title: 'Photos éditoriales',
        description: 'Des images nettes et élégantes avec une narration visuelle forte.'
      },
      {
        icon: SparkleRegular,
        title: 'Parcours soigné',
        description: 'Le service est structuré pour être fluide, soigné et facile à réserver.'
      },
      {
        icon: LocationRegular,
        title: 'Parcours urbain',
        description: 'Les lieux de prise de vue sont centrés en ville pour un accès facile.'
      }
    ],
    details: [
      {
        title: 'Avis',
        description: 'Retours positifs des voyageurs avec une approche professionnelle axée sur la qualité.'
      },
      {
        title: 'Qualifications',
        description: 'L’expérience, la qualité du portfolio et la connaissance locale sont mises en avant ici.'
      },
      {
        title: 'Où vous irez',
        description: 'Une carte simple ou un résumé du lieu peut s’afficher à droite.'
      }
    ],
    contextTitle: 'Contexte éditorial',
    contextDescription:
      'La colonne de gauche reste fixe, tandis que la partie droite peut représenter différentes sections comme les avis, la carte ou le portfolio selon l’élément sélectionné.'
  }
};

export function getServiceSlugFromTitle(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes('Kinshasa')) {
    return 'Kinshasa';
  }

  if (normalized.includes('london')) {
    return 'london';
  }

  if (normalized.includes('rome')) {
    return 'rome';
  }

  return 'milan';
}

export function getServiceDetailBySlug(slug?: string) {
  if (!slug) {
    return serviceDetailData.milan;
  }

  return serviceDetailData[slug] ?? serviceDetailData.milan;
}
