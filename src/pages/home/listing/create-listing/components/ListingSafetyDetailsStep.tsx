import { motion } from 'framer-motion';
import { Check, Info } from 'lucide-react';

export type HostingType = 'individual' | 'business';
export type SafetyDetailId = 'exterior-camera' | 'noise-monitor' | 'weapons';

const safetyOptions: Array<{ id: SafetyDetailId; label: string }> = [
  { id: 'exterior-camera', label: 'Exterior security camera present' },
  { id: 'noise-monitor', label: 'Noise decibel monitor present' },
  { id: 'weapons', label: 'Weapon(s) on the property' }
];

function InfoIcon() {
  return <Info className="h-4 w-4" strokeWidth={2} aria-hidden="true" />;
}

export function ListingSafetyDetailsStep({
  hostingType,
  selectedSafetyDetailIds,
  onHostingTypeChange,
  onSafetyDetailsChange
}: {
  hostingType: HostingType;
  selectedSafetyDetailIds: SafetyDetailId[];
  onHostingTypeChange: (hostingType: HostingType) => void;
  onSafetyDetailsChange: (detailIds: SafetyDetailId[]) => void;
}) {
  const toggleSafetyDetail = (detailId: SafetyDetailId) => {
    onSafetyDetailsChange(
      selectedSafetyDetailIds.includes(detailId)
        ? selectedSafetyDetailIds.filter((currentId) => currentId !== detailId)
        : [...selectedSafetyDetailIds, detailId]
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mx-auto flex min-h-0 w-full max-w-[710px] flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-10 sm:py-8"
    >
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-4xl">Share safety details</h1>

      <fieldset className="mt-8">
        <legend className="flex items-center gap-2 text-lg font-semibold">
          How are you hosting on Booksa?
          <button type="button" aria-label="Learn about hosting types" className="rounded-full">
            <InfoIcon />
          </button>
        </legend>
        <div className="mt-5 grid gap-4">
          {([
            ['individual', "I'm hosting as a private individual"],
            ['business', "I'm hosting as a business"]
          ] as const).map(([value, label]) => (
            <label key={value} className="flex w-fit cursor-pointer items-center gap-4 text-base">
              <input
                type="radio"
                name="hosting-type"
                value={value}
                checked={hostingType === value}
                onChange={() => onHostingTypeChange(value)}
                className="peer sr-only"
              />
              <span className="inline-flex h-[23px] w-[23px] items-center justify-center rounded-full border border-[var(--color-text-secondary)] peer-checked:border-2 peer-checked:border-[var(--color-text-primary)]">
                <span className={`h-[13px] w-[13px] rounded-full ${hostingType === value ? 'bg-[var(--color-text-primary)]' : ''}`} />
              </span>
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="flex items-center gap-2 text-lg font-semibold">
          Does your place have any of these?
          <button type="button" aria-label="Learn about required safety disclosures" className="rounded-full">
            <InfoIcon />
          </button>
        </legend>
        <div className="mt-4 grid gap-1">
          {safetyOptions.map(({ id, label }) => {
            const selected = selectedSafetyDetailIds.includes(id);

            return (
              <label
                key={id}
                className="flex min-h-12 cursor-pointer items-center justify-between gap-5 text-base"
              >
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleSafetyDetail(id)}
                  className="peer sr-only"
                />
                <span
                  className={`inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-md border transition ${
                    selected
                      ? 'border-[var(--color-text-primary)] bg-[var(--color-text-primary)] text-[var(--color-surface)]'
                      : 'border-[var(--color-text-secondary)] bg-[var(--color-surface)]'
                  }`}
                  aria-hidden="true"
                >
                  {selected ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 border-t border-[var(--color-border)] pt-8">
        <h2 className="text-lg font-semibold">Important things to know</h2>
        <p className="mt-2 max-w-[650px] text-base leading-snug">
          Security cameras that monitor indoor spaces are not allowed even if they’re turned off.
          All exterior security cameras must be disclosed.
        </p>
      </div>
    </motion.section>
  );
}
