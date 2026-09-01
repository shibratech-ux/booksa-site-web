import type { IconType } from 'react-icons';
import {
  FiBell,
  FiBriefcase,
  FiCreditCard,
  FiDollarSign,
  FiGlobe,
  FiLock,
  FiShield,
  FiUser
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

type SettingsItem = {
  id?: AccountSettingsSection;
  labelKey:
    | 'personalInformation'
    | 'loginSecurity'
    | 'privacy'
    | 'notifications'
    | 'taxes'
    | 'payments'
    | 'languagesCurrency'
    | 'travelForWork';
  icon: IconType;
};

export type AccountSettingsSection =
  | 'personal-information'
  | 'login-security'
  | 'privacy'
  | 'notifications'
  | 'taxes'
  | 'payments'
  | 'languages-currency'
  | 'travel-for-work';

const settingsItems: SettingsItem[] = [
  { id: 'personal-information', labelKey: 'personalInformation', icon: FiUser },
  { id: 'login-security', labelKey: 'loginSecurity', icon: FiShield },
  { id: 'privacy', labelKey: 'privacy', icon: FiLock },
  { id: 'notifications', labelKey: 'notifications', icon: FiBell },
  { id: 'taxes', labelKey: 'taxes', icon: FiDollarSign },
  { id: 'payments', labelKey: 'payments', icon: FiCreditCard },
  { id: 'languages-currency', labelKey: 'languagesCurrency', icon: FiGlobe },
  { id: 'travel-for-work', labelKey: 'travelForWork', icon: FiBriefcase }
];

export function AccountSettingsSidebar({
  activeSection,
  onSectionChange
}: {
  activeSection: AccountSettingsSection;
  onSectionChange: (section: AccountSettingsSection) => void;
}) {
  const { t } = useTranslation('settings');

  return (
    <aside className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-7 sm:px-8 lg:min-h-[calc(100vh-96px)] lg:border-b-0 lg:border-r lg:px-10 lg:py-10 xl:px-16">
      <div className="lg:sticky lg:top-10">
        <h1 className="text-[23.52px] font-semibold tracking-[-0.035em] sm:text-[25.2px]">{t('title')}</h1>

        <nav
          aria-label={t('sectionsLabel')}
          className="scrollbar-visible mt-5 flex gap-2 overflow-x-auto pb-2 lg:mt-6 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0"
        >
          {settingsItems.map(({ id, icon: Icon, labelKey }) => (
            <button
              key={labelKey}
              type="button"
              onClick={() => id && onSectionChange(id)}
              aria-current={id === activeSection ? 'page' : undefined}
              className={`flex min-w-max items-center gap-4 rounded-xl px-4 py-3 text-left text-[14.6px] transition lg:w-full ${
                id === activeSection
                  ? 'bg-[var(--color-surface-muted)] font-semibold'
                  : 'hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              <Icon className="h-[22px] w-[22px] shrink-0" aria-hidden="true" />
              <span>{t(labelKey)}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
