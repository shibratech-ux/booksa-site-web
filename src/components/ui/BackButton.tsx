import type { ComponentProps } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { IconButton } from './IconButton';

export type BackButtonProps = Omit<ComponentProps<typeof IconButton>, 'icon' | 'size' | 'children' | 'type'>;

export function BackButton({ variant = 'plain', className, ...props }: BackButtonProps) {
  return (
    <IconButton
      {...props}
      variant={variant}
      className={cn('focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)]', className)}
      icon={<ArrowLeft className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />}
    />
  );
}
