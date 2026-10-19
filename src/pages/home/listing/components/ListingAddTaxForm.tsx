import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/Input';
import { SelectField } from '@/components/ui/SelectField';

export const TAX_NAMES = ['accommodation', 'tourism', 'local', 'other'] as const;
export const TAX_TYPES = ['booking', 'guest', 'night', 'guestNight'] as const;
export type TaxName = typeof TAX_NAMES[number];
export type TaxType = typeof TAX_TYPES[number];
export type TaxPreview = {
  name: string;
  type: string;
  amount: string;
  partialExemption: string;
  fullExemption: string;
  registration: string;
  accepted: boolean;
};
export const emptyTaxPreview = (): TaxPreview => ({ name: '', type: '', amount: '', partialExemption: '', fullExemption: '', registration: '', accepted: false });
const positiveInteger = (value: string) => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
export const isTaxPreviewValid = (value: TaxPreview) =>
  TAX_NAMES.some(name => name === value.name) && TAX_TYPES.some(type => type === value.type) &&
  positiveInteger(value.amount) && (!value.partialExemption || positiveInteger(value.partialExemption)) &&
  (!value.fullExemption || positiveInteger(value.fullExemption)) && Boolean(value.registration.trim()) && value.registration.length <= 100 && value.accepted;

export function ListingAddTaxForm({ value, onChange }: {
  value: TaxPreview;
  onChange: (value: TaxPreview) => void;
}) {
  const { t } = useTranslation('dashboard');
  const prefix = useId();
  const nameRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => nameRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);
  const [touched, setTouched] = useState<Partial<Record<keyof TaxPreview, boolean>>>({});
  const [help, setHelp] = useState<string | null>(null);
  const update = <K extends keyof TaxPreview>(key: K, next: TaxPreview[K]) => onChange({ ...value, [key]: next });
  const blur = (key: keyof TaxPreview) => setTouched(current => ({ ...current, [key]: true }));
  const required = t('listingAddTax.required');
  const integerError = t('listingAddTax.integerError');
  const learnMore = (key: 'intro' | 'partial' | 'full') => (
    <>
      <button type="button" aria-expanded={help === key} aria-controls={`${prefix}-${key}-help`} onClick={() => setHelp(current => current === key ? null : key)}
        className="inline-flex min-h-11 items-center rounded-button text-sm font-medium underline underline-offset-2">
        {t('listingTaxesSheet.learnMore')}
      </button>
      <span id={`${prefix}-${key}-help`} hidden={help !== key} className="mb-2 block text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {t(`listingAddTax.help.${key}`)}
      </span>
    </>
  );

  return (
    <div className="space-y-9 pb-2 text-sm">
      <div className="text-[var(--color-text-secondary)]">
        <p>{t('listingAddTax.introduction')}</p>
        {learnMore('intro')}
      </div>
      <SelectField ref={nameRef} label={t('listingAddTax.name')} value={value.name} onChange={event => update('name', event.target.value)} onBlur={() => blur('name')} required
        error={touched.name && !value.name ? required : undefined}>
        <option value="" disabled>{t('listingAddTax.select')}</option>
        {TAX_NAMES.map(name => <option key={name} value={name}>{t(`listingAddTax.names.${name}`)}</option>)}
      </SelectField>
      <SelectField label={t('listingAddTax.type')} value={value.type} onChange={event => update('type', event.target.value)} onBlur={() => blur('type')} required
        error={touched.type && !value.type ? required : undefined}>
        <option value="" disabled>{t('listingAddTax.select')}</option>
        {TAX_TYPES.map(type => <option key={type} value={type}>{t(`listingAddTax.types.${type}`)}</option>)}
      </SelectField>
      <div className="space-y-3">
        <SelectField label={t('listingAddTax.rate')} value="fixed" disabled className="bg-[var(--color-surface-muted)]"><option value="fixed">{t('listingAddTax.fixed')}</option></SelectField>
        <Input label={t('listingAddTax.amount')} inputMode="numeric" value={value.amount} onChange={event => update('amount', event.target.value)} onBlur={() => blur('amount')} required
          error={touched.amount && !positiveInteger(value.amount) ? value.amount ? integerError : required : undefined} />
      </div>
      {(['partialExemption', 'fullExemption'] as const).map(key => {
        const section = key === 'partialExemption' ? 'partial' : 'full';
        return (
          <div key={key}>
            <label htmlFor={`${prefix}-${key}`} className="block font-semibold">{t(`listingAddTax.${section}Title`)}</label>
            <div id={`${prefix}-${key}-description`} className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)] sm:text-sm">
              <p>{t(`listingAddTax.${section}Description`)}</p>
              {learnMore(section)}
            </div>
            <Input id={`${prefix}-${key}`} aria-describedby={`${prefix}-${key}-description`} inputMode="numeric" placeholder={t('listingAddTax.optional')}
              value={value[key]} onChange={event => update(key, event.target.value)} onBlur={() => blur(key)}
              error={touched[key] && value[key] && !positiveInteger(value[key]) ? integerError : undefined} />
          </div>
        );
      })}
      <div>
        <label htmlFor={`${prefix}-registration`} className="block font-semibold">{t('listingAddTax.registration')}</label>
        <p id={`${prefix}-registration-help`} className="mb-5 mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">{t('listingAddTax.registrationHelp')}</p>
        <Input id={`${prefix}-registration`} aria-describedby={`${prefix}-registration-help`} placeholder={t('listingAddTax.registrationPlaceholder')} required maxLength={100}
          value={value.registration} onChange={event => update('registration', event.target.value)} onBlur={() => blur('registration')}
          error={touched.registration && !value.registration.trim() ? required : undefined} helperText={required} />
      </div>
      <fieldset>
        <legend className="font-semibold">{t('listingAddTax.termsTitle')}</legend>
        <label className="mt-3 flex min-h-11 cursor-pointer items-start gap-3 text-xs leading-relaxed sm:text-sm">
          <input type="checkbox" checked={value.accepted} onChange={event => update('accepted', event.target.checked)} required
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-text-primary)]" />
          <span>{t('listingAddTax.terms')}</span>
        </label>
      </fieldset>
    </div>
  );
}
