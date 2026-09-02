import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BooksaLogo from '@/components/layout/BooksaLogo';
import { useAuth } from '@/hooks/useAuth';
import {
  getLoggedInUserProfile,
  updateLoggedInUserProfile
} from '@/services/user.service';
import { ROUTES } from '@/utils/constants';
import { AccountHelpCard } from './components/AccountHelpCard';
import {
  AccountSettingsSidebar,
  type AccountSettingsSection
} from './components/AccountSettingsSidebar';
import { LoginSecurityContent } from './components/LoginSecurityContent';
import { PrivacyContent } from './components/PrivacyContent';
import { NotificationsContent } from './components/NotificationsContent';
import { TaxesContent } from './components/TaxesContent';
import { PaymentsContent } from './components/PaymentsContent';
import { LanguagesCurrencyContent } from './components/LanguagesCurrencyContent';
import { TravelForWorkContent } from './components/TravelForWorkContent';
import { PersonalInformationRow } from './components/PersonalInformationRow';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Banknote,
  Bell,
  BriefcaseBusiness,
  Calculator,
  ChartNoAxesCombined,
  ChevronRight,
  Globe2,
  Hand,
  Shield,
  UserRound,
  type LucideIcon
} from 'lucide-react';

type MobileSettingsItem = {
  label: string;
  icon: LucideIcon;
  section?: AccountSettingsSection;
  badge?: string;
  action?: 'hosting';
};

const mobileSettingsItems: MobileSettingsItem[] = [
  { label: 'Personal information', icon: UserRound, section: 'personal-information' },
  { label: 'Login & security', icon: Shield, section: 'login-security' },
  { label: 'Privacy', icon: Hand, section: 'privacy' },
  { label: 'Notifications', icon: Bell, section: 'notifications' },
  { label: 'Taxes', icon: Calculator, section: 'taxes' },
  { label: 'Payments', icon: Banknote, section: 'payments' },
  { label: 'Languages & currency', icon: Globe2, section: 'languages-currency' },
  { label: 'Travel for work', icon: BriefcaseBusiness, section: 'travel-for-work' }
];

const professionalHostingItem: MobileSettingsItem = {
  label: 'Professional hosting tools',
  icon: ChartNoAxesCombined,
  action: 'hosting'
};

