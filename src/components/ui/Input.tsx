import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useId } from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, className, id, leftIcon, rightIcon, ...props },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const descriptionId = `${inputId}-description`;

  return (
    <label htmlFor={inputId} className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-[var(--color-text-primary)]">{label}</span> : null}
      <div className="relative">
        {leftIcon ? <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">{leftIcon}</div> : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'field-control h-14 w-full py-3.5 text-base outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary-500)_18%,transparent)]',
            leftIcon ? 'pl-11' : 'px-4',
            rightIcon ? 'pr-11' : null,
            leftIcon && !rightIcon ? 'pr-4' : null,
            error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-rose-500/20' : null,
            className
          )}
          {...props}
          aria-invalid={Boolean(error) || props['aria-invalid']}
          aria-describedby={[props['aria-describedby'], error || helperText ? descriptionId : undefined].filter(Boolean).join(' ') || undefined}
        />
        {rightIcon ? <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">{rightIcon}</div> : null}
      </div>
      {error ? <p id={descriptionId} className="mt-2 text-xs text-[var(--color-danger)]" role="alert">{error}</p> : null}
      {!error && helperText ? <p id={descriptionId} className="mt-2 text-xs text-[var(--color-text-secondary)]">{helperText}</p> : null}
    </label>
  );
});
