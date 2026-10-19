import { useEffect, useRef } from 'react';
import {
  Accessibility,
  ArrowUpFromLine,
  Armchair,
  Bath,
  BedDouble,
  Car,
  Check,
  DoorOpen,
  GripHorizontal,
  Lightbulb,
  MoveHorizontal,
  Plus,
  ShowerHead,
  Waves,
  type LucideIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/ui/BackButton';

// TODO(team): accessibility features have no shared Firestore field yet; agree on IDs with the Flutter app
// (and add them to src/domain with validation) before persisting.
export const ACCESSIBILITY_FEATURES = [
  { id: 'disabled-parking', icon: Car },
  { id: 'lit-path', icon: Lightbulb },
  { id: 'step-free-entrance', icon: Accessibility },
  { id: 'wide-entrance', icon: DoorOpen },
  { id: 'pool-hoist', icon: Waves },
  { id: 'ceiling-hoist', icon: ArrowUpFromLine },
  { id: 'step-free-bedroom', icon: BedDouble },
  { id: 'wide-bedroom-entrance', icon: MoveHorizontal },
  { id: 'step-free-bathroom', icon: Bath },
  { id: 'step-free-shower', icon: ShowerHead },
  { id: 'shower-grab-bar', icon: GripHorizontal },
  { id: 'toilet-grab-bar', icon: GripHorizontal },
  { id: 'shower-chair', icon: Armchair }
] as const satisfies readonly { id: string; icon: LucideIcon }[];

export type AccessibilityFeatureId = (typeof ACCESSIBILITY_FEATURES)[number]['id'];

export function ListingAccessibilityFeaturesPage({ selectedIds, onToggle, onBack }: {
  selectedIds: readonly AccessibilityFeatureId[];
  onToggle: (id: AccessibilityFeatureId) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, []);

  return (
    <section
      aria-labelledby="listing-accessibility-heading"
      className="flex min-h-[calc(100dvh-96px)] flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[var(--color-text-primary)]"
    >
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-10 pt-5 sm:px-10 sm:pt-8">
        <header>
          <BackButton
            onClick={onBack}
            label={t('accessibilityFeatures.back')}
            className="-ml-3"
          />
        </header>

        <h1
          id="listing-accessibility-heading"
          ref={headingRef}
          tabIndex={-1}
          className="mt-6 text-2xl font-semibold tracking-tight outline-none"
        >
          {t('accessibilityFeatures.heading')}
        </h1>

        <ul className="mt-8">
          {ACCESSIBILITY_FEATURES.map(({ id, icon: Icon }) => {
            const label = t(`accessibilityFeatures.labels.${id}`);
            const isAdded = selectedIds.includes(id);
            return (
              <li key={id} className="flex min-h-20 items-center gap-4 py-4">
                <Icon className="h-6 w-6 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                <span className="min-w-0 flex-1 text-base leading-6">{label}</span>
                <button
                  type="button"
                  aria-pressed={isAdded}
                  aria-label={t(isAdded ? 'accessibilityFeatures.remove' : 'accessibilityFeatures.add', { feature: label })}
                  onClick={() => onToggle(id)}
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                    isAdded
                      ? 'bg-[var(--color-text-primary)] text-[var(--color-surface)] hover:opacity-90'
                      : 'hover:bg-[var(--color-surface-muted)]'
                  }`}
                >
                  {isAdded ? <Check className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
