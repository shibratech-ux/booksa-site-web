import { useId, type RefObject } from 'react';
import { Check } from 'lucide-react';

// Single-choice list for picker sheets: native radios (arrow keys work) styled as full-width rows.
export function EditorOptionList<T extends string | number>({ legend, options, value, onChange, selectedRef, disabled }: {
  legend: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  selectedRef?: RefObject<HTMLInputElement>;
  disabled?: boolean;
}) {
  const groupName = useId();

  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <label
            key={option.value}
            className={`flex min-h-12 cursor-pointer items-center justify-between gap-3 px-6 text-[0.830466rem] font-medium transition-colors focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[var(--color-text-primary)] sm:px-8 ${
              isSelected ? 'bg-[var(--color-surface-muted)]' : 'hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            <input
              ref={isSelected ? selectedRef : undefined}
              type="radio"
              name={groupName}
              value={String(option.value)}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
            {isSelected ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
          </label>
        );
      })}
    </fieldset>
  );
}
