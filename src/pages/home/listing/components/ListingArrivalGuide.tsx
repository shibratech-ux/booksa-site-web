import type { Ref } from 'react';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HOUSE_RULE_IDS, type HouseRules } from '@/domain/listing';
import { formatArrivalTime, type CheckInOutTimes } from './ListingCheckInOutSheet';

const DETAIL_IDS = ['directions', 'checkInMethod', 'wifi', 'houseManual', 'checkoutInstructions', 'guidebooks', 'interaction'] as const;
export type ArrivalGuideSection = 'checkInOut' | (typeof DETAIL_IDS)[number];

export function ListingArrivalGuide({ guests, houseRules, cardClassName, selected, selectedCardRef, houseRulesButtonRef, onSelect, onOpenHouseRules, times, onOpenCheckInOut, directions, checkInMethodLabel, checkInMethodButtonRef }: {
  guests: number;
  /** Chosen method's title; shown instead of "Add details". */
  checkInMethodLabel?: string;
  checkInMethodButtonRef?: Ref<HTMLButtonElement>;
  times?: CheckInOutTimes;
  directions: string;
  onOpenCheckInOut: () => void;
  houseRules: HouseRules;
  cardClassName: string;
  selected: ArrivalGuideSection | null;
  selectedCardRef: Ref<HTMLButtonElement>;
  houseRulesButtonRef: Ref<HTMLButtonElement>;
  onSelect: (section: ArrivalGuideSection) => void;
  onOpenHouseRules: () => void;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const ruleCount = HOUSE_RULE_IDS.filter(id => houseRules[id] !== null).length;
  const renderCard = (id: (typeof DETAIL_IDS)[number]) => (
    <button key={id} type="button" ref={id === 'checkInMethod' && checkInMethodButtonRef ? checkInMethodButtonRef : selected === id ? selectedCardRef : undefined} onClick={() => onSelect(id)} aria-haspopup={id === 'directions' ? 'dialog' : undefined} className={`${cardClassName} min-h-24`} style={id === 'wifi' ? { backgroundColor: 'var(--color-surface-muted)' } : undefined}>
      <span className="block text-base font-semibold leading-6">{t(`arrivalGuide.sections.${id}`)}</span>
      <span className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
        {id === 'directions' && directions ? directions : id === 'checkInMethod' && checkInMethodLabel ? checkInMethodLabel : id === 'guidebooks' ? t('arrivalGuide.guidebookHelp') : t('arrivalGuide.addDetails')}
      </span>
    </button>
  );

  return (
    <>
      <button type="button" ref={selected === 'checkInOut' ? selectedCardRef : undefined} onClick={onOpenCheckInOut} aria-haspopup="dialog" className={cardClassName} aria-label={t('arrivalGuide.sections.checkInOut')}>
        <span className="grid grid-cols-2">
          <span className="border-r border-[var(--color-border-subtle)] pr-5">
            <span className="block text-base font-semibold leading-6">{t('arrivalGuide.checkIn')}</span>
            <span className="mt-1 block text-sm leading-6 text-[var(--color-text-secondary)]">{times ? formatArrivalTime(times.start, i18n.language) : t('arrivalGuide.addDetails')}</span>
          </span>
          <span className="pl-5 text-right">
            <span className="block text-base font-semibold leading-6">{t('arrivalGuide.checkout')}</span>
            <span className="mt-1 block text-sm leading-6 text-[var(--color-text-secondary)]">{times ? formatArrivalTime(times.checkout, i18n.language) : t('arrivalGuide.addDetails')}</span>
          </span>
        </span>
      </button>
      {DETAIL_IDS.slice(0, 4).map(renderCard)}
      <button type="button" ref={houseRulesButtonRef} onClick={onOpenHouseRules} className={cardClassName}>
        <span className="block text-base font-semibold leading-6">{t('houseRulesPage.heading')}</span>
        <span className="mt-5 flex items-center gap-3 text-sm leading-6">
          <Users className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
          {t('arrivalGuide.guestsMaximum', { count: guests })}
        </span>
        {ruleCount > 0 ? <span className="mt-5 block text-sm text-[var(--color-text-secondary)]">{t('arrivalGuide.more', { count: ruleCount })}</span> : null}
      </button>
      {DETAIL_IDS.slice(4).map(renderCard)}
    </>
  );
}

export function ArrivalGuideDetails({ section }: { section: ArrivalGuideSection | null }) {
  const { t } = useTranslation('dashboard');
  // TODO(design): replace these informational details as arrival editing flows become available.
  // TODO(team): agree on arrival-guide fields with Flutter before adding Firestore writes.
  return (
    <section aria-labelledby="arrival-guide-detail-heading">
      <h2 id="arrival-guide-detail-heading" className="text-2xl font-semibold tracking-tight">
        {section ? t(`arrivalGuide.sections.${section}`) : t('arrivalGuide.tab')}
      </h2>
      <p className="mt-3 max-w-lg text-base leading-7 text-[var(--color-text-secondary)]">
        {section ? t('arrivalGuide.unavailable') : t('arrivalGuide.intro')}
      </p>
    </section>
  );
}
