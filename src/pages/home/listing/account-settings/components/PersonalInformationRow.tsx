import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n/types';
import { SelectField } from '@/components/ui/SelectField';

type PersonalInformationRowProps = {
  label: string;
  value: string;
  action: 'add' | 'edit' | 'start';
  helper?: string;
  editHelper?: string;
  variant?: 'default' | 'legal-name' | 'emergency-contact';
  maskValue?: boolean;
  initialDetails?: Record<string, string>;
  isEditing: boolean;
  isDimmed: boolean;
  onEdit: () => void;
  onFinishEditing: () => void;
  onSave: (value: string, details?: Record<string, string>) => Promise<void>;
};

export function PersonalInformationRow({
  label,
  value: initialValue,
  action,
  helper,
  editHelper,
  variant = 'default',
  maskValue = false,
  initialDetails,
  isEditing,
  isDimmed,
  onEdit,
  onFinishEditing,
  onSave
}: PersonalInformationRowProps) {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const shouldReduceMotion = useReducedMotion();
  const [value, setValue] = useState(initialValue);
  const [draft, setDraft] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactName, setContactName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const displayedValue = (() => {
    if (!maskValue || value === tCommon('states.notProvided')) return value;
    const [name, domain] = value.split('@');
    return domain ? `${name.slice(0, 1)}***@${domain}` : value;
  })();

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!isEditing) return;

    if (variant === 'legal-name') {
      const nameParts = value.trim().split(/\s+/);
      setFirstName(nameParts.shift() ?? '');
      setLastName(nameParts.join(' '));
      return;
    }

    if (variant === 'emergency-contact') {
      setContactName(initialDetails?.name ?? (value === tCommon('states.notProvided') ? '' : value));
      setRelationship(initialDetails?.relationship ?? '');
      setPreferredLanguage(initialDetails?.preferredLanguage ?? '');
      setContactEmail(initialDetails?.email ?? '');
      setCountryCode(initialDetails?.countryCode ?? '');
      setPhoneNumber(initialDetails?.phoneNumber ?? '');
      return;
    }

    setDraft(value === tCommon('states.notProvided') || value === tCommon('states.notStarted') ? '' : value);
  }, [initialDetails, isEditing, tCommon, value, variant]);

  useEffect(() => {
    if (!isEditing) return;

    const animationFrame = window.requestAnimationFrame(() => firstInputRef.current?.focus());
    return () => window.cancelAnimationFrame(animationFrame);
  }, [isEditing]);

  const cancel = () => {
    if (isSaving) return;
    setSaveError(null);
    onFinishEditing();
  };

  const save = async () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedContactName = contactName.trim();
    const nextValue = variant === 'legal-name'
      ? `${trimmedFirstName} ${trimmedLastName}`.trim()
      : variant === 'emergency-contact'
        ? trimmedContactName
        : draft.trim();

    if (!nextValue || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      let details: Record<string, string> | undefined;
      if (variant === 'legal-name') {
        details = { firstName: trimmedFirstName, lastName: trimmedLastName };
      } else if (variant === 'emergency-contact') {
        details = {
          name: trimmedContactName,
          relationship: relationship.trim(),
          preferredLanguage,
          email: contactEmail.trim(),
          countryCode,
          phoneNumber: phoneNumber.trim()
        };
      }

      await onSave(nextValue, details);
      setValue(nextValue);
      onFinishEditing();
    } catch (error) {
      console.error('Unable to save personal information.', error);
      setSaveError(tCommon('errors.save'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && variant !== 'emergency-contact') void save();
    if (event.key === 'Escape') cancel();
  };

  const rowTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 330, damping: 32 };

  return (
    <motion.div
      layout="position"
      transition={{ layout: rowTransition }}
      className={`border-b border-[var(--color-border)] py-6 first:pt-2 transition-opacity duration-200 ${
        isEditing ? 'py-7 first:pt-2' : ''
      } ${isDimmed ? 'pointer-events-none opacity-25' : 'opacity-100'}`}
      aria-disabled={isDimmed || undefined}
    >
      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1 max-sm:w-full">
          <h3 className="font-semibold">{label}</h3>
          <motion.p
            initial={false}
            animate={{
              height: isEditing ? 0 : 'auto',
              marginTop: isEditing ? 0 : 4,
              opacity: isEditing ? 0 : 1
            }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: 'easeOut' }}
            aria-hidden={isEditing}
            className="max-w-[650px] overflow-hidden text-sm leading-5 text-[var(--color-text-secondary)]"
          >
            {helper ?? displayedValue}
          </motion.p>

          <motion.div
            initial={false}
            animate={{
              height: isEditing ? 'auto' : 0,
              opacity: isEditing ? 1 : 0,
              y: isEditing ? 0 : -6
            }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
            }
            aria-hidden={!isEditing}
            className={`w-full overflow-hidden ${isEditing ? '' : 'pointer-events-none'}`}
          >
            <div className="pt-1">
              {editHelper ? (
                <p className="text-sm text-[var(--color-text-secondary)]">{editHelper}</p>
              ) : null}

              <div className="mt-6">
                  {variant === 'legal-name' ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="relative block">
                        <span className="pointer-events-none absolute left-4 top-2.5 text-xs text-[var(--color-text-secondary)]">
                          {t('profile.firstNameOnId')}
                        </span>
                        <input
                          ref={firstInputRef}
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          onKeyDown={handleKeyDown}
                          autoComplete="given-name"
                          tabIndex={isEditing ? 0 : -1}
                          disabled={isSaving}
                          className="h-[62px] w-full rounded-[var(--radius-md)] border border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-4 pb-2 pt-6 outline-none transition focus:border-2 focus:border-[var(--color-text-primary)]"
                        />
                      </label>
                      <label className="relative block">
                        <span className="pointer-events-none absolute left-4 top-2.5 text-xs text-[var(--color-text-secondary)]">
                          {t('profile.lastNameOnId')}
                        </span>
                        <input
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          onKeyDown={handleKeyDown}
                          autoComplete="family-name"
                          tabIndex={isEditing ? 0 : -1}
                          disabled={isSaving}
                          className="h-[62px] w-full rounded-[var(--radius-md)] border border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-4 pb-2 pt-6 outline-none transition focus:border-2 focus:border-[var(--color-text-primary)]"
                        />
                      </label>
                    </div>
                  ) : variant === 'emergency-contact' ? (
                    <div className="space-y-4">
                      <input
                        ref={firstInputRef}
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('profile.name')}
                        autoComplete="name"
                        tabIndex={isEditing ? 0 : -1}
                        disabled={isSaving}
                        className="h-[60px] w-full rounded-[var(--radius-md)] border border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-4 outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-2 focus:border-[var(--color-text-primary)]"
                      />
                      <input
                        value={relationship}
                        onChange={(event) => setRelationship(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('profile.relationship')}
                        tabIndex={isEditing ? 0 : -1}
                        disabled={isSaving}
                        className="h-[60px] w-full rounded-[var(--radius-md)] border border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-4 outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-2 focus:border-[var(--color-text-primary)]"
                      />
                      <SelectField
                        value={preferredLanguage}
                        onChange={(event) => setPreferredLanguage(event.target.value)}
                        tabIndex={isEditing ? 0 : -1}
                        disabled={isSaving}
                        aria-label={t('profile.preferredLanguage')}
                        className="h-[60px] text-base focus:border-2 focus:border-[var(--color-text-primary)]"
                      >
                        <option value="" disabled>{t('profile.preferredLanguage')}</option>
                        {SUPPORTED_LANGUAGES.map(({ code, label: languageLabel }) => (
                          <option key={code} value={code}>{languageLabel}</option>
                        ))}
                      </SelectField>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(event) => setContactEmail(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('profile.email')}
                        autoComplete="email"
                        tabIndex={isEditing ? 0 : -1}
                        disabled={isSaving}
                        className="h-[60px] w-full rounded-[var(--radius-md)] border border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-4 outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-2 focus:border-[var(--color-text-primary)]"
                      />
                      <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
                        <SelectField
                          value={countryCode}
                          onChange={(event) => setCountryCode(event.target.value)}
                          tabIndex={isEditing ? 0 : -1}
                          disabled={isSaving}
                          aria-label={t('profile.countryCode')}
                          className="h-[60px] text-base focus:border-2 focus:border-[var(--color-text-primary)]"
                        >
                          <option value="" disabled>{t('profile.countryCode')}</option>
                          <option value="+243">DR Congo (+243)</option>
                          <option value="+33">France (+33)</option>
                          <option value="+44">United Kingdom (+44)</option>
                          <option value="+1">United States (+1)</option>
                        </SelectField>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(event) => setPhoneNumber(event.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={t('profile.phoneNumber')}
                          autoComplete="tel"
                          tabIndex={isEditing ? 0 : -1}
                          disabled={isSaving}
                          className="h-[60px] w-full rounded-[var(--radius-md)] border border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-4 outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-2 focus:border-[var(--color-text-primary)]"
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      ref={firstInputRef}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleKeyDown}
                      aria-label={label}
                      tabIndex={isEditing ? 0 : -1}
                      disabled={isSaving}
                      className="h-[58px] w-full max-w-xl rounded-[var(--radius-md)] border border-[var(--color-text-secondary)] bg-[var(--color-surface)] px-4 outline-none transition focus:border-2 focus:border-[var(--color-text-primary)]"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => void save()}
                    tabIndex={isEditing ? 0 : -1}
                    disabled={isSaving}
                    className="mt-4 min-h-12 min-w-28 rounded-[var(--radius-md)] bg-[var(--color-text-primary)] px-10 font-semibold text-[var(--color-surface)] transition hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isSaving ? tCommon('actions.saving') : tCommon('actions.save')}
                  </button>
                  {saveError ? (
                    <p role="alert" className="mt-3 text-sm font-medium text-[var(--color-danger)]">
                      {saveError}
                    </p>
                  ) : null}
              </div>
            </div>
          </motion.div>
        </div>

        <button
          type="button"
          onClick={isEditing ? cancel : onEdit}
          disabled={isSaving}
          className={`shrink-0 py-0.5 text-sm font-semibold underline underline-offset-2 transition hover:opacity-65 disabled:cursor-wait disabled:opacity-50 ${
            isEditing ? 'max-sm:absolute max-sm:right-0 max-sm:top-0' : ''
          }`}
        >
          {isEditing ? tCommon('actions.cancel') : tCommon(`actions.${action}`)}
        </button>
      </div>
    </motion.div>
  );
}