export default function AccountSettingsPage() {
  const { t } = useTranslation('settings');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isMobileSectionOpen, setIsMobileSectionOpen] = useState(false);
  const requestedSection = (location.state as { section?: AccountSettingsSection } | null)?.section;
  const [activeSection, setActiveSection] = useState<AccountSettingsSection>(
    requestedSection ?? 'personal-information'
  );
  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const firebaseProfile = await getLoggedInUserProfile();
        if (isActive) setProfile(firebaseProfile);
      } catch (error) {
        if (isActive) {
          setProfileError(
            error instanceof Error ? error.message : t('profile.loadError')
          );
        }
      } finally {
        if (isActive) setIsLoadingProfile(false);
      }
    };

    void loadProfile();
    return () => {
      isActive = false;
    };
  }, [t, user?.id]);

  const stringValue = (field: string, fallback: string) =>
    typeof profile[field] === 'string' && profile[field] ? (profile[field] as string) : fallback;

  const emergencyContact = (() => {
    const contact = profile.emergencyContact;
    if (!contact || typeof contact !== 'object' || Array.isArray(contact)) return undefined;

    return Object.fromEntries(
      Object.entries(contact).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    );
  })();

  const privacySettings = (() => {
    const storedSettings = profile.privacySettings;
    if (!storedSettings || typeof storedSettings !== 'object' || Array.isArray(storedSettings)) {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(storedSettings).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean')
    );
  })();

  const initialServiceFee = (() => {
    const paymentSettings = profile.paymentSettings;
    if (!paymentSettings || typeof paymentSettings !== 'object' || Array.isArray(paymentSettings)) {
      return undefined;
    }
    const serviceFee = (paymentSettings as Record<string, unknown>).serviceFee;
    return typeof serviceFee === 'string' ? serviceFee : undefined;
  })();

  const regionalSettings = (() => {
    const storedSettings = profile.regionalSettings;
    if (!storedSettings || typeof storedSettings !== 'object' || Array.isArray(storedSettings)) {
      return undefined;
    }
    return Object.fromEntries(
      Object.entries(storedSettings).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    );
  })();

  const initialWorkEmail = (() => {
    const workSettings = profile.workSettings;
    if (!workSettings || typeof workSettings !== 'object' || Array.isArray(workSettings)) {
      return undefined;
    }
    const email = (workSettings as Record<string, unknown>).email;
    return typeof email === 'string' ? email : undefined;
  })();

  const personalInformation = [
    {
      field: 'name',
      label: t('profile.legalName'),
      value: stringValue('name', user?.name ?? tCommon('brand.host')),
      action: 'edit' as const,
      editHelper: t('profile.nameIdHelp'),
      variant: 'legal-name' as const
    },
    {
      field: 'preferredFirstName',
      label: t('profile.preferredFirstName'),
      value: stringValue('preferredFirstName', tCommon('states.notProvided')),
      action: 'add' as const
    },
    {
      field: 'email',
      label: t('profile.email'),
      value: stringValue('email', user?.email ?? tCommon('states.notProvided')),
      action: 'edit' as const,
      maskValue: true
    },
    {
      field: 'phoneNumber',
      label: t('profile.phoneNumbers'),
      value: stringValue('phoneNumber', tCommon('states.notProvided')),
      action: 'add' as const,
      helper: t('profile.phoneHelp')
    },
    {
      field: 'identityVerification',
      label: t('profile.identityVerification'),
      value: stringValue('identityVerification', tCommon('states.notStarted')),
      action: 'start' as const
    },
    {
      field: 'residentialAddress',
      label: t('profile.residentialAddress'),
      value: stringValue('residentialAddress', tCommon('states.notProvided')),
      action: 'edit' as const
    },
    {
      field: 'mailingAddress',
      label: t('profile.mailingAddress'),
      value: stringValue('mailingAddress', tCommon('states.notProvided')),
      action: 'add' as const
    },
    {
      field: 'emergencyContact',
      label: t('profile.emergencyContact'),
      value: emergencyContact?.name ?? tCommon('states.notProvided'),
      action: 'add' as const,
      editHelper: t('profile.contactHelp'),
      variant: 'emergency-contact' as const,
      initialDetails: emergencyContact
    }
  ];

  const openMobileSetting = (item: MobileSettingsItem) => {
    if (item.action === 'hosting') {
      navigate(ROUTES.hostListings);
      return;
    }

    if (item.section) {
      setEditingField(null);
      setActiveSection(item.section);
      setIsMobileSectionOpen(true);
    }
  };

  const renderMobileSettingRow = (item: MobileSettingsItem) => {
    const Icon = item.icon;

    return (
      <button
        key={item.label}
        type="button"
        onClick={() => openMobileSetting(item)}
        className="flex min-h-[47.3px] w-full items-center gap-4 text-left text-[14.112px] text-slate-800"
      >
        <Icon className="h-[19.8px] w-[19.8px] shrink-0 stroke-[1.6]" aria-hidden="true" />
        <span className="flex-1">{item.label}</span>
        {item.badge ? (
          <span className="rounded-sm bg-pink-50 px-2 py-1 text-[9.408px] font-medium text-pink-600">
            {item.badge}
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <header className="hidden border-b border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
        <div className="mx-auto flex min-h-24 max-w-[1584px] items-center justify-between px-5 sm:px-8 lg:px-16">
          <BooksaLogo className="h-9 w-[123.2px]" />
          <button
            type="button"
            onClick={() => navigate(ROUTES.home)}
            className="rounded-md bg-[var(--color-surface-muted)] px-7 py-3 text-sm font-semibold transition hover:brightness-95"
          >
            {tCommon('actions.done')}
          </button>
        </div>
      </header>

      <section
        className={`bg-white px-5 pt-7 text-slate-900 lg:hidden ${
          isMobileSectionOpen ? 'pb-0' : 'min-h-screen pb-10'
        }`}
      >
        <div className="mx-auto max-w-[429px]">
          <button
            type="button"
            onClick={() => {
              if (isMobileSectionOpen) {
                setIsMobileSectionOpen(false);
                setEditingField(null);
                return;
              }

              navigate(-1);
            }}
            aria-label="Back"
            className="grid h-8 w-8 place-items-center rounded-md bg-slate-50 text-slate-700"
          >
            <ArrowLeft className="h-[18.7px] w-[18.7px] stroke-[1.7]" />
          </button>

          {!isMobileSectionOpen ? (
            <>
              <h1 className="mt-4 px-2 text-[24.696px] font-semibold tracking-[-0.035em]">Account settings</h1>
              <div className="mt-4 px-2">
                {mobileSettingsItems.map(renderMobileSettingRow)}
              </div>
              <div className="mt-3 border-t border-slate-100 px-2 pt-3">
                {renderMobileSettingRow(professionalHostingItem)}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <div
        className={`mx-auto max-w-[1584px] lg:grid lg:grid-cols-[minmax(320px,440px)_1fr] lg:[&>aside]:block ${
          isMobileSectionOpen ? 'block [&>aside]:hidden' : 'hidden'
        }`}
      >
        <AccountSettingsSidebar
          activeSection={activeSection}
          onSectionChange={(section) => {
            setEditingField(null);
            setActiveSection(section);
          }}
        />

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[var(--color-surface)] px-5 py-8 sm:px-10 lg:px-14 lg:py-10 xl:px-[9.35rem]"
        >
          {activeSection === 'login-security' ? (
            <LoginSecurityContent />
          ) : activeSection === 'privacy' ? (
            <PrivacyContent
              initialSettings={privacySettings}
              onSettingSaved={(key, value) =>
                setProfile((currentProfile) => ({
                  ...currentProfile,
                  privacySettings: {
                    ...(typeof currentProfile.privacySettings === 'object' &&
                    currentProfile.privacySettings &&
                    !Array.isArray(currentProfile.privacySettings)
                      ? currentProfile.privacySettings
                      : {}),
                    [key]: value
                  }
                }))
              }
            />
          ) : activeSection === 'notifications' ? (
            <NotificationsContent />
          ) : activeSection === 'taxes' ? (
            <TaxesContent />
          ) : activeSection === 'payments' ? (
            <PaymentsContent
              initialServiceFee={initialServiceFee}
              onServiceFeeSaved={(serviceFee) =>
                setProfile((currentProfile) => ({
                  ...currentProfile,
                  paymentSettings: {
                    ...(typeof currentProfile.paymentSettings === 'object' &&
                    currentProfile.paymentSettings &&
                    !Array.isArray(currentProfile.paymentSettings)
                      ? currentProfile.paymentSettings
                      : {}),
                    serviceFee
                  }
                }))
              }
            />
          ) : activeSection === 'languages-currency' ? (
            <LanguagesCurrencyContent
              initialSettings={regionalSettings}
              onSettingSaved={(key, value) =>
                setProfile((currentProfile) => ({
                  ...currentProfile,
                  regionalSettings: {
                    ...(typeof currentProfile.regionalSettings === 'object' &&
                    currentProfile.regionalSettings &&
                    !Array.isArray(currentProfile.regionalSettings)
                      ? currentProfile.regionalSettings
                      : {}),
                    [key]: value
                  }
                }))
              }
            />
          ) : activeSection === 'travel-for-work' ? (
            <TravelForWorkContent
              initialWorkEmail={initialWorkEmail}
              onWorkEmailSaved={(email) =>
                setProfile((currentProfile) => ({
                  ...currentProfile,
                  workSettings: {
                    ...(typeof currentProfile.workSettings === 'object' &&
                    currentProfile.workSettings &&
                    !Array.isArray(currentProfile.workSettings)
                      ? currentProfile.workSettings
                      : {}),
                    email
                  }
                }))
              }
            />
          ) : (
          <div className="mx-auto max-w-[836px]">
            <h2 className="text-[27.65952px] font-semibold tracking-[-0.035em] sm:text-[29.6352px]">{t('personalInformation')}</h2>

            {profileError ? (
              <div role="alert" className="mt-5 rounded-sm border border-[var(--color-danger)]/40 bg-red-50 px-4 py-3 text-sm text-[var(--color-danger)] dark:bg-red-950/20">
                {t('profile.loadError')} {t('profile.localFallback')}
              </div>
            ) : null}

            <div className={`mt-4 transition-opacity ${isLoadingProfile ? 'pointer-events-none opacity-45' : 'opacity-100'}`} aria-busy={isLoadingProfile}>
              {isLoadingProfile ? (
                <p className="pb-4 text-sm text-[var(--color-text-secondary)]">{t('profile.loading')}</p>
              ) : null}
              {personalInformation.map((item) => (
                <PersonalInformationRow
                  key={item.field}
                  {...item}
                  isEditing={editingField === item.field}
                  isDimmed={editingField !== null && editingField !== item.field}
                  onEdit={() => setEditingField(item.field)}
                  onFinishEditing={() => setEditingField(null)}
                  onSave={async (nextValue, details) => {
                    const updates = item.field === 'name' && details
                      ? {
                          name: nextValue,
                          firstName: details.firstName,
                          lastName: details.lastName
                        }
                      : item.field === 'emergencyContact' && details
                        ? { emergencyContact: details }
                        : { [item.field]: nextValue };

                    await updateLoggedInUserProfile(updates);
                    setProfile((currentProfile) => ({ ...currentProfile, ...updates }));

                    if (item.field === 'name') updateUser({ name: nextValue });
                    if (item.field === 'email') updateUser({ email: nextValue });
                  }}
                />
              ))}
            </div>

            <div
              className={`transition-opacity duration-200 ${
                editingField ? 'pointer-events-none opacity-25' : 'opacity-100'
              }`}
              aria-hidden={editingField ? true : undefined}
            >
              <AccountHelpCard />
            </div>
          </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
