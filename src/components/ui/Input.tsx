import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
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
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="block">
      {label ? <span className="mb-2 block text-sm font-medium text-gray-200">{label}</span> : null}
      <div className="relative">
        {leftIcon ? <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">{leftIcon}</div> : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-2xl border border-slate-700 bg-slate-900/80 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20',
            leftIcon ? 'pl-11' : 'px-4',
            rightIcon ? 'pr-11' : null,
            leftIcon ? 'pr-4' : null,
            error ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/20' : null,
            className
          )}
          {...props}
        />
        {rightIcon ? <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">{rightIcon}</div> : null}
      </div>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
      {!error && helperText ? <p className="mt-2 text-xs text-gray-500">{helperText}</p> : null}
    </label>
  );
});
