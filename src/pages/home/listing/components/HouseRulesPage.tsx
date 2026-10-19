import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Minus, Plus } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { HouseRuleToggle } from './HouseRuleToggle';
import { useTranslation } from 'react-i18next';
import {
  HOUSE_RULE_IDS,
  getListingGuestLimits,
  isValidListingGuestCount,
  type HouseRules
} from '@/domain/listing';
import { formatNumber } from '@/utils/formatters';

const roundButtonClass =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40';
const rowClass = 'flex min-h-22 items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] py-6';

export function HouseRulesPage({
  houseRules,
  guests,
  flowDraft,
  onBack,
  onSave
}: {
  houseRules: HouseRules;
  guests: number;
  flowDraft: unknown;
  onBack: () => void;
  onSave: (update: { houseRules: HouseRules; guests: number }) => Promise<void>;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const guestsLabelId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [rules, setRules] = useState(houseRules);
  const [guestCount, setGuestCount] = useState(guests);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savingRef = useRef(false);
  const limits = getListingGuestLimits(flowDraft);
  const isChanged = guestCount !== guests || HOUSE_RULE_IDS.some((id) => rules[id] !== houseRules[id]);
  const canSave = !isSaving && isChanged && isValidListingGuestCount(flowDraft, guestCount);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const leave = () => {
    if (!savingRef.current) onBack();
  };

  const changeGuests = (delta: number) => {
    if (!limits || savingRef.current) return;
    setGuestCount((current) => Math.min(limits.maximum, Math.max(limits.minimum, current + delta)));
    setSaveError(false);
  };

  const save = async () => {
    if (!canSave || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setSaveError(false);
    try {
      await onSave({ houseRules: rules, guests: guestCount });
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      aria-labelledby="house-rules-heading"
      className="relative flex min-h-[calc(100dvh-96px)] flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[var(--color-text-primary)]"
    >
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-5 sm:px-10 sm:pt-8 md:pb-10">
        <BackButton
          onClick={leave}
          disabled={isSaving}
          label={t('houseRulesPage.back')}
          variant="muted"
        />

        <h1 id="house-rules-heading" ref={headingRef} tabIndex={-1} className="mt-6 text-2xl font-semibold tracking-tight outline-none">
          {t('houseRulesPage.heading')}
        </h1>
        <p className="mt-2 text-base leading-snug text-[var(--color-text-secondary)]">
          {t('houseRulesPage.intro')}
        </p>

        <div className="mt-4">
          {HOUSE_RULE_IDS.map((rule) => (
            <HouseRuleToggle
              key={rule}
              rule={rule}
              value={rules[rule]}
              disabled={isSaving}
              onChange={(value) => {
                setRules((current) => ({ ...current, [rule]: value }));
                setSaveError(false);
              }}
            />
          ))}

          <div role="group" aria-labelledby={guestsLabelId} className={rowClass}>
            <div className="min-w-0">
              <p id={guestsLabelId} className="text-[0.93427425rem]">{t('guestCountSheet.heading')}</p>
              {!limits ? <p className="mt-1 text-[0.72665775rem] text-[var(--color-text-secondary)]">{t('guestCountSheet.unavailable')}</p> : null}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => changeGuests(-1)}
                disabled={isSaving || !limits || guestCount <= limits.minimum}
                aria-label={t('guestCountSheet.decrease')}
                className={`${roundButtonClass} bg-[var(--color-surface-muted)] hover:brightness-95`}
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <output aria-live="polite" className="min-w-6 text-center text-[0.93427425rem] tabular-nums">
                {formatNumber(guestCount, i18n.language)}
              </output>
              <button
                type="button"
                onClick={() => changeGuests(1)}
                disabled={isSaving || !limits || guestCount >= limits.maximum}
                aria-label={t('guestCountSheet.increase')}
                className={`${roundButtonClass} bg-[var(--color-surface-muted)] hover:brightness-95`}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* TODO(team): check-in/checkout times and additional rules have no Firestore field yet; build their sub-pages once agreed with Flutter. */}
          {(['checkInOut', 'additionalRules'] as const).map((row) => (
            <button
              key={row}
              type="button"
              disabled
              aria-describedby={`${guestsLabelId}-soon`}
              className={`${rowClass} w-full cursor-not-allowed text-left opacity-70`}
            >
              <span className="min-w-0">
                <span className="block text-[0.93427425rem]">{t(`houseRulesPage.${row}.label`)}</span>
                <span className="mt-1 block text-[0.72665775rem] text-[var(--color-text-secondary)]">{t(`houseRulesPage.${row}.summary`)}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </button>
          ))}
          <p id={`${guestsLabelId}-soon`} className="mt-3 text-[0.6228495rem] text-[var(--color-text-secondary)]">
            {t('houseRulesPage.moreSoon')}
          </p>
        </div>

        {saveError ? (
          <p role="alert" className="mt-6 text-[0.72665775rem] text-[var(--color-danger)]">{t('houseRulesPage.saveError')}</p>
        ) : null}
      </div>

      <footer className="sticky bottom-[calc(72px+env(safe-area-inset-bottom))] z-10 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)] pb-[max(16px,env(safe-area-inset-bottom))] pt-4 md:bottom-0">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 sm:px-10">
          <button
            type="button"
            onClick={leave}
            disabled={isSaving}
            className="min-h-11 rounded-button px-2 text-base font-semibold underline-offset-4 transition hover:underline disabled:opacity-50"
          >
            {t('editorSheet.cancel')}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!canSave}
            aria-busy={isSaving}
            className="min-h-12 rounded-button bg-[var(--color-text-primary)] px-6 text-base font-semibold text-[var(--color-surface)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-border)] disabled:text-[var(--color-surface)]"
          >
            {isSaving ? t('editorSheet.saving') : t('editorSheet.save')}
          </button>
        </div>
      </footer>
    </motion.section>
  );
}
