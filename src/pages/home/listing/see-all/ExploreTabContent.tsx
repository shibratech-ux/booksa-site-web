import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Heart, Star } from 'lucide-react';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { cn } from '@/utils/helpers';
import { formatCurrency } from '@/utils/formatters';
import {
  EXPLORE_CARD_IMAGE_HEIGHT,
  EXPLORE_CARD_WIDTH,
  EXPLORE_STAY_NIGHTS,
  type ExploreCard,
  type ExploreSection
} from './seeAllContent';

/**
 * Explore tab rails, matching the mobile reference at 360px wide. Type sizes reuse the Flutter
 * scale (lib/core/theme/app_typography.dart): title 18.4px, body 12.88px, caption 11.04px.
 */
const TEXT = {
  sectionTitle: 'text-[18.4px] leading-[1.25] font-semibold tracking-[-0.01em] text-[var(--color-text-primary)]',
  sectionSubtitle: 'text-[11.04px] leading-[1.4] text-[var(--color-text-secondary)]',
  cardTitle: 'text-[12.88px] leading-[1.25] font-semibold text-[var(--color-text-primary)]',
  cardMeta: 'text-[11.04px] leading-[1.4] font-medium text-[var(--color-text-secondary)]',
  badge: 'text-[11.04px] leading-none font-semibold text-[var(--color-text-primary)]'
} as const;

const RAIL_GAP = 12;
const PREVIEW_TICK_THROTTLE_MS = 220;
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;

type ExploreTabContentProps = {
  sections: ExploreSection[];
  onOpenMap: (sectionTitle?: string) => void;
};

export function ExploreTabContent({ sections, onOpenMap }: ExploreTabContentProps) {
  // The "See all" tiles replay their entrance while any rail scrolls (Flutter _SeeAllGridCard).
  const [previewTick, setPreviewTick] = useState(0);
  const lastTrigger = useRef(0);

  const handleRailScroll = () => {
    const now = Date.now();
    if (now - lastTrigger.current < PREVIEW_TICK_THROTTLE_MS) return;
    lastTrigger.current = now;
    setPreviewTick((tick) => tick + 1);
  };

  return (
    <div className="space-y-7 pb-6 pt-5">
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`explore-section-${section.id}`}>
          <SectionHeader section={section} onOpenMap={onOpenMap} />
          <div
            onScroll={handleRailScroll}
            className="mt-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Padding lives on an inner w-max row so the 16px end inset survives horizontal scrolling. */}
            <ul className="flex w-max px-4" style={{ gap: RAIL_GAP }}>
              {section.items.map((item) => (
                <li key={item.id} className="shrink-0" style={{ width: EXPLORE_CARD_WIDTH }}>
                  <StayCard item={item} />
                </li>
              ))}
              <li className="shrink-0">
                <SeeAllTile
                  imageUrls={section.items.slice(0, 3).map((item) => item.imageUrl)}
                  tick={previewTick}
                  onClick={() => onOpenMap(section.mapTitle)}
                />
              </li>
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}

function SectionHeader({ section, onOpenMap }: { section: ExploreSection; onOpenMap: (title?: string) => void }) {
  const { t } = useTranslation('navigation');
  const circle = 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-primary)]';
  const icon = <ArrowRight className="h-4 w-4" aria-hidden="true" />;

  return (
    <div className="flex items-start gap-3 px-4">
      <div className="min-w-0 flex-1">
        <h2 id={`explore-section-${section.id}`} className={cn(TEXT.sectionTitle, 'line-clamp-2')}>{section.title}</h2>
        {section.subtitle ? <p className={cn(TEXT.sectionSubtitle, 'mt-1')}>{section.subtitle}</p> : null}
      </div>
      {section.mapTitle ? (
        <button
          type="button"
          onClick={() => onOpenMap(section.mapTitle)}
          aria-label={`${t('seeAll')}: ${section.title}`}
          // 28px visual circle; the pseudo-element extends the hit area to 44px.
          className={cn(circle, 'relative mt-0.5 transition hover:brightness-95 before:absolute before:-inset-2 before:content-[""]')}
        >
          {icon}
        </button>
      ) : (
        <span className={cn(circle, 'mt-0.5')} aria-hidden="true">{icon}</span>
      )}
    </div>
  );
}

