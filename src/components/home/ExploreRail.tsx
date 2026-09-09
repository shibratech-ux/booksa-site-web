import {
  ArrowRightRegular,
  ChevronLeftRegular,
  ChevronRightRegular,
  HeartFilled,
  HeartRegular
} from '@fluentui/react-icons';
import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { SeeAllCard } from '@/components/home/SeeAllCard';

export type ExploreCardData = {
  id: string;
  image: string;
  title: string;
  href: string;
  state?: unknown;
  badge?: string;
  meta?: string;
  price: string;
  priceSuffix?: string;
  supportingText?: string;
  rating?: string;
  onNavigate?: () => void;
};

function ExploreCard({ card }: { card: ExploreCardData }) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <article className="marketplace-reference-card group relative shrink-0 snap-start">
      <Link
        to={card.href}
        state={card.state}
        onClick={card.onNavigate}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="relative aspect-[1.04/1] overflow-hidden rounded-photo bg-slate-100 ring-1 ring-black/5">
          <ShimmerImage
            src={card.image}
            alt={card.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
          {card.badge ? (
            <span className="absolute left-3 top-3 max-w-[calc(100%-3.75rem)] truncate rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
              {card.badge}
            </span>
          ) : null}
        </div>

        <div className="px-0.5 pt-2">
          <h3 className="line-clamp-2 min-h-5 break-words text-[12px] font-semibold leading-[15px] text-slate-900 sm:text-[13px] sm:leading-[17px]">
            {card.title}
          </h3>
          {card.meta ? (
            <p className="mt-0.5 truncate text-[12px] font-semibold leading-[15px] text-slate-500">
              {card.meta}
            </p>
          ) : null}
          <div className="mt-1 flex flex-col gap-1 text-[12px] font-semibold leading-[15px] text-slate-500">
            <p>
              <span className="text-[var(--color-text-primary)]">{card.price}</span>{' '}
              {card.priceSuffix ? <span>{card.priceSuffix}</span> : null}
            </p>
            {card.supportingText ? (
              <p>{card.supportingText}</p>
            ) : null}
            {card.rating ? (
              <p>
                <span aria-hidden="true">★</span> {card.rating}
              </p>
            ) : null}
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={`Enregistrer ${card.title}`}
        aria-pressed={isSaved}
        onClick={() => setIsSaved((saved) => !saved)}
        className="absolute right-2.5 top-2.5 inline-flex h-11 w-11 items-center justify-center rounded-full text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)] transition hover:scale-105"
      >
        {isSaved ? (
          <HeartFilled className="h-6 w-6 text-[var(--color-primary-500)]" />
        ) : (
          <HeartRegular className="h-6 w-6" />
        )}
      </button>
    </article>
  );
}

function SectionTitle({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const content = (
    <>
      <h2 className="truncate text-[18px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-[20px]">
        {children}
      </h2>
      {onClick ? (
        <ArrowRightRegular className="hidden h-5 w-5 shrink-0 text-slate-700 transition group-hover:translate-x-0.5 sm:block" />
      ) : null}
    </>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className="group flex min-h-11 min-w-0 items-center gap-1.5 text-left sm:min-h-0">
      {content}
    </button>
  ) : (
    <div className="flex min-w-0 items-center gap-1.5">{content}</div>
  );
}

export function ExploreRail({
  title,
  subtitle,
  cards,
  onSeeAll,
  sectionClassName
}: {
  title: string;
  subtitle?: string;
  cards: ExploreCardData[];
  onSeeAll?: () => void;
  sectionClassName?: string;
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
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <SectionTitle onClick={onSeeAll}>{title}</SectionTitle>
          {subtitle ? <p className="mt-0.5 truncate text-[11.76px] text-slate-500 sm:text-[13px]">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Défiler à gauche"
            onClick={() => scrollRail(-1)}
            className="hidden h-8 max-sm:h-11 max-sm:w-11 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 sm:inline-flex"
          >
            <ChevronLeftRegular className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Défiler à droite"
            onClick={() => scrollRail(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full sm:h-8 max-sm:h-11 max-sm:w-11 sm:w-8 bg-slate-100 text-slate-800 transition hover:bg-slate-200"
          >
            <ChevronRightRegular className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-[12px] overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] max-sm:-mx-4 max-sm:scroll-pl-4 max-sm:[&>*:first-child]:ml-4 max-sm:[&>*:last-child]:mr-4 [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <ExploreCard key={card.id} card={card} />
        ))}

        {onSeeAll ? (
          <SeeAllCard
            title={title}
            images={cards.map((card) => card.image)}
            onClick={onSeeAll}
          />
        ) : null}
      </div>
    </section>
  );
}
