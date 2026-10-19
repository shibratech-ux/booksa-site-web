import { useEffect, useRef } from 'react';
import lottie from 'lottie-web/build/player/lottie_light';
import dotsLoaderAnimation from '@/assets/lotties/dots-loader.json';
import { cn } from '@/utils/helpers';

interface DotsLoaderProps {
  /** Sets the size; keep the 3:1 ratio of the 240×80 animation (e.g. `w-12` → 48×16). */
  className?: string;
  /** Announced to screen readers. Omit when nearby text already describes the loading state. */
  label?: string;
}

/**
 * App-wide loading indicator: the Lottie animation in src/assets/lotties/dots-loader.json.
 * The dots follow the surrounding text color (`currentColor`) so they work in dark mode and on filled buttons.
 */
export function DotsLoader({ className, label }: DotsLoaderProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: !prefersReducedMotion,
      autoplay: !prefersReducedMotion,
      animationData: dotsLoaderAnimation,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
    });

    if (prefersReducedMotion) animation.goToAndStop(0, true);

    return () => animation.destroy();
  }, []);

  return (
    <span
      ref={containerRef}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-block aspect-[3/1] w-12 shrink-0 [&_path]:fill-current [&_svg]:block',
        className
      )}
    />
  );
}
