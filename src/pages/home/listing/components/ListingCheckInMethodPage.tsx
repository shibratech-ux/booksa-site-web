import { useEffect, useRef, useState } from 'react';
import { Calculator, ConciergeBell, HandHelping, Smartphone, Vault, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '@/components/ui/BackButton';
import { CheckInMethodDetailsSheet } from './CheckInMethodDetailsSheet';

// TODO(team): agree on a shared `checkInMethod` field (and these IDs) with the Flutter app before saving.
export const CHECK_IN_METHODS = [
  { id: 'smart-lock', icon: Smartphone },
  { id: 'keypad', icon: Calculator },
  { id: 'lockbox', icon: Vault },
  { id: 'building-staff', icon: ConciergeBell },
  { id: 'in-person-greeting', icon: HandHelping }
] as const satisfies readonly { id: string; icon: LucideIcon }[];

export type CheckInMethodId = (typeof CHECK_IN_METHODS)[number]['id'];

// Picking a method opens its details sheet; Save there confirms both the method and its instructions.
export function ListingCheckInMethodPage({ selected, details, onSave, onBack }: {
  selected: CheckInMethodId | null;
  details: string;
  onSave: (method: CheckInMethodId, details: string) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation('dashboard');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [detailsMethod, setDetailsMethod] = useState<CheckInMethodId | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section
      aria-labelledby="listing-check-in-method-heading"
      className="flex min-h-[calc(100dvh-96px)] flex-col bg-[var(--color-surface)] text-[var(--color-text-primary)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[var(--color-text-primary)]"
    >
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-10 pt-5 sm:px-10 sm:pt-8">
        <header>
          <BackButton label={t('checkInMethod.back')} onClick={onBack} className="-ml-3" />
        </header>

        <h1
          id="listing-check-in-method-heading"
          ref={headingRef}
          tabIndex={-1}
          className="mt-6 text-2xl font-semibold tracking-tight outline-none"
        >
          {t('checkInMethod.heading')}
        </h1>

        <ul className="mt-10 grid gap-4">
          {CHECK_IN_METHODS.map(({ id, icon: Icon }) => {
            const isSelected = selected === id;
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-haspopup="dialog"
                  onClick={() => setDetailsMethod(id)}
                  className={`block w-full rounded-card border bg-[var(--color-surface)] p-6 text-left transition hover:border-[var(--color-text-primary)] active:scale-[0.99] ${
                    isSelected
                      ? 'border-[var(--color-text-primary)] ring-1 ring-[var(--color-text-primary)]'
                      : 'border-[var(--color-border)]'
                  }`}
                >
                  <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
                  <span className="mt-5 block text-base font-semibold leading-6">{t(`checkInMethod.methods.${id}.title`)}</span>
                  <span className="mt-2 block text-sm leading-6 text-[var(--color-text-secondary)]">{t(`checkInMethod.methods.${id}.description`)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <CheckInMethodDetailsSheet
        open={detailsMethod !== null}
        method={detailsMethod}
        // Existing instructions only belong to the method they were written for.
        details={detailsMethod === selected ? details : ''}
        onClose={() => setDetailsMethod(null)}
        onSave={(text) => {
          if (!detailsMethod) return;
          onSave(detailsMethod, text);
          setDetailsMethod(null);
        }}
      />
    </section>
  );
}
