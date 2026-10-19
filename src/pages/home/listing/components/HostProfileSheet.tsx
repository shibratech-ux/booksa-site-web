import { useState } from 'react';
import {
  BriefcaseBusiness,
  Cake,
  Camera,
  Globe,
  GraduationCap,
  Heart,
  Hourglass,
  Languages,
  Lightbulb,
  MapPin,
  Music,
  PawPrint,
  PenLine,
  type LucideIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import { EditorBottomSheet } from './EditorBottomSheet';

// TODO(team): these profile prompts have no agreed `users/{uid}` fields yet; agree on names with the
// Flutter app before making rows editable.
const PROFILE_PROMPTS = [
  { id: 'decadeBorn', icon: Cake },
  { id: 'work', icon: BriefcaseBusiness },
  { id: 'dreamDestination', icon: Globe },
  { id: 'pets', icon: PawPrint },
  { id: 'school', icon: GraduationCap },
  { id: 'funFact', icon: Lightbulb },
  { id: 'favoriteSong', icon: Music },
  { id: 'tooMuchTime', icon: Hourglass },
  { id: 'biographyTitle', icon: PenLine },
  { id: 'languages', icon: Languages },
  { id: 'location', icon: MapPin },
  { id: 'obsessedWith', icon: Heart }
] as const satisfies readonly { id: string; icon: LucideIcon }[];

export function HostProfileSheet({ open, name, avatarUrl, onClose }: {
  open: boolean;
  name: string;
  avatarUrl?: string;
  onClose: () => void;
}) {
  const { t, i18n } = useTranslation('dashboard');
  const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
  const showAvatar = Boolean(avatarUrl) && failedAvatar !== avatarUrl;

  return (
    <EditorBottomSheet
      open={open}
      heading={t('hostProfileSheet.heading')}
      closeLabel={t('hostProfileSheet.close')}
      isSaving={false}
      canSave={false}
      onClose={onClose}
      onSave={() => undefined}
      showFooter={false}
      bodyClassName="border-t border-[var(--color-border-subtle)] pb-10 pt-8"
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <span className="inline-flex h-48 w-48 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-100)] text-[5rem] font-bold leading-none text-[var(--color-primary-700)]">
            {showAvatar ? (
              <ShimmerImage src={avatarUrl!} alt="" className="h-full w-full object-cover" onError={() => setFailedAvatar(avatarUrl ?? null)} />
            ) : (
              <span aria-hidden="true">{name.charAt(0).toLocaleUpperCase(i18n.language)}</span>
            )}
          </span>
          {/* TODO(team): photo upload needs an agreed Storage path for profile photos (users/{uid}/…). */}
          <button
            type="button"
            disabled
            aria-describedby="host-profile-photo-note"
            className="absolute -bottom-4 left-1/2 inline-flex min-h-11 -translate-x-1/2 cursor-not-allowed items-center gap-2 rounded-full bg-[var(--color-surface)] px-5 text-[0.830466rem] font-semibold shadow-[var(--shadow-md)]"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {t(showAvatar ? 'hostProfileSheet.editPhoto' : 'hostProfileSheet.addPhoto')}
          </button>
        </div>
        <p id="host-profile-photo-note" className="sr-only">{t('hostProfileSheet.comingSoon')}</p>
      </div>

      <h3 className="mt-12 text-[1.453315rem] font-semibold tracking-tight">{t('hostProfileSheet.myProfile')}</h3>
      {/* TODO(team): add a "Learn more" link once a help article exists. */}
      <p className="mt-2 text-[0.93427425rem] leading-relaxed text-[var(--color-text-secondary)]">
        {t('hostProfileSheet.intro')}
      </p>

      <ul className="mt-4">
        {PROFILE_PROMPTS.map(({ id, icon: Icon }) => (
          <li key={id} className="flex min-h-16 items-center gap-4 border-b border-[var(--color-border-subtle)] py-4 last:border-b-0">
            <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-[0.93427425rem] text-[var(--color-text-secondary)]">{t(`hostProfileSheet.prompts.${id}`)}</span>
          </li>
        ))}
      </ul>
      <p role="note" className="mt-4 text-center text-xs text-[var(--color-text-secondary)]">{t('hostProfileSheet.comingSoon')}</p>
    </EditorBottomSheet>
  );
}
