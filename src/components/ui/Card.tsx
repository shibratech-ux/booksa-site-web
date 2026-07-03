import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, hover = true, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      whileHover={hover ? { y: -3 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn('dashboard-card p-5', hover && 'card-hover', className)}
      {...props}
    />
  );
});