function StayCard({ item }: { item: ExploreCard }) {
  const { t, i18n } = useTranslation('booking');
  const price = item.priceUsd !== undefined
    ? `${formatCurrency(item.priceUsd, 'USD', i18n.language)} ${t('forNights', { count: EXPLORE_STAY_NIGHTS })}`
    : item.priceLabel ?? item.subtitle;

  return (
    <article>
      <ImageCard imageUrl={item.imageUrl} badge={item.badge} />
      <h3 className={cn(TEXT.cardTitle, 'mt-2 line-clamp-2')}>{item.title}</h3>
      {price || item.rating ? (
        <p className={cn(TEXT.cardMeta, 'mt-0.5 flex min-w-0 items-center gap-0.5')}>
          {price ? <span className="min-w-0 truncate">{price}</span> : null}
          {price && item.rating ? <span className="shrink-0" aria-hidden="true">·</span> : null}
          {item.rating ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap">
              <Star className="h-3 w-3 shrink-0 fill-current" aria-hidden="true" />
              <span>{item.rating}</span>
            </span>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}

function ImageCard({ imageUrl, badge }: { imageUrl: string; badge?: string }) {
  const { t } = useTranslation('navigation');
  const [isFavorite, setIsFavorite] = useState(false);
  const label = t(isFavorite ? 'removeFromFavorites' : 'addToFavorites');

  return (
    <div
      className="relative overflow-hidden rounded-card bg-[var(--color-surface-muted)]"
      style={{ width: EXPLORE_CARD_WIDTH, height: EXPLORE_CARD_IMAGE_HEIGHT }}
    >
      <ShimmerImage src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      {badge ? (
        <span className={cn(TEXT.badge, 'absolute left-3 top-3 rounded-full bg-[var(--color-surface)] px-2.5 py-1.5 shadow-[var(--shadow-xs)]')}>
          {badge}
        </span>
      ) : null}
      <button
        type="button"
        onClick={() => setIsFavorite((value) => !value)}
        aria-pressed={isFavorite}
        aria-label={label}
        title={label}
        className="absolute right-0.5 top-0.5 flex h-11 w-11 items-center justify-center"
      >
        <Heart
          aria-hidden="true"
         
          className={cn(
            'h-6 w-6 text-white drop-shadow-sm transition-colors stroke-[1.5]',
            isFavorite ? 'fill-[var(--color-primary-500)]' : 'fill-black/50'
          )}
        />
      </button>
    </div>
  );
}

/** Flutter _SeeAllGridCard: three tilted previews and a "See all" label, same size as a card image. */
const PREVIEW_SIZE = 51.129;
const PREVIEW_LAYOUT = [
  { left: PREVIEW_SIZE * 0.18, top: 0, rotate: -0.06 },
  { left: PREVIEW_SIZE * 0.76, top: PREVIEW_SIZE * 0.22, rotate: 0.05 },
  { left: 0, top: PREVIEW_SIZE * 0.46, rotate: -0.03 }
] as const;

function SeeAllTile({ imageUrls, tick, onClick }: { imageUrls: string[]; tick: number; onClick: () => void }) {
  const { t } = useTranslation('navigation');
  const reduceMotion = useReducedMotion();
  const enter = <T extends object>(from: T) => (reduceMotion ? false : from);

  return (
    <motion.button
      key={`see-all-${tick}`}
      type="button"
      onClick={onClick}
      initial={enter({ opacity: 0, y: EXPLORE_CARD_IMAGE_HEIGHT * 0.18, scale: 0.96 })}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        opacity: { duration: 0.32, ease: 'easeOut' },
        y: { duration: 0.42, ease: EASE_OUT_CUBIC },
        scale: { duration: 0.46, ease: 'backOut' }
      }}
      className="flex flex-col items-center rounded-card border border-[var(--color-border-subtle)] bg-[var(--color-surface)] pb-2.5 pt-3 shadow-[var(--shadow-sm)]"
      style={{ width: EXPLORE_CARD_WIDTH, height: EXPLORE_CARD_IMAGE_HEIGHT }}
    >
      <span className="flex w-full flex-1 items-center justify-center">
        <span className="relative block" style={{ width: PREVIEW_SIZE * 1.76, height: PREVIEW_SIZE * 1.46 }} aria-hidden="true">
          {imageUrls.map((imageUrl, index) => {
            const { left, top, rotate } = PREVIEW_LAYOUT[index];
            const delay = 0.12 + index * 0.09;
            return (
              <motion.span
                key={`${tick}-${imageUrl}`}
                initial={enter({ opacity: 0, y: PREVIEW_SIZE * 0.28, scale: 0.88 })}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  opacity: { delay, duration: 0.32, ease: 'easeOut' },
                  y: { delay, duration: 0.38, ease: EASE_OUT_CUBIC },
                  scale: { delay, duration: 0.38, ease: 'backOut' }
                }}
                className="absolute block"
                style={{ left, top }}
              >
                <span
                  className="block overflow-hidden rounded-[11px] border-2 border-[var(--color-surface)] bg-[var(--color-surface-muted)] shadow-[var(--shadow-sm)]"
                  style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, transform: `rotate(${rotate}rad)` }}
                >
                  <ShimmerImage src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                </span>
              </motion.span>
            );
          })}
        </span>
      </span>
      <span className={cn(TEXT.cardTitle, 'pb-1 pt-1 font-medium')}>{t('seeAll')}</span>
    </motion.button>
  );
}
