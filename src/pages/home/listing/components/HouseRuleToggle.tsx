import { useId } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { HouseRuleId } from '@/domain/listing';

export function HouseRuleToggle({ rule, value, disabled, onChange }: {
  rule: HouseRuleId;
  value: boolean | null;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  const { t } = useTranslation('dashboard');
  const labelId = useId();
  const helperId = useId();
  const label = t(`houseRulesPage.rules.${rule}.label`);
  const hasHelper = rule === 'petsAllowed';

  return (
    <div role="group" aria-labelledby={labelId} aria-describedby={hasHelper ? helperId : undefined} className={`flex min-h-22 justify-between gap-4 border-b border-[var(--color-border-subtle)] py-6 ${hasHelper ? 'items-start' : 'items-center'}`}>
      <div className="min-w-0 flex-1">
        <p id={labelId} className="text-base leading-snug">{label}</p>
        {hasHelper ? (
          <>
            <p id={helperId} className="mt-1 max-w-xs text-sm leading-snug text-[var(--color-text-secondary)]">{t('houseRulesPage.rules.petsAllowed.helper')}</p>
            <details className="mt-1 text-sm leading-snug">
              <summary className="-my-3 flex min-h-11 w-fit cursor-pointer list-none items-center rounded-button py-3 font-semibold underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)] [&::-webkit-details-marker]:hidden">
                {t('houseRulesPage.learnMore')}
              </summary>
              <p className="mt-3 max-w-xs text-[var(--color-text-secondary)]">{t('houseRulesPage.petDetails')}</p>
            </details>
          </>
        ) : null}
      </div>
      <div className={`flex shrink-0 ${hasHelper ? '-mt-2' : ''}`}>
        {[false, true].map(answer => (
          <button
            key={String(answer)}
            type="button"
            onClick={() => onChange(answer)}
            disabled={disabled}
            aria-pressed={value === answer}
            aria-label={answer ? t('houseRulesPage.allow', { rule: label }) : t('houseRulesPage.disallow', { rule: label })}
            className="group inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${value === answer ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)]' : 'bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] group-hover:brightness-95'}`}>
              {answer ? <Check className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" /> : <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
