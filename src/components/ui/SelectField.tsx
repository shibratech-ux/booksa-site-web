import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDownRegular } from '@fluentui/react-icons';
import { cn } from '@/utils/helpers';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  containerClassName?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, helperText, error, className, containerClassName, id, name, children, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id ?? name ?? generatedId;
  const descriptionId = `${selectId}-description`;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={selectId} className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          className={cn(
            'h-12 w-full appearance-none rounded-field border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-3 pr-11 text-base sm:text-sm text-[var(--color-text-primary)] outline-none transition',
            'focus:border-[var(--color-text-secondary)] focus:ring-1 focus:ring-[var(--color-border)]',
            'disabled:cursor-not-allowed disabled:opacity-55',
            error
              ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/20'
              : null,
            className
          )}
          {...props}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={[props['aria-describedby'], error || helperText ? descriptionId : undefined].filter(Boolean).join(' ') || undefined}
        >
          {children}
        </select>
        <ChevronDownRegular
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-primary)]"
          aria-hidden="true"
        />
      </div>

      {error ? <p id={descriptionId} className="mt-2 text-xs text-[var(--color-danger)]" role="alert">{error}</p> : null}
      {!error && helperText ? (
        <p id={descriptionId} className="mt-2 text-xs text-[var(--color-text-secondary)]">{helperText}</p>
      ) : null}
    </div>
  );
});
