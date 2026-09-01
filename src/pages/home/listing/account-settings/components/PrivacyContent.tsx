import { useEffect, useState } from 'react';
import { FiCheck, FiChevronRight, FiLock } from 'react-icons/fi';
import { updateLoggedInUserProfile } from '@/services/user.service';

type PrivacySettingKey =
  | 'readReceipts'
  | 'searchEngineIndexing'
  | 'reviewHomeLocation'
  | 'reviewTripType'
  | 'reviewLengthOfStay'
  | 'reviewBookedServices'
  | 'aiFeatureImprovement';

type PrivacySettings = Record<PrivacySettingKey, boolean>;

const defaultSettings: PrivacySettings = {
  readReceipts: true,
  searchEngineIndexing: false,
  reviewHomeLocation: true,
  reviewTripType: true,
  reviewLengthOfStay: true,
  reviewBookedServices: true,
  aiFeatureImprovement: true
};

function PrivacySwitch({
  checked,
  label,
  disabled,
  onChange
}: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-8 w-12 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-wait disabled:opacity-60 ${
        checked ? 'bg-[var(--color-text-primary)]' : 'bg-gray-400'
      }`}
    >
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-[19px]' : 'translate-x-0.5'
        }`}
      >
        {checked ? <FiCheck className="h-4 w-4" aria-hidden="true" /> : null}
      </span>
    </button>
  );
}

function PrivacyToggleRow({
  title,
  description,
  settingKey,
  settings,
  pendingSetting,
  onToggle
}: {
  title: string;
  description?: string;
  settingKey: PrivacySettingKey;
  settings: PrivacySettings;
  pendingSetting: PrivacySettingKey | null;
  onToggle: (key: PrivacySettingKey) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div>
        <h4 className="font-semibold">{title}</h4>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </div>
      <PrivacySwitch
        checked={settings[settingKey]}
        label={title}
        disabled={pendingSetting === settingKey}
        onChange={() => onToggle(settingKey)}
      />
    </div>
  );
}

function PrivacyLinkRow({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex min-h-[70px] w-full items-center justify-between gap-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 text-left font-semibold transition hover:bg-[var(--color-surface-muted)]"
    >
      {label}
      <FiChevronRight className="h-5 w-5 shrink-0 text-[var(--color-text-secondary)]" aria-hidden="true" />
    </button>
  );
}

export function PrivacyContent({
  initialSettings,
  onSettingSaved
}: {
  initialSettings?: Partial<PrivacySettings>;
  onSettingSaved?: (key: PrivacySettingKey, value: boolean) => void;
}) {
  const [settings, setSettings] = useState<PrivacySettings>({ ...defaultSettings, ...initialSettings });
  const [pendingSetting, setPendingSetting] = useState<PrivacySettingKey | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setSettings({ ...defaultSettings, ...initialSettings });
  }, [initialSettings]);

  const toggleSetting = async (key: PrivacySettingKey) => {
    if (pendingSetting) return;
    const previousValue = settings[key];
    const nextValue = !previousValue;

    setSaveError(null);
    setPendingSetting(key);
    setSettings((current) => ({ ...current, [key]: nextValue }));

    try {
      await updateLoggedInUserProfile({ [`privacySettings.${key}`]: nextValue });
      onSettingSaved?.(key, nextValue);
    } catch (error) {
      setSettings((current) => ({ ...current, [key]: previousValue }));
      setSaveError(
        error instanceof Error ? error.message : 'Unable to update your privacy setting.'
      );
    } finally {
      setPendingSetting(null);
    }
  };

  return (
    <div className="mx-auto max-w-[760px]">
      <h2 className="text-[23.52px] font-semibold tracking-[-0.035em] sm:text-[25.2px]">Privacy</h2>

      {saveError ? (
        <p role="alert" className="mt-5 rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm font-medium text-[var(--color-danger)] dark:bg-red-950/20">
          {saveError}
        </p>
      ) : null}

      <section className="pt-10">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">Messages</h3>
        <PrivacyToggleRow
          title="Show people when I've read their messages"
          settingKey="readReceipts"
          settings={settings}
          pendingSetting={pendingSetting}
          onToggle={(key) => void toggleSetting(key)}
        />
        <div className="mt-4">
          <PrivacyLinkRow label="Blocked people" />
        </div>
      </section>

      <section className="mt-8 border-t border-[var(--color-border)] pt-9">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">Listings</h3>
        <PrivacyToggleRow
          title="Include my listing(s) in search engines"
          description="Turning this on means search engines, like Google, will display your listing page(s) in search results."
          settingKey="searchEngineIndexing"
          settings={settings}
          pendingSetting={pendingSetting}
          onToggle={(key) => void toggleSetting(key)}
        />
      </section>

      <section className="mt-5 border-t border-[var(--color-border)] pt-9">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">Reviews</h3>
        <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">
          Choose what’s shared when you write a review. Updating this setting will change what’s displayed for all past reviews.
        </p>
        <div className="mt-4 space-y-1">
          <PrivacyToggleRow title="Show my home city and country" description="Ex: City and country" settingKey="reviewHomeLocation" settings={settings} pendingSetting={pendingSetting} onToggle={(key) => void toggleSetting(key)} />
          <PrivacyToggleRow title="Show my trip type" description="Ex: Stayed with kids or pets" settingKey="reviewTripType" settings={settings} pendingSetting={pendingSetting} onToggle={(key) => void toggleSetting(key)} />
          <PrivacyToggleRow title="Show my length of stay" description="Ex: A few nights, about a week, etc." settingKey="reviewLengthOfStay" settings={settings} pendingSetting={pendingSetting} onToggle={(key) => void toggleSetting(key)} />
          <PrivacyToggleRow title="Show my booked services" description="Ex: Gourmet brunch or tasting menu" settingKey="reviewBookedServices" settings={settings} pendingSetting={pendingSetting} onToggle={(key) => void toggleSetting(key)} />
        </div>
      </section>

      <section className="mt-5 border-t border-[var(--color-border)] py-9">
        <h3 className="text-2xl font-semibold tracking-[-0.03em]">Data privacy</h3>
        <div className="mt-6 space-y-4">
          <PrivacyLinkRow label="Request my personal data" />
          <PrivacyToggleRow
            title="Help improve AI-powered features"
            description="When this is on, we use your data to develop and improve AI models that power certain features on Booksa."
            settingKey="aiFeatureImprovement"
            settings={settings}
            pendingSetting={pendingSetting}
            onToggle={(key) => void toggleSetting(key)}
          />
          <PrivacyLinkRow label="Delete my account" />
        </div>

        <article className="mt-4 flex gap-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-pink-500 text-pink-500">
            <FiLock className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h4 className="font-semibold">Committed to privacy</h4>
            <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">
              Booksa is committed to keeping your data protected. See details in our Privacy Policy. To help us improve your experience, share your feedback.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
