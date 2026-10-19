import { Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ShimmerImage } from '@/components/ui/ShimmerImage';
import coastalIcon from '@/assets/images/home_mountain_icons/home-mountain-04-flat-color.svg';
import blueIcon from '@/assets/images/home_mountain_icons/home-mountain-03-duotone-blue.svg';
import sunsetIcon from '@/assets/images/home_mountain_icons/home-mountain-07-sunset.svg';
import pastelIcon from '@/assets/images/home_mountain_icons/home-mountain-11-soft-pastel.svg';
import nightIcon from '@/assets/images/home_mountain_icons/home-mountain-08-night.svg';
import pinkIcon from '@/assets/images/home_mountain_icons/home-mountain-13-offset-riso.svg';
import warmIcon from '@/assets/images/home_mountain_icons/home-mountain-14-accent-house.svg';

const destinations = [
  { name: 'Pointe-Noire', description: 'seaside', icon: coastalIcon },
  { name: 'Croissy-Beaubourg, France', description: 'abroad', icon: blueIcon },
  { name: 'Brazzaville', description: 'nearYou', icon: sunsetIcon },
  { name: 'Yaoundé, Cameroon', description: 'abroad', icon: blueIcon },
  { name: 'Lubumbashi, Democratic Republic of the Congo', description: 'hiddenGem', icon: pastelIcon },
  { name: 'Sandton, South Africa', description: 'sandtonSights', icon: pinkIcon },
  { name: 'Choisy-le-Roi, France', description: 'abroad', icon: sunsetIcon },
  { name: 'Évry-Courcouronnes, France', description: 'offBeatenTrack', icon: warmIcon },
  { name: 'Kinshasa', description: 'cityBreak', icon: pastelIcon },
  { name: 'Goma', description: 'mountains', icon: nightIcon },
  { name: 'Kigali', description: 'cityBreak', icon: coastalIcon }
] as const;

export function DestinationSuggestions({ query, onSelect, compact = false }: {
  query: string;
  onSelect: (destination: string | null) => void;
  compact?: boolean;
}) {
  const { t } = useTranslation('navigation');
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  const matches = destinations.filter(({ name }) => normalize(name).includes(normalize(query)));
  const rowClass = 'flex min-h-16 w-full items-center gap-4 rounded-field py-2 text-left hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-[var(--color-text-primary)]';

  return (
    <div>
      <p className="mb-1 text-xs">{t('searchPanel.suggested')}</p>
      <div className={compact ? 'max-h-[min(38dvh,320px)] overflow-y-auto overscroll-contain' : ''}>
        {!query.trim() && (
          <button type="button" onClick={() => onSelect(null)} className={rowClass}>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-[var(--color-primary-50)] text-[var(--color-primary-500)]"><Navigation className="h-6 w-6" aria-hidden="true" /></span>
            <span><span className="block text-sm font-semibold">{t('searchPanel.nearby')}</span><span className="block text-sm text-[var(--color-text-secondary)]">{t('searchPanel.aroundYou')}</span></span>
          </button>
        )}
        {matches.map(({ name, description, icon }) => (
          <button type="button" key={name} onClick={() => onSelect(name)} className={rowClass}>
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-[var(--color-surface-muted)]"><ShimmerImage src={icon} alt="" className="h-11 w-11 object-contain" /></span>
            <span><span className="block text-sm font-semibold">{name}</span><span className="block text-sm text-[var(--color-text-secondary)]">{t(`searchPanel.${description}`)}</span></span>
          </button>
        ))}
        {matches.length === 0 && <p role="status" className="py-4 text-sm text-[var(--color-text-secondary)]">{t('searchPanel.noSuggestions')}</p>}
      </div>
    </div>
  );
}
