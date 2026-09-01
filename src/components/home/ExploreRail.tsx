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
    <article className="group relative w-[140px] shrink-0 snap-start sm:w-[194px] lg:w-[202px]">
      <Link
        to={card.href}
        state={card.state}
        onClick={card.onNavigate}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <div className="relative aspect-[1.08/1] overflow-hidden rounded-[16px] bg-slate-100 ring-1 ring-black/5">
          <ShimmerImage
            src={card.image}
            alt={card.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
          {card.badge ? (
            <span className="absolute left-3 top-3 max-w-[calc(100%-3.75rem)] truncate rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
              {card.badge}
            </span>
          ) : null}
        </div>

        <div className="px-0.5 pt-2">
          <h3 className="line-clamp-2 min-h-5 break-words text-[11px] font-semibold leading-[15px] text-slate-900 sm:text-[13.5px] sm:leading-[19px]">
            {card.title}
          </h3>
          {card.meta ? <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-xs">{card.meta}</p> : null}
          <div className="mt-1 flex flex-col gap-1 text-slate-500">
            <p className="leading-[14px]">
              <span className="text-sm font-medium">{card.price}</span>{' '}
              {card.priceSuffix ? <span className="text-[11px]">{card.priceSuffix}</span> : null}
            </p>
            {card.supportingText ? (
              <p className="text-[10px] leading-[14px]">{card.supportingText}</p>
            ) : null}
            {card.rating ? (
              <p className="text-[11px] leading-[12px]">
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

function SectionTitle({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const content = (
    <>
      <h2 className="truncate text-[15px] font-semibold tracking-[-0.025em] text-slate-900 sm:text-[19px]">
        {children}
      </h2>
      {onClick ? (
        <ArrowRightRegular className="hidden h-5 w-5 shrink-0 text-slate-700 transition group-hover:translate-x-0.5 sm:block" />
      ) : null}
    </>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className="group flex min-w-0 items-center gap-1.5 text-left">
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
          {subtitle ? <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:text-xs">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Défiler à gauche"
            onClick={() => scrollRail(-1)}
            className="hidden h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 sm:inline-flex"
          >
            <ChevronLeftRegular className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Défiler à droite"
            onClick={() => scrollRail(1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-800 transition hover:bg-slate-200"
          >
            <ChevronRightRegular className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] max-sm:-mx-4 max-sm:scroll-pl-4 max-sm:[&>*:first-child]:ml-4 max-sm:[&>*:last-child]:mr-4 [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <ExploreCard key={card.id} card={card} />
        ))}

        {onSeeAll ? (
          <button
            type="button"
            onClick={onSeeAll}
            className="group flex aspect-[1.08/1] w-[140px] shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-gray-900 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] sm:w-[194px] lg:w-[202px]"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-300 text-gray-900 transition group-hover:bg-[var(--color-primary-500)] group-hover:text-white">
              <ArrowRightRegular className="h-5 w-5" />
            </div>
            <span className="mt-4 text-sm font-medium">Tout voir</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
