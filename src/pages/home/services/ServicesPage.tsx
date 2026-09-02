import { generatePath } from 'react-router-dom';
import { ExploreRail, type ExploreCardData } from '@/components/home/ExploreRail';
import BooksaHeader from '@/components/layout/BooksaHeader';
import Footer from '@/components/layout/Footer';
import { ROUTES } from '@/utils/constants';
import { getServiceSlugFromTitle, serviceSections, type ServiceCard } from './serviceData';

function toExploreCard(card: ServiceCard): ExploreCardData {
  return {
    id: getServiceSlugFromTitle(card.title),
    image: card.image,
    title: card.title,
    href: generatePath(ROUTES.serviceDetail, {
      serviceId: getServiceSlugFromTitle(card.title)
    }),
    badge: card.badge,
    price: card.price,
    supportingText: card.minimum,
    rating: card.rating
  };
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-gray-900">
      <BooksaHeader />

      <main className="marketplace-reference-container mx-auto space-y-8 overflow-hidden px-4 pb-16 pt-4 sm:space-y-9 sm:px-6 sm:py-8 lg:space-y-10 lg:px-0 lg:py-11">
        {serviceSections.map((section) => (
          <ExploreRail
            key={section.title}
            title={section.title}
            cards={section.cards.map(toExploreCard)}
          />
        ))}
      </main>

      <Footer />
    </div>
  );
}
