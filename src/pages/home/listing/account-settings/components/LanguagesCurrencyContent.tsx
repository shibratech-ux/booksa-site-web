import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { updateLoggedInUserProfile } from '@/services/user.service';
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { getLanguageOption } from '@/i18n/types';
import { SelectField } from '@/components/ui/SelectField';

type RegionalSettingKey = 'preferredCurrency' | 'timeZone';
type EditableSettingKey = 'preferredLanguage' | RegionalSettingKey;

type RegionalSettings = Record<RegionalSettingKey, string>;

const currencyOptions = [
  { value: 'USD', label: 'United States dollar' },
  { value: 'CDF', label: 'Congolese franc' },
  { value: 'EUR', label: 'Euro' },
  { value: 'GBP', label: 'British pound' }
];

const timeZoneOptions = [
  { value: 'Africa/Kinshasa', label: 'Kinshasa (GMT+1)' },
  { value: 'Africa/Lubumbashi', label: 'Lubumbashi (GMT+2)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'America/New_York', label: 'New York' }
];

const settingOptions: Record<RegionalSettingKey, Array<{ value: string; label: string }>> = {
  preferredCurrency: currencyOptions,
  timeZone: timeZoneOptions
};

const settingLabels: Record<RegionalSettingKey, string> = {
  preferredCurrency: 'Preferred currency',
  timeZone: 'Time zone'
};

const defaultSettings: RegionalSettings = {
  preferredCurrency: 'USD',
  timeZone: ''
};

function displayValue(key: RegionalSettingKey, value: string) {
  return settingOptions[key].find((option) => option.value === value)?.label ?? value;
}

export function LanguagesCurrencyContent({
  initialSettings,
  onSettingSaved
}: {
  initialSettings?: Partial<RegionalSettings>;
  onSettingSaved?: (key: RegionalSettingKey, value: string) => void;
}) {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const [settings, setSettings] = useState<RegionalSettings>({ ...defaultSettings, ...initialSettings });
  const [editingSetting, setEditingSetting] = useState<EditableSettingKey | null>(null);
  const [draft, setDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setSettings({ ...defaultSettings, ...initialSettings });
  }, [initialSettings]);

  const openEditor = (key: RegionalSettingKey) => {
    setDraft(settings[key]);
    setSaveError(null);
    setEditingSetting(key);
  };

  const closeEditor = () => {
    if (isSaving) return;
    setSaveError(null);
    setEditingSetting(null);
  };

  const saveSetting = async (key: RegionalSettingKey) => {
    if (!draft || isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      await updateLoggedInUserProfile({ [`regionalSettings.${key}`]: draft });
      setSettings((current) => ({ ...current, [key]: draft }));
      onSettingSaved?.(key, draft);
      setEditingSetting(null);
    } catch (error) {
      console.error('Unable to save a regional setting.', error);
      setSaveError(tCommon('errors.save'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[836px]">
      <h2 className="text-[27.65952px] font-semibold tracking-[-0.035em] sm:text-[29.6352px]">
        {t('languagesCurrency')}
      </h2>

      <motion.section
        layout="position"
        className={`mt-7 border-b border-[var(--color-border)] py-6 transition-opacity ${
          editingSetting && editingSetting !== 'preferredLanguage'
            ? 'pointer-events-none opacity-30'
            : 'opacity-100'
        }`}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="font-semibold">{t('profile.preferredLanguage')}</h3>
            {editingSetting !== 'preferredLanguage' ? (
              <p className="mt-1 text-[var(--color-text-secondary)]">
                {getLanguageOption(i18n.resolvedLanguage ?? i18n.language).label}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={
              editingSetting === 'preferredLanguage'
                ? closeEditor
                : () => {
                    setSaveError(null);
                    setEditingSetting('preferredLanguage');
                  }
            }
            disabled={isSaving}
            className="shrink-0 text-sm font-semibold underline underline-offset-2 disabled:cursor-wait disabled:opacity-50"
          >
            {editingSetting === 'preferredLanguage'
              ? tCommon('actions.cancel')
              : tCommon('actions.edit')}
          </button>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: editingSetting === 'preferredLanguage' ? 'auto' : 0,
            opacity: editingSetting === 'preferredLanguage' ? 1 : 0,
            y: editingSetting === 'preferredLanguage' ? 0 : -5
          }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden={editingSetting !== 'preferredLanguage'}
          className={`overflow-hidden ${
            editingSetting === 'preferredLanguage' ? '' : 'pointer-events-none'
          }`}
        >
          <div className="pt-5">
            <LanguageSwitcher fullWidth />
          </div>
        </motion.div>
      </motion.section>

      <div>
        {(Object.keys(settingLabels) as RegionalSettingKey[]).map((key) => {
          const isEditing = editingSetting === key;

          return (
            <motion.section
              key={key}
              layout="position"
              className={`border-b border-[var(--color-border)] py-6 transition-opacity ${
                editingSetting && !isEditing ? 'pointer-events-none opacity-30' : 'opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3 className="font-semibold">{settingLabels[key]}</h3>
                  {!isEditing ? (
                    <p className="mt-1 text-[var(--color-text-secondary)]">{displayValue(key, settings[key])}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={isEditing ? closeEditor : () => openEditor(key)}
                  disabled={isSaving}
                  className="shrink-0 text-sm font-semibold underline underline-offset-2 disabled:cursor-wait disabled:opacity-50"
                >
                  {isEditing ? tCommon('actions.cancel') : tCommon('actions.edit')}
                </button>
              </div>

              <motion.div
                initial={false}
                animate={{ height: isEditing ? 'auto' : 0, opacity: isEditing ? 1 : 0, y: isEditing ? 0 : -5 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden={!isEditing}
                className={`overflow-hidden ${isEditing ? '' : 'pointer-events-none'}`}
              >
                <div className="pt-5">
                  <SelectField
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    aria-label={settingLabels[key]}
                    disabled={isSaving}
                    tabIndex={isEditing ? 0 : -1}
                    className="h-[63.8px] text-base focus:border-2 focus:border-[var(--color-text-primary)]"
                  >
                    {!settings[key] ? <option value="">Select {settingLabels[key].toLowerCase()}</option> : null}
                    {settingOptions[key].map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </SelectField>
                  <button
                    type="button"
                    onClick={() => void saveSetting(key)}
                    disabled={isSaving || draft === settings[key]}
                    tabIndex={isEditing ? 0 : -1}
                    className="mt-4 min-h-12 rounded-md bg-[var(--color-text-primary)] px-8 font-semibold text-[var(--color-surface)] disabled:cursor-default disabled:opacity-35"
                  >
                    {isSaving ? tCommon('actions.saving') : tCommon('actions.save')}
                  </button>
                  {saveError ? <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">{saveError}</p> : null}
                </div>
              </motion.div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
